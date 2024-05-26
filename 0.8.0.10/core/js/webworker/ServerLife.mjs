import Algos from "../classes/Algos.mjs";
import PlayerStat from "../classes/PlayerStat.mjs";
import mixin from "../classes/Utils/mixin.mjs";
import RelativePositionsServer from "../classes/Mixins/RelativePositionsServer.mjs";

const BODY_PARTS = ["head", "body", "left_arm", "right_arm", "left_leg", "right_leg"];

class StatusEffect {
	constructor(options) {
		this.source = options.source;
		this.status = options.status;
		this.effect = options.effect;
		this.options = {...options.options, source: options.source};
	}

	toJSON() {
		//Trim off effect
		return {
			source: this.source,
			status: this.status,
			options: this.options
		};
	}
}

class ServerLife extends mixin(RelativePositionsServer) {
	constructor(sprite, helper) {
		super();
		if (isNaN(sprite.x) || isNaN(sprite.y)) {
			throw "[ABE] Tried to create life without position";
		}
		this.helper = helper;
		this.sees = {};

		this.id = sprite.id || this.helper.randID();
		this.lastX = sprite.x;
		this.lastY = sprite.y;
		this.x = sprite.x;
		this.y = sprite.y;
		this.lastX = 0;
		this.lastY = 0;
		this.width = 64;
		this.height = 64;
		this.hasPath = false;
		this.tileSize = 64;
		this.path = [];
		this.data = sprite.data || {};
		this.statuses = {};
		this.body = {};
		this.updates = [];
		this.className = "ServerLife";
		this.codename = "life"; //TODO: reserve in cp?
		this.lastLOSCheck = 0;
		this.losRay = [];
		this.touchers = {};
		this.touchersClose = {};
		this.losCircle = [];
		this.data.jobs = []; //Defaults come from client side

		this.nextStateCheck = this.helper.rng(1, 50);
		this.stateCounter = 0;
		this.attackStartX = false;
		this.attackStartY = false;
		this.lastSeek = Date.now() - 5000;
		this._seekObj = false;
		this.lastSaw = {};
		this.lastStateCheck = Date.now() - 1000;

		this.inventoryIndex = 0;
		this.itemList = {};
		this.contentsList = [];
		this.inventoryBuffer = {};
		this.statusList = {};
		this.threats = {};
		if (!this.data.home) {
			this.data.home = {x: this.x, y: this.y, width: 32, height: 32}; //Create a fake home object
		}

		this.inventory = sprite.inventory || {};

		this.rebindData();
	}

	toJSON() {
		return {
			id: this.id,
			x: this.x,
			y: this.y,
			baseClass: "BaseLife",
			class: "LifeObject",
			inventory: this.inventory,
			data: this.data
		};
	}

	rebindData() {
		this.addStat("savage");
		this.addStat("melee");
		this.addStat("athletics");
		this.addStat("ranged");
		this.addStat("toughness");
		this.addStat("strength");
		this.addStat("crafting");
		this.addStat("intelligence");
	}

	set seekObj(val) {
		//console.error("[ABE] Set to "+val); //TODO: readd this sometime with 1 AI in the world, i think maybe something is calling it alot
		this._seekObj = val;
	}

	get seekObj() {
		return this._seekObj;
	}

	canSee(targetId) {
		this.helper.physicsUpdate("getLOS", {srcId: this.id, destId: targetId});
	}

	initPhysics() {}

	removeTarget() {
		this.data.targetId = false;
		this.data.doAttack = false;
		this.sync();
	}

	shouldAddStatus(status) {
		if (!status.chance) {
			return true; //Always add status which has no chance
		}

		//Will softly increase chance because we know what RnG really feels like
		return game.rng(1, 100) <= status.chance * 1.2;
	}

	setTarget(target) {
		if (this.data.targetId && this.targetSetTime && this.targetSetTime > Date.now() - 2000) return 0;
		this.removeTarget();
		if (typeof target === "string") target = this.helper.world.index.find(target);
		if (!target.attackers) {
			target.attackers = 0;
		}
		target.attackers++;
		this.data.targetId = target.id;
		this.helper.lastTargetId = target.id;
		this.targetSetTime = Date.now();
		this.currentTarget = target;
		if (!target.data.targetId) target.data.targetId = this.id; //If you attack me, i'll attack you.
		return 1;
	}

	hasLOS(target) {
		this.log("Do LOS check" + this.lastLOSCheck + " : " + Date.now());
		if (this.lastLOSCheck < Date.now() - 1000) {
			this.log("Start LOS search");
			this.losSearching = true;
			//this.losRay = [];
			this.lastLOSCheck = Date.now();
			this.losProjectile = {x: this.x, y: this.y, id: this.id + "projectile"};
			this.helper.physicsUpdate("hitscan", {
				id: this.id,
				projectile: this.losProjectile,
				x: this.x,
				y: this.y,
				endX: target.x,
				endY: target.y
			});
		}

		if (this.lastSaw[target.id] && this.lastSaw[target.id] < Date.now() - 5000) {
			delete this.lastSaw[target.id];
		}

		if (this.lastSaw[target.id]) {
			this.log("I already saw this before");
			return true;
		}

		if (this.losRay.includes(target.id)) {
			if (!this.lastSaw[target.id]) {
				this.lastSaw[target.id] = Date.now();
			}
			this.log("I can see it");
			return true;
		} else {
			this.log("I cant see it");
			return false;
		}

		if (this.losRay.includes("wall") || this.losRay.includes(this.data.faction)) {
			return false;
		} else {
			if (!this.losSearching) {
				if (this.losRay.includes(target.id)) {
					return true;
				} else {
					return false;
				}
			}
		}
	}

	initWorld() {
		try {
			this.states = ["aistate_idle"];
			this.state = "aistate_idle";
			this.setBrain();
			this.state = "aistate_idle";
		} catch (e) {
			console.error(e);
		}
	}

	setBrain() {
		if (this.data.brain == undefined) {
			return false;
		}
		if (!_AISTATECOLLECTIONS["ais_" + this.data.brain]) {
			this.states = [];
			return false;
		}
		//We will merge the brain on top of the default brain
		//There is no overwrite, it just merges both brains and removes dupes
		const defaultBrain = _AISTATECOLLECTIONS["ais_default"].states.split(",");
		const equiptBrain = _AISTATECOLLECTIONS["ais_" + this.data.brain].states.split(",");
		//Fastest way to dedupe this (lil memory usage)
		const filter = (state) => {
			return defaultBrain.indexOf(state) < 0;
		};
		this.states = defaultBrain.concat(equiptBrain.filter(filter));
	}

	updated() {
		//Some update has come from client
		this.setBrain();
	}

	getNextState() {
		this.lastStateCheck = Date.now();

		if (typeof this.x !== "number") {
			throw "[ABE] Would fail coz no position";
		}
		if (this.states.length <= 1) {
			//Dummy NPC so stupid
			return false;
		}
		var lastState = this.state;
		var highestWeight = -1;
		var highestWeightState = "aistate_idle"; //Idle as default state
		for (var i = 0; i < this.states.length; i++) {
			let state = this.states[i];
			let weight = 0;

			try {
				weight = _AISTATES[state].weight.call(this, this);
				if (!weight) weight = -1
			} catch (e) {
				console.error(e);
			}

			if (weight > highestWeight) {
				highestWeight = weight;
				highestWeightState = state;
			}
		}

		this.state = highestWeightState;
		this.data.state = this.state;
		this.sync();
		if (highestWeightState !== lastState) {
			if (typeof _AISTATES[lastState].end == "function") {
				try {
					_AISTATES[lastState].end.call(this, this);
				} catch (e) {
					console.error(e);
				}
			}

			if (!_AISTATES[this.state]) {
				throw "[ABE-ERROR] State missing " + this.state;
			}

			if (typeof _AISTATES[this.state].start == "function") {
				try {
					//False so change back to idle to let it rerun sometime
					if (_AISTATES[this.state].start.call(this, this) === false) {
						this.state = "aistate_idle";
					}
				} catch (e) {
					console.error("[ABE-ERROR] Failed to start state", this.state);
					console.error(e);
				}
			}
		}
	}

	syncXY(data) {
		let x = data.x;
		let y = data.y;
		this.x = x;
		this.y = y;
		if (this.helper && this.helper.physics.Body && this.body) {
			this.helper.physics.Body.setPosition(this.body, {
				x: this.x,
				y: this.y
			});
		}
	}

	physicsTick() {
		this.tickRelativePositions();

		if(this.helper.physics.isOnRail(this)) {
			this.helper.physics.stickToRail(this);
		}

		const pos = this.body.position;
		const vel = this.body.velocity;

		let velX = vel.x < 0 ? -vel.x : vel.x + 64;
		let velY = vel.y < 0 ? -vel.y : vel.y + 64;

		//Stops phasing through walls
		if (this.helper.physics.isBlocked(pos.x + velX, pos.y + velY)) {
			this.helper.physics.Body.setVelocity(this.body, {x: 0, y: 0});
		}

		if (!this.data.carriedById) {
			return;
		}

		let carriedBy = this.helper.physics.index.find(this.data.carriedById);

		if (!carriedBy) {
			this.data.carriedBy = false;
			return;
		}

		this.path = [];
		this.data.path = [];

		let dist = this.helper.dist(
			{x: this.body.position.x + (64 * 3) / 2, y: this.body.position.y + (64 * 3) / 2},
			carriedBy.body.position
		);
		let bounceSpeed = 0.025;
		if (dist < 120) {
			let bounceSpeed = 0.01;
		}

		if (dist < 64 * 5) {
			return; //Only move when far
		}

		this.helper.physics.Body.setPosition(this.body, {
			x: this.lerp(this.body.position.x, carriedBy.body.position.x, bounceSpeed),
			y: this.lerp(this.body.position.y, carriedBy.body.position.y, bounceSpeed)
		});

		return true;
		if (this.path.length > 0) {
			var speedMulti = 5;
			var path = this.path[0];
			var gotoX = path.x * this.tileSize;
			var gotoY = path.y * this.tileSize;
			var x = 0;
			var y = 0;
			if (Math.abs(this.x - gotoX) > 32) {
				if (gotoX > this.x) {
					x = 0.5;
				}
				if (gotoX < this.x) {
					x = -0.5;
				}
			}
			if (Math.abs(this.y - gotoY) > 32) {
				if (gotoY < this.y) {
					y = -0.5;
				}
				if (gotoY > this.y) {
					y = 0.5;
				}
			}
			if (Math.abs(this.x - gotoX) < 32 && Math.abs(this.y - gotoY) < 32) {
				this.path.shift();
			}
			servers.physics.Body.setVelocity(this.body, {x: x * speedMulti, y: y * speedMulti});
		}
		if (this.path.length == 0) {
			//End of path
			this.hasPath = false;
		}
	}

	/**
	 * If a pawn should work jobs or not
	 * @returns bool
	 */
	shouldWork() {
		return this.shouldBuild() || this.shouldCraft();
	}

	/**
	 * If a pawn should build or not
	 * @returns bool
	 */
	shouldBuild() {
		return this.data && this.data.actionToggles && this.data.actionToggles.build;
	}

	/**
	 * If a pawn should craft or not
	 * @returns bool
	 */
	shouldCraft() {
		return this.data && this.data.actionToggles && this.data.actionToggles.craft;
	}

	/**
	 * If a pawn should do medic actions or not
	 * @returns bool
	 */
	shouldMedic() {
		return this.data && this.data.actionToggles && this.data.actionToggles.medic;
	}

	/**
	 * If a pawn should work jobs or not
	 * @returns bool
	 */
	shouldDefend() {
		return this.data && this.data.actionToggles && this.data.actionToggles.defend;
	}

	/**
	 * If a pawn should flee or not
	 * @returns bool
	 */
	shouldFlee() {
		return this.data && this.data.actionToggles && this.data.actionToggles.flee;
	}

	/**
	 * If a pawn should ignore attackers or not
	 * @returns bool
	 */
	shouldIgnoreAttacks() {
		return this.data && this.data.actionToggles && this.data.actionToggles.ignore;
	}

	carry(item) {
		this.stopCarrying();

		this.data.carryingId = item.id;
		this.carrying = item;
		console.log("Carry", this.carrying);
		if (!this.carrying.data) {
			this.carrying.data = {};
		}
		this.carrying.data.do = "becarried";
		this.carrying.data.carriedById = this.id;
		this.carrying.lockedInPlace = true;

		this.carrying.sync();

		this.sync();
	}

	stopCarrying(caller) {
		this.carrying = this.helper.world.index.getFromIndex(this.data.carryingId, "all");
		this.data.carryingId = false;

		if (!this.carrying && caller) {
			this.carrying = caller;
		}

		if (!this.carrying) {
			return;
		}

		this.carrying.data.do = "idle";
		this.carrying.data.lockedInPlace = false;
		this.carrying.data.carriedById = false;

		this.carrying.meta.sort = true;
		this.carrying.zOrder = this.carrying.y;

		this.carrying.forceAnim = false;
		this.carrying.sync();

		this.carrying = false;

		this.sync();
	}

	takeDamage(value) {
		this.hasUpdates = true;
		this.updates.push({updateStat: {hp: -10}});
	}

	processUpdates(updates) {
		//TODO: check this, i think it's trickling one update
		for (let i = 0; i < updates.length; i++) {
			this.processServerUpdate(updates[i]);
		}
	}

	processServerUpdate(update) {
		if (update.type == "addStatus") {
			this.addStatus(update.data.status, update.data.options);
			return true;
		}

		if (update.type == "removeStatus") {
			this.removeStatus(update.data.status, update.data.options);
			return true;
		}
		if (update.type == "losRay") {
			this.losRay = update.losRay.concat(["buffer"]);
			this.losSearching = false;
		}
	}

	syncStat(stat) {
		this.updates.push({type: "updateStat", data: {stat: stat, value: this.data.stats[stat]}});
	}

	addStat(name) {
		if (!this.data.levels[name]) {
			this.data.levels[name] = {xp: 1, level: 1, lastXP: 1};
		}
		this.data.levels[name] = new PlayerStat({
			level: this.data.levels[name].level,
			xp: this.data.levels[name].xp,
			lastXP: this.data.levels[name].lastXP,
			canLevel: this.data.isPlayer
		});
	}

	xpAction(action, additional) {
		console.log("DO XP action", action, additional);
		if (typeof additional === "object") {
			additional = JSON.parse(JSON.stringify(additional));
		}
		this.addAndStartStatus("levelling_up", {action: action, additional: additional});
	}

	dist(target) {
		return this.helper.dist(target, this);
	}

	makeSpace(from) {
		if (from.data.dead || from.data.ko || from.data.physIsMoveable || this.data.physIsMoveable) {
			return false;
		}

		//De-dupe from making space aswell.
		if (from.data.dontMakeSpace && from.data.dontMakeSpace < Date.now() - 1000) {
			//Can make space maybe, atleast reset dont make space
			from.data.dontMakeSpace = false;
		} else {
			from.data.dontMakeSpace = Date.now();
		}

		if (this.data.dontMakeSpace && from.data.dontMakeSpace) {
			//Can't be true that both shouldn't make space.
			this.data.dontMakeSpace = false;
		}

		if (this.data.dontMakeSpace) {
			return false;
		}

		if (!this.data.makingSpace) {
			this.data.makingSpace = Date.now();
			this.data.makingSpaceAttempt = 0;
		}

		if (this.data.makingSpace && this.data.makingSpace < Date.now() - 2000) {
			this.data.makingSpace = false;
			this.data.makingSpaceAttempt++; //Still making space so increment attempts
		} else {
			return false; //Already making space;
		}

		let endX = from.x;
		let endY = from.y;

		if (this.data.makingSpace) {
			if (this.data.makingSpaceAttempt == 4) {
				this.data.makingSpaceAttempt = 0;
				//Failed all
				console.error("[ABE] Failed all making space attempts crap code.");
			}
			if (this.data.makingSpaceAttempt == 0) {
				endX += 64;
			}
			if (this.data.makingSpaceAttempt == 1) {
				endX -= 64;
			}
			if (this.data.makingSpaceAttempt == 2) {
				endY += 64;
			}
			if (this.data.makingSpaceAttempt == 3) {
				endY -= 64;
			}
		}

		if (this.path.length == 0) {
			servers.world.helper.pathUpdate("asyncPathFind", {
				id: this.id,
				targetId: from.id,
				x: this.x,
				y: this.y,
				endX: endX,
				endY: endY,
				isPlayer: this.data.isPlayer
			});
		}
	}

	seek(item) {
		if (!item.x || !item.y) {
			this.seekObj = false;
			console.error("[ABE] Cannot seek without x-y");
			return false;
		}

		if (this.data.do == "attack" && (item.data.dead || item.data.ko)) {
			this.seekObj = false;
			return false;
		}

		if (!this.seekingItem) {
			this.seekingItem = {}; //TODO: move to constructor
		}

		if (this.seekingItem.id !== item.id) {
			this.seekingItem.id = item.id;
			this.seekingItem.start = Date.now();
		}

		if (this.seekingItem.start < Date.now() - 10000 && this.path.length == 0) {
			//No path, and searching for ages
			this.seekingItem = false;

			if (this.rawPath.reason == "emptying") {
				return false; //Wait a bit
			}
			if (this.dist(item) < 128 || !this.rawPath.reason) {
				return true; //Already there;
			}

			//This was added as part of debugging. Not sure why it occurs yet.
			if (typeof this.seekObj.failed == "undefined") {
				console.error("[ABE-ERROR] No failed function", this.seekObj);
			} else {
				this.seekObj.failed("No path, long search " + this.rawPath.reason + " Dist: " + this.dist(item));
			}
			this.data.do = false;
			this.seekObj = false;
			return false;
		}

		//TODO: the 1000 here might need increasing for NPCs and staying 1000 for players
		if (this.lastSeek < Date.now() - 1000) {
			if (this.dist(item) < 65) {
				return true; //Already there;
			}
			//Seek every 5 second
			this.lastSeek = Date.now();
			let endY = Math.floor(item.y / 64) * 64;
			servers.world.helper.pathUpdate("asyncPathFind", {
				id: this.id,
				targetId: item.id,
				x: this.x,
				y: this.y,
				endX: item.x,
				endY: endY,
				isPlayer: this.data.isPlayer
			});
		}

		return false;
	}

	faceTask() {
		if (!this.seekObj) {
			return false;
		}

		let yGap = this.y - this.seekObj.y;
		let xGap = this.x - this.seekObj.x;
		if (yGap > xGap) {
			if (this.y > this.seekObj.y) {
				this.dir = "up";
			} else {
				this.dir = "down";
			}
		} else {
			if (this.x < this.seekObj.x) {
				this.dir = "left";
			} else {
				this.dir = "right";
			}
		}
	}

	getStatuses() {
		return this.statuses;
	}

	//Check if has status. Hidden statuses don't exist in server
	//So all statuses are in the list
	hasStatus(name) {
		return this.statusList[name] > 0 ? true : false;
	}

	watching() {
		return this.id === this.helper.world.watching.id;
	}

	addAndStartStatus(status, options, startTime) {
		if (!options) {
			options = {};
		}

		if (this.watching()) {
			console.log("Is " + status + " protected?");
		}

		if (this.hasStatus(status + "_protect")) {
			if (this.watching()) {
				console.log(status + " IS protected");
			}
			return false; //Protect cancels out this effect.
		}
		//Doesn't exist server side so don't add it.

		if (this.watching()) {
			console.error("Start status", status, options); //TODO: Enable now and then for testing
		}

		//TODO: Also ensure NPCs dont get statuses meant for players, e.g. levelling up

		let id = options.source || status + "-" + this.helper.randID("status");

		if (!_STATUSES["s_effect_" + status]) {
			console.log(`Cannot find s_effect_${status}`);
		}

		status = new StatusEffect({
			source: id,
			status: status,
			effect: _STATUSES["s_effect_" + status] || {},
			options: options
		});

		status.startTime = startTime || Date.now();

		if (typeof status.effect.start == "function") {
			status.effect.start(this, options);
		}

		//Always tick atleast once
		if (typeof status.effect.tick == "function") {
			status.effect.tick(this, options); //Init tick just incase it's used.
		}

		if (options.duration === undefined) {
			if (typeof status.effect.end == "function") {
				status.effect.end(this, options);
			}
		} else {
			//Has duration, will be ticked until duration reached
			this.statuses[id] = status;

			if (!this.statusList[status.status]) {
				this.statusList[status.status] = 0;
			}

			this.statusList[status.status]++;
		}

		if (this.watching()) {
			console.error("Send add status", status.status, options); //TODO: Enable now and then for testing
		}
		this.sync();
		return status;
	}

	//Used to cancel player made statuses like healing.
	//If the player says move, cancel those statuses.
	cancelStatuses() {
		this.removeAllCancellableStatuses();
	}

	removeAllCancellableStatuses() {
		var keys = Object.keys(this.statuses);

		for (var i = 0; i < keys.length; i++) {
			let lifeStatus = this.statuses[keys[i]];
			if (lifeStatus.options.canCancelWithMove !== true) {
				continue;
			}
			//Has this status, so remove and end it
			this.removeAndCancelStatus(lifeStatus, {source: keys[i]});
		}
	}

	removeStatus(status, options) {
		if (options == undefined) {
			options = {};
		}

		this.removeAndEndStatus(status, options);
	}

	removeAndCancelStatus(status, options) {
		//Doesn't exist server side so don't add it.

		if (!this.statuses[options.source]) {
			//Already has this source so remove don't stack it
			console.error(
				"[ABE] Tried to remove a status which doesn't exist: " + status + " Source:" + options.source
			);
			return false;
		}

		status = this.statuses[options.source];
		if (typeof status.effect.remove == "function") {
			status.effect.remove(this, options);
		}

		//Send updates from physics back to the rest
		//Note: the below, it appears postMessage from webworker isnt taking toJSON. when stringifying the outer
		//object it caused knock on issues
		//this casts status to a basic object using its toJSON routine
		this.updates.push({
			type: "cancelStatus",
			data: {status: status.status, options: status.toJSON()}
		});

		//Remove statuses
		this.statuses[options.source] = false;
		delete this.statuses[options.source];
	}

	addStatus(status, options) {
		if (options == undefined) {
			options = {};
		}

		const playerStatus = this.addAndStartStatus(status, options);

		if (!playerStatus) return;

		//Send updates from physics back to the rest
		this.updates.push({type: "addStatus", data: {status: playerStatus.status, options: playerStatus.options}});
	}

	addStatusFromClient(status, options, startTime) {
		if (options == undefined) {
			options = {};
		}

		this.addAndStartStatus(status, options, startTime);
		this.sync();
	}

	addStatusFromPhysics(status, options) {
		this.helper.worldUpdate("addStatusToObjectFromServer", {
			id: this.id,
			status: status,
			options: options
		});
	}

	removeAllOfStatus(status, options) {
		var keys = Object.keys(this.statuses);

		for (var i = 0; i < keys.length; i++) {
			let lifeStatus = this.statuses[keys[i]];
			if (lifeStatus.status !== status) {
				continue;
			}
			//Has this status, so remove and end it
			this.removeAndEndStatus(status, {source: keys[i]});
		}
	}

	statusTick() {
		var statuses = Object.keys(this.statuses);
		if (statuses.length === 0) {
			return false;
		}

		for (var i = 0; i < statuses.length; i++) {
			var status = this.statuses[statuses[i]];

			if (this.hasStatus(status.status + "_protect")) {
				this.removeAndEndStatus(status.status);
				continue;
			}
			//Always tick atleast once
			if (typeof status.effect.tick == "function") {
				status.effect.tick(this, status.options); //Init tick just incase it's used.
			}

			if (status.startTime + status.options.duration * 1000 < game.ts) {
				this.removeAndEndStatus(status.status, status);
			}
		}
	}

	findFirstStatusSourceId(status) {
		let keys = Object.keys(this.statuses);
		let len = keys.length;
		for (let i = 0; i < len; i++) {
			if (this.statuses[keys[i]].status == status) {
				return keys[i];
			}
		}
	}

	removeAndEndStatus(status, options) {
		//Doesn't exist server side so don't add it.

		if (options) {
			options = {};
		}

		if (!options.source) {
			options.source = this.findFirstStatusSourceId(status);
		}

		if (!this.statuses[options.source]) {
			//Already has this source so remove don't stack it
			console.error(
				"[ABE] Tried to remove a status which doesn't exist: " + status + " Source:" + options.source
			);
			return false;
		}

		status = this.statuses[options.source];

		if (typeof status.effect.end == "function") {
			status.effect.end(this, options);
		}

		//Send updates from physics back to the rest
		//Note: the below, it appears postMessage from webworker isnt taking toJSON. when stringifying the outer
		//object it caused knock on issues
		//this casts status to a basic object using its toJSON routine
		this.updates.push({
			type: "removeStatus",
			data: {status: status.status, options: status.toJSON()}
		});

		//Remove statuses
		this.statuses[options.source] = false;
		delete this.statuses[options.source];

		if (!this.statusList[status.status]) {
			//This can only occur if somewhere we forgot to populate the list
			console.error("[ABE-ERROR] Status was not added to status list");
		} else {
			this.statusList[status.status]--;
		}
	}

	reduceDebug(msg) {
		if (this.dbgCounter == undefined || this.dbgCounter > this.helper.rng(988, 1000)) {
			console.log(msg);
			this.dbgCounter = 0;
		}
		this.dbgCounter++;
	}

	isDead() {
		return this.data.dead || false;
	}

	stopMoving() {
		this.path = [];
		this.pathFind = false;
	}

	swapWeaponSlots() {
		this.updates.push({type: "swapWeapon", data: {}});
	}

	getBulletDmg(damage) {
		const BASE_MELEE_DMG = 1;
		damage = damage || BASE_MELEE_DMG;

		/*console.log(
			"sdmg",
			Algos.applyStatsToDamage(
				damage,
				this.data.stance,
				this.data.levels.melee.level,
				this.data.levels.ranged.level,
				this.data.levels.strength.level
			)
		);*/
		return Algos.applyStatsToDamage(
			damage,
			this.data.stance,
			this.data.levels.melee.level,
			this.data.levels.ranged.level,
			this.data.levels.strength.level
		);
	}

	shoot() {
		if (!this.data.targetId) {
			throw "[ABE] Trying to attack without target";
		}

		var target = this.helper.world.index.getFromIndex(this.data.targetId, "all");

		if (!target) {
			this.removeTarget();
			throw "[ABE] Invalid target in server life shoot";
		}

		this.path = []; //Make stationary - make this swappable?
		this.sync();

		var lifetime = this.data.bullet.lifetime || 1;
		lifetime = lifetime * 100; //Convert to seconds

		var speed = this.data.bullet.speed || 2.5;
		speed = speed * 16; //Roughly translating the value as blocks(32px) per second

		let dmg = this.getBulletDmg(this.data.bullet.baseDmg);

		var collision = this.data.bullet.collision || "collision_hurts_1";

		if (!collision) {
			console.error("[ABE] No bullet collision set for: " + this.codename);
		}

		if (this.id == this.helper.world.playerId) {
			this.data.hostile = true;
		}

		if (!this.data.bullet || this.data.bullet === "none" || this.data.stance === "none") {
			//MELEE? TODO: this could cause errors i guess?
			let statuses = [{status: "damage", dmg: dmg, type: "blunt"}];

			this.data.bullet = {
				statuses: statuses,
				sprite: "projectile_melee",
				lifetime: 0.45,
				speed: 0.1,
				dmg: this.getBulletDmg(0)
			};
		}

		if (!this.data.bullet.sprite || this.data.bullet.sprite === "undefined") {
			this.data.bullet.sprite = "projectile_melee";
		}

		if (!this.data.bullet.statuses) {
			this.data.bullet.statuses = [];
		}

		this.helper.world.addObjectFromServer({
			id: this.helper.randID(),
			sprite: this.data.bullet.sprite,
			codename: this.data.bullet.sprite,
			class: "Projectile",
			x: this.x,
			y: this.y,
			scale: 1,
			rotation: 0,

			meta: {},
			data: {
				sourceId: this.id,
				targetId: target.id,
				statuses: this.data.bullet.statuses,
				created: game.ts,
				faction: this.data.faction,
				lifetime: game.ts + this.data.bullet.lifetime * 1000,
				creatorId: this.id,
				collisionGroups: collision,
				dmg: dmg,
				speed: this.data.bullet.speed,
				physicsType: "projectile",
				rot: 0,
				x: this.x,
				y: this.y,
				targetX: target.x,
				targetY: target.y
			}
		});
	}

	getDamageReductionFromType(type) {
		return this.data.stats[type + "Reduction"] || 0;
	}

	isHostileTo(life) {
		life.addHostileToFaction(this);
	}

	hostileToMe(life) {
		if (!life) {
			return false;
		}
		life.isHostileTo(this);
	}

	addHostileToFaction(life) {
		this.data.factionHitTime[life.data.faction] = game.ts;
	}

	threatCount() {
		return Object.keys(this.threats).length;
	}

	//TODO: move to on attack stuff for player?
	hurtBy(shooter, amount) {
		if (!shooter) {
			return; //Can't find shooter so cant register hit
		}

		if (!this.threats[shooter.id]) this.threats[shooter.id] = 0;

		this.threats[shooter.id] += amount;

		this.addHostileToFaction(shooter);
	}

	isHigherThreat(target) {
		let currentTarget = this.helper.world.index.find(this.data.targetId);
		if (!currentTarget) return true;
		if (!this.threats[target.id]) return false; //New target has never attacked us before
		if (this.threats[target.id] - this.threats[currentTarget.id] > 1) return true; // Has done 10 more dmg to us, higher threat
	}

	hurt(amount, type, options, upkeep) {
		if (!options) {
			options = {};
		}

		const safetyOn = false; //TODO: In future, we can add a toggle to stop death from happening from high damage during KO

		if (isNaN(amount)) {
			console.log("[ABE-INFO] No damage amount on hurt?", amount, type, this.id, options.creatorId);
			amount = 5;
		}

		const bodyParts = BODY_PARTS;

		let bodyPart = options.bodyPart || bodyParts[this.helper.rng(0, bodyParts.length - 1)];

		const toughness = this.data.levels.toughness.level;
		const koLevel = 0 - toughness;
		let dieLevel = -this.data.stats.maxHP + 1;

		if (safetyOn) {
			return;
		}

		let overallDmg = Algos.calculateDamageToLife(this, amount, type);

		if (isNaN(overallDmg)) {
			console.error("[ABE-ERROR] Generated NaN on damage calc", {amount, type, life: this});
			overallDmg = this.helper.rng(0, 10); //Generate atleast some random value
		}

		if (options.creatorId) {
			this.hurtBy(this.helper.world.index.find(options.creatorId), overallDmg);
		}

		// Ceil to avoid sending too many messages (e.g. 1.33333334, 1.434344)
		// ^False, due to bleed damage being less than 1 per tick :(
		this.data.stats[bodyPart] = this.data.stats[bodyPart] - overallDmg;

		if (this.data.stats[bodyPart] < -this.data.stats.maxHP) {
			this.data.stats[bodyPart] = -this.data.stats.maxHP;
		}

		//Blunt reduces overall part maxes
		if (type === "blunt") {
			this.data.stats[bodyPart + "Max"] = this.data.stats[bodyPart + "Max"] - amount;
			//The max can only be nerfed as far as their toughness / 4, 10 = 2.5 100 = 25
			if (this.data.stats[bodyPart + "Max"] < toughness / 4) this.data.stats[bodyPart + "Max"] = toughness / 4;
		}

		//Cap at 15 to avoid looking strange
		if (this.data.stats[bodyPart + "Max"] < 15) this.data.stats[bodyPart + "Max"] = 15;

		/*
			IMPORTANT!
			If this doesn't seem to be working, it's when calculateDamageToLife fails (throws)
			We could add trys and stuff but not for now
		*/

		//Kill the Pawn (Body too Destroyed)
		if (this.data.stats.body < dieLevel) {
			this.addStatus("dead");
			return;
		}

		//Kill the Pawn (Head too Destroyed)
		if (this.data.stats.head < dieLevel) {
			this.addStatus("dead");
			return;
		}

		let minKoDuration = 5;
		let koDuration = 110;
		//KO the Pawn (Body too Destroyed)
		//Checking for the body area, ensures it only causes KO when hitting that part
		//Checking before damage is applied ensures one last hit is needed to that part before ko'ing a part below its ko threshold
		if (bodyPart === "body" && this.data.stats.body < koLevel) {
			koDuration = 30 - toughness;
			koDuration = koDuration < minKoDuration ? minKoDuration : koDuration;
			this.addStatus("ko", {duration: koDuration});
		}

		//KO the Pawn (Head too Destroyed)
		//Checking for the head area, ensures it only causes KO when hitting that part
		//Checking before damage is applied ensures one last hit is needed to that part before ko'ing a part below its ko threshold
		if (bodyPart === "head" && this.data.stats.head < koLevel) {
			koDuration = 110 - toughness;
			koDuration = koDuration < minKoDuration ? minKoDuration : koDuration;
			this.addStatus("ko", {duration: koDuration});
		}

		//If it's any body part, KO from shock randomly if toughness less than 50
		if (toughness < 50) {
			if (!upkeep && this.data.stats[bodyPart] < koLevel && this.helper.rng(0, 3) === 2) {
				koDuration = 50 - toughness;
				koDuration = koDuration < minKoDuration ? minKoDuration : koDuration;
				this.addStatus("ko", {duration: koDuration});
			}

			
		}

		if(upkeep && this.data.stats[bodyPart] < koLevel) {
			this.hurt(amount*4);
		}

		this.sync();
	}

	upkeep(stat, amount) {
		this.hurt(amount, "none", {bodyPart: stat}, true);
		this.capStats();
	}

	recover(stat, amount) {
		this.data.stats[stat] = this.data.stats[stat] + amount;
		this.capStats();
	}

	capStats() {
		if (this.data.stats["sleep"] < -99) this.data.stats["sleep"] = -99;
		if (this.data.stats["energy"] < -99) this.data.stats["energy"] = -99;
		if (this.data.stats["food"] < -99) this.data.stats["food"] = -99;
		if (this.data.stats["water"] < -99) this.data.stats["water"] = -99;

		if (this.data.stats["sleep"] > this.data.stats["maxSleep"])
			this.data.stats["sleep"] = this.data.stats["maxSleep"];
		if (this.data.stats["energy"] > this.data.stats["maxEnergy"])
			this.data.stats["energy"] = this.data.stats["maxEnergy"];
		if (this.data.stats["food"] > this.data.stats["maxFood"]) this.data.stats["food"] = this.data.stats["maxFood"];
		if (this.data.stats["water"] > this.data.stats["maxWater"])
			this.data.stats["water"] = this.data.stats["maxWater"];
	}

	torpor(amount) {
		if (this.data.ko) return; //Already knocked out
		this.data.stats.torp = this.data.stats.torp + amount;
		if (!this.data.ko && this.data.stats.torp > this.data.stats.maxTorp) {
			this.data.stats.torp = Math.ceil(this.data.stats.maxTorp);
			console.error("KNOCK KNOCK KNOCK");
			this.addStatus("ko", {duration: 30, source: "torpor_level"});
		}
		this.sync();
	}

	getTorpFallRate() {
		return 0.1;
	}

	stimulate(amount) {
		if (this.data.ko) return; //Already knocked out
		this.data.stats.torp = this.data.stats.torp - this.getTorpFallRate();
		if (this.data.stats.torp < 2) {
			console.error("WAKEWAKEWAKE");
			this.removeAllOfStatus("ko");
		}
		this.sync();
	}

	heal(amount, area) {
		if (!area) {
			//No area to heal, so heal top to bottom

			for (let part of BODY_PARTS) {
				if (this.data.stats[part] >= this.getStatMax(part)) continue;
				area = part;
				break;
			}
		}

		const max = this.getStatMax(area);

		this.data.stats[area] = this.data.stats[area] + amount;
		if (this.data.stats[area] > max) this.data.stats[area] = max;

		this.sync();
	}

	getStatPercentages(stat) {
		//Loop all percentage adders, and just add all the percentages together
		return 0;
	}

	getStatAdditions(stat) {
		//Loop all the stat additions, and just add all the values together
		return 0;
	}

	//TODO: Remove this after renaming everything
	badMap(stat) {
		//Good stat in the if... return the bad stat
		if (stat === "hpMax") return "maxHP";
		return stat; //No map, return stat
	}

	getFinalStat(stat) {
		stat = this.badMap(stat);
		const percentBuffs = this.getStatPercentages(stat);
		const additionBuffs = this.getStatAdditions(stat);

		//Add additions first
		const baseAmount = stat + additionBuffs;

		//Then add percentage on overall
		const finalAmount = baseAmount + baseAmount * percentBuffs;

		//The final stat buffed
		return this.data.stats[stat];
	}

	//Deep heal heals the max bars also
	//The other heal just heals upto the max
	deepHeal(amount, area) {
		const hpMax = this.getFinalStat("hpMax");

		if (!area) {
			//No area to heal, so heal top to bottom
			for (let part of BODY_PARTS) {
				if (this.data.stats[part] >= hpMax) continue;
				area = part;
				break;
			}
		}

		//Increase both the stat, and it's max with deep heal
		this.data.stats[area] = this.data.stats[area] + amount;
		this.data.stats[area + "Max"] = this.data.stats[area + "Max"] + amount;

		//Cap out the max HP value
		if (this.data.stats[area + "Max"] > hpMax) this.data.stats[area + "Max"] = hpMax;

		//Cap out the base stat to the updated max value
		const max = this.getStatMax(area);
		if (this.data.stats[area] > max) this.data.stats[area] = max;

		this.sync();
	}

	getStatMax(stat) {
		return this.data.stats[stat + "Max"];
	}

	sync() {
		this.helper.world.sync(this);
	}

	fillSensorFar() {
		var distance = 1000;
		var life = this.helper.world.index.getIndex("life");
		var keys = Object.keys(life);
		if (this.checkId == undefined || this.checkId >= keys.length - 1) {
			this.checkId = -1;
		}
		this.checkId++;
		var check = life[keys[this.checkId]];
		if (!check) {
			console.error("[ABE] Checking undefined " + this.checkId + " " + keys.length);
			return false;
		}
		if (check.id == this.id) {
			return false; //Me
		}
		if (this.dist(check) < distance) {
			this.touchers[check.id] = true;
		} else if (this.touchers[check.id]) {
			this.touchers[check.id] = false;
			delete this.touchers[check.id];
		}
	}

	fillSensorClose() {
		var distance = 125;
		var life = this.helper.world.index.getIndex("life");
		var keys = Object.keys(life);
		if (this.checkId2 == undefined || this.checkId2 >= keys.length - 1) {
			this.checkId2 = -1;
		}
		this.checkId2++;
		var check = life[keys[this.checkId2]];
		if (!check) {
			console.error("[ABE] Checking undefined " + this.checkId2 + " " + keys.length);
			return false;
		}
		if (check.id == this.id) {
			return false; //Me
		}
		if (this.dist(check) < distance) {
			this.touchersClose[check.id] = true;
		} else if (this.touchersClose[check.id]) {
			this.touchersClose[check.id] = false;
			delete this.touchersClose[check.id];
		}
	}

	fillSensors() {
		this.fillSensorFar();
		this.fillSensorClose();
	}

	updateDistanceTravelled() {
		if (!this.data.isPlayer) {
			return; //Only track player pawns
		}

		if (this.path.length == 0) {
			return false; //Only travelling when have path
		}

		let currentGridRef = this.path[0].x + "_" + this.path[0].y;

		if (!this.distance) {
			this.distance = this.data.distance || 0;
		}

		if (this.lastGridRef && this.lastGridRef === currentGridRef) {
			return false;
		}

		this.lastGridRef = currentGridRef;
		this.distance++;

		if (this.distance % 10) {
			//Continue every 10 distance
			return false;
		}

		let overweight = Algos.isOverweight(this.data.stats.weight || 0, this.data.stats.maxWeight || 0);

		if (overweight) {
			this.xpAction("walked10blocksheavy", {overweight: overweight});
		} else {
			this.xpAction("walked10blockslight", {overweight: overweight});
		}
		this.sync();
	}
	isWall(x, y) {
		return false;
	}

	checkSquareAhead() {
		//TODO: comment this out to see if it improves NPCs, give back to just player if not
		//Not required if no local move or if not player
		//if (!this.helper.world.settings.localmove || !this.data.isPlayer) {
		//		return; //Just player for now
		//	}

		this.wallStop = false; //So we can check inside the path checker

		let gridX = this.helper.gridPos(this.x);
		let gridY = this.helper.gridPos(this.y);
		if (
			this.helper.world.isWall(gridX - 1, gridY) ||
			this.helper.world.isWall(gridX + 1, gridY) ||
			this.helper.world.isWall(gridX, gridY - 1) ||
			this.helper.world.isWall(gridX, gridY + 1) ||
			this.helper.world.isWall(gridX - 1, gridY - 1) ||
			this.helper.world.isWall(gridX + 1, gridY - 1) ||
			this.helper.world.isWall(gridX - 1, gridY + 1) ||
			this.helper.world.isWall(gridX + 1, gridY + 1)
		) {
			this.wallStop = true;
		}
	}

	checkPathAhead() {
		this.updateDistanceTravelled();

		this.checkSquareAhead();

		//Checking for stuff in front of us

		if (this.path.length == 0) {
			return false; //Nothing to see
		}

		let index = this.helper.world.index.getIndex("doors");

		if (!index || Object.keys(index).length == 0) {
			return false; //Nothing to see still
		}

		let doorRef = index[this.path[0].x + "_" + this.path[0].y];

		if (!doorRef) {
			return false; //No door here
		}

		let door = this.helper.world.index.find(doorRef.id); //The door stored in index is old and not synced

		if (!door) {
			console.error("[ABE-ERROR] Found door reference but no door");
			return false; //No door object found
		}

		if (door.data.open) {
			return; //It's open, nothing to do.
		}

		if (door.data.locked && this.data.faction == "nomad") {
			//Don't let player through locked doors
			//TODO: in future we could lock doors to other things or factions etc
			if (!this.hasKey(door)) {
				this.path = [];
				return;
			} else {
				door.data.locked = false;
				if (door.data.usedata1 == "removeKey") {
					door.data.removeKey = true;
					door.data.openedBy = this.id;
				}
			}
		}

		if (!door.data.open) {
			door.data.open = true;
			door.sync(true);
		}
	}

	hasKey(door) {
		if (this.itemList[door.data.group] > 0) {
			return true;
		}
		return false;
	}

	giveJobCooldown() {
		this.data.jobCooldown = 100;
		this.sync();
	}

	hasJobCooldown() {
		if (!this.data.jobCooldown) return false;
		this.data.jobCooldown = this.data.jobCooldown > 0 ? this.data.jobCooldown - 1 : 0;
		return true;
	}

	hasJob() {
		return !!(this.shouldWork() && this.data["do"] && this.data.do !== "pathTo" && this.data.jobId);
	}

	getCommand() {
		if (this.onBreak()) {
			return "break";
		} else {
			return this.data.command;
		}
	}

	runEvery(label, callback, delay) {
		if (!this.every) {
			this.every = {}; //TODO: move this to consutrctor
		}
		if (!this.every[label]) {
			//Doesnt exist yet
			this.every = {}; //empty
			this.every[label] = {};
			this.every[label].nextRun = game.ts - delay; //Run once
			this.every[label].ticks++; //TODO: Consider delta in future
		}

		this.every[label].tick++;

		if (this.every[label].tick + game.ts > this.every[label].nextRun || this.every[label].nextRun < game.ts) {
			this.every[label].tick = 0;
			this.every[label].nextRun = game.ts + delay;
			console.error("[ABE-INFO] Run every", delay, label);
			callback(this);
		}
	}

	updateDir() {
		var dir = this.dir || "down";

		let set = false;
		if (this.helper.dist({x: this.lastX, y: 0}, {x: this.x, y: 0}) > 0) {
			if (this.lastX > this.x) {
				set = true;
				dir = "left";
			} else {
				set = true;
				dir = "right";
			}
		}

		if (!set && this.helper.dist({x: 0, y: this.lastY}, {x: 0, y: this.y}) > 0) {
			if (this.lastY > this.y) {
				dir = "up";
			} else {
				dir = "down";
			}
		}

		this.dir = this.data.forceDir || dir;

		this.lastX = this.x;
		this.lastY = this.y;
	}

	worldTick(bulk) {
		if (this.data.do == "becarried") {
			this.state = "aistate_idle";
			this.path = [];
			return; //Does nothing when carried
		}

		try {
			this.statusTick();
		} catch (e) {
			console.error("[ABE] Failed to tick statuses");
			console.error(e);
		}

		if (this.isDead()) {
			//Skip dead bodies
			//bulk.setVelocity.push({id: this.id, x: 0, y: 0});
			return false;
		}

		if (!this.state) {
			//Has not state
			return false;
		}

		this.checkPathAhead();

		this.fillSensors(); //Find out what objects are nearby

		this.weaponType = "ranged";
		this.isMelee = false;

		if (this.data.stance == "none" || this.data.stance == "melee") {
			this.weaponType = "melee";
			this.isMelee = true;
		}

		if (this.data.rageId) {
			this.addAndStartStatus("settarget", {targetId: this.data.rageId});
			this.removeTarget();
			this.data.rageId = false;
		}

		if (typeof this.data.worldNoLOS == "undefined" || this.data.worldNoLOS !== true) {
			try {
				_AISTATES["aistate_searchindex"].weight.call(this, this);
				_AISTATES["aistate_attack"].weight.call(this, this);
				_AISTATES["aistate_find_los"].weight.call(this, this);
				_AISTATES["aistate_find_enemies"].weight.call(this, this);
			} catch (e) {
				console.error("[ABE] " + this.id + " Failed to execute default weights");
				console.error(e);
			}
		}
		if (!_AISTATES[this.state]) {
			console.error("[ABE] Can't find state: " + this.state);
			this.state = "aistate_idle";
		}

		try {
			if (
				_AISTATES[this.state] &&
				typeof _AISTATES[this.state].run == "function" &&
				_AISTATES[this.state].run.call(this, this) === false
			) {
				if (typeof _AISTATES[this.state].end == "function") {
					_AISTATES[this.state].end.call(this, this);
				}
				this.state = "aistate_idle";
			}
		} catch (e) {
			console.error("[ABE] " + this.id + " Failed to execute state: " + this.state);
			console.error(e);
		}

		try {
			this.getNextState();
		} catch (e) {
			console.error("[ABE] " + this.id + " Failed to get next state");
			console.error(e);
		}

		if (this.seekObj) {
			this.seek(this.seekObj);
		}

		if (this.data.ko) {
			return; //KO can return early no pathing etc.
		}

		let rDown = false;

		if (this.helper.world.mouse.rDown) {
			if (!this.rDownTimer) {
				this.rDownTimer = game.ts;
			}
		} else {
			this.rDownTimer = false;
		}

		if (this.helper.world.mouse.rDown && this.rDownTimer < game.ts - 16 * 32) {
			rDown = true;
		}

		if (this.path.length > 0) {
			this.unblock();
			var speedMulti = this.data.stats.maxSpeed || 4;
			var path = this.path[0];
			var centerOffset = 0;

			var gotoX = path.x * this.tileSize + centerOffset;
			var gotoY = path.y * this.tileSize + centerOffset;

			if (this.data.isPlayer && this.helper.world.settings.localmove && rDown && !this.wallStop) {
				gotoX = this.helper.world.mouse.gridX * 64;
				gotoY = this.helper.world.mouse.gridY * 64;
			}

			if (this.dist({x: gotoX, y: gotoY}) < 12) {
				this.path.shift();
				return;
			}

			if (this.path.length > 2) {
				//Check if we were pushed into path 2 but also make sure its not last path
				var path2 = this.path[1];

				var gotoX2 = path2.x * this.tileSize + centerOffset;
				var gotoY2 = path2.y * this.tileSize + centerOffset;
				if (this.dist({x: gotoX2, y: gotoY2}) < 65) {
					this.path.shift();
					return;
				}
			}

			if (this.wallStop) return;

			if (this.path.length === 1) {
				bulk.setVelocity.push({
					dir: this.dir,
					id: this.id,
					type: "arrive",
					speed: speedMulti,
					startX: this.x,
					startY: this.y,
					endX: gotoX,
					endY: gotoY
				});
			} else {
				bulk.setVelocity.push({
					dir: this.dir,
					id: this.id,
					type: "seek",
					speed: speedMulti,
					startX: this.x,
					startY: this.y,
					endX: gotoX,
					endY: gotoY
				});
			}
		}

		this.hostileToMe(servers.world.index.find(this.data.targetId));

		if (this.path.length == 0) {
			//End of path
			this.block();
			this.hasPath = false;
		}

		return;
	}

	startCurrentTask() {
		this.seekObj = servers.world.index.getFromIndex(this.data.gotoId, "all");
	}

	cancelJob() {
		if (!this.data.jobId) {
			return false;
		}
		let job = this.helper.world.index.getFromIndex(this.data.jobId, "all");
		if (!job) return;
		job.data.assigned = false;
	}

	/**
	 *
	 * @param {*} job
	 * @param {*} playerPriority
	 * @returns
	 */
	couldAssignJob(job, playerPriority) {
		//Also factors in jobs parent priority, no need to double check etc
		//If failed, assigned, or not for this AI job type (haul etc)

		let isFailed = job.isFailed();
		let notMyKindOfWork = false; //!this.data.jobs.includes(job.data.job);
		let complete = job.data.complete;
		let assigned = job.data.assigned;

		let priority = 1; //Default priority;

		if (typeof job.data.playerPriority !== "undefined") {
			priority = job.data.playerPriority;
		}

		let parent = servers.world.index.getFromIndex(this.data.parentId, "all");

		if (parent && typeof parent.data.playerPriority !== "undefined") {
			//Has a parent, use parent priority
			priority = parent.data.playerPriority;
		}

		if (isFailed || complete || assigned || notMyKindOfWork || priority !== playerPriority) {
			return false;
		}

		if(job.codename === "build-item" && !job.data.hasResources) return false; //Build item with no resources

		//Maybe the job has a job check function
		if (
			job.events &&
			typeof job.events.onJobCheck == "function" &&
			!job.events.onJobCheck.call(job, job, this, this)
		) {
			return false;
		}

		return true; //Passed all checks
	}

	getJobs() {
		this.cancelJob(); //Cancel any current job

		/**
		 * Jobs index are added based on its search priority, e.g. drop off jobs are always highest
		 * Then by its natural job priority e.g. Cages are higher priority than Incinerators
		 * Then the player priority for the items, e.g. 2 cages, the higher priority is selected first
		 */
		for (let searchPriority = 0; searchPriority < 4; searchPriority++) {
			for (let jobPriority = 0; jobPriority < 4; jobPriority++) {
				for (let playerPriority = 1; playerPriority < 5; playerPriority++) {
					const indexKey = "jobs_" + searchPriority + "_" + jobPriority;
					this.search = servers.world.findClosest(this, indexKey, (item) => {
						return this.couldAssignJob(item, playerPriority);
					});

					if (this.search && this.search.complete && this.search.results.length > 0) {
						console.log("New job", this.search.results[0])
						var guardPoint = this.search.results[0];
						this.data.jobId = guardPoint.id;
						this.findId = guardPoint.id;
						guardPoint.data.assigned = this.id;
						this.data.do = "job";
						this.data.job = guardPoint.codename;
						this.seekObj = guardPoint;

						this.sync();
						return true;
					}
				}
			}
		}

		this.seekObj = false;

		this.takeBreak(); //Can't find any jobs
		return false;
	}

	findResource(resource) {
		this.search = servers.world.findClosest(this, "playerstorage", (item, searcher) => {
			return !item.isFailed() && item.contentsList.includes("ss_item_" + resource);
		});

		if (this.search && this.search.complete && this.search.results.length > 0) {
			this.data.haulId = this.search.results[0].id;
			this.sync();
			return this.data.haulId;
		}

		this.data.haulId = false;

		return false;
	}

	onBreak() {
		if (!this.data.takeABreak) {
			return false;
		}
		return this.data.takeABreak > Date.now();
	}

	takeBreak() {
		this.data.takeABreak = Date.now() + 2000; //
	}

	doJob() {
		if (!this.jobObject || this.jobObject.id !== this.data.jobId) {
			this.jobObject = this.seekObj;
			this.seekObj = false; //Arrived so stop seeking
		}

		if (!this.jobObject || this.jobObject.data.complete) {
			this.jobObject = false;
			this.seekObj = false;
			console.error("Set do to false 1");
			this.data.do = false;
			return false;
		}

		this.runEvery(
			"doJob",
			() => {
				servers.world.helper.execClientObjectFunction(this.jobObject.id, `jobStep`, {
					callerId: this.id
				});
			},
			1000
		);
		return true;
	}

	log(msg) {
		return;
		console.log(this.data.faction, msg);
		//TODO: Disable in production
		if (!this.data.log) {
			this.data.log = [];
		}
		if (this.data.log.length > 25) {
			this.data.log.shift();
		}
		this.data.log.push(msg);
	}

	/*log(msg) {
        //Production stub
    }*/

	isSearching() {
		if (this.search && !this.search.complete) {
			return true;
		}
		return false;
	}

	startSeekObj(codename) {
		this.search = servers.world.findClosest(this, codename, function (item) {
			if (item.codename === "helper_guard_point") {
				console.log("Searching", item);
			}
			return !item.isFailed();
		});

		if (this.search && this.search.complete && this.search.results.length > 0) {
			var guardPoint = this.search.results[0];
			this.findId = guardPoint.id;
			console.error("Set do to codename 1", codename);
			this.data.do = codename;
			this.seekObj = guardPoint;

			return true;
		}

		if (this.search && this.search.complete && !this.search.results.length) {
			this.seekObj = false;

			console.error("[ABE] Failed to find good: " + codename);
			return false;
		}
		return false;
	}

	startSeekRandomObj(codename) {
		//Search for closes that hasn't failed before.
		this.search = servers.world.findClosest(this, codename, function (item) {
			return !item.isFailed() && !item.isReserved();
		});

		//Couldn't find any, retry with none failed
		if (!this.search) {
			this.search = servers.world.findClosest(this, codename, function (item) {
				return true;
			});
		}

		if (this.search && this.search.complete && this.search.results.length > 0) {
			let guardPoint = this.search.results[this.helper.rng(0, this.search.results.length - 1)];
			if (!guardPoint) {
				console.error("[ABE-ERROR] Weird result in search");
				return false;
			}
			//TODO: enable now and then, see if its runnign to much
			//console.log("Set guard point", guardPoint);
			this.findId = guardPoint.id;
			this.data.do = codename;
			this.seekObj = guardPoint;
			return true;
		}

		if (this.search && this.search.complete && !this.search.results.length) {
			this.seekObj = false;

			console.error("[ABE] Failed to find good RANDOM: " + codename);
			return false;
		}
		return false;
	}

	startSeekRandomObjOld(codename) {
		//Search for closes that hasn't failed before.
		this.search = servers.world.findClosest(this, codename, function (item) {
			return !item.isFailed();
		});

		//Couldn't find any, retry with none failed
		if (!this.search) {
			this.search = servers.world.findClosest(this, codename, function (item) {
				return true;
			});
		}

		if (this.search && this.search.complete && this.search.results.length > 0) {
			var guardPoint = this.search.results[servers.world.helper.rng(0, this.search.results.length - 1)];
			this.findId = guardPoint.id;
			this.data.do = codename;
			this.seekObj = guardPoint;
			return true;
		}

		this.seekObj = false;

		console.error("[ABE] Failed to find good RANDOM Obj : " + codename);
		return false;
	}

	block() {
		return false;//TODO: disabled coz its crap?
		if (this.hasPath || this.path.length > 0) {
			return false;
		}

		let x = Math.floor((this.x + 32) / 64);
		let y = Math.floor((this.y + 32) / 64);
		let coord = x + "-" + y;
		if (game.servers.world.NPCsblock[coord] && game.servers.world.NPCsblock[coord] !== this.id) {
			this.log("Someone in way");
			//Already someone here

			let found = false;
			while (!found) {
				x = x + game.rng(-1, 1);
				y = y + game.rng(-1, 1);
				if (!game.servers.world.NPCsblock[x + "-" + y]) {
					found = true;
				}
			}
			//game.servers.world.NPCsblock[x + "-" + y] = this.id;
			this.path = [{x: x, y: y}];

			return;
		}
		game.servers.world.NPCsblock[x + "-" + y] = this.id;
		this.blocking = coord;
	}
	unblock() {
		if (game.servers.world.NPCsblock[this.blocking] && game.servers.world.NPCsblock[this.blocking] == this.id) {
			delete game.servers.world.NPCsblock[this.blocking];
		}
		this.blocking = false;
	}

	distanceToTask() {
		if (this.data.jobId) {
			this.seekObj = this.helper.world.index.getFromIndex(this.data.jobId, "all");
		}

		if (!this.seekObj) {
			this.seekObj = this.helper.world.index.getFromIndex(this.data.gotoId, "all");
		}

		let dist = this.dist(this.seekObj || this.jobObject);

		if (!this.seekObj && !this.jobObject) {
			//Can't find the task?
			console.error("RESET", this.data.jobId, this.data.gotoId, this.seekObj, this.jobObject, this.data);
			this.resetTask("Too far away");
			return Infinity; //You can never reach this
		}

		return dist;
	}

	restartTasks() {
		this.startCurrentTask();
	}

	cancelSeek() {
		this.resetTask("Cancelling seek");
	}

	setCurrentTask(type, id) {
		this.data.do = type;
		this.data.gotoId = id;
	}

	getCurrentTask() {
		return this.data.do;
	}

	resetTask(reason) {
		this.log("reset task");
		this.faceTask(); //TODO: MOVE
		this.state = "aistate_idle"; //Set AI state back to something neutral
		console.error("Set do to blank reset task", reason);
		this.data.do = "";
		this.data.gotoId = false;
		this.seekObj = false;
		this.sync();
	}

	lerp(start, end, amt) {
		return (1 - amt) * start + amt * end;
	}

	//Creates itemList for items with inventory
	indexInventory() {
		if (!this.data.inventory) {
			return;
		}
		if (!this.data.inventory.main) {
			return;
		}
		this.inventory = this.data.inventory;

		//It looks at the inventory and makes a list of it contents easier accessible to developers
		if (this.inventory.main.length == 0 || this.inventoryIndex > this.inventory.main.length) {
			this.inventoryIndex = 0;
			this.itemList = this.inventoryBuffer;
			this.contentsList = Object.keys(this.itemList);
			this.inventoryBuffer = {};
			return;
		}

		let item = this.inventory.main[this.inventoryIndex];
		this.inventoryIndex++;

		if (!item) {
			return;
		}

		if (!this.inventoryBuffer[item.name]) {
			this.inventoryBuffer[item.name] = 0;
		}

		this.inventoryBuffer[item.name] += item.data && item.data.qty ? item.data.qty : 1;
	}

	isFull() {
		return this.data.inventoryFull || false;
	}

	hasResource(resource) {
		return this.itemList[resource];
	}

	hasResourceQty(resource, amount) {
		if (!this.hasResource(resource)) {
			return false;
		}
		return this.itemList[resource] >= amount;
	}
}

export default ServerLife;

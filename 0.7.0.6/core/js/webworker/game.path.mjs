class ServerHelper {
	constructor(emit) {
		this.emit = emit;
		this.clientuid = Date.now(); //TODO: swap to sumat else later mabe
		this.lastID = 0;
		this.chunkSize = 10;
		this.tileSize = 64;
		this.path = {};
		this.physics = {};
		this.world = {};
	}

	timestamp() {
		return Date.now();
	}

	atGridPos(n) {
		return Math.floor(n * this.tileSize);
	}

	gridPos(n) {
		return Math.floor(n / this.tileSize);
	}

	broadcastUpdate(parent, func, data) {
		this.emit({
			creatorId: "offloader",
			server: "broadcast",
			action: "executeOnClient",
			data: {parent: parent, func: func, data: data}
		});
	}

	execClientObjectFunction(id, func, data) {
		this.emit({
			creatorId: "offloader",
			server: "client",
			action: "executeOnClient",
			data: {parent: "game", id: id, func: func, data: data}
		});
	}

	execServerObjectFunction(id, func, data) {
		console.log("Exec on server", {parent: "game", id: id, func: func, data: data});
		this.emit({
			creatorId: "offloader",
			server: "world",
			action: "executeOnServer",
			data: {parent: "game", id: id, func: func, data: data}
		});
	}

	clientUpdate(socketId, creatorId, parent, func, data) {
		this.emit({
			socketId: socketId,
			creatorId: creatorId,
			server: "client",
			action: "executeOnClient",
			data: {parent: parent, func: func, data: data}
		});
	}

	physicsUpdate(action, data) {
		this.emit({
			creatorId: "offloader",
			serverside: true,
			server: "physics",
			action: action,
			data: data
		});
	}

	pathUpdate(action, data) {
		this.emit({
			creatorId: "offloader",
			serverside: true,
			server: "path",
			action: action,
			data: data
		});
	}

	msToTime(ms) {
		new Date(ms).getHours();

		let minutes = new Date(ms).getMinutes();

		let seconds = new Date(ms).getSeconds();

		return `${minutes}:${seconds}`;
	}

	worldUpdate(action, data) {
		this.emit({
			creatorId: "offloader",
			serverside: true,
			server: "world",
			action: action,
			data: data
		});
	}

	randID(name) {
		if (name === undefined) {
			name = "dd";
		}
		this.lastID++;
		return this.clientuid + "-" + name + "-" + this.lastID;
	}

	rng(min, max) {
		return Math.floor(min + Math.random() * (max + 1 - min));
	}

	clone(obj) {
		if (null === obj || "object" != typeof obj) {
			return obj;
		}
		var copy = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				copy[attr] = obj[attr];
			}
		}
		return copy;
	}

	getRegion(item) {
		return {
			x: Math.floor(item.x / (this.chunkSize * this.tileSize)),
			y: Math.floor(item.y / (this.chunkSize * this.tileSize))
		};
	}

	dist(object1, object2) {
		if (object2 == undefined || object1 == undefined) {
			return Infinity;
		}

		if (object1.width && object2.width) {
			return this.distRect(object1, object2);
		}

		return this.distance(object1.x, object1.y, object2.x, object2.y);
	}

	distRect(object1, object2) {
		if (object2 == undefined || object1 == undefined) {
			return Infinity;
		}

		return this.distance(
			object1.x + object1.width / 2,
			object1.y + object1.height / 2,
			object2.x + object2.width / 2,
			object2.y + object2.height / 2
		);

		/*
        let sx = object2.x+object2.width;
        let sy = object2.y+object2.height;

        let ex = object1.x;
        let ey = object1.y;

        if(object1.x < object2.x) {
            sx = object1.x + object1.width;
            ex = object2.x;
        }

        if(object1.y < object2.y) {
            sy = object1.y + object1.height;
            ey = object2.y;
        }
        
        
        return this.distance(sx, sy, ex,ey)
        */
	}
	debug(msg) {
		if (this.dbgCounter == undefined || this.dbgCounter > 1000) {
			console.log(msg);
			this.dbgCounter = 0;
		}
		this.dbgCounter++;
	}

	//Calculates from centers
	cDistance(object1, object2) {
		if (object2 == undefined || object1 == undefined) {
			return false;
		}
		return this.distance(
			object1.x + object1.width / 2,
			object1.y + object1.height / 2,
			object2.x + object2.width / 2,
			object2.y + object2.height / 2
		);
	}

	distance(x1, y1, x2, y2) {
		let dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

		if (isNaN(dist)) {
			return Infinity; //Return infinity if cant not a number
		}

		return dist;
	}

	//Given an input, and its possible min max output, convert this to a range 0 -> 1
	rangeMap(n, in_min, in_max, out_min, out_max) {
		return ((n - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
	}

	debugObject(x, y, w, h) {
		var bullet = {
			id: this.randID() + "dbg",
			codename: "uiicon_masterwork",
			class: "SimpleItem",
			x: x,
			y: y,
			width: w,
			height: h,
			scale: 0.5,
			rotation: 0,
			meta: {},
			data: {}
		};
		this.world.addObjectFromServer(bullet);
	}

	measure(measureMe, depth) {
		if (depth == undefined) {
			depth = 0; //Starts at top of object
		} else {
			depth++;
		}

		//Searching 5 deep to avoid circular
		if (depth > 5) {
			return 0;
		}
		var totalSize = 0;
		for (var keyName in measureMe) {
			var propertyVal = measureMe[keyName];
			var size = 0;
			if (typeof propertyVal == "function") {
				continue;
			}
			if (typeof propertyVal == "object") {
				size = Object.keys(propertyVal).length;
			}
			if (typeof propertyVal == "array") {
				size = propertyVal.length;
			}
			if (typeof propertyVal == "number") {
				size = 4;
			}
			if (typeof propertyVal == "string") {
				size = 8;
			}
			totalSize += size;
		}
		return totalSize;
	}
}

function checkIsNodeJs() {
	return typeof process === "object";
}

const urlVar = {};
location.search.slice(1).split("&").forEach((key_value) => {
	const kv = key_value.split("=");
	urlVar[kv[0]] = kv[1];
});


function isLive() {
	
	//Works for webworkers
	if(urlVar['localStorage'] || urlVar['isLive']) {
		return true;
	}
	
	//Works for fronted
	if(typeof game !== "undefined" && typeof game.urlVar === "function") {
		if(game.urlVar('localStorage')) {
			return true;
		}
	}
	
	if(isElectron()) {
		return true;
	}
	if(isNw()) {
		return true;
	}
	return false;
}

function isElectron() {
	// Renderer process
	if (typeof window !== "undefined" && typeof window.process === "object" && window.process.type === "renderer") {
		return true;
	}

	// Main process
	if (typeof process !== "undefined" && typeof process.versions === "object" && !!process.versions.electron) {
		return true;
	}

	// Detect the user agent when the `nodeIntegration` option is set to true
	if (
		typeof navigator === "object" &&
		typeof navigator.userAgent === "string" &&
		navigator.userAgent.indexOf("Electron") >= 0
	) {
		return true;
	}
	return false;
}

/**
 * Checks if running in NW.js
 * Works for Web Workers and Browser
 * @returns {boolean} True if NW OR Nodejs false if anything else
 */
function isNw() {
	//Catch for nodejs
	if (!isElectron() && checkIsNodeJs()) {
		return true;
	}

	try {
		if (typeof self !== "undefined" && self.__nw_require) {
			return true;
		}
		if (nw !== undefined) {
			if (nw.Window !== undefined) {
				return true;
			}
		}
	} catch (e) {
		return false;
	}

	return false;
}

const ABE = {};

if (typeof global == "undefined" && typeof self !== "undefined") {
	self.global = {}; //Nodejs polyfill
}

ABE.logStyleAndTitle = (type) => {
	const styles = {
		err: "color: #fff; background: #cc0000;",
		info: "color: #fff; background: #399f91;",
		monitor: "color: red; background: #dda756;"
	};
	const titles = {
		default: "INFO"
	};

	const title = titles[type] || type.toUpperCase();
	const style = styles[type] || styles["info"];

	return {style, title};
};

const origWarn = console.warn;

ABE.log = function (type, msg, extra) {
	if (typeof self === "undefined") {
		var self = {_server: "local"};
	}
	extra = extra || "";
	const bgColors = {
		Path: "#a17c15",
		Physics: "#7215a1",
		World: "#151aa1"
	};

	const serverStyle = `color: #fff; background: ${bgColors[self._server]};`;
	const meta = ABE.logStyleAndTitle(type);
	console.groupCollapsed(
		`%c ${meta.title} %c%c SERVER-${self._server} %c ${msg}`,
		meta.style,
		"",
		serverStyle,
		"",
		extra
	);

	const ignoreDepth = 2;

	let stack = new Error().stack;

	if (typeof stack === "undefined") {
		stack = "No stack";
	} else {
		stack = stack.split("\n").splice(ignoreDepth).join("\n");
	}
	origWarn(stack);

	console.groupEnd();
};

ABE.infoLog = (msg, extra) => {
	ABE.log("info", msg, extra);
};

ABE.monitorLog = (msg, extra) => {
	ABE.log("monitor", msg, extra);
};

ABE.errorLog = (msg, extra) => {
	ABE.log("err", msg, extra);
};

if (!isLive()) ;

class Indexer {
	constructor() {
		this.index = {};
		this.index["all"] = {};
	}

	find(id) {
		return this.index["all"][id] || false;
	}

	getAll() {
		return this.index;
	}

	getIndexes(indexes) {
		let hash = {};
		for (let i = 0; i < indexes.length; i++) {
			Object.assign(hash, this.getIndex(indexes[i]));
		}
		return hash;
	}

	getIndex(name) {
		if (this.index[name] == undefined) {
			return {};
		}
		return this.index[name];
	}

	getIndexAsArray(index) {
		return Object.values(this.getIndex(index));
	}

	getIndexesAsArray(indexes) {
		let results = [];
		for (let i = 0; i < indexes.length; i++) {
			results = results.concat(this.getIndexAsArray(indexes[i]));
		}
		return results;
	}

	quickFilterAsArray(objectList, filter, attributes) {
		var list = this.filterObjectsAsArray(objectList, filter);

		var newList = [];

		for (var i = 0; i < list.length; i++) {
			if (typeof attributes === "function") {
				newList.push(attributes(list[i]));
			} else {
				newList.push(list[i]);
			}
		}

		return newList;
	}
	quickFilterAsList(objectList, filter, attributes) {
		var list = this.filterObjectsAsList(objectList, filter);

		var keys = Object.keys(list);

		var newList = {};

		for (var i = 0; i < keys.length; i++) {
			if (typeof attributes === "function") {
				newList[keys[i]] = attributes(list[keys[i]]);
			} else {
				newList[keys[i]] = list[keys[i]];
			}
		}

		return newList;
	}

	//Returns object
	filterObjectsAsList(objectList, filter) {
		var keys = Object.keys(objectList);

		var list = {};

		for (var i = 0; i < keys.length; i++) {
			if (filter(objectList[keys[i]])) {
				list[keys[i]] = objectList[keys[i]];
			}
		}

		return list;
	}

	//Returns array
	filterObjectsAsArray(objectList, filter) {
		var keys = Object.keys(objectList);

		var list = [];

		for (var i = 0; i < keys.length; i++) {
			if (filter(objectList[keys[i]])) {
				list.push(objectList[keys[i]]);
			}
		}

		return list;
	}

	//Returns array of object keys
	filterKeys(objectList, filter) {
		return Object.keys(this.filterObjectsAsList(objectList, filter));
	}

	addToIndexes(indexes, objectToAdd, id) {
		for (var i = 0; i < indexes.length; i++) {
			this.addToIndex(indexes[i], objectToAdd, id);
		}
	}

	getFromIndex(id, name) {
		if (!this.index[name]) {
			return false;
		}
		if (!name) {
			return this.index["all"][id];
		} else {
			return this.index[name][id];
		}
	}

	addToIndex(indexName, objectToAdd, id) {
		if (indexName == "undefined" || typeof indexName == "undefined") {
			return; //Won't add to this.
		}

		if (typeof objectToAdd === "undefined") {
			//We don't allow undefined I guess
			console.error("[ABE] Tried to pass undefined to index: " + indexName + " with ID: " + id);
			return false;
		}

		if (this.index[indexName] == undefined) {
			this.index[indexName] = {};
		}

		if (id == undefined) {
			//Add it to the index with its ID as the property name
			if (!objectToAdd.id) {
				objectToAdd.id = game.randID();
			}
			this.index[indexName][objectToAdd.id] = objectToAdd;
		} else {
			this.index[indexName][id] = objectToAdd;
		}

		//Add a reference internally to the object, to let it know which indexes
		//it belongs to
		if (objectToAdd.indexes == undefined) {
			objectToAdd.indexes = {};
		}
		objectToAdd.indexes[indexName] = true;
		return objectToAdd;
	}

	isInIndex(indexName, check) {
		if (this.index[indexName] === undefined) {
			//Index doesnt exist so obviously doesn't exist inside it
			return false;
		} else {
			if (check.id == undefined) {
				var checkObject = {id: check}; //Use check as key rather than object
			} else {
				var checkObject = check;
			}
			if (this.index[indexName][checkObject.id] === undefined) {
				//Cant be seen so not in the index
				return false;
			} else {
				//Exists in the index as some form of data
				return true;
			}
		}
	}

	indexCount(name) {
		if (this.index[name] == undefined) {
			return 0;
		} else {
			return Object.keys(this.index[name]).length;
		}
	}

	removeFromIndex(indexName, check, destroy) {
		if (destroy === undefined) {
			destroy = false;
		}
		if (this.index[indexName] !== undefined) {
			//Sometimes the index doesn't exist
			let checkObject = check;
			if (checkObject.id == undefined) {
				checkObject = {id: check}; //Use check as key rather than object
			}
			if (this.index[indexName][checkObject.id] !== undefined) {
				//Sometimes the item doesn't exist in the index
				delete this.index[indexName][checkObject.id].indexes[indexName]; //Remove self ref to index.
				if (destroy) {
					this.index[indexName][checkObject.id].destroy();
				}
				delete this.index[indexName][checkObject.id];
			}
		}

		if (this.indexCount(indexName) < 1) {
			this.deleteIndex(indexName);
		}
	}

	deleteIndex(name) {
		delete this.index[name];
	}

	removeFromAllIndexes(check, destroy) {
		if (!check) {
			//Nothing real passed so return
			return;
		}
		if (check.indexes !== undefined) {
			if (Object.keys(check.indexes).length === 0) {
				//No indexes, return 1
				return 1;
			} else {
				for (var index in check.indexes) {
					this.removeFromIndex(index, check, false);
				}
			}
		}
		if (destroy === true) {
			if (typeof check.destroy == "function") {
				check.destroy();
			}
		}
	}

	isIndex(name) {
		return typeof this.index[name] !== "undefined";
	}

	//Note! Does not destroy objects in the index.
	emptyIndex(name) {
		this.index[name] = {};
	}

	modifyAllInIndex(index, modification) {
		index = this.getIndex(index);
		for (let id in index) {
			Object.assign(index[id], modification);
		}
	}
}

const NERF_WEIGHT_AT_VALUE = 0.85;

class Algos {
	static calculateDamageToLife(life, amount, type) {
		if (isNaN(amount)) {
			console.log("[ABE-INFO] No damage amount on hurt?", amount, type);
			amount = 1;
		}

		//If no reduction to this type just use blunt
		if (!life.data.stats[`${type}Reduction`]) type = "blunt";

		return Algos.getDamageReduction(amount, life.data.stats[`${type}Reduction`], life.data.levels.toughness.level);
	}

	static applyStatsToDamage(damage, type, melee, ranged, strength) {
		if (type == "melee" || type == "none") {
			return Algos.applyMeleeDamage(damage, melee, strength);
		}

		if (type == "ranged") {
			return Algos.applyRangedDamage(damage, ranged);
		}
	}

	static applyMeleeDamage(damage, melee, strength) {
		const MELEE_STRENGTH_NERF = 500;
		const MELEE_DAMAGE_MULTIPLIER = 1;
		return damage + melee * MELEE_DAMAGE_MULTIPLIER + strength / MELEE_STRENGTH_NERF;
	}

	static applyRangedDamage(damage, ranged) {
		const RANGED_MANAGE_MULTIPLIER = 0.1;
		return damage + ranged * RANGED_MANAGE_MULTIPLIER;
	}

	static applyAthleticsToSpeed(speed, athletics, isPlayer) {
		const ATHLETICS_BUFF_MULTIPLIER = 0.7;
		const PLAYER_ATHLETICS_BUFF_MULTIPLIER = 2;

		//Apply different athletics buff if player to allow easier escapes.
		let multiplier = isPlayer ? PLAYER_ATHLETICS_BUFF_MULTIPLIER : ATHLETICS_BUFF_MULTIPLIER;
		let onePercent = speed / 1000;

		let speedFraction = onePercent * multiplier;

		return speed + speed * (speedFraction * athletics); //1 speed fraction for each level of athletics
	}

	static getMaxWeight(maxWeight, strength) {
		const WEIGHT_PER_10_STRENGTH = 20;
		const NERF_WEIGHT_DIVIDER = 10;
		return Math.ceil(maxWeight + (strength / NERF_WEIGHT_DIVIDER) * WEIGHT_PER_10_STRENGTH); // 10 weight every 10 levels
	}

	static applyWeightToSpeed(speed, weight, maxWeight) {
		const NERF_WEIGHT_MULTIPLIER = 1.8;
		const NERF_SPEED_DIVIDER = 4;

		let onePercent = speed / 100;
		let multiplier = onePercent * NERF_WEIGHT_MULTIPLIER;

		let nerfWeight = maxWeight * NERF_WEIGHT_AT_VALUE;
		let overweight = nerfWeight - weight;

		if (overweight > 0) {
			return speed; //Underweight, all good
		}

		//Lose 1 percent of speed for every percent over weight
		return Math.max(speed / NERF_SPEED_DIVIDER, speed - multiplier * Math.abs(overweight));
	}

	static isOverweight(weight, maxWeight) {
		let onePercent = maxWeight / 100;

		let nerfWeight = maxWeight * NERF_WEIGHT_AT_VALUE;
		let overweight = nerfWeight - weight;

		if (overweight > 0) {
			return false; //Underweight, all good
		}
		//Lose 1 percent of speed for every percent over weight
		return onePercent * overweight; //Return how much overweight as a percentage
	}

	//Given an toughness value, returns a multiplier to apply to a damage amount to reduce it.
	static getMultiplierToughness(toughness) {
		const TUF_REDUCTION_MULTI = 2; //1 = strong 10 = weakest

		let reducer = TUF_REDUCTION_MULTI * 100;

		let tuf = Math.min(toughness, 100);

		let multi = (reducer - tuf) / reducer;

		return multi;
	}

	//Given an armor value, returns a multiplier to apply to a damage amount to reduce it.
	static getMultiplierArmor(armor) {
		const ARMOR_REDUCTION_MULTI = 1.2; //1 = strong 10 = weakest

		let reducer = ARMOR_REDUCTION_MULTI * 100;

		let armr = Math.min(armor, 100);

		let multi = (reducer - armr) / reducer;

		return multi;
	}

	static getDamageReduction(amount, armor, toughness) {
		/* Armor reduces damage first, then toughness */

		let multi = Algos.getMultiplierArmor(armor);

		amount = amount * multi;

		multi = Algos.getMultiplierToughness(toughness);

		amount = amount * multi;

		return amount;
	}
}

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

class ServerLife {
	constructor(sprite, helper) {
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
		this.data.stats = {
			hp: 100
		};
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
		this.data.targetId = target.id;
		this.helper.lastTargetId = target.id;
		this.targetSetTime = Date.now();
		this.currentTarget = target;
		if (!target.data.targetId) target.data.targetId = this.id; //If you attack me, i'll attack you.
		return 1;
	}

	hasLOS(target) {
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

		if (this.lastSaw[target.id] && this.lastSaw[target.id] < game.ts - 5000) {
			delete this.lastSaw[target.id];
		}

		if (this.lastSaw[target.id]) {
			return true;
		}

		if (this.losRay.includes(target.id)) {
			if (!this.lastSaw[target.id]) {
				this.lastSaw[target.id] = game.ts;
			}

			return true;
		} else {
			return false;
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
		this.states = _AISTATECOLLECTIONS["ais_" + this.data.brain].states.split(",");
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
		var highestWeightState = "";
		for (var i = 0; i < this.states.length; i++) {
			let state = this.states[i];
			let weight = 0;

			try {
				weight = _AISTATES[state].weight.call(this, this);
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

			if (typeof _AISTATES[this.state].start == "function") {
				try {
					//False so change back to idle to let it rerun sometime
					if (_AISTATES[this.state].start.call(this, this) === false) {
						this.state = "aistate_idle";
					}
				} catch (e) {
					console.error(e);
				}
			}
		}
	}

	syncXY(data) {
		console.log("Add x-y", data);
		let x = data.x;
		let y = data.y;
		this.x = x;
		this.y = y;
		if (this.body) {
			this.helper.physics.Body.setPosition(this.body, {
				x: this.x,
				y: this.y
			});
		}
	}

	physicsTick() {
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

		let dist = this.helper.dist(this.body.position, carriedBy.body.position);
		let bounceSpeed = 0.025;

		if (dist < 50) {
			return; //Only move when far
		}

		this.helper.physics.Body.setPosition(this.body, {
			x: this.lerp(this.body.position.x, carriedBy.body.position.x, bounceSpeed),
			y: this.lerp(this.body.position.y, carriedBy.body.position.y, bounceSpeed)
		});

		return true;
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

	xpAction(action, additional) {
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

		this.data.bullet.lifetime || 1;

		this.data.bullet.speed || 2.5;

		let dmg = this.getBulletDmg(this.data.bullet.baseDmg);

		var collision = this.data.bullet.collision || "collision_hurts_1";

		if (!collision) {
			console.error("[ABE] No bullet collision set for: " + this.codename);
		}

		if (this.id == this.helper.world.playerId) {
			this.data.hostile = true;
		}

		if (this.data.stance == "none" || !this.data.bullet || this.data.bullet.sprite == undefined) {
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

	hurt(amount, type, options) {
		if (!options) {
			options = {};
		}

		if (isNaN(amount)) {
			console.log("[ABE-INFO] No damage amount on hurt?", amount, type, this.id, options.creatorId);
			amount = 1;
		}

		const overallDmg = Algos.calculateDamageToLife(this, amount, type);

		if (options.creatorId) {
			this.hurtBy(this.helper.world.index.find(options.creatorId), overallDmg);
		}

		// Ceil to avoid sending too many messages (e.g. 1.33333334, 1.434344)
		// ^False, due to bleed damage being less than 1 per tick :(
		this.data.stats.hp = this.data.stats.hp - overallDmg;

		if (this.data.stats.hp < 0) {
			this.data.stats.hp = 0;
		}

		/*
			IMPORTANT!
			If this doesn't seem to be working, it's when calculateDamageToLife fails (throws)
			We could add trys and stuff but not for now
		*/
		if (this.data.stats.hp < 1 && !this.hasStatus("dead")) {
			this.addStatus("dead");
		}
		this.sync();
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

	heal(amount) {
		//Ceil to avoid sending too many messages (e.g. 1.33333334, 1.434344)
		// ^False doesnt work with <1.0 status ticks
		this.data.stats.hp = this.data.stats.hp + amount;
		if (this.data.stats.hp > this.data.stats.maxHP) this.data.stats.hp = this.data.stats.maxHP;
		this.sync();
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

		//Sync to frontend
		this.data.doDistanceXP = true;
		this.data.distance = this.distance;
		this.sync();
	}

	isWall(x, y) {
		return false;
	}

	checkSquareAhead() {
		//TODO: comment this out to see if it improves NPCs, give back to just player if not
		//Not required if no local move or if not player
		if (!this.helper.world.settings.localmove || !this.data.isPlayer) {
			return; //Just player for now
		}

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
		return !!(this.data["command"] == "jobs" && this.data["do"] && this.data.do !== "pathTo" && this.data.jobId);
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

		this.dir = dir;

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

	couldAssignJob(job) {
		//If failed, assigned, or not for this AI job type (haul etc)

		let isFailed = job.isFailed();
		let notMyKindOfWork = !this.data.jobs.includes(job.data.job);
		let complete = job.data.complete;
		let assigned = job.data.assigned;
		console.log("Could assign? ", job.codename);

		if (isFailed || notMyKindOfWork || complete || assigned) {
			console.log("Nope? ", job.codename, {isFailed, notMyKindOfWork, work: job.data.job, complete, assigned});
			return false;
		}
		//Maybe the job has a job check function
		if (
			job.events &&
			typeof job.events.onJobCheck == "function" &&
			!job.events.onJobCheck.call(job, job, this, this)
		) {
			console.log("Nope fails checko ", job.codename);
			return false;
		}

		return true; //Passed all checks
	}

	getJobs() {
		this.cancelJob(); //Cancel any current job

		console.log("Search jobs");
		this.search = servers.world.findClosest(this, "jobs", (item) => {
			console.log("checko jobo", item);
			return this.couldAssignJob(item);
		});

		if (this.search && this.search.complete && this.search.results.length > 0) {
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
			return !item.isFailed();
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

	toJSON() {
		return {id: this.id};
	}

	//Creates itemList for items with inventory
	indexInventory() {
		if (!this.inventory) {
			return;
		}
		if (!this.inventory.main) {
			return;
		}

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

class ServerItem {
	constructor(sprite, helper) {
		this.cloneToMe(sprite);
		this.id = sprite.id || helper.randID();
		this.x = sprite.x;
		this.y = sprite.y;
		this.width = sprite.width;
		this.height = sprite.height;
		this.lastX = this.x;
		this.lastY = this.y;
		this.helper = helper;
		this.body = {};
		this.hasPath = false;
		this.tileSize = 64;
		this.path = [];
		this.data = sprite.data || {};
		this.meta = sprite.meta || {};
		this.cloneFrom(_BLUEPRINTS.persistent, sprite.codename);
		this.cloneFrom(_BLUEPRINTS.persistent, "pers_" + sprite.codename);
		this.statuses = {};
		this.updates = [];
		this.className = "ServerItem";
		this.touchers = {};
		this.class = sprite.class;
		this.codename = sprite.codename;
		this.lastLOSCheck = 0;
		this.losRay = [];
		this.losCircle = [];
		this.data.stats = {
			hp: 100
		};
		this.attackStartX = false;
		this.attackStartY = false;
		this.inventoryIndex = 0;
		this.itemList = {};
		this.contentsList = [];
		this.inventoryBuffer = {};
		this.extensions = {};
	}

	updateDir() {
		var dir = this.dir || "down";

		let xDist = this.helper.dist({x: this.lastX, y: 0}, {x: this.x, y: 0});
		let yDist = this.helper.dist({x: 0, y: this.lastY}, {x: 0, y: this.y});

		if (xDist > 2 || yDist > 2) {
			if (xDist >= yDist) {
				if (this.lastX > this.x) {
					dir = "left";
				} else {
					dir = "right";
				}
			} else {
				if (this.lastY > this.y) {
					dir = "up";
				} else {
					dir = "down";
				}
			}
		}

		this.dir = dir;

		this.lastX = this.x;
		this.lastY = this.y;
	}

	getRecipe(shortname) {
		let recipe = _BLUEPRINTS.RECIPES["recipe_" + shortname];
		if (!recipe) {
			console.error("[ABE-ERROR] Recipe not found", shortname);
			return false;
		}
		return this.parseRecipe(recipe);
	}

	parseRecipe(recipe) {
		if (recipe.ingredients) {
			return recipe; //Already parsed
		}

		recipe.ingredients = [];

		let requires;
		let amounts;

		try {
			requires = recipe.require.split(",");
			amounts = recipe.amount.split(",");
		} catch (e) {
			console.error("[ABE-ERROR] Provided recipe without correct requires/amounts");
			return;
		}

		for (let i = 0; i < requires.length; i++) {
			recipe.ingredients.push({
				resource: requires[i],
				resource_longname: "ss_item_" + requires[i],
				amount: amounts[i]
			});
		}
		return recipe;
	}

	//Creates itemList for items with inventory
	indexInventory() {
		if (!this.inventory) {
			return;
		}

		//It looks at the inventory and makes a list of it contents easier accessible to developers
		if (this.inventory.length == 0 || this.inventoryIndex > this.inventory.length) {
			this.inventoryIndex = 0;
			this.itemList = this.inventoryBuffer;
			this.contentsList = Object.keys(this.itemList);
			this.inventoryBuffer = {};
			return;
		}

		let item = this.inventory[this.inventoryIndex];
		this.inventoryIndex++;

		if (!item) {
			return;
		}

		if (!this.inventoryBuffer[item.name]) {
			this.inventoryBuffer[item.name] = 0;
		}

		this.inventoryBuffer[item.name] += parseInt(item.data.qty);
	}

	hasResource(resource) {
		return this.itemList[resource];
	}

	getResource(resource) {
		return this.itemList[resource];
	}

	hasResourceQty(resource, amount) {
		if (isNaN(amount)) return false;
		amount = parseInt(amount);
		if (!this.hasResource(resource)) {
			return false;
		}
		return this.itemList[resource] >= amount;
	}

	dieOnWallCheck() {
		if (servers.physics.isBlocked(this.x + 32, this.y + 32)) {
			//Must have atleast existed for some amount of time
			if (this.data.created < game.ts - 100) {
				this.removePhysics = true; //Destroy self
			}
		}
	}

	failed(reason) {
		console.log("[ABE-INFO] Failed a server items job", reason, this);
		this._failed = true;

		if (this.data.assigned) {
			let life = this.helper.world.index.getFromIndex(this.data.assigned, "all");
			if (!life) {
				this.data.assigned = false;
			}
			if (life && life.data.jobId !== this.id) {
				//Worked for this job moved on like a lame-o
				this.data.assigned = false;
			}
		}
	}

	isFailed() {
		if (this._failed || this.data.failedOnce) {
			this._failed = false;
			this.data.failedOnce = false;
			return true; //True if failed, but also unset the failed so someone else can try
		}

		if (this.data.assigned) {
			let life = this.helper.world.index.getFromIndex(this.data.assigned, "all");
			if (!life) {
				this.data.assigned = false;
			}
			if (life && life.data.jobId !== this.id) {
				//Worked for this job moved on like a lame-o
				this.data.assigned = false;
			}
		}

		return false; //False if not failed
	}

	//TODO: maybe move.. copied from game.clone
	clone(obj) {
		if (null === obj || "object" != typeof obj) {
			return obj;
		}
		var copy = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				copy[attr] = obj[attr];
			}
		}
		return copy;
	}

	//TODO: maybe move.. copied from game.clone
	cloneToMe(obj) {
		if (null === obj || "object" != typeof obj) {
			return obj;
		}
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				this[attr] = obj[attr];
			}
		}
	}

	cloneFrom(src, name) {
		if (!src[name]) {
			return false; //Nothing to clone
		}
		this.events = this.clone(src[name].events);
		/*this.data = Object.assign(this.data,this.clone(src[name].data));
        this.meta = this.clone(src[name].meta);
        this.readName = src[name].readName;
        this.sprite = src[name].sprite;
        this.destroyBase = src[name].destroyBase;
        if(src[name].spriteData) {
            this.width = src[name].spriteData.w / 0.5;
            this.height = src[name].spriteData.h / 0.5;
        }*/
	}

	canSee(targetId) {
		this.helper.physicsUpdate("getLOS", {srcId: this.id, destId: targetId});
	}

	initPhysics() {}

	sync(force) {
		this.helper.world.sync(this, force);
	}

	hasLOS(target) {
		if (this.lastLOSCheck < Date.now() - 1000) {
			this.lastLOSCheck = Date.now();
			this.losProjectile = {x: this.x, y: this.y, id: this.id + "projectile"};
			this.helper.physicsUpdate("hitscan", {
				id: this.id,
				projectile: this.losProjectile,
				x: this.x - 16,
				y: this.y,
				endX: target.x - 16,
				endY: target.y
			});
		}

		if (this.losRay.includes("wall")) {
			return false;
		} else {
			return true;
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
		this.states = _AISTATECOLLECTIONS["ais_" + this.data.brain].states.split(",");
	}

	getNextState() {
		if (this.states.length === 1) {
			//Dummy NPC so stupid
			return false;
		}
		var lastState = this.state;
		var highestWeight = 0;
		var highestWeightState = "";
		for (var i = 0; i < this.states.length; i++) {
			var state = this.states[i];
			var weight = _AISTATES[state].weight(this);
			if (weight > highestWeight) {
				highestWeight = weight;
				highestWeightState = state;
			}
		}

		this.state = highestWeightState;

		if (highestWeightState !== lastState) {
			_AISTATES[lastState].end(this);
			_AISTATES[this.state].start(this);
		}
	}

	takeDamage(value) {
		this.hasUpdates = true;
		this.updates.push({updateStat: {hp: -10}});
	}

	processUpdates(updates) {
		for (let i = 0; i < updates.length; i++) {
			this.processServerUpdate(updates[i]);
		}
	}

	processServerUpdate(update) {
		if (update.type == "addStatus") {
			this.addAndStartStatus(update.data.status, update.data.options);
			return true;
		}
		if (update.type == "losRay") {
			this.losRay = update.losRay;
		}
	}

	addStatus(status, options) {
		if (options == undefined) {
			options = {};
		}

		this.addAndStartStatus(status, options);

		//Send updates from physics back to the rest
		this.updates.push({type: "addStatus", data: {status: status, options: options}});
	}

	dist(target) {
		return this.helper.dist(target, this);
	}

	syncStat(stat) {
		console.log(this.codename + " asked to Sync: " + stat);
	}

	addAndStartStatus(status, options) {
		//Doesn't exist server side so don't add it.
		if (!_STATUSES["s_effect_" + status]) {
			console.error("No effect: " + "s_effect_" + status);
			return false;
		}
		var id = this.helper.randID("status");
		var status = {effect: _STATUSES["s_effect_" + status], options: options};
		status.startTime = Date.now();
		status.effect.start(this, options);

		if (options.duration === undefined) {
			//If no duration, execute now.
			if (typeof status.effect.tick == "function") {
				status.effect.tick(this, options); //Init tick just incase it's used.
			}
			if (typeof status.effect.end == "function") {
				status.effect.end(this, options);
			}
		} else {
			//TODO: none-instant isn't implemented yet coz its 2:14am
			//Used duration so add it
			this.statuses[id] = status;
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

	findResource(resource) {
		return this.helper.world.findResource(this, resource);
	}

	destroy() {
		//ADD DESTROY FUNCTION
		this.helper.world.removeFromServerAndClient(this.id);
	}

	cleanupDropoffJob() {
		let dropOffJob = this.helper.world.index.getFromIndex(this.dropOffJobSourceId, "all");
		if (dropOffJob) {
			dropOffJob.destroy();
			this.dropOffJobSourceId = false;
		}
	}

	cleanupHaulJob() {
		let haulJob = this.helper.world.index.getFromIndex(this.haulJobSourceId, "all");
		if (haulJob) {
			haulJob.destroy();
			this.haulJobSourceId = false;
			return;
		}
	}

	cleanupCraftingJob() {
		let craftingJob = this.helper.world.index.getFromIndex(this.craftJobSourceId, "all");
		if (craftingJob) {
			craftingJob.destroy();
			this.craftJobSourceId = false;
			return;
		}
	}

	cleanupIngredientOrphans() {
		this.cleanupDropoffJob();
		this.cleanupHaulJob();
	}

	getNeededIngredient() {
		let craftItem = this.data.queue[0];
		let recipe = this.getRecipe(craftItem.recipe);

		for (let i = 0; i < recipe.ingredients.length; i++) {
			let ingredient = recipe.ingredients[i];
			if (!this.hasResourceQty(ingredient.resource_longname, ingredient.amount)) {
				return ingredient;
			}
		}

		this.cleanupIngredientOrphans(); //Remove any jobs from this

		return false;
	}

	findIngredients() {
		//Breaks the code?
		//this.cleanupCraftingJob(); // If any craft jobs active delete them

		let craftItem = this.data.queue[0];
		let recipe = this.getRecipe(craftItem.recipe);

		for (let i = 0; i < recipe.ingredients.length; i++) {
			let ingredient = recipe.ingredients[i];
			if (!this.hasResourceQty(ingredient.resource_longname, ingredient.amount)) {
				this.spawnDropoffHelper(ingredient);
			}
		}

		//this.spawnHaulingHelper() //TODO: this is the broken bit?
	}

	hasValidHaulingHelper() {
		const HAUL_TIMEOUT = 100000;
		if (this.haulJobSourceId) {
			let haulJob = this.helper.world.index.getFromIndex(this.haulJobSourceId, "all");
			if (!haulJob) {
				//Container probably changed quantity and no longer valid
				this.haulJobSourceId = false;
				return false;
			}

			if (haulJob.data.job === "dropoff" && haulJob.data.createdTime < game.ts - HAUL_TIMEOUT) {
				this.haulJobSourceId = false;
				console.error("[ABE-INFO] Remake haul job");
				haulJob.destroy();
			}
		}
		return this.haulJobSourceId;
	}

	spawnHaulingHelper(ingredient) {
		if (this.hasValidHaulingHelper()) return; //Already got an okay helper

		//THIS IS THE PART FAILING
		//THIS IS THE PART FAILING needIngredient.resource returns false
		//THIS IS THE PART FAILING
		let storageId = this.findResource(ingredient.resource);

		if (!storageId) {
			console.log("Search storage not fond", ingredient.resource, ingredient);
			return;
		}

		let storageContainer = this.helper.world.index.getFromIndex(storageId, "playerstorage");
		if (!storageContainer) {
			console.error("[ABE-ERROR] Storage container not found");
			return;
		}

		//Already has a source
		let newId = this.id + "-job-haul";

		this.haulJobSourceId = newId;

		this.helper.world.addObjectFromServer({
			id: newId,
			class: "ComplexItem",
			codename: "pers_haul_helper",
			x: storageContainer.x,
			y: storageContainer.y,
			width: storageContainer.width,
			height: storageContainer.height,
			data: {
				resource: ingredient.resource,
				qty: ingredient.amount,
				sourceId: storageContainer.id,
				parentId: this.id
			}
		});

		return;
	}

	spawnDropoffHelper(ingredient) {
		let newId = this.id + "-job-dropoff-" + ingredient.resource;

		let dropOffJob = this.helper.world.index.getFromIndex(newId, "all");
		if (dropOffJob) return; //Job already exists

		const myQty = this.getResource(ingredient.resource_longname);

		let needQty = ingredient.amount;

		//I already have some so reduce the amount needed
		if (myQty < needQty) {
			needQty = needQty - myQty;
		}

		console.log("I neeeeed ", needQty, ingredient.resource);

		this.dropOffJobSourceId = newId;
		this.helper.world.addObjectFromServer({
			id: newId,
			class: "ComplexItem",
			codename: "pers_dropoff_helper",
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			data: {
				resource: ingredient.resource,
				qty: ingredient.amount,
				parentId: this.id
			}
		});
	}

	shouldJobCheck() {
		//Adding a little RNG to try offset job checks
		//Every 500-1500 ms
		const JOB_REFRESH_INTERVAL = 500 + game.rng(0, 1000);

		if (this.lastJobCheck && this.lastJobCheck > game.ts - JOB_REFRESH_INTERVAL) {
			return false;
		}

		this.lastJobCheck = game.ts;
		return true;
	}

	spawnCraftHelper(craftItem) {
		//Already exists, check if still valid
		if (this.craftJobSourceId) {
			let craftJob = this.helper.world.index.getFromIndex(this.craftJobSourceId, "all");
			if (craftJob) return;
		}

		//No ingredients needed
		//AND no craft job ID set
		//This assumes we can craft given a queue item exists and no recipe required
		let newId = this.id + "-job-craft";
		this.craftJobSourceId = newId;
		this.helper.world.addObjectFromServer({
			id: newId,
			class: "ComplexItem",
			codename: "pers_craft_helper",
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			data: {
				parentId: this.id,
				craftItem: craftItem
			}
		});
	}

	craftQueueCount() {
		return this.data.queue.length;
	}

	hauls() {
		if (!this.shouldJobCheck()) return; // Reduce checks

		//TODO: in future for just "generic storage" this will need changing i guess?
		if (!this.craftQueueCount()) return; // Nothing to craft anyways

		if (this.getNeededIngredient()) return this.findIngredients();

		return this.spawnCraftHelper(this.data.queue[0]); //Must have something to craft
	}

	addExtension(name, options) {
		var key = name + "-" + this.helper.randID();

		this.extensions[key] = {key: key, name: name, options: options};
	}

	loadExtensions() {
		var extensions = Object.keys(this.extensions);
		if (extensions.length == 0) {
			return false;
		}
		for (var i = 0; i < extensions.length; i++) {
			this.loadExtension(this.extensions[extensions[i]]);
		}
	}

	loadExtension(extensionData) {
		if (!_BLUEPRINTS.EXTENSIONS) {
			console.error("[ABE] No extensions in system");
			return false;
		}

		if (!_BLUEPRINTS.EXTENSIONS[extensionData.name]) {
			console.error("[ABE] Can't find extension: " + extensionData.name);
			return false;
		}

		var extensionMeta = _BLUEPRINTS.EXTENSIONS[extensionData.name];

		if (typeof extensionMeta.events.onCreate === "function") {
			extensionMeta.events.onCreate.call(this, this, extensionData.options, this.saveData);
		}
	}

	toJSON() {
		return {
			id: this.id,
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			data: this.data,
			meta: this.meta,
			class: this.class,
			codename: this.codename
		};
	}
}

class ServerWorld {
	constructor(emit) {
		this.ts = new Date().getTime();
		this.emit = emit; //function to push event from server
		//console.log("World started");
		this.lastTime = new Date().getTime();
		this.delta = 0;
		this.c = 0;
		this.helper = new ServerHelper(emit);
		this.id = this.helper.randID();
		this.helper.world = this;
		this.allObjects = {};
		this.pressedKeys = {};
		this.playerId = false;
		this.index = new Indexer();
		this.watching = {};
		this.searchers = {};
		this.searchCount = 0;
		this.regionSkipClasses = ["Projectile"]; //Skip adding these to chunks
		this.NPCsblock = {};
		this.settings = {};
	}

	start() {
		ABE.infoLog("Start world");
	}

	reset() {
		ABE.infoLog("Reset world");
	}

	pause() {
		ABE.infoLog("[ABE] Pause");
	}
	resume() {
		ABE.infoLog("[ABE] Unpause");
		servers.physics.resume();
	}

	resetSearchCount() {
		this.searchCount = 0;
	}

	getSearch(searcher) {
		return this.searchers[searcher];
	}

	searchItem(searcher, index, query) {
		if (typeof searcher == "object") {
			searcher = search.id;
		}

		return this.startSearch(searcher, index, query);
	}

	callItemFunc(data) {
		let options = data.data;
		let item = this.index.getFromIndex(options.itemId, "all");
		if (!item) {
			ABE.errorLog("[ABE] Can't find item in index", options.itemId);
			return;
		}
		if (typeof item[options.func] !== "function") {
			ABE.errorLog("[ABE] Can't find function on item" + item.codename + options.func);
			return;
		}
		try {
			item[options.func].call(item, options.data);
		} catch (e) {
			ABE.errorLog("[ABE] Failed to run " + options.func + " on " + item.codename);
			console.error(e);
		}
	}

	//It's sync..
	findClosest(searcher, index, query) {
		if (typeof searcher.x !== "number") {
			ABE.errorLog("[ABE] Cannot findCloset with no .x");
			return false;
		}

		this.searchCount++;

		if (this.searchCount > 10) {
			ABE.errorLog("[ABE] Many searches on this tick: " + this.searchCount);
			return false;
		}

		this.searchers[searcher.id] = {
			startTime: Date.now(),
			result: false,
			index: index,
			searcher: searcher,
			query: query
		};

		let results = [];
		Object.entries(this.index.getIndex(index)).every(([key, item]) => {
			if (query(item, searcher)) {
				item.dist = this.helper.dist(searcher, item);
				if (results[0] && results[0].dist > item.dist) {
					//This item is closer
					results.unshift(item);
				} else {
					results.push(item);
				}
				if (item.dist < 500) ;
			}
			return true;
		});

		this.searchers[searcher.id].complete = true;
		this.searchers[searcher.id].results = results;
		return this.searchers[searcher.id];
	}

	startSearch(searcher, index, query) {
		this.searchCount++;
		if (this.searchCount > 10) {
			ABE.errorLog("[ABE] Many searches on this tick: " + this.searchCount);
			return false;
		}

		this.searchers[searcher] = {result: false, index: index, searcher: searcher, query: query};
		this.searchers[searcher].complete = true;
		this.searchers[searcher].result = Object.entries(this.index.getIndex(index)).find(query) || false;

		return this.searchers[searcher];

		/*
        When using this function, if complete == true and result == false, assume the item just cannot be found.
        */
	}

	isSearching(searcher) {
		if (typeof searcher == "object") {
			searcher = search.id;
		}
	}

	setWatching(data) {
		this.watchingId = data.data.id;
		this.watching = this.index.getFromIndex(this.watchingId, "all");

		ABE.infoLog(this.watching);
		ABE.infoLog(this.watching.state);
	}

	getObject(id) {
		return this.index.getFromIndex(id, "all");
	}

	load() {
		//Load level data
		//console.log("Load level data");
		//Start ticker for physics
		this.helper.physicsUpdate("startPhysics");

		//Start ticker for world
		this.helper.worldUpdate("startWorld");
	}

	doTick(data) {
		this.reduceDebug("tick");
		if (!servers.physics.runner.enabled) {
			servers.physics.runner.enabled = true;
			setTimeout(() => {
				this.tickRunner();
			}, 1000);
		}
	}

	tickRunner() {
		Matter.Runner.tick(servers.physics.runner, servers.physics.physEngine); //This doesnt tick it actually turns it on
		//setTimeout(() => {
		//	this.tickRunner();
		//}, 10);
	}

	setPlayerId(data) {
		this.playerId = data.data.id;
	}

	getPlayer() {
		return this.index.getFromIndex(this.playerId, "life");
	}

	//D: 68
	//A: 65
	//W: 87
	//S: 83
	//R: 82
	keydown(data) {
		this.pressedKeys[data.data.code] = true;
		//console.log("Playerid"+this.playerId)

		this.keyUpdate();
	}

	keyup(data) {
		this.pressedKeys[data.data.code] = false;
		this.keyUpdate();
	}

	keyUpdate() {
		if (this.pressedKeys[16]) ;

		if (this.pressedKeys[68]) ;
		if (this.pressedKeys[65]) ;
		if (this.pressedKeys[87]) ;
		if (this.pressedKeys[83]) ;

		//this.helper.physicsUpdate('setVelocity', { id: this.playerId, x: x * speedMulti, y: y * speedMulti });
	}

	setTimestamp(data) {
		this.ts = data.data.timestamp;
		ABE.infoLog("set ts", this.ts);
	}

	playerJoin(data) {
		//this.sendObjectsToPlayer(data);
		//this.addObjectToWorld({y:400, x:500});
		//this.addObjectToWorld({x:500});
	}

	sendObjectsToPlayer(data) {
		//console.error("Sending updates to player");
		for (var itemId in this.allObjects) {
			var item = this.allObjects[itemId];
			this.helper.clientUpdate(data.socketId, item.id, "game", "addFromServer", item);
		}
	}

	handleObjectMeta(item) {
		if (item.meta == undefined) {
			return false;
		}

		this.updateRegion(item);

		if (item.meta.physicsType !== undefined) {
			//console.log("Sending to physics server");
			this.helper.physicsUpdate("addObject", JSON.parse(JSON.stringify(item)));
		}

		if (item.meta.blockZone !== undefined) {
			//console.log("Sending to path server "+item.codename);
			this.helper.pathUpdate("addObject", JSON.parse(JSON.stringify(item)));
		}
	}

	handleObjectData(item, type) {
		//TODO: nothing uses this yet
	}

	updateObject(options) {
		let item = options.data;
		let serverItem = this.index.find(item.id);

		if (!serverItem) {
			ABE.errorLog(
				"[ABE] Tried to update object in world that hasn't been added. Maybe meta/physicsType not set etc"
			);
			console.error("Server", serverItem, "Passed", item);
			return;
		}

		if (item.data.syncXY) {
			serverItem.x = item.x;
			serverItem.y = item.y;
			serverItem.path = [];
			serverItem.data.path = [];
		}

		//TODO: need some form of toggle or better handling for this
		if (serverItem.data.job == "haul") {
			//TODO: consider... If it were a physics item, this would eventualy
			// be overwritten
			serverItem.x = item.x;
			serverItem.y = item.y;
		}

		serverItem.inventory = item.data.inventory;

		delete item.data.inventory;

		Object.assign(serverItem.data, item.data);
		serverItem.meta = item.meta ? item.meta : serverItem.meta;

		try {
			this.updateRegion(serverItem);
			this.handleObjectData(serverItem);
			this.handleObjectMeta(serverItem);
		} catch (e) {
			ABE.errorLog(e);
		}

		if (typeof serverItem.updated == "function") {
			serverItem.updated();
		}

		this.index.addToIndex("objects", serverItem);

		this.helper.physicsUpdate("updateObject", item);

		item.data.syncXY = false;

		serverItem.last = JSON.stringify(serverItem.data); //Update last sync
	}

	debugListJobs() {
		console.log(this.index.getIndex("jobs"));
	}

	pause() {
		ABE.infoLog("[ABE-World] Pause");
		this.helper.physics.runner.enabled = false;
		ABE.monitorLog("WARNING CONSOLE COMMANDS MAY BE DISABLED (console.log, console.error)");
	}

	updateStateInfo(options) {
		let updated = false;
		if (options.data.mouse) {
			this.mouse = options.data.mouse;
			updated = true;
		}
		if (options.data.settings) {
			this.settings = options.data.settings;
			updated = true;
		}
		if (updated) {
			this.helper.physicsUpdate("mouseInfo", this.mouse);
		}
	}

	addObjectToServer(options) {
		var item = new ServerItem(options.data, this.helper);

		try {
			this.handleObjectMeta(item);
			this.handleObjectData(item);
		} catch (e) {
			ABE.errorLog(e);
		}

		if (!item.meta || !item.meta.physicsType) {
			return; //Only need to track those with a physics type
		}

		this.index.addToIndexes(["all", "objects", item.codename], item);

		if (item.events && item.events.onServerCreate) {
			item.events.onServerCreate.call(item, item);
			item.loadExtensions(); //Load any extensions now that it's loaded
		}
	}

	addToIndex(options) {
		var id = options.data.id;
		var index = options.data.index;
		var item = this.index.getFromIndex(id, "all");
		this.index.addToIndex(index, item);
	}

	addToIndexNewId(options) {
		var id = options.data.id;
		var index = options.data.index;
		var newid = options.data.newid;
		var item = this.index.getFromIndex(id, "all");
		if (!item) {
			ABE.errorLog("[ABE-ERROR] Can't add to index, not found on serverworld: ", item);
		}
		this.index.addToIndex(index, item, newid);
	}

	removeFromServerAndClient(id) {
		servers.world.helper.execClientObjectFunction(id, `markDelete`);
	}

	removedFromClient(options) {
		this.index.removeFromAllIndexes(this.index.getFromIndex(options.data.id, "all"));
	}

	addObjectFromServer(options) {
		if (options == undefined) {
			options = {};
		}
		options = new ServerItem(options, this.helper);
		options.sprite = options.sprite || "wi_oil_barrel";
		options.id = options.id || this.helper.randID();
		options.x = options.x || 600;
		options.y = options.y || 500;
		options.width = options.width || 64;
		options.height = options.height || 64;
		options.alpha = options.alpha || 1;
		//this.allObjects[options.id] = options;
		//Add to physics world

		try {
			this.handleObjectMeta(options);
			this.handleObjectData(options);
		} catch (e) {
			ABE.errorLog(e);
		}

		this.index.addToIndexes(["all", "objects"], options);

		this.helper.broadcastUpdate("world", "addFromServer", JSON.parse(JSON.stringify(options)));
	}

	updateRegion(item) {
		if (this.regionSkipClasses.includes(item.class)) {
			return; //Don't add items in the skip array.
		}

		let region = this.helper.getRegion(item);
		var regionName = "region_" + region.x + "_" + region.y;

		if (item.regionName) {
			//Already in a chunk
			if (item.regionName == regionName) {
				return; //Don't need to run because still in the same chunk
			}
			//Remove from existing chunk
			let regionIndex = this.index.getFromIndex("index", item.regionName);
			regionIndex.removeFromAllIndexes(item);
		}

		item.regionName = regionName;

		if (!this.index.isIndex(regionName)) {
			//Region doesn't exist
			//Create it by adding an index to it.
			this.index.addToIndex(regionName, new Indexer(), "index");
		}

		let regionIndex = this.index.getFromIndex("index", regionName);

		regionIndex.addToIndexes(["all", item.codename], item);
	}

	emit(name, options) {
		this.helper.broadcastUpdate("world", "emit", {name: name, options: options});
	}

	addStatusToObject(options) {
		var data = options.data;
		var life = this.index.find(data.id);
		if (!life) {
			ABE.errorLog("[ABE] Cannot find so can't add " + data.status + " status to: " + data.id, options);
			return false;
		}
		life.addStatusFromClient(data.status, data.options, data.startTime);
	}

	addStatusToObjectFromServer(options) {
		var data = options.data;
		var life = this.index.find(data.id);
		if (!life) {
			ABE.errorLog("[ABE] Cannot find so can't add " + data.status + " status to: " + data.id, options);
			return false;
		}
		life.addStatus(data.status, data.options, data.startTime);
	}

	addObjectToClientWorld(options) {
		if (options == undefined) {
			options = {};
		}
		options.sprite = options.sprite || "wi_oil_barrel";
		options.id = options.id || this.helper.randID();
		options.x = options.x || 600;
		options.y = options.y || 500;
		options.blocking = options.blocking || false;
		options.physicsType = options.physicsType || false;
		options.width = options.width || 64;
		options.height = options.height || 64;
		options.alpha = options.alpha || 1;
		//this.allObjects[options.id] = options;
		//Add to physics world
		this.handleObjectMeta(options);
		this.helper.broadcastUpdate("world", "addFromServer", options);
		this.emit({
			creatorId: options.id,
			serverside: true,
			server: "physics",
			action: "addObject",
			data: {
				id: options.id,
				x: options.x,
				y: options.y,
				width: options.width,
				height: options.height
			}
		});
	}

	counter = 0;
	reduceDebug(msg) {
		if (this.dbgCounter == undefined || this.dbgCounter > 1000) {
			//console.log(msg);
			this.dbgCounter = 0;
		}
		this.dbgCounter++;
	}
	reduce(exec) {
		if (this.reduceCounter == undefined || this.reduceCounter > 100) {
			this.counter++;
			//console.log(this.counter);
			this[exec]();
			this.reduceCounter = 0;
		}
		this.reduceCounter++;
	}

	/*
    tick(postback) {

        var currentTime = (new Date()).getTime();
        this.delta = (currentTime - this.lastTime) / 1000;
        
        this.reduceDebug("World tick..."+this.delta);
        this.lastTime = currentTime;
    }
    */

	rng(min, max) {
		return Math.floor(min + Math.random() * (max + 1 - min));
	}

	random() {
		//console.log("Add random item");
		this.addObjectToClientWorld({x: this.rng(0, 100)});
	}

	addLifeObject(data) {
		try {
			var life = new ServerLife(data.data, this.helper, this);
			this.index.addToIndexes(["all", "life"], life);
			life.initWorld();
		} catch (e) {
			console.error(e);
		}
	}

	//Path was sent by ServerPath
	receivePath(data) {
		var pathData = data.data;
		var life = this.index.getFromIndex(pathData.id, "life");
		if (!life) {
			ABE.monitorLog(`${pathData.id} in life cannot be found`);
		}
		life.hasPath = true;
		life.rawPath = pathData;
		life.path = pathData.path;
		life.searching = false;
	}

	receivePhysics(data) {
		var physUpdates = data.data;
		for (let i = 0; i < physUpdates.length; i++) {
			var update = physUpdates[i];

			if (update.removePhysics) {
				//Removing physics do nothing
				//TODO: maybe something else in future
				continue;
			}

			var updateObject = this.index.getFromIndex(update.id, "all");
			if (updateObject == undefined) {
				//console.error("Received undfiend");
				continue;
			}

			if (update.updates.length > 0) {
				updateObject.processUpdates(update.updates);
			}

			if (typeof update.x !== "number") {
				ABE.errorLog("Failed update: " + update.x, update);
				return;
			}

			if (typeof update.y !== "number") {
				ABE.errorLog("Failed update: " + update.y, update);
				return;
			}

			this.updateRegion(updateObject); //Sice it moved, the region might have changed

			updateObject.x = update.x;
			updateObject.y = update.y;
			updateObject.data.dir = update.dir || updateObject.data.dir;
		}
	}

	toJSON() {
		return {
			id: this.id
		};
	}

	findResource(destination, resource) {
		destination.search = this.findClosest(destination, "playerstorage", (item, searcher) => {
			ABE.infoLog("Storage", item);
			return !item.isFailed() && item.contentsList.includes("ss_item_" + resource);
		});

		if (destination.search && destination.search.complete && destination.search.results.length > 0) {
			destination.data.haulId = destination.search.results[0].id;
			destination.sync();
			return destination.data.haulId;
		}

		destination.data.haulId = false;

		return false;
	}

	update(postback) {
		this.resetSearchCount(); //Reset searches to 0 so we can count how many occur each tick.
		this.processLife(postback);
		this.processObjects(postback);
		this.processItems(postback);
		this.updateDrawMatrix();
	}

	updateDrawMatrix(options) {
		if (!this.settings.localmove) {
			return; //Disabled
		}

		let force = false;

		if (options && options.data && options.data.force) {
			force = true;
		}

		const REFRESH_INTERVAL = 60;
		if (!this.lastDrawCheck) {
			this.lastDrawCheck = this.ts - REFRESH_INTERVAL * 1000;
		}
		if (!force && this.lastDrawCheck > this.ts - REFRESH_INTERVAL * 1000) {
			return; //Only every 1000 frames
		}

		this.lastDrawCheck = this.ts;
		this.helper.pathUpdate("requestDrawMatrix", {});
	}

	isWall(x, y) {
		if (!this.drawMatrix) {
			return false;
		}
		return this.drawMatrix[y] && this.drawMatrix[y][x]; //It's a wall if set or true if can't be found
	}

	receiveDrawMatrix(options) {
		this.drawMatrix = options.data.drawMatrix;
	}

	sync(item, force) {
		if (force) {
			item.nextSync = false;
		}
		this.index.addToIndex("sync", item);
	}

	processObjects(postback) {
		//First sync timestamp
		this.helper.physicsUpdate("setTimestamp", {timestamp: game.ts});

		//Objects will come from the sync index, then the sync index will be deleted

		var items = this.index.getIndex("sync");

		var physData = [];
		let date = Date.now();
		for (var itemId in items) {
			var item = items[itemId];
			if (item == undefined) {
				ABE.errorLog("[ABE] Tried to process none-existent item. Index: " + i);
				continue;
			}
			if (item.nextSync && item.nextSync > date) {
				continue; //Skip, sync later.
			}

			item.nextSync = Date.now() + 10;
			this.index.removeFromIndex("sync", item);

			let serial = JSON.stringify(item.data);

			if (item.last !== serial) {
				physData.push({
					updates: [{type: "changeData", data: item.data, id: itemId}],
					id: itemId
				});
				//TODO: is this a dupe? is it heavy?
				this.helper.physicsUpdate("setData", {id: itemId, data: item.data});
			}
			item.last = serial;
		}

		if (physData.length > 0) {
			postback({action: "physUpdate", creatorId: "server", response: physData});
		}
	}

	dump() {
		console.error("~~~~~WORLD DUMP~~~~~");
		console.error(this.index.getAll());
		console.error("~~~~~END WORLD DUMP~~~~~");
	}

	processLife(postback) {
		var lives = this.index.getIndex("life");
		var bulk = {
			setVelocity: [],
			pathUpdate: []
		};
		var physData = [];
		let count = Object.keys(lives).length;
		if (!this.lastCount) {
			this.lastCount = count;
		}
		if (this.lastCount !== count) {
			this.lastCount = count;
		}
		for (var lifeId in lives) {
			var life = lives[lifeId];
			if (life == undefined) {
				ABE.errorLog("[ABE] Tried to process none-existent life. Index: " + i);
				continue;
			}
			life.indexInventory();
			life.worldTick(bulk);
			if (life.updates.length > 0) {
				var physObject = life;
				physData.push({updates: physObject.updates, id: physObject.id});
				physObject.updates = [];
			}
		}

		if (physData.length > 0) {
			postback({action: "physUpdate", creatorId: "server", response: physData});
		}

		if (bulk.setVelocity.length > 0) {
			this.helper.physicsUpdate("bulkSetVelocity", bulk.setVelocity);
		}
		if (bulk.pathUpdate.length > 0) {
			this.helper.pathUpdate("bulkPathUpdate", bulk.pathUpdate);
		}
	}

	processItems(postback) {
		var items = this.index.getIndexes(["ticker", "playerstorage"]);
		var physData = [];
		let count = Object.keys(items).length;
		if (!this.lastCount) {
			this.lastCount = count;
		}
		if (this.lastCount !== count) {
			this.lastCount = count;
		}
		for (var itemId in items) {
			var item = items[itemId];
			if (item == undefined) {
				ABE.errorLog("[ABE] Tried to process none-existent item. Index: " + i);
				continue;
			}

			item.indexInventory();

			if (item.events && typeof item.events.onWorldTick == "function") {
				try {
					item.events.onWorldTick.call(item, item);
				} catch (e) {
					//TODO: remove item from physics? remove function? no idea
					ABE.errorLog("[ABE] Error inside onPhysicTick " + item.codename);
					console.error(e);
					continue;
				}
			}
		}

		if (physData.length > 0) {
			postback({action: "physUpdate", creatorId: "server", response: physData});
		}
	}

	updatePositions() {}

	updateLifeXY(data) {
		var lifeData = data;
		var life = this.life[lifeId];
		life.x = lifeData.x;
		life.y = lifeData.y;
	}

	tick(postback, engineEvent) {
		//this.reduce('processLife');
		var timestep = 1000 / 60;
		var currentTime = new Date().getTime();
		this.delta += currentTime - this.lastTime;

		var numUpdateSteps = 0;
		//while(this.delta >= timestep) {
		if (++numUpdateSteps >= 120) {
			//If the simulation steps last too long, just delta into 0 and snap all items into place.
			this.delta = 0;
		}
		this.c++;
		this.delta / timestep;
		//DO UPDATE HERE
		this.update(postback);
		//this.update(postback, interp);
		//END UPDATE
		this.delta -= timestep;
		// }
		this.helper.measure(this);
		//consolerror("Tick delay: "+(currentTime - this.lastTime)+"ms");
		this.lastTime = currentTime;
		this.ts += 16;
		game.ts = this.ts;
	}
}

/*!
 * @license
 * The MIT License (MIT)
 *
 * Copyright (c) 2012-2020 Bryce Neal
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
const EasyStar = (function (e) {
	var o = {};
	function i(t) {
		var n;
		return (
			o[t] ||
			((n = o[t] = {i: t, l: !1, exports: {}}),
			e[t].call(n.exports, n, n.exports, i),
			(n.l = !0),
			n)
		).exports;
	}
	return (
		(i.m = e),
		(i.c = o),
		(i.d = function (t, n, e) {
			i.o(t, n) || Object.defineProperty(t, n, {enumerable: !0, get: e});
		}),
		(i.r = function (t) {
			"undefined" != typeof Symbol &&
				Symbol.toStringTag &&
				Object.defineProperty(t, Symbol.toStringTag, {value: "Module"}),
				Object.defineProperty(t, "__esModule", {value: !0});
		}),
		(i.t = function (n, t) {
			if ((1 & t && (n = i(n)), 8 & t)) return n;
			if (4 & t && "object" == typeof n && n && n.__esModule) return n;
			var e = Object.create(null);
			if (
				(i.r(e),
				Object.defineProperty(e, "default", {enumerable: !0, value: n}),
				2 & t && "string" != typeof n)
			)
				for (var o in n)
					i.d(
						e,
						o,
						function (t) {
							return n[t];
						}.bind(null, o)
					);
			return e;
		}),
		(i.n = function (t) {
			var n =
				t && t.__esModule
					? function () {
							return t.default;
					  }
					: function () {
							return t;
					  };
			return i.d(n, "a", n), n;
		}),
		(i.o = function (t, n) {
			return Object.prototype.hasOwnProperty.call(t, n);
		}),
		(i.p = "/bin/"),
		i((i.s = 0))
	);
})([
	function (t, n, e) {
		var w = {},
			A = e(1),
			E = e(2),
			_ = e(3);
		t.exports = w;
		var L = 1;
		(w.js = function () {
			var p,
				r,
				h,
				s = 1.4,
				d = !1,
				u = {},
				i = {},
				o = {},
				l = {},
				a = !0,
				y = {},
				v = [],
				c = Number.MAX_VALUE,
				f = !1,
				g = !1,
				T =
					((this.setAcceptableTiles = function (t) {
						t instanceof Array
							? (h = t)
							: !isNaN(parseFloat(t)) && isFinite(t) && (h = [t]);
					}),
					(this.enableSync = function () {
						d = !0;
					}),
					(this.disableSync = function () {
						d = !1;
					}),
					(this.enableDiagonals = function () {
						f = !0;
					}),
					(this.enableFindNearest = function () {
						g = !0;
					}),
					(this.disableDiagonals = function () {
						f = !1;
					}),
					(this.setGrid = function (t, n) {
						if (((p = t), !n))
							for (var e = 0; e < p.length; e++)
								for (var o = 0; o < p[0].length; o++)
									i[p[e][o]] || (i[p[e][o]] = 1);
					}),
					(this.getGrid = function () {
						return p;
					}),
					(this.setTileCost = function (t, n) {
						i[t] = n;
					}),
					(this.setAdditionalPointCost = function (t, n, e) {
						void 0 === o[n] && (o[n] = {}), (o[n][t] = e);
					}),
					(this.removeAdditionalPointCost = function (t, n) {
						void 0 !== o[n] && delete o[n][t];
					}),
					(this.removeAllAdditionalPointCosts = function () {
						o = {};
					}),
					(this.setDirectionalCondition = function (t, n, e) {
						void 0 === l[n] && (l[n] = {}), (l[n][t] = e);
					}),
					(this.removeAllDirectionalConditions = function () {
						l = {};
					}),
					(this.setIterationsPerCalculation = function (t) {
						c = t;
					}),
					(this.avoidAdditionalPoint = function (t, n) {
						void 0 === u[n] && (u[n] = {}), (u[n][t] = 1);
					}),
					(this.stopAvoidingAdditionalPoint = function (t, n) {
						void 0 !== u[n] && delete u[n][t];
					}),
					(this.enableCornerCutting = function () {
						a = !0;
					}),
					(this.disableCornerCutting = function () {
						a = !1;
					}),
					(this.stopAvoidingAllAdditionalPoints = function () {
						u = {};
					}),
					(this.findPath = function (t, n, e, o, i, r, s) {
						function u(t) {
							d
								? i(t)
								: setTimeout(function () {
										i(t);
								  });
						}
						if (void 0 === h)
							throw new Error(
								"You can't set a path without first calling setAcceptableTiles() on EasyStar."
							);
						if (void 0 === p)
							throw new Error(
								"You can't set a path without first calling setGrid() on EasyStar."
							);
						if (
							t < 0 ||
							n < 0 ||
							e < 0 ||
							o < 0 ||
							t > p[0].length - 1 ||
							n > p.length - 1 ||
							e > p[0].length - 1 ||
							o > p.length - 1
						)
							throw new Error(
								"Your start or end point is outside the scope of your grid."
							);
						if (t !== e || n !== o) {
							if (!g) {
								for (var l = p[o][e], a = !1, c = 0; c < h.length; c++)
									if (l === h[c]) {
										a = !0;
										break;
									}
								if (!1 === a) return void u(null);
							}
							var f = new A(),
								s =
									((f.openList = new _(function (t, n) {
										return t.bestGuessDistance() - n.bestGuessDistance();
									})),
									(f.allowMaxIterations = s || !1),
									(f.iterations = 0),
									(f.isDoneCalculating = !1),
									(f.nodeHash = {}),
									(f.startX = t),
									(f.startY = n),
									(f.endX = e),
									(f.endY = o),
									(f.callback = u),
									f.openList.push(m(f, f.startX, f.startY, null, 1)),
									L++);
							return (
								(y[s] = f), "number" == typeof r ? v.splice(r, 0, s) : v.push(s), s
							);
						}
						u([]);
					}),
					(this.cancelPath = function (t) {
						return t in y && (delete y[t], !0);
					}),
					(this.calculate = function () {
						if (0 !== v.length && void 0 !== p && void 0 !== h)
							for (r = 0; r < c; r++) {
								if (0 === v.length) return;
								d && (r = 0);
								var t = v[0],
									n = y[t];
								if (void 0 === n) v.shift();
								else {
									if (!n.allowMaxIterations && 25e3 < n.iterations)
										return (
											console.error("[ABE-INFO] Cancelling big iteration"),
											void this.cancelPath(t)
										);
									if ((n.iterations++, 0 === n.openList.size()))
										n.callback(null), delete y[t], v.shift();
									else {
										var e = n.openList.pop();
										if (M(n, e.x, e.y)) {
											for (
												var o = [],
													i = (o.push({x: e.x, y: e.y}), e.parent);
												null != i;

											)
												o.push({x: i.x, y: i.y}), (i = i.parent);
											o.reverse(), n.callback(o), delete y[t], v.shift();
										} else
											(e.list = 0) < e.y &&
												T(n, e, 0, -1, +O(e.x, e.y - 1), !1),
												e.x < p[0].length - 1 &&
													T(n, e, 1, 0, +O(e.x + 1, e.y), !1),
												e.y < p.length - 1 &&
													T(n, e, 0, 1, +O(e.x, e.y + 1), !1),
												0 < e.x && T(n, e, -1, 0, +O(e.x - 1, e.y), !1),
												f &&
													(0 < e.x &&
														0 < e.y &&
														(a ||
															(x(p, h, e.x, e.y - 1, e) &&
																x(p, h, e.x - 1, e.y, e))) &&
														T(
															n,
															e,
															-1,
															-1,
															s * O(e.x - 1, e.y - 1),
															"tl"
														),
													e.x < p[0].length - 1 &&
														e.y < p.length - 1 &&
														(a ||
															(x(p, h, e.x, e.y + 1, e) &&
																x(p, h, e.x + 1, e.y, e))) &&
														T(
															n,
															e,
															1,
															1,
															s * O(e.x + 1, e.y + 1),
															"br"
														),
													e.x < p[0].length - 1 &&
														0 < e.y &&
														(a ||
															(x(p, h, e.x, e.y - 1, e) &&
																x(p, h, e.x + 1, e.y, e))) &&
														T(
															n,
															e,
															1,
															-1,
															s * O(e.x + 1, e.y - 1),
															"tr"
														),
													0 < e.x &&
														e.y < p.length - 1 &&
														(a ||
															(x(p, h, e.x, e.y + 1, e) &&
																x(p, h, e.x - 1, e.y, e))) &&
														T(
															n,
															e,
															-1,
															1,
															s * O(e.x - 1, e.y + 1),
															"bl"
														));
									}
								}
							}
					}),
					function (t, n, e, o, i, r) {
						(e = n.x + e), (o = n.y + o);
						(void 0 !== u[o] && void 0 !== u[o][e]) || !x(p, h, e, o, n)
							? !r && g && M(t, e, o) && F(t, n)
							: void 0 === (r = m(t, e, o, n, i)).list
							? ((r.list = 1), t.openList.push(r))
							: n.costSoFar + i < r.costSoFar &&
							  ((r.costSoFar = n.costSoFar + i),
							  (r.parent = n),
							  t.openList.updateItem(r));
					}),
				x = function (t, n, e, o, i) {
					var r = l[o] && l[o][e];
					if (r) {
						var s = b(i.x - e, i.y - o);
						if (
							!(function () {
								for (var t = 0; t < r.length; t++) if (r[t] === s) return !0;
								return !1;
							})()
						)
							return !1;
					}
					for (var u = 0; u < n.length; u++) if (t[o][e] === n[u]) return !0;
					return !1;
				},
				b = function (t, n) {
					if (0 === t && -1 === n) return w.TOP;
					if (1 === t && -1 === n) return w.TOP_RIGHT;
					if (1 === t && 0 === n) return w.RIGHT;
					if (1 === t && 1 === n) return w.BOTTOM_RIGHT;
					if (0 === t && 1 === n) return w.BOTTOM;
					if (-1 === t && 1 === n) return w.BOTTOM_LEFT;
					if (-1 === t && 0 === n) return w.LEFT;
					if (-1 === t && -1 === n) return w.TOP_LEFT;
					throw new Error("These differences are not valid: " + t + ", " + n);
				},
				O = function (t, n) {
					return (o[n] && o[n][t]) || i[p[n][t]];
				},
				m = function (t, n, e, o, i) {
					if (void 0 !== t.nodeHash[e]) {
						if (void 0 !== t.nodeHash[e][n]) return t.nodeHash[e][n];
					} else t.nodeHash[e] = {};
					var r = P(n, e, t.endX, t.endY),
						i = null !== o ? o.costSoFar + i : 0,
						o = new E(o, n, e, i, r);
					return (t.nodeHash[e][n] = o);
				},
				P = function (t, n, e, o) {
					var i, r;
					return f
						? (i = Math.abs(t - e)) < (r = Math.abs(n - o))
							? s * i + r
							: s * r + i
						: (i = Math.abs(t - e)) + (r = Math.abs(n - o));
				},
				M = function (t, n, e) {
					return t.endX === n && t.endY === e;
				},
				F = function (t, n) {
					(t.endX = n.x), (t.endY = n.y), t.openList.push(n);
				};
		}),
			(w.TOP = "TOP"),
			(w.TOP_RIGHT = "TOP_RIGHT"),
			(w.RIGHT = "RIGHT"),
			(w.BOTTOM_RIGHT = "BOTTOM_RIGHT"),
			(w.BOTTOM = "BOTTOM"),
			(w.BOTTOM_LEFT = "BOTTOM_LEFT"),
			(w.LEFT = "LEFT"),
			(w.TOP_LEFT = "TOP_LEFT");
	},
	function (t, n) {
		t.exports = function () {
			(this.pointsToAvoid = {}),
				this.startX,
				this.callback,
				this.startY,
				this.endX,
				this.endY,
				(this.nodeHash = {}),
				this.openList;
		};
	},
	function (t, n) {
		t.exports = function (t, n, e, o, i) {
			(this.parent = t),
				(this.x = n),
				(this.y = e),
				(this.costSoFar = o),
				(this.simpleDistanceToTarget = i),
				(this.bestGuessDistance = function () {
					return this.costSoFar + this.simpleDistanceToTarget;
				});
		};
	},
	function (t, n, e) {
		t.exports = e(4);
	},
	function (u, g, t) {
		var T, x;
		!function () {
			var t, p, l, h, d, n, a, e, y, v, o, i, r, c, f;
			function s(t) {
				(this.cmp = null != t ? t : p), (this.nodes = []);
			}
			(l = Math.floor),
				(v = Math.min),
				(p = function (t, n) {
					return t < n ? -1 : n < t ? 1 : 0;
				}),
				(y = function (t, n, e, o, i) {
					var r;
					if ((null == i && (i = p), (e = null == e ? 0 : e) < 0))
						throw new Error("lo must be non-negative");
					for (null == o && (o = t.length); e < o; )
						i(n, t[(r = l((e + o) / 2))]) < 0 ? (o = r) : (e = r + 1);
					return [].splice.apply(t, [e, e - e].concat(n)), n;
				}),
				(d = function (t, n) {
					var e, o;
					return (
						null == n && (n = p),
						(e = t.pop()),
						t.length ? ((o = t[0]), (t[0] = e), f(t, 0, n)) : (o = e),
						o
					);
				}),
				(e = function (t, n, e) {
					var o;
					return null == e && (e = p), (o = t[0]), (t[0] = n), f(t, 0, e), o;
				}),
				(a = function (t, n, e) {
					var o;
					return (
						null == e && (e = p),
						t.length &&
							e(t[0], n) < 0 &&
							((n = (o = [t[0], n])[0]), (t[0] = o[1]), f(t, 0, e)),
						n
					);
				}),
				(h = function (e, t) {
					var n, o, i, r, s, u;
					for (
						null == t && (t = p),
							s = [],
							o = 0,
							i = (r = function () {
								u = [];
								for (
									var t = 0, n = l(e.length / 2);
									0 <= n ? t < n : n < t;
									0 <= n ? t++ : t--
								)
									u.push(t);
								return u;
							}
								.apply(this)
								.reverse()).length;
						o < i;
						o++
					)
						(n = r[o]), s.push(f(e, n, t));
					return s;
				}),
				(r = function (t, n, e) {
					if ((null == e && (e = p), -1 !== (n = t.indexOf(n))))
						return c(t, 0, n, e), f(t, n, e);
				}),
				(o = function (t, n, e) {
					var o, i, r, s, u;
					if ((null == e && (e = p), !(i = t.slice(0, n)).length)) return i;
					for (h(i, e), r = 0, s = (u = t.slice(n)).length; r < s; r++)
						(o = u[r]), a(i, o, e);
					return i.sort(e).reverse();
				}),
				(i = function (t, n, e) {
					var o, i, r, s, u, l, a, c, f;
					if ((null == e && (e = p), 10 * n <= t.length)) {
						if ((r = t.slice(0, n).sort(e)).length)
							for (
								i = r[r.length - 1], s = 0, l = (a = t.slice(n)).length;
								s < l;
								s++
							)
								e((o = a[s]), i) < 0 &&
									(y(r, o, 0, null, e), r.pop(), (i = r[r.length - 1]));
						return r;
					}
					for (
						h(t, e), f = [], u = 0, c = v(n, t.length);
						0 <= c ? u < c : c < u;
						0 <= c ? ++u : --u
					)
						f.push(d(t, e));
					return f;
				}),
				(c = function (t, n, e, o) {
					var i, r, s;
					for (
						null == o && (o = p), i = t[e];
						n < e && o(i, (r = t[(s = (e - 1) >> 1)])) < 0;

					)
						(t[e] = r), (e = s);
					return (t[e] = i);
				}),
				(f = function (t, n, e) {
					var o, i, r, s, u;
					for (null == e && (e = p), i = t.length, r = t[(u = n)], o = 2 * n + 1; o < i; )
						(s = o + 1) < i && !(e(t[o], t[s]) < 0) && (o = s),
							(t[n] = t[o]),
							(o = 2 * (n = o) + 1);
					return (t[n] = r), c(t, u, n, e);
				}),
				(s.push = n =
					function (t, n, e) {
						return null == e && (e = p), t.push(n), c(t, 0, t.length - 1, e);
					}),
				(s.pop = d),
				(s.replace = e),
				(s.pushpop = a),
				(s.heapify = h),
				(s.updateItem = r),
				(s.nlargest = o),
				(s.nsmallest = i),
				(s.prototype.push = function (t) {
					return n(this.nodes, t, this.cmp);
				}),
				(s.prototype.pop = function () {
					return d(this.nodes, this.cmp);
				}),
				(s.prototype.peek = function () {
					return this.nodes[0];
				}),
				(s.prototype.contains = function (t) {
					return -1 !== this.nodes.indexOf(t);
				}),
				(s.prototype.replace = function (t) {
					return e(this.nodes, t, this.cmp);
				}),
				(s.prototype.pushpop = function (t) {
					return a(this.nodes, t, this.cmp);
				}),
				(s.prototype.heapify = function () {
					return h(this.nodes, this.cmp);
				}),
				(s.prototype.updateItem = function (t) {
					return r(this.nodes, t, this.cmp);
				}),
				(s.prototype.clear = function () {
					return (this.nodes = []);
				}),
				(s.prototype.empty = function () {
					return 0 === this.nodes.length;
				}),
				(s.prototype.size = function () {
					return this.nodes.length;
				}),
				(s.prototype.clone = function () {
					var t = new s();
					return (t.nodes = this.nodes.slice(0)), t;
				}),
				(s.prototype.toArray = function () {
					return this.nodes.slice(0);
				}),
				(s.prototype.insert = s.prototype.push),
				(s.prototype.top = s.prototype.peek),
				(s.prototype.front = s.prototype.peek),
				(s.prototype.has = s.prototype.contains),
				(s.prototype.copy = s.prototype.clone),
				(t = s),
				(x = []),
				void 0 !==
					(x =
						"function" ==
						typeof (T = function () {
							return t;
						})
							? T.apply(g, x)
							: T) && (u.exports = x);
		}.call(this);
	}
]);


//import {EasyStar} from "../../../lib/easystar/custom.easystar-0.4.4.min.mjs";

class PathFinder {
	constructor(tileSize, mapDimension, helper) {
		this.helper = helper;

		this.mapData = mapData;
		var pf = new EasyStar.js();
		this.pf = pf;
		this.tileSize = tileSize || 64;
		this.mapDimension = mapDimension || 60;
		this.pf.enableDiagonals();
		this.pf.enableFindNearest();
		this.pf.setAcceptableTiles([0, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

		this.pf.setTileCost(0, 10);
		this.pf.setTileCost(2, 20);
		this.pf.setTileCost(3, 30);
		this.pf.setTileCost(4, 40);
		this.pf.setTileCost(5, 50);
		this.pf.setTileCost(6, 60);

		this.pf.setIterationsPerCalculation(10000); //Won't allow searches that take more than 10000 iterations

		//... setting to work for just player only
	}

	importDefaultGrid() {
		this.setGrid(mapData);
	}

	cancel(id) {
		this.pf.cancelPath(id);
	}

	setGrid(grid) {
		this.pf.setGrid(grid);
	}

	getGrid() {
		return this.pf.getGrid(); //If this fails, its a custom function added to easystar basically return collisionGrid;
	}

	setAdditionalPointCost(row, column, cost) {
		//this.helper.debugObject(column*64, row*64, 64, 64);
		this.pf.setAdditionalPointCost(column, row, cost * 10);
	}

	avoidAdditionalPoint(row, column) {
		this.pf.avoidAdditionalPoint(column, row);
	}

	stopAvoidingAdditionalPoint(row, column) {
		this.pf.stopAvoidingAdditionalPoint(column, row);
	}

	findPath(x, y, endX, endY, callback, isPlayer) {
		if (isPlayer) {
			return this.pf.findPath(x, y, endX, endY, callback, 0, true);
		} else {
			return this.pf.findPath(x, y, endX, endY, callback, false, true);
		}
	}

	calculate() {
		this.pf.calculate();
	}
}

class ServerPath {
	regions = 110;
	regionSize = 1100; //Seems to need padding coz of 100 region (101-110)

	constructor(emit) {
		this.tileSize = 64;
		this.mapDimension = this.regions * this.regionSize;

		this.finders = {};

		this.helper = new ServerHelper(emit);
		this.helper.world = new ServerWorld(emit); //TODO: move or remove;
		var pf = new PathFinder(this.tileSize, this.mapDimension, this.helper);

		this.pf = pf;
		this.createBlankGrid();
		this.grid = pf.getGrid();

		this.pathLog = {}; //An object for tracking searches and failures
		this.loop();
		this.tick = 0;
	}

	start() {
		ABE.infoLog("Starting Path Server");
	}

	importDefaultGrid() {
		this.pf.importDefaultGrid();
	}

	dump() {
		console.error("~~~~~PATH DUMP~~~~~");
		console.error(this.pf.getGrid());
		console.error("~~~~~END PATH DUMP~~~~~");
	}

	reset() {
		ABE.infoLog("Reset Path");
	}

	loop() {
		this.pf.calculate();
		setTimeout(() => {
			this.tick++;
			this.loop();
		}, 1000 / 55);
	}

	createBlankGrid() {
		var grid = [];
		for (var i = 0; i <= 10 * 100; i++) {
			grid[i] = [];
			for (var j = 0; j <= 10 * 100; j++) {
				grid[i].push(0);
			}
		}

		this.setGrid({
			data: {
				grid: grid
			}
		});
	}

	setGrid(data) {
		var grid = data.data.grid;
		this.grid = grid;

		this.pf.setGrid(grid);
	}

	getGrid() {
		return this.pf.getGrid(); //If this fails, its a custom function added to easystar basically return collisionGrid;
	}

	updateGrid(data) {
		var grid = data.data.grid;
		this.grid = grid;
	}

	parsePathing(item) {
		let blockZone = item.meta.blockZone;

		//TODO: IMPORTANT! Enable and check performance or requirement if needed.
		//This function parses an object and figures out its block zones
		//console.log("Parse", blockZone);
		//Block none zone only
		if (blockZone == "none") {
			return;
		}

		let w = item.width || 64;
		let h = item.height || 64;
		let x = this.helper.gridPos(item.x + 12); //Padded a tiny bit for 1+1 tiny offsets
		let y = this.helper.gridPos(item.y + 12);

		let blockWidth = Math.ceil(w / 64);
		let blockHeight = Math.ceil(h / 64);

		//Block top zone only
		if (blockZone == "top") {
			let j = 0;
			for (let i = 0; i < blockWidth; i++) {
				item.addBlockZone(x + i, y + j);
			}
		}

		//Block left zone only
		if (blockZone == "left") {
			let i = 0;
			for (let j = 0; j < blockHeight; j++) {
				item.addBlockZone(x + i, y + j);
			}
		}

		//Block bottom zone only
		if (blockZone == "bottom") {
			let j = blockHeight - 1;
			for (let i = 0; i < blockWidth; i++) {
				item.addBlockZone(x + i, y + j);
			}
		}

		if (blockZone == "all") {
			for (let i = 0; i < blockWidth; i++) {
				for (let j = 0; j < blockHeight; j++) {
					item.addBlockZone(x + i, y + j);
				}
			}
		}
	}

	requestDrawMatrix(data) {
		this.helper.worldUpdate("receiveDrawMatrix", {drawMatrix: this.getGrid()});
	}

	addBlockers(data) {
		var item = data.data;

		item.addBlockZone = this.block.bind(this);

		this.parsePathing(item);

		return;
	}

	removeBlockers(data) {
		var item = data.data;
		var blockWidth = Math.ceil(item.width / this.tileSize);
		var blockHeight = Math.ceil(item.height / this.tileSize);

		if (blockWidth == 1 && blockHeight == 1) {
			this.removeBlocker({data: item});
			return true;
		}

		var gridX = Math.floor(item.x / this.tileSize);
		var gridY = Math.floor(item.y / this.tileSize);

		for (var row = 0; row < blockWidth; row++) {
			for (var col = 0; col < blockHeight; col++) {
				this.unBlock(gridX + row, gridY + col);
			}
		}
	}

	addObject(data) {
		var item = data.data;

		//TODO:
		/**
		 * This might be wrong... It needs to match the physics object properties
		 * whether it should block or not.
		 * Equally it should only remove blockers if the items demands it.
		 *
		 * Refactor should be,
		 *  1. Add blocker if its physics type or pathing type demands it
		 *  2. Remove blocker if the item demands it
		 */
		if (item.data.block !== false) {
			this.addBlockers(data);
			return;
		} else {
			this.removeBlockers(data); //TODO: if an item removes a block.. i guess we need this - but it causes a crash
			return;
		}
	}

	addWater(data) {
		var blockData = data.data;

		this.water(Math.floor(blockData.x / this.tileSize), Math.floor(blockData.y / this.tileSize));
	}

	water(row, column) {
		if (!this.grid[column]) {
			ABE.errorLog("[ABE-PathServer] Can't add water grid at C:" + column + " R:" + row);
			return false;
		}
		this.grid[column][row] = 3;
		this.pf.setAdditionalPointCost(column, row, 3);
	}

	addBlocker(data) {
		//TODO: runs alot, make bulk?
		//console.log("Add blocka");
		var blockData = data.data;
		if (blockData.show) {
			this.helper.debugObject(blockData.x, blockData.y, 32, 32);
		}

		this.block(Math.floor(blockData.x / this.tileSize), Math.floor(blockData.y / this.tileSize));
	}

	block(row, column) {
		if (!this.grid[column]) {
			ABE.errorLog("[ABE-PathServer] Can't block grid at C:" + column + " R:" + row);
			return false;
		}
		this.grid[column][row] = 1;
		this.pf.avoidAdditionalPoint(column, row);
	}

	removeBlocker(data) {
		var blockData = data.data;

		this.unBlock(Math.floor(blockData.x / this.tileSize), Math.floor(blockData.y / this.tileSize));
	}

	unBlock(row, column) {
		if (!this.grid[column]) {
			ABE.errorLog("[ABE-PathServer] Can't block grid at C:" + column + " R:" + row);
			return false;
		}
		this.grid[column][row] = 0;
		this.pf.stopAvoidingAdditionalPoint(column, row);
	}

	bulkPathUpdate(data) {
		var paths = data.data;
		for (var i = 0; i < paths.length; i++) {
			this.asyncPathFind({data: paths[i]});
		}
	}

	cancelFinder(objectId) {
		if (!this.finders[objectId]) {
			return false;
		}
		this.pf.cancel(this.finders[objectId]); //Safe to run even if undefined/null/non-existing/existing etc
		delete this.finders[objectId];
	}

	addFinder(objectId, instanceId) {
		if (this.finders[objectId] !== undefined && this.finders[objectId] !== instanceId) {
			this.cancelFinder(objectId);
		}
		this.finders[objectId] = instanceId; //Doesn't really need cleaning up its tiny footprint.
	}

	trimPathLog() {
		let keys = Object.keys(this.pathLog);
		if (keys.length > 100) {
			//100 Kind of assumed at most 100 path finders at once
			delete this.pathLog[keys[0]]; //Delete oldest
		}
	}

	addPathLog(targetId) {
		this.trimPathLog(); //Reduce size of log to avoid memory leak.
		this.pathLog[targetId] = {ended: false, status: "in-progress"};
	}

	pathFailed(targetId) {
		this.pathLog[targetId].ended = true;
		this.pathLog[targetId].status = "failed";
		this.pathLog[targetId].retryTime = this.ticks + 100; //Retry in 100 ticks
	}

	pathSuccess(targetId) {
		if (!this.pathLog[targetId]) {
			//TODO: No pathlog... not sure why this happens
			return;
		}
		this.pathLog[targetId].ended = true;
		this.pathLog[targetId].status = "success";
	}

	removePathLog(targetId) {
		ABE.infoLog("[ABE] Removing path log for: " + targetId);
		delete this.pathLog[targetId];
	}

	shouldPath(targetId) {
		if (this.pathLog[targetId]) {
			if (this.pathLog[targetId].status == "failed") {
				if (this.pathLog[targetId].retryTime < this.ticks) {
					this.removePathLog(targetId);
				}
				return false; //It failed last time, so we will not search this time round.
			}
		}
		//Doesn't exist in the path, so it should path and add log.
		this.addPathLog(targetId);
		return true;
	}

	outsideGrid(startX, startY, endX, endY) {
		return (
			startX < 0 ||
			startX > this.grid.length ||
			startY < 0 ||
			startY > this.grid.length ||
			endX < 0 ||
			endX > this.grid.length ||
			endY < 0 ||
			endY > this.grid.length
		);
	}

	asyncPathFind(data) {
		var options = data.data;

		servers.physics.helper.physicsUpdate("receivePath", {
			id: options.id,
			path: [],
			reason: "emptying"
		});
		servers.physics.helper.worldUpdate("receivePath", {
			id: options.id,
			path: [],
			reason: "emptying"
		});

		options.x += 32; //Add padding to make more accurate to current cell.
		options.y += 32; //Add padding to make more accurate to current cell.

		let isPlayer = options.isPlayer || false;
		let startX = Math.floor(options.x / this.tileSize);
		let startY = Math.floor(options.y / this.tileSize);

		let endX = Math.floor(options.endX / this.tileSize);
		let endY = Math.floor(options.endY / this.tileSize);

		let targetId = options.targetId || endX + "_" + endY; //We would prefer to track an items id, if not existing, track the x-y loc

		servers.physics.helper.dist({x: startX, y: startY}, {x: endX, y: endY});

		/*if (distance > 60) {
            //Too far so dont search
            servers.physics.helper.physicsUpdate('receivePath', { id: options.id, path: [], failed: true, reason: 'toofar:'+distance }); //OOB so just send back none.
            servers.physics.helper.worldUpdate('receivePath', { id: options.id, path: [], failed: true, reason: 'toofar:'+distance });
            return;
        }*/

		if (
			!this.shouldPath(targetId) || //If it cant add a pathlog
			this.outsideGrid(startX, startY, endX, endY) //It it isn't inside the grid
		) {
			//Outside of grid so don't search
			servers.physics.helper.physicsUpdate("receivePath", {
				id: options.id,
				path: [],
				failed: true,
				reason: "oob"
			}); //OOB so just send back none.
			servers.physics.helper.worldUpdate("receivePath", {
				id: options.id,
				path: [],
				failed: true,
				reason: "oob"
			});
			return;
		}

		try {
			this.cancelFinder(options.id); //Cancel any existing path for this instance

			var instanceId = this.pf.findPath(
				startX,
				startY,
				endX,
				endY,
				(path) => {
					if (path == null) {
						servers.physics.helper.physicsUpdate("receivePath", {
							id: options.id,
							path: [],
							failed: true,
							reason: "noresult"
						}); //TODO: is this needed?
						servers.physics.helper.worldUpdate("receivePath", {
							id: options.id,
							path: [],
							failed: true,
							reason: "noresult"
						});
						this.pathFailed(targetId);
					} else {
						path.shift(); //Remove first -- This is because it's normally the block the NPC is stood on
						//path.push([options.endX, options.endY]); //Goto the absolute x,y (in most cases for user click paths)
						servers.physics.helper.physicsUpdate("receivePath", {
							id: options.id,
							path: path,
							failed: false
						}); //TODO: is this needed?
						servers.physics.helper.worldUpdate("receivePath", {
							id: options.id,
							path: path,
							failed: false
						});
						this.pathSuccess(targetId);
					}
				},
				isPlayer
			);

			this.addFinder(options.id, instanceId);
		} catch (e) {
			console.error(
				"[ABE] Fatal, failed path: ",
				options,
				this.outsideGrid(startX, startY, endX, endY),
				{startX, startY, endX, endY},
				this.grid.length
			);
			console.error(e);
		}
	}
}

const Emitter$1 = function (data) {
	try {
		postMessage(data);
	} catch (e) {
		console.error(e);
	}
};

class Factions {
	constructor() {
		this.factionTable = {};
		this.factionTemplate = {
			//Base factions
			nomad: false,
			"passive wild": false,
			wild: true,
			bandit: true,
			lokals: true,
			//Human Factions
			sincorp: true,
			yamakai: true,
			civilian: false,
			//Clone Factions
			deadhead: true,
			superhappyclones: true,
			hunter: false,
			meta: {
				leaders: {},
				desc: "A wild faction"
			}
		};

		//BASE FACTIONS
		this.newFaction("civilian", {
			nomad: false,
			sincorp: false
		});

		//BASE FACTIONS
		this.newFaction("hunter", {
			nomad: false,
			sincorp: false
		});

		//BASE FACTIONS
		this.newFaction("passive wild", {
			nomad: false,
			wild: false,
			bandit: false,
			//Human Factions
			sincorp: false,
			yamakai: false,
			civilian: false,
			//Clone Factions
			deadhead: false,
			superhappyclones: false
		});

		//BASE FACTIONS
		this.newFaction("nomad", {
			wild: true,

			//Human Factions
			sincorp: false,

			//Clone Factions

			deadheads: true,

			superhappyclones: true
		});

		this.newFaction("wild", {
			nomad: true,
			civilian: true,
			hunter: true
		});

		this.newFaction("bandit", {
			nomad: true
		});

		//HUMAN FACTIONS

		this.newFaction("sincorp", {
			nomad: false,
			meta: {
				leaders: {
					leader: {name: "Xalex", role: "Sin Leader"},
					head_scientist: {name: "Bob", role: "Head Scientist"},
					head_security: {name: "Karr", role: "Head of Security"}
				},
				desc: "A tyrannical faction that cares only about profits and working clones into the grave."
			}
		});

		this.newFaction("yamakai", {
			nomad: false,
			meta: {
				leaders: {
					leader: {name: "Yamakai", role: "Yama Leader"},
					head_scientist: {name: "Saoon", role: "Head Scientist"},
					head_security: {name: "Ruoni", role: "Head of Security"}
				},
				desc: "A mostly peaceful faction who is trying to improve the liveability of the planet"
			}
		});

		//CLONE FACTIONS

		this.newFaction("deadhead", {
			nomad: true,
			hunter: true,
			meta: {
				leaders: {
					leader: {name: "Greyman", role: "Leader"}
				},
				desc: "A group of failed clones all dulled with their grey pigment skin. They're slow and hungry something akin to a zombie."
			}
		});

		this.newFaction("superhappyclones", {
			nomad: false
		});

		this.newFaction("lokals", {
			nomad: false
		});
	}

	getFaction(name) {
		return this.factionTable[name];
	}

	newFaction(name, options) {
		this.factionTable[name] = {};
		Object.assign(this.factionTable[name], this.factionTemplate, options);
	}

	enemies(life1, life2) {
		if (!life1.data.faction || !life2.data.faction) {
			//Missing faction (old?)
			console.error(
				"[ABE] This life has no faction...",
				life1.data.name,
				life1.faction,
				life1.data.name,
				life2.faction
			);

			return false;
		}

		//ENRAGED
		//Huge danger so always an enemy
		if (life1.data.enraged || life2.data.enraged) {
			return true;
		}

		if (!life1.isPlayer && !life2.isPlayer && life1.data.faction === life2.data.faction) {
			return false;
		}

		if (!this.factionTable[life1.data.faction]) {
			console.error("Faction table does not exist: " + life1.data.faction);
		}

		if (!this.factionTable[life2.data.faction]) {
			console.error("Faction table does not exist: " + life2.data.faction);
		}

		if (
			typeof this.factionTable[life1.data.faction][life2.data.faction] === "undefined" ||
			typeof this.factionTable[life2.data.faction][life1.data.faction] === "undefined"
		) {
			console.error({msg: "FACTION MISSING", fac1: life1.data.faction, fac2: life2.data.faction});
		}

		//If either considers the other enemies, then they are enemies.
		if (
			this.factionTable[life1.data.faction][life2.data.faction] ||
			this.factionTable[life2.data.faction][life1.data.faction]
		) {
			return true;
		}

		//If either is not a player, dont do extra checks like faction hit time
		//TODO: do other cehcks?
		if (!life1.data.isPlayer && !life2.data.isPlayer) {
			return false;
		}

		//If they're not enemies but are hostile for now check this.
		return this.hostile(life1, life2);
	}

	hostile(life1, life2) {
		if (life1.data.hostileFaction && life1.data.hostileFaction[life2.data.faction]) {
			return true;
		}

		if (life2.data.hostileFaction && life2.data.hostileFaction[life1.data.faction]) {
			return true;
		}

		//STEALING
		//Because enemy checks only happen on LOS checks
		//We can assume if we're checking this - the npcs can see eachother
		//This way we can set stealing whenever we want to true, and false when we want.

		//Has stealing flag so make it class as a hit
		if (life2.data.stealing) {
			life2.data.factionHitTime[life1.data.faction] = game.ts;
		}

		//Has stealing flag so make it class as a hit
		if (life1.data.stealing) {
			life1.data.factionHitTime[life2.data.faction] = game.ts;
		}

		//TODO: instead, why dont we enable this if the player sets to attack a nice faction

		//Temporary faction damage
		if (life1.data.factionHitTime[life2.data.faction] > game.ts - 5000) {
			return true;
		}

		//Temporary faction damage
		if (life2.data.factionHitTime[life1.data.faction] > game.ts - 5000) {
			return true;
		}

		return false;
	}
}

/*! For license information please see bundle.min.js.LICENSE.txt */
var __webpack_modules__ = {
		"./node_modules/matter-js/build/matter.js": function (
			module,
			__unused_webpack_exports,
			__webpack_require__
		) {
			eval(
			);
		},
		"./src/index.js": (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
			eval(
				'__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   "Matter": () => (/* reexport module object */ matter_js__WEBPACK_IMPORTED_MODULE_0__)\n/* harmony export */ });\n/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! matter-js */ "./node_modules/matter-js/build/matter.js");\n/* harmony import */ var matter_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(matter_js__WEBPACK_IMPORTED_MODULE_0__);\n\r\n\r\n\n\n//# sourceURL=webpack://makematter/./src/index.js?'
			);
		}
	},
	__webpack_module_cache__ = {};
function __webpack_require__(n) {
	var e = __webpack_module_cache__[n];
	if (void 0 !== e) return e.exports;
	var t = (__webpack_module_cache__[n] = {exports: {}});
	return __webpack_modules__[n].call(t.exports, t, t.exports, __webpack_require__), t.exports;
}
(__webpack_require__.n = (n) => {
	var e = n && n.__esModule ? () => n.default : () => n;
	return __webpack_require__.d(e, {a: e}), e;
}),
	(__webpack_require__.d = (n, e) => {
		for (var t in e)
			__webpack_require__.o(e, t) &&
				!__webpack_require__.o(n, t) &&
				Object.defineProperty(n, t, {enumerable: !0, get: e[t]});
	}),
	(__webpack_require__.g = (function () {
		if ("object" == typeof globalThis) return globalThis;
		try {
			return this || new Function("return this")();
		} catch (n) {
			if ("object" == typeof window) return window;
		}
	})()),
	(__webpack_require__.o = (n, e) => Object.prototype.hasOwnProperty.call(n, e)),
	(__webpack_require__.r = (n) => {
		"undefined" != typeof Symbol &&
			Symbol.toStringTag &&
			Object.defineProperty(n, Symbol.toStringTag, {value: "Module"}),
			Object.defineProperty(n, "__esModule", {value: !0});
	});
var __webpack_exports__ = __webpack_require__("./src/index.js"),
	__webpack_exports__Matter = __webpack_exports__.Matter;

__webpack_exports__Matter.Common.now = function () {
	//Polyfill (it looks for window.performance)
	return new Date().getSeconds() - __webpack_exports__Matter.Common._nowStartTime;
};
class ServerPhysics {
	constructor(emit) {
		console.error("Matter is", self.Matter);

		this.ts = new Date().getTime();
		this.emit = emit; //function to push event from server
		this.objects = {};
		this.Engine = __webpack_exports__Matter.Engine;
		this.Render = __webpack_exports__Matter.Render;
		this.Vector = __webpack_exports__Matter.Vector;

		this.World = __webpack_exports__Matter.World;

		this.Body = __webpack_exports__Matter.Body;
		this.Query = __webpack_exports__Matter.Query;
		this.Events = __webpack_exports__Matter.Events;
		this.Bodies = __webpack_exports__Matter.Bodies;
		this.Mouse = __webpack_exports__Matter.Mouse;
		this.Composite = __webpack_exports__Matter.Composite;

		this.Composites = __webpack_exports__Matter.Composites;
		this.Constraint = __webpack_exports__Matter.Constraint;
		// create runner
		this.runner = __webpack_exports__Matter.Runner.create({
			isFixed: true
		});

		this.MouseConstraint = __webpack_exports__Matter.MouseConstraint;
		this.physEngine = this.Engine.create();
		__webpack_exports__Matter.Resolver._restingThresh = 0.001;
		this.physEngine.world.gravity.y = 0;
		this.lastTime = new Date().getTime();
		this.delta = 0;
		this.c = 0;
		this.velocity = {};
		this.helper = new ServerHelper(this.emit);
		this.helper.physics = this;
		this.helper.world = new ServerWorld(this.emit);
		this.index = new Indexer();
		this.maxObjects = 500; //Set to 100 for now so I can see when it actualy kicks in

		this.physEngine.positionIterations = 150;
		this.physEngine.velocityIterations = 150;

		//Matter.Runner.run(this.runner, this.physEngine);

		this.Events.on(this.physEngine, "collisionStart", (event) => {
			this.collisionEvents(event);
		});
		this.Events.on(this.physEngine, "collisionEnd", (event) => {
			this.collisionEventsEnd(event);
		});

		this.blocked = {};

		__webpack_exports__Matter.Runner.run(this.runner, this.physEngine);

		//Matter.Runner.stop(this.runner);
	}

	setTimestamp(data) {
		this.ts = data.data.timestamp;
		game.ts = data.data.timestamp;
	}

	dump() {
		console.error("~~~~~PHYSICS DUMP~~~~~");
		console.error(this.index.getAll());
		console.error("~~~~~END PHYSICS DUMP~~~~~");
	}

	pause() {
		console.log("Phys worker paused");
		ABE.infoLog("[ABE-Phys] Pause");
		this.runner.enabled = false;
		ABE.monitorLog("WARNING CONSOLE COMMANDS MAY BE DISABLED (console.log, console.error)");
	}

	resume() {
		ABE.infoLog("[ABE-Phys] Resume");
		this.runner.enabled = true;
	}

	collisionEvents(event) {
		const pairs = event.pairs.slice();
		for (let i = 0; i < pairs.length; i++) {
			this.collisionEvent(pairs[i], "start");
		}
	}

	doTick(data) {
		// this.runner.enabled = true;
		// Matter.Runner.tick(this.runner, this.physEngine)
	}

	callItemFunc(data) {
		let options = data.data;
		let item = this.index.getFromIndex(options.itemId, "all");
		if (!item) {
			ABE.errorLog("[ABE] Can't find item in index", options.itemId);
			return;
		}
		if (typeof item[options.func] !== "function") {
			ABE.errorLog("[ABE] Can't find function on item" + item.codename + options.func);
			return;
		}
		try {
			item[options.func].call(item, options.data);
		} catch (e) {
			ABE.errorLog("[ABE] Failed to run " + options.func + " on " + item.codename);
			console.error(e);
		}
	}

	start() {
		ABE.infoLog("Start Physics");

		/*
        setTimeout(()=> {
            Matter.Runner.tick(this.runner, this.physEngine);
            this.start();
        }, 1000/60); //TODO: hm, this is actually okay for now, but in future it may need some dynamic variability read below.
        */
		/**
         This ticker is a tricky thing... Realistically it want to match 100% the tick rate of the frontend.
         If you tell the frontend to trigger the tick, its too slow and doesn't work.
         If you tick as fast as possible, it works well on good systems but bad on bad systems because the frontend receives too many messages
         If you tick slower, it's just too innacurate and rubbish.
         Ideally, you need to tick at the same rate as the client. 
         */
	}

	reset() {
		ABE.infoLog("Reset Physics");
	}

	ddaWalk(x, y, endX, endY) {
		x = Math.floor((x + 10) / 64) + 1;
		y = Math.ceil((y + 10) / 64);
		endX = Math.floor((endX + 10) / 64) + 1;
		endY = Math.floor((endY + 10) / 64);

		//DDA Algorithm https://lodev.org/cgtutor/raycasting.html
		//https://www.youtube.com/watch?v=NbSee-XM7WA
		//https://github.com/OneLoneCoder/olcPixelGameEngine

		const Vector = __webpack_exports__Matter.Vector;

		Vector.create(100000, 100000); //Grid size in cell size

		let rayStart = Vector.create(x, y);

		let rayEnd = Vector.create(endX, endY);

		let rayDir = Vector.normalise(Vector.sub(rayEnd, rayStart));
		// Lodev.org also explains this additional optimistaion (but it's beyond scope of video)
		// olc::vf2d vRayUnitStepSize = { abs(1.0f / vRayDir.x), abs(1.0f / vRayDir.y) };
		let rayUnitStepSize = Vector.create(
			Math.sqrt(1 + (rayDir.y / rayDir.x) * (rayDir.y / rayDir.x)),
			Math.sqrt(1 + (rayDir.x / rayDir.y) * (rayDir.x / rayDir.y))
		);

		let mapCheck = Vector.create(rayStart.x, rayStart.y);

		let rayLength1D = Vector.create();
		let step = Vector.create();

		//Setup initial variables

		if (rayDir.x < 0) {
			step.x = -1;
			rayLength1D.x = (rayStart.x - mapCheck.x) * rayUnitStepSize.x;
		} else {
			step.x = 1;
			rayLength1D.x = (mapCheck.x + 1 - rayStart.x) * rayUnitStepSize.x;
		}

		if (rayDir.y < 0) {
			step.y = -1;
			rayLength1D.y = (rayStart.y - mapCheck.y) * rayUnitStepSize.y;
		} else {
			step.y = 1;
			rayLength1D.y = (mapCheck.y + 1 - rayStart.y) * rayUnitStepSize.y;
		}
		let maxDistance = 25; //Max distance to walk in 'cells'
		let distance = 0;
		let maxIterations = 50; //Just for safety, don't crash browsers!
		let iterations = 0;

		while (distance < maxDistance && iterations < maxIterations) {
			iterations++;
			if (rayLength1D.x <= rayLength1D.y) {
				//TODO: this ensure walls left and right.. But it may want to factor in directionin future (remove = for Y)
				mapCheck.x += step.x;
				distance = rayLength1D.x;
				rayLength1D.x += rayUnitStepSize.x;
			} else {
				mapCheck.y += step.y;
				distance = rayLength1D.y;
				rayLength1D.y += rayUnitStepSize.y;
			}

			//this.helper.debugObject(mapCheck.x*64, mapCheck.y*64)

			if (
				this.isBlocked(mapCheck.x * 64, mapCheck.y * 64) ||
				this.isBlocked((mapCheck.x - 1) * 64, (mapCheck.y - 1) * 64) ||
				this.isBlocked((mapCheck.x + 1) * 64, (mapCheck.y + 1) * 64)
			) {
				return {x: mapCheck.x * 64, y: mapCheck.y * 64}; //Vision blocked here so return this location.
			}
		}
	}

	collisionEventsEnd(event) {
		const pairs = event.pairs.slice();

		//Weird collision pairs.
		//This occurs when an entity is removed, and the event ends.
		if (!pairs[0] || !pairs[1]) {
			return;
		}
		if (pairs[0].removePhysics || pairs[1].removePhysics) {
			//These will be removed so don't calculate
			return;
		}
		for (let i = 0; i < pairs.length; i++) {
			this.collisionEvent(pairs[i], "end");
		}
	}

	collisionEvent(collision, event) {
		if (collision.bodyA.sprite == undefined || collision.bodyB.sprite == undefined) {
			return;
		}

		this.objects = this.index.getIndex("all");

		let objectA = this.objects[collision.bodyA.sprite.id] || collision.bodyA.sprite;
		let objectB = this.objects[collision.bodyB.sprite.id] || collision.bodyB.sprite;

		if (!objectA) {
			//TODO: find out why this occurs. Apparently the item doesn't exist in the index!
			ABE.errorLog("1.. Can't find A collider in index: ", collision.bodyA.sprite);
			return;
		}
		if (!objectB) {
			ABE.errorLog("2.. Can't find B collider index: ", collision.bodyA.sprite);
			return;
		}

		this.processCollision(
			this.objects[collision.bodyA.sprite.id],
			this.objects[collision.bodyB.sprite.id],
			true,
			event
		);
		this.processCollision(
			this.objects[collision.bodyB.sprite.id],
			this.objects[collision.bodyA.sprite.id],
			false,
			event
		);
	}

	processCollision(a, b, first, event) {
		//TODO: Figure out why this might occur.
		if (event == "start" && (a == undefined || b == undefined)) {
			return false;
		}
		if (a == undefined) {
			a = {};
		}
		if (b == undefined) {
			b = {};
		}
		if (a.meta == undefined) {
			//No data, so nothing to process.
			return false;
		}
		if (a.meta.collisionGroups == undefined) {
			return false;
		}

		if (a.data !== undefined) {
			if (a.data.creatorId == b.id) {
				return false;
			}
		}

		if (b.data !== undefined) {
			if (b.data.creatorId == a.id) {
				return false;
			}
		}

		//Calculate A events only because A will eventually be both objects
		const collisions = a.meta.collisionGroups.split(",");
		for (let i = 0; i < collisions.length; i++) {
			const collisionData = self._PHYSICS.collisions[collisions[i]];
			if (collisionData == undefined) {
				continue; //No collision data for this item
			}
			if (event == "start" && typeof collisionData.start == "function") {
				collisionData.start.call(this, a, b, first, event); //Pass this to allow easy modification of server
			}
			if (event == "end" && typeof collisionData.end == "function") {
				collisionData.end.call(this, a, b, first, event); //Pass this to allow easy modification of server
			}
		}
	}

	bulkSetVelocity(data) {
		const velocities = data.data;
		for (let i = 0; i < velocities.length; i++) {
			this.setVelocity({data: velocities[i]});
		}
	}

	setVelocity(data) {
		const velData = data.data;
		this.velocity[velData.id] = velData;
	}

	updateComposite() {
		this.allBodies = this.Composite.allBodies(this.physEngine.world);
	}

	addBlock(x, y) {
		this.blocked[Math.floor(x / 64) + "_" + Math.floor(y / 64)] = true;
	}

	isBlocked(x, y) {
		return this.blocked[Math.floor(x / 64) + "_" + Math.floor(y / 64)] || false;
	}

	addWater(data) {}

	addBlocker(data) {
		this.addBlock(data.data.x, data.data.y);
	}

	addSensor(data) {
		if (Object.keys(this.objects).length > this.maxObjects) {
			return false;
		}
		const sprite = new ServerItem(data.data, this.helper);
		sprite.width = 128;
		sprite.height = 128;
		sprite.lastX = Math.ceil(sprite.x);
		sprite.lastY = Math.ceil(sprite.y);
		let body = {};

		if (sprite.data.radius) {
			body = this.Bodies.circle(sprite.x, sprite.y, sprite.data.radius, {
				friction: 1,
				frictionAir: 0.08,
				inertia: Infinity,
				rot: 0,
				density: 1,
				restitution: 0,
				isSensor: true
			});
		} else {
			body = this.Bodies.rectangle(sprite.x, sprite.y, sprite.width / 2, sprite.height / 2, {
				friction: 1,
				frictionAir: 0.08,
				inertia: Infinity,
				rot: 0,
				density: 1,
				restitution: 0,
				isSensor: true
			});
		}
		sprite.body = body;
		sprite.body.sprite = sprite;
		sprite.hasUpdates = false;

		sprite.updates = []; //Used to push updates to client
		this.index.addToIndexes(["all", "objects"], sprite);
		this.World.addBody(this.physEngine.world, body);
		this.updateComposite();
	}

	setData(data) {
		const id = data.data.id;
		const item = this.index.find(id);
		if (!item) {
			return;
		}
		item.data = data.data.data;
	}

	addProjectile(data) {
		if (Object.keys(this.objects).length > this.maxObjects) {
			ABE.errorLog("[ABE] Max objects reached in worker", Object.keys(this.objects).length);
		}

		const sprite = new ServerItem(data.data, this.helper);

		sprite.width = 250;
		sprite.height = 250;
		sprite.lastX = Math.ceil(sprite.x);
		sprite.lastY = Math.ceil(sprite.y);
		let body;

		body = this.Bodies.rectangle(sprite.x, sprite.y, 125, 125, {
			friction: 0,
			frictionAir: 0.0,
			inertia: Infinity,
			rot: 0,
			density: 0.025,
			restitution: 0,
			isSensor: true
		});

		sprite.body = body;
		sprite.body.sprite = sprite;
		sprite.hasUpdates = false;
		sprite.updates = []; //Used to push updates to client
		this.index.addToIndexes(["all", "objects"], sprite);
		this.World.addBody(this.physEngine.world, body);
		this.updateComposite();

		//this.Body.setVelocity(sprite.body, { x: 0, y: -10 });
		//this.Body.setAngle(sprite.body, -Math.PI * 0.26);
		//this.Body.setAngularVelocity(sprite.body, 10);

		const p1 = sprite;

		const p2 = {x: sprite.data.targetX, y: sprite.data.targetY};

		// angle in radians
		const angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);

		this.Body.setAngle(sprite.body, angleRadians);

		const force = 30 * sprite.data.speed;
		const deltaVector = this.Vector.sub(sprite, {x: p2.x, y: p2.y});
		const normalizedDelta = this.Vector.normalise(deltaVector);
		const forceVector = this.Vector.mult(normalizedDelta, force);
		const op = this.Vector.neg(forceVector);
		this.Body.applyForce(sprite.body, sprite.body.position, op);
	}

	addObject(data) {
		if (Object.keys(this.objects).length > this.maxObjects) {
			ABE.errorLog("[ABE] Reached max objects");
		}

		const sprite = new ServerItem(data.data, this.helper);

		if (sprite.meta.physicsType == "static") {
			this.addBlocker(data);
			return true;
		}

		if (sprite.meta.physicsType == "logic") {
			this.index.addToIndex("logic", sprite);
			return;
		}

		if (sprite.meta.physicsType == "sensor") {
			this.addSensor(data);
			return true;
		}

		if (sprite.meta.physicsType == "projectile") {
			this.addProjectile(data);
			return true;
		}

		sprite.lastX = Math.ceil(sprite.x);
		sprite.lastY = Math.ceil(sprite.y);
		let w = sprite.width || 64;
		let h = sprite.width || 64;

		const body = this.Bodies.rectangle(sprite.x, sprite.y, w, h, {
			friction: 0,
			frictionAir: 0.08,
			inertia: Infinity,
			rot: 0,
			density: 0.01,
			restitution: 0.6
		});

		sprite.body = body;
		sprite.body.sprite = sprite;
		sprite.body.isSleeping = true;
		sprite.hasUpdates = false;

		sprite.updates = []; //Used to push updates to client
		this.index.addToIndexes(["all", "objects", data.data.class], sprite);
		this.World.addBody(this.physEngine.world, body);
		this.updateComposite();
	}

	addLifeObject(data) {
		if (Object.keys(this.objects).length > this.maxObjects) {
			ABE.monitorLog("[ABE-INFO] A lot of objects in physics", Object.keys(this.objects).length);
		}

		const sprite = data.data;
		const life = new ServerLife(data.data, this.helper);
		let isSensor = typeof life.data.physIsSensor == "undefined" ? true : life.data.physIsSensor;

		if (life.data.isPlayer) {
			isSensor = false;
		}
		life.initPhysics();
		life.lastX = Math.ceil(sprite.x);
		life.lastY = Math.ceil(sprite.y);

		const body = this.Bodies.rectangle(sprite.x, sprite.y, sprite.width * 0.7, sprite.height * 0.7, {
			friction: life.data.physFriction || 1,
			frictionAir: life.data.physFrictionAir || 0.08,
			inertia: Infinity,
			rot: 0,
			density: life.data.physDensity || 1,
			restitution: life.data.physRestitution || 0,
			isSensor: isSensor
		});

		life.body = body;
		life.body.sprite = life;
		life.hasUpdates = false;

		life.updates = []; //Used to push updates to client
		this.index.addToIndexes(["all", "life"], life);
		this.World.addBody(this.physEngine.world, body);
		this.updateComposite();
	}

	colliderRay(sourceId, start, end) {
		const objects = this.index.getIndex("all");
		objects[sourceId];

		if (this.allBodies == undefined) {
			return [];
		}

		const walk = this.ddaWalk(start.x, start.y, end.x, end.y); //DDA walk (collides with unpassable stuff for LOS)

		let results = [];

		if (!walk) {
			//TRYING FOR NOW
			//IF IT HIT A WALL IT SAW NO ONE
			return [];
		} else {
			results = this.Query.ray(this.allBodies, start, walk, 64);
		}

		/*
        results.concat(this.Query.ray(this.allBodies, {x:start.x-64, y:start.y-64}, {x:end.x+64, y: end.y+64}))
        results.concat(this.Query.ray(this.allBodies, {x:start.x+64, y:start.y+64}, {x:end.x-64, y: end.y-64}))

        results.concat(this.Query.ray(this.allBodies, {x:start.x-64, y:start.y+64}, {x:end.x+64, y: end.y-64}))
        results.concat(this.Query.ray(this.allBodies, {x:start.x+64, y:start.y-64}, {x:end.x-64, y: end.y=64}))
        */

		const colliders = [];
		for (let i = 0; i < results.length; i++) {
			if (results[i].body.sprite.id == sourceId) {
				continue; //Don't include self
			}

			colliders.push(results[i].body.sprite.codename);
			//Push factions
			if (results[i].body.sprite.data && results[i].body.sprite.data.faction) {
				colliders.push(results[i].body.sprite.id);
				colliders.push(results[i].body.sprite.data.faction);
			}
		}

		this.updateInternalObject(sourceId, {type: "losRay", losRay: colliders});
		return results;
	}

	collideInCircle(sourceId, x, y, radius) {
		if (this.allBodies == undefined) {
			return [];
		}
		const circle = this.Bodies.circle(x, y, radius, {
			frictionAir: 0.05,
			restitution: 0.0,
			density: 1
		});
		const results = this.Query.collides(circle, this.allBodies);
		const colliders = [];
		for (let i = 0; i < results.length; i++) {
			colliders.push(results[i].body.sprite.codename);
		}
		this.updateInternalObject(sourceId, {type: "losCircle", losRay: colliders});

		return results;
	}

	//Use this from outside the server to update an item
	updateObject(data) {
		this.updateInternalObjectData(data.data.id, data.data.data);
	}

	removeAllObjects() {
		for (let id in this.objects) {
			this.objects[id].hasUpdates = false;
			this.objects[id].removePhysics = true;
		}
	}

	removeObject(data) {
		const physObject = this.index.find(data.data.id);
		if (!physObject) return;
		physObject.hasUpdates = false;
		physObject.removePhysics = true;
	}

	updateInternalObjectData(id, data) {
		let item = this.index.find(id);
		if (!item) {
			ABE.errorLog("[ABE-ERROR] CANT UPDATE", id);
			return;
		}
		item.data = data;
	}

	//Use this from inside the server to update an item
	updateInternalObject(id, data) {
		let item = this.index.find(id);
		if (!item) {
			ABE.errorLog("[ABE-ERROR] CANT UPDATE", id);
			return;
		}
		item.hasUpdates = true;
		item.updates.push(data);
	}

	nudge(data) {
		const id = data.data.id;

		this.objects = this.index.getIndex("all");

		if (this.objects[id].nudges == undefined) {
			this.objects[id].nudges = 0;
		}

		this.objects[id].nudges++;
	}

	endNudge(data) {
		const id = data.data.id;
		this.objects = this.index.getIndex("all");
		this.objects[id].nudges--;

		if (this.objects[id].nudges < 1) {
			this.objects[id].nudge = false;
		}
	}

	calculateProjectileOutcome(sourceId, ray, projectile, collisions) {
		//Add logic for projectiles later
		for (let i = 0; i < collisions.length; i++) {
			//Ignore self
			if (collisions[i] == undefined) {
				continue;
			}
			if (collisions[i].body == undefined) {
				continue;
			}
			if (sourceId == collisions[i].body.sprite.id) {
				continue;
			}
			projectile.ray = ray;
			this.processCollision(this.objects[collisions[i].body.sprite.id], projectile);
		}
	}

	calculateBlastOutcome(sourceId, ray, projectile, collisions) {
		//Add logic for projectiles later

		for (let i = 0; i < collisions.length; i++) {
			let sprite = collisions[i].bodyB.sprite;

			if (collisions[i].bodyA.sprite !== undefined) {
				sprite = collisions[i].bodyA.sprite;
			}

			if (collisions[i].bodyA.sprite !== undefined && collisions[i].bodyB.sprite !== undefined) {
				//Dont ask
				if (collisions[i].bodyA.sprite.id == collisions[i].bodyB.sprite.id) {
					//Skip self
					continue;
				}
			}
			//Skip caster
			if (sourceId == sprite.id) {
				continue;
			}
			projectile.ray = ray;
			this.processCollision(this.objects[sprite.id], projectile);
		}
	}

	hitscan(data) {
		const ray = data.data;
		this.calculateProjectileOutcome(
			ray.id,
			ray,
			ray.projectile,
			this.colliderRay(ray.id, {x: ray.x, y: ray.y}, {x: ray.endX, y: ray.endY})
		);
	}

	blast(data) {
		const ray = data.data;
		this.calculateBlastOutcome(ray.id, ray, ray.projectile, this.collideInCircle(ray.id, ray.x, ray.y, ray.radius));
	}

	asyncTest(callback) {
		callback();
	}

	reduceDebug(msg) {
		if (this.dbgCounter == undefined || this.dbgCounter > 10000) {
			ABE.infoLog(msg);
			this.dbgCounter = 0;
		}
		this.dbgCounter++;
	}

	startServer() {
		//Client mode already started
	}

	//Path was sent by ServerPath
	receivePath(data) {
		const pathData = data.data;
		const life = this.index.getFromIndex(pathData.id, "life");
		if (!life) {
			ABE.errorLog("[ABE-ERROR] Tried to path for a broken ID (does not exist)", pathData.id);
			return false;
		}
		life.hasPath = true;
		life.path = pathData.path;
		life.searching = false;
	}

	avoid(item, body, speed) {
		let count = 0;
		if (typeof body.sep == "undefined") {
			body.sep = this.helper.rng(16, 24);
			body.speed = speed * (this.helper.rng(0, 10) / 100);
		}
		const sep = body.sep;
		const maxSpeed = body.speed;

		let sum = this.Vector.create(0, 0);

		let lives = this.index.getIndex("life");
		let keys = Object.keys(lives);
		for (let j = 0; j < keys.length; j++) {
			const life = lives[keys[j]];
			if (life.data.do == "becarried") {
				continue;
			}
			const d = this.helper.dist(body.position, life.body.position);
			if (d > 0 && d < sep) {
				let diff = this.Vector.sub(body.position, life.body.position);
				diff = this.Vector.normalise(diff);
				sum = this.Vector.add(sum, diff);
				count++;
			}
		}

		if (count == 0) {
			return sum;
		}

		sum = this.Vector.div(sum, count);
		sum = this.Vector.normalise(sum);

		return this.Vector.neg(this.Vector.mult(sum, maxSpeed));
	}

	mouseInfo(options) {
		this.mouse = options.data;
	}

	processDesiredVelocity(item, body, velData) {
		item.vector = false;
		let desired = this.Vector.create(0, 0);
		this.avoid(item, body, 1);

		if (velData !== undefined) {
			body.dir = velData.dir;
			let speed = velData.speed;
			let normalSpeed = speed;

			if (!item.data.drivingId) {
				speed = Algos.applyAthleticsToSpeed(speed, item.data.levels.athletics.level, item.data.isPlayer);
			}

			let maxWeight = Algos.getMaxWeight(item.data.stats.maxWeight, item.data.levels.strength.level);

			speed = Algos.applyWeightToSpeed(speed, item.data.stats.weight, maxWeight);

			if (item.data.drivingId) {
				speed *= 2;
			}

			const threshold = 128;
			const vecA = this.Vector.create(Math.ceil(body.position.x), Math.ceil(body.position.y));
			const vecB = this.Vector.create(velData.endX, velData.endY);
			const vecS = this.Vector.sub(vecA, vecB);
			const dist = this.helper.dist(vecA, vecB);

			//When the speed is fast, create a slowdown mechanism
			if (speed > 10 && velData.type == "arrive" && dist < threshold) {
				speed = this.helper.rangeMap(dist, 0, threshold, 0, normalSpeed);
			}

			desired = this.Vector.mult(this.Vector.neg(this.Vector.normalise(vecS)), 0.5 * speed);

			this.avoid(item, body, speed);
			item.vector = desired;
		}

		this.Body.setVelocity(body, desired);

		//this.Body.setVelocity(body, this.Vector.sub(desired, vecAvoid));

		if (item.data.physAvoid === false) ;
	}

	deadCheck(physObject) {
		if (physObject.data.dead) {
			physObject.body.isSensor = true;
		} else {
			if (physObject.data.isPlayer) {
				physObject.body.isSensor = false;
			}
		}
	}

	updateDir(physObject) {
		let vel = physObject.body.velocity;

		physObject.dir = physObject.data.dir || "down";

		if (!vel || isNaN(vel.x) || isNaN(vel.y) || (Math.abs(vel.x) < 0.25 && Math.abs(vel.y) < 0.25)) {
			return;
		}

		const angle = Math.atan2(vel.y, vel.x); //radians
		// you need to devide by PI, and MULTIPLY by 180:
		const degrees = (180 * angle) / Math.PI; //degrees
		vel = (360 + Math.round(degrees)) % 360; //round number, avoid decimal fragments
		if (!physObject.dir) {
			physObject.dir = this.getDirectionFromAngle(vel);
			return;
		}

		let newDir = this.getDirectionFromAngle(vel);

		if (!newDir) {
			newDir = physObject.dir;
		}

		physObject.dir = newDir;

		if (newDir !== physObject.lastDir) {
			physObject.lastDir = newDir;
		}
	}

	getDirectionFromAngle(angle) {
		if (isNaN(angle)) {
			return;
		}

		const origin = 90 + 90 + 90;
		const dOrigin = 90;
		const lOrigin = 90 + 90;

		let up = angle > origin - 45 && angle < origin + 45;
		let right = angle > 360 - 45 || angle < 45;
		let down = angle > dOrigin - 45 && angle < dOrigin + 45;
		let left = angle > lOrigin - 45 && angle < lOrigin + 45;

		if (up) {
			return "up";
		}
		if (right) {
			return "right";
		}
		if (down) {
			return "down";
		}
		if (left) {
			return "left";
		}
		return false;
	}

	bounds = {left: 0, top: 0, right: 100000, bottom: 100000};
	//May be ran 1 or more times during tick in order to update the engine.
	update(postback, delta) {
		this.objects = this.index.getIndex("all");

		if (Object.keys(this.objects).length == 0) {
			this.reduceDebug("No physics objects " + Math.floor(delta));
			return false; //No objects to calculate
		}
		this.reduceDebug(Object.keys(this.objects).length + " physics objects " + Math.floor(delta));
		//console.log(this.objects); //TODO: Turn this on every now and then and make sure nothing weird is in there
		//this.Engine.update(this.physEngine);
		let physData = [];
		const bounds = this.bounds;

		this.objects = this.index.getIndex("all");
		for (let spriteId in this.objects) {
			const physObject = this.objects[spriteId];

			if (typeof physObject.physicsTick == "function") {
				physObject.physicsTick();
			}

			if (physObject.events && typeof physObject.events.onPhysicsTick == "function") {
				try {
					physObject.events.onPhysicsTick.call(physObject);
				} catch (e) {
					//TODO: remove item from physics? remove function? no idea
					ABE.errorLog("[ABE] Error inside onPhysicTick " + physObject.codename);
					physObject.removePhysics = true; //Decided to remove,
					console.error(e);
				}
			}

			//It will remove physics if there are no updates
			if (
				(physObject.removePhysics && physObject.hasUpdates == false) ||
				(physObject.lifetime && physObject.lifetime < this.ts) ||
				(physObject.data.lifetime && physObject.data.lifetime < this.ts)
			) {
				physData.push({
					updates: physObject.updates,
					removePhysics: true,
					id: physObject.id
				});
				this.World.remove(this.physEngine.world, physObject.body);
				this.updateComposite();
				this.index.removeFromAllIndexes(physObject);
				continue;
			}

			if (physObject.skip) {
				continue;
			}

			if (physObject.baseClass == "BaseLife" || this.velocity[spriteId]) {
				this.processDesiredVelocity(physObject, physObject.body, this.velocity[spriteId]);
				delete this.velocity[spriteId];
			}

			if (
				physObject.body.position.x < bounds.left ||
				physObject.body.position.x > bounds.right ||
				physObject.body.position.y < bounds.top ||
				physObject.body.position.y > bounds.bottom
			) ;

			if (
				this.helper.dist({x: physObject.lastX, y: physObject.lastY}, physObject.body.position) > 2 ||
				physObject.updates.length > 0 ||
				physObject.lastY !== Math.ceil(physObject.body.position.y) ||
				physObject.lastX !== Math.ceil(physObject.body.position.x)
			) {
				//if (physObject.body.dir && physObject.dir !== physObject.body.dir) {
				//	physObject.dir = physObject.body.dir;
				//}
				physObject.x = Math.ceil(physObject.body.position.x);
				physObject.y = Math.ceil(physObject.body.position.y);

				//if(this.helper.rng(0,5)==1) {
				//    this.helper.debugObject(Math.ceil(physObject.body.position.x), Math.ceil(physObject.body.position.y), 20, 20);
				//}
				if (!physObject.dir) {
					physObject.dir = physObject.data.dir;
				}

				this.updateDir(physObject);
				this.deadCheck(physObject);

				physObject.data.dir = physObject.dir;

				physData.push({
					updates: physObject.updates,
					id: physObject.id,
					x: Math.ceil(physObject.body.position.x),
					y: Math.ceil(physObject.body.position.y),
					dir: physObject.dir,
					r: physObject.body.angle
				});
				physObject.updates = [];
				physObject.hasUpdates = false;
			}
		}
		if (physData.length > 0) {
			postback({action: "physUpdate", creatorId: "server", response: physData});
			postback({
				serverside: true,
				server: "world",
				action: "receivePhysics",
				creatorId: "server",
				response: physData
			});
			this.helper.worldUpdate("receivePhysics", physData);
		}
		physData = [];
	}

	tick(postback, engineEvent) {
		const timestep = 1000 / 60;
		const currentTime = new Date().getTime();
		this.delta += currentTime - this.lastTime;
		let numUpdateSteps = 0;

		while (this.delta >= timestep) {
			if (++numUpdateSteps >= 3) {
				//If the simulation steps last too long, just delta into 0 and snap all items into place.
				this.delta = 0;
			}

			this.c++;
			const interp = this.delta / timestep;

			//DO UPDATE HERE
			this.update(postback, interp);
			//END UPDATE

			this.delta -= timestep;
		}
		this.lastTime = currentTime;
		this.helper.measure(this);
	}
}

if (!globalThis.self && !global.self) {
	try {
		global.self = global;
	} catch (e) {}
}

let Emitter = Emitter$1;

const servers$1 = {
	physics: new ServerPhysics(Emitter),
	world: new ServerWorld(Emitter),
	disk: new ServerWorld(Emitter)
};

if (isLive()) {
	servers$1.path = new ServerPath(Emitter);
}

self.servers = servers$1;

class GameServer {
	constructor() {
		this.server = "Not set";
		this.ts = 0;
		
		this.factions = new Factions();

		this.servers = servers$1;
	}

	rng(min, max) {
		return Math.floor(min + Math.random() * (max + 1 - min));
	}

	onMessage(request, postMessage) {
		let data = request;

		if (!data.server && data.data) {
			data = data.data;
		}

		if (data.action == "pause") {
			console.error("Pause workers");
			try {
				this.servers.physics.runner.enabled = false;
			} catch (e) {}
			return;
		}

		if (data.action == "startPhysics") {
			console.log("Starting physics");

			this.servers.physics.Events.on(this.servers.physics.runner, "afterTick", (delta) => {
				this.servers.physics.tick((data) => {
					postMessage({
						time: Date.now(),
						tick: true,
						action: data.action,
						response: data.response,
						creatorId: data.creatorId,
						data: data
					});
				}, delta);
			});

			return true;
		}

		if (data.action == "startWorld") {
			this.servers.physics.Events.on(this.servers.physics.runner, "afterTick", (delta) => {
				this.servers.world.tick((data) => {
					try {
						postMessage({
							time: Date.now(),
							tick: true,
							action: data.action,
							response: data.response,
							creatorId: data.creatorId,
							data: data
						});
					} catch (e) {
						console.error("[ABE] Failed to parse object in server world");
						console.error(data);
						console.error(e);
					}
				}, delta);
			});
			return true;
		}

		if (data.async == true) {
			if (typeof this.servers[data.server][data.action] !== "function") {
				console.error("Attempted to execute: " + data.server + "->" + data.action + " but not exist ");
			} else {
				try {
					this.servers[data.server][data.action].call(this.servers[data.server], data, function (response) {
						postMessage({
							time: Date.now(),
							action: data.action,
							server: data.server,
							response: response,
							id: data.creatorId,
							data: data.data
						});
					});
				} catch (e) {
					console.error(`${data.server}, ${data.action}`, data);
					console.error(e);
				}
			}
		} else {
			if (!this.servers[data.server]) {
				console.error("PROBLEMATIC WORKER");
				console.error(data);
				debugger;
				console.error(JSON.stringify(data));
				console.error("PROBLEMATIC WORKER END");
			}
			if (typeof this.servers[data.server][data.action] !== "function") {
				console.error("Attempted to execute: " + data.server + "->" + data.action + " but not exist ");
			} else {
				try {
					var response = {
						time: Date.now(),
						action: data.action,
						server: data.server,
						response: this.servers[data.server][data.action](data),
						id: data.creatorId,
						data: data.data
					};
					//postMessage(response); //if you want to reply
				} catch (e) {
					console.error(`${data.server}, ${data.action}`, data);
					console.error(e);
				}
			}
		}
	}
}

class PathGameServer extends GameServer {
	constructor() {
		super();
		this.servers.path = new ServerPath(Emitter$1);
	}
}

const game$1 = new PathGameServer();

export { game$1 as default };
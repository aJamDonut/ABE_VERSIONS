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

/*! For license information please see bundle.min.js.LICENSE.txt */
var __webpack_modules__ = {
		"./node_modules/matter-js/build/matter.js": function (
			module,
			__unused_webpack_exports,
			__webpack_require__
		) {
			eval(
				"/*!\n * matter-js 0.19.0 by @liabru\n * http://brm.io/matter-js/\n * License MIT\n * \n * The MIT License (MIT)\n * \n * Copyright (c) Liam Brummitt and contributors.\n * \n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n * \n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n * \n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n(function webpackUniversalModuleDefinition(root, factory) {\n\tif(true)\n\t\tmodule.exports = factory();\n\telse {}\n})(this, function() {\nreturn /******/ (function(modules) { // webpackBootstrap\n/******/ \t// The module cache\n/******/ \tvar installedModules = {};\n/******/\n/******/ \t// The require function\n/******/ \tfunction __nested_webpack_require_1787__(moduleId) {\n/******/\n/******/ \t\t// Check if module is in cache\n/******/ \t\tif(installedModules[moduleId]) {\n/******/ \t\t\treturn installedModules[moduleId].exports;\n/******/ \t\t}\n/******/ \t\t// Create a new module (and put it into the cache)\n/******/ \t\tvar module = installedModules[moduleId] = {\n/******/ \t\t\ti: moduleId,\n/******/ \t\t\tl: false,\n/******/ \t\t\texports: {}\n/******/ \t\t};\n/******/\n/******/ \t\t// Execute the module function\n/******/ \t\tmodules[moduleId].call(module.exports, module, module.exports, __nested_webpack_require_1787__);\n/******/\n/******/ \t\t// Flag the module as loaded\n/******/ \t\tmodule.l = true;\n/******/\n/******/ \t\t// Return the exports of the module\n/******/ \t\treturn module.exports;\n/******/ \t}\n/******/\n/******/\n/******/ \t// expose the modules object (__webpack_modules__)\n/******/ \t__nested_webpack_require_1787__.m = modules;\n/******/\n/******/ \t// expose the module cache\n/******/ \t__nested_webpack_require_1787__.c = installedModules;\n/******/\n/******/ \t// define getter function for harmony exports\n/******/ \t__nested_webpack_require_1787__.d = function(exports, name, getter) {\n/******/ \t\tif(!__nested_webpack_require_1787__.o(exports, name)) {\n/******/ \t\t\tObject.defineProperty(exports, name, { enumerable: true, get: getter });\n/******/ \t\t}\n/******/ \t};\n/******/\n/******/ \t// define __esModule on exports\n/******/ \t__nested_webpack_require_1787__.r = function(exports) {\n/******/ \t\tif(typeof Symbol !== 'undefined' && Symbol.toStringTag) {\n/******/ \t\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });\n/******/ \t\t}\n/******/ \t\tObject.defineProperty(exports, '__esModule', { value: true });\n/******/ \t};\n/******/\n/******/ \t// create a fake namespace object\n/******/ \t// mode & 1: value is a module id, require it\n/******/ \t// mode & 2: merge all properties of value into the ns\n/******/ \t// mode & 4: return value when already ns object\n/******/ \t// mode & 8|1: behave like require\n/******/ \t__nested_webpack_require_1787__.t = function(value, mode) {\n/******/ \t\tif(mode & 1) value = __nested_webpack_require_1787__(value);\n/******/ \t\tif(mode & 8) return value;\n/******/ \t\tif((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;\n/******/ \t\tvar ns = Object.create(null);\n/******/ \t\t__nested_webpack_require_1787__.r(ns);\n/******/ \t\tObject.defineProperty(ns, 'default', { enumerable: true, value: value });\n/******/ \t\tif(mode & 2 && typeof value != 'string') for(var key in value) __nested_webpack_require_1787__.d(ns, key, function(key) { return value[key]; }.bind(null, key));\n/******/ \t\treturn ns;\n/******/ \t};\n/******/\n/******/ \t// getDefaultExport function for compatibility with non-harmony modules\n/******/ \t__nested_webpack_require_1787__.n = function(module) {\n/******/ \t\tvar getter = module && module.__esModule ?\n/******/ \t\t\tfunction getDefault() { return module['default']; } :\n/******/ \t\t\tfunction getModuleExports() { return module; };\n/******/ \t\t__nested_webpack_require_1787__.d(getter, 'a', getter);\n/******/ \t\treturn getter;\n/******/ \t};\n/******/\n/******/ \t// Object.prototype.hasOwnProperty.call\n/******/ \t__nested_webpack_require_1787__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };\n/******/\n/******/ \t// __webpack_public_path__\n/******/ \t__nested_webpack_require_1787__.p = \"\";\n/******/\n/******/\n/******/ \t// Load entry module and return exports\n/******/ \treturn __nested_webpack_require_1787__(__nested_webpack_require_1787__.s = 20);\n/******/ })\n/************************************************************************/\n/******/ ([\n/* 0 */\n/***/ (function(module, exports) {\n\n/**\n* The `Matter.Common` module contains utility functions that are common to all modules.\n*\n* @class Common\n*/\n\nvar Common = {};\n\nmodule.exports = Common;\n\n(function() {\n\n    Common._baseDelta = 1000 / 60;\n    Common._nextId = 0;\n    Common._seed = 0;\n    Common._nowStartTime = +(new Date());\n    Common._warnedOnce = {};\n    Common._decomp = null;\n    \n    /**\n     * Extends the object in the first argument using the object in the second argument.\n     * @method extend\n     * @param {} obj\n     * @param {boolean} deep\n     * @return {} obj extended\n     */\n    Common.extend = function(obj, deep) {\n        var argsStart,\n            args,\n            deepClone;\n\n        if (typeof deep === 'boolean') {\n            argsStart = 2;\n            deepClone = deep;\n        } else {\n            argsStart = 1;\n            deepClone = true;\n        }\n\n        for (var i = argsStart; i < arguments.length; i++) {\n            var source = arguments[i];\n\n            if (source) {\n                for (var prop in source) {\n                    if (deepClone && source[prop] && source[prop].constructor === Object) {\n                        if (!obj[prop] || obj[prop].constructor === Object) {\n                            obj[prop] = obj[prop] || {};\n                            Common.extend(obj[prop], deepClone, source[prop]);\n                        } else {\n                            obj[prop] = source[prop];\n                        }\n                    } else {\n                        obj[prop] = source[prop];\n                    }\n                }\n            }\n        }\n        \n        return obj;\n    };\n\n    /**\n     * Creates a new clone of the object, if deep is true references will also be cloned.\n     * @method clone\n     * @param {} obj\n     * @param {bool} deep\n     * @return {} obj cloned\n     */\n    Common.clone = function(obj, deep) {\n        return Common.extend({}, deep, obj);\n    };\n\n    /**\n     * Returns the list of keys for the given object.\n     * @method keys\n     * @param {} obj\n     * @return {string[]} keys\n     */\n    Common.keys = function(obj) {\n        if (Object.keys)\n            return Object.keys(obj);\n\n        // avoid hasOwnProperty for performance\n        var keys = [];\n        for (var key in obj)\n            keys.push(key);\n        return keys;\n    };\n\n    /**\n     * Returns the list of values for the given object.\n     * @method values\n     * @param {} obj\n     * @return {array} Array of the objects property values\n     */\n    Common.values = function(obj) {\n        var values = [];\n        \n        if (Object.keys) {\n            var keys = Object.keys(obj);\n            for (var i = 0; i < keys.length; i++) {\n                values.push(obj[keys[i]]);\n            }\n            return values;\n        }\n        \n        // avoid hasOwnProperty for performance\n        for (var key in obj)\n            values.push(obj[key]);\n        return values;\n    };\n\n    /**\n     * Gets a value from `base` relative to the `path` string.\n     * @method get\n     * @param {} obj The base object\n     * @param {string} path The path relative to `base`, e.g. 'Foo.Bar.baz'\n     * @param {number} [begin] Path slice begin\n     * @param {number} [end] Path slice end\n     * @return {} The object at the given path\n     */\n    Common.get = function(obj, path, begin, end) {\n        path = path.split('.').slice(begin, end);\n\n        for (var i = 0; i < path.length; i += 1) {\n            obj = obj[path[i]];\n        }\n\n        return obj;\n    };\n\n    /**\n     * Sets a value on `base` relative to the given `path` string.\n     * @method set\n     * @param {} obj The base object\n     * @param {string} path The path relative to `base`, e.g. 'Foo.Bar.baz'\n     * @param {} val The value to set\n     * @param {number} [begin] Path slice begin\n     * @param {number} [end] Path slice end\n     * @return {} Pass through `val` for chaining\n     */\n    Common.set = function(obj, path, val, begin, end) {\n        var parts = path.split('.').slice(begin, end);\n        Common.get(obj, path, 0, -1)[parts[parts.length - 1]] = val;\n        return val;\n    };\n\n    /**\n     * Shuffles the given array in-place.\n     * The function uses a seeded random generator.\n     * @method shuffle\n     * @param {array} array\n     * @return {array} array shuffled randomly\n     */\n    Common.shuffle = function(array) {\n        for (var i = array.length - 1; i > 0; i--) {\n            var j = Math.floor(Common.random() * (i + 1));\n            var temp = array[i];\n            array[i] = array[j];\n            array[j] = temp;\n        }\n        return array;\n    };\n\n    /**\n     * Randomly chooses a value from a list with equal probability.\n     * The function uses a seeded random generator.\n     * @method choose\n     * @param {array} choices\n     * @return {object} A random choice object from the array\n     */\n    Common.choose = function(choices) {\n        return choices[Math.floor(Common.random() * choices.length)];\n    };\n\n    /**\n     * Returns true if the object is a HTMLElement, otherwise false.\n     * @method isElement\n     * @param {object} obj\n     * @return {boolean} True if the object is a HTMLElement, otherwise false\n     */\n    Common.isElement = function(obj) {\n        if (typeof HTMLElement !== 'undefined') {\n            return obj instanceof HTMLElement;\n        }\n\n        return !!(obj && obj.nodeType && obj.nodeName);\n    };\n\n    /**\n     * Returns true if the object is an array.\n     * @method isArray\n     * @param {object} obj\n     * @return {boolean} True if the object is an array, otherwise false\n     */\n    Common.isArray = function(obj) {\n        return Object.prototype.toString.call(obj) === '[object Array]';\n    };\n\n    /**\n     * Returns true if the object is a function.\n     * @method isFunction\n     * @param {object} obj\n     * @return {boolean} True if the object is a function, otherwise false\n     */\n    Common.isFunction = function(obj) {\n        return typeof obj === \"function\";\n    };\n\n    /**\n     * Returns true if the object is a plain object.\n     * @method isPlainObject\n     * @param {object} obj\n     * @return {boolean} True if the object is a plain object, otherwise false\n     */\n    Common.isPlainObject = function(obj) {\n        return typeof obj === 'object' && obj.constructor === Object;\n    };\n\n    /**\n     * Returns true if the object is a string.\n     * @method isString\n     * @param {object} obj\n     * @return {boolean} True if the object is a string, otherwise false\n     */\n    Common.isString = function(obj) {\n        return toString.call(obj) === '[object String]';\n    };\n    \n    /**\n     * Returns the given value clamped between a minimum and maximum value.\n     * @method clamp\n     * @param {number} value\n     * @param {number} min\n     * @param {number} max\n     * @return {number} The value clamped between min and max inclusive\n     */\n    Common.clamp = function(value, min, max) {\n        if (value < min)\n            return min;\n        if (value > max)\n            return max;\n        return value;\n    };\n    \n    /**\n     * Returns the sign of the given value.\n     * @method sign\n     * @param {number} value\n     * @return {number} -1 if negative, +1 if 0 or positive\n     */\n    Common.sign = function(value) {\n        return value < 0 ? -1 : 1;\n    };\n    \n    /**\n     * Returns the current timestamp since the time origin (e.g. from page load).\n     * The result is in milliseconds and will use high-resolution timing if available.\n     * @method now\n     * @return {number} the current timestamp in milliseconds\n     */\n    Common.now = function() {\n        if (typeof window !== 'undefined' && window.performance) {\n            if (window.performance.now) {\n                return window.performance.now();\n            } else if (window.performance.webkitNow) {\n                return window.performance.webkitNow();\n            }\n        }\n\n        if (Date.now) {\n            return Date.now();\n        }\n\n        return (new Date()) - Common._nowStartTime;\n    };\n    \n    /**\n     * Returns a random value between a minimum and a maximum value inclusive.\n     * The function uses a seeded random generator.\n     * @method random\n     * @param {number} min\n     * @param {number} max\n     * @return {number} A random number between min and max inclusive\n     */\n    Common.random = function(min, max) {\n        min = (typeof min !== \"undefined\") ? min : 0;\n        max = (typeof max !== \"undefined\") ? max : 1;\n        return min + _seededRandom() * (max - min);\n    };\n\n    var _seededRandom = function() {\n        // https://en.wikipedia.org/wiki/Linear_congruential_generator\n        Common._seed = (Common._seed * 9301 + 49297) % 233280;\n        return Common._seed / 233280;\n    };\n\n    /**\n     * Converts a CSS hex colour string into an integer.\n     * @method colorToNumber\n     * @param {string} colorString\n     * @return {number} An integer representing the CSS hex string\n     */\n    Common.colorToNumber = function(colorString) {\n        colorString = colorString.replace('#','');\n\n        if (colorString.length == 3) {\n            colorString = colorString.charAt(0) + colorString.charAt(0)\n                        + colorString.charAt(1) + colorString.charAt(1)\n                        + colorString.charAt(2) + colorString.charAt(2);\n        }\n\n        return parseInt(colorString, 16);\n    };\n\n    /**\n     * The console logging level to use, where each level includes all levels above and excludes the levels below.\n     * The default level is 'debug' which shows all console messages.  \n     *\n     * Possible level values are:\n     * - 0 = None\n     * - 1 = Debug\n     * - 2 = Info\n     * - 3 = Warn\n     * - 4 = Error\n     * @static\n     * @property logLevel\n     * @type {Number}\n     * @default 1\n     */\n    Common.logLevel = 1;\n\n    /**\n     * Shows a `console.log` message only if the current `Common.logLevel` allows it.\n     * The message will be prefixed with 'matter-js' to make it easily identifiable.\n     * @method log\n     * @param ...objs {} The objects to log.\n     */\n    Common.log = function() {\n        if (console && Common.logLevel > 0 && Common.logLevel <= 3) {\n            console.log.apply(console, ['matter-js:'].concat(Array.prototype.slice.call(arguments)));\n        }\n    };\n\n    /**\n     * Shows a `console.info` message only if the current `Common.logLevel` allows it.\n     * The message will be prefixed with 'matter-js' to make it easily identifiable.\n     * @method info\n     * @param ...objs {} The objects to log.\n     */\n    Common.info = function() {\n        if (console && Common.logLevel > 0 && Common.logLevel <= 2) {\n            console.info.apply(console, ['matter-js:'].concat(Array.prototype.slice.call(arguments)));\n        }\n    };\n\n    /**\n     * Shows a `console.warn` message only if the current `Common.logLevel` allows it.\n     * The message will be prefixed with 'matter-js' to make it easily identifiable.\n     * @method warn\n     * @param ...objs {} The objects to log.\n     */\n    Common.warn = function() {\n        if (console && Common.logLevel > 0 && Common.logLevel <= 3) {\n            console.warn.apply(console, ['matter-js:'].concat(Array.prototype.slice.call(arguments)));\n        }\n    };\n\n    /**\n     * Uses `Common.warn` to log the given message one time only.\n     * @method warnOnce\n     * @param ...objs {} The objects to log.\n     */\n    Common.warnOnce = function() {\n        var message = Array.prototype.slice.call(arguments).join(' ');\n\n        if (!Common._warnedOnce[message]) {\n            Common.warn(message);\n            Common._warnedOnce[message] = true;\n        }\n    };\n\n    /**\n     * Shows a deprecated console warning when the function on the given object is called.\n     * The target function will be replaced with a new function that first shows the warning\n     * and then calls the original function.\n     * @method deprecated\n     * @param {object} obj The object or module\n     * @param {string} name The property name of the function on obj\n     * @param {string} warning The one-time message to show if the function is called\n     */\n    Common.deprecated = function(obj, prop, warning) {\n        obj[prop] = Common.chain(function() {\n            Common.warnOnce('🔅 deprecated 🔅', warning);\n        }, obj[prop]);\n    };\n\n    /**\n     * Returns the next unique sequential ID.\n     * @method nextId\n     * @return {Number} Unique sequential ID\n     */\n    Common.nextId = function() {\n        return Common._nextId++;\n    };\n\n    /**\n     * A cross browser compatible indexOf implementation.\n     * @method indexOf\n     * @param {array} haystack\n     * @param {object} needle\n     * @return {number} The position of needle in haystack, otherwise -1.\n     */\n    Common.indexOf = function(haystack, needle) {\n        if (haystack.indexOf)\n            return haystack.indexOf(needle);\n\n        for (var i = 0; i < haystack.length; i++) {\n            if (haystack[i] === needle)\n                return i;\n        }\n\n        return -1;\n    };\n\n    /**\n     * A cross browser compatible array map implementation.\n     * @method map\n     * @param {array} list\n     * @param {function} func\n     * @return {array} Values from list transformed by func.\n     */\n    Common.map = function(list, func) {\n        if (list.map) {\n            return list.map(func);\n        }\n\n        var mapped = [];\n\n        for (var i = 0; i < list.length; i += 1) {\n            mapped.push(func(list[i]));\n        }\n\n        return mapped;\n    };\n\n    /**\n     * Takes a directed graph and returns the partially ordered set of vertices in topological order.\n     * Circular dependencies are allowed.\n     * @method topologicalSort\n     * @param {object} graph\n     * @return {array} Partially ordered set of vertices in topological order.\n     */\n    Common.topologicalSort = function(graph) {\n        // https://github.com/mgechev/javascript-algorithms\n        // Copyright (c) Minko Gechev (MIT license)\n        // Modifications: tidy formatting and naming\n        var result = [],\n            visited = [],\n            temp = [];\n\n        for (var node in graph) {\n            if (!visited[node] && !temp[node]) {\n                Common._topologicalSort(node, visited, temp, graph, result);\n            }\n        }\n\n        return result;\n    };\n\n    Common._topologicalSort = function(node, visited, temp, graph, result) {\n        var neighbors = graph[node] || [];\n        temp[node] = true;\n\n        for (var i = 0; i < neighbors.length; i += 1) {\n            var neighbor = neighbors[i];\n\n            if (temp[neighbor]) {\n                // skip circular dependencies\n                continue;\n            }\n\n            if (!visited[neighbor]) {\n                Common._topologicalSort(neighbor, visited, temp, graph, result);\n            }\n        }\n\n        temp[node] = false;\n        visited[node] = true;\n\n        result.push(node);\n    };\n\n    /**\n     * Takes _n_ functions as arguments and returns a new function that calls them in order.\n     * The arguments applied when calling the new function will also be applied to every function passed.\n     * The value of `this` refers to the last value returned in the chain that was not `undefined`.\n     * Therefore if a passed function does not return a value, the previously returned value is maintained.\n     * After all passed functions have been called the new function returns the last returned value (if any).\n     * If any of the passed functions are a chain, then the chain will be flattened.\n     * @method chain\n     * @param ...funcs {function} The functions to chain.\n     * @return {function} A new function that calls the passed functions in order.\n     */\n    Common.chain = function() {\n        var funcs = [];\n\n        for (var i = 0; i < arguments.length; i += 1) {\n            var func = arguments[i];\n\n            if (func._chained) {\n                // flatten already chained functions\n                funcs.push.apply(funcs, func._chained);\n            } else {\n                funcs.push(func);\n            }\n        }\n\n        var chain = function() {\n            // https://github.com/GoogleChrome/devtools-docs/issues/53#issuecomment-51941358\n            var lastResult,\n                args = new Array(arguments.length);\n\n            for (var i = 0, l = arguments.length; i < l; i++) {\n                args[i] = arguments[i];\n            }\n\n            for (i = 0; i < funcs.length; i += 1) {\n                var result = funcs[i].apply(lastResult, args);\n\n                if (typeof result !== 'undefined') {\n                    lastResult = result;\n                }\n            }\n\n            return lastResult;\n        };\n\n        chain._chained = funcs;\n\n        return chain;\n    };\n\n    /**\n     * Chains a function to excute before the original function on the given `path` relative to `base`.\n     * See also docs for `Common.chain`.\n     * @method chainPathBefore\n     * @param {} base The base object\n     * @param {string} path The path relative to `base`\n     * @param {function} func The function to chain before the original\n     * @return {function} The chained function that replaced the original\n     */\n    Common.chainPathBefore = function(base, path, func) {\n        return Common.set(base, path, Common.chain(\n            func,\n            Common.get(base, path)\n        ));\n    };\n\n    /**\n     * Chains a function to excute after the original function on the given `path` relative to `base`.\n     * See also docs for `Common.chain`.\n     * @method chainPathAfter\n     * @param {} base The base object\n     * @param {string} path The path relative to `base`\n     * @param {function} func The function to chain after the original\n     * @return {function} The chained function that replaced the original\n     */\n    Common.chainPathAfter = function(base, path, func) {\n        return Common.set(base, path, Common.chain(\n            Common.get(base, path),\n            func\n        ));\n    };\n\n    /**\n     * Provide the [poly-decomp](https://github.com/schteppe/poly-decomp.js) library module to enable\n     * concave vertex decomposition support when using `Bodies.fromVertices` e.g. `Common.setDecomp(require('poly-decomp'))`.\n     * @method setDecomp\n     * @param {} decomp The [poly-decomp](https://github.com/schteppe/poly-decomp.js) library module.\n     */\n    Common.setDecomp = function(decomp) {\n        Common._decomp = decomp;\n    };\n\n    /**\n     * Returns the [poly-decomp](https://github.com/schteppe/poly-decomp.js) library module provided through `Common.setDecomp`,\n     * otherwise returns the global `decomp` if set.\n     * @method getDecomp\n     * @return {} The [poly-decomp](https://github.com/schteppe/poly-decomp.js) library module if provided.\n     */\n    Common.getDecomp = function() {\n        // get user provided decomp if set\n        var decomp = Common._decomp;\n\n        try {\n            // otherwise from window global\n            if (!decomp && typeof window !== 'undefined') {\n                decomp = window.decomp;\n            }\n    \n            // otherwise from node global\n            if (!decomp && typeof __webpack_require__.g !== 'undefined') {\n                decomp = __webpack_require__.g.decomp;\n            }\n        } catch (e) {\n            // decomp not available\n            decomp = null;\n        }\n\n        return decomp;\n    };\n})();\n\n\n/***/ }),\n/* 1 */\n/***/ (function(module, exports) {\n\n/**\n* The `Matter.Bounds` module contains methods for creating and manipulating axis-aligned bounding boxes (AABB).\n*\n* @class Bounds\n*/\n\nvar Bounds = {};\n\nmodule.exports = Bounds;\n\n(function() {\n\n    /**\n     * Creates a new axis-aligned bounding box (AABB) for the given vertices.\n     * @method create\n     * @param {vertices} vertices\n     * @return {bounds} A new bounds object\n     */\n    Bounds.create = function(vertices) {\n        var bounds = { \n            min: { x: 0, y: 0 }, \n            max: { x: 0, y: 0 }\n        };\n\n        if (vertices)\n            Bounds.update(bounds, vertices);\n        \n        return bounds;\n    };\n\n    /**\n     * Updates bounds using the given vertices and extends the bounds given a velocity.\n     * @method update\n     * @param {bounds} bounds\n     * @param {vertices} vertices\n     * @param {vector} velocity\n     */\n    Bounds.update = function(bounds, vertices, velocity) {\n        bounds.min.x = Infinity;\n        bounds.max.x = -Infinity;\n        bounds.min.y = Infinity;\n        bounds.max.y = -Infinity;\n\n        for (var i = 0; i < vertices.length; i++) {\n            var vertex = vertices[i];\n            if (vertex.x > bounds.max.x) bounds.max.x = vertex.x;\n            if (vertex.x < bounds.min.x) bounds.min.x = vertex.x;\n            if (vertex.y > bounds.max.y) bounds.max.y = vertex.y;\n            if (vertex.y < bounds.min.y) bounds.min.y = vertex.y;\n        }\n        \n        if (velocity) {\n            if (velocity.x > 0) {\n                bounds.max.x += velocity.x;\n            } else {\n                bounds.min.x += velocity.x;\n            }\n            \n            if (velocity.y > 0) {\n                bounds.max.y += velocity.y;\n            } else {\n                bounds.min.y += velocity.y;\n            }\n        }\n    };\n\n    /**\n     * Returns true if the bounds contains the given point.\n     * @method contains\n     * @param {bounds} bounds\n     * @param {vector} point\n     * @return {boolean} True if the bounds contain the point, otherwise false\n     */\n    Bounds.contains = function(bounds, point) {\n        return point.x >= bounds.min.x && point.x <= bounds.max.x \n               && point.y >= bounds.min.y && point.y <= bounds.max.y;\n    };\n\n    /**\n     * Returns true if the two bounds intersect.\n     * @method overlaps\n     * @param {bounds} boundsA\n     * @param {bounds} boundsB\n     * @return {boolean} True if the bounds overlap, otherwise false\n     */\n    Bounds.overlaps = function(boundsA, boundsB) {\n        return (boundsA.min.x <= boundsB.max.x && boundsA.max.x >= boundsB.min.x\n                && boundsA.max.y >= boundsB.min.y && boundsA.min.y <= boundsB.max.y);\n    };\n\n    /**\n     * Translates the bounds by the given vector.\n     * @method translate\n     * @param {bounds} bounds\n     * @param {vector} vector\n     */\n    Bounds.translate = function(bounds, vector) {\n        bounds.min.x += vector.x;\n        bounds.max.x += vector.x;\n        bounds.min.y += vector.y;\n        bounds.max.y += vector.y;\n    };\n\n    /**\n     * Shifts the bounds to the given position.\n     * @method shift\n     * @param {bounds} bounds\n     * @param {vector} position\n     */\n    Bounds.shift = function(bounds, position) {\n        var deltaX = bounds.max.x - bounds.min.x,\n            deltaY = bounds.max.y - bounds.min.y;\n            \n        bounds.min.x = position.x;\n        bounds.max.x = position.x + deltaX;\n        bounds.min.y = position.y;\n        bounds.max.y = position.y + deltaY;\n    };\n    \n})();\n\n\n/***/ }),\n/* 2 */\n/***/ (function(module, exports) {\n\n/**\n* The `Matter.Vector` module contains methods for creating and manipulating vectors.\n* Vectors are the basis of all the geometry related operations in the engine.\n* A `Matter.Vector` object is of the form `{ x: 0, y: 0 }`.\n*\n* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).\n*\n* @class Vector\n*/\n\n// TODO: consider params for reusing vector objects\n\nvar Vector = {};\n\nmodule.exports = Vector;\n\n(function() {\n\n    /**\n     * Creates a new vector.\n     * @method create\n     * @param {number} x\n     * @param {number} y\n     * @return {vector} A new vector\n     */\n    Vector.create = function(x, y) {\n        return { x: x || 0, y: y || 0 };\n    };\n\n    /**\n     * Returns a new vector with `x` and `y` copied from the given `vector`.\n     * @method clone\n     * @param {vector} vector\n     * @return {vector} A new cloned vector\n     */\n    Vector.clone = function(vector) {\n        return { x: vector.x, y: vector.y };\n    };\n\n    /**\n     * Returns the magnitude (length) of a vector.\n     * @method magnitude\n     * @param {vector} vector\n     * @return {number} The magnitude of the vector\n     */\n    Vector.magnitude = function(vector) {\n        return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));\n    };\n\n    /**\n     * Returns the magnitude (length) of a vector (therefore saving a `sqrt` operation).\n     * @method magnitudeSquared\n     * @param {vector} vector\n     * @return {number} The squared magnitude of the vector\n     */\n    Vector.magnitudeSquared = function(vector) {\n        return (vector.x * vector.x) + (vector.y * vector.y);\n    };\n\n    /**\n     * Rotates the vector about (0, 0) by specified angle.\n     * @method rotate\n     * @param {vector} vector\n     * @param {number} angle\n     * @param {vector} [output]\n     * @return {vector} The vector rotated about (0, 0)\n     */\n    Vector.rotate = function(vector, angle, output) {\n        var cos = Math.cos(angle), sin = Math.sin(angle);\n        if (!output) output = {};\n        var x = vector.x * cos - vector.y * sin;\n        output.y = vector.x * sin + vector.y * cos;\n        output.x = x;\n        return output;\n    };\n\n    /**\n     * Rotates the vector about a specified point by specified angle.\n     * @method rotateAbout\n     * @param {vector} vector\n     * @param {number} angle\n     * @param {vector} point\n     * @param {vector} [output]\n     * @return {vector} A new vector rotated about the point\n     */\n    Vector.rotateAbout = function(vector, angle, point, output) {\n        var cos = Math.cos(angle), sin = Math.sin(angle);\n        if (!output) output = {};\n        var x = point.x + ((vector.x - point.x) * cos - (vector.y - point.y) * sin);\n        output.y = point.y + ((vector.x - point.x) * sin + (vector.y - point.y) * cos);\n        output.x = x;\n        return output;\n    };\n\n    /**\n     * Normalises a vector (such that its magnitude is `1`).\n     * @method normalise\n     * @param {vector} vector\n     * @return {vector} A new vector normalised\n     */\n    Vector.normalise = function(vector) {\n        var magnitude = Vector.magnitude(vector);\n        if (magnitude === 0)\n            return { x: 0, y: 0 };\n        return { x: vector.x / magnitude, y: vector.y / magnitude };\n    };\n\n    /**\n     * Returns the dot-product of two vectors.\n     * @method dot\n     * @param {vector} vectorA\n     * @param {vector} vectorB\n     * @return {number} The dot product of the two vectors\n     */\n    Vector.dot = function(vectorA, vectorB) {\n        return (vectorA.x * vectorB.x) + (vectorA.y * vectorB.y);\n    };\n\n    /**\n     * Returns the cross-product of two vectors.\n     * @method cross\n     * @param {vector} vectorA\n     * @param {vector} vectorB\n     * @return {number} The cross product of the two vectors\n     */\n    Vector.cross = function(vectorA, vectorB) {\n        return (vectorA.x * vectorB.y) - (vectorA.y * vectorB.x);\n    };\n\n    /**\n     * Returns the cross-product of three vectors.\n     * @method cross3\n     * @param {vector} vectorA\n     * @param {vector} vectorB\n     * @param {vector} vectorC\n     * @return {number} The cross product of the three vectors\n     */\n    Vector.cross3 = function(vectorA, vectorB, vectorC) {\n        return (vectorB.x - vectorA.x) * (vectorC.y - vectorA.y) - (vectorB.y - vectorA.y) * (vectorC.x - vectorA.x);\n    };\n\n    /**\n     * Adds the two vectors.\n     * @method add\n     * @param {vector} vectorA\n     * @param {vector} vectorB\n     * @param {vector} [output]\n     * @return {vector} A new vector of vectorA and vectorB added\n     */\n    Vector.add = function(vectorA, vectorB, output) {\n        if (!output) output = {};\n        output.x = vectorA.x + vectorB.x;\n        output.y = vectorA.y + vectorB.y;\n        return output;\n    };\n\n    /**\n     * Subtracts the two vectors.\n     * @method sub\n     * @param {vector} vectorA\n     * @param {vector} vectorB\n     * @param {vector} [output]\n     * @return {vector} A new vector of vectorA and vectorB subtracted\n     */\n    Vector.sub = function(vectorA, vectorB, output) {\n        if (!output) output = {};\n        output.x = vectorA.x - vectorB.x;\n        output.y = vectorA.y - vectorB.y;\n        return output;\n    };\n\n    /**\n     * Multiplies a vector and a scalar.\n     * @method mult\n     * @param {vector} vector\n     * @param {number} scalar\n     * @return {vector} A new vector multiplied by scalar\n     */\n    Vector.mult = function(vector, scalar) {\n        return { x: vector.x * scalar, y: vector.y * scalar };\n    };\n\n    /**\n     * Divides a vector and a scalar.\n     * @method div\n     * @param {vector} vector\n     * @param {number} scalar\n     * @return {vector} A new vector divided by scalar\n     */\n    Vector.div = function(vector, scalar) {\n        return { x: vector.x / scalar, y: vector.y / scalar };\n    };\n\n    /**\n     * Returns the perpendicular vector. Set `negate` to true for the perpendicular in the opposite direction.\n     * @method perp\n     * @param {vector} vector\n     * @param {bool} [negate=false]\n     * @return {vector} The perpendicular vector\n     */\n    Vector.perp = function(vector, negate) {\n        negate = negate === true ? -1 : 1;\n        return { x: negate * -vector.y, y: negate * vector.x };\n    };\n\n    /**\n     * Negates both components of a vector such that it points in the opposite direction.\n     * @method neg\n     * @param {vector} vector\n     * @return {vector} The negated vector\n     */\n    Vector.neg = function(vector) {\n        return { x: -vector.x, y: -vector.y };\n    };\n\n    /**\n     * Returns the angle between the vector `vectorB - vectorA` and the x-axis in radians.\n     * @method angle\n     * @param {vector} vectorA\n     * @param {vector} vectorB\n     * @return {number} The angle in radians\n     */\n    Vector.angle = function(vectorA, vectorB) {\n        return Math.atan2(vectorB.y - vectorA.y, vectorB.x - vectorA.x);\n    };\n\n    /**\n     * Temporary vector pool (not thread-safe).\n     * @property _temp\n     * @type {vector[]}\n     * @private\n     */\n    Vector._temp = [\n        Vector.create(), Vector.create(), \n        Vector.create(), Vector.create(), \n        Vector.create(), Vector.create()\n    ];\n\n})();\n\n/***/ }),\n/* 3 */\n/***/ (function(module, exports, __nested_webpack_require_35421__) {\n\n/**\n* The `Matter.Vertices` module contains methods for creating and manipulating sets of vertices.\n* A set of vertices is an array of `Matter.Vector` with additional indexing properties inserted by `Vertices.create`.\n* A `Matter.Body` maintains a set of vertices to represent the shape of the object (its convex hull).\n*\n* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).\n*\n* @class Vertices\n*/\n\nvar Vertices = {};\n\nmodule.exports = Vertices;\n\nvar Vector = __nested_webpack_require_35421__(2);\nvar Common = __nested_webpack_require_35421__(0);\n\n(function() {\n\n    /**\n     * Creates a new set of `Matter.Body` compatible vertices.\n     * The `points` argument accepts an array of `Matter.Vector` points orientated around the origin `(0, 0)`, for example:\n     *\n     *     [{ x: 0, y: 0 }, { x: 25, y: 50 }, { x: 50, y: 0 }]\n     *\n     * The `Vertices.create` method returns a new array of vertices, which are similar to Matter.Vector objects,\n     * but with some additional references required for efficient collision detection routines.\n     *\n     * Vertices must be specified in clockwise order.\n     *\n     * Note that the `body` argument is not optional, a `Matter.Body` reference must be provided.\n     *\n     * @method create\n     * @param {vector[]} points\n     * @param {body} body\n     */\n    Vertices.create = function(points, body) {\n        var vertices = [];\n\n        for (var i = 0; i < points.length; i++) {\n            var point = points[i],\n                vertex = {\n                    x: point.x,\n                    y: point.y,\n                    index: i,\n                    body: body,\n                    isInternal: false\n                };\n\n            vertices.push(vertex);\n        }\n\n        return vertices;\n    };\n\n    /**\n     * Parses a string containing ordered x y pairs separated by spaces (and optionally commas), \n     * into a `Matter.Vertices` object for the given `Matter.Body`.\n     * For parsing SVG paths, see `Svg.pathToVertices`.\n     * @method fromPath\n     * @param {string} path\n     * @param {body} body\n     * @return {vertices} vertices\n     */\n    Vertices.fromPath = function(path, body) {\n        var pathPattern = /L?\\s*([-\\d.e]+)[\\s,]*([-\\d.e]+)*/ig,\n            points = [];\n\n        path.replace(pathPattern, function(match, x, y) {\n            points.push({ x: parseFloat(x), y: parseFloat(y) });\n        });\n\n        return Vertices.create(points, body);\n    };\n\n    /**\n     * Returns the centre (centroid) of the set of vertices.\n     * @method centre\n     * @param {vertices} vertices\n     * @return {vector} The centre point\n     */\n    Vertices.centre = function(vertices) {\n        var area = Vertices.area(vertices, true),\n            centre = { x: 0, y: 0 },\n            cross,\n            temp,\n            j;\n\n        for (var i = 0; i < vertices.length; i++) {\n            j = (i + 1) % vertices.length;\n            cross = Vector.cross(vertices[i], vertices[j]);\n            temp = Vector.mult(Vector.add(vertices[i], vertices[j]), cross);\n            centre = Vector.add(centre, temp);\n        }\n\n        return Vector.div(centre, 6 * area);\n    };\n\n    /**\n     * Returns the average (mean) of the set of vertices.\n     * @method mean\n     * @param {vertices} vertices\n     * @return {vector} The average point\n     */\n    Vertices.mean = function(vertices) {\n        var average = { x: 0, y: 0 };\n\n        for (var i = 0; i < vertices.length; i++) {\n            average.x += vertices[i].x;\n            average.y += vertices[i].y;\n        }\n\n        return Vector.div(average, vertices.length);\n    };\n\n    /**\n     * Returns the area of the set of vertices.\n     * @method area\n     * @param {vertices} vertices\n     * @param {bool} signed\n     * @return {number} The area\n     */\n    Vertices.area = function(vertices, signed) {\n        var area = 0,\n            j = vertices.length - 1;\n\n        for (var i = 0; i < vertices.length; i++) {\n            area += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);\n            j = i;\n        }\n\n        if (signed)\n            return area / 2;\n\n        return Math.abs(area) / 2;\n    };\n\n    /**\n     * Returns the moment of inertia (second moment of area) of the set of vertices given the total mass.\n     * @method inertia\n     * @param {vertices} vertices\n     * @param {number} mass\n     * @return {number} The polygon's moment of inertia\n     */\n    Vertices.inertia = function(vertices, mass) {\n        var numerator = 0,\n            denominator = 0,\n            v = vertices,\n            cross,\n            j;\n\n        // find the polygon's moment of inertia, using second moment of area\n        // from equations at http://www.physicsforums.com/showthread.php?t=25293\n        for (var n = 0; n < v.length; n++) {\n            j = (n + 1) % v.length;\n            cross = Math.abs(Vector.cross(v[j], v[n]));\n            numerator += cross * (Vector.dot(v[j], v[j]) + Vector.dot(v[j], v[n]) + Vector.dot(v[n], v[n]));\n            denominator += cross;\n        }\n\n        return (mass / 6) * (numerator / denominator);\n    };\n\n    /**\n     * Translates the set of vertices in-place.\n     * @method translate\n     * @param {vertices} vertices\n     * @param {vector} vector\n     * @param {number} scalar\n     */\n    Vertices.translate = function(vertices, vector, scalar) {\n        scalar = typeof scalar !== 'undefined' ? scalar : 1;\n\n        var verticesLength = vertices.length,\n            translateX = vector.x * scalar,\n            translateY = vector.y * scalar,\n            i;\n        \n        for (i = 0; i < verticesLength; i++) {\n            vertices[i].x += translateX;\n            vertices[i].y += translateY;\n        }\n\n        return vertices;\n    };\n\n    /**\n     * Rotates the set of vertices in-place.\n     * @method rotate\n     * @param {vertices} vertices\n     * @param {number} angle\n     * @param {vector} point\n     */\n    Vertices.rotate = function(vertices, angle, point) {\n        if (angle === 0)\n            return;\n\n        var cos = Math.cos(angle),\n            sin = Math.sin(angle),\n            pointX = point.x,\n            pointY = point.y,\n            verticesLength = vertices.length,\n            vertex,\n            dx,\n            dy,\n            i;\n\n        for (i = 0; i < verticesLength; i++) {\n            vertex = vertices[i];\n            dx = vertex.x - pointX;\n            dy = vertex.y - pointY;\n            vertex.x = pointX + (dx * cos - dy * sin);\n            vertex.y = pointY + (dx * sin + dy * cos);\n        }\n\n        return vertices;\n    };\n\n    /**\n     * Returns `true` if the `point` is inside the set of `vertices`.\n     * @method contains\n     * @param {vertices} vertices\n     * @param {vector} point\n     * @return {boolean} True if the vertices contains point, otherwise false\n     */\n    Vertices.contains = function(vertices, point) {\n        var pointX = point.x,\n            pointY = point.y,\n            verticesLength = vertices.length,\n            vertex = vertices[verticesLength - 1],\n            nextVertex;\n\n        for (var i = 0; i < verticesLength; i++) {\n            nextVertex = vertices[i];\n\n            if ((pointX - vertex.x) * (nextVertex.y - vertex.y) \n                + (pointY - vertex.y) * (vertex.x - nextVertex.x) > 0) {\n                return false;\n            }\n\n            vertex = nextVertex;\n        }\n\n        return true;\n    };\n\n    /**\n     * Scales the vertices from a point (default is centre) in-place.\n     * @method scale\n     * @param {vertices} vertices\n     * @param {number} scaleX\n     * @param {number} scaleY\n     * @param {vector} point\n     */\n    Vertices.scale = function(vertices, scaleX, scaleY, point) {\n        if (scaleX === 1 && scaleY === 1)\n            return vertices;\n\n        point = point || Vertices.centre(vertices);\n\n        var vertex,\n            delta;\n\n        for (var i = 0; i < vertices.length; i++) {\n            vertex = vertices[i];\n            delta = Vector.sub(vertex, point);\n            vertices[i].x = point.x + delta.x * scaleX;\n            vertices[i].y = point.y + delta.y * scaleY;\n        }\n\n        return vertices;\n    };\n\n    /**\n     * Chamfers a set of vertices by giving them rounded corners, returns a new set of vertices.\n     * The radius parameter is a single number or an array to specify the radius for each vertex.\n     * @method chamfer\n     * @param {vertices} vertices\n     * @param {number[]} radius\n     * @param {number} quality\n     * @param {number} qualityMin\n     * @param {number} qualityMax\n     */\n    Vertices.chamfer = function(vertices, radius, quality, qualityMin, qualityMax) {\n        if (typeof radius === 'number') {\n            radius = [radius];\n        } else {\n            radius = radius || [8];\n        }\n\n        // quality defaults to -1, which is auto\n        quality = (typeof quality !== 'undefined') ? quality : -1;\n        qualityMin = qualityMin || 2;\n        qualityMax = qualityMax || 14;\n\n        var newVertices = [];\n\n        for (var i = 0; i < vertices.length; i++) {\n            var prevVertex = vertices[i - 1 >= 0 ? i - 1 : vertices.length - 1],\n                vertex = vertices[i],\n                nextVertex = vertices[(i + 1) % vertices.length],\n                currentRadius = radius[i < radius.length ? i : radius.length - 1];\n\n            if (currentRadius === 0) {\n                newVertices.push(vertex);\n                continue;\n            }\n\n            var prevNormal = Vector.normalise({ \n                x: vertex.y - prevVertex.y, \n                y: prevVertex.x - vertex.x\n            });\n\n            var nextNormal = Vector.normalise({ \n                x: nextVertex.y - vertex.y, \n                y: vertex.x - nextVertex.x\n            });\n\n            var diagonalRadius = Math.sqrt(2 * Math.pow(currentRadius, 2)),\n                radiusVector = Vector.mult(Common.clone(prevNormal), currentRadius),\n                midNormal = Vector.normalise(Vector.mult(Vector.add(prevNormal, nextNormal), 0.5)),\n                scaledVertex = Vector.sub(vertex, Vector.mult(midNormal, diagonalRadius));\n\n            var precision = quality;\n\n            if (quality === -1) {\n                // automatically decide precision\n                precision = Math.pow(currentRadius, 0.32) * 1.75;\n            }\n\n            precision = Common.clamp(precision, qualityMin, qualityMax);\n\n            // use an even value for precision, more likely to reduce axes by using symmetry\n            if (precision % 2 === 1)\n                precision += 1;\n\n            var alpha = Math.acos(Vector.dot(prevNormal, nextNormal)),\n                theta = alpha / precision;\n\n            for (var j = 0; j < precision; j++) {\n                newVertices.push(Vector.add(Vector.rotate(radiusVector, theta * j), scaledVertex));\n            }\n        }\n\n        return newVertices;\n    };\n\n    /**\n     * Sorts the input vertices into clockwise order in place.\n     * @method clockwiseSort\n     * @param {vertices} vertices\n     * @return {vertices} vertices\n     */\n    Vertices.clockwiseSort = function(vertices) {\n        var centre = Vertices.mean(vertices);\n\n        vertices.sort(function(vertexA, vertexB) {\n            return Vector.angle(centre, vertexA) - Vector.angle(centre, vertexB);\n        });\n\n        return vertices;\n    };\n\n    /**\n     * Returns true if the vertices form a convex shape (vertices must be in clockwise order).\n     * @method isConvex\n     * @param {vertices} vertices\n     * @return {bool} `true` if the `vertices` are convex, `false` if not (or `null` if not computable).\n     */\n    Vertices.isConvex = function(vertices) {\n        // http://paulbourke.net/geometry/polygonmesh/\n        // Copyright (c) Paul Bourke (use permitted)\n\n        var flag = 0,\n            n = vertices.length,\n            i,\n            j,\n            k,\n            z;\n\n        if (n < 3)\n            return null;\n\n        for (i = 0; i < n; i++) {\n            j = (i + 1) % n;\n            k = (i + 2) % n;\n            z = (vertices[j].x - vertices[i].x) * (vertices[k].y - vertices[j].y);\n            z -= (vertices[j].y - vertices[i].y) * (vertices[k].x - vertices[j].x);\n\n            if (z < 0) {\n                flag |= 1;\n            } else if (z > 0) {\n                flag |= 2;\n            }\n\n            if (flag === 3) {\n                return false;\n            }\n        }\n\n        if (flag !== 0){\n            return true;\n        } else {\n            return null;\n        }\n    };\n\n    /**\n     * Returns the convex hull of the input vertices as a new array of points.\n     * @method hull\n     * @param {vertices} vertices\n     * @return [vertex] vertices\n     */\n    Vertices.hull = function(vertices) {\n        // http://geomalgorithms.com/a10-_hull-1.html\n\n        var upper = [],\n            lower = [], \n            vertex,\n            i;\n\n        // sort vertices on x-axis (y-axis for ties)\n        vertices = vertices.slice(0);\n        vertices.sort(function(vertexA, vertexB) {\n            var dx = vertexA.x - vertexB.x;\n            return dx !== 0 ? dx : vertexA.y - vertexB.y;\n        });\n\n        // build lower hull\n        for (i = 0; i < vertices.length; i += 1) {\n            vertex = vertices[i];\n\n            while (lower.length >= 2 \n                   && Vector.cross3(lower[lower.length - 2], lower[lower.length - 1], vertex) <= 0) {\n                lower.pop();\n            }\n\n            lower.push(vertex);\n        }\n\n        // build upper hull\n        for (i = vertices.length - 1; i >= 0; i -= 1) {\n            vertex = vertices[i];\n\n            while (upper.length >= 2 \n                   && Vector.cross3(upper[upper.length - 2], upper[upper.length - 1], vertex) <= 0) {\n                upper.pop();\n            }\n\n            upper.push(vertex);\n        }\n\n        // concatenation of the lower and upper hulls gives the convex hull\n        // omit last points because they are repeated at the beginning of the other list\n        upper.pop();\n        lower.pop();\n\n        return upper.concat(lower);\n    };\n\n})();\n\n\n/***/ }),\n/* 4 */\n/***/ (function(module, exports, __nested_webpack_require_49544__) {\n\n/**\n* The `Matter.Body` module contains methods for creating and manipulating rigid bodies.\n* For creating bodies with common configurations such as rectangles, circles and other polygons see the module `Matter.Bodies`.\n*\n* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).\n\n* @class Body\n*/\n\nvar Body = {};\n\nmodule.exports = Body;\n\nvar Vertices = __nested_webpack_require_49544__(3);\nvar Vector = __nested_webpack_require_49544__(2);\nvar Sleeping = __nested_webpack_require_49544__(7);\nvar Common = __nested_webpack_require_49544__(0);\nvar Bounds = __nested_webpack_require_49544__(1);\nvar Axes = __nested_webpack_require_49544__(11);\n\n(function() {\n\n    Body._timeCorrection = true;\n    Body._inertiaScale = 4;\n    Body._nextCollidingGroupId = 1;\n    Body._nextNonCollidingGroupId = -1;\n    Body._nextCategory = 0x0001;\n    Body._baseDelta = 1000 / 60;\n\n    /**\n     * Creates a new rigid body model. The options parameter is an object that specifies any properties you wish to override the defaults.\n     * All properties have default values, and many are pre-calculated automatically based on other properties.\n     * Vertices must be specified in clockwise order.\n     * See the properties section below for detailed information on what you can pass via the `options` object.\n     * @method create\n     * @param {} options\n     * @return {body} body\n     */\n    Body.create = function(options) {\n        var defaults = {\n            id: Common.nextId(),\n            type: 'body',\n            label: 'Body',\n            parts: [],\n            plugin: {},\n            angle: 0,\n            vertices: Vertices.fromPath('L 0 0 L 40 0 L 40 40 L 0 40'),\n            position: { x: 0, y: 0 },\n            force: { x: 0, y: 0 },\n            torque: 0,\n            positionImpulse: { x: 0, y: 0 },\n            constraintImpulse: { x: 0, y: 0, angle: 0 },\n            totalContacts: 0,\n            speed: 0,\n            angularSpeed: 0,\n            velocity: { x: 0, y: 0 },\n            angularVelocity: 0,\n            isSensor: false,\n            isStatic: false,\n            isSleeping: false,\n            motion: 0,\n            sleepThreshold: 60,\n            density: 0.001,\n            restitution: 0,\n            friction: 0.1,\n            frictionStatic: 0.5,\n            frictionAir: 0.01,\n            collisionFilter: {\n                category: 0x0001,\n                mask: 0xFFFFFFFF,\n                group: 0\n            },\n            slop: 0.05,\n            timeScale: 1,\n            render: {\n                visible: true,\n                opacity: 1,\n                strokeStyle: null,\n                fillStyle: null,\n                lineWidth: null,\n                sprite: {\n                    xScale: 1,\n                    yScale: 1,\n                    xOffset: 0,\n                    yOffset: 0\n                }\n            },\n            events: null,\n            bounds: null,\n            chamfer: null,\n            circleRadius: 0,\n            positionPrev: null,\n            anglePrev: 0,\n            parent: null,\n            axes: null,\n            area: 0,\n            mass: 0,\n            inertia: 0,\n            deltaTime: 1000 / 60,\n            _original: null\n        };\n\n        var body = Common.extend(defaults, options);\n\n        _initProperties(body, options);\n\n        return body;\n    };\n\n    /**\n     * Returns the next unique group index for which bodies will collide.\n     * If `isNonColliding` is `true`, returns the next unique group index for which bodies will _not_ collide.\n     * See `body.collisionFilter` for more information.\n     * @method nextGroup\n     * @param {bool} [isNonColliding=false]\n     * @return {Number} Unique group index\n     */\n    Body.nextGroup = function(isNonColliding) {\n        if (isNonColliding)\n            return Body._nextNonCollidingGroupId--;\n\n        return Body._nextCollidingGroupId++;\n    };\n\n    /**\n     * Returns the next unique category bitfield (starting after the initial default category `0x0001`).\n     * There are 32 available. See `body.collisionFilter` for more information.\n     * @method nextCategory\n     * @return {Number} Unique category bitfield\n     */\n    Body.nextCategory = function() {\n        Body._nextCategory = Body._nextCategory << 1;\n        return Body._nextCategory;\n    };\n\n    /**\n     * Initialises body properties.\n     * @method _initProperties\n     * @private\n     * @param {body} body\n     * @param {} [options]\n     */\n    var _initProperties = function(body, options) {\n        options = options || {};\n\n        // init required properties (order is important)\n        Body.set(body, {\n            bounds: body.bounds || Bounds.create(body.vertices),\n            positionPrev: body.positionPrev || Vector.clone(body.position),\n            anglePrev: body.anglePrev || body.angle,\n            vertices: body.vertices,\n            parts: body.parts || [body],\n            isStatic: body.isStatic,\n            isSleeping: body.isSleeping,\n            parent: body.parent || body\n        });\n\n        Vertices.rotate(body.vertices, body.angle, body.position);\n        Axes.rotate(body.axes, body.angle);\n        Bounds.update(body.bounds, body.vertices, body.velocity);\n\n        // allow options to override the automatically calculated properties\n        Body.set(body, {\n            axes: options.axes || body.axes,\n            area: options.area || body.area,\n            mass: options.mass || body.mass,\n            inertia: options.inertia || body.inertia\n        });\n\n        // render properties\n        var defaultFillStyle = (body.isStatic ? '#14151f' : Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1'])),\n            defaultStrokeStyle = body.isStatic ? '#555' : '#ccc',\n            defaultLineWidth = body.isStatic && body.render.fillStyle === null ? 1 : 0;\n        body.render.fillStyle = body.render.fillStyle || defaultFillStyle;\n        body.render.strokeStyle = body.render.strokeStyle || defaultStrokeStyle;\n        body.render.lineWidth = body.render.lineWidth || defaultLineWidth;\n        body.render.sprite.xOffset += -(body.bounds.min.x - body.position.x) / (body.bounds.max.x - body.bounds.min.x);\n        body.render.sprite.yOffset += -(body.bounds.min.y - body.position.y) / (body.bounds.max.y - body.bounds.min.y);\n    };\n\n    /**\n     * Given a property and a value (or map of), sets the property(s) on the body, using the appropriate setter functions if they exist.\n     * Prefer to use the actual setter functions in performance critical situations.\n     * @method set\n     * @param {body} body\n     * @param {} settings A property name (or map of properties and values) to set on the body.\n     * @param {} value The value to set if `settings` is a single property name.\n     */\n    Body.set = function(body, settings, value) {\n        var property;\n\n        if (typeof settings === 'string') {\n            property = settings;\n            settings = {};\n            settings[property] = value;\n        }\n\n        for (property in settings) {\n            if (!Object.prototype.hasOwnProperty.call(settings, property))\n                continue;\n\n            value = settings[property];\n            switch (property) {\n\n            case 'isStatic':\n                Body.setStatic(body, value);\n                break;\n            case 'isSleeping':\n                Sleeping.set(body, value);\n                break;\n            case 'mass':\n                Body.setMass(body, value);\n                break;\n            case 'density':\n                Body.setDensity(body, value);\n                break;\n            case 'inertia':\n                Body.setInertia(body, value);\n                break;\n            case 'vertices':\n                Body.setVertices(body, value);\n                break;\n            case 'position':\n                Body.setPosition(body, value);\n                break;\n            case 'angle':\n                Body.setAngle(body, value);\n                break;\n            case 'velocity':\n                Body.setVelocity(body, value);\n                break;\n            case 'angularVelocity':\n                Body.setAngularVelocity(body, value);\n                break;\n            case 'speed':\n                Body.setSpeed(body, value);\n                break;\n            case 'angularSpeed':\n                Body.setAngularSpeed(body, value);\n                break;\n            case 'parts':\n                Body.setParts(body, value);\n                break;\n            case 'centre':\n                Body.setCentre(body, value);\n                break;\n            default:\n                body[property] = value;\n\n            }\n        }\n    };\n\n    /**\n     * Sets the body as static, including isStatic flag and setting mass and inertia to Infinity.\n     * @method setStatic\n     * @param {body} body\n     * @param {bool} isStatic\n     */\n    Body.setStatic = function(body, isStatic) {\n        for (var i = 0; i < body.parts.length; i++) {\n            var part = body.parts[i];\n            part.isStatic = isStatic;\n\n            if (isStatic) {\n                part._original = {\n                    restitution: part.restitution,\n                    friction: part.friction,\n                    mass: part.mass,\n                    inertia: part.inertia,\n                    density: part.density,\n                    inverseMass: part.inverseMass,\n                    inverseInertia: part.inverseInertia\n                };\n\n                part.restitution = 0;\n                part.friction = 1;\n                part.mass = part.inertia = part.density = Infinity;\n                part.inverseMass = part.inverseInertia = 0;\n\n                part.positionPrev.x = part.position.x;\n                part.positionPrev.y = part.position.y;\n                part.anglePrev = part.angle;\n                part.angularVelocity = 0;\n                part.speed = 0;\n                part.angularSpeed = 0;\n                part.motion = 0;\n            } else if (part._original) {\n                part.restitution = part._original.restitution;\n                part.friction = part._original.friction;\n                part.mass = part._original.mass;\n                part.inertia = part._original.inertia;\n                part.density = part._original.density;\n                part.inverseMass = part._original.inverseMass;\n                part.inverseInertia = part._original.inverseInertia;\n\n                part._original = null;\n            }\n        }\n    };\n\n    /**\n     * Sets the mass of the body. Inverse mass, density and inertia are automatically updated to reflect the change.\n     * @method setMass\n     * @param {body} body\n     * @param {number} mass\n     */\n    Body.setMass = function(body, mass) {\n        var moment = body.inertia / (body.mass / 6);\n        body.inertia = moment * (mass / 6);\n        body.inverseInertia = 1 / body.inertia;\n\n        body.mass = mass;\n        body.inverseMass = 1 / body.mass;\n        body.density = body.mass / body.area;\n    };\n\n    /**\n     * Sets the density of the body. Mass and inertia are automatically updated to reflect the change.\n     * @method setDensity\n     * @param {body} body\n     * @param {number} density\n     */\n    Body.setDensity = function(body, density) {\n        Body.setMass(body, density * body.area);\n        body.density = density;\n    };\n\n    /**\n     * Sets the moment of inertia of the body. This is the second moment of area in two dimensions.\n     * Inverse inertia is automatically updated to reflect the change. Mass is not changed.\n     * @method setInertia\n     * @param {body} body\n     * @param {number} inertia\n     */\n    Body.setInertia = function(body, inertia) {\n        body.inertia = inertia;\n        body.inverseInertia = 1 / body.inertia;\n    };\n\n    /**\n     * Sets the body's vertices and updates body properties accordingly, including inertia, area and mass (with respect to `body.density`).\n     * Vertices will be automatically transformed to be orientated around their centre of mass as the origin.\n     * They are then automatically translated to world space based on `body.position`.\n     *\n     * The `vertices` argument should be passed as an array of `Matter.Vector` points (or a `Matter.Vertices` array).\n     * Vertices must form a convex hull. Concave vertices must be decomposed into convex parts.\n     * \n     * @method setVertices\n     * @param {body} body\n     * @param {vector[]} vertices\n     */\n    Body.setVertices = function(body, vertices) {\n        // change vertices\n        if (vertices[0].body === body) {\n            body.vertices = vertices;\n        } else {\n            body.vertices = Vertices.create(vertices, body);\n        }\n\n        // update properties\n        body.axes = Axes.fromVertices(body.vertices);\n        body.area = Vertices.area(body.vertices);\n        Body.setMass(body, body.density * body.area);\n\n        // orient vertices around the centre of mass at origin (0, 0)\n        var centre = Vertices.centre(body.vertices);\n        Vertices.translate(body.vertices, centre, -1);\n\n        // update inertia while vertices are at origin (0, 0)\n        Body.setInertia(body, Body._inertiaScale * Vertices.inertia(body.vertices, body.mass));\n\n        // update geometry\n        Vertices.translate(body.vertices, body.position);\n        Bounds.update(body.bounds, body.vertices, body.velocity);\n    };\n\n    /**\n     * Sets the parts of the `body` and updates mass, inertia and centroid.\n     * Each part will have its parent set to `body`.\n     * By default the convex hull will be automatically computed and set on `body`, unless `autoHull` is set to `false.`\n     * Note that this method will ensure that the first part in `body.parts` will always be the `body`.\n     * @method setParts\n     * @param {body} body\n     * @param {body[]} parts\n     * @param {bool} [autoHull=true]\n     */\n    Body.setParts = function(body, parts, autoHull) {\n        var i;\n\n        // add all the parts, ensuring that the first part is always the parent body\n        parts = parts.slice(0);\n        body.parts.length = 0;\n        body.parts.push(body);\n        body.parent = body;\n\n        for (i = 0; i < parts.length; i++) {\n            var part = parts[i];\n            if (part !== body) {\n                part.parent = body;\n                body.parts.push(part);\n            }\n        }\n\n        if (body.parts.length === 1)\n            return;\n\n        autoHull = typeof autoHull !== 'undefined' ? autoHull : true;\n\n        // find the convex hull of all parts to set on the parent body\n        if (autoHull) {\n            var vertices = [];\n            for (i = 0; i < parts.length; i++) {\n                vertices = vertices.concat(parts[i].vertices);\n            }\n\n            Vertices.clockwiseSort(vertices);\n\n            var hull = Vertices.hull(vertices),\n                hullCentre = Vertices.centre(hull);\n\n            Body.setVertices(body, hull);\n            Vertices.translate(body.vertices, hullCentre);\n        }\n\n        // sum the properties of all compound parts of the parent body\n        var total = Body._totalProperties(body);\n\n        body.area = total.area;\n        body.parent = body;\n        body.position.x = total.centre.x;\n        body.position.y = total.centre.y;\n        body.positionPrev.x = total.centre.x;\n        body.positionPrev.y = total.centre.y;\n\n        Body.setMass(body, total.mass);\n        Body.setInertia(body, total.inertia);\n        Body.setPosition(body, total.centre);\n    };\n\n    /**\n     * Set the centre of mass of the body. \n     * The `centre` is a vector in world-space unless `relative` is set, in which case it is a translation.\n     * The centre of mass is the point the body rotates about and can be used to simulate non-uniform density.\n     * This is equal to moving `body.position` but not the `body.vertices`.\n     * Invalid if the `centre` falls outside the body's convex hull.\n     * @method setCentre\n     * @param {body} body\n     * @param {vector} centre\n     * @param {bool} relative\n     */\n    Body.setCentre = function(body, centre, relative) {\n        if (!relative) {\n            body.positionPrev.x = centre.x - (body.position.x - body.positionPrev.x);\n            body.positionPrev.y = centre.y - (body.position.y - body.positionPrev.y);\n            body.position.x = centre.x;\n            body.position.y = centre.y;\n        } else {\n            body.positionPrev.x += centre.x;\n            body.positionPrev.y += centre.y;\n            body.position.x += centre.x;\n            body.position.y += centre.y;\n        }\n    };\n\n    /**\n     * Sets the position of the body. By default velocity is unchanged.\n     * If `updateVelocity` is `true` then velocity is inferred from the change in position.\n     * @method setPosition\n     * @param {body} body\n     * @param {vector} position\n     * @param {boolean} [updateVelocity=false]\n     */\n    Body.setPosition = function(body, position, updateVelocity) {\n        var delta = Vector.sub(position, body.position);\n\n        if (updateVelocity) {\n            body.positionPrev.x = body.position.x;\n            body.positionPrev.y = body.position.y;\n            body.velocity.x = delta.x;\n            body.velocity.y = delta.y;\n            body.speed = Vector.magnitude(delta);\n        } else {\n            body.positionPrev.x += delta.x;\n            body.positionPrev.y += delta.y;\n        }\n\n        for (var i = 0; i < body.parts.length; i++) {\n            var part = body.parts[i];\n            part.position.x += delta.x;\n            part.position.y += delta.y;\n            Vertices.translate(part.vertices, delta);\n            Bounds.update(part.bounds, part.vertices, body.velocity);\n        }\n    };\n\n    /**\n     * Sets the angle of the body. By default angular velocity is unchanged.\n     * If `updateVelocity` is `true` then angular velocity is inferred from the change in angle.\n     * @method setAngle\n     * @param {body} body\n     * @param {number} angle\n     * @param {boolean} [updateVelocity=false]\n     */\n    Body.setAngle = function(body, angle, updateVelocity) {\n        var delta = angle - body.angle;\n        \n        if (updateVelocity) {\n            body.anglePrev = body.angle;\n            body.angularVelocity = delta;\n            body.angularSpeed = Math.abs(delta);\n        } else {\n            body.anglePrev += delta;\n        }\n\n        for (var i = 0; i < body.parts.length; i++) {\n            var part = body.parts[i];\n            part.angle += delta;\n            Vertices.rotate(part.vertices, delta, body.position);\n            Axes.rotate(part.axes, delta);\n            Bounds.update(part.bounds, part.vertices, body.velocity);\n            if (i > 0) {\n                Vector.rotateAbout(part.position, delta, body.position, part.position);\n            }\n        }\n    };\n\n    /**\n     * Sets the current linear velocity of the body.  \n     * Affects body speed.\n     * @method setVelocity\n     * @param {body} body\n     * @param {vector} velocity\n     */\n    Body.setVelocity = function(body, velocity) {\n        var timeScale = body.deltaTime / Body._baseDelta;\n        body.positionPrev.x = body.position.x - velocity.x * timeScale;\n        body.positionPrev.y = body.position.y - velocity.y * timeScale;\n        body.velocity.x = (body.position.x - body.positionPrev.x) / timeScale;\n        body.velocity.y = (body.position.y - body.positionPrev.y) / timeScale;\n        body.speed = Vector.magnitude(body.velocity);\n    };\n\n    /**\n     * Gets the current linear velocity of the body.\n     * @method getVelocity\n     * @param {body} body\n     * @return {vector} velocity\n     */\n    Body.getVelocity = function(body) {\n        var timeScale = Body._baseDelta / body.deltaTime;\n\n        return {\n            x: (body.position.x - body.positionPrev.x) * timeScale,\n            y: (body.position.y - body.positionPrev.y) * timeScale\n        };\n    };\n\n    /**\n     * Gets the current linear speed of the body.  \n     * Equivalent to the magnitude of its velocity.\n     * @method getSpeed\n     * @param {body} body\n     * @return {number} speed\n     */\n    Body.getSpeed = function(body) {\n        return Vector.magnitude(Body.getVelocity(body));\n    };\n\n    /**\n     * Sets the current linear speed of the body.  \n     * Direction is maintained. Affects body velocity.\n     * @method setSpeed\n     * @param {body} body\n     * @param {number} speed\n     */\n    Body.setSpeed = function(body, speed) {\n        Body.setVelocity(body, Vector.mult(Vector.normalise(Body.getVelocity(body)), speed));\n    };\n\n    /**\n     * Sets the current rotational velocity of the body.  \n     * Affects body angular speed.\n     * @method setAngularVelocity\n     * @param {body} body\n     * @param {number} velocity\n     */\n    Body.setAngularVelocity = function(body, velocity) {\n        var timeScale = body.deltaTime / Body._baseDelta;\n        body.anglePrev = body.angle - velocity * timeScale;\n        body.angularVelocity = (body.angle - body.anglePrev) / timeScale;\n        body.angularSpeed = Math.abs(body.angularVelocity);\n    };\n\n    /**\n     * Gets the current rotational velocity of the body.\n     * @method getAngularVelocity\n     * @param {body} body\n     * @return {number} angular velocity\n     */\n    Body.getAngularVelocity = function(body) {\n        return (body.angle - body.anglePrev) * Body._baseDelta / body.deltaTime;\n    };\n\n    /**\n     * Gets the current rotational speed of the body.  \n     * Equivalent to the magnitude of its angular velocity.\n     * @method getAngularSpeed\n     * @param {body} body\n     * @return {number} angular speed\n     */\n    Body.getAngularSpeed = function(body) {\n        return Math.abs(Body.getAngularVelocity(body));\n    };\n\n    /**\n     * Sets the current rotational speed of the body.  \n     * Direction is maintained. Affects body angular velocity.\n     * @method setAngularSpeed\n     * @param {body} body\n     * @param {number} speed\n     */\n    Body.setAngularSpeed = function(body, speed) {\n        Body.setAngularVelocity(body, Common.sign(Body.getAngularVelocity(body)) * speed);\n    };\n\n    /**\n     * Moves a body by a given vector relative to its current position. By default velocity is unchanged.\n     * If `updateVelocity` is `true` then velocity is inferred from the change in position.\n     * @method translate\n     * @param {body} body\n     * @param {vector} translation\n     * @param {boolean} [updateVelocity=false]\n     */\n    Body.translate = function(body, translation, updateVelocity) {\n        Body.setPosition(body, Vector.add(body.position, translation), updateVelocity);\n    };\n\n    /**\n     * Rotates a body by a given angle relative to its current angle. By default angular velocity is unchanged.\n     * If `updateVelocity` is `true` then angular velocity is inferred from the change in angle.\n     * @method rotate\n     * @param {body} body\n     * @param {number} rotation\n     * @param {vector} [point]\n     * @param {boolean} [updateVelocity=false]\n     */\n    Body.rotate = function(body, rotation, point, updateVelocity) {\n        if (!point) {\n            Body.setAngle(body, body.angle + rotation, updateVelocity);\n        } else {\n            var cos = Math.cos(rotation),\n                sin = Math.sin(rotation),\n                dx = body.position.x - point.x,\n                dy = body.position.y - point.y;\n                \n            Body.setPosition(body, {\n                x: point.x + (dx * cos - dy * sin),\n                y: point.y + (dx * sin + dy * cos)\n            }, updateVelocity);\n\n            Body.setAngle(body, body.angle + rotation, updateVelocity);\n        }\n    };\n\n    /**\n     * Scales the body, including updating physical properties (mass, area, axes, inertia), from a world-space point (default is body centre).\n     * @method scale\n     * @param {body} body\n     * @param {number} scaleX\n     * @param {number} scaleY\n     * @param {vector} [point]\n     */\n    Body.scale = function(body, scaleX, scaleY, point) {\n        var totalArea = 0,\n            totalInertia = 0;\n\n        point = point || body.position;\n\n        for (var i = 0; i < body.parts.length; i++) {\n            var part = body.parts[i];\n\n            // scale vertices\n            Vertices.scale(part.vertices, scaleX, scaleY, point);\n\n            // update properties\n            part.axes = Axes.fromVertices(part.vertices);\n            part.area = Vertices.area(part.vertices);\n            Body.setMass(part, body.density * part.area);\n\n            // update inertia (requires vertices to be at origin)\n            Vertices.translate(part.vertices, { x: -part.position.x, y: -part.position.y });\n            Body.setInertia(part, Body._inertiaScale * Vertices.inertia(part.vertices, part.mass));\n            Vertices.translate(part.vertices, { x: part.position.x, y: part.position.y });\n\n            if (i > 0) {\n                totalArea += part.area;\n                totalInertia += part.inertia;\n            }\n\n            // scale position\n            part.position.x = point.x + (part.position.x - point.x) * scaleX;\n            part.position.y = point.y + (part.position.y - point.y) * scaleY;\n\n            // update bounds\n            Bounds.update(part.bounds, part.vertices, body.velocity);\n        }\n\n        // handle parent body\n        if (body.parts.length > 1) {\n            body.area = totalArea;\n\n            if (!body.isStatic) {\n                Body.setMass(body, body.density * totalArea);\n                Body.setInertia(body, totalInertia);\n            }\n        }\n\n        // handle circles\n        if (body.circleRadius) { \n            if (scaleX === scaleY) {\n                body.circleRadius *= scaleX;\n            } else {\n                // body is no longer a circle\n                body.circleRadius = null;\n            }\n        }\n    };\n\n    /**\n     * Performs an update by integrating the equations of motion on the `body`.\n     * This is applied every update by `Matter.Engine` automatically.\n     * @method update\n     * @param {body} body\n     * @param {number} [deltaTime=16.666]\n     */\n    Body.update = function(body, deltaTime) {\n        deltaTime = (typeof deltaTime !== 'undefined' ? deltaTime : (1000 / 60)) * body.timeScale;\n\n        var deltaTimeSquared = deltaTime * deltaTime,\n            correction = Body._timeCorrection ? deltaTime / (body.deltaTime || deltaTime) : 1;\n\n        // from the previous step\n        var frictionAir = 1 - body.frictionAir * (deltaTime / Common._baseDelta),\n            velocityPrevX = (body.position.x - body.positionPrev.x) * correction,\n            velocityPrevY = (body.position.y - body.positionPrev.y) * correction;\n\n        // update velocity with Verlet integration\n        body.velocity.x = (velocityPrevX * frictionAir) + (body.force.x / body.mass) * deltaTimeSquared;\n        body.velocity.y = (velocityPrevY * frictionAir) + (body.force.y / body.mass) * deltaTimeSquared;\n\n        body.positionPrev.x = body.position.x;\n        body.positionPrev.y = body.position.y;\n        body.position.x += body.velocity.x;\n        body.position.y += body.velocity.y;\n        body.deltaTime = deltaTime;\n\n        // update angular velocity with Verlet integration\n        body.angularVelocity = ((body.angle - body.anglePrev) * frictionAir * correction) + (body.torque / body.inertia) * deltaTimeSquared;\n        body.anglePrev = body.angle;\n        body.angle += body.angularVelocity;\n\n        // transform the body geometry\n        for (var i = 0; i < body.parts.length; i++) {\n            var part = body.parts[i];\n\n            Vertices.translate(part.vertices, body.velocity);\n            \n            if (i > 0) {\n                part.position.x += body.velocity.x;\n                part.position.y += body.velocity.y;\n            }\n\n            if (body.angularVelocity !== 0) {\n                Vertices.rotate(part.vertices, body.angularVelocity, body.position);\n                Axes.rotate(part.axes, body.angularVelocity);\n                if (i > 0) {\n                    Vector.rotateAbout(part.position, body.angularVelocity, body.position, part.position);\n                }\n            }\n\n            Bounds.update(part.bounds, part.vertices, body.velocity);\n        }\n    };\n\n    /**\n     * Updates properties `body.velocity`, `body.speed`, `body.angularVelocity` and `body.angularSpeed` which are normalised in relation to `Body._baseDelta`.\n     * @method updateVelocities\n     * @param {body} body\n     */\n    Body.updateVelocities = function(body) {\n        var timeScale = Body._baseDelta / body.deltaTime,\n            bodyVelocity = body.velocity;\n\n        bodyVelocity.x = (body.position.x - body.positionPrev.x) * timeScale;\n        bodyVelocity.y = (body.position.y - body.positionPrev.y) * timeScale;\n        body.speed = Math.sqrt((bodyVelocity.x * bodyVelocity.x) + (bodyVelocity.y * bodyVelocity.y));\n\n        body.angularVelocity = (body.angle - body.anglePrev) * timeScale;\n        body.angularSpeed = Math.abs(body.angularVelocity);\n    };\n\n    /**\n     * Applies the `force` to the `body` from the force origin `position` in world-space, over a single timestep, including applying any resulting angular torque.\n     * \n     * Forces are useful for effects like gravity, wind or rocket thrust, but can be difficult in practice when precise control is needed. In these cases see `Body.setVelocity` and `Body.setPosition` as an alternative.\n     * \n     * The force from this function is only applied once for the duration of a single timestep, in other words the duration depends directly on the current engine update `delta` and the rate of calls to this function.\n     * \n     * Therefore to account for time, you should apply the force constantly over as many engine updates as equivalent to the intended duration.\n     * \n     * If all or part of the force duration is some fraction of a timestep, first multiply the force by `duration / timestep`.\n     * \n     * The force origin `position` in world-space must also be specified. Passing `body.position` will result in zero angular effect as the force origin would be at the centre of mass.\n     * \n     * The `body` will take time to accelerate under a force, the resulting effect depends on duration of the force, the body mass and other forces on the body including friction combined.\n     * @method applyForce\n     * @param {body} body\n     * @param {vector} position The force origin in world-space. Pass `body.position` to avoid angular torque.\n     * @param {vector} force\n     */\n    Body.applyForce = function(body, position, force) {\n        var offset = { x: position.x - body.position.x, y: position.y - body.position.y };\n        body.force.x += force.x;\n        body.force.y += force.y;\n        body.torque += offset.x * force.y - offset.y * force.x;\n    };\n\n    /**\n     * Returns the sums of the properties of all compound parts of the parent body.\n     * @method _totalProperties\n     * @private\n     * @param {body} body\n     * @return {}\n     */\n    Body._totalProperties = function(body) {\n        // from equations at:\n        // https://ecourses.ou.edu/cgi-bin/ebook.cgi?doc=&topic=st&chap_sec=07.2&page=theory\n        // http://output.to/sideway/default.asp?qno=121100087\n\n        var properties = {\n            mass: 0,\n            area: 0,\n            inertia: 0,\n            centre: { x: 0, y: 0 }\n        };\n\n        // sum the properties of all compound parts of the parent body\n        for (var i = body.parts.length === 1 ? 0 : 1; i < body.parts.length; i++) {\n            var part = body.parts[i],\n                mass = part.mass !== Infinity ? part.mass : 1;\n\n            properties.mass += mass;\n            properties.area += part.area;\n            properties.inertia += part.inertia;\n            properties.centre = Vector.add(properties.centre, Vector.mult(part.position, mass));\n        }\n\n        properties.centre = Vector.div(properties.centre, properties.mass);\n\n        return properties;\n    };\n\n    /*\n    *\n    *  Events Documentation\n    *\n    */\n\n    /**\n    * Fired when a body starts sleeping (where `this` is the body).\n    *\n    * @event sleepStart\n    * @this {body} The body that has started sleeping\n    * @param {} event An event object\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /**\n    * Fired when a body ends sleeping (where `this` is the body).\n    *\n    * @event sleepEnd\n    * @this {body} The body that has ended sleeping\n    * @param {} event An event object\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /*\n    *\n    *  Properties Documentation\n    *\n    */\n\n    /**\n     * An integer `Number` uniquely identifying number generated in `Body.create` by `Common.nextId`.\n     *\n     * @property id\n     * @type number\n     */\n\n    /**\n     * _Read only_. Set by `Body.create`.\n     * \n     * A `String` denoting the type of object.\n     *\n     * @readOnly\n     * @property type\n     * @type string\n     * @default \"body\"\n     */\n\n    /**\n     * An arbitrary `String` name to help the user identify and manage bodies.\n     *\n     * @property label\n     * @type string\n     * @default \"Body\"\n     */\n\n    /**\n     * _Read only_. Use `Body.setParts` to set. \n     * \n     * An array of bodies that make up this body. \n     * The first body in the array must always be a self reference to the current body instance.\n     * All bodies in the `parts` array together form a single rigid compound body.\n     * Parts are allowed to overlap, have gaps or holes or even form concave bodies.\n     * Parts themselves should never be added to a `World`, only the parent body should be.\n     * Use `Body.setParts` when setting parts to ensure correct updates of all properties.\n     *\n     * @readOnly\n     * @property parts\n     * @type body[]\n     */\n\n    /**\n     * An object reserved for storing plugin-specific properties.\n     *\n     * @property plugin\n     * @type {}\n     */\n\n    /**\n     * _Read only_. Updated by `Body.setParts`.\n     * \n     * A reference to the body that this is a part of. See `body.parts`.\n     * This is a self reference if the body is not a part of another body.\n     *\n     * @readOnly\n     * @property parent\n     * @type body\n     */\n\n    /**\n     * A `Number` specifying the angle of the body, in radians.\n     *\n     * @property angle\n     * @type number\n     * @default 0\n     */\n\n    /**\n     * _Read only_. Use `Body.setVertices` or `Body.setParts` to set. See also `Bodies.fromVertices`.\n     * \n     * An array of `Vector` objects that specify the convex hull of the rigid body.\n     * These should be provided about the origin `(0, 0)`. E.g.\n     *\n     * `[{ x: 0, y: 0 }, { x: 25, y: 50 }, { x: 50, y: 0 }]`\n     * \n     * Vertices must always be convex, in clockwise order and must not contain any duplicate points.\n     * \n     * Concave vertices should be decomposed into convex `parts`, see `Bodies.fromVertices` and `Body.setParts`.\n     *\n     * When set the vertices are translated such that `body.position` is at the centre of mass.\n     * Many other body properties are automatically calculated from these vertices when set including `density`, `area` and `inertia`.\n     * \n     * The module `Matter.Vertices` contains useful methods for working with vertices.\n     *\n     * @readOnly\n     * @property vertices\n     * @type vector[]\n     */\n\n    /**\n     * _Read only_. Use `Body.setPosition` to set. \n     * \n     * A `Vector` that specifies the current world-space position of the body.\n     * \n     * @readOnly\n     * @property position\n     * @type vector\n     * @default { x: 0, y: 0 }\n     */\n\n    /**\n     * A `Vector` that accumulates the total force applied to the body for a single update.\n     * Force is zeroed after every `Engine.update`, so constant forces should be applied for every update they are needed. See also `Body.applyForce`.\n     * \n     * @property force\n     * @type vector\n     * @default { x: 0, y: 0 }\n     */\n\n    /**\n     * A `Number` that accumulates the total torque (turning force) applied to the body for a single update. See also `Body.applyForce`.\n     * Torque is zeroed after every `Engine.update`, so constant torques should be applied for every update they are needed.\n     *\n     * Torques result in angular acceleration on every update, which depends on body inertia and the engine update delta.\n     * \n     * @property torque\n     * @type number\n     * @default 0\n     */\n\n    /**\n     * _Read only_. Use `Body.setSpeed` to set. \n     * \n     * See `Body.getSpeed` for details.\n     * \n     * Equivalent to the magnitude of `body.velocity` (always positive).\n     * \n     * @readOnly\n     * @property speed\n     * @type number\n     * @default 0\n     */\n\n    /**\n     * _Read only_. Use `Body.setVelocity` to set. \n     * \n     * See `Body.getVelocity` for details.\n     * \n     * Equivalent to the magnitude of `body.angularVelocity` (always positive).\n     * \n     * @readOnly\n     * @property velocity\n     * @type vector\n     * @default { x: 0, y: 0 }\n     */\n\n    /**\n     * _Read only_. Use `Body.setAngularSpeed` to set. \n     * \n     * See `Body.getAngularSpeed` for details.\n     * \n     * \n     * @readOnly\n     * @property angularSpeed\n     * @type number\n     * @default 0\n     */\n\n    /**\n     * _Read only_. Use `Body.setAngularVelocity` to set. \n     * \n     * See `Body.getAngularVelocity` for details.\n     * \n     *\n     * @readOnly\n     * @property angularVelocity\n     * @type number\n     * @default 0\n     */\n\n    /**\n     * _Read only_. Use `Body.setStatic` to set. \n     * \n     * A flag that indicates whether a body is considered static. A static body can never change position or angle and is completely fixed.\n     *\n     * @readOnly\n     * @property isStatic\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag that indicates whether a body is a sensor. Sensor triggers collision events, but doesn't react with colliding body physically.\n     *\n     * @property isSensor\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * _Read only_. Use `Sleeping.set` to set. \n     * \n     * A flag that indicates whether the body is considered sleeping. A sleeping body acts similar to a static body, except it is only temporary and can be awoken.\n     *\n     * @readOnly\n     * @property isSleeping\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * _Read only_. Calculated during engine update only when sleeping is enabled.\n     * \n     * A `Number` that loosely measures the amount of movement a body currently has.\n     *\n     * Derived from `body.speed^2 + body.angularSpeed^2`. See `Sleeping.update`.\n     * \n     * @readOnly\n     * @property motion\n     * @type number\n     * @default 0\n     */\n\n    /**\n     * A `Number` that defines the length of time during which this body must have near-zero velocity before it is set as sleeping by the `Matter.Sleeping` module (if sleeping is enabled by the engine).\n     * \n     * @property sleepThreshold\n     * @type number\n     * @default 60\n     */\n\n    /**\n     * _Read only_. Use `Body.setDensity` to set. \n     * \n     * A `Number` that defines the density of the body (mass per unit area).\n     * \n     * Mass will also be updated when set.\n     *\n     * @readOnly\n     * @property density\n     * @type number\n     * @default 0.001\n     */\n\n    /**\n     * _Read only_. Use `Body.setMass` to set. \n     * \n     * A `Number` that defines the mass of the body.\n     * \n     * Density will also be updated when set.\n     * \n     * @readOnly\n     * @property mass\n     * @type number\n     */\n\n    /**\n     * _Read only_. Use `Body.setMass` to set. \n     * \n     * A `Number` that defines the inverse mass of the body (`1 / mass`).\n     *\n     * @readOnly\n     * @property inverseMass\n     * @type number\n     */\n\n    /**\n     * _Read only_. Automatically calculated when vertices, mass or density are set or set through `Body.setInertia`.\n     * \n     * A `Number` that defines the moment of inertia of the body. This is the second moment of area in two dimensions.\n     * \n     * Can be manually set to `Infinity` to prevent rotation of the body. See `Body.setInertia`.\n     * \n     * @readOnly\n     * @property inertia\n     * @type number\n     */\n\n    /**\n     * _Read only_. Automatically calculated when vertices, mass or density are set or calculated by `Body.setInertia`.\n     * \n     * A `Number` that defines the inverse moment of inertia of the body (`1 / inertia`).\n     * \n     * @readOnly\n     * @property inverseInertia\n     * @type number\n     */\n\n    /**\n     * A `Number` that defines the restitution (elasticity) of the body. The value is always positive and is in the range `(0, 1)`.\n     * A value of `0` means collisions may be perfectly inelastic and no bouncing may occur. \n     * A value of `0.8` means the body may bounce back with approximately 80% of its kinetic energy.\n     * Note that collision response is based on _pairs_ of bodies, and that `restitution` values are _combined_ with the following formula:\n     *\n     * `Math.max(bodyA.restitution, bodyB.restitution)`\n     *\n     * @property restitution\n     * @type number\n     * @default 0\n     */\n\n    /**\n     * A `Number` that defines the friction of the body. The value is always positive and is in the range `(0, 1)`.\n     * A value of `0` means that the body may slide indefinitely.\n     * A value of `1` means the body may come to a stop almost instantly after a force is applied.\n     *\n     * The effects of the value may be non-linear. \n     * High values may be unstable depending on the body.\n     * The engine uses a Coulomb friction model including static and kinetic friction.\n     * Note that collision response is based on _pairs_ of bodies, and that `friction` values are _combined_ with the following formula:\n     *\n     * `Math.min(bodyA.friction, bodyB.friction)`\n     *\n     * @property friction\n     * @type number\n     * @default 0.1\n     */\n\n    /**\n     * A `Number` that defines the static friction of the body (in the Coulomb friction model). \n     * A value of `0` means the body will never 'stick' when it is nearly stationary and only dynamic `friction` is used.\n     * The higher the value (e.g. `10`), the more force it will take to initially get the body moving when nearly stationary.\n     * This value is multiplied with the `friction` property to make it easier to change `friction` and maintain an appropriate amount of static friction.\n     *\n     * @property frictionStatic\n     * @type number\n     * @default 0.5\n     */\n\n    /**\n     * A `Number` that defines the air friction of the body (air resistance). \n     * A value of `0` means the body will never slow as it moves through space.\n     * The higher the value, the faster a body slows when moving through space.\n     * The effects of the value are non-linear. \n     *\n     * @property frictionAir\n     * @type number\n     * @default 0.01\n     */\n\n    /**\n     * An `Object` that specifies the collision filtering properties of this body.\n     *\n     * Collisions between two bodies will obey the following rules:\n     * - If the two bodies have the same non-zero value of `collisionFilter.group`,\n     *   they will always collide if the value is positive, and they will never collide\n     *   if the value is negative.\n     * - If the two bodies have different values of `collisionFilter.group` or if one\n     *   (or both) of the bodies has a value of 0, then the category/mask rules apply as follows:\n     *\n     * Each body belongs to a collision category, given by `collisionFilter.category`. This\n     * value is used as a bit field and the category should have only one bit set, meaning that\n     * the value of this property is a power of two in the range [1, 2^31]. Thus, there are 32\n     * different collision categories available.\n     *\n     * Each body also defines a collision bitmask, given by `collisionFilter.mask` which specifies\n     * the categories it collides with (the value is the bitwise AND value of all these categories).\n     *\n     * Using the category/mask rules, two bodies `A` and `B` collide if each includes the other's\n     * category in its mask, i.e. `(categoryA & maskB) !== 0` and `(categoryB & maskA) !== 0`\n     * are both true.\n     *\n     * @property collisionFilter\n     * @type object\n     */\n\n    /**\n     * An Integer `Number`, that specifies the collision group this body belongs to.\n     * See `body.collisionFilter` for more information.\n     *\n     * @property collisionFilter.group\n     * @type object\n     * @default 0\n     */\n\n    /**\n     * A bit field that specifies the collision category this body belongs to.\n     * The category value should have only one bit set, for example `0x0001`.\n     * This means there are up to 32 unique collision categories available.\n     * See `body.collisionFilter` for more information.\n     *\n     * @property collisionFilter.category\n     * @type object\n     * @default 1\n     */\n\n    /**\n     * A bit mask that specifies the collision categories this body may collide with.\n     * See `body.collisionFilter` for more information.\n     *\n     * @property collisionFilter.mask\n     * @type object\n     * @default -1\n     */\n\n    /**\n     * A `Number` that specifies a thin boundary around the body where it is allowed to slightly sink into other bodies.\n     * \n     * This is required for proper collision response, including friction and restitution effects.\n     * \n     * The default should generally suffice in most cases. You may need to decrease this value for very small bodies that are nearing the default value in scale.\n     *\n     * @property slop\n     * @type number\n     * @default 0.05\n     */\n\n    /**\n     * A `Number` that specifies per-body time scaling.\n     *\n     * @property timeScale\n     * @type number\n     * @default 1\n     */\n\n    /**\n     * _Read only_. Updated during engine update.\n     * \n     * A `Number` that records the last delta time value used to update this body.\n     * Used to calculate speed and velocity.\n     *\n     * @readOnly\n     * @property deltaTime\n     * @type number\n     * @default 1000 / 60\n     */\n\n    /**\n     * An `Object` that defines the rendering properties to be consumed by the module `Matter.Render`.\n     *\n     * @property render\n     * @type object\n     */\n\n    /**\n     * A flag that indicates if the body should be rendered.\n     *\n     * @property render.visible\n     * @type boolean\n     * @default true\n     */\n\n    /**\n     * Sets the opacity to use when rendering.\n     *\n     * @property render.opacity\n     * @type number\n     * @default 1\n    */\n\n    /**\n     * An `Object` that defines the sprite properties to use when rendering, if any.\n     *\n     * @property render.sprite\n     * @type object\n     */\n\n    /**\n     * An `String` that defines the path to the image to use as the sprite texture, if any.\n     *\n     * @property render.sprite.texture\n     * @type string\n     */\n     \n    /**\n     * A `Number` that defines the scaling in the x-axis for the sprite, if any.\n     *\n     * @property render.sprite.xScale\n     * @type number\n     * @default 1\n     */\n\n    /**\n     * A `Number` that defines the scaling in the y-axis for the sprite, if any.\n     *\n     * @property render.sprite.yScale\n     * @type number\n     * @default 1\n     */\n\n    /**\n      * A `Number` that defines the offset in the x-axis for the sprite (normalised by texture width).\n      *\n      * @property render.sprite.xOffset\n      * @type number\n      * @default 0\n      */\n\n    /**\n      * A `Number` that defines the offset in the y-axis for the sprite (normalised by texture height).\n      *\n      * @property render.sprite.yOffset\n      * @type number\n      * @default 0\n      */\n\n    /**\n     * A `Number` that defines the line width to use when rendering the body outline (if a sprite is not defined).\n     * A value of `0` means no outline will be rendered.\n     *\n     * @property render.lineWidth\n     * @type number\n     * @default 0\n     */\n\n    /**\n     * A `String` that defines the fill style to use when rendering the body (if a sprite is not defined).\n     * It is the same as when using a canvas, so it accepts CSS style property values.\n     *\n     * @property render.fillStyle\n     * @type string\n     * @default a random colour\n     */\n\n    /**\n     * A `String` that defines the stroke style to use when rendering the body outline (if a sprite is not defined).\n     * It is the same as when using a canvas, so it accepts CSS style property values.\n     *\n     * @property render.strokeStyle\n     * @type string\n     * @default a random colour\n     */\n\n    /**\n     * _Read only_. Calculated automatically when vertices are set.\n     * \n     * An array of unique axis vectors (edge normals) used for collision detection.\n     * These are automatically calculated when vertices are set.\n     * They are constantly updated by `Body.update` during the simulation.\n     *\n     * @readOnly\n     * @property axes\n     * @type vector[]\n     */\n     \n    /**\n     * _Read only_. Calculated automatically when vertices are set.\n     * \n     * A `Number` that measures the area of the body's convex hull.\n     * \n     * @readOnly\n     * @property area\n     * @type string\n     * @default \n     */\n\n    /**\n     * A `Bounds` object that defines the AABB region for the body.\n     * It is automatically calculated when vertices are set and constantly updated by `Body.update` during simulation.\n     * \n     * @property bounds\n     * @type bounds\n     */\n\n})();\n\n\n/***/ }),\n/* 5 */\n/***/ (function(module, exports, __nested_webpack_require_99052__) {\n\n/**\n* The `Matter.Events` module contains methods to fire and listen to events on other objects.\n*\n* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).\n*\n* @class Events\n*/\n\nvar Events = {};\n\nmodule.exports = Events;\n\nvar Common = __nested_webpack_require_99052__(0);\n\n(function() {\n\n    /**\n     * Subscribes a callback function to the given object's `eventName`.\n     * @method on\n     * @param {} object\n     * @param {string} eventNames\n     * @param {function} callback\n     */\n    Events.on = function(object, eventNames, callback) {\n        var names = eventNames.split(' '),\n            name;\n\n        for (var i = 0; i < names.length; i++) {\n            name = names[i];\n            object.events = object.events || {};\n            object.events[name] = object.events[name] || [];\n            object.events[name].push(callback);\n        }\n\n        return callback;\n    };\n\n    /**\n     * Removes the given event callback. If no callback, clears all callbacks in `eventNames`. If no `eventNames`, clears all events.\n     * @method off\n     * @param {} object\n     * @param {string} eventNames\n     * @param {function} callback\n     */\n    Events.off = function(object, eventNames, callback) {\n        if (!eventNames) {\n            object.events = {};\n            return;\n        }\n\n        // handle Events.off(object, callback)\n        if (typeof eventNames === 'function') {\n            callback = eventNames;\n            eventNames = Common.keys(object.events).join(' ');\n        }\n\n        var names = eventNames.split(' ');\n\n        for (var i = 0; i < names.length; i++) {\n            var callbacks = object.events[names[i]],\n                newCallbacks = [];\n\n            if (callback && callbacks) {\n                for (var j = 0; j < callbacks.length; j++) {\n                    if (callbacks[j] !== callback)\n                        newCallbacks.push(callbacks[j]);\n                }\n            }\n\n            object.events[names[i]] = newCallbacks;\n        }\n    };\n\n    /**\n     * Fires all the callbacks subscribed to the given object's `eventName`, in the order they subscribed, if any.\n     * @method trigger\n     * @param {} object\n     * @param {string} eventNames\n     * @param {} event\n     */\n    Events.trigger = function(object, eventNames, event) {\n        var names,\n            name,\n            callbacks,\n            eventClone;\n\n        var events = object.events;\n        \n        if (events && Common.keys(events).length > 0) {\n            if (!event)\n                event = {};\n\n            names = eventNames.split(' ');\n\n            for (var i = 0; i < names.length; i++) {\n                name = names[i];\n                callbacks = events[name];\n\n                if (callbacks) {\n                    eventClone = Common.clone(event, false);\n                    eventClone.name = name;\n                    eventClone.source = object;\n\n                    for (var j = 0; j < callbacks.length; j++) {\n                        callbacks[j].apply(object, [eventClone]);\n                    }\n                }\n            }\n        }\n    };\n\n})();\n\n\n/***/ }),\n/* 6 */\n/***/ (function(module, exports, __nested_webpack_require_102250__) {\n\n/**\n* A composite is a collection of `Matter.Body`, `Matter.Constraint` and other `Matter.Composite` objects.\n*\n* They are a container that can represent complex objects made of multiple parts, even if they are not physically connected.\n* A composite could contain anything from a single body all the way up to a whole world.\n* \n* When making any changes to composites, use the included functions rather than changing their properties directly.\n*\n* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).\n*\n* @class Composite\n*/\n\nvar Composite = {};\n\nmodule.exports = Composite;\n\nvar Events = __nested_webpack_require_102250__(5);\nvar Common = __nested_webpack_require_102250__(0);\nvar Bounds = __nested_webpack_require_102250__(1);\nvar Body = __nested_webpack_require_102250__(4);\n\n(function() {\n\n    /**\n     * Creates a new composite. The options parameter is an object that specifies any properties you wish to override the defaults.\n     * See the properites section below for detailed information on what you can pass via the `options` object.\n     * @method create\n     * @param {} [options]\n     * @return {composite} A new composite\n     */\n    Composite.create = function(options) {\n        return Common.extend({ \n            id: Common.nextId(),\n            type: 'composite',\n            parent: null,\n            isModified: false,\n            bodies: [], \n            constraints: [], \n            composites: [],\n            label: 'Composite',\n            plugin: {},\n            cache: {\n                allBodies: null,\n                allConstraints: null,\n                allComposites: null\n            }\n        }, options);\n    };\n\n    /**\n     * Sets the composite's `isModified` flag. \n     * If `updateParents` is true, all parents will be set (default: false).\n     * If `updateChildren` is true, all children will be set (default: false).\n     * @private\n     * @method setModified\n     * @param {composite} composite\n     * @param {boolean} isModified\n     * @param {boolean} [updateParents=false]\n     * @param {boolean} [updateChildren=false]\n     */\n    Composite.setModified = function(composite, isModified, updateParents, updateChildren) {\n        composite.isModified = isModified;\n\n        if (isModified && composite.cache) {\n            composite.cache.allBodies = null;\n            composite.cache.allConstraints = null;\n            composite.cache.allComposites = null;\n        }\n\n        if (updateParents && composite.parent) {\n            Composite.setModified(composite.parent, isModified, updateParents, updateChildren);\n        }\n\n        if (updateChildren) {\n            for (var i = 0; i < composite.composites.length; i++) {\n                var childComposite = composite.composites[i];\n                Composite.setModified(childComposite, isModified, updateParents, updateChildren);\n            }\n        }\n    };\n\n    /**\n     * Generic single or multi-add function. Adds a single or an array of body(s), constraint(s) or composite(s) to the given composite.\n     * Triggers `beforeAdd` and `afterAdd` events on the `composite`.\n     * @method add\n     * @param {composite} composite\n     * @param {object|array} object A single or an array of body(s), constraint(s) or composite(s)\n     * @return {composite} The original composite with the objects added\n     */\n    Composite.add = function(composite, object) {\n        var objects = [].concat(object);\n\n        Events.trigger(composite, 'beforeAdd', { object: object });\n\n        for (var i = 0; i < objects.length; i++) {\n            var obj = objects[i];\n\n            switch (obj.type) {\n\n            case 'body':\n                // skip adding compound parts\n                if (obj.parent !== obj) {\n                    Common.warn('Composite.add: skipped adding a compound body part (you must add its parent instead)');\n                    break;\n                }\n\n                Composite.addBody(composite, obj);\n                break;\n            case 'constraint':\n                Composite.addConstraint(composite, obj);\n                break;\n            case 'composite':\n                Composite.addComposite(composite, obj);\n                break;\n            case 'mouseConstraint':\n                Composite.addConstraint(composite, obj.constraint);\n                break;\n\n            }\n        }\n\n        Events.trigger(composite, 'afterAdd', { object: object });\n\n        return composite;\n    };\n\n    /**\n     * Generic remove function. Removes one or many body(s), constraint(s) or a composite(s) to the given composite.\n     * Optionally searching its children recursively.\n     * Triggers `beforeRemove` and `afterRemove` events on the `composite`.\n     * @method remove\n     * @param {composite} composite\n     * @param {object|array} object\n     * @param {boolean} [deep=false]\n     * @return {composite} The original composite with the objects removed\n     */\n    Composite.remove = function(composite, object, deep) {\n        var objects = [].concat(object);\n\n        Events.trigger(composite, 'beforeRemove', { object: object });\n\n        for (var i = 0; i < objects.length; i++) {\n            var obj = objects[i];\n\n            switch (obj.type) {\n\n            case 'body':\n                Composite.removeBody(composite, obj, deep);\n                break;\n            case 'constraint':\n                Composite.removeConstraint(composite, obj, deep);\n                break;\n            case 'composite':\n                Composite.removeComposite(composite, obj, deep);\n                break;\n            case 'mouseConstraint':\n                Composite.removeConstraint(composite, obj.constraint);\n                break;\n\n            }\n        }\n\n        Events.trigger(composite, 'afterRemove', { object: object });\n\n        return composite;\n    };\n\n    /**\n     * Adds a composite to the given composite.\n     * @private\n     * @method addComposite\n     * @param {composite} compositeA\n     * @param {composite} compositeB\n     * @return {composite} The original compositeA with the objects from compositeB added\n     */\n    Composite.addComposite = function(compositeA, compositeB) {\n        compositeA.composites.push(compositeB);\n        compositeB.parent = compositeA;\n        Composite.setModified(compositeA, true, true, false);\n        return compositeA;\n    };\n\n    /**\n     * Removes a composite from the given composite, and optionally searching its children recursively.\n     * @private\n     * @method removeComposite\n     * @param {composite} compositeA\n     * @param {composite} compositeB\n     * @param {boolean} [deep=false]\n     * @return {composite} The original compositeA with the composite removed\n     */\n    Composite.removeComposite = function(compositeA, compositeB, deep) {\n        var position = Common.indexOf(compositeA.composites, compositeB);\n        if (position !== -1) {\n            Composite.removeCompositeAt(compositeA, position);\n        }\n\n        if (deep) {\n            for (var i = 0; i < compositeA.composites.length; i++){\n                Composite.removeComposite(compositeA.composites[i], compositeB, true);\n            }\n        }\n\n        return compositeA;\n    };\n\n    /**\n     * Removes a composite from the given composite.\n     * @private\n     * @method removeCompositeAt\n     * @param {composite} composite\n     * @param {number} position\n     * @return {composite} The original composite with the composite removed\n     */\n    Composite.removeCompositeAt = function(composite, position) {\n        composite.composites.splice(position, 1);\n        Composite.setModified(composite, true, true, false);\n        return composite;\n    };\n\n    /**\n     * Adds a body to the given composite.\n     * @private\n     * @method addBody\n     * @param {composite} composite\n     * @param {body} body\n     * @return {composite} The original composite with the body added\n     */\n    Composite.addBody = function(composite, body) {\n        composite.bodies.push(body);\n        Composite.setModified(composite, true, true, false);\n        return composite;\n    };\n\n    /**\n     * Removes a body from the given composite, and optionally searching its children recursively.\n     * @private\n     * @method removeBody\n     * @param {composite} composite\n     * @param {body} body\n     * @param {boolean} [deep=false]\n     * @return {composite} The original composite with the body removed\n     */\n    Composite.removeBody = function(composite, body, deep) {\n        var position = Common.indexOf(composite.bodies, body);\n        if (position !== -1) {\n            Composite.removeBodyAt(composite, position);\n        }\n\n        if (deep) {\n            for (var i = 0; i < composite.composites.length; i++){\n                Composite.removeBody(composite.composites[i], body, true);\n            }\n        }\n\n        return composite;\n    };\n\n    /**\n     * Removes a body from the given composite.\n     * @private\n     * @method removeBodyAt\n     * @param {composite} composite\n     * @param {number} position\n     * @return {composite} The original composite with the body removed\n     */\n    Composite.removeBodyAt = function(composite, position) {\n        composite.bodies.splice(position, 1);\n        Composite.setModified(composite, true, true, false);\n        return composite;\n    };\n\n    /**\n     * Adds a constraint to the given composite.\n     * @private\n     * @method addConstraint\n     * @param {composite} composite\n     * @param {constraint} constraint\n     * @return {composite} The original composite with the constraint added\n     */\n    Composite.addConstraint = function(composite, constraint) {\n        composite.constraints.push(constraint);\n        Composite.setModified(composite, true, true, false);\n        return composite;\n    };\n\n    /**\n     * Removes a constraint from the given composite, and optionally searching its children recursively.\n     * @private\n     * @method removeConstraint\n     * @param {composite} composite\n     * @param {constraint} constraint\n     * @param {boolean} [deep=false]\n     * @return {composite} The original composite with the constraint removed\n     */\n    Composite.removeConstraint = function(composite, constraint, deep) {\n        var position = Common.indexOf(composite.constraints, constraint);\n        if (position !== -1) {\n            Composite.removeConstraintAt(composite, position);\n        }\n\n        if (deep) {\n            for (var i = 0; i < composite.composites.length; i++){\n                Composite.removeConstraint(composite.composites[i], constraint, true);\n            }\n        }\n\n        return composite;\n    };\n\n    /**\n     * Removes a body from the given composite.\n     * @private\n     * @method removeConstraintAt\n     * @param {composite} composite\n     * @param {number} position\n     * @return {composite} The original composite with the constraint removed\n     */\n    Composite.removeConstraintAt = function(composite, position) {\n        composite.constraints.splice(position, 1);\n        Composite.setModified(composite, true, true, false);\n        return composite;\n    };\n\n    /**\n     * Removes all bodies, constraints and composites from the given composite.\n     * Optionally clearing its children recursively.\n     * @method clear\n     * @param {composite} composite\n     * @param {boolean} keepStatic\n     * @param {boolean} [deep=false]\n     */\n    Composite.clear = function(composite, keepStatic, deep) {\n        if (deep) {\n            for (var i = 0; i < composite.composites.length; i++){\n                Composite.clear(composite.composites[i], keepStatic, true);\n            }\n        }\n        \n        if (keepStatic) {\n            composite.bodies = composite.bodies.filter(function(body) { return body.isStatic; });\n        } else {\n            composite.bodies.length = 0;\n        }\n\n        composite.constraints.length = 0;\n        composite.composites.length = 0;\n\n        Composite.setModified(composite, true, true, false);\n\n        return composite;\n    };\n\n    /**\n     * Returns all bodies in the given composite, including all bodies in its children, recursively.\n     * @method allBodies\n     * @param {composite} composite\n     * @return {body[]} All the bodies\n     */\n    Composite.allBodies = function(composite) {\n        if (composite.cache && composite.cache.allBodies) {\n            return composite.cache.allBodies;\n        }\n\n        var bodies = [].concat(composite.bodies);\n\n        for (var i = 0; i < composite.composites.length; i++)\n            bodies = bodies.concat(Composite.allBodies(composite.composites[i]));\n\n        if (composite.cache) {\n            composite.cache.allBodies = bodies;\n        }\n\n        return bodies;\n    };\n\n    /**\n     * Returns all constraints in the given composite, including all constraints in its children, recursively.\n     * @method allConstraints\n     * @param {composite} composite\n     * @return {constraint[]} All the constraints\n     */\n    Composite.allConstraints = function(composite) {\n        if (composite.cache && composite.cache.allConstraints) {\n            return composite.cache.allConstraints;\n        }\n\n        var constraints = [].concat(composite.constraints);\n\n        for (var i = 0; i < composite.composites.length; i++)\n            constraints = constraints.concat(Composite.allConstraints(composite.composites[i]));\n\n        if (composite.cache) {\n            composite.cache.allConstraints = constraints;\n        }\n\n        return constraints;\n    };\n\n    /**\n     * Returns all composites in the given composite, including all composites in its children, recursively.\n     * @method allComposites\n     * @param {composite} composite\n     * @return {composite[]} All the composites\n     */\n    Composite.allComposites = function(composite) {\n        if (composite.cache && composite.cache.allComposites) {\n            return composite.cache.allComposites;\n        }\n\n        var composites = [].concat(composite.composites);\n\n        for (var i = 0; i < composite.composites.length; i++)\n            composites = composites.concat(Composite.allComposites(composite.composites[i]));\n\n        if (composite.cache) {\n            composite.cache.allComposites = composites;\n        }\n\n        return composites;\n    };\n\n    /**\n     * Searches the composite recursively for an object matching the type and id supplied, null if not found.\n     * @method get\n     * @param {composite} composite\n     * @param {number} id\n     * @param {string} type\n     * @return {object} The requested object, if found\n     */\n    Composite.get = function(composite, id, type) {\n        var objects,\n            object;\n\n        switch (type) {\n        case 'body':\n            objects = Composite.allBodies(composite);\n            break;\n        case 'constraint':\n            objects = Composite.allConstraints(composite);\n            break;\n        case 'composite':\n            objects = Composite.allComposites(composite).concat(composite);\n            break;\n        }\n\n        if (!objects)\n            return null;\n\n        object = objects.filter(function(object) { \n            return object.id.toString() === id.toString(); \n        });\n\n        return object.length === 0 ? null : object[0];\n    };\n\n    /**\n     * Moves the given object(s) from compositeA to compositeB (equal to a remove followed by an add).\n     * @method move\n     * @param {compositeA} compositeA\n     * @param {object[]} objects\n     * @param {compositeB} compositeB\n     * @return {composite} Returns compositeA\n     */\n    Composite.move = function(compositeA, objects, compositeB) {\n        Composite.remove(compositeA, objects);\n        Composite.add(compositeB, objects);\n        return compositeA;\n    };\n\n    /**\n     * Assigns new ids for all objects in the composite, recursively.\n     * @method rebase\n     * @param {composite} composite\n     * @return {composite} Returns composite\n     */\n    Composite.rebase = function(composite) {\n        var objects = Composite.allBodies(composite)\n            .concat(Composite.allConstraints(composite))\n            .concat(Composite.allComposites(composite));\n\n        for (var i = 0; i < objects.length; i++) {\n            objects[i].id = Common.nextId();\n        }\n\n        return composite;\n    };\n\n    /**\n     * Translates all children in the composite by a given vector relative to their current positions, \n     * without imparting any velocity.\n     * @method translate\n     * @param {composite} composite\n     * @param {vector} translation\n     * @param {bool} [recursive=true]\n     */\n    Composite.translate = function(composite, translation, recursive) {\n        var bodies = recursive ? Composite.allBodies(composite) : composite.bodies;\n\n        for (var i = 0; i < bodies.length; i++) {\n            Body.translate(bodies[i], translation);\n        }\n\n        return composite;\n    };\n\n    /**\n     * Rotates all children in the composite by a given angle about the given point, without imparting any angular velocity.\n     * @method rotate\n     * @param {composite} composite\n     * @param {number} rotation\n     * @param {vector} point\n     * @param {bool} [recursive=true]\n     */\n    Composite.rotate = function(composite, rotation, point, recursive) {\n        var cos = Math.cos(rotation),\n            sin = Math.sin(rotation),\n            bodies = recursive ? Composite.allBodies(composite) : composite.bodies;\n\n        for (var i = 0; i < bodies.length; i++) {\n            var body = bodies[i],\n                dx = body.position.x - point.x,\n                dy = body.position.y - point.y;\n                \n            Body.setPosition(body, {\n                x: point.x + (dx * cos - dy * sin),\n                y: point.y + (dx * sin + dy * cos)\n            });\n\n            Body.rotate(body, rotation);\n        }\n\n        return composite;\n    };\n\n    /**\n     * Scales all children in the composite, including updating physical properties (mass, area, axes, inertia), from a world-space point.\n     * @method scale\n     * @param {composite} composite\n     * @param {number} scaleX\n     * @param {number} scaleY\n     * @param {vector} point\n     * @param {bool} [recursive=true]\n     */\n    Composite.scale = function(composite, scaleX, scaleY, point, recursive) {\n        var bodies = recursive ? Composite.allBodies(composite) : composite.bodies;\n\n        for (var i = 0; i < bodies.length; i++) {\n            var body = bodies[i],\n                dx = body.position.x - point.x,\n                dy = body.position.y - point.y;\n                \n            Body.setPosition(body, {\n                x: point.x + dx * scaleX,\n                y: point.y + dy * scaleY\n            });\n\n            Body.scale(body, scaleX, scaleY);\n        }\n\n        return composite;\n    };\n\n    /**\n     * Returns the union of the bounds of all of the composite's bodies.\n     * @method bounds\n     * @param {composite} composite The composite.\n     * @returns {bounds} The composite bounds.\n     */\n    Composite.bounds = function(composite) {\n        var bodies = Composite.allBodies(composite),\n            vertices = [];\n\n        for (var i = 0; i < bodies.length; i += 1) {\n            var body = bodies[i];\n            vertices.push(body.bounds.min, body.bounds.max);\n        }\n\n        return Bounds.create(vertices);\n    };\n\n    /*\n    *\n    *  Events Documentation\n    *\n    */\n\n    /**\n    * Fired when a call to `Composite.add` is made, before objects have been added.\n    *\n    * @event beforeAdd\n    * @param {} event An event object\n    * @param {} event.object The object(s) to be added (may be a single body, constraint, composite or a mixed array of these)\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /**\n    * Fired when a call to `Composite.add` is made, after objects have been added.\n    *\n    * @event afterAdd\n    * @param {} event An event object\n    * @param {} event.object The object(s) that have been added (may be a single body, constraint, composite or a mixed array of these)\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /**\n    * Fired when a call to `Composite.remove` is made, before objects have been removed.\n    *\n    * @event beforeRemove\n    * @param {} event An event object\n    * @param {} event.object The object(s) to be removed (may be a single body, constraint, composite or a mixed array of these)\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /**\n    * Fired when a call to `Composite.remove` is made, after objects have been removed.\n    *\n    * @event afterRemove\n    * @param {} event An event object\n    * @param {} event.object The object(s) that have been removed (may be a single body, constraint, composite or a mixed array of these)\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /*\n    *\n    *  Properties Documentation\n    *\n    */\n\n    /**\n     * An integer `Number` uniquely identifying number generated in `Composite.create` by `Common.nextId`.\n     *\n     * @property id\n     * @type number\n     */\n\n    /**\n     * A `String` denoting the type of object.\n     *\n     * @property type\n     * @type string\n     * @default \"composite\"\n     * @readOnly\n     */\n\n    /**\n     * An arbitrary `String` name to help the user identify and manage composites.\n     *\n     * @property label\n     * @type string\n     * @default \"Composite\"\n     */\n\n    /**\n     * A flag that specifies whether the composite has been modified during the current step.\n     * This is automatically managed when bodies, constraints or composites are added or removed.\n     *\n     * @property isModified\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * The `Composite` that is the parent of this composite. It is automatically managed by the `Matter.Composite` methods.\n     *\n     * @property parent\n     * @type composite\n     * @default null\n     */\n\n    /**\n     * An array of `Body` that are _direct_ children of this composite.\n     * To add or remove bodies you should use `Composite.add` and `Composite.remove` methods rather than directly modifying this property.\n     * If you wish to recursively find all descendants, you should use the `Composite.allBodies` method.\n     *\n     * @property bodies\n     * @type body[]\n     * @default []\n     */\n\n    /**\n     * An array of `Constraint` that are _direct_ children of this composite.\n     * To add or remove constraints you should use `Composite.add` and `Composite.remove` methods rather than directly modifying this property.\n     * If you wish to recursively find all descendants, you should use the `Composite.allConstraints` method.\n     *\n     * @property constraints\n     * @type constraint[]\n     * @default []\n     */\n\n    /**\n     * An array of `Composite` that are _direct_ children of this composite.\n     * To add or remove composites you should use `Composite.add` and `Composite.remove` methods rather than directly modifying this property.\n     * If you wish to recursively find all descendants, you should use the `Composite.allComposites` method.\n     *\n     * @property composites\n     * @type composite[]\n     * @default []\n     */\n\n    /**\n     * An object reserved for storing plugin-specific properties.\n     *\n     * @property plugin\n     * @type {}\n     */\n\n    /**\n     * An object used for storing cached results for performance reasons.\n     * This is used internally only and is automatically managed.\n     *\n     * @private\n     * @property cache\n     * @type {}\n     */\n\n})();\n\n\n/***/ }),\n/* 7 */\n/***/ (function(module, exports, __nested_webpack_require_125937__) {\n\n/**\n* The `Matter.Sleeping` module contains methods to manage the sleeping state of bodies.\n*\n* @class Sleeping\n*/\n\nvar Sleeping = {};\n\nmodule.exports = Sleeping;\n\nvar Body = __nested_webpack_require_125937__(4);\nvar Events = __nested_webpack_require_125937__(5);\nvar Common = __nested_webpack_require_125937__(0);\n\n(function() {\n\n    Sleeping._motionWakeThreshold = 0.18;\n    Sleeping._motionSleepThreshold = 0.08;\n    Sleeping._minBias = 0.9;\n\n    /**\n     * Puts bodies to sleep or wakes them up depending on their motion.\n     * @method update\n     * @param {body[]} bodies\n     * @param {number} delta\n     */\n    Sleeping.update = function(bodies, delta) {\n        var timeScale = delta / Common._baseDelta,\n            motionSleepThreshold = Sleeping._motionSleepThreshold;\n        \n        // update bodies sleeping status\n        for (var i = 0; i < bodies.length; i++) {\n            var body = bodies[i],\n                speed = Body.getSpeed(body),\n                angularSpeed = Body.getAngularSpeed(body),\n                motion = speed * speed + angularSpeed * angularSpeed;\n\n            // wake up bodies if they have a force applied\n            if (body.force.x !== 0 || body.force.y !== 0) {\n                Sleeping.set(body, false);\n                continue;\n            }\n\n            var minMotion = Math.min(body.motion, motion),\n                maxMotion = Math.max(body.motion, motion);\n        \n            // biased average motion estimation between frames\n            body.motion = Sleeping._minBias * minMotion + (1 - Sleeping._minBias) * maxMotion;\n\n            if (body.sleepThreshold > 0 && body.motion < motionSleepThreshold) {\n                body.sleepCounter += 1;\n                \n                if (body.sleepCounter >= body.sleepThreshold / timeScale) {\n                    Sleeping.set(body, true);\n                }\n            } else if (body.sleepCounter > 0) {\n                body.sleepCounter -= 1;\n            }\n        }\n    };\n\n    /**\n     * Given a set of colliding pairs, wakes the sleeping bodies involved.\n     * @method afterCollisions\n     * @param {pair[]} pairs\n     */\n    Sleeping.afterCollisions = function(pairs) {\n        var motionSleepThreshold = Sleeping._motionSleepThreshold;\n\n        // wake up bodies involved in collisions\n        for (var i = 0; i < pairs.length; i++) {\n            var pair = pairs[i];\n            \n            // don't wake inactive pairs\n            if (!pair.isActive)\n                continue;\n\n            var collision = pair.collision,\n                bodyA = collision.bodyA.parent, \n                bodyB = collision.bodyB.parent;\n        \n            // don't wake if at least one body is static\n            if ((bodyA.isSleeping && bodyB.isSleeping) || bodyA.isStatic || bodyB.isStatic)\n                continue;\n        \n            if (bodyA.isSleeping || bodyB.isSleeping) {\n                var sleepingBody = (bodyA.isSleeping && !bodyA.isStatic) ? bodyA : bodyB,\n                    movingBody = sleepingBody === bodyA ? bodyB : bodyA;\n\n                if (!sleepingBody.isStatic && movingBody.motion > motionSleepThreshold) {\n                    Sleeping.set(sleepingBody, false);\n                }\n            }\n        }\n    };\n  \n    /**\n     * Set a body as sleeping or awake.\n     * @method set\n     * @param {body} body\n     * @param {boolean} isSleeping\n     */\n    Sleeping.set = function(body, isSleeping) {\n        var wasSleeping = body.isSleeping;\n\n        if (isSleeping) {\n            body.isSleeping = true;\n            body.sleepCounter = body.sleepThreshold;\n\n            body.positionImpulse.x = 0;\n            body.positionImpulse.y = 0;\n\n            body.positionPrev.x = body.position.x;\n            body.positionPrev.y = body.position.y;\n\n            body.anglePrev = body.angle;\n            body.speed = 0;\n            body.angularSpeed = 0;\n            body.motion = 0;\n\n            if (!wasSleeping) {\n                Events.trigger(body, 'sleepStart');\n            }\n        } else {\n            body.isSleeping = false;\n            body.sleepCounter = 0;\n\n            if (wasSleeping) {\n                Events.trigger(body, 'sleepEnd');\n            }\n        }\n    };\n\n})();\n\n\n/***/ }),\n/* 8 */\n/***/ (function(module, exports, __nested_webpack_require_130181__) {\n\n/**\n* The `Matter.Collision` module contains methods for detecting collisions between a given pair of bodies.\n*\n* For efficient detection between a list of bodies, see `Matter.Detector` and `Matter.Query`.\n*\n* See `Matter.Engine` for collision events.\n*\n* @class Collision\n*/\n\nvar Collision = {};\n\nmodule.exports = Collision;\n\nvar Vertices = __nested_webpack_require_130181__(3);\nvar Pair = __nested_webpack_require_130181__(9);\n\n(function() {\n    var _supports = [];\n\n    var _overlapAB = {\n        overlap: 0,\n        axis: null\n    };\n\n    var _overlapBA = {\n        overlap: 0,\n        axis: null\n    };\n\n    /**\n     * Creates a new collision record.\n     * @method create\n     * @param {body} bodyA The first body part represented by the collision record\n     * @param {body} bodyB The second body part represented by the collision record\n     * @return {collision} A new collision record\n     */\n    Collision.create = function(bodyA, bodyB) {\n        return { \n            pair: null,\n            collided: false,\n            bodyA: bodyA,\n            bodyB: bodyB,\n            parentA: bodyA.parent,\n            parentB: bodyB.parent,\n            depth: 0,\n            normal: { x: 0, y: 0 },\n            tangent: { x: 0, y: 0 },\n            penetration: { x: 0, y: 0 },\n            supports: []\n        };\n    };\n\n    /**\n     * Detect collision between two bodies.\n     * @method collides\n     * @param {body} bodyA\n     * @param {body} bodyB\n     * @param {pairs} [pairs] Optionally reuse collision records from existing pairs.\n     * @return {collision|null} A collision record if detected, otherwise null\n     */\n    Collision.collides = function(bodyA, bodyB, pairs) {\n        Collision._overlapAxes(_overlapAB, bodyA.vertices, bodyB.vertices, bodyA.axes);\n\n        if (_overlapAB.overlap <= 0) {\n            return null;\n        }\n\n        Collision._overlapAxes(_overlapBA, bodyB.vertices, bodyA.vertices, bodyB.axes);\n\n        if (_overlapBA.overlap <= 0) {\n            return null;\n        }\n\n        // reuse collision records for gc efficiency\n        var pair = pairs && pairs.table[Pair.id(bodyA, bodyB)],\n            collision;\n\n        if (!pair) {\n            collision = Collision.create(bodyA, bodyB);\n            collision.collided = true;\n            collision.bodyA = bodyA.id < bodyB.id ? bodyA : bodyB;\n            collision.bodyB = bodyA.id < bodyB.id ? bodyB : bodyA;\n            collision.parentA = collision.bodyA.parent;\n            collision.parentB = collision.bodyB.parent;\n        } else {\n            collision = pair.collision;\n        }\n\n        bodyA = collision.bodyA;\n        bodyB = collision.bodyB;\n\n        var minOverlap;\n\n        if (_overlapAB.overlap < _overlapBA.overlap) {\n            minOverlap = _overlapAB;\n        } else {\n            minOverlap = _overlapBA;\n        }\n\n        var normal = collision.normal,\n            supports = collision.supports,\n            minAxis = minOverlap.axis,\n            minAxisX = minAxis.x,\n            minAxisY = minAxis.y;\n\n        // ensure normal is facing away from bodyA\n        if (minAxisX * (bodyB.position.x - bodyA.position.x) + minAxisY * (bodyB.position.y - bodyA.position.y) < 0) {\n            normal.x = minAxisX;\n            normal.y = minAxisY;\n        } else {\n            normal.x = -minAxisX;\n            normal.y = -minAxisY;\n        }\n        \n        collision.tangent.x = -normal.y;\n        collision.tangent.y = normal.x;\n\n        collision.depth = minOverlap.overlap;\n\n        collision.penetration.x = normal.x * collision.depth;\n        collision.penetration.y = normal.y * collision.depth;\n\n        // find support points, there is always either exactly one or two\n        var supportsB = Collision._findSupports(bodyA, bodyB, normal, 1),\n            supportCount = 0;\n\n        // find the supports from bodyB that are inside bodyA\n        if (Vertices.contains(bodyA.vertices, supportsB[0])) {\n            supports[supportCount++] = supportsB[0];\n        }\n\n        if (Vertices.contains(bodyA.vertices, supportsB[1])) {\n            supports[supportCount++] = supportsB[1];\n        }\n\n        // find the supports from bodyA that are inside bodyB\n        if (supportCount < 2) {\n            var supportsA = Collision._findSupports(bodyB, bodyA, normal, -1);\n\n            if (Vertices.contains(bodyB.vertices, supportsA[0])) {\n                supports[supportCount++] = supportsA[0];\n            }\n\n            if (supportCount < 2 && Vertices.contains(bodyB.vertices, supportsA[1])) {\n                supports[supportCount++] = supportsA[1];\n            }\n        }\n\n        // account for the edge case of overlapping but no vertex containment\n        if (supportCount === 0) {\n            supports[supportCount++] = supportsB[0];\n        }\n\n        // update supports array size\n        supports.length = supportCount;\n\n        return collision;\n    };\n\n    /**\n     * Find the overlap between two sets of vertices.\n     * @method _overlapAxes\n     * @private\n     * @param {object} result\n     * @param {vertices} verticesA\n     * @param {vertices} verticesB\n     * @param {axes} axes\n     */\n    Collision._overlapAxes = function(result, verticesA, verticesB, axes) {\n        var verticesALength = verticesA.length,\n            verticesBLength = verticesB.length,\n            verticesAX = verticesA[0].x,\n            verticesAY = verticesA[0].y,\n            verticesBX = verticesB[0].x,\n            verticesBY = verticesB[0].y,\n            axesLength = axes.length,\n            overlapMin = Number.MAX_VALUE,\n            overlapAxisNumber = 0,\n            overlap,\n            overlapAB,\n            overlapBA,\n            dot,\n            i,\n            j;\n\n        for (i = 0; i < axesLength; i++) {\n            var axis = axes[i],\n                axisX = axis.x,\n                axisY = axis.y,\n                minA = verticesAX * axisX + verticesAY * axisY,\n                minB = verticesBX * axisX + verticesBY * axisY,\n                maxA = minA,\n                maxB = minB;\n            \n            for (j = 1; j < verticesALength; j += 1) {\n                dot = verticesA[j].x * axisX + verticesA[j].y * axisY;\n\n                if (dot > maxA) { \n                    maxA = dot;\n                } else if (dot < minA) { \n                    minA = dot;\n                }\n            }\n\n            for (j = 1; j < verticesBLength; j += 1) {\n                dot = verticesB[j].x * axisX + verticesB[j].y * axisY;\n\n                if (dot > maxB) { \n                    maxB = dot;\n                } else if (dot < minB) { \n                    minB = dot;\n                }\n            }\n\n            overlapAB = maxA - minB;\n            overlapBA = maxB - minA;\n            overlap = overlapAB < overlapBA ? overlapAB : overlapBA;\n\n            if (overlap < overlapMin) {\n                overlapMin = overlap;\n                overlapAxisNumber = i;\n\n                if (overlap <= 0) {\n                    // can not be intersecting\n                    break;\n                }\n            } \n        }\n\n        result.axis = axes[overlapAxisNumber];\n        result.overlap = overlapMin;\n    };\n\n    /**\n     * Projects vertices on an axis and returns an interval.\n     * @method _projectToAxis\n     * @private\n     * @param {} projection\n     * @param {} vertices\n     * @param {} axis\n     */\n    Collision._projectToAxis = function(projection, vertices, axis) {\n        var min = vertices[0].x * axis.x + vertices[0].y * axis.y,\n            max = min;\n\n        for (var i = 1; i < vertices.length; i += 1) {\n            var dot = vertices[i].x * axis.x + vertices[i].y * axis.y;\n\n            if (dot > max) { \n                max = dot; \n            } else if (dot < min) { \n                min = dot; \n            }\n        }\n\n        projection.min = min;\n        projection.max = max;\n    };\n\n    /**\n     * Finds supporting vertices given two bodies along a given direction using hill-climbing.\n     * @method _findSupports\n     * @private\n     * @param {body} bodyA\n     * @param {body} bodyB\n     * @param {vector} normal\n     * @param {number} direction\n     * @return [vector]\n     */\n    Collision._findSupports = function(bodyA, bodyB, normal, direction) {\n        var vertices = bodyB.vertices,\n            verticesLength = vertices.length,\n            bodyAPositionX = bodyA.position.x,\n            bodyAPositionY = bodyA.position.y,\n            normalX = normal.x * direction,\n            normalY = normal.y * direction,\n            nearestDistance = Number.MAX_VALUE,\n            vertexA,\n            vertexB,\n            vertexC,\n            distance,\n            j;\n\n        // find deepest vertex relative to the axis\n        for (j = 0; j < verticesLength; j += 1) {\n            vertexB = vertices[j];\n            distance = normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y);\n\n            // convex hill-climbing\n            if (distance < nearestDistance) {\n                nearestDistance = distance;\n                vertexA = vertexB;\n            }\n        }\n\n        // measure next vertex\n        vertexC = vertices[(verticesLength + vertexA.index - 1) % verticesLength];\n        nearestDistance = normalX * (bodyAPositionX - vertexC.x) + normalY * (bodyAPositionY - vertexC.y);\n\n        // compare with previous vertex\n        vertexB = vertices[(vertexA.index + 1) % verticesLength];\n        if (normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y) < nearestDistance) {\n            _supports[0] = vertexA;\n            _supports[1] = vertexB;\n\n            return _supports;\n        }\n\n        _supports[0] = vertexA;\n        _supports[1] = vertexC;\n\n        return _supports;\n    };\n\n    /*\n    *\n    *  Properties Documentation\n    *\n    */\n\n    /**\n     * A reference to the pair using this collision record, if there is one.\n     *\n     * @property pair\n     * @type {pair|null}\n     * @default null\n     */\n\n    /**\n     * A flag that indicates if the bodies were colliding when the collision was last updated.\n     * \n     * @property collided\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * The first body part represented by the collision (see also `collision.parentA`).\n     * \n     * @property bodyA\n     * @type body\n     */\n\n    /**\n     * The second body part represented by the collision (see also `collision.parentB`).\n     * \n     * @property bodyB\n     * @type body\n     */\n\n    /**\n     * The first body represented by the collision (i.e. `collision.bodyA.parent`).\n     * \n     * @property parentA\n     * @type body\n     */\n\n    /**\n     * The second body represented by the collision (i.e. `collision.bodyB.parent`).\n     * \n     * @property parentB\n     * @type body\n     */\n\n    /**\n     * A `Number` that represents the minimum separating distance between the bodies along the collision normal.\n     *\n     * @readOnly\n     * @property depth\n     * @type number\n     * @default 0\n     */\n\n    /**\n     * A normalised `Vector` that represents the direction between the bodies that provides the minimum separating distance.\n     *\n     * @property normal\n     * @type vector\n     * @default { x: 0, y: 0 }\n     */\n\n    /**\n     * A normalised `Vector` that is the tangent direction to the collision normal.\n     *\n     * @property tangent\n     * @type vector\n     * @default { x: 0, y: 0 }\n     */\n\n    /**\n     * A `Vector` that represents the direction and depth of the collision.\n     *\n     * @property penetration\n     * @type vector\n     * @default { x: 0, y: 0 }\n     */\n\n    /**\n     * An array of body vertices that represent the support points in the collision.\n     * These are the deepest vertices (along the collision normal) of each body that are contained by the other body's vertices.\n     *\n     * @property supports\n     * @type vector[]\n     * @default []\n     */\n\n})();\n\n\n/***/ }),\n/* 9 */\n/***/ (function(module, exports, __nested_webpack_require_142084__) {\n\n/**\n* The `Matter.Pair` module contains methods for creating and manipulating collision pairs.\n*\n* @class Pair\n*/\n\nvar Pair = {};\n\nmodule.exports = Pair;\n\nvar Contact = __nested_webpack_require_142084__(16);\n\n(function() {\n    \n    /**\n     * Creates a pair.\n     * @method create\n     * @param {collision} collision\n     * @param {number} timestamp\n     * @return {pair} A new pair\n     */\n    Pair.create = function(collision, timestamp) {\n        var bodyA = collision.bodyA,\n            bodyB = collision.bodyB;\n\n        var pair = {\n            id: Pair.id(bodyA, bodyB),\n            bodyA: bodyA,\n            bodyB: bodyB,\n            collision: collision,\n            contacts: [],\n            activeContacts: [],\n            separation: 0,\n            isActive: true,\n            confirmedActive: true,\n            isSensor: bodyA.isSensor || bodyB.isSensor,\n            timeCreated: timestamp,\n            timeUpdated: timestamp,\n            inverseMass: 0,\n            friction: 0,\n            frictionStatic: 0,\n            restitution: 0,\n            slop: 0\n        };\n\n        Pair.update(pair, collision, timestamp);\n\n        return pair;\n    };\n\n    /**\n     * Updates a pair given a collision.\n     * @method update\n     * @param {pair} pair\n     * @param {collision} collision\n     * @param {number} timestamp\n     */\n    Pair.update = function(pair, collision, timestamp) {\n        var contacts = pair.contacts,\n            supports = collision.supports,\n            activeContacts = pair.activeContacts,\n            parentA = collision.parentA,\n            parentB = collision.parentB,\n            parentAVerticesLength = parentA.vertices.length;\n        \n        pair.isActive = true;\n        pair.timeUpdated = timestamp;\n        pair.collision = collision;\n        pair.separation = collision.depth;\n        pair.inverseMass = parentA.inverseMass + parentB.inverseMass;\n        pair.friction = parentA.friction < parentB.friction ? parentA.friction : parentB.friction;\n        pair.frictionStatic = parentA.frictionStatic > parentB.frictionStatic ? parentA.frictionStatic : parentB.frictionStatic;\n        pair.restitution = parentA.restitution > parentB.restitution ? parentA.restitution : parentB.restitution;\n        pair.slop = parentA.slop > parentB.slop ? parentA.slop : parentB.slop;\n\n        collision.pair = pair;\n        activeContacts.length = 0;\n        \n        for (var i = 0; i < supports.length; i++) {\n            var support = supports[i],\n                contactId = support.body === parentA ? support.index : parentAVerticesLength + support.index,\n                contact = contacts[contactId];\n\n            if (contact) {\n                activeContacts.push(contact);\n            } else {\n                activeContacts.push(contacts[contactId] = Contact.create(support));\n            }\n        }\n    };\n    \n    /**\n     * Set a pair as active or inactive.\n     * @method setActive\n     * @param {pair} pair\n     * @param {bool} isActive\n     * @param {number} timestamp\n     */\n    Pair.setActive = function(pair, isActive, timestamp) {\n        if (isActive) {\n            pair.isActive = true;\n            pair.timeUpdated = timestamp;\n        } else {\n            pair.isActive = false;\n            pair.activeContacts.length = 0;\n        }\n    };\n\n    /**\n     * Get the id for the given pair.\n     * @method id\n     * @param {body} bodyA\n     * @param {body} bodyB\n     * @return {string} Unique pairId\n     */\n    Pair.id = function(bodyA, bodyB) {\n        if (bodyA.id < bodyB.id) {\n            return 'A' + bodyA.id + 'B' + bodyB.id;\n        } else {\n            return 'A' + bodyB.id + 'B' + bodyA.id;\n        }\n    };\n\n})();\n\n\n/***/ }),\n/* 10 */\n/***/ (function(module, exports, __nested_webpack_require_145828__) {\n\n/**\n* The `Matter.Constraint` module contains methods for creating and manipulating constraints.\n* Constraints are used for specifying that a fixed distance must be maintained between two bodies (or a body and a fixed world-space position).\n* The stiffness of constraints can be modified to create springs or elastic.\n*\n* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).\n*\n* @class Constraint\n*/\n\nvar Constraint = {};\n\nmodule.exports = Constraint;\n\nvar Vertices = __nested_webpack_require_145828__(3);\nvar Vector = __nested_webpack_require_145828__(2);\nvar Sleeping = __nested_webpack_require_145828__(7);\nvar Bounds = __nested_webpack_require_145828__(1);\nvar Axes = __nested_webpack_require_145828__(11);\nvar Common = __nested_webpack_require_145828__(0);\n\n(function() {\n\n    Constraint._warming = 0.4;\n    Constraint._torqueDampen = 1;\n    Constraint._minLength = 0.000001;\n\n    /**\n     * Creates a new constraint.\n     * All properties have default values, and many are pre-calculated automatically based on other properties.\n     * To simulate a revolute constraint (or pin joint) set `length: 0` and a high `stiffness` value (e.g. `0.7` or above).\n     * If the constraint is unstable, try lowering the `stiffness` value and / or increasing `engine.constraintIterations`.\n     * For compound bodies, constraints must be applied to the parent body (not one of its parts).\n     * See the properties section below for detailed information on what you can pass via the `options` object.\n     * @method create\n     * @param {} options\n     * @return {constraint} constraint\n     */\n    Constraint.create = function(options) {\n        var constraint = options;\n\n        // if bodies defined but no points, use body centre\n        if (constraint.bodyA && !constraint.pointA)\n            constraint.pointA = { x: 0, y: 0 };\n        if (constraint.bodyB && !constraint.pointB)\n            constraint.pointB = { x: 0, y: 0 };\n\n        // calculate static length using initial world space points\n        var initialPointA = constraint.bodyA ? Vector.add(constraint.bodyA.position, constraint.pointA) : constraint.pointA,\n            initialPointB = constraint.bodyB ? Vector.add(constraint.bodyB.position, constraint.pointB) : constraint.pointB,\n            length = Vector.magnitude(Vector.sub(initialPointA, initialPointB));\n    \n        constraint.length = typeof constraint.length !== 'undefined' ? constraint.length : length;\n\n        // option defaults\n        constraint.id = constraint.id || Common.nextId();\n        constraint.label = constraint.label || 'Constraint';\n        constraint.type = 'constraint';\n        constraint.stiffness = constraint.stiffness || (constraint.length > 0 ? 1 : 0.7);\n        constraint.damping = constraint.damping || 0;\n        constraint.angularStiffness = constraint.angularStiffness || 0;\n        constraint.angleA = constraint.bodyA ? constraint.bodyA.angle : constraint.angleA;\n        constraint.angleB = constraint.bodyB ? constraint.bodyB.angle : constraint.angleB;\n        constraint.plugin = {};\n\n        // render\n        var render = {\n            visible: true,\n            lineWidth: 2,\n            strokeStyle: '#ffffff',\n            type: 'line',\n            anchors: true\n        };\n\n        if (constraint.length === 0 && constraint.stiffness > 0.1) {\n            render.type = 'pin';\n            render.anchors = false;\n        } else if (constraint.stiffness < 0.9) {\n            render.type = 'spring';\n        }\n\n        constraint.render = Common.extend(render, constraint.render);\n\n        return constraint;\n    };\n\n    /**\n     * Prepares for solving by constraint warming.\n     * @private\n     * @method preSolveAll\n     * @param {body[]} bodies\n     */\n    Constraint.preSolveAll = function(bodies) {\n        for (var i = 0; i < bodies.length; i += 1) {\n            var body = bodies[i],\n                impulse = body.constraintImpulse;\n\n            if (body.isStatic || (impulse.x === 0 && impulse.y === 0 && impulse.angle === 0)) {\n                continue;\n            }\n\n            body.position.x += impulse.x;\n            body.position.y += impulse.y;\n            body.angle += impulse.angle;\n        }\n    };\n\n    /**\n     * Solves all constraints in a list of collisions.\n     * @private\n     * @method solveAll\n     * @param {constraint[]} constraints\n     * @param {number} delta\n     */\n    Constraint.solveAll = function(constraints, delta) {\n        var timeScale = Common.clamp(delta / Common._baseDelta, 0, 1);\n\n        // Solve fixed constraints first.\n        for (var i = 0; i < constraints.length; i += 1) {\n            var constraint = constraints[i],\n                fixedA = !constraint.bodyA || (constraint.bodyA && constraint.bodyA.isStatic),\n                fixedB = !constraint.bodyB || (constraint.bodyB && constraint.bodyB.isStatic);\n\n            if (fixedA || fixedB) {\n                Constraint.solve(constraints[i], timeScale);\n            }\n        }\n\n        // Solve free constraints last.\n        for (i = 0; i < constraints.length; i += 1) {\n            constraint = constraints[i];\n            fixedA = !constraint.bodyA || (constraint.bodyA && constraint.bodyA.isStatic);\n            fixedB = !constraint.bodyB || (constraint.bodyB && constraint.bodyB.isStatic);\n\n            if (!fixedA && !fixedB) {\n                Constraint.solve(constraints[i], timeScale);\n            }\n        }\n    };\n\n    /**\n     * Solves a distance constraint with Gauss-Siedel method.\n     * @private\n     * @method solve\n     * @param {constraint} constraint\n     * @param {number} timeScale\n     */\n    Constraint.solve = function(constraint, timeScale) {\n        var bodyA = constraint.bodyA,\n            bodyB = constraint.bodyB,\n            pointA = constraint.pointA,\n            pointB = constraint.pointB;\n\n        if (!bodyA && !bodyB)\n            return;\n\n        // update reference angle\n        if (bodyA && !bodyA.isStatic) {\n            Vector.rotate(pointA, bodyA.angle - constraint.angleA, pointA);\n            constraint.angleA = bodyA.angle;\n        }\n        \n        // update reference angle\n        if (bodyB && !bodyB.isStatic) {\n            Vector.rotate(pointB, bodyB.angle - constraint.angleB, pointB);\n            constraint.angleB = bodyB.angle;\n        }\n\n        var pointAWorld = pointA,\n            pointBWorld = pointB;\n\n        if (bodyA) pointAWorld = Vector.add(bodyA.position, pointA);\n        if (bodyB) pointBWorld = Vector.add(bodyB.position, pointB);\n\n        if (!pointAWorld || !pointBWorld)\n            return;\n\n        var delta = Vector.sub(pointAWorld, pointBWorld),\n            currentLength = Vector.magnitude(delta);\n\n        // prevent singularity\n        if (currentLength < Constraint._minLength) {\n            currentLength = Constraint._minLength;\n        }\n\n        // solve distance constraint with Gauss-Siedel method\n        var difference = (currentLength - constraint.length) / currentLength,\n            isRigid = constraint.stiffness >= 1 || constraint.length === 0,\n            stiffness = isRigid ? constraint.stiffness * timeScale \n                : constraint.stiffness * timeScale * timeScale,\n            damping = constraint.damping * timeScale,\n            force = Vector.mult(delta, difference * stiffness),\n            massTotal = (bodyA ? bodyA.inverseMass : 0) + (bodyB ? bodyB.inverseMass : 0),\n            inertiaTotal = (bodyA ? bodyA.inverseInertia : 0) + (bodyB ? bodyB.inverseInertia : 0),\n            resistanceTotal = massTotal + inertiaTotal,\n            torque,\n            share,\n            normal,\n            normalVelocity,\n            relativeVelocity;\n    \n        if (damping > 0) {\n            var zero = Vector.create();\n            normal = Vector.div(delta, currentLength);\n\n            relativeVelocity = Vector.sub(\n                bodyB && Vector.sub(bodyB.position, bodyB.positionPrev) || zero,\n                bodyA && Vector.sub(bodyA.position, bodyA.positionPrev) || zero\n            );\n\n            normalVelocity = Vector.dot(normal, relativeVelocity);\n        }\n\n        if (bodyA && !bodyA.isStatic) {\n            share = bodyA.inverseMass / massTotal;\n\n            // keep track of applied impulses for post solving\n            bodyA.constraintImpulse.x -= force.x * share;\n            bodyA.constraintImpulse.y -= force.y * share;\n\n            // apply forces\n            bodyA.position.x -= force.x * share;\n            bodyA.position.y -= force.y * share;\n\n            // apply damping\n            if (damping > 0) {\n                bodyA.positionPrev.x -= damping * normal.x * normalVelocity * share;\n                bodyA.positionPrev.y -= damping * normal.y * normalVelocity * share;\n            }\n\n            // apply torque\n            torque = (Vector.cross(pointA, force) / resistanceTotal) * Constraint._torqueDampen * bodyA.inverseInertia * (1 - constraint.angularStiffness);\n            bodyA.constraintImpulse.angle -= torque;\n            bodyA.angle -= torque;\n        }\n\n        if (bodyB && !bodyB.isStatic) {\n            share = bodyB.inverseMass / massTotal;\n\n            // keep track of applied impulses for post solving\n            bodyB.constraintImpulse.x += force.x * share;\n            bodyB.constraintImpulse.y += force.y * share;\n            \n            // apply forces\n            bodyB.position.x += force.x * share;\n            bodyB.position.y += force.y * share;\n\n            // apply damping\n            if (damping > 0) {\n                bodyB.positionPrev.x += damping * normal.x * normalVelocity * share;\n                bodyB.positionPrev.y += damping * normal.y * normalVelocity * share;\n            }\n\n            // apply torque\n            torque = (Vector.cross(pointB, force) / resistanceTotal) * Constraint._torqueDampen * bodyB.inverseInertia * (1 - constraint.angularStiffness);\n            bodyB.constraintImpulse.angle += torque;\n            bodyB.angle += torque;\n        }\n\n    };\n\n    /**\n     * Performs body updates required after solving constraints.\n     * @private\n     * @method postSolveAll\n     * @param {body[]} bodies\n     */\n    Constraint.postSolveAll = function(bodies) {\n        for (var i = 0; i < bodies.length; i++) {\n            var body = bodies[i],\n                impulse = body.constraintImpulse;\n\n            if (body.isStatic || (impulse.x === 0 && impulse.y === 0 && impulse.angle === 0)) {\n                continue;\n            }\n\n            Sleeping.set(body, false);\n\n            // update geometry and reset\n            for (var j = 0; j < body.parts.length; j++) {\n                var part = body.parts[j];\n                \n                Vertices.translate(part.vertices, impulse);\n\n                if (j > 0) {\n                    part.position.x += impulse.x;\n                    part.position.y += impulse.y;\n                }\n\n                if (impulse.angle !== 0) {\n                    Vertices.rotate(part.vertices, impulse.angle, body.position);\n                    Axes.rotate(part.axes, impulse.angle);\n                    if (j > 0) {\n                        Vector.rotateAbout(part.position, impulse.angle, body.position, part.position);\n                    }\n                }\n\n                Bounds.update(part.bounds, part.vertices, body.velocity);\n            }\n\n            // dampen the cached impulse for warming next step\n            impulse.angle *= Constraint._warming;\n            impulse.x *= Constraint._warming;\n            impulse.y *= Constraint._warming;\n        }\n    };\n\n    /**\n     * Returns the world-space position of `constraint.pointA`, accounting for `constraint.bodyA`.\n     * @method pointAWorld\n     * @param {constraint} constraint\n     * @returns {vector} the world-space position\n     */\n    Constraint.pointAWorld = function(constraint) {\n        return {\n            x: (constraint.bodyA ? constraint.bodyA.position.x : 0) \n                + (constraint.pointA ? constraint.pointA.x : 0),\n            y: (constraint.bodyA ? constraint.bodyA.position.y : 0) \n                + (constraint.pointA ? constraint.pointA.y : 0)\n        };\n    };\n\n    /**\n     * Returns the world-space position of `constraint.pointB`, accounting for `constraint.bodyB`.\n     * @method pointBWorld\n     * @param {constraint} constraint\n     * @returns {vector} the world-space position\n     */\n    Constraint.pointBWorld = function(constraint) {\n        return {\n            x: (constraint.bodyB ? constraint.bodyB.position.x : 0) \n                + (constraint.pointB ? constraint.pointB.x : 0),\n            y: (constraint.bodyB ? constraint.bodyB.position.y : 0) \n                + (constraint.pointB ? constraint.pointB.y : 0)\n        };\n    };\n\n    /*\n    *\n    *  Properties Documentation\n    *\n    */\n\n    /**\n     * An integer `Number` uniquely identifying number generated in `Composite.create` by `Common.nextId`.\n     *\n     * @property id\n     * @type number\n     */\n\n    /**\n     * A `String` denoting the type of object.\n     *\n     * @property type\n     * @type string\n     * @default \"constraint\"\n     * @readOnly\n     */\n\n    /**\n     * An arbitrary `String` name to help the user identify and manage bodies.\n     *\n     * @property label\n     * @type string\n     * @default \"Constraint\"\n     */\n\n    /**\n     * An `Object` that defines the rendering properties to be consumed by the module `Matter.Render`.\n     *\n     * @property render\n     * @type object\n     */\n\n    /**\n     * A flag that indicates if the constraint should be rendered.\n     *\n     * @property render.visible\n     * @type boolean\n     * @default true\n     */\n\n    /**\n     * A `Number` that defines the line width to use when rendering the constraint outline.\n     * A value of `0` means no outline will be rendered.\n     *\n     * @property render.lineWidth\n     * @type number\n     * @default 2\n     */\n\n    /**\n     * A `String` that defines the stroke style to use when rendering the constraint outline.\n     * It is the same as when using a canvas, so it accepts CSS style property values.\n     *\n     * @property render.strokeStyle\n     * @type string\n     * @default a random colour\n     */\n\n    /**\n     * A `String` that defines the constraint rendering type. \n     * The possible values are 'line', 'pin', 'spring'.\n     * An appropriate render type will be automatically chosen unless one is given in options.\n     *\n     * @property render.type\n     * @type string\n     * @default 'line'\n     */\n\n    /**\n     * A `Boolean` that defines if the constraint's anchor points should be rendered.\n     *\n     * @property render.anchors\n     * @type boolean\n     * @default true\n     */\n\n    /**\n     * The first possible `Body` that this constraint is attached to.\n     *\n     * @property bodyA\n     * @type body\n     * @default null\n     */\n\n    /**\n     * The second possible `Body` that this constraint is attached to.\n     *\n     * @property bodyB\n     * @type body\n     * @default null\n     */\n\n    /**\n     * A `Vector` that specifies the offset of the constraint from center of the `constraint.bodyA` if defined, otherwise a world-space position.\n     *\n     * @property pointA\n     * @type vector\n     * @default { x: 0, y: 0 }\n     */\n\n    /**\n     * A `Vector` that specifies the offset of the constraint from center of the `constraint.bodyB` if defined, otherwise a world-space position.\n     *\n     * @property pointB\n     * @type vector\n     * @default { x: 0, y: 0 }\n     */\n\n    /**\n     * A `Number` that specifies the stiffness of the constraint, i.e. the rate at which it returns to its resting `constraint.length`.\n     * A value of `1` means the constraint should be very stiff.\n     * A value of `0.2` means the constraint acts like a soft spring.\n     *\n     * @property stiffness\n     * @type number\n     * @default 1\n     */\n\n    /**\n     * A `Number` that specifies the damping of the constraint, \n     * i.e. the amount of resistance applied to each body based on their velocities to limit the amount of oscillation.\n     * Damping will only be apparent when the constraint also has a very low `stiffness`.\n     * A value of `0.1` means the constraint will apply heavy damping, resulting in little to no oscillation.\n     * A value of `0` means the constraint will apply no damping.\n     *\n     * @property damping\n     * @type number\n     * @default 0\n     */\n\n    /**\n     * A `Number` that specifies the target resting length of the constraint. \n     * It is calculated automatically in `Constraint.create` from initial positions of the `constraint.bodyA` and `constraint.bodyB`.\n     *\n     * @property length\n     * @type number\n     */\n\n    /**\n     * An object reserved for storing plugin-specific properties.\n     *\n     * @property plugin\n     * @type {}\n     */\n\n})();\n\n\n/***/ }),\n/* 11 */\n/***/ (function(module, exports, __nested_webpack_require_162575__) {\n\n/**\n* The `Matter.Axes` module contains methods for creating and manipulating sets of axes.\n*\n* @class Axes\n*/\n\nvar Axes = {};\n\nmodule.exports = Axes;\n\nvar Vector = __nested_webpack_require_162575__(2);\nvar Common = __nested_webpack_require_162575__(0);\n\n(function() {\n\n    /**\n     * Creates a new set of axes from the given vertices.\n     * @method fromVertices\n     * @param {vertices} vertices\n     * @return {axes} A new axes from the given vertices\n     */\n    Axes.fromVertices = function(vertices) {\n        var axes = {};\n\n        // find the unique axes, using edge normal gradients\n        for (var i = 0; i < vertices.length; i++) {\n            var j = (i + 1) % vertices.length, \n                normal = Vector.normalise({ \n                    x: vertices[j].y - vertices[i].y, \n                    y: vertices[i].x - vertices[j].x\n                }),\n                gradient = (normal.y === 0) ? Infinity : (normal.x / normal.y);\n            \n            // limit precision\n            gradient = gradient.toFixed(3).toString();\n            axes[gradient] = normal;\n        }\n\n        return Common.values(axes);\n    };\n\n    /**\n     * Rotates a set of axes by the given angle.\n     * @method rotate\n     * @param {axes} axes\n     * @param {number} angle\n     */\n    Axes.rotate = function(axes, angle) {\n        if (angle === 0)\n            return;\n        \n        var cos = Math.cos(angle),\n            sin = Math.sin(angle);\n\n        for (var i = 0; i < axes.length; i++) {\n            var axis = axes[i],\n                xx;\n            xx = axis.x * cos - axis.y * sin;\n            axis.y = axis.x * sin + axis.y * cos;\n            axis.x = xx;\n        }\n    };\n\n})();\n\n\n/***/ }),\n/* 12 */\n/***/ (function(module, exports, __nested_webpack_require_164316__) {\n\n/**\n* The `Matter.Bodies` module contains factory methods for creating rigid body models \n* with commonly used body configurations (such as rectangles, circles and other polygons).\n*\n* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).\n*\n* @class Bodies\n*/\n\n// TODO: true circle bodies\n\nvar Bodies = {};\n\nmodule.exports = Bodies;\n\nvar Vertices = __nested_webpack_require_164316__(3);\nvar Common = __nested_webpack_require_164316__(0);\nvar Body = __nested_webpack_require_164316__(4);\nvar Bounds = __nested_webpack_require_164316__(1);\nvar Vector = __nested_webpack_require_164316__(2);\n\n(function() {\n\n    /**\n     * Creates a new rigid body model with a rectangle hull. \n     * The options parameter is an object that specifies any properties you wish to override the defaults.\n     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.\n     * @method rectangle\n     * @param {number} x\n     * @param {number} y\n     * @param {number} width\n     * @param {number} height\n     * @param {object} [options]\n     * @return {body} A new rectangle body\n     */\n    Bodies.rectangle = function(x, y, width, height, options) {\n        options = options || {};\n\n        var rectangle = { \n            label: 'Rectangle Body',\n            position: { x: x, y: y },\n            vertices: Vertices.fromPath('L 0 0 L ' + width + ' 0 L ' + width + ' ' + height + ' L 0 ' + height)\n        };\n\n        if (options.chamfer) {\n            var chamfer = options.chamfer;\n            rectangle.vertices = Vertices.chamfer(rectangle.vertices, chamfer.radius, \n                chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);\n            delete options.chamfer;\n        }\n\n        return Body.create(Common.extend({}, rectangle, options));\n    };\n    \n    /**\n     * Creates a new rigid body model with a trapezoid hull. \n     * The options parameter is an object that specifies any properties you wish to override the defaults.\n     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.\n     * @method trapezoid\n     * @param {number} x\n     * @param {number} y\n     * @param {number} width\n     * @param {number} height\n     * @param {number} slope\n     * @param {object} [options]\n     * @return {body} A new trapezoid body\n     */\n    Bodies.trapezoid = function(x, y, width, height, slope, options) {\n        options = options || {};\n\n        slope *= 0.5;\n        var roof = (1 - (slope * 2)) * width;\n        \n        var x1 = width * slope,\n            x2 = x1 + roof,\n            x3 = x2 + x1,\n            verticesPath;\n\n        if (slope < 0.5) {\n            verticesPath = 'L 0 0 L ' + x1 + ' ' + (-height) + ' L ' + x2 + ' ' + (-height) + ' L ' + x3 + ' 0';\n        } else {\n            verticesPath = 'L 0 0 L ' + x2 + ' ' + (-height) + ' L ' + x3 + ' 0';\n        }\n\n        var trapezoid = { \n            label: 'Trapezoid Body',\n            position: { x: x, y: y },\n            vertices: Vertices.fromPath(verticesPath)\n        };\n\n        if (options.chamfer) {\n            var chamfer = options.chamfer;\n            trapezoid.vertices = Vertices.chamfer(trapezoid.vertices, chamfer.radius, \n                chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);\n            delete options.chamfer;\n        }\n\n        return Body.create(Common.extend({}, trapezoid, options));\n    };\n\n    /**\n     * Creates a new rigid body model with a circle hull. \n     * The options parameter is an object that specifies any properties you wish to override the defaults.\n     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.\n     * @method circle\n     * @param {number} x\n     * @param {number} y\n     * @param {number} radius\n     * @param {object} [options]\n     * @param {number} [maxSides]\n     * @return {body} A new circle body\n     */\n    Bodies.circle = function(x, y, radius, options, maxSides) {\n        options = options || {};\n\n        var circle = {\n            label: 'Circle Body',\n            circleRadius: radius\n        };\n        \n        // approximate circles with polygons until true circles implemented in SAT\n        maxSides = maxSides || 25;\n        var sides = Math.ceil(Math.max(10, Math.min(maxSides, radius)));\n\n        // optimisation: always use even number of sides (half the number of unique axes)\n        if (sides % 2 === 1)\n            sides += 1;\n\n        return Bodies.polygon(x, y, sides, radius, Common.extend({}, circle, options));\n    };\n\n    /**\n     * Creates a new rigid body model with a regular polygon hull with the given number of sides. \n     * The options parameter is an object that specifies any properties you wish to override the defaults.\n     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.\n     * @method polygon\n     * @param {number} x\n     * @param {number} y\n     * @param {number} sides\n     * @param {number} radius\n     * @param {object} [options]\n     * @return {body} A new regular polygon body\n     */\n    Bodies.polygon = function(x, y, sides, radius, options) {\n        options = options || {};\n\n        if (sides < 3)\n            return Bodies.circle(x, y, radius, options);\n\n        var theta = 2 * Math.PI / sides,\n            path = '',\n            offset = theta * 0.5;\n\n        for (var i = 0; i < sides; i += 1) {\n            var angle = offset + (i * theta),\n                xx = Math.cos(angle) * radius,\n                yy = Math.sin(angle) * radius;\n\n            path += 'L ' + xx.toFixed(3) + ' ' + yy.toFixed(3) + ' ';\n        }\n\n        var polygon = { \n            label: 'Polygon Body',\n            position: { x: x, y: y },\n            vertices: Vertices.fromPath(path)\n        };\n\n        if (options.chamfer) {\n            var chamfer = options.chamfer;\n            polygon.vertices = Vertices.chamfer(polygon.vertices, chamfer.radius, \n                chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);\n            delete options.chamfer;\n        }\n\n        return Body.create(Common.extend({}, polygon, options));\n    };\n\n    /**\n     * Utility to create a compound body based on set(s) of vertices.\n     * \n     * _Note:_ To optionally enable automatic concave vertices decomposition the [poly-decomp](https://github.com/schteppe/poly-decomp.js) \n     * package must be first installed and provided see `Common.setDecomp`, otherwise the convex hull of each vertex set will be used.\n     * \n     * The resulting vertices are reorientated about their centre of mass,\n     * and offset such that `body.position` corresponds to this point.\n     * \n     * The resulting offset may be found if needed by subtracting `body.bounds` from the original input bounds.\n     * To later move the centre of mass see `Body.setCentre`.\n     * \n     * Note that automatic conconcave decomposition results are not always optimal. \n     * For best results, simplify the input vertices as much as possible first.\n     * By default this function applies some addtional simplification to help.\n     * \n     * Some outputs may also require further manual processing afterwards to be robust.\n     * In particular some parts may need to be overlapped to avoid collision gaps.\n     * Thin parts and sharp points should be avoided or removed where possible.\n     *\n     * The options parameter object specifies any `Matter.Body` properties you wish to override the defaults.\n     * \n     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.\n     * @method fromVertices\n     * @param {number} x\n     * @param {number} y\n     * @param {array} vertexSets One or more arrays of vertex points e.g. `[[{ x: 0, y: 0 }...], ...]`.\n     * @param {object} [options] The body options.\n     * @param {bool} [flagInternal=false] Optionally marks internal edges with `isInternal`.\n     * @param {number} [removeCollinear=0.01] Threshold when simplifying vertices along the same edge.\n     * @param {number} [minimumArea=10] Threshold when removing small parts.\n     * @param {number} [removeDuplicatePoints=0.01] Threshold when simplifying nearby vertices.\n     * @return {body}\n     */\n    Bodies.fromVertices = function(x, y, vertexSets, options, flagInternal, removeCollinear, minimumArea, removeDuplicatePoints) {\n        var decomp = Common.getDecomp(),\n            canDecomp,\n            body,\n            parts,\n            isConvex,\n            isConcave,\n            vertices,\n            i,\n            j,\n            k,\n            v,\n            z;\n\n        // check decomp is as expected\n        canDecomp = Boolean(decomp && decomp.quickDecomp);\n\n        options = options || {};\n        parts = [];\n\n        flagInternal = typeof flagInternal !== 'undefined' ? flagInternal : false;\n        removeCollinear = typeof removeCollinear !== 'undefined' ? removeCollinear : 0.01;\n        minimumArea = typeof minimumArea !== 'undefined' ? minimumArea : 10;\n        removeDuplicatePoints = typeof removeDuplicatePoints !== 'undefined' ? removeDuplicatePoints : 0.01;\n\n        // ensure vertexSets is an array of arrays\n        if (!Common.isArray(vertexSets[0])) {\n            vertexSets = [vertexSets];\n        }\n\n        for (v = 0; v < vertexSets.length; v += 1) {\n            vertices = vertexSets[v];\n            isConvex = Vertices.isConvex(vertices);\n            isConcave = !isConvex;\n\n            if (isConcave && !canDecomp) {\n                Common.warnOnce(\n                    'Bodies.fromVertices: Install the \\'poly-decomp\\' library and use Common.setDecomp or provide \\'decomp\\' as a global to decompose concave vertices.'\n                );\n            }\n\n            if (isConvex || !canDecomp) {\n                if (isConvex) {\n                    vertices = Vertices.clockwiseSort(vertices);\n                } else {\n                    // fallback to convex hull when decomposition is not possible\n                    vertices = Vertices.hull(vertices);\n                }\n\n                parts.push({\n                    position: { x: x, y: y },\n                    vertices: vertices\n                });\n            } else {\n                // initialise a decomposition\n                var concave = vertices.map(function(vertex) {\n                    return [vertex.x, vertex.y];\n                });\n\n                // vertices are concave and simple, we can decompose into parts\n                decomp.makeCCW(concave);\n                if (removeCollinear !== false)\n                    decomp.removeCollinearPoints(concave, removeCollinear);\n                if (removeDuplicatePoints !== false && decomp.removeDuplicatePoints)\n                    decomp.removeDuplicatePoints(concave, removeDuplicatePoints);\n\n                // use the quick decomposition algorithm (Bayazit)\n                var decomposed = decomp.quickDecomp(concave);\n\n                // for each decomposed chunk\n                for (i = 0; i < decomposed.length; i++) {\n                    var chunk = decomposed[i];\n\n                    // convert vertices into the correct structure\n                    var chunkVertices = chunk.map(function(vertices) {\n                        return {\n                            x: vertices[0],\n                            y: vertices[1]\n                        };\n                    });\n\n                    // skip small chunks\n                    if (minimumArea > 0 && Vertices.area(chunkVertices) < minimumArea)\n                        continue;\n\n                    // create a compound part\n                    parts.push({\n                        position: Vertices.centre(chunkVertices),\n                        vertices: chunkVertices\n                    });\n                }\n            }\n        }\n\n        // create body parts\n        for (i = 0; i < parts.length; i++) {\n            parts[i] = Body.create(Common.extend(parts[i], options));\n        }\n\n        // flag internal edges (coincident part edges)\n        if (flagInternal) {\n            var coincident_max_dist = 5;\n\n            for (i = 0; i < parts.length; i++) {\n                var partA = parts[i];\n\n                for (j = i + 1; j < parts.length; j++) {\n                    var partB = parts[j];\n\n                    if (Bounds.overlaps(partA.bounds, partB.bounds)) {\n                        var pav = partA.vertices,\n                            pbv = partB.vertices;\n\n                        // iterate vertices of both parts\n                        for (k = 0; k < partA.vertices.length; k++) {\n                            for (z = 0; z < partB.vertices.length; z++) {\n                                // find distances between the vertices\n                                var da = Vector.magnitudeSquared(Vector.sub(pav[(k + 1) % pav.length], pbv[z])),\n                                    db = Vector.magnitudeSquared(Vector.sub(pav[k], pbv[(z + 1) % pbv.length]));\n\n                                // if both vertices are very close, consider the edge concident (internal)\n                                if (da < coincident_max_dist && db < coincident_max_dist) {\n                                    pav[k].isInternal = true;\n                                    pbv[z].isInternal = true;\n                                }\n                            }\n                        }\n\n                    }\n                }\n            }\n        }\n\n        if (parts.length > 1) {\n            // create the parent body to be returned, that contains generated compound parts\n            body = Body.create(Common.extend({ parts: parts.slice(0) }, options));\n\n            // offset such that body.position is at the centre off mass\n            Body.setPosition(body, { x: x, y: y });\n\n            return body;\n        } else {\n            return parts[0];\n        }\n    };\n\n})();\n\n\n/***/ }),\n/* 13 */\n/***/ (function(module, exports, __nested_webpack_require_178316__) {\n\n/**\n* The `Matter.Detector` module contains methods for efficiently detecting collisions between a list of bodies using a broadphase algorithm.\n*\n* @class Detector\n*/\n\nvar Detector = {};\n\nmodule.exports = Detector;\n\nvar Common = __nested_webpack_require_178316__(0);\nvar Collision = __nested_webpack_require_178316__(8);\n\n(function() {\n\n    /**\n     * Creates a new collision detector.\n     * @method create\n     * @param {} options\n     * @return {detector} A new collision detector\n     */\n    Detector.create = function(options) {\n        var defaults = {\n            bodies: [],\n            pairs: null\n        };\n\n        return Common.extend(defaults, options);\n    };\n\n    /**\n     * Sets the list of bodies in the detector.\n     * @method setBodies\n     * @param {detector} detector\n     * @param {body[]} bodies\n     */\n    Detector.setBodies = function(detector, bodies) {\n        detector.bodies = bodies.slice(0);\n    };\n\n    /**\n     * Clears the detector including its list of bodies.\n     * @method clear\n     * @param {detector} detector\n     */\n    Detector.clear = function(detector) {\n        detector.bodies = [];\n    };\n\n    /**\n     * Efficiently finds all collisions among all the bodies in `detector.bodies` using a broadphase algorithm.\n     * \n     * _Note:_ The specific ordering of collisions returned is not guaranteed between releases and may change for performance reasons.\n     * If a specific ordering is required then apply a sort to the resulting array.\n     * @method collisions\n     * @param {detector} detector\n     * @return {collision[]} collisions\n     */\n    Detector.collisions = function(detector) {\n        var collisions = [],\n            pairs = detector.pairs,\n            bodies = detector.bodies,\n            bodiesLength = bodies.length,\n            canCollide = Detector.canCollide,\n            collides = Collision.collides,\n            i,\n            j;\n\n        bodies.sort(Detector._compareBoundsX);\n\n        for (i = 0; i < bodiesLength; i++) {\n            var bodyA = bodies[i],\n                boundsA = bodyA.bounds,\n                boundXMax = bodyA.bounds.max.x,\n                boundYMax = bodyA.bounds.max.y,\n                boundYMin = bodyA.bounds.min.y,\n                bodyAStatic = bodyA.isStatic || bodyA.isSleeping,\n                partsALength = bodyA.parts.length,\n                partsASingle = partsALength === 1;\n\n            for (j = i + 1; j < bodiesLength; j++) {\n                var bodyB = bodies[j],\n                    boundsB = bodyB.bounds;\n\n                if (boundsB.min.x > boundXMax) {\n                    break;\n                }\n\n                if (boundYMax < boundsB.min.y || boundYMin > boundsB.max.y) {\n                    continue;\n                }\n\n                if (bodyAStatic && (bodyB.isStatic || bodyB.isSleeping)) {\n                    continue;\n                }\n\n                if (!canCollide(bodyA.collisionFilter, bodyB.collisionFilter)) {\n                    continue;\n                }\n\n                var partsBLength = bodyB.parts.length;\n\n                if (partsASingle && partsBLength === 1) {\n                    var collision = collides(bodyA, bodyB, pairs);\n\n                    if (collision) {\n                        collisions.push(collision);\n                    }\n                } else {\n                    var partsAStart = partsALength > 1 ? 1 : 0,\n                        partsBStart = partsBLength > 1 ? 1 : 0;\n                    \n                    for (var k = partsAStart; k < partsALength; k++) {\n                        var partA = bodyA.parts[k],\n                            boundsA = partA.bounds;\n\n                        for (var z = partsBStart; z < partsBLength; z++) {\n                            var partB = bodyB.parts[z],\n                                boundsB = partB.bounds;\n\n                            if (boundsA.min.x > boundsB.max.x || boundsA.max.x < boundsB.min.x\n                                || boundsA.max.y < boundsB.min.y || boundsA.min.y > boundsB.max.y) {\n                                continue;\n                            }\n\n                            var collision = collides(partA, partB, pairs);\n\n                            if (collision) {\n                                collisions.push(collision);\n                            }\n                        }\n                    }\n                }\n            }\n        }\n\n        return collisions;\n    };\n\n    /**\n     * Returns `true` if both supplied collision filters will allow a collision to occur.\n     * See `body.collisionFilter` for more information.\n     * @method canCollide\n     * @param {} filterA\n     * @param {} filterB\n     * @return {bool} `true` if collision can occur\n     */\n    Detector.canCollide = function(filterA, filterB) {\n        if (filterA.group === filterB.group && filterA.group !== 0)\n            return filterA.group > 0;\n\n        return (filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0;\n    };\n\n    /**\n     * The comparison function used in the broadphase algorithm.\n     * Returns the signed delta of the bodies bounds on the x-axis.\n     * @private\n     * @method _sortCompare\n     * @param {body} bodyA\n     * @param {body} bodyB\n     * @return {number} The signed delta used for sorting\n     */\n    Detector._compareBoundsX = function(bodyA, bodyB) {\n        return bodyA.bounds.min.x - bodyB.bounds.min.x;\n    };\n\n    /*\n    *\n    *  Properties Documentation\n    *\n    */\n\n    /**\n     * The array of `Matter.Body` between which the detector finds collisions.\n     * \n     * _Note:_ The order of bodies in this array _is not fixed_ and will be continually managed by the detector.\n     * @property bodies\n     * @type body[]\n     * @default []\n     */\n\n    /**\n     * Optional. A `Matter.Pairs` object from which previous collision objects may be reused. Intended for internal `Matter.Engine` usage.\n     * @property pairs\n     * @type {pairs|null}\n     * @default null\n     */\n\n})();\n\n\n/***/ }),\n/* 14 */\n/***/ (function(module, exports, __nested_webpack_require_184361__) {\n\n/**\n* The `Matter.Mouse` module contains methods for creating and manipulating mouse inputs.\n*\n* @class Mouse\n*/\n\nvar Mouse = {};\n\nmodule.exports = Mouse;\n\nvar Common = __nested_webpack_require_184361__(0);\n\n(function() {\n\n    /**\n     * Creates a mouse input.\n     * @method create\n     * @param {HTMLElement} element\n     * @return {mouse} A new mouse\n     */\n    Mouse.create = function(element) {\n        var mouse = {};\n\n        if (!element) {\n            Common.log('Mouse.create: element was undefined, defaulting to document.body', 'warn');\n        }\n        \n        mouse.element = element || document.body;\n        mouse.absolute = { x: 0, y: 0 };\n        mouse.position = { x: 0, y: 0 };\n        mouse.mousedownPosition = { x: 0, y: 0 };\n        mouse.mouseupPosition = { x: 0, y: 0 };\n        mouse.offset = { x: 0, y: 0 };\n        mouse.scale = { x: 1, y: 1 };\n        mouse.wheelDelta = 0;\n        mouse.button = -1;\n        mouse.pixelRatio = parseInt(mouse.element.getAttribute('data-pixel-ratio'), 10) || 1;\n\n        mouse.sourceEvents = {\n            mousemove: null,\n            mousedown: null,\n            mouseup: null,\n            mousewheel: null\n        };\n        \n        mouse.mousemove = function(event) { \n            var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio),\n                touches = event.changedTouches;\n\n            if (touches) {\n                mouse.button = 0;\n                event.preventDefault();\n            }\n\n            mouse.absolute.x = position.x;\n            mouse.absolute.y = position.y;\n            mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;\n            mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;\n            mouse.sourceEvents.mousemove = event;\n        };\n        \n        mouse.mousedown = function(event) {\n            var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio),\n                touches = event.changedTouches;\n\n            if (touches) {\n                mouse.button = 0;\n                event.preventDefault();\n            } else {\n                mouse.button = event.button;\n            }\n\n            mouse.absolute.x = position.x;\n            mouse.absolute.y = position.y;\n            mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;\n            mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;\n            mouse.mousedownPosition.x = mouse.position.x;\n            mouse.mousedownPosition.y = mouse.position.y;\n            mouse.sourceEvents.mousedown = event;\n        };\n        \n        mouse.mouseup = function(event) {\n            var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio),\n                touches = event.changedTouches;\n\n            if (touches) {\n                event.preventDefault();\n            }\n            \n            mouse.button = -1;\n            mouse.absolute.x = position.x;\n            mouse.absolute.y = position.y;\n            mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;\n            mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;\n            mouse.mouseupPosition.x = mouse.position.x;\n            mouse.mouseupPosition.y = mouse.position.y;\n            mouse.sourceEvents.mouseup = event;\n        };\n\n        mouse.mousewheel = function(event) {\n            mouse.wheelDelta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));\n            event.preventDefault();\n        };\n\n        Mouse.setElement(mouse, mouse.element);\n\n        return mouse;\n    };\n\n    /**\n     * Sets the element the mouse is bound to (and relative to).\n     * @method setElement\n     * @param {mouse} mouse\n     * @param {HTMLElement} element\n     */\n    Mouse.setElement = function(mouse, element) {\n        mouse.element = element;\n\n        element.addEventListener('mousemove', mouse.mousemove);\n        element.addEventListener('mousedown', mouse.mousedown);\n        element.addEventListener('mouseup', mouse.mouseup);\n        \n        element.addEventListener('mousewheel', mouse.mousewheel);\n        element.addEventListener('DOMMouseScroll', mouse.mousewheel);\n\n        element.addEventListener('touchmove', mouse.mousemove);\n        element.addEventListener('touchstart', mouse.mousedown);\n        element.addEventListener('touchend', mouse.mouseup);\n    };\n\n    /**\n     * Clears all captured source events.\n     * @method clearSourceEvents\n     * @param {mouse} mouse\n     */\n    Mouse.clearSourceEvents = function(mouse) {\n        mouse.sourceEvents.mousemove = null;\n        mouse.sourceEvents.mousedown = null;\n        mouse.sourceEvents.mouseup = null;\n        mouse.sourceEvents.mousewheel = null;\n        mouse.wheelDelta = 0;\n    };\n\n    /**\n     * Sets the mouse position offset.\n     * @method setOffset\n     * @param {mouse} mouse\n     * @param {vector} offset\n     */\n    Mouse.setOffset = function(mouse, offset) {\n        mouse.offset.x = offset.x;\n        mouse.offset.y = offset.y;\n        mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;\n        mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;\n    };\n\n    /**\n     * Sets the mouse position scale.\n     * @method setScale\n     * @param {mouse} mouse\n     * @param {vector} scale\n     */\n    Mouse.setScale = function(mouse, scale) {\n        mouse.scale.x = scale.x;\n        mouse.scale.y = scale.y;\n        mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;\n        mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;\n    };\n    \n    /**\n     * Gets the mouse position relative to an element given a screen pixel ratio.\n     * @method _getRelativeMousePosition\n     * @private\n     * @param {} event\n     * @param {} element\n     * @param {number} pixelRatio\n     * @return {}\n     */\n    Mouse._getRelativeMousePosition = function(event, element, pixelRatio) {\n        var elementBounds = element.getBoundingClientRect(),\n            rootNode = (document.documentElement || document.body.parentNode || document.body),\n            scrollX = (window.pageXOffset !== undefined) ? window.pageXOffset : rootNode.scrollLeft,\n            scrollY = (window.pageYOffset !== undefined) ? window.pageYOffset : rootNode.scrollTop,\n            touches = event.changedTouches,\n            x, y;\n        \n        if (touches) {\n            x = touches[0].pageX - elementBounds.left - scrollX;\n            y = touches[0].pageY - elementBounds.top - scrollY;\n        } else {\n            x = event.pageX - elementBounds.left - scrollX;\n            y = event.pageY - elementBounds.top - scrollY;\n        }\n\n        return { \n            x: x / (element.clientWidth / (element.width || element.clientWidth) * pixelRatio),\n            y: y / (element.clientHeight / (element.height || element.clientHeight) * pixelRatio)\n        };\n    };\n\n})();\n\n\n/***/ }),\n/* 15 */\n/***/ (function(module, exports, __nested_webpack_require_191365__) {\n\n/**\n* The `Matter.Plugin` module contains functions for registering and installing plugins on modules.\n*\n* @class Plugin\n*/\n\nvar Plugin = {};\n\nmodule.exports = Plugin;\n\nvar Common = __nested_webpack_require_191365__(0);\n\n(function() {\n\n    Plugin._registry = {};\n\n    /**\n     * Registers a plugin object so it can be resolved later by name.\n     * @method register\n     * @param plugin {} The plugin to register.\n     * @return {object} The plugin.\n     */\n    Plugin.register = function(plugin) {\n        if (!Plugin.isPlugin(plugin)) {\n            Common.warn('Plugin.register:', Plugin.toString(plugin), 'does not implement all required fields.');\n        }\n\n        if (plugin.name in Plugin._registry) {\n            var registered = Plugin._registry[plugin.name],\n                pluginVersion = Plugin.versionParse(plugin.version).number,\n                registeredVersion = Plugin.versionParse(registered.version).number;\n\n            if (pluginVersion > registeredVersion) {\n                Common.warn('Plugin.register:', Plugin.toString(registered), 'was upgraded to', Plugin.toString(plugin));\n                Plugin._registry[plugin.name] = plugin;\n            } else if (pluginVersion < registeredVersion) {\n                Common.warn('Plugin.register:', Plugin.toString(registered), 'can not be downgraded to', Plugin.toString(plugin));\n            } else if (plugin !== registered) {\n                Common.warn('Plugin.register:', Plugin.toString(plugin), 'is already registered to different plugin object');\n            }\n        } else {\n            Plugin._registry[plugin.name] = plugin;\n        }\n\n        return plugin;\n    };\n\n    /**\n     * Resolves a dependency to a plugin object from the registry if it exists. \n     * The `dependency` may contain a version, but only the name matters when resolving.\n     * @method resolve\n     * @param dependency {string} The dependency.\n     * @return {object} The plugin if resolved, otherwise `undefined`.\n     */\n    Plugin.resolve = function(dependency) {\n        return Plugin._registry[Plugin.dependencyParse(dependency).name];\n    };\n\n    /**\n     * Returns a pretty printed plugin name and version.\n     * @method toString\n     * @param plugin {} The plugin.\n     * @return {string} Pretty printed plugin name and version.\n     */\n    Plugin.toString = function(plugin) {\n        return typeof plugin === 'string' ? plugin : (plugin.name || 'anonymous') + '@' + (plugin.version || plugin.range || '0.0.0');\n    };\n\n    /**\n     * Returns `true` if the object meets the minimum standard to be considered a plugin.\n     * This means it must define the following properties:\n     * - `name`\n     * - `version`\n     * - `install`\n     * @method isPlugin\n     * @param obj {} The obj to test.\n     * @return {boolean} `true` if the object can be considered a plugin otherwise `false`.\n     */\n    Plugin.isPlugin = function(obj) {\n        return obj && obj.name && obj.version && obj.install;\n    };\n\n    /**\n     * Returns `true` if a plugin with the given `name` been installed on `module`.\n     * @method isUsed\n     * @param module {} The module.\n     * @param name {string} The plugin name.\n     * @return {boolean} `true` if a plugin with the given `name` been installed on `module`, otherwise `false`.\n     */\n    Plugin.isUsed = function(module, name) {\n        return module.used.indexOf(name) > -1;\n    };\n\n    /**\n     * Returns `true` if `plugin.for` is applicable to `module` by comparing against `module.name` and `module.version`.\n     * If `plugin.for` is not specified then it is assumed to be applicable.\n     * The value of `plugin.for` is a string of the format `'module-name'` or `'module-name@version'`.\n     * @method isFor\n     * @param plugin {} The plugin.\n     * @param module {} The module.\n     * @return {boolean} `true` if `plugin.for` is applicable to `module`, otherwise `false`.\n     */\n    Plugin.isFor = function(plugin, module) {\n        var parsed = plugin.for && Plugin.dependencyParse(plugin.for);\n        return !plugin.for || (module.name === parsed.name && Plugin.versionSatisfies(module.version, parsed.range));\n    };\n\n    /**\n     * Installs the plugins by calling `plugin.install` on each plugin specified in `plugins` if passed, otherwise `module.uses`.\n     * For installing plugins on `Matter` see the convenience function `Matter.use`.\n     * Plugins may be specified either by their name or a reference to the plugin object.\n     * Plugins themselves may specify further dependencies, but each plugin is installed only once.\n     * Order is important, a topological sort is performed to find the best resulting order of installation.\n     * This sorting attempts to satisfy every dependency's requested ordering, but may not be exact in all cases.\n     * This function logs the resulting status of each dependency in the console, along with any warnings.\n     * - A green tick ✅ indicates a dependency was resolved and installed.\n     * - An orange diamond 🔶 indicates a dependency was resolved but a warning was thrown for it or one if its dependencies.\n     * - A red cross ❌ indicates a dependency could not be resolved.\n     * Avoid calling this function multiple times on the same module unless you intend to manually control installation order.\n     * @method use\n     * @param module {} The module install plugins on.\n     * @param [plugins=module.uses] {} The plugins to install on module (optional, defaults to `module.uses`).\n     */\n    Plugin.use = function(module, plugins) {\n        module.uses = (module.uses || []).concat(plugins || []);\n\n        if (module.uses.length === 0) {\n            Common.warn('Plugin.use:', Plugin.toString(module), 'does not specify any dependencies to install.');\n            return;\n        }\n\n        var dependencies = Plugin.dependencies(module),\n            sortedDependencies = Common.topologicalSort(dependencies),\n            status = [];\n\n        for (var i = 0; i < sortedDependencies.length; i += 1) {\n            if (sortedDependencies[i] === module.name) {\n                continue;\n            }\n\n            var plugin = Plugin.resolve(sortedDependencies[i]);\n\n            if (!plugin) {\n                status.push('❌ ' + sortedDependencies[i]);\n                continue;\n            }\n\n            if (Plugin.isUsed(module, plugin.name)) {\n                continue;\n            }\n\n            if (!Plugin.isFor(plugin, module)) {\n                Common.warn('Plugin.use:', Plugin.toString(plugin), 'is for', plugin.for, 'but installed on', Plugin.toString(module) + '.');\n                plugin._warned = true;\n            }\n\n            if (plugin.install) {\n                plugin.install(module);\n            } else {\n                Common.warn('Plugin.use:', Plugin.toString(plugin), 'does not specify an install function.');\n                plugin._warned = true;\n            }\n\n            if (plugin._warned) {\n                status.push('🔶 ' + Plugin.toString(plugin));\n                delete plugin._warned;\n            } else {\n                status.push('✅ ' + Plugin.toString(plugin));\n            }\n\n            module.used.push(plugin.name);\n        }\n\n        if (status.length > 0) {\n            Common.info(status.join('  '));\n        }\n    };\n\n    /**\n     * Recursively finds all of a module's dependencies and returns a flat dependency graph.\n     * @method dependencies\n     * @param module {} The module.\n     * @return {object} A dependency graph.\n     */\n    Plugin.dependencies = function(module, tracked) {\n        var parsedBase = Plugin.dependencyParse(module),\n            name = parsedBase.name;\n\n        tracked = tracked || {};\n\n        if (name in tracked) {\n            return;\n        }\n\n        module = Plugin.resolve(module) || module;\n\n        tracked[name] = Common.map(module.uses || [], function(dependency) {\n            if (Plugin.isPlugin(dependency)) {\n                Plugin.register(dependency);\n            }\n\n            var parsed = Plugin.dependencyParse(dependency),\n                resolved = Plugin.resolve(dependency);\n\n            if (resolved && !Plugin.versionSatisfies(resolved.version, parsed.range)) {\n                Common.warn(\n                    'Plugin.dependencies:', Plugin.toString(resolved), 'does not satisfy',\n                    Plugin.toString(parsed), 'used by', Plugin.toString(parsedBase) + '.'\n                );\n\n                resolved._warned = true;\n                module._warned = true;\n            } else if (!resolved) {\n                Common.warn(\n                    'Plugin.dependencies:', Plugin.toString(dependency), 'used by',\n                    Plugin.toString(parsedBase), 'could not be resolved.'\n                );\n\n                module._warned = true;\n            }\n\n            return parsed.name;\n        });\n\n        for (var i = 0; i < tracked[name].length; i += 1) {\n            Plugin.dependencies(tracked[name][i], tracked);\n        }\n\n        return tracked;\n    };\n\n    /**\n     * Parses a dependency string into its components.\n     * The `dependency` is a string of the format `'module-name'` or `'module-name@version'`.\n     * See documentation for `Plugin.versionParse` for a description of the format.\n     * This function can also handle dependencies that are already resolved (e.g. a module object).\n     * @method dependencyParse\n     * @param dependency {string} The dependency of the format `'module-name'` or `'module-name@version'`.\n     * @return {object} The dependency parsed into its components.\n     */\n    Plugin.dependencyParse = function(dependency) {\n        if (Common.isString(dependency)) {\n            var pattern = /^[\\w-]+(@(\\*|[\\^~]?\\d+\\.\\d+\\.\\d+(-[0-9A-Za-z-+]+)?))?$/;\n\n            if (!pattern.test(dependency)) {\n                Common.warn('Plugin.dependencyParse:', dependency, 'is not a valid dependency string.');\n            }\n\n            return {\n                name: dependency.split('@')[0],\n                range: dependency.split('@')[1] || '*'\n            };\n        }\n\n        return {\n            name: dependency.name,\n            range: dependency.range || dependency.version\n        };\n    };\n\n    /**\n     * Parses a version string into its components.  \n     * Versions are strictly of the format `x.y.z` (as in [semver](http://semver.org/)).\n     * Versions may optionally have a prerelease tag in the format `x.y.z-alpha`.\n     * Ranges are a strict subset of [npm ranges](https://docs.npmjs.com/misc/semver#advanced-range-syntax).\n     * Only the following range types are supported:\n     * - Tilde ranges e.g. `~1.2.3`\n     * - Caret ranges e.g. `^1.2.3`\n     * - Greater than ranges e.g. `>1.2.3`\n     * - Greater than or equal ranges e.g. `>=1.2.3`\n     * - Exact version e.g. `1.2.3`\n     * - Any version `*`\n     * @method versionParse\n     * @param range {string} The version string.\n     * @return {object} The version range parsed into its components.\n     */\n    Plugin.versionParse = function(range) {\n        var pattern = /^(\\*)|(\\^|~|>=|>)?\\s*((\\d+)\\.(\\d+)\\.(\\d+))(-[0-9A-Za-z-+]+)?$/;\n\n        if (!pattern.test(range)) {\n            Common.warn('Plugin.versionParse:', range, 'is not a valid version or range.');\n        }\n\n        var parts = pattern.exec(range);\n        var major = Number(parts[4]);\n        var minor = Number(parts[5]);\n        var patch = Number(parts[6]);\n\n        return {\n            isRange: Boolean(parts[1] || parts[2]),\n            version: parts[3],\n            range: range,\n            operator: parts[1] || parts[2] || '',\n            major: major,\n            minor: minor,\n            patch: patch,\n            parts: [major, minor, patch],\n            prerelease: parts[7],\n            number: major * 1e8 + minor * 1e4 + patch\n        };\n    };\n\n    /**\n     * Returns `true` if `version` satisfies the given `range`.\n     * See documentation for `Plugin.versionParse` for a description of the format.\n     * If a version or range is not specified, then any version (`*`) is assumed to satisfy.\n     * @method versionSatisfies\n     * @param version {string} The version string.\n     * @param range {string} The range string.\n     * @return {boolean} `true` if `version` satisfies `range`, otherwise `false`.\n     */\n    Plugin.versionSatisfies = function(version, range) {\n        range = range || '*';\n\n        var r = Plugin.versionParse(range),\n            v = Plugin.versionParse(version);\n\n        if (r.isRange) {\n            if (r.operator === '*' || version === '*') {\n                return true;\n            }\n\n            if (r.operator === '>') {\n                return v.number > r.number;\n            }\n\n            if (r.operator === '>=') {\n                return v.number >= r.number;\n            }\n\n            if (r.operator === '~') {\n                return v.major === r.major && v.minor === r.minor && v.patch >= r.patch;\n            }\n\n            if (r.operator === '^') {\n                if (r.major > 0) {\n                    return v.major === r.major && v.number >= r.number;\n                }\n\n                if (r.minor > 0) {\n                    return v.minor === r.minor && v.patch >= r.patch;\n                }\n\n                return v.patch === r.patch;\n            }\n        }\n\n        return version === range || version === '*';\n    };\n\n})();\n\n\n/***/ }),\n/* 16 */\n/***/ (function(module, exports) {\n\n/**\n* The `Matter.Contact` module contains methods for creating and manipulating collision contacts.\n*\n* @class Contact\n*/\n\nvar Contact = {};\n\nmodule.exports = Contact;\n\n(function() {\n\n    /**\n     * Creates a new contact.\n     * @method create\n     * @param {vertex} vertex\n     * @return {contact} A new contact\n     */\n    Contact.create = function(vertex) {\n        return {\n            vertex: vertex,\n            normalImpulse: 0,\n            tangentImpulse: 0\n        };\n    };\n\n})();\n\n\n/***/ }),\n/* 17 */\n/***/ (function(module, exports, __nested_webpack_require_205269__) {\n\n/**\n* The `Matter.Engine` module contains methods for creating and manipulating engines.\n* An engine is a controller that manages updating the simulation of the world.\n* See `Matter.Runner` for an optional game loop utility.\n*\n* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).\n*\n* @class Engine\n*/\n\nvar Engine = {};\n\nmodule.exports = Engine;\n\nvar Sleeping = __nested_webpack_require_205269__(7);\nvar Resolver = __nested_webpack_require_205269__(18);\nvar Detector = __nested_webpack_require_205269__(13);\nvar Pairs = __nested_webpack_require_205269__(19);\nvar Events = __nested_webpack_require_205269__(5);\nvar Composite = __nested_webpack_require_205269__(6);\nvar Constraint = __nested_webpack_require_205269__(10);\nvar Common = __nested_webpack_require_205269__(0);\nvar Body = __nested_webpack_require_205269__(4);\n\n(function() {\n\n    /**\n     * Creates a new engine. The options parameter is an object that specifies any properties you wish to override the defaults.\n     * All properties have default values, and many are pre-calculated automatically based on other properties.\n     * See the properties section below for detailed information on what you can pass via the `options` object.\n     * @method create\n     * @param {object} [options]\n     * @return {engine} engine\n     */\n    Engine.create = function(options) {\n        options = options || {};\n\n        var defaults = {\n            positionIterations: 6,\n            velocityIterations: 4,\n            constraintIterations: 2,\n            enableSleeping: false,\n            events: [],\n            plugin: {},\n            gravity: {\n                x: 0,\n                y: 1,\n                scale: 0.001\n            },\n            timing: {\n                timestamp: 0,\n                timeScale: 1,\n                lastDelta: 0,\n                lastElapsed: 0\n            }\n        };\n\n        var engine = Common.extend(defaults, options);\n\n        engine.world = options.world || Composite.create({ label: 'World' });\n        engine.pairs = options.pairs || Pairs.create();\n        engine.detector = options.detector || Detector.create();\n\n        // for temporary back compatibility only\n        engine.grid = { buckets: [] };\n        engine.world.gravity = engine.gravity;\n        engine.broadphase = engine.grid;\n        engine.metrics = {};\n        \n        return engine;\n    };\n\n    /**\n     * Moves the simulation forward in time by `delta` milliseconds.\n     * Triggers `beforeUpdate` and `afterUpdate` events.\n     * Triggers `collisionStart`, `collisionActive` and `collisionEnd` events.\n     * @method update\n     * @param {engine} engine\n     * @param {number} [delta=16.666]\n     */\n    Engine.update = function(engine, delta) {\n        var startTime = Common.now();\n\n        var world = engine.world,\n            detector = engine.detector,\n            pairs = engine.pairs,\n            timing = engine.timing,\n            timestamp = timing.timestamp,\n            i;\n\n        delta = typeof delta !== 'undefined' ? delta : Common._baseDelta;\n        delta *= timing.timeScale;\n\n        // increment timestamp\n        timing.timestamp += delta;\n        timing.lastDelta = delta;\n\n        // create an event object\n        var event = {\n            timestamp: timing.timestamp,\n            delta: delta\n        };\n\n        Events.trigger(engine, 'beforeUpdate', event);\n\n        // get all bodies and all constraints in the world\n        var allBodies = Composite.allBodies(world),\n            allConstraints = Composite.allConstraints(world);\n\n        // if the world has changed\n        if (world.isModified) {\n            // update the detector bodies\n            Detector.setBodies(detector, allBodies);\n\n            // reset all composite modified flags\n            Composite.setModified(world, false, false, true);\n        }\n\n        // update sleeping if enabled\n        if (engine.enableSleeping)\n            Sleeping.update(allBodies, delta);\n\n        // apply gravity to all bodies\n        Engine._bodiesApplyGravity(allBodies, engine.gravity);\n\n        // update all body position and rotation by integration\n        if (delta > 0) {\n            Engine._bodiesUpdate(allBodies, delta);\n        }\n\n        // update all constraints (first pass)\n        Constraint.preSolveAll(allBodies);\n        for (i = 0; i < engine.constraintIterations; i++) {\n            Constraint.solveAll(allConstraints, delta);\n        }\n        Constraint.postSolveAll(allBodies);\n\n        // find all collisions\n        detector.pairs = engine.pairs;\n        var collisions = Detector.collisions(detector);\n\n        // update collision pairs\n        Pairs.update(pairs, collisions, timestamp);\n\n        // wake up bodies involved in collisions\n        if (engine.enableSleeping)\n            Sleeping.afterCollisions(pairs.list);\n\n        // trigger collision events\n        if (pairs.collisionStart.length > 0)\n            Events.trigger(engine, 'collisionStart', { pairs: pairs.collisionStart });\n\n        // iteratively resolve position between collisions\n        var positionDamping = Common.clamp(20 / engine.positionIterations, 0, 1);\n        \n        Resolver.preSolvePosition(pairs.list);\n        for (i = 0; i < engine.positionIterations; i++) {\n            Resolver.solvePosition(pairs.list, delta, positionDamping);\n        }\n        Resolver.postSolvePosition(allBodies);\n\n        // update all constraints (second pass)\n        Constraint.preSolveAll(allBodies);\n        for (i = 0; i < engine.constraintIterations; i++) {\n            Constraint.solveAll(allConstraints, delta);\n        }\n        Constraint.postSolveAll(allBodies);\n\n        // iteratively resolve velocity between collisions\n        Resolver.preSolveVelocity(pairs.list);\n        for (i = 0; i < engine.velocityIterations; i++) {\n            Resolver.solveVelocity(pairs.list, delta);\n        }\n\n        // update body speed and velocity properties\n        Engine._bodiesUpdateVelocities(allBodies);\n\n        // trigger collision events\n        if (pairs.collisionActive.length > 0)\n            Events.trigger(engine, 'collisionActive', { pairs: pairs.collisionActive });\n\n        if (pairs.collisionEnd.length > 0)\n            Events.trigger(engine, 'collisionEnd', { pairs: pairs.collisionEnd });\n\n        // clear force buffers\n        Engine._bodiesClearForces(allBodies);\n\n        Events.trigger(engine, 'afterUpdate', event);\n\n        // log the time elapsed computing this update\n        engine.timing.lastElapsed = Common.now() - startTime;\n\n        return engine;\n    };\n    \n    /**\n     * Merges two engines by keeping the configuration of `engineA` but replacing the world with the one from `engineB`.\n     * @method merge\n     * @param {engine} engineA\n     * @param {engine} engineB\n     */\n    Engine.merge = function(engineA, engineB) {\n        Common.extend(engineA, engineB);\n        \n        if (engineB.world) {\n            engineA.world = engineB.world;\n\n            Engine.clear(engineA);\n\n            var bodies = Composite.allBodies(engineA.world);\n\n            for (var i = 0; i < bodies.length; i++) {\n                var body = bodies[i];\n                Sleeping.set(body, false);\n                body.id = Common.nextId();\n            }\n        }\n    };\n\n    /**\n     * Clears the engine pairs and detector.\n     * @method clear\n     * @param {engine} engine\n     */\n    Engine.clear = function(engine) {\n        Pairs.clear(engine.pairs);\n        Detector.clear(engine.detector);\n    };\n\n    /**\n     * Zeroes the `body.force` and `body.torque` force buffers.\n     * @method _bodiesClearForces\n     * @private\n     * @param {body[]} bodies\n     */\n    Engine._bodiesClearForces = function(bodies) {\n        var bodiesLength = bodies.length;\n\n        for (var i = 0; i < bodiesLength; i++) {\n            var body = bodies[i];\n\n            // reset force buffers\n            body.force.x = 0;\n            body.force.y = 0;\n            body.torque = 0;\n        }\n    };\n\n    /**\n     * Applies gravitational acceleration to all `bodies`.\n     * This models a [uniform gravitational field](https://en.wikipedia.org/wiki/Gravity_of_Earth), similar to near the surface of a planet.\n     * \n     * @method _bodiesApplyGravity\n     * @private\n     * @param {body[]} bodies\n     * @param {vector} gravity\n     */\n    Engine._bodiesApplyGravity = function(bodies, gravity) {\n        var gravityScale = typeof gravity.scale !== 'undefined' ? gravity.scale : 0.001,\n            bodiesLength = bodies.length;\n\n        if ((gravity.x === 0 && gravity.y === 0) || gravityScale === 0) {\n            return;\n        }\n        \n        for (var i = 0; i < bodiesLength; i++) {\n            var body = bodies[i];\n\n            if (body.isStatic || body.isSleeping)\n                continue;\n\n            // add the resultant force of gravity\n            body.force.y += body.mass * gravity.y * gravityScale;\n            body.force.x += body.mass * gravity.x * gravityScale;\n        }\n    };\n\n    /**\n     * Applies `Body.update` to all given `bodies`.\n     * @method _bodiesUpdate\n     * @private\n     * @param {body[]} bodies\n     * @param {number} delta The amount of time elapsed between updates\n     */\n    Engine._bodiesUpdate = function(bodies, delta) {\n        var bodiesLength = bodies.length;\n\n        for (var i = 0; i < bodiesLength; i++) {\n            var body = bodies[i];\n\n            if (body.isStatic || body.isSleeping)\n                continue;\n\n            Body.update(body, delta);\n        }\n    };\n\n    /**\n     * Applies `Body.updateVelocities` to all given `bodies`.\n     * @method _bodiesUpdateVelocities\n     * @private\n     * @param {body[]} bodies\n     */\n    Engine._bodiesUpdateVelocities = function(bodies) {\n        var bodiesLength = bodies.length;\n\n        for (var i = 0; i < bodiesLength; i++) {\n            Body.updateVelocities(bodies[i]);\n        }\n    };\n\n    /**\n     * A deprecated alias for `Runner.run`, use `Matter.Runner.run(engine)` instead and see `Matter.Runner` for more information.\n     * @deprecated use Matter.Runner.run(engine) instead\n     * @method run\n     * @param {engine} engine\n     */\n\n    /**\n    * Fired just before an update\n    *\n    * @event beforeUpdate\n    * @param {object} event An event object\n    * @param {number} event.timestamp The engine.timing.timestamp of the event\n    * @param {number} event.delta The delta time in milliseconds value used in the update\n    * @param {engine} event.source The source object of the event\n    * @param {string} event.name The name of the event\n    */\n\n    /**\n    * Fired after engine update and all collision events\n    *\n    * @event afterUpdate\n    * @param {object} event An event object\n    * @param {number} event.timestamp The engine.timing.timestamp of the event\n    * @param {number} event.delta The delta time in milliseconds value used in the update\n    * @param {engine} event.source The source object of the event\n    * @param {string} event.name The name of the event\n    */\n\n    /**\n    * Fired after engine update, provides a list of all pairs that have started to collide in the current tick (if any)\n    *\n    * @event collisionStart\n    * @param {object} event An event object\n    * @param {pair[]} event.pairs List of affected pairs\n    * @param {number} event.timestamp The engine.timing.timestamp of the event\n    * @param {number} event.delta The delta time in milliseconds value used in the update\n    * @param {engine} event.source The source object of the event\n    * @param {string} event.name The name of the event\n    */\n\n    /**\n    * Fired after engine update, provides a list of all pairs that are colliding in the current tick (if any)\n    *\n    * @event collisionActive\n    * @param {object} event An event object\n    * @param {pair[]} event.pairs List of affected pairs\n    * @param {number} event.timestamp The engine.timing.timestamp of the event\n    * @param {number} event.delta The delta time in milliseconds value used in the update\n    * @param {engine} event.source The source object of the event\n    * @param {string} event.name The name of the event\n    */\n\n    /**\n    * Fired after engine update, provides a list of all pairs that have ended collision in the current tick (if any)\n    *\n    * @event collisionEnd\n    * @param {object} event An event object\n    * @param {pair[]} event.pairs List of affected pairs\n    * @param {number} event.timestamp The engine.timing.timestamp of the event\n    * @param {number} event.delta The delta time in milliseconds value used in the update\n    * @param {engine} event.source The source object of the event\n    * @param {string} event.name The name of the event\n    */\n\n    /*\n    *\n    *  Properties Documentation\n    *\n    */\n\n    /**\n     * An integer `Number` that specifies the number of position iterations to perform each update.\n     * The higher the value, the higher quality the simulation will be at the expense of performance.\n     *\n     * @property positionIterations\n     * @type number\n     * @default 6\n     */\n\n    /**\n     * An integer `Number` that specifies the number of velocity iterations to perform each update.\n     * The higher the value, the higher quality the simulation will be at the expense of performance.\n     *\n     * @property velocityIterations\n     * @type number\n     * @default 4\n     */\n\n    /**\n     * An integer `Number` that specifies the number of constraint iterations to perform each update.\n     * The higher the value, the higher quality the simulation will be at the expense of performance.\n     * The default value of `2` is usually very adequate.\n     *\n     * @property constraintIterations\n     * @type number\n     * @default 2\n     */\n\n    /**\n     * A flag that specifies whether the engine should allow sleeping via the `Matter.Sleeping` module.\n     * Sleeping can improve stability and performance, but often at the expense of accuracy.\n     *\n     * @property enableSleeping\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * An `Object` containing properties regarding the timing systems of the engine. \n     *\n     * @property timing\n     * @type object\n     */\n\n    /**\n     * A `Number` that specifies the global scaling factor of time for all bodies.\n     * A value of `0` freezes the simulation.\n     * A value of `0.1` gives a slow-motion effect.\n     * A value of `1.2` gives a speed-up effect.\n     *\n     * @property timing.timeScale\n     * @type number\n     * @default 1\n     */\n\n    /**\n     * A `Number` that specifies the current simulation-time in milliseconds starting from `0`. \n     * It is incremented on every `Engine.update` by the given `delta` argument. \n     * \n     * @property timing.timestamp\n     * @type number\n     * @default 0\n     */\n\n    /**\n     * A `Number` that represents the total execution time elapsed during the last `Engine.update` in milliseconds.\n     * It is updated by timing from the start of the last `Engine.update` call until it ends.\n     *\n     * This value will also include the total execution time of all event handlers directly or indirectly triggered by the engine update.\n     * \n     * @property timing.lastElapsed\n     * @type number\n     * @default 0\n     */\n\n    /**\n     * A `Number` that represents the `delta` value used in the last engine update.\n     * \n     * @property timing.lastDelta\n     * @type number\n     * @default 0\n     */\n\n    /**\n     * A `Matter.Detector` instance.\n     *\n     * @property detector\n     * @type detector\n     * @default a Matter.Detector instance\n     */\n\n    /**\n     * A `Matter.Grid` instance.\n     *\n     * @deprecated replaced by `engine.detector`\n     * @property grid\n     * @type grid\n     * @default a Matter.Grid instance\n     */\n\n    /**\n     * Replaced by and now alias for `engine.grid`.\n     *\n     * @deprecated replaced by `engine.detector`\n     * @property broadphase\n     * @type grid\n     * @default a Matter.Grid instance\n     */\n\n    /**\n     * The root `Matter.Composite` instance that will contain all bodies, constraints and other composites to be simulated by this engine.\n     *\n     * @property world\n     * @type composite\n     * @default a Matter.Composite instance\n     */\n\n    /**\n     * An object reserved for storing plugin-specific properties.\n     *\n     * @property plugin\n     * @type {}\n     */\n\n    /**\n     * An optional gravitational acceleration applied to all bodies in `engine.world` on every update.\n     * \n     * This models a [uniform gravitational field](https://en.wikipedia.org/wiki/Gravity_of_Earth), similar to near the surface of a planet. For gravity in other contexts, disable this and apply forces as needed.\n     * \n     * To disable set the `scale` component to `0`.\n     * \n     * This is split into three components for ease of use:  \n     * a normalised direction (`x` and `y`) and magnitude (`scale`).\n     *\n     * @property gravity\n     * @type object\n     */\n\n    /**\n     * The gravitational direction normal `x` component, to be multiplied by `gravity.scale`.\n     * \n     * @property gravity.x\n     * @type object\n     * @default 0\n     */\n\n    /**\n     * The gravitational direction normal `y` component, to be multiplied by `gravity.scale`.\n     *\n     * @property gravity.y\n     * @type object\n     * @default 1\n     */\n\n    /**\n     * The magnitude of the gravitational acceleration.\n     * \n     * @property gravity.scale\n     * @type object\n     * @default 0.001\n     */\n\n})();\n\n\n/***/ }),\n/* 18 */\n/***/ (function(module, exports, __nested_webpack_require_222656__) {\n\n/**\n* The `Matter.Resolver` module contains methods for resolving collision pairs.\n*\n* @class Resolver\n*/\n\nvar Resolver = {};\n\nmodule.exports = Resolver;\n\nvar Vertices = __nested_webpack_require_222656__(3);\nvar Common = __nested_webpack_require_222656__(0);\nvar Bounds = __nested_webpack_require_222656__(1);\n\n(function() {\n\n    Resolver._restingThresh = 2;\n    Resolver._restingThreshTangent = Math.sqrt(6);\n    Resolver._positionDampen = 0.9;\n    Resolver._positionWarming = 0.8;\n    Resolver._frictionNormalMultiplier = 5;\n    Resolver._frictionMaxStatic = Number.MAX_VALUE;\n\n    /**\n     * Prepare pairs for position solving.\n     * @method preSolvePosition\n     * @param {pair[]} pairs\n     */\n    Resolver.preSolvePosition = function(pairs) {\n        var i,\n            pair,\n            activeCount,\n            pairsLength = pairs.length;\n\n        // find total contacts on each body\n        for (i = 0; i < pairsLength; i++) {\n            pair = pairs[i];\n            \n            if (!pair.isActive)\n                continue;\n            \n            activeCount = pair.activeContacts.length;\n            pair.collision.parentA.totalContacts += activeCount;\n            pair.collision.parentB.totalContacts += activeCount;\n        }\n    };\n\n    /**\n     * Find a solution for pair positions.\n     * @method solvePosition\n     * @param {pair[]} pairs\n     * @param {number} delta\n     * @param {number} [damping=1]\n     */\n    Resolver.solvePosition = function(pairs, delta, damping) {\n        var i,\n            pair,\n            collision,\n            bodyA,\n            bodyB,\n            normal,\n            contactShare,\n            positionImpulse,\n            positionDampen = Resolver._positionDampen * (damping || 1),\n            slopDampen = Common.clamp(delta / Common._baseDelta, 0, 1),\n            pairsLength = pairs.length;\n\n        // find impulses required to resolve penetration\n        for (i = 0; i < pairsLength; i++) {\n            pair = pairs[i];\n            \n            if (!pair.isActive || pair.isSensor)\n                continue;\n\n            collision = pair.collision;\n            bodyA = collision.parentA;\n            bodyB = collision.parentB;\n            normal = collision.normal;\n\n            // get current separation between body edges involved in collision\n            pair.separation = \n                normal.x * (bodyB.positionImpulse.x + collision.penetration.x - bodyA.positionImpulse.x)\n                + normal.y * (bodyB.positionImpulse.y + collision.penetration.y - bodyA.positionImpulse.y);\n        }\n        \n        for (i = 0; i < pairsLength; i++) {\n            pair = pairs[i];\n\n            if (!pair.isActive || pair.isSensor)\n                continue;\n            \n            collision = pair.collision;\n            bodyA = collision.parentA;\n            bodyB = collision.parentB;\n            normal = collision.normal;\n            positionImpulse = pair.separation - pair.slop * slopDampen;\n\n            if (bodyA.isStatic || bodyB.isStatic)\n                positionImpulse *= 2;\n            \n            if (!(bodyA.isStatic || bodyA.isSleeping)) {\n                contactShare = positionDampen / bodyA.totalContacts;\n                bodyA.positionImpulse.x += normal.x * positionImpulse * contactShare;\n                bodyA.positionImpulse.y += normal.y * positionImpulse * contactShare;\n            }\n\n            if (!(bodyB.isStatic || bodyB.isSleeping)) {\n                contactShare = positionDampen / bodyB.totalContacts;\n                bodyB.positionImpulse.x -= normal.x * positionImpulse * contactShare;\n                bodyB.positionImpulse.y -= normal.y * positionImpulse * contactShare;\n            }\n        }\n    };\n\n    /**\n     * Apply position resolution.\n     * @method postSolvePosition\n     * @param {body[]} bodies\n     */\n    Resolver.postSolvePosition = function(bodies) {\n        var positionWarming = Resolver._positionWarming,\n            bodiesLength = bodies.length,\n            verticesTranslate = Vertices.translate,\n            boundsUpdate = Bounds.update;\n\n        for (var i = 0; i < bodiesLength; i++) {\n            var body = bodies[i],\n                positionImpulse = body.positionImpulse,\n                positionImpulseX = positionImpulse.x,\n                positionImpulseY = positionImpulse.y,\n                velocity = body.velocity;\n\n            // reset contact count\n            body.totalContacts = 0;\n\n            if (positionImpulseX !== 0 || positionImpulseY !== 0) {\n                // update body geometry\n                for (var j = 0; j < body.parts.length; j++) {\n                    var part = body.parts[j];\n                    verticesTranslate(part.vertices, positionImpulse);\n                    boundsUpdate(part.bounds, part.vertices, velocity);\n                    part.position.x += positionImpulseX;\n                    part.position.y += positionImpulseY;\n                }\n\n                // move the body without changing velocity\n                body.positionPrev.x += positionImpulseX;\n                body.positionPrev.y += positionImpulseY;\n\n                if (positionImpulseX * velocity.x + positionImpulseY * velocity.y < 0) {\n                    // reset cached impulse if the body has velocity along it\n                    positionImpulse.x = 0;\n                    positionImpulse.y = 0;\n                } else {\n                    // warm the next iteration\n                    positionImpulse.x *= positionWarming;\n                    positionImpulse.y *= positionWarming;\n                }\n            }\n        }\n    };\n\n    /**\n     * Prepare pairs for velocity solving.\n     * @method preSolveVelocity\n     * @param {pair[]} pairs\n     */\n    Resolver.preSolveVelocity = function(pairs) {\n        var pairsLength = pairs.length,\n            i,\n            j;\n        \n        for (i = 0; i < pairsLength; i++) {\n            var pair = pairs[i];\n            \n            if (!pair.isActive || pair.isSensor)\n                continue;\n            \n            var contacts = pair.activeContacts,\n                contactsLength = contacts.length,\n                collision = pair.collision,\n                bodyA = collision.parentA,\n                bodyB = collision.parentB,\n                normal = collision.normal,\n                tangent = collision.tangent;\n    \n            // resolve each contact\n            for (j = 0; j < contactsLength; j++) {\n                var contact = contacts[j],\n                    contactVertex = contact.vertex,\n                    normalImpulse = contact.normalImpulse,\n                    tangentImpulse = contact.tangentImpulse;\n    \n                if (normalImpulse !== 0 || tangentImpulse !== 0) {\n                    // total impulse from contact\n                    var impulseX = normal.x * normalImpulse + tangent.x * tangentImpulse,\n                        impulseY = normal.y * normalImpulse + tangent.y * tangentImpulse;\n                    \n                    // apply impulse from contact\n                    if (!(bodyA.isStatic || bodyA.isSleeping)) {\n                        bodyA.positionPrev.x += impulseX * bodyA.inverseMass;\n                        bodyA.positionPrev.y += impulseY * bodyA.inverseMass;\n                        bodyA.anglePrev += bodyA.inverseInertia * (\n                            (contactVertex.x - bodyA.position.x) * impulseY\n                            - (contactVertex.y - bodyA.position.y) * impulseX\n                        );\n                    }\n    \n                    if (!(bodyB.isStatic || bodyB.isSleeping)) {\n                        bodyB.positionPrev.x -= impulseX * bodyB.inverseMass;\n                        bodyB.positionPrev.y -= impulseY * bodyB.inverseMass;\n                        bodyB.anglePrev -= bodyB.inverseInertia * (\n                            (contactVertex.x - bodyB.position.x) * impulseY \n                            - (contactVertex.y - bodyB.position.y) * impulseX\n                        );\n                    }\n                }\n            }\n        }\n    };\n\n    /**\n     * Find a solution for pair velocities.\n     * @method solveVelocity\n     * @param {pair[]} pairs\n     * @param {number} delta\n     */\n    Resolver.solveVelocity = function(pairs, delta) {\n        var timeScale = delta / Common._baseDelta,\n            timeScaleSquared = timeScale * timeScale,\n            timeScaleCubed = timeScaleSquared * timeScale,\n            restingThresh = -Resolver._restingThresh * timeScale,\n            restingThreshTangent = Resolver._restingThreshTangent,\n            frictionNormalMultiplier = Resolver._frictionNormalMultiplier * timeScale,\n            frictionMaxStatic = Resolver._frictionMaxStatic,\n            pairsLength = pairs.length,\n            tangentImpulse,\n            maxFriction,\n            i,\n            j;\n\n        for (i = 0; i < pairsLength; i++) {\n            var pair = pairs[i];\n            \n            if (!pair.isActive || pair.isSensor)\n                continue;\n            \n            var collision = pair.collision,\n                bodyA = collision.parentA,\n                bodyB = collision.parentB,\n                bodyAVelocity = bodyA.velocity,\n                bodyBVelocity = bodyB.velocity,\n                normalX = collision.normal.x,\n                normalY = collision.normal.y,\n                tangentX = collision.tangent.x,\n                tangentY = collision.tangent.y,\n                contacts = pair.activeContacts,\n                contactsLength = contacts.length,\n                contactShare = 1 / contactsLength,\n                inverseMassTotal = bodyA.inverseMass + bodyB.inverseMass,\n                friction = pair.friction * pair.frictionStatic * frictionNormalMultiplier;\n\n            // update body velocities\n            bodyAVelocity.x = bodyA.position.x - bodyA.positionPrev.x;\n            bodyAVelocity.y = bodyA.position.y - bodyA.positionPrev.y;\n            bodyBVelocity.x = bodyB.position.x - bodyB.positionPrev.x;\n            bodyBVelocity.y = bodyB.position.y - bodyB.positionPrev.y;\n            bodyA.angularVelocity = bodyA.angle - bodyA.anglePrev;\n            bodyB.angularVelocity = bodyB.angle - bodyB.anglePrev;\n\n            // resolve each contact\n            for (j = 0; j < contactsLength; j++) {\n                var contact = contacts[j],\n                    contactVertex = contact.vertex;\n\n                var offsetAX = contactVertex.x - bodyA.position.x,\n                    offsetAY = contactVertex.y - bodyA.position.y,\n                    offsetBX = contactVertex.x - bodyB.position.x,\n                    offsetBY = contactVertex.y - bodyB.position.y;\n \n                var velocityPointAX = bodyAVelocity.x - offsetAY * bodyA.angularVelocity,\n                    velocityPointAY = bodyAVelocity.y + offsetAX * bodyA.angularVelocity,\n                    velocityPointBX = bodyBVelocity.x - offsetBY * bodyB.angularVelocity,\n                    velocityPointBY = bodyBVelocity.y + offsetBX * bodyB.angularVelocity;\n\n                var relativeVelocityX = velocityPointAX - velocityPointBX,\n                    relativeVelocityY = velocityPointAY - velocityPointBY;\n\n                var normalVelocity = normalX * relativeVelocityX + normalY * relativeVelocityY,\n                    tangentVelocity = tangentX * relativeVelocityX + tangentY * relativeVelocityY;\n\n                // coulomb friction\n                var normalOverlap = pair.separation + normalVelocity;\n                var normalForce = Math.min(normalOverlap, 1);\n                normalForce = normalOverlap < 0 ? 0 : normalForce;\n\n                var frictionLimit = normalForce * friction;\n\n                if (tangentVelocity < -frictionLimit || tangentVelocity > frictionLimit) {\n                    maxFriction = (tangentVelocity > 0 ? tangentVelocity : -tangentVelocity);\n                    tangentImpulse = pair.friction * (tangentVelocity > 0 ? 1 : -1) * timeScaleCubed;\n                    \n                    if (tangentImpulse < -maxFriction) {\n                        tangentImpulse = -maxFriction;\n                    } else if (tangentImpulse > maxFriction) {\n                        tangentImpulse = maxFriction;\n                    }\n                } else {\n                    tangentImpulse = tangentVelocity;\n                    maxFriction = frictionMaxStatic;\n                }\n\n                // account for mass, inertia and contact offset\n                var oAcN = offsetAX * normalY - offsetAY * normalX,\n                    oBcN = offsetBX * normalY - offsetBY * normalX,\n                    share = contactShare / (inverseMassTotal + bodyA.inverseInertia * oAcN * oAcN + bodyB.inverseInertia * oBcN * oBcN);\n\n                // raw impulses\n                var normalImpulse = (1 + pair.restitution) * normalVelocity * share;\n                tangentImpulse *= share;\n\n                // handle high velocity and resting collisions separately\n                if (normalVelocity < restingThresh) {\n                    // high normal velocity so clear cached contact normal impulse\n                    contact.normalImpulse = 0;\n                } else {\n                    // solve resting collision constraints using Erin Catto's method (GDC08)\n                    // impulse constraint tends to 0\n                    var contactNormalImpulse = contact.normalImpulse;\n                    contact.normalImpulse += normalImpulse;\n                    if (contact.normalImpulse > 0) contact.normalImpulse = 0;\n                    normalImpulse = contact.normalImpulse - contactNormalImpulse;\n                }\n\n                // handle high velocity and resting collisions separately\n                if (tangentVelocity < -restingThreshTangent || tangentVelocity > restingThreshTangent) {\n                    // high tangent velocity so clear cached contact tangent impulse\n                    contact.tangentImpulse = 0;\n                } else {\n                    // solve resting collision constraints using Erin Catto's method (GDC08)\n                    // tangent impulse tends to -tangentSpeed or +tangentSpeed\n                    var contactTangentImpulse = contact.tangentImpulse;\n                    contact.tangentImpulse += tangentImpulse;\n                    if (contact.tangentImpulse < -maxFriction) contact.tangentImpulse = -maxFriction;\n                    if (contact.tangentImpulse > maxFriction) contact.tangentImpulse = maxFriction;\n                    tangentImpulse = contact.tangentImpulse - contactTangentImpulse;\n                }\n\n                // total impulse from contact\n                var impulseX = normalX * normalImpulse + tangentX * tangentImpulse,\n                    impulseY = normalY * normalImpulse + tangentY * tangentImpulse;\n                \n                // apply impulse from contact\n                if (!(bodyA.isStatic || bodyA.isSleeping)) {\n                    bodyA.positionPrev.x += impulseX * bodyA.inverseMass;\n                    bodyA.positionPrev.y += impulseY * bodyA.inverseMass;\n                    bodyA.anglePrev += (offsetAX * impulseY - offsetAY * impulseX) * bodyA.inverseInertia;\n                }\n\n                if (!(bodyB.isStatic || bodyB.isSleeping)) {\n                    bodyB.positionPrev.x -= impulseX * bodyB.inverseMass;\n                    bodyB.positionPrev.y -= impulseY * bodyB.inverseMass;\n                    bodyB.anglePrev -= (offsetBX * impulseY - offsetBY * impulseX) * bodyB.inverseInertia;\n                }\n            }\n        }\n    };\n\n})();\n\n\n/***/ }),\n/* 19 */\n/***/ (function(module, exports, __nested_webpack_require_238208__) {\n\n/**\n* The `Matter.Pairs` module contains methods for creating and manipulating collision pair sets.\n*\n* @class Pairs\n*/\n\nvar Pairs = {};\n\nmodule.exports = Pairs;\n\nvar Pair = __nested_webpack_require_238208__(9);\nvar Common = __nested_webpack_require_238208__(0);\n\n(function() {\n\n    /**\n     * Creates a new pairs structure.\n     * @method create\n     * @param {object} options\n     * @return {pairs} A new pairs structure\n     */\n    Pairs.create = function(options) {\n        return Common.extend({ \n            table: {},\n            list: [],\n            collisionStart: [],\n            collisionActive: [],\n            collisionEnd: []\n        }, options);\n    };\n\n    /**\n     * Updates pairs given a list of collisions.\n     * @method update\n     * @param {object} pairs\n     * @param {collision[]} collisions\n     * @param {number} timestamp\n     */\n    Pairs.update = function(pairs, collisions, timestamp) {\n        var pairsList = pairs.list,\n            pairsListLength = pairsList.length,\n            pairsTable = pairs.table,\n            collisionsLength = collisions.length,\n            collisionStart = pairs.collisionStart,\n            collisionEnd = pairs.collisionEnd,\n            collisionActive = pairs.collisionActive,\n            collision,\n            pairIndex,\n            pair,\n            i;\n\n        // clear collision state arrays, but maintain old reference\n        collisionStart.length = 0;\n        collisionEnd.length = 0;\n        collisionActive.length = 0;\n\n        for (i = 0; i < pairsListLength; i++) {\n            pairsList[i].confirmedActive = false;\n        }\n\n        for (i = 0; i < collisionsLength; i++) {\n            collision = collisions[i];\n            pair = collision.pair;\n\n            if (pair) {\n                // pair already exists (but may or may not be active)\n                if (pair.isActive) {\n                    // pair exists and is active\n                    collisionActive.push(pair);\n                } else {\n                    // pair exists but was inactive, so a collision has just started again\n                    collisionStart.push(pair);\n                }\n\n                // update the pair\n                Pair.update(pair, collision, timestamp);\n                pair.confirmedActive = true;\n            } else {\n                // pair did not exist, create a new pair\n                pair = Pair.create(collision, timestamp);\n                pairsTable[pair.id] = pair;\n\n                // push the new pair\n                collisionStart.push(pair);\n                pairsList.push(pair);\n            }\n        }\n\n        // find pairs that are no longer active\n        var removePairIndex = [];\n        pairsListLength = pairsList.length;\n\n        for (i = 0; i < pairsListLength; i++) {\n            pair = pairsList[i];\n            \n            if (!pair.confirmedActive) {\n                Pair.setActive(pair, false, timestamp);\n                collisionEnd.push(pair);\n\n                if (!pair.collision.bodyA.isSleeping && !pair.collision.bodyB.isSleeping) {\n                    removePairIndex.push(i);\n                }\n            }\n        }\n\n        // remove inactive pairs\n        for (i = 0; i < removePairIndex.length; i++) {\n            pairIndex = removePairIndex[i] - i;\n            pair = pairsList[pairIndex];\n            pairsList.splice(pairIndex, 1);\n            delete pairsTable[pair.id];\n        }\n    };\n\n    /**\n     * Clears the given pairs structure.\n     * @method clear\n     * @param {pairs} pairs\n     * @return {pairs} pairs\n     */\n    Pairs.clear = function(pairs) {\n        pairs.table = {};\n        pairs.list.length = 0;\n        pairs.collisionStart.length = 0;\n        pairs.collisionActive.length = 0;\n        pairs.collisionEnd.length = 0;\n        return pairs;\n    };\n\n})();\n\n\n/***/ }),\n/* 20 */\n/***/ (function(module, exports, __nested_webpack_require_242061__) {\n\nvar Matter = module.exports = __nested_webpack_require_242061__(21);\r\n\r\nMatter.Axes = __nested_webpack_require_242061__(11);\r\nMatter.Bodies = __nested_webpack_require_242061__(12);\r\nMatter.Body = __nested_webpack_require_242061__(4);\r\nMatter.Bounds = __nested_webpack_require_242061__(1);\r\nMatter.Collision = __nested_webpack_require_242061__(8);\r\nMatter.Common = __nested_webpack_require_242061__(0);\r\nMatter.Composite = __nested_webpack_require_242061__(6);\r\nMatter.Composites = __nested_webpack_require_242061__(22);\r\nMatter.Constraint = __nested_webpack_require_242061__(10);\r\nMatter.Contact = __nested_webpack_require_242061__(16);\r\nMatter.Detector = __nested_webpack_require_242061__(13);\r\nMatter.Engine = __nested_webpack_require_242061__(17);\r\nMatter.Events = __nested_webpack_require_242061__(5);\r\nMatter.Grid = __nested_webpack_require_242061__(23);\r\nMatter.Mouse = __nested_webpack_require_242061__(14);\r\nMatter.MouseConstraint = __nested_webpack_require_242061__(24);\r\nMatter.Pair = __nested_webpack_require_242061__(9);\r\nMatter.Pairs = __nested_webpack_require_242061__(19);\r\nMatter.Plugin = __nested_webpack_require_242061__(15);\r\nMatter.Query = __nested_webpack_require_242061__(25);\r\nMatter.Render = __nested_webpack_require_242061__(26);\r\nMatter.Resolver = __nested_webpack_require_242061__(18);\r\nMatter.Runner = __nested_webpack_require_242061__(27);\r\nMatter.SAT = __nested_webpack_require_242061__(28);\r\nMatter.Sleeping = __nested_webpack_require_242061__(7);\r\nMatter.Svg = __nested_webpack_require_242061__(29);\r\nMatter.Vector = __nested_webpack_require_242061__(2);\r\nMatter.Vertices = __nested_webpack_require_242061__(3);\r\nMatter.World = __nested_webpack_require_242061__(30);\r\n\r\n// temporary back compatibility\r\nMatter.Engine.run = Matter.Runner.run;\r\nMatter.Common.deprecated(Matter.Engine, 'run', 'Engine.run ➤ use Matter.Runner.run(engine) instead');\r\n\n\n/***/ }),\n/* 21 */\n/***/ (function(module, exports, __nested_webpack_require_243597__) {\n\n/**\r\n* The `Matter` module is the top level namespace. It also includes a function for installing plugins on top of the library.\r\n*\r\n* @class Matter\r\n*/\r\n\r\nvar Matter = {};\r\n\r\nmodule.exports = Matter;\r\n\r\nvar Plugin = __nested_webpack_require_243597__(15);\r\nvar Common = __nested_webpack_require_243597__(0);\r\n\r\n(function() {\r\n\r\n    /**\r\n     * The library name.\r\n     * @property name\r\n     * @readOnly\r\n     * @type {String}\r\n     */\r\n    Matter.name = 'matter-js';\r\n\r\n    /**\r\n     * The library version.\r\n     * @property version\r\n     * @readOnly\r\n     * @type {String}\r\n     */\r\n    Matter.version =   true ? \"0.19.0\" : 0;\r\n\r\n    /**\r\n     * A list of plugin dependencies to be installed. These are normally set and installed through `Matter.use`.\r\n     * Alternatively you may set `Matter.uses` manually and install them by calling `Plugin.use(Matter)`.\r\n     * @property uses\r\n     * @type {Array}\r\n     */\r\n    Matter.uses = [];\r\n\r\n    /**\r\n     * The plugins that have been installed through `Matter.Plugin.install`. Read only.\r\n     * @property used\r\n     * @readOnly\r\n     * @type {Array}\r\n     */\r\n    Matter.used = [];\r\n\r\n    /**\r\n     * Installs the given plugins on the `Matter` namespace.\r\n     * This is a short-hand for `Plugin.use`, see it for more information.\r\n     * Call this function once at the start of your code, with all of the plugins you wish to install as arguments.\r\n     * Avoid calling this function multiple times unless you intend to manually control installation order.\r\n     * @method use\r\n     * @param ...plugin {Function} The plugin(s) to install on `base` (multi-argument).\r\n     */\r\n    Matter.use = function() {\r\n        Plugin.use(Matter, Array.prototype.slice.call(arguments));\r\n    };\r\n\r\n    /**\r\n     * Chains a function to excute before the original function on the given `path` relative to `Matter`.\r\n     * See also docs for `Common.chain`.\r\n     * @method before\r\n     * @param {string} path The path relative to `Matter`\r\n     * @param {function} func The function to chain before the original\r\n     * @return {function} The chained function that replaced the original\r\n     */\r\n    Matter.before = function(path, func) {\r\n        path = path.replace(/^Matter./, '');\r\n        return Common.chainPathBefore(Matter, path, func);\r\n    };\r\n\r\n    /**\r\n     * Chains a function to excute after the original function on the given `path` relative to `Matter`.\r\n     * See also docs for `Common.chain`.\r\n     * @method after\r\n     * @param {string} path The path relative to `Matter`\r\n     * @param {function} func The function to chain after the original\r\n     * @return {function} The chained function that replaced the original\r\n     */\r\n    Matter.after = function(path, func) {\r\n        path = path.replace(/^Matter./, '');\r\n        return Common.chainPathAfter(Matter, path, func);\r\n    };\r\n\r\n})();\r\n\n\n/***/ }),\n/* 22 */\n/***/ (function(module, exports, __nested_webpack_require_246505__) {\n\n/**\n* The `Matter.Composites` module contains factory methods for creating composite bodies\n* with commonly used configurations (such as stacks and chains).\n*\n* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).\n*\n* @class Composites\n*/\n\nvar Composites = {};\n\nmodule.exports = Composites;\n\nvar Composite = __nested_webpack_require_246505__(6);\nvar Constraint = __nested_webpack_require_246505__(10);\nvar Common = __nested_webpack_require_246505__(0);\nvar Body = __nested_webpack_require_246505__(4);\nvar Bodies = __nested_webpack_require_246505__(12);\nvar deprecated = Common.deprecated;\n\n(function() {\n\n    /**\n     * Create a new composite containing bodies created in the callback in a grid arrangement.\n     * This function uses the body's bounds to prevent overlaps.\n     * @method stack\n     * @param {number} xx\n     * @param {number} yy\n     * @param {number} columns\n     * @param {number} rows\n     * @param {number} columnGap\n     * @param {number} rowGap\n     * @param {function} callback\n     * @return {composite} A new composite containing objects created in the callback\n     */\n    Composites.stack = function(xx, yy, columns, rows, columnGap, rowGap, callback) {\n        var stack = Composite.create({ label: 'Stack' }),\n            x = xx,\n            y = yy,\n            lastBody,\n            i = 0;\n\n        for (var row = 0; row < rows; row++) {\n            var maxHeight = 0;\n            \n            for (var column = 0; column < columns; column++) {\n                var body = callback(x, y, column, row, lastBody, i);\n                    \n                if (body) {\n                    var bodyHeight = body.bounds.max.y - body.bounds.min.y,\n                        bodyWidth = body.bounds.max.x - body.bounds.min.x; \n\n                    if (bodyHeight > maxHeight)\n                        maxHeight = bodyHeight;\n                    \n                    Body.translate(body, { x: bodyWidth * 0.5, y: bodyHeight * 0.5 });\n\n                    x = body.bounds.max.x + columnGap;\n\n                    Composite.addBody(stack, body);\n                    \n                    lastBody = body;\n                    i += 1;\n                } else {\n                    x += columnGap;\n                }\n            }\n            \n            y += maxHeight + rowGap;\n            x = xx;\n        }\n\n        return stack;\n    };\n    \n    /**\n     * Chains all bodies in the given composite together using constraints.\n     * @method chain\n     * @param {composite} composite\n     * @param {number} xOffsetA\n     * @param {number} yOffsetA\n     * @param {number} xOffsetB\n     * @param {number} yOffsetB\n     * @param {object} options\n     * @return {composite} A new composite containing objects chained together with constraints\n     */\n    Composites.chain = function(composite, xOffsetA, yOffsetA, xOffsetB, yOffsetB, options) {\n        var bodies = composite.bodies;\n        \n        for (var i = 1; i < bodies.length; i++) {\n            var bodyA = bodies[i - 1],\n                bodyB = bodies[i],\n                bodyAHeight = bodyA.bounds.max.y - bodyA.bounds.min.y,\n                bodyAWidth = bodyA.bounds.max.x - bodyA.bounds.min.x, \n                bodyBHeight = bodyB.bounds.max.y - bodyB.bounds.min.y,\n                bodyBWidth = bodyB.bounds.max.x - bodyB.bounds.min.x;\n        \n            var defaults = {\n                bodyA: bodyA,\n                pointA: { x: bodyAWidth * xOffsetA, y: bodyAHeight * yOffsetA },\n                bodyB: bodyB,\n                pointB: { x: bodyBWidth * xOffsetB, y: bodyBHeight * yOffsetB }\n            };\n            \n            var constraint = Common.extend(defaults, options);\n        \n            Composite.addConstraint(composite, Constraint.create(constraint));\n        }\n\n        composite.label += ' Chain';\n        \n        return composite;\n    };\n\n    /**\n     * Connects bodies in the composite with constraints in a grid pattern, with optional cross braces.\n     * @method mesh\n     * @param {composite} composite\n     * @param {number} columns\n     * @param {number} rows\n     * @param {boolean} crossBrace\n     * @param {object} options\n     * @return {composite} The composite containing objects meshed together with constraints\n     */\n    Composites.mesh = function(composite, columns, rows, crossBrace, options) {\n        var bodies = composite.bodies,\n            row,\n            col,\n            bodyA,\n            bodyB,\n            bodyC;\n        \n        for (row = 0; row < rows; row++) {\n            for (col = 1; col < columns; col++) {\n                bodyA = bodies[(col - 1) + (row * columns)];\n                bodyB = bodies[col + (row * columns)];\n                Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyA, bodyB: bodyB }, options)));\n            }\n\n            if (row > 0) {\n                for (col = 0; col < columns; col++) {\n                    bodyA = bodies[col + ((row - 1) * columns)];\n                    bodyB = bodies[col + (row * columns)];\n                    Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyA, bodyB: bodyB }, options)));\n\n                    if (crossBrace && col > 0) {\n                        bodyC = bodies[(col - 1) + ((row - 1) * columns)];\n                        Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyC, bodyB: bodyB }, options)));\n                    }\n\n                    if (crossBrace && col < columns - 1) {\n                        bodyC = bodies[(col + 1) + ((row - 1) * columns)];\n                        Composite.addConstraint(composite, Constraint.create(Common.extend({ bodyA: bodyC, bodyB: bodyB }, options)));\n                    }\n                }\n            }\n        }\n\n        composite.label += ' Mesh';\n        \n        return composite;\n    };\n    \n    /**\n     * Create a new composite containing bodies created in the callback in a pyramid arrangement.\n     * This function uses the body's bounds to prevent overlaps.\n     * @method pyramid\n     * @param {number} xx\n     * @param {number} yy\n     * @param {number} columns\n     * @param {number} rows\n     * @param {number} columnGap\n     * @param {number} rowGap\n     * @param {function} callback\n     * @return {composite} A new composite containing objects created in the callback\n     */\n    Composites.pyramid = function(xx, yy, columns, rows, columnGap, rowGap, callback) {\n        return Composites.stack(xx, yy, columns, rows, columnGap, rowGap, function(x, y, column, row, lastBody, i) {\n            var actualRows = Math.min(rows, Math.ceil(columns / 2)),\n                lastBodyWidth = lastBody ? lastBody.bounds.max.x - lastBody.bounds.min.x : 0;\n            \n            if (row > actualRows)\n                return;\n            \n            // reverse row order\n            row = actualRows - row;\n            \n            var start = row,\n                end = columns - 1 - row;\n\n            if (column < start || column > end)\n                return;\n            \n            // retroactively fix the first body's position, since width was unknown\n            if (i === 1) {\n                Body.translate(lastBody, { x: (column + (columns % 2 === 1 ? 1 : -1)) * lastBodyWidth, y: 0 });\n            }\n\n            var xOffset = lastBody ? column * lastBodyWidth : 0;\n            \n            return callback(xx + xOffset + column * columnGap, y, column, row, lastBody, i);\n        });\n    };\n\n    /**\n     * This has now moved to the [newtonsCradle example](https://github.com/liabru/matter-js/blob/master/examples/newtonsCradle.js), follow that instead as this function is deprecated here.\n     * @deprecated moved to newtonsCradle example\n     * @method newtonsCradle\n     * @param {number} xx\n     * @param {number} yy\n     * @param {number} number\n     * @param {number} size\n     * @param {number} length\n     * @return {composite} A new composite newtonsCradle body\n     */\n    Composites.newtonsCradle = function(xx, yy, number, size, length) {\n        var newtonsCradle = Composite.create({ label: 'Newtons Cradle' });\n\n        for (var i = 0; i < number; i++) {\n            var separation = 1.9,\n                circle = Bodies.circle(xx + i * (size * separation), yy + length, size, \n                    { inertia: Infinity, restitution: 1, friction: 0, frictionAir: 0.0001, slop: 1 }),\n                constraint = Constraint.create({ pointA: { x: xx + i * (size * separation), y: yy }, bodyB: circle });\n\n            Composite.addBody(newtonsCradle, circle);\n            Composite.addConstraint(newtonsCradle, constraint);\n        }\n\n        return newtonsCradle;\n    };\n\n    deprecated(Composites, 'newtonsCradle', 'Composites.newtonsCradle ➤ moved to newtonsCradle example');\n    \n    /**\n     * This has now moved to the [car example](https://github.com/liabru/matter-js/blob/master/examples/car.js), follow that instead as this function is deprecated here.\n     * @deprecated moved to car example\n     * @method car\n     * @param {number} xx\n     * @param {number} yy\n     * @param {number} width\n     * @param {number} height\n     * @param {number} wheelSize\n     * @return {composite} A new composite car body\n     */\n    Composites.car = function(xx, yy, width, height, wheelSize) {\n        var group = Body.nextGroup(true),\n            wheelBase = 20,\n            wheelAOffset = -width * 0.5 + wheelBase,\n            wheelBOffset = width * 0.5 - wheelBase,\n            wheelYOffset = 0;\n    \n        var car = Composite.create({ label: 'Car' }),\n            body = Bodies.rectangle(xx, yy, width, height, { \n                collisionFilter: {\n                    group: group\n                },\n                chamfer: {\n                    radius: height * 0.5\n                },\n                density: 0.0002\n            });\n    \n        var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, { \n            collisionFilter: {\n                group: group\n            },\n            friction: 0.8\n        });\n                    \n        var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, { \n            collisionFilter: {\n                group: group\n            },\n            friction: 0.8\n        });\n                    \n        var axelA = Constraint.create({\n            bodyB: body,\n            pointB: { x: wheelAOffset, y: wheelYOffset },\n            bodyA: wheelA,\n            stiffness: 1,\n            length: 0\n        });\n                        \n        var axelB = Constraint.create({\n            bodyB: body,\n            pointB: { x: wheelBOffset, y: wheelYOffset },\n            bodyA: wheelB,\n            stiffness: 1,\n            length: 0\n        });\n        \n        Composite.addBody(car, body);\n        Composite.addBody(car, wheelA);\n        Composite.addBody(car, wheelB);\n        Composite.addConstraint(car, axelA);\n        Composite.addConstraint(car, axelB);\n\n        return car;\n    };\n\n    deprecated(Composites, 'car', 'Composites.car ➤ moved to car example');\n\n    /**\n     * This has now moved to the [softBody example](https://github.com/liabru/matter-js/blob/master/examples/softBody.js)\n     * and the [cloth example](https://github.com/liabru/matter-js/blob/master/examples/cloth.js), follow those instead as this function is deprecated here.\n     * @deprecated moved to softBody and cloth examples\n     * @method softBody\n     * @param {number} xx\n     * @param {number} yy\n     * @param {number} columns\n     * @param {number} rows\n     * @param {number} columnGap\n     * @param {number} rowGap\n     * @param {boolean} crossBrace\n     * @param {number} particleRadius\n     * @param {} particleOptions\n     * @param {} constraintOptions\n     * @return {composite} A new composite softBody\n     */\n    Composites.softBody = function(xx, yy, columns, rows, columnGap, rowGap, crossBrace, particleRadius, particleOptions, constraintOptions) {\n        particleOptions = Common.extend({ inertia: Infinity }, particleOptions);\n        constraintOptions = Common.extend({ stiffness: 0.2, render: { type: 'line', anchors: false } }, constraintOptions);\n\n        var softBody = Composites.stack(xx, yy, columns, rows, columnGap, rowGap, function(x, y) {\n            return Bodies.circle(x, y, particleRadius, particleOptions);\n        });\n\n        Composites.mesh(softBody, columns, rows, crossBrace, constraintOptions);\n\n        softBody.label = 'Soft Body';\n\n        return softBody;\n    };\n\n    deprecated(Composites, 'softBody', 'Composites.softBody ➤ moved to softBody and cloth examples');\n})();\n\n\n/***/ }),\n/* 23 */\n/***/ (function(module, exports, __nested_webpack_require_259115__) {\n\n/**\n* This module has now been replaced by `Matter.Detector`.\n*\n* All usage should be migrated to `Matter.Detector` or another alternative.\n* For back-compatibility purposes this module will remain for a short term and then later removed in a future release.\n*\n* The `Matter.Grid` module contains methods for creating and manipulating collision broadphase grid structures.\n*\n* @class Grid\n* @deprecated\n*/\n\nvar Grid = {};\n\nmodule.exports = Grid;\n\nvar Pair = __nested_webpack_require_259115__(9);\nvar Common = __nested_webpack_require_259115__(0);\nvar deprecated = Common.deprecated;\n\n(function() {\n\n    /**\n     * Creates a new grid.\n     * @deprecated replaced by Matter.Detector\n     * @method create\n     * @param {} options\n     * @return {grid} A new grid\n     */\n    Grid.create = function(options) {\n        var defaults = {\n            buckets: {},\n            pairs: {},\n            pairsList: [],\n            bucketWidth: 48,\n            bucketHeight: 48\n        };\n\n        return Common.extend(defaults, options);\n    };\n\n    /**\n     * The width of a single grid bucket.\n     *\n     * @property bucketWidth\n     * @type number\n     * @default 48\n     */\n\n    /**\n     * The height of a single grid bucket.\n     *\n     * @property bucketHeight\n     * @type number\n     * @default 48\n     */\n\n    /**\n     * Updates the grid.\n     * @deprecated replaced by Matter.Detector\n     * @method update\n     * @param {grid} grid\n     * @param {body[]} bodies\n     * @param {engine} engine\n     * @param {boolean} forceUpdate\n     */\n    Grid.update = function(grid, bodies, engine, forceUpdate) {\n        var i, col, row,\n            world = engine.world,\n            buckets = grid.buckets,\n            bucket,\n            bucketId,\n            gridChanged = false;\n\n        for (i = 0; i < bodies.length; i++) {\n            var body = bodies[i];\n\n            if (body.isSleeping && !forceUpdate)\n                continue;\n\n            // temporary back compatibility bounds check\n            if (world.bounds && (body.bounds.max.x < world.bounds.min.x || body.bounds.min.x > world.bounds.max.x\n                || body.bounds.max.y < world.bounds.min.y || body.bounds.min.y > world.bounds.max.y))\n                continue;\n\n            var newRegion = Grid._getRegion(grid, body);\n\n            // if the body has changed grid region\n            if (!body.region || newRegion.id !== body.region.id || forceUpdate) {\n\n                if (!body.region || forceUpdate)\n                    body.region = newRegion;\n\n                var union = Grid._regionUnion(newRegion, body.region);\n\n                // update grid buckets affected by region change\n                // iterate over the union of both regions\n                for (col = union.startCol; col <= union.endCol; col++) {\n                    for (row = union.startRow; row <= union.endRow; row++) {\n                        bucketId = Grid._getBucketId(col, row);\n                        bucket = buckets[bucketId];\n\n                        var isInsideNewRegion = (col >= newRegion.startCol && col <= newRegion.endCol\n                                                && row >= newRegion.startRow && row <= newRegion.endRow);\n\n                        var isInsideOldRegion = (col >= body.region.startCol && col <= body.region.endCol\n                                                && row >= body.region.startRow && row <= body.region.endRow);\n\n                        // remove from old region buckets\n                        if (!isInsideNewRegion && isInsideOldRegion) {\n                            if (isInsideOldRegion) {\n                                if (bucket)\n                                    Grid._bucketRemoveBody(grid, bucket, body);\n                            }\n                        }\n\n                        // add to new region buckets\n                        if (body.region === newRegion || (isInsideNewRegion && !isInsideOldRegion) || forceUpdate) {\n                            if (!bucket)\n                                bucket = Grid._createBucket(buckets, bucketId);\n                            Grid._bucketAddBody(grid, bucket, body);\n                        }\n                    }\n                }\n\n                // set the new region\n                body.region = newRegion;\n\n                // flag changes so we can update pairs\n                gridChanged = true;\n            }\n        }\n\n        // update pairs list only if pairs changed (i.e. a body changed region)\n        if (gridChanged)\n            grid.pairsList = Grid._createActivePairsList(grid);\n    };\n\n    deprecated(Grid, 'update', 'Grid.update ➤ replaced by Matter.Detector');\n\n    /**\n     * Clears the grid.\n     * @deprecated replaced by Matter.Detector\n     * @method clear\n     * @param {grid} grid\n     */\n    Grid.clear = function(grid) {\n        grid.buckets = {};\n        grid.pairs = {};\n        grid.pairsList = [];\n    };\n\n    deprecated(Grid, 'clear', 'Grid.clear ➤ replaced by Matter.Detector');\n\n    /**\n     * Finds the union of two regions.\n     * @method _regionUnion\n     * @deprecated replaced by Matter.Detector\n     * @private\n     * @param {} regionA\n     * @param {} regionB\n     * @return {} region\n     */\n    Grid._regionUnion = function(regionA, regionB) {\n        var startCol = Math.min(regionA.startCol, regionB.startCol),\n            endCol = Math.max(regionA.endCol, regionB.endCol),\n            startRow = Math.min(regionA.startRow, regionB.startRow),\n            endRow = Math.max(regionA.endRow, regionB.endRow);\n\n        return Grid._createRegion(startCol, endCol, startRow, endRow);\n    };\n\n    /**\n     * Gets the region a given body falls in for a given grid.\n     * @method _getRegion\n     * @deprecated replaced by Matter.Detector\n     * @private\n     * @param {} grid\n     * @param {} body\n     * @return {} region\n     */\n    Grid._getRegion = function(grid, body) {\n        var bounds = body.bounds,\n            startCol = Math.floor(bounds.min.x / grid.bucketWidth),\n            endCol = Math.floor(bounds.max.x / grid.bucketWidth),\n            startRow = Math.floor(bounds.min.y / grid.bucketHeight),\n            endRow = Math.floor(bounds.max.y / grid.bucketHeight);\n\n        return Grid._createRegion(startCol, endCol, startRow, endRow);\n    };\n\n    /**\n     * Creates a region.\n     * @method _createRegion\n     * @deprecated replaced by Matter.Detector\n     * @private\n     * @param {} startCol\n     * @param {} endCol\n     * @param {} startRow\n     * @param {} endRow\n     * @return {} region\n     */\n    Grid._createRegion = function(startCol, endCol, startRow, endRow) {\n        return { \n            id: startCol + ',' + endCol + ',' + startRow + ',' + endRow,\n            startCol: startCol, \n            endCol: endCol, \n            startRow: startRow, \n            endRow: endRow \n        };\n    };\n\n    /**\n     * Gets the bucket id at the given position.\n     * @method _getBucketId\n     * @deprecated replaced by Matter.Detector\n     * @private\n     * @param {} column\n     * @param {} row\n     * @return {string} bucket id\n     */\n    Grid._getBucketId = function(column, row) {\n        return 'C' + column + 'R' + row;\n    };\n\n    /**\n     * Creates a bucket.\n     * @method _createBucket\n     * @deprecated replaced by Matter.Detector\n     * @private\n     * @param {} buckets\n     * @param {} bucketId\n     * @return {} bucket\n     */\n    Grid._createBucket = function(buckets, bucketId) {\n        var bucket = buckets[bucketId] = [];\n        return bucket;\n    };\n\n    /**\n     * Adds a body to a bucket.\n     * @method _bucketAddBody\n     * @deprecated replaced by Matter.Detector\n     * @private\n     * @param {} grid\n     * @param {} bucket\n     * @param {} body\n     */\n    Grid._bucketAddBody = function(grid, bucket, body) {\n        var gridPairs = grid.pairs,\n            pairId = Pair.id,\n            bucketLength = bucket.length,\n            i;\n\n        // add new pairs\n        for (i = 0; i < bucketLength; i++) {\n            var bodyB = bucket[i];\n\n            if (body.id === bodyB.id || (body.isStatic && bodyB.isStatic))\n                continue;\n\n            // keep track of the number of buckets the pair exists in\n            // important for Grid.update to work\n            var id = pairId(body, bodyB),\n                pair = gridPairs[id];\n\n            if (pair) {\n                pair[2] += 1;\n            } else {\n                gridPairs[id] = [body, bodyB, 1];\n            }\n        }\n\n        // add to bodies (after pairs, otherwise pairs with self)\n        bucket.push(body);\n    };\n\n    /**\n     * Removes a body from a bucket.\n     * @method _bucketRemoveBody\n     * @deprecated replaced by Matter.Detector\n     * @private\n     * @param {} grid\n     * @param {} bucket\n     * @param {} body\n     */\n    Grid._bucketRemoveBody = function(grid, bucket, body) {\n        var gridPairs = grid.pairs,\n            pairId = Pair.id,\n            i;\n\n        // remove from bucket\n        bucket.splice(Common.indexOf(bucket, body), 1);\n\n        var bucketLength = bucket.length;\n\n        // update pair counts\n        for (i = 0; i < bucketLength; i++) {\n            // keep track of the number of buckets the pair exists in\n            // important for _createActivePairsList to work\n            var pair = gridPairs[pairId(body, bucket[i])];\n\n            if (pair)\n                pair[2] -= 1;\n        }\n    };\n\n    /**\n     * Generates a list of the active pairs in the grid.\n     * @method _createActivePairsList\n     * @deprecated replaced by Matter.Detector\n     * @private\n     * @param {} grid\n     * @return [] pairs\n     */\n    Grid._createActivePairsList = function(grid) {\n        var pair,\n            gridPairs = grid.pairs,\n            pairKeys = Common.keys(gridPairs),\n            pairKeysLength = pairKeys.length,\n            pairs = [],\n            k;\n\n        // iterate over grid.pairs\n        for (k = 0; k < pairKeysLength; k++) {\n            pair = gridPairs[pairKeys[k]];\n\n            // if pair exists in at least one bucket\n            // it is a pair that needs further collision testing so push it\n            if (pair[2] > 0) {\n                pairs.push(pair);\n            } else {\n                delete gridPairs[pairKeys[k]];\n            }\n        }\n\n        return pairs;\n    };\n    \n})();\n\n\n/***/ }),\n/* 24 */\n/***/ (function(module, exports, __nested_webpack_require_269445__) {\n\n/**\n* The `Matter.MouseConstraint` module contains methods for creating mouse constraints.\n* Mouse constraints are used for allowing user interaction, providing the ability to move bodies via the mouse or touch.\n*\n* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).\n*\n* @class MouseConstraint\n*/\n\nvar MouseConstraint = {};\n\nmodule.exports = MouseConstraint;\n\nvar Vertices = __nested_webpack_require_269445__(3);\nvar Sleeping = __nested_webpack_require_269445__(7);\nvar Mouse = __nested_webpack_require_269445__(14);\nvar Events = __nested_webpack_require_269445__(5);\nvar Detector = __nested_webpack_require_269445__(13);\nvar Constraint = __nested_webpack_require_269445__(10);\nvar Composite = __nested_webpack_require_269445__(6);\nvar Common = __nested_webpack_require_269445__(0);\nvar Bounds = __nested_webpack_require_269445__(1);\n\n(function() {\n\n    /**\n     * Creates a new mouse constraint.\n     * All properties have default values, and many are pre-calculated automatically based on other properties.\n     * See the properties section below for detailed information on what you can pass via the `options` object.\n     * @method create\n     * @param {engine} engine\n     * @param {} options\n     * @return {MouseConstraint} A new MouseConstraint\n     */\n    MouseConstraint.create = function(engine, options) {\n        var mouse = (engine ? engine.mouse : null) || (options ? options.mouse : null);\n\n        if (!mouse) {\n            if (engine && engine.render && engine.render.canvas) {\n                mouse = Mouse.create(engine.render.canvas);\n            } else if (options && options.element) {\n                mouse = Mouse.create(options.element);\n            } else {\n                mouse = Mouse.create();\n                Common.warn('MouseConstraint.create: options.mouse was undefined, options.element was undefined, may not function as expected');\n            }\n        }\n\n        var constraint = Constraint.create({ \n            label: 'Mouse Constraint',\n            pointA: mouse.position,\n            pointB: { x: 0, y: 0 },\n            length: 0.01, \n            stiffness: 0.1,\n            angularStiffness: 1,\n            render: {\n                strokeStyle: '#90EE90',\n                lineWidth: 3\n            }\n        });\n\n        var defaults = {\n            type: 'mouseConstraint',\n            mouse: mouse,\n            element: null,\n            body: null,\n            constraint: constraint,\n            collisionFilter: {\n                category: 0x0001,\n                mask: 0xFFFFFFFF,\n                group: 0\n            }\n        };\n\n        var mouseConstraint = Common.extend(defaults, options);\n\n        Events.on(engine, 'beforeUpdate', function() {\n            var allBodies = Composite.allBodies(engine.world);\n            MouseConstraint.update(mouseConstraint, allBodies);\n            MouseConstraint._triggerEvents(mouseConstraint);\n        });\n\n        return mouseConstraint;\n    };\n\n    /**\n     * Updates the given mouse constraint.\n     * @private\n     * @method update\n     * @param {MouseConstraint} mouseConstraint\n     * @param {body[]} bodies\n     */\n    MouseConstraint.update = function(mouseConstraint, bodies) {\n        var mouse = mouseConstraint.mouse,\n            constraint = mouseConstraint.constraint,\n            body = mouseConstraint.body;\n\n        if (mouse.button === 0) {\n            if (!constraint.bodyB) {\n                for (var i = 0; i < bodies.length; i++) {\n                    body = bodies[i];\n                    if (Bounds.contains(body.bounds, mouse.position) \n                            && Detector.canCollide(body.collisionFilter, mouseConstraint.collisionFilter)) {\n                        for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {\n                            var part = body.parts[j];\n                            if (Vertices.contains(part.vertices, mouse.position)) {\n                                constraint.pointA = mouse.position;\n                                constraint.bodyB = mouseConstraint.body = body;\n                                constraint.pointB = { x: mouse.position.x - body.position.x, y: mouse.position.y - body.position.y };\n                                constraint.angleB = body.angle;\n\n                                Sleeping.set(body, false);\n                                Events.trigger(mouseConstraint, 'startdrag', { mouse: mouse, body: body });\n\n                                break;\n                            }\n                        }\n                    }\n                }\n            } else {\n                Sleeping.set(constraint.bodyB, false);\n                constraint.pointA = mouse.position;\n            }\n        } else {\n            constraint.bodyB = mouseConstraint.body = null;\n            constraint.pointB = null;\n\n            if (body)\n                Events.trigger(mouseConstraint, 'enddrag', { mouse: mouse, body: body });\n        }\n    };\n\n    /**\n     * Triggers mouse constraint events.\n     * @method _triggerEvents\n     * @private\n     * @param {mouse} mouseConstraint\n     */\n    MouseConstraint._triggerEvents = function(mouseConstraint) {\n        var mouse = mouseConstraint.mouse,\n            mouseEvents = mouse.sourceEvents;\n\n        if (mouseEvents.mousemove)\n            Events.trigger(mouseConstraint, 'mousemove', { mouse: mouse });\n\n        if (mouseEvents.mousedown)\n            Events.trigger(mouseConstraint, 'mousedown', { mouse: mouse });\n\n        if (mouseEvents.mouseup)\n            Events.trigger(mouseConstraint, 'mouseup', { mouse: mouse });\n\n        // reset the mouse state ready for the next step\n        Mouse.clearSourceEvents(mouse);\n    };\n\n    /*\n    *\n    *  Events Documentation\n    *\n    */\n\n    /**\n    * Fired when the mouse has moved (or a touch moves) during the last step\n    *\n    * @event mousemove\n    * @param {} event An event object\n    * @param {mouse} event.mouse The engine's mouse instance\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /**\n    * Fired when the mouse is down (or a touch has started) during the last step\n    *\n    * @event mousedown\n    * @param {} event An event object\n    * @param {mouse} event.mouse The engine's mouse instance\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /**\n    * Fired when the mouse is up (or a touch has ended) during the last step\n    *\n    * @event mouseup\n    * @param {} event An event object\n    * @param {mouse} event.mouse The engine's mouse instance\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /**\n    * Fired when the user starts dragging a body\n    *\n    * @event startdrag\n    * @param {} event An event object\n    * @param {mouse} event.mouse The engine's mouse instance\n    * @param {body} event.body The body being dragged\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /**\n    * Fired when the user ends dragging a body\n    *\n    * @event enddrag\n    * @param {} event An event object\n    * @param {mouse} event.mouse The engine's mouse instance\n    * @param {body} event.body The body that has stopped being dragged\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /*\n    *\n    *  Properties Documentation\n    *\n    */\n\n    /**\n     * A `String` denoting the type of object.\n     *\n     * @property type\n     * @type string\n     * @default \"constraint\"\n     * @readOnly\n     */\n\n    /**\n     * The `Mouse` instance in use. If not supplied in `MouseConstraint.create`, one will be created.\n     *\n     * @property mouse\n     * @type mouse\n     * @default mouse\n     */\n\n    /**\n     * The `Body` that is currently being moved by the user, or `null` if no body.\n     *\n     * @property body\n     * @type body\n     * @default null\n     */\n\n    /**\n     * The `Constraint` object that is used to move the body during interaction.\n     *\n     * @property constraint\n     * @type constraint\n     */\n\n    /**\n     * An `Object` that specifies the collision filter properties.\n     * The collision filter allows the user to define which types of body this mouse constraint can interact with.\n     * See `body.collisionFilter` for more information.\n     *\n     * @property collisionFilter\n     * @type object\n     */\n\n})();\n\n\n/***/ }),\n/* 25 */\n/***/ (function(module, exports, __nested_webpack_require_277940__) {\n\n/**\n* The `Matter.Query` module contains methods for performing collision queries.\n*\n* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).\n*\n* @class Query\n*/\n\nvar Query = {};\n\nmodule.exports = Query;\n\nvar Vector = __nested_webpack_require_277940__(2);\nvar Collision = __nested_webpack_require_277940__(8);\nvar Bounds = __nested_webpack_require_277940__(1);\nvar Bodies = __nested_webpack_require_277940__(12);\nvar Vertices = __nested_webpack_require_277940__(3);\n\n(function() {\n\n    /**\n     * Returns a list of collisions between `body` and `bodies`.\n     * @method collides\n     * @param {body} body\n     * @param {body[]} bodies\n     * @return {collision[]} Collisions\n     */\n    Query.collides = function(body, bodies) {\n        var collisions = [],\n            bodiesLength = bodies.length,\n            bounds = body.bounds,\n            collides = Collision.collides,\n            overlaps = Bounds.overlaps;\n\n        for (var i = 0; i < bodiesLength; i++) {\n            var bodyA = bodies[i],\n                partsALength = bodyA.parts.length,\n                partsAStart = partsALength === 1 ? 0 : 1;\n            \n            if (overlaps(bodyA.bounds, bounds)) {\n                for (var j = partsAStart; j < partsALength; j++) {\n                    var part = bodyA.parts[j];\n\n                    if (overlaps(part.bounds, bounds)) {\n                        var collision = collides(part, body);\n\n                        if (collision) {\n                            collisions.push(collision);\n                            break;\n                        }\n                    }\n                }\n            }\n        }\n\n        return collisions;\n    };\n\n    /**\n     * Casts a ray segment against a set of bodies and returns all collisions, ray width is optional. Intersection points are not provided.\n     * @method ray\n     * @param {body[]} bodies\n     * @param {vector} startPoint\n     * @param {vector} endPoint\n     * @param {number} [rayWidth]\n     * @return {collision[]} Collisions\n     */\n    Query.ray = function(bodies, startPoint, endPoint, rayWidth) {\n        rayWidth = rayWidth || 1e-100;\n\n        var rayAngle = Vector.angle(startPoint, endPoint),\n            rayLength = Vector.magnitude(Vector.sub(startPoint, endPoint)),\n            rayX = (endPoint.x + startPoint.x) * 0.5,\n            rayY = (endPoint.y + startPoint.y) * 0.5,\n            ray = Bodies.rectangle(rayX, rayY, rayLength, rayWidth, { angle: rayAngle }),\n            collisions = Query.collides(ray, bodies);\n\n        for (var i = 0; i < collisions.length; i += 1) {\n            var collision = collisions[i];\n            collision.body = collision.bodyB = collision.bodyA;            \n        }\n\n        return collisions;\n    };\n\n    /**\n     * Returns all bodies whose bounds are inside (or outside if set) the given set of bounds, from the given set of bodies.\n     * @method region\n     * @param {body[]} bodies\n     * @param {bounds} bounds\n     * @param {bool} [outside=false]\n     * @return {body[]} The bodies matching the query\n     */\n    Query.region = function(bodies, bounds, outside) {\n        var result = [];\n\n        for (var i = 0; i < bodies.length; i++) {\n            var body = bodies[i],\n                overlaps = Bounds.overlaps(body.bounds, bounds);\n            if ((overlaps && !outside) || (!overlaps && outside))\n                result.push(body);\n        }\n\n        return result;\n    };\n\n    /**\n     * Returns all bodies whose vertices contain the given point, from the given set of bodies.\n     * @method point\n     * @param {body[]} bodies\n     * @param {vector} point\n     * @return {body[]} The bodies matching the query\n     */\n    Query.point = function(bodies, point) {\n        var result = [];\n\n        for (var i = 0; i < bodies.length; i++) {\n            var body = bodies[i];\n            \n            if (Bounds.contains(body.bounds, point)) {\n                for (var j = body.parts.length === 1 ? 0 : 1; j < body.parts.length; j++) {\n                    var part = body.parts[j];\n\n                    if (Bounds.contains(part.bounds, point)\n                        && Vertices.contains(part.vertices, point)) {\n                        result.push(body);\n                        break;\n                    }\n                }\n            }\n        }\n\n        return result;\n    };\n\n})();\n\n\n/***/ }),\n/* 26 */\n/***/ (function(module, exports, __nested_webpack_require_282315__) {\n\n/**\n* The `Matter.Render` module is a simple canvas based renderer for visualising instances of `Matter.Engine`.\n* It is intended for development and debugging purposes, but may also be suitable for simple games.\n* It includes a number of drawing options including wireframe, vector with support for sprites and viewports.\n*\n* @class Render\n*/\n\nvar Render = {};\n\nmodule.exports = Render;\n\nvar Body = __nested_webpack_require_282315__(4);\nvar Common = __nested_webpack_require_282315__(0);\nvar Composite = __nested_webpack_require_282315__(6);\nvar Bounds = __nested_webpack_require_282315__(1);\nvar Events = __nested_webpack_require_282315__(5);\nvar Vector = __nested_webpack_require_282315__(2);\nvar Mouse = __nested_webpack_require_282315__(14);\n\n(function() {\n\n    var _requestAnimationFrame,\n        _cancelAnimationFrame;\n\n    if (typeof window !== 'undefined') {\n        _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame\n                                      || window.mozRequestAnimationFrame || window.msRequestAnimationFrame\n                                      || function(callback){ window.setTimeout(function() { try{callback(Common.now());}catch(e){console.error(e);} }, 1000 / 60); };\n\n        _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame\n                                      || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;\n    }\n\n    Render._goodFps = 30;\n    Render._goodDelta = 1000 / 60;\n\n    /**\n     * Creates a new renderer. The options parameter is an object that specifies any properties you wish to override the defaults.\n     * All properties have default values, and many are pre-calculated automatically based on other properties.\n     * See the properties section below for detailed information on what you can pass via the `options` object.\n     * @method create\n     * @param {object} [options]\n     * @return {render} A new renderer\n     */\n    Render.create = function(options) {\n        var defaults = {\n            engine: null,\n            element: null,\n            canvas: null,\n            mouse: null,\n            frameRequestId: null,\n            timing: {\n                historySize: 60,\n                delta: 0,\n                deltaHistory: [],\n                lastTime: 0,\n                lastTimestamp: 0,\n                lastElapsed: 0,\n                timestampElapsed: 0,\n                timestampElapsedHistory: [],\n                engineDeltaHistory: [],\n                engineElapsedHistory: [],\n                elapsedHistory: []\n            },\n            options: {\n                width: 800,\n                height: 600,\n                pixelRatio: 1,\n                background: '#14151f',\n                wireframeBackground: '#14151f',\n                hasBounds: !!options.bounds,\n                enabled: true,\n                wireframes: true,\n                showSleeping: true,\n                showDebug: false,\n                showStats: false,\n                showPerformance: false,\n                showBounds: false,\n                showVelocity: false,\n                showCollisions: false,\n                showSeparations: false,\n                showAxes: false,\n                showPositions: false,\n                showAngleIndicator: false,\n                showIds: false,\n                showVertexNumbers: false,\n                showConvexHulls: false,\n                showInternalEdges: false,\n                showMousePosition: false\n            }\n        };\n\n        var render = Common.extend(defaults, options);\n\n        if (render.canvas) {\n            render.canvas.width = render.options.width || render.canvas.width;\n            render.canvas.height = render.options.height || render.canvas.height;\n        }\n\n        render.mouse = options.mouse;\n        render.engine = options.engine;\n        render.canvas = render.canvas || _createCanvas(render.options.width, render.options.height);\n        render.context = render.canvas.getContext('2d');\n        render.textures = {};\n\n        render.bounds = render.bounds || {\n            min: {\n                x: 0,\n                y: 0\n            },\n            max: {\n                x: render.canvas.width,\n                y: render.canvas.height\n            }\n        };\n\n        // for temporary back compatibility only\n        render.controller = Render;\n        render.options.showBroadphase = false;\n\n        if (render.options.pixelRatio !== 1) {\n            Render.setPixelRatio(render, render.options.pixelRatio);\n        }\n\n        if (Common.isElement(render.element)) {\n            render.element.appendChild(render.canvas);\n        }\n\n        return render;\n    };\n\n    /**\n     * Continuously updates the render canvas on the `requestAnimationFrame` event.\n     * @method run\n     * @param {render} render\n     */\n    Render.run = function(render) {\n        (function loop(time){\n            render.frameRequestId = _requestAnimationFrame(loop);\n            \n            _updateTiming(render, time);\n\n            Render.world(render, time);\n\n            if (render.options.showStats || render.options.showDebug) {\n                Render.stats(render, render.context, time);\n            }\n\n            if (render.options.showPerformance || render.options.showDebug) {\n                Render.performance(render, render.context, time);\n            }\n        })();\n    };\n\n    /**\n     * Ends execution of `Render.run` on the given `render`, by canceling the animation frame request event loop.\n     * @method stop\n     * @param {render} render\n     */\n    Render.stop = function(render) {\n        _cancelAnimationFrame(render.frameRequestId);\n    };\n\n    /**\n     * Sets the pixel ratio of the renderer and updates the canvas.\n     * To automatically detect the correct ratio, pass the string `'auto'` for `pixelRatio`.\n     * @method setPixelRatio\n     * @param {render} render\n     * @param {number} pixelRatio\n     */\n    Render.setPixelRatio = function(render, pixelRatio) {\n        var options = render.options,\n            canvas = render.canvas;\n\n        if (pixelRatio === 'auto') {\n            pixelRatio = _getPixelRatio(canvas);\n        }\n\n        options.pixelRatio = pixelRatio;\n        canvas.setAttribute('data-pixel-ratio', pixelRatio);\n        canvas.width = options.width * pixelRatio;\n        canvas.height = options.height * pixelRatio;\n        canvas.style.width = options.width + 'px';\n        canvas.style.height = options.height + 'px';\n    };\n\n    /**\n     * Positions and sizes the viewport around the given object bounds.\n     * Objects must have at least one of the following properties:\n     * - `object.bounds`\n     * - `object.position`\n     * - `object.min` and `object.max`\n     * - `object.x` and `object.y`\n     * @method lookAt\n     * @param {render} render\n     * @param {object[]} objects\n     * @param {vector} [padding]\n     * @param {bool} [center=true]\n     */\n    Render.lookAt = function(render, objects, padding, center) {\n        center = typeof center !== 'undefined' ? center : true;\n        objects = Common.isArray(objects) ? objects : [objects];\n        padding = padding || {\n            x: 0,\n            y: 0\n        };\n\n        // find bounds of all objects\n        var bounds = {\n            min: { x: Infinity, y: Infinity },\n            max: { x: -Infinity, y: -Infinity }\n        };\n\n        for (var i = 0; i < objects.length; i += 1) {\n            var object = objects[i],\n                min = object.bounds ? object.bounds.min : (object.min || object.position || object),\n                max = object.bounds ? object.bounds.max : (object.max || object.position || object);\n\n            if (min && max) {\n                if (min.x < bounds.min.x)\n                    bounds.min.x = min.x;\n\n                if (max.x > bounds.max.x)\n                    bounds.max.x = max.x;\n\n                if (min.y < bounds.min.y)\n                    bounds.min.y = min.y;\n\n                if (max.y > bounds.max.y)\n                    bounds.max.y = max.y;\n            }\n        }\n\n        // find ratios\n        var width = (bounds.max.x - bounds.min.x) + 2 * padding.x,\n            height = (bounds.max.y - bounds.min.y) + 2 * padding.y,\n            viewHeight = render.canvas.height,\n            viewWidth = render.canvas.width,\n            outerRatio = viewWidth / viewHeight,\n            innerRatio = width / height,\n            scaleX = 1,\n            scaleY = 1;\n\n        // find scale factor\n        if (innerRatio > outerRatio) {\n            scaleY = innerRatio / outerRatio;\n        } else {\n            scaleX = outerRatio / innerRatio;\n        }\n\n        // enable bounds\n        render.options.hasBounds = true;\n\n        // position and size\n        render.bounds.min.x = bounds.min.x;\n        render.bounds.max.x = bounds.min.x + width * scaleX;\n        render.bounds.min.y = bounds.min.y;\n        render.bounds.max.y = bounds.min.y + height * scaleY;\n\n        // center\n        if (center) {\n            render.bounds.min.x += width * 0.5 - (width * scaleX) * 0.5;\n            render.bounds.max.x += width * 0.5 - (width * scaleX) * 0.5;\n            render.bounds.min.y += height * 0.5 - (height * scaleY) * 0.5;\n            render.bounds.max.y += height * 0.5 - (height * scaleY) * 0.5;\n        }\n\n        // padding\n        render.bounds.min.x -= padding.x;\n        render.bounds.max.x -= padding.x;\n        render.bounds.min.y -= padding.y;\n        render.bounds.max.y -= padding.y;\n\n        // update mouse\n        if (render.mouse) {\n            Mouse.setScale(render.mouse, {\n                x: (render.bounds.max.x - render.bounds.min.x) / render.canvas.width,\n                y: (render.bounds.max.y - render.bounds.min.y) / render.canvas.height\n            });\n\n            Mouse.setOffset(render.mouse, render.bounds.min);\n        }\n    };\n\n    /**\n     * Applies viewport transforms based on `render.bounds` to a render context.\n     * @method startViewTransform\n     * @param {render} render\n     */\n    Render.startViewTransform = function(render) {\n        var boundsWidth = render.bounds.max.x - render.bounds.min.x,\n            boundsHeight = render.bounds.max.y - render.bounds.min.y,\n            boundsScaleX = boundsWidth / render.options.width,\n            boundsScaleY = boundsHeight / render.options.height;\n\n        render.context.setTransform(\n            render.options.pixelRatio / boundsScaleX, 0, 0, \n            render.options.pixelRatio / boundsScaleY, 0, 0\n        );\n        \n        render.context.translate(-render.bounds.min.x, -render.bounds.min.y);\n    };\n\n    /**\n     * Resets all transforms on the render context.\n     * @method endViewTransform\n     * @param {render} render\n     */\n    Render.endViewTransform = function(render) {\n        render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);\n    };\n\n    /**\n     * Renders the given `engine`'s `Matter.World` object.\n     * This is the entry point for all rendering and should be called every time the scene changes.\n     * @method world\n     * @param {render} render\n     */\n    Render.world = function(render, time) {\n        var startTime = Common.now(),\n            engine = render.engine,\n            world = engine.world,\n            canvas = render.canvas,\n            context = render.context,\n            options = render.options,\n            timing = render.timing;\n\n        var allBodies = Composite.allBodies(world),\n            allConstraints = Composite.allConstraints(world),\n            background = options.wireframes ? options.wireframeBackground : options.background,\n            bodies = [],\n            constraints = [],\n            i;\n\n        var event = {\n            timestamp: engine.timing.timestamp\n        };\n\n        Events.trigger(render, 'beforeRender', event);\n\n        // apply background if it has changed\n        if (render.currentBackground !== background)\n            _applyBackground(render, background);\n\n        // clear the canvas with a transparent fill, to allow the canvas background to show\n        context.globalCompositeOperation = 'source-in';\n        context.fillStyle = \"transparent\";\n        context.fillRect(0, 0, canvas.width, canvas.height);\n        context.globalCompositeOperation = 'source-over';\n\n        // handle bounds\n        if (options.hasBounds) {\n            // filter out bodies that are not in view\n            for (i = 0; i < allBodies.length; i++) {\n                var body = allBodies[i];\n                if (Bounds.overlaps(body.bounds, render.bounds))\n                    bodies.push(body);\n            }\n\n            // filter out constraints that are not in view\n            for (i = 0; i < allConstraints.length; i++) {\n                var constraint = allConstraints[i],\n                    bodyA = constraint.bodyA,\n                    bodyB = constraint.bodyB,\n                    pointAWorld = constraint.pointA,\n                    pointBWorld = constraint.pointB;\n\n                if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);\n                if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);\n\n                if (!pointAWorld || !pointBWorld)\n                    continue;\n\n                if (Bounds.contains(render.bounds, pointAWorld) || Bounds.contains(render.bounds, pointBWorld))\n                    constraints.push(constraint);\n            }\n\n            // transform the view\n            Render.startViewTransform(render);\n\n            // update mouse\n            if (render.mouse) {\n                Mouse.setScale(render.mouse, {\n                    x: (render.bounds.max.x - render.bounds.min.x) / render.options.width,\n                    y: (render.bounds.max.y - render.bounds.min.y) / render.options.height\n                });\n\n                Mouse.setOffset(render.mouse, render.bounds.min);\n            }\n        } else {\n            constraints = allConstraints;\n            bodies = allBodies;\n\n            if (render.options.pixelRatio !== 1) {\n                render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);\n            }\n        }\n\n        if (!options.wireframes || (engine.enableSleeping && options.showSleeping)) {\n            // fully featured rendering of bodies\n            Render.bodies(render, bodies, context);\n        } else {\n            if (options.showConvexHulls)\n                Render.bodyConvexHulls(render, bodies, context);\n\n            // optimised method for wireframes only\n            Render.bodyWireframes(render, bodies, context);\n        }\n\n        if (options.showBounds)\n            Render.bodyBounds(render, bodies, context);\n\n        if (options.showAxes || options.showAngleIndicator)\n            Render.bodyAxes(render, bodies, context);\n\n        if (options.showPositions)\n            Render.bodyPositions(render, bodies, context);\n\n        if (options.showVelocity)\n            Render.bodyVelocity(render, bodies, context);\n\n        if (options.showIds)\n            Render.bodyIds(render, bodies, context);\n\n        if (options.showSeparations)\n            Render.separations(render, engine.pairs.list, context);\n\n        if (options.showCollisions)\n            Render.collisions(render, engine.pairs.list, context);\n\n        if (options.showVertexNumbers)\n            Render.vertexNumbers(render, bodies, context);\n\n        if (options.showMousePosition)\n            Render.mousePosition(render, render.mouse, context);\n\n        Render.constraints(constraints, context);\n\n        if (options.hasBounds) {\n            // revert view transforms\n            Render.endViewTransform(render);\n        }\n\n        Events.trigger(render, 'afterRender', event);\n\n        // log the time elapsed computing this update\n        timing.lastElapsed = Common.now() - startTime;\n    };\n\n    /**\n     * Renders statistics about the engine and world useful for debugging.\n     * @private\n     * @method stats\n     * @param {render} render\n     * @param {RenderingContext} context\n     * @param {Number} time\n     */\n    Render.stats = function(render, context, time) {\n        var engine = render.engine,\n            world = engine.world,\n            bodies = Composite.allBodies(world),\n            parts = 0,\n            width = 55,\n            height = 44,\n            x = 0,\n            y = 0;\n        \n        // count parts\n        for (var i = 0; i < bodies.length; i += 1) {\n            parts += bodies[i].parts.length;\n        }\n\n        // sections\n        var sections = {\n            'Part': parts,\n            'Body': bodies.length,\n            'Cons': Composite.allConstraints(world).length,\n            'Comp': Composite.allComposites(world).length,\n            'Pair': engine.pairs.list.length\n        };\n\n        // background\n        context.fillStyle = '#0e0f19';\n        context.fillRect(x, y, width * 5.5, height);\n\n        context.font = '12px Arial';\n        context.textBaseline = 'top';\n        context.textAlign = 'right';\n\n        // sections\n        for (var key in sections) {\n            var section = sections[key];\n            // label\n            context.fillStyle = '#aaa';\n            context.fillText(key, x + width, y + 8);\n\n            // value\n            context.fillStyle = '#eee';\n            context.fillText(section, x + width, y + 26);\n\n            x += width;\n        }\n    };\n\n    /**\n     * Renders engine and render performance information.\n     * @private\n     * @method performance\n     * @param {render} render\n     * @param {RenderingContext} context\n     */\n    Render.performance = function(render, context) {\n        var engine = render.engine,\n            timing = render.timing,\n            deltaHistory = timing.deltaHistory,\n            elapsedHistory = timing.elapsedHistory,\n            timestampElapsedHistory = timing.timestampElapsedHistory,\n            engineDeltaHistory = timing.engineDeltaHistory,\n            engineElapsedHistory = timing.engineElapsedHistory,\n            lastEngineDelta = engine.timing.lastDelta;\n        \n        var deltaMean = _mean(deltaHistory),\n            elapsedMean = _mean(elapsedHistory),\n            engineDeltaMean = _mean(engineDeltaHistory),\n            engineElapsedMean = _mean(engineElapsedHistory),\n            timestampElapsedMean = _mean(timestampElapsedHistory),\n            rateMean = (timestampElapsedMean / deltaMean) || 0,\n            fps = (1000 / deltaMean) || 0;\n\n        var graphHeight = 4,\n            gap = 12,\n            width = 60,\n            height = 34,\n            x = 10,\n            y = 69;\n\n        // background\n        context.fillStyle = '#0e0f19';\n        context.fillRect(0, 50, gap * 4 + width * 5 + 22, height);\n\n        // show FPS\n        Render.status(\n            context, x, y, width, graphHeight, deltaHistory.length, \n            Math.round(fps) + ' fps', \n            fps / Render._goodFps,\n            function(i) { return (deltaHistory[i] / deltaMean) - 1; }\n        );\n\n        // show engine delta\n        Render.status(\n            context, x + gap + width, y, width, graphHeight, engineDeltaHistory.length,\n            lastEngineDelta.toFixed(2) + ' dt', \n            Render._goodDelta / lastEngineDelta,\n            function(i) { return (engineDeltaHistory[i] / engineDeltaMean) - 1; }\n        );\n\n        // show engine update time\n        Render.status(\n            context, x + (gap + width) * 2, y, width, graphHeight, engineElapsedHistory.length,\n            engineElapsedMean.toFixed(2) + ' ut', \n            1 - (engineElapsedMean / Render._goodFps),\n            function(i) { return (engineElapsedHistory[i] / engineElapsedMean) - 1; }\n        );\n\n        // show render time\n        Render.status(\n            context, x + (gap + width) * 3, y, width, graphHeight, elapsedHistory.length,\n            elapsedMean.toFixed(2) + ' rt', \n            1 - (elapsedMean / Render._goodFps),\n            function(i) { return (elapsedHistory[i] / elapsedMean) - 1; }\n        );\n\n        // show effective speed\n        Render.status(\n            context, x + (gap + width) * 4, y, width, graphHeight, timestampElapsedHistory.length, \n            rateMean.toFixed(2) + ' x', \n            rateMean * rateMean * rateMean,\n            function(i) { return (((timestampElapsedHistory[i] / deltaHistory[i]) / rateMean) || 0) - 1; }\n        );\n    };\n\n    /**\n     * Renders a label, indicator and a chart.\n     * @private\n     * @method status\n     * @param {RenderingContext} context\n     * @param {number} x\n     * @param {number} y\n     * @param {number} width\n     * @param {number} height\n     * @param {number} count\n     * @param {string} label\n     * @param {string} indicator\n     * @param {function} plotY\n     */\n    Render.status = function(context, x, y, width, height, count, label, indicator, plotY) {\n        // background\n        context.strokeStyle = '#888';\n        context.fillStyle = '#444';\n        context.lineWidth = 1;\n        context.fillRect(x, y + 7, width, 1);\n\n        // chart\n        context.beginPath();\n        context.moveTo(x, y + 7 - height * Common.clamp(0.4 * plotY(0), -2, 2));\n        for (var i = 0; i < width; i += 1) {\n            context.lineTo(x + i, y + 7 - (i < count ? height * Common.clamp(0.4 * plotY(i), -2, 2) : 0));\n        }\n        context.stroke();\n\n        // indicator\n        context.fillStyle = 'hsl(' + Common.clamp(25 + 95 * indicator, 0, 120) + ',100%,60%)';\n        context.fillRect(x, y - 7, 4, 4);\n\n        // label\n        context.font = '12px Arial';\n        context.textBaseline = 'middle';\n        context.textAlign = 'right';\n        context.fillStyle = '#eee';\n        context.fillText(label, x + width, y - 5);\n    };\n\n    /**\n     * Description\n     * @private\n     * @method constraints\n     * @param {constraint[]} constraints\n     * @param {RenderingContext} context\n     */\n    Render.constraints = function(constraints, context) {\n        var c = context;\n\n        for (var i = 0; i < constraints.length; i++) {\n            var constraint = constraints[i];\n\n            if (!constraint.render.visible || !constraint.pointA || !constraint.pointB)\n                continue;\n\n            var bodyA = constraint.bodyA,\n                bodyB = constraint.bodyB,\n                start,\n                end;\n\n            if (bodyA) {\n                start = Vector.add(bodyA.position, constraint.pointA);\n            } else {\n                start = constraint.pointA;\n            }\n\n            if (constraint.render.type === 'pin') {\n                c.beginPath();\n                c.arc(start.x, start.y, 3, 0, 2 * Math.PI);\n                c.closePath();\n            } else {\n                if (bodyB) {\n                    end = Vector.add(bodyB.position, constraint.pointB);\n                } else {\n                    end = constraint.pointB;\n                }\n\n                c.beginPath();\n                c.moveTo(start.x, start.y);\n\n                if (constraint.render.type === 'spring') {\n                    var delta = Vector.sub(end, start),\n                        normal = Vector.perp(Vector.normalise(delta)),\n                        coils = Math.ceil(Common.clamp(constraint.length / 5, 12, 20)),\n                        offset;\n\n                    for (var j = 1; j < coils; j += 1) {\n                        offset = j % 2 === 0 ? 1 : -1;\n\n                        c.lineTo(\n                            start.x + delta.x * (j / coils) + normal.x * offset * 4,\n                            start.y + delta.y * (j / coils) + normal.y * offset * 4\n                        );\n                    }\n                }\n\n                c.lineTo(end.x, end.y);\n            }\n\n            if (constraint.render.lineWidth) {\n                c.lineWidth = constraint.render.lineWidth;\n                c.strokeStyle = constraint.render.strokeStyle;\n                c.stroke();\n            }\n\n            if (constraint.render.anchors) {\n                c.fillStyle = constraint.render.strokeStyle;\n                c.beginPath();\n                c.arc(start.x, start.y, 3, 0, 2 * Math.PI);\n                c.arc(end.x, end.y, 3, 0, 2 * Math.PI);\n                c.closePath();\n                c.fill();\n            }\n        }\n    };\n\n    /**\n     * Description\n     * @private\n     * @method bodies\n     * @param {render} render\n     * @param {body[]} bodies\n     * @param {RenderingContext} context\n     */\n    Render.bodies = function(render, bodies, context) {\n        var c = context,\n            engine = render.engine,\n            options = render.options,\n            showInternalEdges = options.showInternalEdges || !options.wireframes,\n            body,\n            part,\n            i,\n            k;\n\n        for (i = 0; i < bodies.length; i++) {\n            body = bodies[i];\n\n            if (!body.render.visible)\n                continue;\n\n            // handle compound parts\n            for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {\n                part = body.parts[k];\n\n                if (!part.render.visible)\n                    continue;\n\n                if (options.showSleeping && body.isSleeping) {\n                    c.globalAlpha = 0.5 * part.render.opacity;\n                } else if (part.render.opacity !== 1) {\n                    c.globalAlpha = part.render.opacity;\n                }\n\n                if (part.render.sprite && part.render.sprite.texture && !options.wireframes) {\n                    // part sprite\n                    var sprite = part.render.sprite,\n                        texture = _getTexture(render, sprite.texture);\n\n                    c.translate(part.position.x, part.position.y);\n                    c.rotate(part.angle);\n\n                    c.drawImage(\n                        texture,\n                        texture.width * -sprite.xOffset * sprite.xScale,\n                        texture.height * -sprite.yOffset * sprite.yScale,\n                        texture.width * sprite.xScale,\n                        texture.height * sprite.yScale\n                    );\n\n                    // revert translation, hopefully faster than save / restore\n                    c.rotate(-part.angle);\n                    c.translate(-part.position.x, -part.position.y);\n                } else {\n                    // part polygon\n                    if (part.circleRadius) {\n                        c.beginPath();\n                        c.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);\n                    } else {\n                        c.beginPath();\n                        c.moveTo(part.vertices[0].x, part.vertices[0].y);\n\n                        for (var j = 1; j < part.vertices.length; j++) {\n                            if (!part.vertices[j - 1].isInternal || showInternalEdges) {\n                                c.lineTo(part.vertices[j].x, part.vertices[j].y);\n                            } else {\n                                c.moveTo(part.vertices[j].x, part.vertices[j].y);\n                            }\n\n                            if (part.vertices[j].isInternal && !showInternalEdges) {\n                                c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);\n                            }\n                        }\n\n                        c.lineTo(part.vertices[0].x, part.vertices[0].y);\n                        c.closePath();\n                    }\n\n                    if (!options.wireframes) {\n                        c.fillStyle = part.render.fillStyle;\n\n                        if (part.render.lineWidth) {\n                            c.lineWidth = part.render.lineWidth;\n                            c.strokeStyle = part.render.strokeStyle;\n                            c.stroke();\n                        }\n\n                        c.fill();\n                    } else {\n                        c.lineWidth = 1;\n                        c.strokeStyle = '#bbb';\n                        c.stroke();\n                    }\n                }\n\n                c.globalAlpha = 1;\n            }\n        }\n    };\n\n    /**\n     * Optimised method for drawing body wireframes in one pass\n     * @private\n     * @method bodyWireframes\n     * @param {render} render\n     * @param {body[]} bodies\n     * @param {RenderingContext} context\n     */\n    Render.bodyWireframes = function(render, bodies, context) {\n        var c = context,\n            showInternalEdges = render.options.showInternalEdges,\n            body,\n            part,\n            i,\n            j,\n            k;\n\n        c.beginPath();\n\n        // render all bodies\n        for (i = 0; i < bodies.length; i++) {\n            body = bodies[i];\n\n            if (!body.render.visible)\n                continue;\n\n            // handle compound parts\n            for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {\n                part = body.parts[k];\n\n                c.moveTo(part.vertices[0].x, part.vertices[0].y);\n\n                for (j = 1; j < part.vertices.length; j++) {\n                    if (!part.vertices[j - 1].isInternal || showInternalEdges) {\n                        c.lineTo(part.vertices[j].x, part.vertices[j].y);\n                    } else {\n                        c.moveTo(part.vertices[j].x, part.vertices[j].y);\n                    }\n\n                    if (part.vertices[j].isInternal && !showInternalEdges) {\n                        c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);\n                    }\n                }\n\n                c.lineTo(part.vertices[0].x, part.vertices[0].y);\n            }\n        }\n\n        c.lineWidth = 1;\n        c.strokeStyle = '#bbb';\n        c.stroke();\n    };\n\n    /**\n     * Optimised method for drawing body convex hull wireframes in one pass\n     * @private\n     * @method bodyConvexHulls\n     * @param {render} render\n     * @param {body[]} bodies\n     * @param {RenderingContext} context\n     */\n    Render.bodyConvexHulls = function(render, bodies, context) {\n        var c = context,\n            body,\n            part,\n            i,\n            j,\n            k;\n\n        c.beginPath();\n\n        // render convex hulls\n        for (i = 0; i < bodies.length; i++) {\n            body = bodies[i];\n\n            if (!body.render.visible || body.parts.length === 1)\n                continue;\n\n            c.moveTo(body.vertices[0].x, body.vertices[0].y);\n\n            for (j = 1; j < body.vertices.length; j++) {\n                c.lineTo(body.vertices[j].x, body.vertices[j].y);\n            }\n\n            c.lineTo(body.vertices[0].x, body.vertices[0].y);\n        }\n\n        c.lineWidth = 1;\n        c.strokeStyle = 'rgba(255,255,255,0.2)';\n        c.stroke();\n    };\n\n    /**\n     * Renders body vertex numbers.\n     * @private\n     * @method vertexNumbers\n     * @param {render} render\n     * @param {body[]} bodies\n     * @param {RenderingContext} context\n     */\n    Render.vertexNumbers = function(render, bodies, context) {\n        var c = context,\n            i,\n            j,\n            k;\n\n        for (i = 0; i < bodies.length; i++) {\n            var parts = bodies[i].parts;\n            for (k = parts.length > 1 ? 1 : 0; k < parts.length; k++) {\n                var part = parts[k];\n                for (j = 0; j < part.vertices.length; j++) {\n                    c.fillStyle = 'rgba(255,255,255,0.2)';\n                    c.fillText(i + '_' + j, part.position.x + (part.vertices[j].x - part.position.x) * 0.8, part.position.y + (part.vertices[j].y - part.position.y) * 0.8);\n                }\n            }\n        }\n    };\n\n    /**\n     * Renders mouse position.\n     * @private\n     * @method mousePosition\n     * @param {render} render\n     * @param {mouse} mouse\n     * @param {RenderingContext} context\n     */\n    Render.mousePosition = function(render, mouse, context) {\n        var c = context;\n        c.fillStyle = 'rgba(255,255,255,0.8)';\n        c.fillText(mouse.position.x + '  ' + mouse.position.y, mouse.position.x + 5, mouse.position.y - 5);\n    };\n\n    /**\n     * Draws body bounds\n     * @private\n     * @method bodyBounds\n     * @param {render} render\n     * @param {body[]} bodies\n     * @param {RenderingContext} context\n     */\n    Render.bodyBounds = function(render, bodies, context) {\n        var c = context,\n            engine = render.engine,\n            options = render.options;\n\n        c.beginPath();\n\n        for (var i = 0; i < bodies.length; i++) {\n            var body = bodies[i];\n\n            if (body.render.visible) {\n                var parts = bodies[i].parts;\n                for (var j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {\n                    var part = parts[j];\n                    c.rect(part.bounds.min.x, part.bounds.min.y, part.bounds.max.x - part.bounds.min.x, part.bounds.max.y - part.bounds.min.y);\n                }\n            }\n        }\n\n        if (options.wireframes) {\n            c.strokeStyle = 'rgba(255,255,255,0.08)';\n        } else {\n            c.strokeStyle = 'rgba(0,0,0,0.1)';\n        }\n\n        c.lineWidth = 1;\n        c.stroke();\n    };\n\n    /**\n     * Draws body angle indicators and axes\n     * @private\n     * @method bodyAxes\n     * @param {render} render\n     * @param {body[]} bodies\n     * @param {RenderingContext} context\n     */\n    Render.bodyAxes = function(render, bodies, context) {\n        var c = context,\n            engine = render.engine,\n            options = render.options,\n            part,\n            i,\n            j,\n            k;\n\n        c.beginPath();\n\n        for (i = 0; i < bodies.length; i++) {\n            var body = bodies[i],\n                parts = body.parts;\n\n            if (!body.render.visible)\n                continue;\n\n            if (options.showAxes) {\n                // render all axes\n                for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {\n                    part = parts[j];\n                    for (k = 0; k < part.axes.length; k++) {\n                        var axis = part.axes[k];\n                        c.moveTo(part.position.x, part.position.y);\n                        c.lineTo(part.position.x + axis.x * 20, part.position.y + axis.y * 20);\n                    }\n                }\n            } else {\n                for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {\n                    part = parts[j];\n                    for (k = 0; k < part.axes.length; k++) {\n                        // render a single axis indicator\n                        c.moveTo(part.position.x, part.position.y);\n                        c.lineTo((part.vertices[0].x + part.vertices[part.vertices.length-1].x) / 2,\n                            (part.vertices[0].y + part.vertices[part.vertices.length-1].y) / 2);\n                    }\n                }\n            }\n        }\n\n        if (options.wireframes) {\n            c.strokeStyle = 'indianred';\n            c.lineWidth = 1;\n        } else {\n            c.strokeStyle = 'rgba(255, 255, 255, 0.4)';\n            c.globalCompositeOperation = 'overlay';\n            c.lineWidth = 2;\n        }\n\n        c.stroke();\n        c.globalCompositeOperation = 'source-over';\n    };\n\n    /**\n     * Draws body positions\n     * @private\n     * @method bodyPositions\n     * @param {render} render\n     * @param {body[]} bodies\n     * @param {RenderingContext} context\n     */\n    Render.bodyPositions = function(render, bodies, context) {\n        var c = context,\n            engine = render.engine,\n            options = render.options,\n            body,\n            part,\n            i,\n            k;\n\n        c.beginPath();\n\n        // render current positions\n        for (i = 0; i < bodies.length; i++) {\n            body = bodies[i];\n\n            if (!body.render.visible)\n                continue;\n\n            // handle compound parts\n            for (k = 0; k < body.parts.length; k++) {\n                part = body.parts[k];\n                c.arc(part.position.x, part.position.y, 3, 0, 2 * Math.PI, false);\n                c.closePath();\n            }\n        }\n\n        if (options.wireframes) {\n            c.fillStyle = 'indianred';\n        } else {\n            c.fillStyle = 'rgba(0,0,0,0.5)';\n        }\n        c.fill();\n\n        c.beginPath();\n\n        // render previous positions\n        for (i = 0; i < bodies.length; i++) {\n            body = bodies[i];\n            if (body.render.visible) {\n                c.arc(body.positionPrev.x, body.positionPrev.y, 2, 0, 2 * Math.PI, false);\n                c.closePath();\n            }\n        }\n\n        c.fillStyle = 'rgba(255,165,0,0.8)';\n        c.fill();\n    };\n\n    /**\n     * Draws body velocity\n     * @private\n     * @method bodyVelocity\n     * @param {render} render\n     * @param {body[]} bodies\n     * @param {RenderingContext} context\n     */\n    Render.bodyVelocity = function(render, bodies, context) {\n        var c = context;\n\n        c.beginPath();\n\n        for (var i = 0; i < bodies.length; i++) {\n            var body = bodies[i];\n\n            if (!body.render.visible)\n                continue;\n\n            var velocity = Body.getVelocity(body);\n\n            c.moveTo(body.position.x, body.position.y);\n            c.lineTo(body.position.x + velocity.x, body.position.y + velocity.y);\n        }\n\n        c.lineWidth = 3;\n        c.strokeStyle = 'cornflowerblue';\n        c.stroke();\n    };\n\n    /**\n     * Draws body ids\n     * @private\n     * @method bodyIds\n     * @param {render} render\n     * @param {body[]} bodies\n     * @param {RenderingContext} context\n     */\n    Render.bodyIds = function(render, bodies, context) {\n        var c = context,\n            i,\n            j;\n\n        for (i = 0; i < bodies.length; i++) {\n            if (!bodies[i].render.visible)\n                continue;\n\n            var parts = bodies[i].parts;\n            for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {\n                var part = parts[j];\n                c.font = \"12px Arial\";\n                c.fillStyle = 'rgba(255,255,255,0.5)';\n                c.fillText(part.id, part.position.x + 10, part.position.y - 10);\n            }\n        }\n    };\n\n    /**\n     * Description\n     * @private\n     * @method collisions\n     * @param {render} render\n     * @param {pair[]} pairs\n     * @param {RenderingContext} context\n     */\n    Render.collisions = function(render, pairs, context) {\n        var c = context,\n            options = render.options,\n            pair,\n            collision,\n            corrected,\n            bodyA,\n            bodyB,\n            i,\n            j;\n\n        c.beginPath();\n\n        // render collision positions\n        for (i = 0; i < pairs.length; i++) {\n            pair = pairs[i];\n\n            if (!pair.isActive)\n                continue;\n\n            collision = pair.collision;\n            for (j = 0; j < pair.activeContacts.length; j++) {\n                var contact = pair.activeContacts[j],\n                    vertex = contact.vertex;\n                c.rect(vertex.x - 1.5, vertex.y - 1.5, 3.5, 3.5);\n            }\n        }\n\n        if (options.wireframes) {\n            c.fillStyle = 'rgba(255,255,255,0.7)';\n        } else {\n            c.fillStyle = 'orange';\n        }\n        c.fill();\n\n        c.beginPath();\n\n        // render collision normals\n        for (i = 0; i < pairs.length; i++) {\n            pair = pairs[i];\n\n            if (!pair.isActive)\n                continue;\n\n            collision = pair.collision;\n\n            if (pair.activeContacts.length > 0) {\n                var normalPosX = pair.activeContacts[0].vertex.x,\n                    normalPosY = pair.activeContacts[0].vertex.y;\n\n                if (pair.activeContacts.length === 2) {\n                    normalPosX = (pair.activeContacts[0].vertex.x + pair.activeContacts[1].vertex.x) / 2;\n                    normalPosY = (pair.activeContacts[0].vertex.y + pair.activeContacts[1].vertex.y) / 2;\n                }\n\n                if (collision.bodyB === collision.supports[0].body || collision.bodyA.isStatic === true) {\n                    c.moveTo(normalPosX - collision.normal.x * 8, normalPosY - collision.normal.y * 8);\n                } else {\n                    c.moveTo(normalPosX + collision.normal.x * 8, normalPosY + collision.normal.y * 8);\n                }\n\n                c.lineTo(normalPosX, normalPosY);\n            }\n        }\n\n        if (options.wireframes) {\n            c.strokeStyle = 'rgba(255,165,0,0.7)';\n        } else {\n            c.strokeStyle = 'orange';\n        }\n\n        c.lineWidth = 1;\n        c.stroke();\n    };\n\n    /**\n     * Description\n     * @private\n     * @method separations\n     * @param {render} render\n     * @param {pair[]} pairs\n     * @param {RenderingContext} context\n     */\n    Render.separations = function(render, pairs, context) {\n        var c = context,\n            options = render.options,\n            pair,\n            collision,\n            corrected,\n            bodyA,\n            bodyB,\n            i,\n            j;\n\n        c.beginPath();\n\n        // render separations\n        for (i = 0; i < pairs.length; i++) {\n            pair = pairs[i];\n\n            if (!pair.isActive)\n                continue;\n\n            collision = pair.collision;\n            bodyA = collision.bodyA;\n            bodyB = collision.bodyB;\n\n            var k = 1;\n\n            if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;\n            if (bodyB.isStatic) k = 0;\n\n            c.moveTo(bodyB.position.x, bodyB.position.y);\n            c.lineTo(bodyB.position.x - collision.penetration.x * k, bodyB.position.y - collision.penetration.y * k);\n\n            k = 1;\n\n            if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;\n            if (bodyA.isStatic) k = 0;\n\n            c.moveTo(bodyA.position.x, bodyA.position.y);\n            c.lineTo(bodyA.position.x + collision.penetration.x * k, bodyA.position.y + collision.penetration.y * k);\n        }\n\n        if (options.wireframes) {\n            c.strokeStyle = 'rgba(255,165,0,0.5)';\n        } else {\n            c.strokeStyle = 'orange';\n        }\n        c.stroke();\n    };\n\n    /**\n     * Description\n     * @private\n     * @method inspector\n     * @param {inspector} inspector\n     * @param {RenderingContext} context\n     */\n    Render.inspector = function(inspector, context) {\n        var engine = inspector.engine,\n            selected = inspector.selected,\n            render = inspector.render,\n            options = render.options,\n            bounds;\n\n        if (options.hasBounds) {\n            var boundsWidth = render.bounds.max.x - render.bounds.min.x,\n                boundsHeight = render.bounds.max.y - render.bounds.min.y,\n                boundsScaleX = boundsWidth / render.options.width,\n                boundsScaleY = boundsHeight / render.options.height;\n\n            context.scale(1 / boundsScaleX, 1 / boundsScaleY);\n            context.translate(-render.bounds.min.x, -render.bounds.min.y);\n        }\n\n        for (var i = 0; i < selected.length; i++) {\n            var item = selected[i].data;\n\n            context.translate(0.5, 0.5);\n            context.lineWidth = 1;\n            context.strokeStyle = 'rgba(255,165,0,0.9)';\n            context.setLineDash([1,2]);\n\n            switch (item.type) {\n\n            case 'body':\n\n                // render body selections\n                bounds = item.bounds;\n                context.beginPath();\n                context.rect(Math.floor(bounds.min.x - 3), Math.floor(bounds.min.y - 3),\n                    Math.floor(bounds.max.x - bounds.min.x + 6), Math.floor(bounds.max.y - bounds.min.y + 6));\n                context.closePath();\n                context.stroke();\n\n                break;\n\n            case 'constraint':\n\n                // render constraint selections\n                var point = item.pointA;\n                if (item.bodyA)\n                    point = item.pointB;\n                context.beginPath();\n                context.arc(point.x, point.y, 10, 0, 2 * Math.PI);\n                context.closePath();\n                context.stroke();\n\n                break;\n\n            }\n\n            context.setLineDash([]);\n            context.translate(-0.5, -0.5);\n        }\n\n        // render selection region\n        if (inspector.selectStart !== null) {\n            context.translate(0.5, 0.5);\n            context.lineWidth = 1;\n            context.strokeStyle = 'rgba(255,165,0,0.6)';\n            context.fillStyle = 'rgba(255,165,0,0.1)';\n            bounds = inspector.selectBounds;\n            context.beginPath();\n            context.rect(Math.floor(bounds.min.x), Math.floor(bounds.min.y),\n                Math.floor(bounds.max.x - bounds.min.x), Math.floor(bounds.max.y - bounds.min.y));\n            context.closePath();\n            context.stroke();\n            context.fill();\n            context.translate(-0.5, -0.5);\n        }\n\n        if (options.hasBounds)\n            context.setTransform(1, 0, 0, 1, 0, 0);\n    };\n\n    /**\n     * Updates render timing.\n     * @method _updateTiming\n     * @private\n     * @param {render} render\n     * @param {number} time\n     */\n    var _updateTiming = function(render, time) {\n        var engine = render.engine,\n            timing = render.timing,\n            historySize = timing.historySize,\n            timestamp = engine.timing.timestamp;\n\n        timing.delta = time - timing.lastTime || Render._goodDelta;\n        timing.lastTime = time;\n\n        timing.timestampElapsed = timestamp - timing.lastTimestamp || 0;\n        timing.lastTimestamp = timestamp;\n\n        timing.deltaHistory.unshift(timing.delta);\n        timing.deltaHistory.length = Math.min(timing.deltaHistory.length, historySize);\n\n        timing.engineDeltaHistory.unshift(engine.timing.lastDelta);\n        timing.engineDeltaHistory.length = Math.min(timing.engineDeltaHistory.length, historySize);\n\n        timing.timestampElapsedHistory.unshift(timing.timestampElapsed);\n        timing.timestampElapsedHistory.length = Math.min(timing.timestampElapsedHistory.length, historySize);\n\n        timing.engineElapsedHistory.unshift(engine.timing.lastElapsed);\n        timing.engineElapsedHistory.length = Math.min(timing.engineElapsedHistory.length, historySize);\n\n        timing.elapsedHistory.unshift(timing.lastElapsed);\n        timing.elapsedHistory.length = Math.min(timing.elapsedHistory.length, historySize);\n    };\n\n    /**\n     * Returns the mean value of the given numbers.\n     * @method _mean\n     * @private\n     * @param {Number[]} values\n     * @return {Number} the mean of given values\n     */\n    var _mean = function(values) {\n        var result = 0;\n        for (var i = 0; i < values.length; i += 1) {\n            result += values[i];\n        }\n        return (result / values.length) || 0;\n    };\n\n    /**\n     * @method _createCanvas\n     * @private\n     * @param {} width\n     * @param {} height\n     * @return canvas\n     */\n    var _createCanvas = function(width, height) {\n        var canvas = document.createElement('canvas');\n        canvas.width = width;\n        canvas.height = height;\n        canvas.oncontextmenu = function() { return false; };\n        canvas.onselectstart = function() { return false; };\n        return canvas;\n    };\n\n    /**\n     * Gets the pixel ratio of the canvas.\n     * @method _getPixelRatio\n     * @private\n     * @param {HTMLElement} canvas\n     * @return {Number} pixel ratio\n     */\n    var _getPixelRatio = function(canvas) {\n        var context = canvas.getContext('2d'),\n            devicePixelRatio = window.devicePixelRatio || 1,\n            backingStorePixelRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio\n                                      || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio\n                                      || context.backingStorePixelRatio || 1;\n\n        return devicePixelRatio / backingStorePixelRatio;\n    };\n\n    /**\n     * Gets the requested texture (an Image) via its path\n     * @method _getTexture\n     * @private\n     * @param {render} render\n     * @param {string} imagePath\n     * @return {Image} texture\n     */\n    var _getTexture = function(render, imagePath) {\n        var image = render.textures[imagePath];\n\n        if (image)\n            return image;\n\n        image = render.textures[imagePath] = new Image();\n        image.src = imagePath;\n\n        return image;\n    };\n\n    /**\n     * Applies the background to the canvas using CSS.\n     * @method applyBackground\n     * @private\n     * @param {render} render\n     * @param {string} background\n     */\n    var _applyBackground = function(render, background) {\n        var cssBackground = background;\n\n        if (/(jpg|gif|png)$/.test(background))\n            cssBackground = 'url(' + background + ')';\n\n        render.canvas.style.background = cssBackground;\n        render.canvas.style.backgroundSize = \"contain\";\n        render.currentBackground = background;\n    };\n\n    /*\n    *\n    *  Events Documentation\n    *\n    */\n\n    /**\n    * Fired before rendering\n    *\n    * @event beforeRender\n    * @param {} event An event object\n    * @param {number} event.timestamp The engine.timing.timestamp of the event\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /**\n    * Fired after rendering\n    *\n    * @event afterRender\n    * @param {} event An event object\n    * @param {number} event.timestamp The engine.timing.timestamp of the event\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /*\n    *\n    *  Properties Documentation\n    *\n    */\n\n    /**\n     * A back-reference to the `Matter.Render` module.\n     *\n     * @deprecated\n     * @property controller\n     * @type render\n     */\n\n    /**\n     * A reference to the `Matter.Engine` instance to be used.\n     *\n     * @property engine\n     * @type engine\n     */\n\n    /**\n     * A reference to the element where the canvas is to be inserted (if `render.canvas` has not been specified)\n     *\n     * @property element\n     * @type HTMLElement\n     * @default null\n     */\n\n    /**\n     * The canvas element to render to. If not specified, one will be created if `render.element` has been specified.\n     *\n     * @property canvas\n     * @type HTMLCanvasElement\n     * @default null\n     */\n\n    /**\n     * A `Bounds` object that specifies the drawing view region.\n     * Rendering will be automatically transformed and scaled to fit within the canvas size (`render.options.width` and `render.options.height`).\n     * This allows for creating views that can pan or zoom around the scene.\n     * You must also set `render.options.hasBounds` to `true` to enable bounded rendering.\n     *\n     * @property bounds\n     * @type bounds\n     */\n\n    /**\n     * The 2d rendering context from the `render.canvas` element.\n     *\n     * @property context\n     * @type CanvasRenderingContext2D\n     */\n\n    /**\n     * The sprite texture cache.\n     *\n     * @property textures\n     * @type {}\n     */\n\n    /**\n     * The mouse to render if `render.options.showMousePosition` is enabled.\n     *\n     * @property mouse\n     * @type mouse\n     * @default null\n     */\n\n    /**\n     * The configuration options of the renderer.\n     *\n     * @property options\n     * @type {}\n     */\n\n    /**\n     * The target width in pixels of the `render.canvas` to be created.\n     * See also the `options.pixelRatio` property to change render quality.\n     *\n     * @property options.width\n     * @type number\n     * @default 800\n     */\n\n    /**\n     * The target height in pixels of the `render.canvas` to be created.\n     * See also the `options.pixelRatio` property to change render quality.\n     *\n     * @property options.height\n     * @type number\n     * @default 600\n     */\n\n    /**\n     * The [pixel ratio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) to use when rendering.\n     *\n     * @property options.pixelRatio\n     * @type number\n     * @default 1\n     */\n\n    /**\n     * A CSS background color string to use when `render.options.wireframes` is disabled.\n     * This may be also set to `'transparent'` or equivalent.\n     *\n     * @property options.background\n     * @type string\n     * @default '#14151f'\n     */\n\n    /**\n     * A CSS background color string to use when `render.options.wireframes` is enabled.\n     * This may be also set to `'transparent'` or equivalent.\n     *\n     * @property options.wireframeBackground\n     * @type string\n     * @default '#14151f'\n     */\n\n    /**\n     * A flag that specifies if `render.bounds` should be used when rendering.\n     *\n     * @property options.hasBounds\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable all debug information overlays together.  \n     * This includes and has priority over the values of:\n     *\n     * - `render.options.showStats`\n     * - `render.options.showPerformance`\n     *\n     * @property options.showDebug\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the engine stats info overlay.  \n     * From left to right, the values shown are:\n     *\n     * - body parts total\n     * - body total\n     * - constraints total\n     * - composites total\n     * - collision pairs total\n     *\n     * @property options.showStats\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable performance charts.  \n     * From left to right, the values shown are:\n     *\n     * - average render frequency (e.g. 60 fps)\n     * - exact engine delta time used for last update (e.g. 16.66ms)\n     * - average engine execution duration (e.g. 5.00ms)\n     * - average render execution duration (e.g. 0.40ms)\n     * - average effective play speed (e.g. '1.00x' is 'real-time')\n     *\n     * Each value is recorded over a fixed sample of past frames (60 frames).\n     *\n     * A chart shown below each value indicates the variance from the average over the sample.\n     * The more stable or fixed the value is the flatter the chart will appear.\n     *\n     * @property options.showPerformance\n     * @type boolean\n     * @default false\n     */\n    \n    /**\n     * A flag to enable or disable rendering entirely.\n     *\n     * @property options.enabled\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to toggle wireframe rendering otherwise solid fill rendering is used.\n     *\n     * @property options.wireframes\n     * @type boolean\n     * @default true\n     */\n\n    /**\n     * A flag to enable or disable sleeping bodies indicators.\n     *\n     * @property options.showSleeping\n     * @type boolean\n     * @default true\n     */\n\n    /**\n     * A flag to enable or disable the debug information overlay.\n     *\n     * @property options.showDebug\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the collision broadphase debug overlay.\n     *\n     * @deprecated no longer implemented\n     * @property options.showBroadphase\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the body bounds debug overlay.\n     *\n     * @property options.showBounds\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the body velocity debug overlay.\n     *\n     * @property options.showVelocity\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the body collisions debug overlay.\n     *\n     * @property options.showCollisions\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the collision resolver separations debug overlay.\n     *\n     * @property options.showSeparations\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the body axes debug overlay.\n     *\n     * @property options.showAxes\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the body positions debug overlay.\n     *\n     * @property options.showPositions\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the body angle debug overlay.\n     *\n     * @property options.showAngleIndicator\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the body and part ids debug overlay.\n     *\n     * @property options.showIds\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the body vertex numbers debug overlay.\n     *\n     * @property options.showVertexNumbers\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the body convex hulls debug overlay.\n     *\n     * @property options.showConvexHulls\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the body internal edges debug overlay.\n     *\n     * @property options.showInternalEdges\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A flag to enable or disable the mouse position debug overlay.\n     *\n     * @property options.showMousePosition\n     * @type boolean\n     * @default false\n     */\n\n})();\n\n\n/***/ }),\n/* 27 */\n/***/ (function(module, exports, __nested_webpack_require_339525__) {\n\n/**\n* The `Matter.Runner` module is an optional utility which provides a game loop, \n* that handles continuously updating a `Matter.Engine` for you within a browser.\n* It is intended for development and debugging purposes, but may also be suitable for simple games.\n* If you are using your own game loop instead, then you do not need the `Matter.Runner` module.\n* Instead just call `Engine.update(engine, delta)` in your own loop.\n*\n* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).\n*\n* @class Runner\n*/\n\nvar Runner = {};\n\nmodule.exports = Runner;\n\nvar Events = __nested_webpack_require_339525__(5);\nvar Engine = __nested_webpack_require_339525__(17);\nvar Common = __nested_webpack_require_339525__(0);\n\n(function() {\n\n    var _requestAnimationFrame,\n        _cancelAnimationFrame;\n\n    if (typeof window !== 'undefined') {\n        _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame\n                                      || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;\n   \n        _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame \n                                      || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;\n    }\n\n    if (!_requestAnimationFrame) {\n        var _frameTimeout;\n\n        _requestAnimationFrame = function(callback){ \n            _frameTimeout = setTimeout(function() { \n                try{callback(Common.now());}catch(e){console.error(e);} \n            }, 1000 / 60);\n        };\n\n        _cancelAnimationFrame = function() {\n            clearTimeout(_frameTimeout);\n        };\n    }\n\n    /**\n     * Creates a new Runner. The options parameter is an object that specifies any properties you wish to override the defaults.\n     * @method create\n     * @param {} options\n     */\n    Runner.create = function(options) {\n        var defaults = {\n            fps: 60,\n            deltaSampleSize: 60,\n            counterTimestamp: 0,\n            frameCounter: 0,\n            deltaHistory: [],\n            timePrev: null,\n            frameRequestId: null,\n            isFixed: false,\n            enabled: true\n        };\n\n        var runner = Common.extend(defaults, options);\n\n        runner.delta = runner.delta || 1000 / runner.fps;\n        runner.deltaMin = runner.deltaMin || 1000 / runner.fps;\n        runner.deltaMax = runner.deltaMax || 1000 / (runner.fps * 0.5);\n        runner.fps = 1000 / runner.delta;\n\n        return runner;\n    };\n\n    /**\n     * Continuously ticks a `Matter.Engine` by calling `Runner.tick` on the `requestAnimationFrame` event.\n     * @method run\n     * @param {engine} engine\n     */\n    Runner.run = function(runner, engine) {\n        // create runner if engine is first argument\n        if (typeof runner.positionIterations !== 'undefined') {\n            engine = runner;\n            runner = Runner.create();\n        }\n\n        (function run(time){\n            runner.frameRequestId = _requestAnimationFrame(run);\n\n            if (time && runner.enabled) {\n                Runner.tick(runner, engine, time);\n            }\n        })();\n\n        return runner;\n    };\n\n    /**\n     * A game loop utility that updates the engine and renderer by one step (a 'tick').\n     * Features delta smoothing, time correction and fixed or dynamic timing.\n     * Consider just `Engine.update(engine, delta)` if you're using your own loop.\n     * @method tick\n     * @param {runner} runner\n     * @param {engine} engine\n     * @param {number} time\n     */\n    Runner.tick = function(runner, engine, time) {\n        var timing = engine.timing,\n            delta;\n\n        if (runner.isFixed) {\n            // fixed timestep\n            delta = runner.delta;\n        } else {\n            // dynamic timestep based on wall clock between calls\n            delta = (time - runner.timePrev) || runner.delta;\n            runner.timePrev = time;\n\n            // optimistically filter delta over a few frames, to improve stability\n            runner.deltaHistory.push(delta);\n            runner.deltaHistory = runner.deltaHistory.slice(-runner.deltaSampleSize);\n            delta = Math.min.apply(null, runner.deltaHistory);\n\n            // limit delta\n            delta = delta < runner.deltaMin ? runner.deltaMin : delta;\n            delta = delta > runner.deltaMax ? runner.deltaMax : delta;\n\n            // update engine timing object\n            runner.delta = delta;\n        }\n\n        // create an event object\n        var event = {\n            timestamp: timing.timestamp\n        };\n\n        Events.trigger(runner, 'beforeTick', event);\n\n        // fps counter\n        runner.frameCounter += 1;\n        if (time - runner.counterTimestamp >= 1000) {\n            runner.fps = runner.frameCounter * ((time - runner.counterTimestamp) / 1000);\n            runner.counterTimestamp = time;\n            runner.frameCounter = 0;\n        }\n\n        Events.trigger(runner, 'tick', event);\n\n        // update\n        Events.trigger(runner, 'beforeUpdate', event);\n\n        Engine.update(engine, delta);\n\n        Events.trigger(runner, 'afterUpdate', event);\n\n        Events.trigger(runner, 'afterTick', event);\n    };\n\n    /**\n     * Ends execution of `Runner.run` on the given `runner`, by canceling the animation frame request event loop.\n     * If you wish to only temporarily pause the engine, see `engine.enabled` instead.\n     * @method stop\n     * @param {runner} runner\n     */\n    Runner.stop = function(runner) {\n        _cancelAnimationFrame(runner.frameRequestId);\n    };\n\n    /**\n     * Alias for `Runner.run`.\n     * @method start\n     * @param {runner} runner\n     * @param {engine} engine\n     */\n    Runner.start = function(runner, engine) {\n        Runner.run(runner, engine);\n    };\n\n    /*\n    *\n    *  Events Documentation\n    *\n    */\n\n    /**\n    * Fired at the start of a tick, before any updates to the engine or timing\n    *\n    * @event beforeTick\n    * @param {} event An event object\n    * @param {number} event.timestamp The engine.timing.timestamp of the event\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /**\n    * Fired after engine timing updated, but just before update\n    *\n    * @event tick\n    * @param {} event An event object\n    * @param {number} event.timestamp The engine.timing.timestamp of the event\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /**\n    * Fired at the end of a tick, after engine update and after rendering\n    *\n    * @event afterTick\n    * @param {} event An event object\n    * @param {number} event.timestamp The engine.timing.timestamp of the event\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /**\n    * Fired before update\n    *\n    * @event beforeUpdate\n    * @param {} event An event object\n    * @param {number} event.timestamp The engine.timing.timestamp of the event\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /**\n    * Fired after update\n    *\n    * @event afterUpdate\n    * @param {} event An event object\n    * @param {number} event.timestamp The engine.timing.timestamp of the event\n    * @param {} event.source The source object of the event\n    * @param {} event.name The name of the event\n    */\n\n    /*\n    *\n    *  Properties Documentation\n    *\n    */\n\n    /**\n     * A flag that specifies whether the runner is running or not.\n     *\n     * @property enabled\n     * @type boolean\n     * @default true\n     */\n\n    /**\n     * A `Boolean` that specifies if the runner should use a fixed timestep (otherwise it is variable).\n     * If timing is fixed, then the apparent simulation speed will change depending on the frame rate (but behaviour will be deterministic).\n     * If the timing is variable, then the apparent simulation speed will be constant (approximately, but at the cost of determininism).\n     *\n     * @property isFixed\n     * @type boolean\n     * @default false\n     */\n\n    /**\n     * A `Number` that specifies the time step between updates in milliseconds.\n     * If `engine.timing.isFixed` is set to `true`, then `delta` is fixed.\n     * If it is `false`, then `delta` can dynamically change to maintain the correct apparent simulation speed.\n     *\n     * @property delta\n     * @type number\n     * @default 1000 / 60\n     */\n\n})();\n\n\n/***/ }),\n/* 28 */\n/***/ (function(module, exports, __nested_webpack_require_348064__) {\n\n/**\n* This module has now been replaced by `Matter.Collision`.\n*\n* All usage should be migrated to `Matter.Collision`.\n* For back-compatibility purposes this module will remain for a short term and then later removed in a future release.\n*\n* The `Matter.SAT` module contains methods for detecting collisions using the Separating Axis Theorem.\n*\n* @class SAT\n* @deprecated\n*/\n\nvar SAT = {};\n\nmodule.exports = SAT;\n\nvar Collision = __nested_webpack_require_348064__(8);\nvar Common = __nested_webpack_require_348064__(0);\nvar deprecated = Common.deprecated;\n\n(function() {\n\n    /**\n     * Detect collision between two bodies using the Separating Axis Theorem.\n     * @deprecated replaced by Collision.collides\n     * @method collides\n     * @param {body} bodyA\n     * @param {body} bodyB\n     * @return {collision} collision\n     */\n    SAT.collides = function(bodyA, bodyB) {\n        return Collision.collides(bodyA, bodyB);\n    };\n\n    deprecated(SAT, 'collides', 'SAT.collides ➤ replaced by Collision.collides');\n\n})();\n\n\n/***/ }),\n/* 29 */\n/***/ (function(module, exports, __nested_webpack_require_349134__) {\n\n/**\n* The `Matter.Svg` module contains methods for converting SVG images into an array of vector points.\n*\n* To use this module you also need the SVGPathSeg polyfill: https://github.com/progers/pathseg\n*\n* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).\n*\n* @class Svg\n*/\n\nvar Svg = {};\n\nmodule.exports = Svg;\n\nvar Bounds = __nested_webpack_require_349134__(1);\nvar Common = __nested_webpack_require_349134__(0);\n\n(function() {\n\n    /**\n     * Converts an SVG path into an array of vector points.\n     * If the input path forms a concave shape, you must decompose the result into convex parts before use.\n     * See `Bodies.fromVertices` which provides support for this.\n     * Note that this function is not guaranteed to support complex paths (such as those with holes).\n     * You must load the `pathseg.js` polyfill on newer browsers.\n     * @method pathToVertices\n     * @param {SVGPathElement} path\n     * @param {Number} [sampleLength=15]\n     * @return {Vector[]} points\n     */\n    Svg.pathToVertices = function(path, sampleLength) {\n        if (typeof window !== 'undefined' && !('SVGPathSeg' in window)) {\n            Common.warn('Svg.pathToVertices: SVGPathSeg not defined, a polyfill is required.');\n        }\n\n        // https://github.com/wout/svg.topoly.js/blob/master/svg.topoly.js\n        var i, il, total, point, segment, segments, \n            segmentsQueue, lastSegment, \n            lastPoint, segmentIndex, points = [],\n            lx, ly, length = 0, x = 0, y = 0;\n\n        sampleLength = sampleLength || 15;\n\n        var addPoint = function(px, py, pathSegType) {\n            // all odd-numbered path types are relative except PATHSEG_CLOSEPATH (1)\n            var isRelative = pathSegType % 2 === 1 && pathSegType > 1;\n\n            // when the last point doesn't equal the current point add the current point\n            if (!lastPoint || px != lastPoint.x || py != lastPoint.y) {\n                if (lastPoint && isRelative) {\n                    lx = lastPoint.x;\n                    ly = lastPoint.y;\n                } else {\n                    lx = 0;\n                    ly = 0;\n                }\n\n                var point = {\n                    x: lx + px,\n                    y: ly + py\n                };\n\n                // set last point\n                if (isRelative || !lastPoint) {\n                    lastPoint = point;\n                }\n\n                points.push(point);\n\n                x = lx + px;\n                y = ly + py;\n            }\n        };\n\n        var addSegmentPoint = function(segment) {\n            var segType = segment.pathSegTypeAsLetter.toUpperCase();\n\n            // skip path ends\n            if (segType === 'Z') \n                return;\n\n            // map segment to x and y\n            switch (segType) {\n\n            case 'M':\n            case 'L':\n            case 'T':\n            case 'C':\n            case 'S':\n            case 'Q':\n                x = segment.x;\n                y = segment.y;\n                break;\n            case 'H':\n                x = segment.x;\n                break;\n            case 'V':\n                y = segment.y;\n                break;\n            }\n\n            addPoint(x, y, segment.pathSegType);\n        };\n\n        // ensure path is absolute\n        Svg._svgPathToAbsolute(path);\n\n        // get total length\n        total = path.getTotalLength();\n\n        // queue segments\n        segments = [];\n        for (i = 0; i < path.pathSegList.numberOfItems; i += 1)\n            segments.push(path.pathSegList.getItem(i));\n\n        segmentsQueue = segments.concat();\n\n        // sample through path\n        while (length < total) {\n            // get segment at position\n            segmentIndex = path.getPathSegAtLength(length);\n            segment = segments[segmentIndex];\n\n            // new segment\n            if (segment != lastSegment) {\n                while (segmentsQueue.length && segmentsQueue[0] != segment)\n                    addSegmentPoint(segmentsQueue.shift());\n\n                lastSegment = segment;\n            }\n\n            // add points in between when curving\n            // TODO: adaptive sampling\n            switch (segment.pathSegTypeAsLetter.toUpperCase()) {\n\n            case 'C':\n            case 'T':\n            case 'S':\n            case 'Q':\n            case 'A':\n                point = path.getPointAtLength(length);\n                addPoint(point.x, point.y, 0);\n                break;\n\n            }\n\n            // increment by sample value\n            length += sampleLength;\n        }\n\n        // add remaining segments not passed by sampling\n        for (i = 0, il = segmentsQueue.length; i < il; ++i)\n            addSegmentPoint(segmentsQueue[i]);\n\n        return points;\n    };\n\n    Svg._svgPathToAbsolute = function(path) {\n        // http://phrogz.net/convert-svg-path-to-all-absolute-commands\n        // Copyright (c) Gavin Kistner\n        // http://phrogz.net/js/_ReuseLicense.txt\n        // Modifications: tidy formatting and naming\n        var x0, y0, x1, y1, x2, y2, segs = path.pathSegList,\n            x = 0, y = 0, len = segs.numberOfItems;\n\n        for (var i = 0; i < len; ++i) {\n            var seg = segs.getItem(i),\n                segType = seg.pathSegTypeAsLetter;\n\n            if (/[MLHVCSQTA]/.test(segType)) {\n                if ('x' in seg) x = seg.x;\n                if ('y' in seg) y = seg.y;\n            } else {\n                if ('x1' in seg) x1 = x + seg.x1;\n                if ('x2' in seg) x2 = x + seg.x2;\n                if ('y1' in seg) y1 = y + seg.y1;\n                if ('y2' in seg) y2 = y + seg.y2;\n                if ('x' in seg) x += seg.x;\n                if ('y' in seg) y += seg.y;\n\n                switch (segType) {\n\n                case 'm':\n                    segs.replaceItem(path.createSVGPathSegMovetoAbs(x, y), i);\n                    break;\n                case 'l':\n                    segs.replaceItem(path.createSVGPathSegLinetoAbs(x, y), i);\n                    break;\n                case 'h':\n                    segs.replaceItem(path.createSVGPathSegLinetoHorizontalAbs(x), i);\n                    break;\n                case 'v':\n                    segs.replaceItem(path.createSVGPathSegLinetoVerticalAbs(y), i);\n                    break;\n                case 'c':\n                    segs.replaceItem(path.createSVGPathSegCurvetoCubicAbs(x, y, x1, y1, x2, y2), i);\n                    break;\n                case 's':\n                    segs.replaceItem(path.createSVGPathSegCurvetoCubicSmoothAbs(x, y, x2, y2), i);\n                    break;\n                case 'q':\n                    segs.replaceItem(path.createSVGPathSegCurvetoQuadraticAbs(x, y, x1, y1), i);\n                    break;\n                case 't':\n                    segs.replaceItem(path.createSVGPathSegCurvetoQuadraticSmoothAbs(x, y), i);\n                    break;\n                case 'a':\n                    segs.replaceItem(path.createSVGPathSegArcAbs(x, y, seg.r1, seg.r2, seg.angle, seg.largeArcFlag, seg.sweepFlag), i);\n                    break;\n                case 'z':\n                case 'Z':\n                    x = x0;\n                    y = y0;\n                    break;\n\n                }\n            }\n\n            if (segType == 'M' || segType == 'm') {\n                x0 = x;\n                y0 = y;\n            }\n        }\n    };\n\n})();\n\n/***/ }),\n/* 30 */\n/***/ (function(module, exports, __nested_webpack_require_356595__) {\n\n/**\n* This module has now been replaced by `Matter.Composite`.\n*\n* All usage should be migrated to the equivalent functions found on `Matter.Composite`.\n* For example `World.add(world, body)` now becomes `Composite.add(world, body)`.\n*\n* The property `world.gravity` has been moved to `engine.gravity`.\n*\n* For back-compatibility purposes this module will remain as a direct alias to `Matter.Composite` in the short term during migration.\n* Eventually this alias module will be marked as deprecated and then later removed in a future release.\n*\n* @class World\n*/\n\nvar World = {};\n\nmodule.exports = World;\n\nvar Composite = __nested_webpack_require_356595__(6);\nvar Common = __nested_webpack_require_356595__(0);\n\n(function() {\n\n    /**\n     * See above, aliases for back compatibility only\n     */\n    World.create = Composite.create;\n    World.add = Composite.add;\n    World.remove = Composite.remove;\n    World.clear = Composite.clear;\n    World.addComposite = Composite.addComposite;\n    World.addBody = Composite.addBody;\n    World.addConstraint = Composite.addConstraint;\n\n})();\n\n\n/***/ })\n/******/ ]);\n});\n\n//# sourceURL=webpack://makematter/./node_modules/matter-js/build/matter.js?"
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

const game$1 = new GameServer();

export { game$1 as default };
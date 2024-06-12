import ABE from "./ABE.mjs";
import ServerHelper from "./ServerHelper.mjs";
import Indexer from "../classes/Indexer.mjs";
import ServerLife from "./ServerLife.mjs";
import ServerItem from "./ServerItem.mjs";

class ServerWorld {
	constructor(emit, helper, index) {
		console.log("World Constructor", !!helper);
		this.ts = new Date().getTime();
		this.emit = emit; //function to push event from server
		//console.log("World started");
		this.lastTime = new Date().getTime();
		this.delta = 0;
		this.c = 0;
		this.helper = helper || new ServerHelper(emit);
		this.id = this.helper.randID();
		this.helper.world = this;
		this.allObjects = {};
		this.pressedKeys = {};
		this.playerId = false;
		this.index = index || new Indexer();
		this.watching = {};
		this.searchers = {};
		this.searchCount = 0;
		this.regionSkipClasses = ["Projectile"]; //Skip adding these to chunks
		this.NPCsblock = {};
		this.settings = {};
		this.serverMode = true;
		this.speed = 1;
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

	physicsChange(options) {
		const changes = options.data;
		const change = changes.data;
		const item = this.index.find(changes.id);
		for (let op in change) {
			item.data[op] = change[op];
		}
		item.sync();
	}

	//It's sync..
	findClosest(searcher, index, query) {
		if (typeof searcher.x !== "number") {
			ABE.errorLog("[ABE] Cannot findCloset with no .x");
			return false;
		}

		this.searchCount++;

		/*if (this.searchCount > 10) {
			ABE.errorLog("[ABE] Many searches on this tick: " + this.searchCount);
			return false;
		}*/

		this.searchers[searcher.id] = {
			startTime: Date.now(),
			result: false,
			index: index,
			searcher: searcher,
			query: query
		};

		let results = [];
		let maxCount = 50; //Should never really happen, but just in case
		let count = 0;
		Object.entries(this.index.getIndex(index)).every(([key, item]) => {
			if (query(item, searcher)) {
				item.dist = this.helper.dist(searcher, item);
				count++;
				if (count > maxCount) {
					//TODO: add this now and then to check AI is good
					//console.error("[ABE] Searching for a long time for ...", item);
				}
				if (results[0] && results[0].dist > item.dist) {
					//This item is closer
					results.unshift(item);
				} else {
					results.push(item);
				}
				if (item.dist < 500) {
					//Because its so close, and because it matched the query; we will return early.
					//return false;
				}
			}
			return true;
		});

		this.searchers[searcher.id].complete = true;
		this.searchers[searcher.id].results = results;
		return this.searchers[searcher.id];
	}

	startSearch(searcher, index, query) {
		this.searchCount++;
		/*if (this.searchCount > 10) {
			ABE.errorLog("[ABE] Many searches on this tick: " + this.searchCount);
			return false;
		}*/

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
		var x = 0;
		var y = 0;

		var baseSpeed = 1.5;

		var speedMulti = 1;
		if (this.pressedKeys[16]) {
			speedMulti = 1.5;
		}

		if (this.pressedKeys[68]) {
			x = baseSpeed;
		}
		if (this.pressedKeys[65]) {
			x = -baseSpeed;
		}
		if (this.pressedKeys[87]) {
			y = -baseSpeed;
		}
		if (this.pressedKeys[83]) {
			y = baseSpeed;
		}

		//this.helper.physicsUpdate('setVelocity', { id: this.playerId, x: x * speedMulti, y: y * speedMulti });
	}

	setTimestamp(data) {
		this.ts = data.data.timestamp;
		ABE.infoLog("set ts", this.ts);
	}

	setSpeed(data) {
		this.speed = data.data.speed;
		ABE.infoLog("set speed", this.speed);
	}

	sendObjectsToPlayer(data) {
		//console.error("Sending updates to player");
		const objects = this.index.getIndex("all");
		for (var itemId in objects) {
			this.helper.broadcastUpdate("world", "addFromServer", JSON.parse(JSON.stringify(objects[itemId])));
		}
	}

	handleObjectMeta(item) {
		if (item.meta == undefined) {
			return false;
		}

		this.updateRegion(item);

		if (item.meta.physicsType !== undefined) {
			//console.log("Sending to physics server", item);
			this.helper.physicsUpdate("addObject", JSON.parse(JSON.stringify(item)));
		}

		if (item.meta.blockZone !== undefined) {
			//console.log("Sending to path server "+item.codename);
			this.helper.pathUpdate("addObject", JSON.parse(JSON.stringify(item)));
		}
	}

	handleObjectData(item, type) {
		if (item.rebindData) {
			item.rebindData();
		}
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
		//console.log("Add this", {item, data: options.data});
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

	syncFactions(data) {
		game.factions.updateFactionTable(data.data.factionTable);
	}

	addLifeObject(data) {
		console.log("ADD LIFE", data);
		try {
			var life = new ServerLife(data.data, this.helper, this);
			if (this.index.find(life.id)) {
				return; //Already added (from server sync)
			}
			this.index.addToIndexes(["all", "life"], life);
			life.initWorld();
			if (this.serverMode) {
				this.helper.broadcastUpdate("world", "addFromServer", JSON.parse(JSON.stringify(life)));
			}
		} catch (e) {
			console.error(e);
		}
	}

	playerJoin(data) {
		this.sendObjectsToPlayer(data);
		//this.addObjectToWorld({y:400, x:500});
		//this.addObjectToWorld({x:500});
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
			updateObject.data.dir = updateObject.data.forceDir || update.dir || updateObject.data.dir;
		}
	}

	toJSON() {
		return {
			id: this.id
		};
	}

	findResource(destination, resource) {
		destination.search = this.findClosest(destination, "playerstorage", (item, searcher) => {
			if (item.codename === "build-item") return false; //Don't steal from other build items
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
		var bulk = {
			setVelocity: [],
			pathUpdate: []
		};
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

			//TODO: since build item isnt a complex item, this cannot be added to onWorldTick since it is never sent to server
			if (item.codename === "build-item") item.hauls();

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
		var interp = this.delta / timestep;
		//DO UPDATE HERE
		this.update(postback);
		//this.update(postback, interp);
		//END UPDATE
		this.delta -= timestep;
		// }
		this.helper.measure(this);
		//consolerror("Tick delay: "+(currentTime - this.lastTime)+"ms");
		this.lastTime = currentTime;
		this.ts += Math.floor(16*this.speed);
		game.ts = this.ts;
	}
}

export default ServerWorld;

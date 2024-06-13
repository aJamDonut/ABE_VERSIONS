import ServerHelper from "./ServerHelper.mjs";
import ServerWorld from "./ServerWorld.mjs";
import ABE from "./ABE.mjs";
import PathFinder from "./pathfinder.easy.mjs";

class ServerPath {
	regions = 200;
	regionSize = this.regions*10+this.regions; //Seems to need padding coz of 100 region (101-110)

	constructor(emit) {
		
		console.log("Path Constructor");
		this.tileSize = 64;
		this.mapDimension = this.regions * this.regionSize;

		this.finders = {};

		this.helper = new ServerHelper(emit);
		this.helper.world = new ServerWorld(emit, this.helper); //TODO: move or remove;
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
		for (var i = 0; i <= 10 * 200; i++) {
			grid[i] = [];
			for (var j = 0; j <= 10 * 200; j++) {
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

		var blockWidth = Math.ceil(item.width / item.tileSize);
		var blockHeight = Math.ceil(item.height / this.tileSize);

		if (blockWidth == 1 && blockHeight == 1) {
			this.addBlocker({data: item});
			return true;
		}

		var gridX = Math.floor(item.x / this.tileSize);
		var gridY = Math.floor(item.y / this.tileSize);

		for (var row = 0; row < blockWidth; row++) {
			for (var col = 0; col < blockHeight; col++) {
				this.block(gridX + row, gridY + col);
			}
		}
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
		//TODO: on client, it might call this alot incase the pregen map is old
		//it may be okay but if its bad perf, we could also have the pregen
		//map on the client and only unblock things that have diverged from pregen
		//console.log("Unblock", column, row);
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

		this.helper.physicsUpdate("receivePath", {
			id: options.id,
			path: [],
			reason: "emptying"
		});
		this.helper.worldUpdate("receivePath", {
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

		let distance = this.helper.dist({x: startX, y: startY}, {x: endX, y: endY});

		/*if (distance > 60) {
            //Too far so dont search
            this.helper.physicsUpdate('receivePath', { id: options.id, path: [], failed: true, reason: 'toofar:'+distance }); //OOB so just send back none.
            this.helper.worldUpdate('receivePath', { id: options.id, path: [], failed: true, reason: 'toofar:'+distance });
            return;
        }*/

		if (
			!this.shouldPath(targetId) || //If it cant add a pathlog
			this.outsideGrid(startX, startY, endX, endY) //It it isn't inside the grid
		) {
			//Outside of grid so don't search
			this.helper.physicsUpdate("receivePath", {
				id: options.id,
				path: [],
				failed: true,
				reason: "oob"
			}); //OOB so just send back none.
			this.helper.worldUpdate("receivePath", {
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
						this.helper.physicsUpdate("receivePath", {
							id: options.id,
							path: [],
							failed: true,
							reason: "noresult"
						}); //TODO: is this needed?
						this.helper.worldUpdate("receivePath", {
							id: options.id,
							path: [],
							failed: true,
							reason: "noresult"
						});
						this.pathFailed(targetId);
					} else {
						path.shift(); //Remove first -- This is because it's normally the block the NPC is stood on
						//path.push([options.endX, options.endY]); //Goto the absolute x,y (in most cases for user click paths)
						this.helper.physicsUpdate("receivePath", {
							id: options.id,
							path: path,
							failed: false
						}); //TODO: is this needed?
						this.helper.worldUpdate("receivePath", {
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

export default ServerPath;

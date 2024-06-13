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
		let hour = new Date(ms).getHours();

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
			name = (Date.now()+"").substr(-8);
		}
		
		this.lastID++;
		return this.lastID + "-" + "1" + name + "-"+this.clientuid;
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
		return false;
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
		var sizes = {};
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
			sizes[keyName] = size;
			totalSize += size;
		}
		if (depth == 0) {
			//consolerror(sizes);
		}
		return totalSize;
	}
}
export default ServerHelper;

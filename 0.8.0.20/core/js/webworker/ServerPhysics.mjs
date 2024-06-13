import ABE from "./ABE.mjs";
import ServerHelper from "./ServerHelper.mjs";
import ServerWorld from "./ServerWorld.mjs";
import Indexer from "../classes/Indexer.mjs";
import ServerLife from "./ServerLife.mjs";
import ServerItem from "./ServerItem.mjs";
import Algos from "../classes/Algos.mjs";

import {Matter} from "../../../lib/matterjs/mymatter.mjs";
Matter.Common.now = function () {
	//Polyfill (it looks for window.performance)
	return new Date().getSeconds() - Matter.Common._nowStartTime;
};
class ServerPhysics {
	constructor(emit) {
		console.log("Physics Constructor");
		console.error("Matter is", self.Matter);

		this.ts = new Date().getTime();
		this.emit = emit; //function to push event from server
		this.objects = {};
		this.Engine = Matter.Engine;
		this.Render = Matter.Render;
		this.Vector = Matter.Vector;

		this.World = Matter.World;

		this.Body = Matter.Body;
		this.Query = Matter.Query;
		this.Events = Matter.Events;
		this.Bodies = Matter.Bodies;
		this.Mouse = Matter.Mouse;
		this.Composite = Matter.Composite;

		this.Composites = Matter.Composites;
		this.Constraint = Matter.Constraint;
		// create runner
		this.runner = Matter.Runner.create({
			isFixed: true
		});

		this.MouseConstraint = Matter.MouseConstraint;
		this.physEngine = this.Engine.create();
		this.physEngine.timing.timeScale = 1;
		Matter.Resolver._restingThresh = 0.001;
		this.physEngine.world.gravity.y = 0;
		this.lastTime = new Date().getTime();
		this.delta = 0;
		this.c = 0;
		this.velocity = {};
		this.helper = new ServerHelper(this.emit);
		this.helper.physics = this;
		this.index = new Indexer();
		this.helper.world = new ServerWorld(this.emit, this.helper, this.index);
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

		this.speed = 1;

		this.blocked = {};
		this.rails = {};

		Matter.Runner.run(this.runner, this.physEngine);

		//Matter.Runner.stop(this.runner);
		this.serverMode = true;
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

	syncFactions(data) {
		game.factions.updateFactionTable(data.data.factionTable);
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

	
	setSpeed(data) {
		this.speed = data.data.speed;
		this.physEngine.timing.timeScale = this.speed;
		ABE.infoLog("Physics set speed", this.speed);
	}

	findIds(data) {
		if (typeof data !== "object" || Array.isArray(data)) return data;

		const keys = Object.keys(data);

		if (keys.length === 1 && keys.includes("id")) {
			return this.index.getFromIndex(data.id, "all") || data;
		}
		if (keys.length === 1 && keys.includes("itemId")) {
			return this.index.getFromIndex(data.itemId, "all") || data;
		}
		if (keys.length === 1 && keys.includes("parentId")) {
			return this.index.getFromIndex(data.parentId, "all") || data;
		}

		if (keys.length === 1 && keys.includes("childId")) {
			return this.index.getFromIndex(data.childId, "all") || data;
		}

		return data;
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
			item[options.func].call(item, this.findIds(options.data));
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

		const Vector = Matter.Vector;

		let mapSize = Vector.create(100000, 100000); //Grid size in cell size

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

		//Start walking

		let tileFound = false;
		let maxDistance = 25; //Max distance to walk in 'cells'
		let distance = 0;
		let maxIterations = 50; //Just for safety, don't crash browsers!
		let iterations = 0;

		while (!tileFound && distance < maxDistance && iterations < maxIterations) {
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

		for (let i = 0; i < pairs.length; i++) {
			//Weird collision pairs.
			//This occurs when an entity is removed, and the event ends.
			if (!pairs[i]) {
				continue;
			}
			
			this.collisionEvent(pairs[i], "end");
		}
	}

	collisionEvent(collision, event) {
		if (collision.bodyA.sprite == undefined || collision.bodyB.sprite == undefined) {
			return;
		}
		if (collision.bodyA.sprite.removePhysics || collision.bodyB.sprite.removePhysics) return;

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

	removeBlock(x, y) {
		delete this.blocked[Math.floor(x / 64) + "_" + Math.floor(y / 64)];
	}

	isBlocked(x, y) {
		return this.blocked[Math.floor(x / 64) + "_" + Math.floor(y / 64)] || false;
	}

	addWater(data) {}

	addBlocker(data) {
		this.addBlock(data.data.x, data.data.y);
	}

	addRail(data) {
		this.rails[data.data.x + "-" + data.data.y] = data.data.dir;
	}

	getRail(x, y) {
		return this.rails[x + "-" + y] || false;
	}

	removeRail(data) {
		delete this.rails[data.data.x + "-" + data.data.y];
	}

	removeBlocker(data) {
		this.removeBlock(data.data.x, data.data.y);
	}

	addMoveable(data) {
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

		if (sprite.meta.physicsType == "moveable") {
			this.addMoveable(data);
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
		console.log("Add to index", sprite);
		this.index.addToIndexes(["all", "objects", data.data.class], sprite);
		this.World.addBody(this.physEngine.world, body);
		this.updateComposite();
	}

	oldAddLifeObject(data) {
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

		const body = this.Bodies.rectangle(sprite.x, sprite.y, sprite.width * 0.25, sprite.height * 0.25, {
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
		isSensor = true;
		life.initPhysics();
		life.lastX = Math.ceil(sprite.x);
		life.lastY = Math.ceil(sprite.y);

		const body = this.Bodies.circle(life.lastX, life.lastY, 32, {
			friction: 1,
			frictionAir: 0.08,
			inertia: Infinity,
			rot: 0,
			density: 10,
			restitution: 0,
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
		const source = objects[sourceId];

		if (this.allBodies == undefined) {
			return [];
		}

		const walk = this.ddaWalk(start.x, start.y, end.x, end.y); //DDA walk (collides with unpassable stuff for LOS)

		let results = [];

		if (!walk) {
			//TRYING FOR NOW
			//IF IT HIT A WALL IT SAW NO ONE
			//return [];
			//If it hit a wall it cant see, only look to there
			results = this.Query.ray(this.allBodies, {x: start.x, y: start.y}, {x: end.x, y: end.y}, 64);
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

	mouseInfo(options) {
		this.mouse = options.data;
	}

	newAvoid(item, box, currentVelocity, boids) {
		//return currentVelocity;
		if(!item.data.targetId) return currentVelocity; //Only boid check fighters
		if(this.hz) this.hz = this.helper.rng(0, 1000);
		
		let ts = Date.now();
		ts = ts + this.hz;
		
		const AVOID_DISTANCE = Math.max(32, (64 * (1000 - (ts % 1000))) / 100);
		
		let vecSeperation = this.Vector.create();

		let total = 0;

		for (let boid of boids) {
			
			//if(boid.id !== item.data.targetId) continue;
			if (boid.data.noBoid) continue;
			if (boid.data.dead || boid.data.do === "becarried" || boid.data.relativeParentId) continue;
			boid = boid.body;
			if (boid === box || boid.id === item.id) continue; //Skip self

			const vecDistance = this.helper.dist(box.position, boid.position);

			if (vecDistance > AVOID_DISTANCE) continue; //Far away

			let diff = this.Vector.sub(box.position, boid.position);

			diff = this.Vector.div(diff, vecDistance * vecDistance);

			vecSeperation = this.Vector.add(vecSeperation, diff);

			total++;
		}

		if (total > 0) {
			//vecSeperation = Vector.mult(vecSeperation, total);
			//vecSeperation = Vector.magnitude(vecSeperation, SEP_MAGNITUDE);
			//vecSeperation = Vector.sub(currentVelocity, vecSeperation);
		}

		const multi = 10; //Math.max(50, 300 * (5000 - Date.now() % 5000) / 100);
		return this.Vector.add(currentVelocity, this.Vector.mult(vecSeperation, multi));
	}

	getVelDataVelocity(item, body, velData) {
		if (velData !== undefined) {
			body.dir = velData.dir;
			let speed = velData.speed;
			let normalSpeed = speed;

			if (!item.data.drivingId) {
				speed = Algos.applyAthleticsToSpeed(speed, item.data.levels.athletics.level, item.data.isPlayer);
			}

			let maxWeight = Algos.getMaxWeight(item.data.stats.maxWeight, item.data.levels.strength.level);

			if (isNaN(maxWeight)) {
				console.error("Weighto", item.data.stats.maxWeight, item.data.levels.strength.level, item.data);
				throw `No max weight`;
			}

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

			const normal = this.Vector.normalise(vecS);
			const neg = this.Vector.neg(normal);
			const multi = this.Vector.mult(neg, 0.5 * speed);
			return multi;
		}
		return this.Vector.create();
	}

	shouldFollowPath(item) {
		const target = this.index.find(item.data.targetId);
		if (!target) return true;

		if (this.helper.dist(item, target) > 64 * 4) {
			return true;
		}

		return false;
	}
	rangeMap(n, in_min, in_max, out_min, out_max) {
		return ((n - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
	}

	getVelToTarget(box) {
		const target = this.index.find(box.data.targetId);
		if (!target) return this.Vector.create();

		let speed = 10;
		const posBox = box.body.position;

		const distanceToMouse = this.Vector.dist(posBox, target.body.position);

		const vecDistance = this.Vector.sub(target.body.position, posBox);

		const distNormal = this.Vector.normalise(vecDistance);

		if (distanceToMouse < 64 + 64) {
			speed = this.rangeMap(distanceToMouse, 64, 128 + 64, 10, speed);
		}

		return this.Vector.mult(distNormal, speed);
	}

	isOnRail(item) {
		const x = Math.floor((item.x + 40) / 64);
		const y = Math.floor((item.y + 16) / 64);
		const rail = this.getRail(x, y);
		if (!rail) return false;
		return true;
	}

	stickToRail(item) {
		const x = Math.floor(item.x + 40);
		const y = Math.floor(item.y + 16);
		const gridX = Math.floor(x / 64);
		const gridY = Math.floor(y / 64);
		const rail = this.getRail(gridX, gridY);

		let xAdd = 40;
		let yAdd = 32;

		if (rail === "left") xAdd = -128;
		if (rail === "right") xAdd = 128;
		if (rail === "up") yAdd = -128;
		if (rail === "down") yAdd = 128;

		const vectorToX = Math.floor(gridX * 64 + xAdd);
		const vectorToY = Math.floor(gridY * 64 + yAdd);
		const xDist = vectorToX - x;
		const yDist = vectorToY - y;

		const increaseX = xDist < 0 ? -10 : 10;
		const increaseY = yDist < 0 ? -10 : 10;

		const vecX = Math.abs(xDist) > 8 ? increaseX : 0;
		const vecY = Math.abs(yDist) > 8 ? increaseY : 0;

		//const desired = this.Vector.create(vectorToX - item.x, vectorToY - item.y);
		const desired = this.Vector.create(vecX, vecY);
		// Normalize the desired vector
		const magnitude = 0.01; // Adjust the magnitude as needed
		//this.Vector.div(desired, magnitude);
		// Apply force to the item's body
		this.Body.applyForce(item.body, item.body.position, desired);
		return desired;
	}

	processDesiredVelocity(item, body, velData) {
		item.vector = false;
		let desired = this.Vector.create(0, 0);

		

		if (!item.data.targetId) body.isSensor = true;
		if (item.data.targetId) body.isSensor = false;

		//body.circleRadius

		if (item.baseClass !== "BaseLife" || this.shouldFollowPath(item)) {
			desired = this.getVelDataVelocity(item, body, velData);
			const preDesire = desired;
			desired = this.newAvoid(item, body, desired, Object.values(this.index.getIndex("life")));

			if (isNaN(desired.x) || isNaN(desired.y)) {
				if (isNaN(preDesire.x) || isNaN(preDesire.y)) {
					console.error(
						"[ABE-INFO] BAD VECTOR FROM VELTODATA. Multiple NPCs on top of eachother? Ignore if occurs only once",
						item,
						body,
						velData,
						desired
					);
					return;
				}
				desired = preDesire; //We can use the original velocity without avoidance
			}
		} else {
			desired = this.getVelToTarget(item);
			const preDesire = desired;
			desired = this.newAvoid(item, body, desired, Object.values(this.index.getIndex("life")));

			if (isNaN(desired.x) || isNaN(desired.y)) {
				if (isNaN(preDesire.x) || isNaN(preDesire.y)) {
					console.error(
						"[ABE-INFO] BAD VECTOR FROM VELTODATA. Multiple NPCs on top of eachother? Ignore if occurs only once",
						item,
						body,
						velData,
						desired
					);
					return;
				}
				desired = preDesire; //We can use the original velocity without avoidance
			}
		}
		
		if (this.isOnRail(item)) {
			desired = this.Vector.div(desired, 2)
		}

		this.Body.setVelocity(body, desired);
		//this.Body.setVelocity(body, this.Vector.sub(desired, vecAvoid));

		if (item.data.physAvoid === false) {
			//this.Body.setVelocity(body, desired);
		}
	}

	deadCheck(physObject) {
		if (physObject.data.dead) {
			physObject.body.isSensor = true;
		}
	}

	updateDir(physObject) {
		let vel = physObject.body.velocity;

		physObject.dir = physObject.data.dir || physObject.dir || "down";

		if (!vel || isNaN(vel.x) || isNaN(vel.y) || (Math.abs(vel.x) < 0.25 && Math.abs(vel.y) < 0.25)) {
			return;
		}

		const angle = Math.atan2(vel.y, vel.x); //radians
		// you need to devide by PI, and MULTIPLY by 180:
		const degrees = (180 * angle) / Math.PI; //degrees
		vel = (360 + Math.round(degrees)) % 360; //round number, avoid decimal fragments
		if (!physObject.dir) {
			physObject.dir = physObject.data.forceDir || this.getDirectionFromAngle(vel);
			return;
		}

		let newDir = this.getDirectionFromAngle(vel);

		if (!newDir) {
			newDir = physObject.dir;
		}

		physObject.dir = physObject.data.forceDir || newDir;

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

			if (!physObject.skipVelocity && (physObject.baseClass == "BaseLife" || this.velocity[spriteId])) {
				this.processDesiredVelocity(physObject, physObject.body, this.velocity[spriteId]);
				delete this.velocity[spriteId];
			}

			if (
				physObject.body.position.x < bounds.left ||
				physObject.body.position.x > bounds.right ||
				physObject.body.position.y < bounds.top ||
				physObject.body.position.y > bounds.bottom
			) {
				//physObject.data.lifetime = -1;
				//continue;
			}

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
					physObject.dir = physObject.data.forceDir || physObject.data.dir;
				}

				this.updateDir(physObject);
				this.deadCheck(physObject);

				physObject.data.dir = physObject.data.forceDir || physObject.dir;

				physData.push({
					updates: physObject.updates,
					id: physObject.id,
					x: Math.ceil(physObject.body.position.x),
					y: Math.ceil(physObject.body.position.y),
					dir: physObject.data.forceDir || physObject.dir,
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
export default ServerPhysics;

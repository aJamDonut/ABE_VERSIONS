import ServerPath from "./ServerPath.mjs";
import ServerPhysics from "./ServerPhysics.mjs";
import ServerWorld from "./ServerWorld.mjs";
import Emitter from "./NodeEmitter.mjs";
import GameServer from "./GameServer.mjs";

class NodeGameServer extends GameServer {
	constructor() {
		super();
		this.servers.physics = new ServerPhysics(Emitter);
		this.servers.world = new ServerWorld(Emitter);
	}
	init() {

	}
}
export default NodeGameServer;
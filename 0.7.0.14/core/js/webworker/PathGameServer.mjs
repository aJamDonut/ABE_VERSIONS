import ServerPath from "./ServerPath.mjs";
import Emitter from "./Emitter.mjs";
import GameServer from "./GameServer.mjs";

class PathGameServer extends GameServer {
	constructor() {
		super();
		this.servers.path = new ServerPath(Emitter);
	}
}
export default PathGameServer;

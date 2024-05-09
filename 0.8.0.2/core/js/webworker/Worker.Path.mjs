self._server = "Path";


import ABE from "./ABE.mjs";
self.ABE = ABE;

import game from "./game.path.mjs";
import {bootStrap} from "./bootStrap.mjs";
import {bootStrap as bootStrapLive} from "./bootStrap.live.mjs";

import {isLive} from "../shared/Environment.mjs";
const strapper = isLive() ? bootStrapLive : bootStrap;




self.game = game;

self.servers = game.servers;

self.onmessage = async (response) => {
	try {
		await strapper((response) => {
			try {
				self.game.onMessage(response, postMessage);
			} catch (e) {
				console.error(e);
			}
		}, response);
	} catch (e) {
		console.error(e);
	}
};

self.postMessage({
	server: self._server.toLowerCase(),
	status: "ready"
});

Date.now = function () {
	return game.ts;
};

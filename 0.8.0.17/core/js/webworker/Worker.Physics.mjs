self._server = "Physics";

import ABE from "./ABE.mjs";
self.ABE = ABE;

import game from "./game.mjs";

import {bootStrap} from "./bootStrap.mjs";
import {bootStrap as bootStrapLive} from "./bootStrap.live.mjs";

import {forceLive, isLive} from "../shared/Environment.mjs";
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
		//Failed to bootstrap so now try live version
		//This is for environments with no parameters accepted on modules
		try {
			forceLive();
			await bootStrapLive((response) => {
				try {
					self.game.onMessage(response, postMessage);
				} catch (e) {
					console.error(e);
				}
			}, response);
		} catch (e) {
			//Completely failed can't start
			console.error(e);
		}
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

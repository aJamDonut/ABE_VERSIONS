//console.error("Worker readty");
import {io} from "../../../lib/socketio/socket.io.esm.mjs";
//Connect to socket
var socket = io("http://localhost:35612", {
	cors: {
		origin: "http://localhost:32563",
		methods: ["GET", "POST"]
	}
});
console.log("loaden");
console.log(socket);
socket.on("connect", () => {
	console.log("Connected");
	socket.on("response", (data) => {
		if (data.data !== undefined) {
			if (data.data.action !== "physUpdate") {
				console.log("Worker response: " + data.data.action);
				console.log(data);
			}
		} else {
			console.error("WEIRD DATA.DATA");
			console.error(data);
		}
		self.postMessage(data);
	});
});
socket.on("disconnect", (reason) => {
	self.postMessage("lostServer");
});

self.postMessage({server: "path", status: "ready"});
self.postMessage({server: "world", status: "ready"});
self.postMessage({server: "physics", status: "ready"});

// Emit a 'chat message' event to the server
socket.emit("request", {server: "client", status: "ready"});

self.onmessage = function (request) {
	socket.emit("request", request.data);
};

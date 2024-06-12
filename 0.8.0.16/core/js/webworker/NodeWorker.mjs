//console.error("Worker readty");
import {io} from "../../../lib/socketio/socket.io.esm.mjs";

//const host = "https://abeserver-60091102cd79.herokuapp.com:80";
const host = "http://localhost:35612";

//Connect to socket
var socket = io(host, {
	cors: {
		origin: "http://localhost:32563",
		methods: ["GET", "POST"]
	}
});

socket.on("connect", () => {
	console.log("Connected");
	socket.on("response", (data) => {
		if (!data.data) {
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

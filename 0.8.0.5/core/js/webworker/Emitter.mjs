if(typeof postMessage === "undefined" && typeof globalThis !== "undefined") {
	globalThis.postMessage = function(){};
}
const Emitter = function (data) {
	try {
		postMessage(data);
	} catch (e) {
		console.error(e);
	}
};
export default Emitter;
export {Emitter};

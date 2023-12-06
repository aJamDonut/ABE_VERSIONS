const Emitter = function (data) {
	try {
		postMessage(data);
	} catch (e) {
		console.error(e);
	}
};
export default Emitter;
export {Emitter};

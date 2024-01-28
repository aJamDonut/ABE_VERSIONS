import {parentPort} from "worker_threads";
const Emitter = function (data) {
	try {
		parentPort.postMessage(data);
	} catch (e) {
		console.error(e);
	}
};
export {Emitter};
export default Emitter;

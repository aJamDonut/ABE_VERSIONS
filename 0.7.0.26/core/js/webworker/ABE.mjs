import {isLive} from "../shared/Environment.mjs";
import {CONSTS} from "../shared/Constants.mjs";


const ABE = {
	CONSTS: CONSTS
};

if (typeof global == "undefined" && typeof self !== "undefined") {
	self.global = {}; //Nodejs polyfill
}

ABE.logStyleAndTitle = (type) => {
	const styles = {
		err: "color: #fff; background: #cc0000;",
		info: "color: #fff; background: #399f91;",
		monitor: "color: red; background: #dda756;"
	};
	const titles = {
		default: "INFO"
	};

	const title = titles[type] || type.toUpperCase();
	const style = styles[type] || styles["info"];

	return {style, title};
};

const origWarn = console.warn;

ABE.log = function (type, msg, extra) {
	return console.log({type, msg, extra: JSON.stringify(extra)});

	if (typeof self === "undefined") {
		var self = {_server: "local"};
	}
	if (typeof msg !== "string") {
		//It pollutes too much man
		//console.trace(msg);
	}
	extra = extra || "";
	const bgColors = {
		Path: "#a17c15",
		Physics: "#7215a1",
		World: "#151aa1"
	};

	const serverStyle = `color: #fff; background: ${bgColors[self._server]};`;
	const meta = ABE.logStyleAndTitle(type);
	console.groupCollapsed(
		`%c ${meta.title} %c%c SERVER-${self._server} %c ${msg}`,
		meta.style,
		"",
		serverStyle,
		"",
		extra
	);

	const ignoreDepth = 2;

	let stack = new Error().stack;

	if (typeof stack === "undefined") {
		stack = "No stack";
	} else {
		stack = stack.split("\n").splice(ignoreDepth).join("\n");
	}
	origWarn(stack);

	console.groupEnd();
};

ABE.infoLog = (msg, extra) => {
	ABE.log("info", msg, extra);
};

ABE.monitorLog = (msg, extra) => {
	ABE.log("monitor", msg, extra);
};

ABE.errorLog = (msg, extra) => {
	ABE.log("err", msg, extra);
};

if (!isLive()) {
	//console.log = ABE.infoLog; //Overwrite console log
	//console.error = ABE.errorLog; //Overwrite console log
	//console.warn = ABE.monitorLog; //Overwrite console log
}
export default ABE;

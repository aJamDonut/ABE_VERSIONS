function checkIsNodeJs() {
	return typeof process === "object";
}

const urlVar = {}
let search = ""
if(typeof window !== "undefined" && window.location && location.search) {
	search = location.search
}
search.slice(1).split("&").forEach((key_value) => {
	const kv = key_value.split("=");
	urlVar[kv[0]] = kv[1];
})

let isForceLive = false;

function forceLive() {
	isForceLive = true;
}

function isLive() {

	if(isForceLive) return true;

	if(!Object.keys(urlVar).length) return true; //No keys can be read at all, assume live (github pages)

	if(!urlVar || urlVar === '' || urlVar['isLive'] == 'false') return false;

	console.log("Am I live?", urlVar['isLive'], urlVar);

	
	
	//Works for webworkers
	if(urlVar['localStorage'] || urlVar['isLive']) {
		return true;
	}
	
	//Works for fronted
	if(typeof game !== "undefined" && typeof game.urlVar === "function") {
		if(game.urlVar('localStorage')) {
			return true;
		}
	}
	
	return isNative();
}

function isNative() {
	if(isElectron()) {
		return true;
	}
	if(isNw()) {
		return true;
	}
	return false;
}

function isElectron() {
	// Renderer process
	if (typeof window !== "undefined" && typeof window.process === "object" && window.process.type === "renderer") {
		return true;
	}

	// Main process
	if (typeof process !== "undefined" && typeof process.versions === "object" && !!process.versions.electron) {
		return true;
	}

	// Detect the user agent when the `nodeIntegration` option is set to true
	if (
		typeof navigator === "object" &&
		typeof navigator.userAgent === "string" &&
		navigator.userAgent.indexOf("Electron") >= 0
	) {
		return true;
	}
	return false;
}

/**
 * Checks if running in NW.js
 * Works for Web Workers and Browser
 * @returns {boolean} True if NW OR Nodejs false if anything else
 */
function isNw() {
	//Catch for nodejs
	if (!isElectron() && checkIsNodeJs()) {
		return true;
	}

	try {
		if (typeof self !== "undefined" && self.__nw_require) {
			return true;
		}
		if (nw !== undefined) {
			if (nw.Window !== undefined) {
				return true;
			}
		}
	} catch (e) {
		return false;
	}

	return false;
}

export {isNw, isElectron, isLive, forceLive, isNative};

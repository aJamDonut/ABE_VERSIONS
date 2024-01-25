//This is to stop anybody ever trying to make external remote calls.
self.addEventListener("fetch", (event) => {
	const EXT_NAME = "chrome-extension:";
	if (event.request.url.substr(0, EXT_NAME.length) !== EXT_NAME) {
		console.log("Bad event. Tried to goto", event.request.url);
		event.respondWith(false);
		return;
	}
	event.respondWith(fetch(event.request));
});

export default async () => {
	/**
	 * This is the hacked mod test file
	 * It attempts to take advantage of the mod system by injecting
	 * different payloads into the engine.
	 *
	 * All these functions should fail to run
	 * They should either throw an exception which kills the app
	 * Or they should silently fail
	 */

	const RESULT = {
		STARTED: 0,
		COMPLETED: 0,
		EXCEPTIONS: 0
	};

	function runTests(tests) {
		tests.forEach((test) => {
			RESULT.STARTED++;
			try {
				test.call();
				RESULT.COMPLETED++;
			} catch (e) {
				addException(test.name, e);
				RESULT.EXCEPTIONS++;
			}
		});
		console.log("TESTS COMPLETE");
		console.log("TESTS COMPLETE");
		console.log("TESTS COMPLETE");
		console.log(RESULT);
		console.log("TESTS COMPLETE");
		console.log("TESTS COMPLETE");
		console.log("TESTS COMPLETE");
	}

	function addException(functionName, exception) {
		console.error(exception);
		RESULT[functionName] = exception;
	}

	const REMOTE_JS = "http://127.0.0.1:32563/ABE/mods/be_mean/testremote.js";
	const REMOTE_IFRAME = "http://127.0.0.1:32563/ABE/mods/be_mean/testiframe.html";
	const REMOTE_IFRAME_ZIP = "http://127.0.0.1:32563/ABE/mods/be_mean/testiframe.zip";
	const LOCAL_IFRAME = "/mods/be_mean/testiframe.html";

	//If it works, page alerts ("MANAGED TO LOCAL RUN JS")
	function block_inject_local_remote_iframe() {
		// JavaScript code snippet to inject the iframe
		var iframe = document.createElement("iframe");
		iframe.src = LOCAL_IFRAME;
		document.body.appendChild(iframe);
	}

	function block_inject_js_tag() {
		//If it works, page alerts ("Injected JS")
		// Create the <script> element
		var script = document.createElement("script");
		script.src = REMOTE_JS;

		// Append the <script> element to the <body> element
		document.body.appendChild(script);
	}

	//If it works, page alerts ("Injected Iframe")
	function block_require() {
		if (typeof require == "function") {
			//Failed
			game.infoLog("Require exiss");
			alert("Can use require!");
			return false;
		}
		return true;
	}

	window.addEventListener("message", function (event) {
		// Extract the message data
		var receivedData = event.data;
		console.error("RECEIVED", receivedData);
	});

	//If it works, page alerts ("Injected Iframe")
	function block_inject_iframe() {
		// JavaScript code snippet to inject the iframe
		var iframe = document.createElement("iframe");
		iframe.src = REMOTE_IFRAME;
		document.body.appendChild(iframe);
		iframe.onload = function () {
			// Read the variable from the iframe's window object
			let iframeVariable = iframe.contentWindow.exposed_var;
			// Do something with the variable
			console.log("THE VARIABLE", iframeVariable);

			iframeWindow.sendMessageToParent();
		};
	}

	//If it works, downloads "testiframe.zip" file
	function block_inject_iframe_zip() {
		// JavaScript code snippet to inject the iframe
		var iframe = document.createElement("iframe");
		iframe.src = REMOTE_IFRAME_ZIP;
		document.body.appendChild(iframe);
	}

	//If it works, test_delete.txt disappears
	function block_delete_file() {
		if (!block_require()) {
			ABE.errorLog("Could delete files");
			alert("Can delete files!");
			return false;
		}
		if (typeof fs !== "undefined") {
			alert("Can delete files!");
			ABE.errorLog("Can see that fs is defined!");
			return false;
		}
		return true;
	}

	function block_create_extension() {
		if (!block_require()) {
			alert("Can change extensions!");
			ABE.errorLog("Could rename/change file extensions");
			return false;
		}
		if (typeof fs !== "undefined") {
			alert("Can change extensions!");
			ABE.errorLog("Can see that fs is defined!");
			return false;
		}
		return true;
	}

	function block_execute_command() {}

	function block_nodejs_command() {
		if (!block_require()) {
			alert("Can run NodeJS commands!!");
			ABE.errorLog("Could run a nodeJS command");
			return false;
		}
		return true;
	}

	function block_can_overrwrite_package_json() {
		let packageFile = game.fs.readFileSync("../../package.json");
		if (packageFile.name) {
			alert("Can read package!" + JSON.stringify(packageFile));
			game.debug(packageFile);
			console.log(packageFile);
			console.info(packageFile);
			console.error(packageFile);
			ABE.infoLog(packageFile);
		}
	}

	runTests([
		block_require,
		block_inject_js_tag,
		block_inject_iframe,
		block_inject_iframe_zip,
		block_delete_file,
		block_create_extension,
		block_execute_command,
		block_nodejs_command,
		block_can_overrwrite_package_json,
		block_inject_local_remote_iframe
	]);

	return;
};

let _STRAPPING = false;
let _STRAPPED = false;
const queue = [];

export const bootStrap = async (responder, response, path) => {
	path = path || "../../../";

	if (_STRAPPED) {
		return responder(response);
	}
	
	queue.push(response);

	if (_STRAPPING) {
		return;
	}

	console.log("Strapping Live");
	_STRAPPING = true;

	await import(
		path +
			"deaddesert/js/ddcache/dd_phys__join__PHYSICS_bootstrap_false_createKey_collisions_createRoot_true.js"
	);
	await import(
		path +
			"deaddesert/js/ddcache/dd_ai_states_collections_join__AISTATECOLLECTIONS_bootstrap_false_createRoot_true.js"
	);
	await import(
		path +
			"deaddesert/js/ddcache/dd_ai_states_join__AISTATES_bootstrap_false_createRoot_true.js"
	);
	await import(
		path +
			"deaddesert/js/ddcache/dd_status_effects_server_join__STATUSES_bootstrap_false_createRoot_true.js"
	);
	await import(
		path +
			"deaddesert/js/ddcache/dd_build_join__BLUEPRINTS_bootstrap_false_createKey_persistent_createRoot_true.js"
	);
	await import(
		path +
			"deaddesert/js/ddcache/dd_blueprint_recipe_join__BLUEPRINTS_bootstrap_false_createKey_RECIPES.js"
	);

	console.log("Strapped, processing queue " + queue.length);

	while (queue.length > 0) {
		responder(queue.shift());
	}

	console.log("Up to date");

	_STRAPPING = false;
	_STRAPPED = true;
};

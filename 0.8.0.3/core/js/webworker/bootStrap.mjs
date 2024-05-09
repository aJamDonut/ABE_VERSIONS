let _STRAPPING = false;
let _STRAPPED = false;
const queue = [];

export const bootStrap = async (responder, response) => {
	if (_STRAPPED) {
		return responder(response);
	}

	queue.push(response);

	if (_STRAPPING) {
		return;
	}

	console.log("Strapping");
	_STRAPPING = true;

	await import(
		"/gd_cp_modules/http/modules/gd_mod_2d/dev_stubs/ext_ez_load.php?source=deaddesert&export=phys_&join=_PHYSICS&bootstrap=false&createKey=collisions&createRoot=true"
	);
	await import(
		"/gd_cp_modules/http/modules/gd_mod_2d/dev_stubs/ext_ez_load.php?source=deaddesert&export=ai_states_collections&join=_AISTATECOLLECTIONS&bootstrap=false&createRoot=true"
	);
	await import(
		"/gd_cp_modules/http/modules/gd_mod_2d/dev_stubs/ext_ez_load.php?source=deaddesert&export=ai_states&join=_AISTATES&bootstrap=false&createRoot=true"
	);
	await import(
		"/gd_cp_modules/http/modules/gd_mod_2d/dev_stubs/ext_ez_load.php?source=deaddesert&export=status_effects_server&join=_STATUSES&bootstrap=false&createRoot=true"
	);
	//TODO: the file below is a duplicate file of all buildable objects, consider sharing file between front and back end
	await import(
		"/gd_cp_modules/http/modules/gd_mod_2d/dev_stubs/ext_ez_load.php?source=deaddesert&export=build&join=_BLUEPRINTS&bootstrap=false&createKey=persistent&createRoot=true&noIffe=true"
	);
	await import(
		"/gd_cp_modules/http/modules/gd_mod_2d/dev_stubs/ext_ez_load.php?source=deaddesert&export=blueprint_recipe&join=_BLUEPRINTS&bootstrap=false&createKey=RECIPES"
	);

	console.log("Strapped, processing queue " + queue.length);

	while (queue.length > 0) {
		responder(queue.shift());
	}

	console.log("Up to date");

	_STRAPPING = false;
	_STRAPPED = true;
	console.log("STATES", _AISTATECOLLECTIONS)
};

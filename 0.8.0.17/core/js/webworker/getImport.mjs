import {isLive} from "../shared/Environment.mjs";

export async function getImport(exportPath, join, bootstrap, key) {
    const live = isLive();
    
    if(!join) {
        join === "_BLUEPRINTS";
    }

    if(typeof bootstrap === "undefined") {
        bootstrap = "false";
    }

    if(typeof key === "undefined") {
        key = exportPath.toUpperCase();
    }

    if(live) {
        return `../../../deaddesert/js/ddcache/dd_${exportPath}_join_${join}_bootstrap_${bootstrap}_createKey_${key}.js`
    } else {
        return `/gd_cp_modules/http/modules/gd_mod_2d/dev_stubs/ext_ez_load.php?source=deaddesert&export=${exportPath}&join=${join}&bootstrap=${bootstrap}&createKey=${key}`;
    }
}

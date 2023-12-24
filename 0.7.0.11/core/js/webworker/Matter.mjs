/**
 * Bit of a weird file. Converts Matter from CJS to ESM but also works
 * with rollup to avoid error.
 * Warning: changing this file can cause isssssuuuues!!
 */
/*
import * as MatterJs from "../../../lib/matterjs/matter.esm.mjs";

console.log(JSON.stringify(MatterJs));
/*
let Matter = self.Matter;

function nowPolyFill() {
	//Polyfill (it looks for window.performance)
	return new Date().getSeconds() - Matter.Common._nowStartTime;
}

let newMatter = {...Matter, Common: {...Matter.Common, now: nowPolyFill}};
*/
export default MatterJs;

//import {EasyStar} from "../../../lib/easystar/custom.easystar-0.4.4.min.mjs";

import {EasyStar} from "../../../lib/easystar/custom.easystar-0.4.4.min.mjs";

class PathFinder {
	constructor(tileSize, mapDimension, helper) {
		this.helper = helper;

		this.mapData = []; //mapData;
		var pf = new EasyStar.js();
		this.pf = pf;
		this.tileSize = tileSize || 64;
		this.mapDimension = mapDimension || 60;
		this.pf.enableDiagonals();
		this.pf.enableFindNearest();
		this.pf.setAcceptableTiles([0, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

		this.pf.setTileCost(0, 10);
		this.pf.setTileCost(2, 20);
		this.pf.setTileCost(3, 30);
		this.pf.setTileCost(4, 40);
		this.pf.setTileCost(5, 50);
		this.pf.setTileCost(6, 60);

		this.pf.setIterationsPerCalculation(10000); //Won't allow searches that take more than 10000 iterations

		this.importDefaultGrid();
		//... setting to work for just player only
	}

	async importDefaultGrid() {
		//@ts-ignore
		const {mapData} = await import("../../../deaddesert/js/data/preloadGrid.mjs");

		this.setGrid(mapData);
		
	}

	cancel(id) {
		this.pf.cancelPath(id);
	}

	setGrid(grid) {
		this.pf.setGrid(grid);
	}

	getGrid() {
		return this.pf.getGrid(); //If this fails, its a custom function added to easystar basically return collisionGrid;
	}

	setAdditionalPointCost(row, column, cost) {
		//this.helper.debugObject(column*64, row*64, 64, 64);
		this.pf.setAdditionalPointCost(column, row, cost * 10);
	}

	avoidAdditionalPoint(row, column) {
		this.pf.avoidAdditionalPoint(column, row);
	}

	stopAvoidingAdditionalPoint(row, column) {
		this.pf.stopAvoidingAdditionalPoint(column, row);
	}

	findPath(x, y, endX, endY, callback, isPlayer) {
		if (isPlayer) {
			return this.pf.findPath(x, y, endX, endY, callback, 0, true);
		} else {
			return this.pf.findPath(x, y, endX, endY, callback, false, true);
		}
	}

	calculate() {
		this.pf.calculate();
	}
}

export default PathFinder;

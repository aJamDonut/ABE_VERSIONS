export default async () => {
	//Trigger on every new session incase enabled mid-game
	game.ee.on("game_started", () => {
		let recipes = Object.keys(_BLUEPRINTS.RECIPES);
		for (let i = 0; i < recipes.length; i++) {
			game.session.unlockRecipe(recipes[i]);
		}
		game.notify("All recipes unlocked");
	});
	return;
};

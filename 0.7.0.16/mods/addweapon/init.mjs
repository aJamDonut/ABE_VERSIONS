export default async () => {
	//We will use bootstrap_pre so we're before the spritesheet loader
	game.ee.on("boostrap_pre", () => {
		//Step 1. First add the spritesheet (all spritesheets exist on the TILESET blueprint list)
		_BLUEPRINTS.TILESETS.my_new_sheet = {
			name: "Weapons", // A name for developers to read what it is
			filename: "../../mods/addweapon/weapons.png", //The source file (for mods this must include your path)
			blockSize: 1, // Just keep this to one
			parent: "tileset_all" // Optional, way to categorize tilesets and spritesheets
		};

		//Step 2. Add the sprite
		_BLUEPRINTS.SPRITES.sprite_my_katana = {
			tileset: "my_new_sheet", // Use the same name we used before
			name: "Katana Sprite", // The name of the weapons sprite
			description: "...", // Optional for developers to read what it is
			across: 0, // The X position on the spritesheet
			down: 512, // The Y position on the spritesheet
			w: 128, // The width of the sprite on the spritesheet
			h: 64 // The height of the sprite on the spritesheet
		};

		//Step 3. Add the katana Item
		_BLUEPRINTS.INV_ITEMS.ss_weapon_my_katana = {
			name: "Katana",
			sprite: "sprite_my_katana", // The same sprite you created earlier
			meta: {
				description: "It's my katana!", // A description shown when hovering over the weapon
				weight: 1, // Weight in kg
				contextOptions: "equipt", // Most items can be equipt
				slots: "weapon", // Only fits into weapon slots
				blockWidth: 4, // Takes up 4 slots width in the inventory screen
				blockHeight: 2, // Takes up 2 slots width in the inventory screen
				stance: "melee", // Is a melee item, 'ranged' for guns
				value: 1200 // Default value when bought in shops
			},
			//Events are run at certain times, e.g. on equipt, on create, on use etc
			events: {
				//When the item is equipt, we declare the bullet (even in melee) which is used
				//We will just use data variables here, and actually set the variables onCreate (better)
				onCreate: function (item, life) {
					item.addExtension("ext_bullet_default", {
						BASE_DMG: 20, // The base damage of this item
						LIFETIME: 0.1, // The range of this item (short for melee, long for ranged)
						SPEED: 0.2, // How fast the attack is
						BLEED_DURATION: 10, // Bleed Duration used in status effect
						BLEED_CHANCE: 10, // Bleed Chance used in status effect
						SPRITE: "projectile_melee", // The sprite or ComplexItem that the bullet uses
						TYPE: "sharp" // The type of damage this bullet uses (others include 'blunt')
					});
				},
				onEquipt: function (item, life) {
					life.data.bullet = {
						//Add base damage and any unique statuses here
						statuses: [
							{
								status: "damage", // Always provide a damage status, if the bullet does damage
								dmg: item.data.BASE_DMG,
								type: item.data.TYPE
							},
							{
								status: "bleed", // Another status effect which causes bleed over time
								duration: item.data.BLEED_DURATION,
								chance: item.data.BLEED_CHANCE
							}
						],
						sprite: item.data.SPRITE, // The sprite for this bullet
						lifetime: item.data.LIFETIME,
						speed: item.data.SPEED
					};
				}
			},
			parent: "ss_items_swords" // Category for developers
		};
	});
};

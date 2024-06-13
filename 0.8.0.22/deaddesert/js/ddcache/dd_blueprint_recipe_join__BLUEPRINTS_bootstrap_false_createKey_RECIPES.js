(function () {
  _BLUEPRINTS.RECIPES = {};
  _BLUEPRINTS.RECIPES.recipe_ss_rags2 = {
    "crafts": 'ss_rags2',
    "sprite": 'body_rags2',
    "require": 'fiber',
    "amount": '10',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'armor',
    "parent": 'blueprint_recipe_all',
    "name": 'Rags 2'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_snarebow = {
    "crafts": 'ss_weapon_snarebow',
    "sprite": 'weapon_snarebow',
    "require": 'adhesive,wood,fiber',
    "amount": '10,20,20',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'weapons',
    "parent": 'blueprint_recipe_all',
    "name": 'Snarebow'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_bandana = {
    "crafts": 'ss_mask_bandana',
    "sprite": 'mask_bandana',
    "crafted_in": 'ss_loom',
    "require": 'fiber',
    "amount": '6',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'armor',
    "parent": 'blueprint_recipe_all',
    "name": 'Bandana'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_clone_shirt = {
    "crafts": 'ss_clone_shirt',
    "sprite": 'body_cloneshirt',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin',
    "amount": '10,4',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'armor',
    "parent": 'blueprint_recipe_all',
    "name": 'Clone Shirt'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_plainmask = {
    "crafts": 'ss_mask_plainmask',
    "sprite": 'mask_plainmask',
    "crafted_in": 'ss_smithy',
    "require": 'sheetmetal',
    "amount": '1',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'armor',
    "parent": 'blueprint_recipe_all',
    "name": 'Plain Mask'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_plate_armor = {
    "crafts": 'ss_plate_armor',
    "sprite": 'body_platemail',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin,sheetmetal',
    "amount": '18,15,20',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'armor',
    "parent": 'blueprint_recipe_all',
    "name": 'Ropey Platmail'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_docoscope = {
    "crafts": 'ss_mask_docoscope',
    "sprite": 'mask_docoscope',
    "require": 'adhesive',
    "amount": '50000,10000',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'armor',
    "parent": 'blueprint_recipe_all',
    "name": 'Docoscope'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_club_w = {
    "crafts": 'ss_weapon_club_w',
    "sprite": 'weapon_wooden_club',
    "require": 'wood',
    "amount": '30',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'weapons',
    "parent": 'blueprint_recipe_all',
    "name": 'Wooden Club'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_body_tunic_1 = {
    "crafts": 'ss_body_tunic_1',
    "sprite": 'body_tunic_1',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin,sheetmetal',
    "amount": '20,10,10',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'ss_plate_armor',
    "parent": 'blueprint_recipe_all',
    "name": 'Adapted Tunic Mk 1'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_pickaxe = {
    "crafts": 'ss_weapon_pickaxe',
    "sprite": 'weapon_pickaxe',
    "require": 'adhesive',
    "amount": '5,5',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'survival',
    "parent": 'blueprint_recipe_all',
    "name": 'Pickaxe'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_rusty_katana = {
    "crafts": 'ss_weapon_rusty_katana',
    "sprite": 'weapon_rusty_katana',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,wood,fiber,sheetmetal',
    "amount": '1,25,25,5',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'weapons',
    "parent": 'blueprint_recipe_all',
    "name": 'Rusty Katana'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_hatchet_st = {
    "crafts": 'ss_weapon_hatchet_st',
    "sprite": 'weapon_hatchet_stone',
    "require": 'wood,stone',
    "amount": '50,50,50',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'survival',
    "parent": 'blueprint_recipe_all',
    "name": 'Stone Hatchet'
  };
  _BLUEPRINTS.RECIPES.recipe_pers_worlditem_craftingbench = {
    "crafts": 'pers_worlditem_craftingbench',
    "sprite": 'sprite_craftingworkbench',
    "crafted_in": 'build',
    "require": 'building_material',
    "amount": '5',
    "researchRequire": 'research_node',
    "researchAmount": '2',
    "researchParent": 'building',
    "parent": 'blueprint_recipe_all',
    "name": 'Crafting Bench'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_loom = {
    "crafts": 'ss_loom',
    "sprite": 'sprite_loom',
    "crafted_in": 'build',
    "require": 'building_material',
    "amount": '10',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'building',
    "parent": 'blueprint_recipe_all',
    "name": 'Crafting Loom'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_smithy = {
    "crafts": 'ss_smithy',
    "sprite": 'sprite_smithy',
    "crafted_in": 'build',
    "require": 'building_material,metalingot',
    "amount": '10,5',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'building',
    "parent": 'blueprint_recipe_all',
    "name": 'Crafting Smithy'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_rusty_plank = {
    "crafts": 'ss_weapon_rusty_plank',
    "sprite": 'weapon_rusty_plank',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,wood,fiber,sheetmetal',
    "amount": '2,25,30,10',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'weapons',
    "parent": 'blueprint_recipe_all',
    "name": 'Rusty Plank'
  };
  _BLUEPRINTS.RECIPES.recipe_pers_worlditem_smelter = {
    "crafts": 'pers_worlditem_smelter',
    "sprite": 'sprite_smelter',
    "crafted_in": 'build',
    "require": 'building_material',
    "amount": '10',
    "researchRequire": 'research_node',
    "researchAmount": '2',
    "researchParent": 'building',
    "parent": 'blueprint_recipe_all',
    "name": 'Smelter'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_splicer = {
    "crafts": 'ss_splicer',
    "sprite": 'sprite_splicer',
    "crafted_in": 'build',
    "require": 'adhesive,sinchip,nano_chip,roboeye,mechscrap',
    "amount": '5,1,5,2,5',
    "researchRequire": 'research_node,sinstone',
    "researchAmount": '3,2',
    "researchParent": 'building',
    "parent": 'blueprint_recipe_all',
    "name": 'Splicer'
  };
  _BLUEPRINTS.RECIPES.recipe_pers_worlditem_fabricator = {
    "crafts": 'pers_worlditem_fabricator',
    "sprite": 'sprite_fabricator',
    "crafted_in": 'build',
    "require": 'building_material,metalingot,sinchip',
    "amount": '15,20,1',
    "researchRequire": 'research_node,sinchip',
    "researchAmount": '10,5',
    "researchParent": 'building',
    "parent": 'blueprint_recipe_all',
    "name": 'Fabricator'
  };
  _BLUEPRINTS.RECIPES.recipe_satchel = {
    "crafts": 'ss_backpack_satchel',
    "sprite": 'backpack_small',
    "crafted_in": 'ss_loom',
    "require": 'wood,fiber,skin',
    "amount": '6,25,10',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Backpack Satchel'
  };
  _BLUEPRINTS.RECIPES.recipe_recycler = {
    "crafts": 'ss_item_recycler',
    "sprite": 'sprite_smallrecycler',
    "require": 'components',
    "amount": '100',
    "researchAmount": '2',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Recycler'
  };
  _BLUEPRINTS.RECIPES.recipe_pers_worlditem_campfire = {
    "crafts": 'pers_worlditem_campfire',
    "sprite": 'sprite_campfire',
    "crafted_in": 'build',
    "require": 'wood,stone',
    "amount": '10,10',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "parent": 'blueprint_recipe_all',
    "name": 'Camp fire'
  };
  _BLUEPRINTS.RECIPES.recipe_template = {
    "crafts": 'ss_backpack_satchel',
    "require": 'carbon,adhesive',
    "amount": '50000,10000',
    "sprite": 'backpack_small',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Template'
  };
  _BLUEPRINTS.RECIPES.recipe_sign_wooden = {
    "crafts": 'ss_item_sign_wooden',
    "require": 'wood',
    "amount": '10',
    "sprite": 'sprite_sign_wooden',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Wooden Sign'
  };
  _BLUEPRINTS.RECIPES.recipe_bed = {
    "crafts": 'ss_item_bed',
    "sprite": 'sprite_bed',
    "crafted_in": 'utility',
    "require": 'wood,adhesives,fabric',
    "amount": '10,10,10',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "parent": 'blueprint_recipe_all',
    "name": 'Bed'
  };
  _BLUEPRINTS.RECIPES.recipe_barricade_v = {
    "crafts": 'ss_item_barricade_v',
    "require": 'wood,adhesives,fabric',
    "amount": '100,25,25',
    "sprite": 'sprite_barricade_v',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Barricade Vertical'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_item_bandage_small = {
    "crafts": 'ss_item_bandage_small',
    "sprite": 'sprite_bandage_small',
    "require": 'fiber',
    "amount": '10',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'survival',
    "parent": 'blueprint_recipe_all',
    "name": 'Small Bandage'
  };
  _BLUEPRINTS.RECIPES.recipe_bandage_large = {
    "crafts": 'ss_item_bandage_large',
    "sprite": 'sprite_bandage_large',
    "crafted_in": 'ss_chembench',
    "require": 'adhesive,whitemeat,skin',
    "amount": '1,10,5',
    "researchAmount": '2',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Large Bandage'
  };
  _BLUEPRINTS.RECIPES.recipe_training_dummy = {
    "crafts": 'ss_item_training_dummy',
    "sprite": 'sprite_training_dummy',
    "crafted_in": 'utility',
    "require": 'wood,skin,fiber',
    "amount": '12,6,10',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "parent": 'blueprint_recipe_all',
    "name": 'Training Dummy'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_crossbow = {
    "crafts": 'ss_weapon_crossbow',
    "sprite": 'wep_crossbow',
    "require": 'wood,fiber',
    "amount": '6,10',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Crossbow'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_sickle_st = {
    "crafts": 'ss_weapon_sickle_st',
    "require": 'wood,stone,fabric',
    "amount": '50,75,75',
    "sprite": 'weapon_sickle_stone',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Stone Sickle'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_container_smallstorage = {
    "crafts": 'ss_container_smallstorage',
    "sprite": 'container_5',
    "crafted_in": 'utility',
    "require": 'wood',
    "amount": '10',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "parent": 'blueprint_recipe_all',
    "name": 'Small Storage Container'
  };
  _BLUEPRINTS.RECIPES.recipe_pers_worlditem_materialbench = {
    "crafts": 'pers_worlditem_materialbench',
    "sprite": 'sprite_stonebench',
    "crafted_in": 'build',
    "require": 'wood,stone',
    "amount": '10,10',
    "researchAmount": '2',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Material Bench'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_item_building_material = {
    "crafts": 'ss_item_building_material',
    "sprite": 'sprite_buildingmaterial',
    "crafted_in": 'materialbench',
    "require": 'wood',
    "amount": '3',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Building Material'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_item_cookedmeat = {
    "crafts": 'ss_item_cookedmeat',
    "sprite": 'sprite_meat_cooked',
    "crafted_in": 'campfire',
    "require": 'rawmeat',
    "amount": '1',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Cooked Meat'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_ranchet = {
    "crafts": 'ss_mask_ranchet',
    "sprite": 'mask_rancher',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin',
    "amount": '10,10',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'ss_mask_bandana',
    "parent": 'blueprint_recipe_all',
    "name": 'Rancher Hat'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_rust_redword = {
    "crafts": 'ss_weapon_rust_redword',
    "sprite": 'weapon_rusty_redsword',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,wood,fiber,spidereye,sheetmetal',
    "amount": '1,10,10,1,6',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'weapons',
    "parent": 'blueprint_recipe_all',
    "name": 'Rusty Redword'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_rags = {
    "crafts": 'ss_rags',
    "sprite": 'body_rags',
    "require": 'fiber,skin',
    "amount": '10,2',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Rags'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_body_camo = {
    "crafts": 'ss_body_camo',
    "sprite": 'body_camo',
    "require": 'fiber,skin',
    "amount": '25,25',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'ss_rags2',
    "parent": 'blueprint_recipe_all',
    "name": 'Camo Jacket'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_item_weakrope = {
    "crafts": 'ss_item_weakrope',
    "sprite": 'item_weak_rope',
    "require": 'wood,fiber,skin',
    "amount": '6,40,2',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'survival',
    "parent": 'blueprint_recipe_all',
    "name": 'Weak Rope'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_backpack_satchel = {
    "crafts": 'ss_backpack_satchel',
    "sprite": 'backpack_satchel',
    "require": 'wood,fiber,skin',
    "amount": '10,20,5',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'armor',
    "parent": 'blueprint_recipe_all',
    "name": 'Satchel Backback'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_shinai = {
    "crafts": 'ss_weapon_shinai',
    "sprite": 'weapon_stick',
    "require": 'wood',
    "amount": '20',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Shinai'
  };
  _BLUEPRINTS.RECIPES.recipe_woodwall = {
    "crafts": 'pers_worlditem_buildwall',
    "sprite": 'icon_build_spot',
    "crafted_in": 'build',
    "require": 'wood',
    "amount": '2',
    "researchAmount": '1',
    "parent": 'blueprint_recipe_all',
    "name": 'Wood Wall'
  };
  _BLUEPRINTS.RECIPES.recipe_pers_worlditem_buildwall = {
    "crafts": 'pers_worlditem_buildwall',
    "sprite": 'icon_build_spot',
    "crafted_in": 'build',
    "require": 'wood',
    "amount": '1',
    "researchAmount": '1',
    "parent": 'blueprint_recipe_all',
    "name": 'Build Wall Job'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_solar_small = {
    "crafts": 'ss_solar_small',
    "sprite": 'sprite_solar_small',
    "crafted_in": 'build',
    "require": 'adhesive,composites,building_material,sheetmetal',
    "amount": '1,9,10,15',
    "researchAmount": '2',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Solar Panel Small'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_clone_jacket = {
    "crafts": 'ss_clone_jacket',
    "sprite": 'body_clonejacket',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin',
    "amount": '15,8',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'ss_clone_shirt',
    "parent": 'blueprint_recipe_all',
    "name": 'Clone Jacket'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_sin_armor = {
    "crafts": 'ss_sin_armor',
    "sprite": 'body_sin_1',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin,sinchip',
    "amount": '29,15,2',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'SinCorp Armor'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_body_bluedress = {
    "crafts": 'ss_body_bluedress',
    "sprite": 'body_bluedress',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin',
    "amount": '15,8',
    "researchAmount": '2',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Blue Dress'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_body_pinkdress = {
    "crafts": 'ss_body_pinkdress',
    "sprite": 'body_pinkdress',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin',
    "amount": '15,8',
    "researchAmount": '2',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Pink Dress'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_body_tunic_2 = {
    "crafts": 'ss_body_tunic_2',
    "sprite": 'body_tunic_2',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin,sheetmetal',
    "amount": '20,10,10',
    "researchAmount": '2',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Adapted Tunic Mk 2'
  };
  _BLUEPRINTS.RECIPES.recipe_body_royalarmor = {
    "crafts": 'ss_item_body_royalarmor',
    "sprite": 'body_royalarmor',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin,composites,sheetmetal',
    "amount": '35,20,1,15',
    "researchAmount": '5',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Royal Armor'
  };
  _BLUEPRINTS.RECIPES.recipe_body_royal = {
    "crafts": 'ss_item_body_royal',
    "sprite": 'body_royal',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin,sheetmetal',
    "amount": '28,15,10',
    "researchAmount": '5',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Royal Garment'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_clone_jacket2 = {
    "crafts": 'ss_clone_jacket2',
    "sprite": 'body_clonejacket2',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin',
    "amount": '15,8',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Clone Jacket 2'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_clone_shirt2 = {
    "crafts": 'ss_clone_shirt2',
    "sprite": 'body_cloneshirt2',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin',
    "amount": '10,4',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Clone Shirt 2'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_body_spacevader_1 = {
    "crafts": 'ss_body_spacevader_1',
    "sprite": 'body_spacevader_1',
    "crafted_in": 'ss_loom',
    "require": 'fiber,composites,sheetmetal',
    "amount": '50,5,15',
    "researchAmount": '2',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Spacevader Mk 1'
  };
  _BLUEPRINTS.RECIPES.recipe_body_techdress = {
    "crafts": 'ss_item_body_techdress',
    "sprite": 'body_techdress',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin,composites,sheetmetal',
    "amount": '23,7,1,4',
    "researchAmount": '5',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Tech Dress'
  };
  _BLUEPRINTS.RECIPES.recipe_body_robot_slim = {
    "crafts": 'ss_item_body_robot_slim',
    "sprite": 'body_robot_slim',
    "crafted_in": 'ss_loom',
    "require": 'adhesive,composites,sheetmetal,redgem',
    "amount": '1,5,20,1',
    "researchAmount": '5',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Slim Robot Body'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_failedclone = {
    "crafts": 'ss_mask_failedclone',
    "sprite": 'mask_failedclone',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin',
    "amount": '4,15',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Failed Clone Mask'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_gasmask = {
    "crafts": 'ss_mask_gasmask',
    "sprite": 'mask_gasmask',
    "crafted_in": 'ss_loom',
    "require": 'fiber,sheetmetal',
    "amount": '15,9',
    "researchAmount": '2',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Gas Mask'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_staff = {
    "crafts": 'ss_mask_staff',
    "sprite": 'mask_staff',
    "crafted_in": 'ss_loom',
    "require": 'fiber,sheetmetal,glass',
    "amount": '10,7,4',
    "researchAmount": '5',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Staff Mask'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_farmerhat = {
    "crafts": 'ss_mask_farmerhat',
    "sprite": 'mask_farmerhat',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin,sheetmetal',
    "amount": '16,5,1',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Farmer Hat'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_body_gray = {
    "crafts": 'ss_body_gray',
    "sprite": 'body_gray',
    "require": 'whitemeat',
    "amount": '2',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Dead Head Skin'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_eyescanner = {
    "crafts": 'ss_mask_eyescanner',
    "sprite": 'mask_eyescanner',
    "crafted_in": 'ss_loom',
    "require": 'sheetmetal,roboeye,mechscrap',
    "amount": '4,1,7',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_mask_plainmask',
    "parent": 'blueprint_recipe_all',
    "name": 'Eye Scanner'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_deathspawneye = {
    "crafts": 'ss_mask_deathspawneye',
    "sprite": 'mask_deathspawneye',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin,spidereye',
    "amount": '4,7,1',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Deathspawn Eye'
  };
  _BLUEPRINTS.RECIPES.recipe_mask_robothead = {
    "crafts": 'ss_item_mask_robothead',
    "sprite": 'mask_robothead',
    "crafted_in": 'ss_loom',
    "require": 'sheetmetal,glass,roboeye',
    "amount": '15,3,1',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Robot Head'
  };
  _BLUEPRINTS.RECIPES.recipe_body_robot = {
    "crafts": 'ss_item_body_robot',
    "sprite": 'body_robot',
    "crafted_in": 'ss_loom',
    "require": 'composites,sheetmetal,redgem,mechscrap',
    "amount": '2,20,1,4',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Robot Body'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_sunshades = {
    "crafts": 'ss_mask_sunshades',
    "sprite": 'mask_sunglasses',
    "crafted_in": 'ss_loom',
    "require": 'skin,sheetmetal,glass',
    "amount": '5,3,4',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "researchParent": 'ss_mask_docoscope',
    "parent": 'blueprint_recipe_all',
    "name": 'Sun Shades'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_deathspawn = {
    "crafts": 'ss_mask_deathspawn',
    "sprite": 'mask_deathspawn',
    "crafted_in": 'ss_loom',
    "require": 'skin,spidereye,sheetmetal,glass',
    "amount": '8,2,10,4',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Deathspawn Mask'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_deadhead = {
    "crafts": 'ss_mask_deadhead',
    "sprite": 'mask_throwbackmask',
    "crafted_in": 'ss_loom',
    "require": 'whitemeat',
    "amount": '2',
    "researchAmount": '1',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Dead Head Face Mask'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_happymask = {
    "crafts": 'ss_mask_happymask',
    "sprite": 'mask_happymask',
    "crafted_in": 'ss_loom',
    "require": 'wood,fiber,skin,sheetmetal',
    "amount": '11,5,3,5',
    "researchAmount": '2',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Happy Mask'
  };
  _BLUEPRINTS.RECIPES.recipe_mask_alexhead = {
    "crafts": 'ss_item_mask_alexhead',
    "sprite": 'mask_alexhead',
    "crafted_in": 'ss_loom',
    "require": 'adhesive,sheetmetal,mechscrap',
    "amount": '1,30,10',
    "researchAmount": '5',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Alex Head'
  };
  _BLUEPRINTS.RECIPES.recipe_mask_collector = {
    "crafts": 'ss_item_mask_collector',
    "sprite": 'mask_collector',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin,sheetmetal',
    "amount": '13,20,3',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Collector Mask'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_thejester = {
    "crafts": 'ss_mask_thejester',
    "sprite": 'mask_thejester',
    "crafted_in": 'ss_loom',
    "require": 'wood,fiber,skin,sheetmetal',
    "amount": '10,9,5,10',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'The Jester'
  };
  _BLUEPRINTS.RECIPES.recipe_mask_spherehead = {
    "crafts": 'ss_item_mask_spherehead',
    "sprite": 'mask_spherehead',
    "crafted_in": 'ss_loom',
    "require": 'composites,roboeye,mechscrap',
    "amount": '3,1,20',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Sphere head'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_katana = {
    "crafts": 'ss_weapon_katana',
    "sprite": 'weapon_katana',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,wood,skin,composites',
    "amount": '1,15,10,24',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_weapon_rusty_katana',
    "parent": 'blueprint_recipe_all',
    "name": 'Katana'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_sabre = {
    "crafts": 'ss_weapon_sabre',
    "sprite": 'weapon_sabre',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,skin,composites,sheetmetal',
    "amount": '1,5,15,10',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Sabre'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_black_katana = {
    "crafts": 'ss_weapon_black_katana',
    "sprite": 'weapon_black_katana',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,skin,composites,darkiron',
    "amount": '4,30,20,15',
    "researchRequire": 'research_node,sinstone',
    "researchAmount": '3',
    "researchParent": 'ss_weapon_katana',
    "parent": 'blueprint_recipe_all',
    "name": 'Black Katana'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_reine_plank = {
    "crafts": 'ss_weapon_reine_plank',
    "sprite": 'weapon_reine_plank',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,composites,redbar',
    "amount": '10,25,25',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_weapon_rusty_plank',
    "parent": 'blueprint_recipe_all',
    "name": 'Reine Plank'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_skedeye_clipper = {
    "crafts": 'ss_weapon_skedeye_clipper',
    "sprite": 'weapon_skedeye_clipper',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,wood,fiber,skin,spidereye,composites,sheetmetal',
    "amount": '2,20,11,13,4,23,7',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Skedeye Clipper'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_boomstick = {
    "crafts": 'ss_weapon_boomstick',
    "sprite": 'sprite_boomstick',
    "crafted_in": 'loadingbench',
    "require": 'adhesive,wood,fiber,skin,composites',
    "amount": '2,18,10,13,23',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "parent": 'blueprint_recipe_all',
    "name": 'Boomstick'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_bow = {
    "crafts": 'ss_weapon_bow',
    "sprite": 'weapon_bow',
    "crafted_in": 'craftingbench',
    "require": 'adhesive,wood,fiber,skin,composites',
    "amount": '1,7,8,10,15',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "parent": 'blueprint_recipe_all',
    "name": 'Bow'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_abow = {
    "crafts": 'ss_weapon_abow',
    "sprite": 'weapon_advancedbow',
    "crafted_in": 'craftingbench',
    "require": 'adhesive,wood,fiber,skin,composites,mechscrap',
    "amount": '2,15,10,12,5,10',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "parent": 'blueprint_recipe_all',
    "name": 'Advanced Bow'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_kunai = {
    "crafts": 'ss_weapon_kunai',
    "sprite": 'weapon_kunai',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,fiber,darkiron',
    "amount": '2,5,10',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Kunai'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_shuriken = {
    "crafts": 'ss_weapon_shuriken',
    "sprite": 'weapon_shuriken',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,composites',
    "amount": '1,10',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Shuriken'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_sin_baton = {
    "crafts": 'ss_weapon_sin_baton',
    "sprite": 'weapon_baton',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,composites,sinchip,sheetmetal,nano_chip',
    "amount": '1,30,1,10,1',
    "researchRequire": 'research_node,sinstone',
    "researchAmount": '3',
    "researchParent": 'ss_weapon_club_w',
    "parent": 'blueprint_recipe_all',
    "name": 'Sin Baton'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_item_bedroll = {
    "crafts": 'ss_item_bedroll',
    "sprite": 'sprite_bedroll',
    "require": 'fiber,skin',
    "amount": '20,10',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Bedroll'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_util_bedroll = {
    "crafts": 'ss_util_bedroll',
    "sprite": 'sprite_bed',
    "crafted_in": 'utility',
    "require": 'bedroll',
    "amount": '1',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "parent": 'blueprint_recipe_all',
    "name": 'Bedroll'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_item_redbar = {
    "crafts": 'ss_item_redbar',
    "sprite": 'sprite_redbar',
    "crafted_in": 'smelter',
    "require": 'redgem',
    "amount": '5',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Redbar recipe'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_researchbench = {
    "crafts": 'ss_researchbench',
    "sprite": 'sprite_craftbench2',
    "crafted_in": 'build',
    "require": 'building_material,research_node',
    "amount": '10,1',
    "parent": 'blueprint_recipe_all',
    "name": 'Research Bench'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_redgem_pickaxe = {
    "crafts": 'ss_weapon_redgem_pickaxe',
    "sprite": 'sprite_redgem_pickaxe',
    "crafted_in": 'craftingbench',
    "require": 'composites,redbar',
    "amount": '10,10',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_weapon_pickaxe',
    "parent": 'blueprint_recipe_all',
    "name": 'Redgem Axe'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_darkiron_pickaxe = {
    "crafts": 'ss_weapon_darkiron_pickaxe',
    "sprite": 'sprite_darkiron_pickaxe',
    "crafted_in": 'craftingbench',
    "require": 'composites,redgem,darkiron',
    "amount": '25,25,25',
    "researchRequire": 'research_node,sinstone',
    "researchAmount": '3,2',
    "researchParent": 'ss_weapon_redgem_pickaxe',
    "parent": 'blueprint_recipe_all',
    "name": 'Dark Iron Pickaxe'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_item_medical_pen = {
    "crafts": 'ss_item_medical_pen',
    "sprite": 'sprite_syringe',
    "crafted_in": 'ss_chembench',
    "require": 'adhesive,whitemeat,glass',
    "amount": '5,10,10',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_item_bandage_small',
    "parent": 'blueprint_recipe_all',
    "name": 'Medical Pen'
  };
  _BLUEPRINTS.RECIPES.recipe_pers_player_storage = {
    "crafts": 'pers_player_storage',
    "sprite": 'container_5',
    "crafted_in": 'utility',
    "require": 'wood',
    "amount": '6',
    "parent": 'blueprint_recipe_all',
    "name": 'Player Storage'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_item_metalingot = {
    "crafts": 'ss_item_metalingot',
    "sprite": 'sprite_ingot_metal',
    "crafted_in": 'smelter',
    "require": 'metalore',
    "amount": '2',
    "researchAmount": '3',
    "researchRequire": 'research_node',
    "parent": 'blueprint_recipe_all',
    "name": 'Metal Ignot recipe'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_backpack_small = {
    "crafts": 'ss_backpack_small',
    "sprite": 'backpack_small',
    "crafted_in": 'ss_loom',
    "require": 'skin,fiber',
    "amount": '25,25',
    "researchRequire": 'research_node',
    "researchAmount": '2',
    "researchParent": 'ss_backpack_satchel',
    "parent": 'blueprint_recipe_all',
    "name": 'Small Backpack'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_backpack_large = {
    "crafts": 'ss_backpack_large',
    "sprite": 'backpack_large',
    "crafted_in": 'ss_loom',
    "require": 'metalingot,fiber,skin',
    "amount": '25,50,50',
    "researchRequire": 'research_node',
    "researchAmount": '5',
    "researchParent": 'ss_backpack_small',
    "parent": 'blueprint_recipe_all',
    "name": 'Large Backpack'
  };
  _BLUEPRINTS.RECIPES.recipe_pers_worlditem_glasskiln = {
    "crafts": 'pers_worlditem_glasskiln',
    "sprite": 'sprite_glasskiln',
    "crafted_in": 'build',
    "require": 'building_material,stone',
    "amount": '10.50',
    "researchRequire": 'research_node',
    "researchAmount": '5',
    "researchParent": 'pers_worlditem_smelter',
    "parent": 'blueprint_recipe_all',
    "name": 'Glass Kiln'
  };
  _BLUEPRINTS.RECIPES.recipe_pers_worlditem_loadingbench = {
    "crafts": 'pers_worlditem_loadingbench',
    "sprite": 'sprite_loadingbench',
    "crafted_in": 'build',
    "require": 'building_material,metalingot',
    "amount": '15,15',
    "researchRequire": 'research_node',
    "researchAmount": '5',
    "researchParent": 'ss_smithy',
    "parent": 'blueprint_recipe_all',
    "name": 'Loading Bench'
  };
  _BLUEPRINTS.RECIPES.recipe_pers_worlditem_kitchen = {
    "crafts": 'pers_worlditem_kitchen',
    "sprite": 'sprite_kitchen',
    "crafted_in": 'build',
    "require": 'building_material,metalingot',
    "amount": '10,5',
    "researchRequire": 'research_node',
    "researchAmount": '10',
    "researchParent": 'pers_worlditem_craftingbench',
    "parent": 'blueprint_recipe_all',
    "name": 'Kitchen'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_item_glass = {
    "crafts": 'ss_item_glass',
    "sprite": 'sprite_glass',
    "crafted_in": 'glasskiln',
    "require": 'sand',
    "amount": '5',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "parent": 'blueprint_recipe_all',
    "name": 'Form Glass'
  };
  _BLUEPRINTS.RECIPES.recipe_pers_door_wooden = {
    "crafts": 'pers_door_wooden',
    "sprite": 'sprite_door_wooden',
    "crafted_in": 'utility',
    "require": 'wood',
    "amount": '5',
    "researchRequire": 'research_node',
    "researchAmount": '1',
    "parent": 'blueprint_recipe_all',
    "name": 'Wooden Door'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_body_smoker = {
    "crafts": 'ss_body_smoker',
    "sprite": 'body_smoker',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin',
    "amount": '25,10',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_body_camo',
    "parent": 'blueprint_recipe_all',
    "name": 'Smokers Jacket'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_body_medical = {
    "crafts": 'ss_body_medical',
    "sprite": 'body_medical',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin,sheetmetal',
    "amount": '20,10,2',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_clone_jacket',
    "parent": 'blueprint_recipe_all',
    "name": 'Doctors Jacket'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_bandit_hatmask = {
    "crafts": 'ss_mask_bandit_hatmask',
    "sprite": 'mask_bandit_hatmask',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin',
    "amount": '16,10',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_mask_ranchet',
    "parent": 'blueprint_recipe_all',
    "name": 'Western Hat and Mask'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_plank = {
    "crafts": 'ss_weapon_plank',
    "sprite": 'weapon_plank',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,fiber,skin,composites',
    "amount": '2,20,10,23',
    "researchRequire": 'research_node,sinstone',
    "researchAmount": '3,2',
    "researchParent": 'ss_weapon_reine_plank',
    "parent": 'blueprint_recipe_all',
    "name": 'Big Plank'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_redword = {
    "crafts": 'ss_weapon_redword',
    "sprite": 'weapon_redword',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,wood,fiber,skin,spidereye,redbar',
    "amount": '2,12,20,10,2,13',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_weapon_rust_redword',
    "parent": 'blueprint_recipe_all',
    "name": 'Redword Sword'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_xbow = {
    "crafts": 'ss_weapon_xbow',
    "sprite": 'wep_crossbow_2',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,fiber,composites,darkiron',
    "amount": '3,12,20,16',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_weapon_snarebow',
    "parent": 'blueprint_recipe_all',
    "name": 'Advanced Crossbow'
  };
  _BLUEPRINTS.RECIPES.recipe_pers_worlditem_advancedforge = {
    "crafts": 'pers_worlditem_advancedforge',
    "sprite": 'sprite_advancedforge',
    "crafted_in": 'build',
    "require": 'building_material,metalingot,composites',
    "amount": '25,25,25',
    "researchRequire": 'research_node,sinchip,sinstone',
    "researchAmount": '10,1',
    "researchParent": 'pers_worlditem_glasskiln',
    "parent": 'blueprint_recipe_all',
    "name": 'Advanced Smelter'
  };
  _BLUEPRINTS.RECIPES.recipe_pers_worlditem_printer = {
    "crafts": 'pers_worlditem_printer',
    "sprite": 'sprite_printer',
    "crafted_in": 'build',
    "require": 'building_material,metalingot,sinchip',
    "amount": '25,25,10',
    "researchRequire": 'research_node,sinchip,sinstone',
    "researchAmount": '20,20,5',
    "researchParent": 'pers_worlditem_fabricator',
    "parent": 'blueprint_recipe_all',
    "name": 'Part Printer'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_chembench = {
    "crafts": 'ss_chembench',
    "sprite": 'sprite_chembench',
    "crafted_in": 'build',
    "require": 'building_material,glass',
    "amount": '25,5',
    "researchRequire": 'research_node',
    "researchAmount": '2',
    "researchParent": 'ss_loom',
    "parent": 'blueprint_recipe_all',
    "name": 'Crafting Chem Bench'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_junkdroid = {
    "crafts": 'ss_mask_junkdroid',
    "sprite": 'mask_junkdroid',
    "crafted_in": 'ss_loom',
    "require": 'fiber,sheetmetal,mechscrap',
    "amount": '8,15,8',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_mask_eyescanner',
    "parent": 'blueprint_recipe_all',
    "name": 'Junk Droid'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_reinforced_redword = {
    "crafts": 'ss_weapon_reinforced_redword',
    "sprite": 'weapon_reinforced_redword',
    "crafted_in": 'ss_smithy',
    "require": 'adhesive,fiber,skin,composites,sheetmetal,redgem,redbar',
    "amount": '3,12,10,11,10,1,20',
    "researchRequire": 'research_node,sinstone',
    "researchAmount": '3,2',
    "researchParent": 'ss_weapon_redword',
    "parent": 'blueprint_recipe_all',
    "name": 'Reinforced Redword'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_clonepod = {
    "crafts": 'ss_clonepod',
    "sprite": 'w_emptyclonepod',
    "crafted_in": 'lab',
    "require": 'adhesive,composites,sinchip,glass,mechscrap',
    "amount": '5,10,5,10,10',
    "researchRequire": 'research_node,sinstone',
    "researchAmount": '5,2',
    "researchParent": 'ss_splicer',
    "parent": 'blueprint_recipe_all',
    "name": 'Clone Pod'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_hatchet_redgem = {
    "crafts": 'ss_weapon_hatchet_redgem',
    "sprite": 'sprite_redgem_hatchet',
    "crafted_in": 'craftingbench',
    "require": 'composites,redbar',
    "amount": '10,10',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_weapon_hatchet_st',
    "parent": 'blueprint_recipe_all',
    "name": 'Redgem Hatchet'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_hatchet_darkiron = {
    "crafts": 'ss_weapon_hatchet_darkiron',
    "sprite": 'sprite_darkiron_hatchet',
    "crafted_in": 'craftingbench',
    "require": 'composites,redgem,darkiron',
    "amount": '10,10,10',
    "researchRequire": 'research_node,sinstone',
    "researchAmount": '3,2',
    "researchParent": 'ss_weapon_hatchet_redgem',
    "parent": 'blueprint_recipe_all',
    "name": 'Dark Iron Hatchet'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_mask_steamglasses = {
    "crafts": 'ss_mask_steamglasses',
    "sprite": 'mask_steamglasses',
    "crafted_in": 'ss_loom',
    "require": 'fiber,sheetmetal,glass',
    "amount": '10,6,4',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_mask_sunshades',
    "parent": 'blueprint_recipe_all',
    "name": 'Steam Glasses'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_sin_recon = {
    "crafts": 'ss_sin_recon',
    "sprite": 'body_sin_2',
    "crafted_in": 'ss_loom',
    "require": 'fiber,skin,composites,sinchip',
    "amount": '43,24,2,1',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_body_tunic_1',
    "parent": 'blueprint_recipe_all',
    "name": 'SinCorp Recon'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_handgun = {
    "crafts": 'ss_weapon_handgun',
    "sprite": 'weapon_handgun',
    "crafted_in": 'loadingbench',
    "require": 'adhesive,wood,skin,composites,nano_chip',
    "amount": '1,20,10,20,1',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'weapons',
    "parent": 'blueprint_recipe_all',
    "name": 'Handgun'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_scorpion = {
    "crafts": 'ss_weapon_scorpion',
    "sprite": 'weapon_scorp',
    "crafted_in": 'loadingbench',
    "require": 'adhesive,wood,composites,sheetmetal,mechscrap',
    "amount": '2,23,19,10,9',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_weapon_handgun',
    "parent": 'blueprint_recipe_all',
    "name": 'Scorpion'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_antique_rifle = {
    "crafts": 'ss_weapon_antique_rifle',
    "sprite": 'sprite_rifle',
    "crafted_in": 'loadingbench',
    "require": 'adhesive,wood,fiber,skin,gunpowder,sheetmetal',
    "amount": '2,20,11,10,14,30',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'weapons',
    "parent": 'blueprint_recipe_all',
    "name": 'Antique Rifle'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_sawnoff = {
    "crafts": 'ss_weapon_sawnoff',
    "sprite": 'weapon_sawnoff',
    "crafted_in": 'loadingbench',
    "require": 'adhesive,wood,fiber,skin,sheetmetal',
    "amount": '2,22,10,12,24',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_weapon_scorpion',
    "parent": 'blueprint_recipe_all',
    "name": 'Sawn off Shotgun'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_antique_shotgun = {
    "crafts": 'ss_weapon_antique_shotgun',
    "sprite": 'sprite_old_shotgun',
    "crafted_in": 'loadingbench',
    "require": 'adhesive,wood,fiber,skin,composites,gunpowder,sheetmetal',
    "amount": '2,30,18,13,28,10,7',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_weapon_antique_rifle',
    "parent": 'blueprint_recipe_all',
    "name": 'Antique Shotgun'
  };
  _BLUEPRINTS.RECIPES.recipe_ss_weapon_shotty1 = {
    "crafts": 'ss_weapon_shotty1',
    "sprite": 'sprite_shotty',
    "crafted_in": 'loadingbench',
    "require": 'adhesive,composites,nano_chip,mechscrap,darkiron',
    "amount": '3,30,3,10,13',
    "researchRequire": 'research_node',
    "researchAmount": '3',
    "researchParent": 'ss_weapon_antique_shotgun',
    "parent": 'blueprint_recipe_all',
    "name": 'Advanced Shotgun'
  };
})();
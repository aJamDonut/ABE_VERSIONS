(function () {
  _BLUEPRINTS.SPAWNERS = {};
  _BLUEPRINTS.SPAWNERS.spawner_cp_deadhead = {
    "meta": {
      "mainWeapon": 'ss_weapon_handgun',
      "rarelyHasMainWeapon": true,
      "secondWeapon": 'ss_weapon_rusty_plank,ss_weapon_rusty_katana',
      "rarelyHasSecondWeapon": true,
      "species": 'species_mutantclone,species_clone',
      "faction": 'faction_deadhead',
      "brain": 'ss_brain_deadhead',
      "head": 'ss_mask_deadhead',
      "body": 'ss_body_gray',
      "minLevel": 0,
      "maxLevel": 5,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      }
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Deadhead'
  };
  _BLUEPRINTS.SPAWNERS.spawner_cp_sin_shop = {
    "meta": {
      "mainWeapon": 'ss_weapon_handgun',
      "rarelyHasMainWeapon": true,
      "secondWeapon": 'ss_weapon_rusty_plank,ss_weapon_rusty_katana',
      "rarelyHasSecondWeapon": true,
      "species": 'species_mutantclone,species_clone,species_founderkin,species_founder',
      "faction": 'faction_sincorp',
      "brain": 'ss_brain_clone_shop',
      "head": 'ss_mask_ranchet,ss_mask_steamglasses,ss_mask_bandit_hatmask,ss_mask_deathspawneye,ss_mask_farmerhat',
      "body": 'ss_clone_jacket,ss_clone_jacket2,ss_clone_shirt,ss_clone_shirt2,ss_rags,ss_body_camo,ss_body_bluedress,ss_body_pinkdress,ss_rags2,ss_body_smoker',
      "backpack": 'ss_backpack_large,ss_backpack_small,ss_backpack_satchel',
      "inventory": 'bandage_small',
      "minLevel": 3,
      "maxLevel": 10,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      },
      "dialog": 'dialog_syn_shopkeeper'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'SinCorp Shopkeeper'
  };
  _BLUEPRINTS.SPAWNERS.spawner_cp_sin_scientist = {
    "meta": {
      "job": 'scientist',
      "mainWeapon": 'ss_weapon_handgun',
      "rarelyHasMainWeapon": true,
      "secondWeapon": 'ss_weapon_rusty_plank,ss_weapon_katana,ss_weapon_rusty_katana',
      "rarelyHasSecondWeapon": true,
      "species": 'species_mutantclone,species_clone,species_founderkin,species_founder',
      "faction": 'faction_sincorp',
      "brain": 'ss_brain_clone_mk1',
      "head": 'ss_mask_eyescanner,ss_mask_docoscope,ss_mask_steamglasses',
      "body": 'ss_clone_jacket,ss_clone_jacket2,ss_clone_shirt,ss_clone_shirt2,ss_rags,ss_body_camo',
      "minLevel": 3,
      "maxLevel": 10,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      },
      "dialog": 'dialog_syn_shopkeeper'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'SinCorp Scientist'
  };
  _BLUEPRINTS.SPAWNERS.spawner_yamakenshin = {
    "isUnique": true,
    "age": '1223',
    "job": 'Leader',
    "meta": {
      "mainWeapon": 'ss_weapon_handgun',
      "rarelyHasMainWeapon": true,
      "secondWeapon": 'ss_weapon_rusty_plank,ss_weapon_rusty_katana',
      "rarelyHasSecondWeapon": true,
      "species": 'species_mutantclone,species_clone',
      "faction": 'faction_deadhead',
      "brain": 'ss_brain_deadhead',
      "body": 'ss_body_pinkdress',
      "minLevel": 0,
      "maxLevel": 5,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 100,
        "factions": 'faction_sincorp,faction_nomad,faction_wild'
      }
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Yama Kenshin'
  };
  _BLUEPRINTS.SPAWNERS.spawner_village_shop = {
    "meta": {
      "mainWeapon": 'ss_weapon_handgun',
      "rarelyHasMainWeapon": false,
      "secondWeapon": 'ss_weapon_rusty_plank,ss_weapon_rusty_katana',
      "rarelyHasSecondWeapon": true,
      "species": 'species_clone',
      "faction": 'faction_drumley',
      "brain": 'ss_brain_villager_shop',
      "head": 'ss_mask_sunshades,ss_mask_bandana,ss_mask_ranchet,ss_mask_steamglasses,ss_mask_bandit_hatmask,ss_mask_farmerhat',
      "body": 'ss_clone_shirt,ss_clone_shirt2,ss_rags,ss_body_camo,ss_rags2,ss_body_smoker',
      "backpack": 'ss_backpack_satchel',
      "inventory": 'bandage_small',
      "minLevel": 3,
      "maxLevel": 10,
      "stats": Array,
      "bounty": Array,
      "dialog": 'dialog_village_shopkeeper'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Village Shopkeeper'
  };
  _BLUEPRINTS.SPAWNERS.spawner_cp_deadheadboss = {
    "meta": {
      "name": 'test',
      "rarelyHasMainWeapon": true,
      "rarelyHasSecondWeapon": true,
      "species": 'species_clone',
      "faction": 'faction_deadhead',
      "brain": 'ss_brain_deadhead',
      "minLevel": 1,
      "maxLevel": 5,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 100,
        "factions": 'faction_sincorp,faction_nomad,faction_passive_wild,faction_yamakai'
      },
      "dialog": 'dialog_bounty_handin'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Deadhead Boss'
  };
  _BLUEPRINTS.SPAWNERS.spawner_villager = {
    "meta": {
      "job": 'civilian',
      "rarelyHasMainWeapon": false,
      "rarelyHasSecondWeapon": true,
      "species": 'species_clone',
      "faction": 'faction_drumley',
      "brain": 'ss_brain_villager',
      "head": 'ss_mask_sunshades,ss_mask_bandana,ss_mask_ranchet,ss_mask_bandit_hatmask',
      "body": 'ss_clone_shirt2,ss_rags,ss_rags2,ss_body_smoker',
      "minLevel": 0,
      "maxLevel": 2,
      "stats": {
        "savage": 0,
        "melee": 5,
        "athletics": 0,
        "ranged": 0,
        "toughness": 3,
        "strength": 0,
        "crafting": 0,
        "intelligence": 1
      },
      "bounty": {
        "value": 0
      },
      "dialog": 'dialog_villager_npc'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Drumley Villager'
  };
  _BLUEPRINTS.SPAWNERS.spawner_drumley_shop = {
    "meta": {
      "mainWeapon": 'ss_weapon_handgun',
      "rarelyHasMainWeapon": false,
      "secondWeapon": 'ss_weapon_rusty_plank,ss_weapon_rusty_katana',
      "rarelyHasSecondWeapon": true,
      "species": 'species_clone',
      "faction": 'faction_drumley',
      "brain": 'ss_brain_drumley_shopk',
      "head": 'ss_mask_sunshades,ss_mask_bandana,ss_mask_ranchet,ss_mask_steamglasses,ss_mask_bandit_hatmask,ss_mask_farmerhat',
      "body": 'ss_clone_shirt,ss_clone_shirt2,ss_rags,ss_body_camo,ss_rags2,ss_body_smoker',
      "backpack": 'ss_backpack_satchel',
      "inventory": 'bandage_small',
      "minLevel": 3,
      "maxLevel": 10,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      },
      "dialog": 'dialog_village_shopkeeper'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Drumley Shopkeeper'
  };
  _BLUEPRINTS.SPAWNERS.spawner_sausage = {
    "isUnique": true,
    "age": '200',
    "meta": {
      "mainWeapon": 'ss_weapon_antique_shotgun',
      "rarelyHasMainWeapon": false,
      "rarelyHasSecondWeapon": true,
      "species": 'species_founder',
      "faction": 'faction_wild',
      "brain": 'ss_brain_deadhead',
      "head": 'ss_mask_plainmask',
      "body": 'ss_body_smoker',
      "backpack": 'ss_backpack_small',
      "inventory": 'bp_ss_mask_plainmask',
      "minLevel": 1,
      "maxLevel": 3,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 1000,
        "factions": 'faction_nomad'
      },
      "dialog": 'dialog_villager_npc'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Sharpshooter Sausage'
  };
  _BLUEPRINTS.SPAWNERS.spawner_villager_axehead = {
    "isUnique": false,
    "meta": {
      "mainWeapon": 'ss_weapon_handgun',
      "rarelyHasMainWeapon": false,
      "rarelyHasSecondWeapon": true,
      "species": 'species_clone',
      "faction": 'faction_axehead',
      "brain": 'ss_brain_villager_axehead',
      "body": 'ss_plate_armor,ss_body_camo,ss_body_smoker',
      "minLevel": 0,
      "maxLevel": 5,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      },
      "dialog": 'dialog_villager_npc'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Axehead Villager'
  };
  _BLUEPRINTS.SPAWNERS.spawner_axehead_shop = {
    "meta": {
      "mainWeapon": 'ss_weapon_handgun',
      "rarelyHasMainWeapon": false,
      "secondWeapon": 'ss_weapon_rusty_plank,ss_weapon_rusty_katana',
      "rarelyHasSecondWeapon": true,
      "species": 'species_clone',
      "faction": 'faction_axehead',
      "brain": 'ss_brain_axehead_shop',
      "head": 'ss_mask_sunshades,ss_mask_bandana,ss_mask_ranchet,ss_mask_steamglasses,ss_mask_bandit_hatmask,ss_mask_farmerhat',
      "body": 'ss_clone_shirt,ss_clone_shirt2,ss_rags,ss_body_camo,ss_rags2,ss_body_smoker',
      "backpack": 'ss_backpack_satchel',
      "inventory": 'bandage_small',
      "minLevel": 3,
      "maxLevel": 10,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      },
      "dialog": 'dialog_axehead_shopkeeper'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Axehead Shopkeeper'
  };
  _BLUEPRINTS.SPAWNERS.spawner_villager_sicks = {
    "isUnique": false,
    "meta": {
      "rarelyHasMainWeapon": true,
      "rarelyHasSecondWeapon": true,
      "species": 'species_clone',
      "faction": 'faction_axehead',
      "brain": 'ss_brain_villager_sicks',
      "head": 'ss_mask_sunshades,ss_mask_farmerhat',
      "body": 'ss_rags,ss_body_bluedress,ss_body_pinkdress,ss_rags2',
      "minLevel": 0,
      "maxLevel": 2,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      },
      "dialog": 'dialog_villager_npc'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Sicks Villager'
  };
  _BLUEPRINTS.SPAWNERS.spawner_drumley_barrelguy = {
    "isUnique": true,
    "meta": {
      "mainWeapon": 'ss_weapon_antique_rifle',
      "rarelyHasMainWeapon": false,
      "rarelyHasSecondWeapon": true,
      "species": 'species_clone',
      "faction": 'faction_drumley',
      "brain": 'ss_brain_drumley_barrelguy',
      "head": 'ss_mask_farmerhat',
      "body": 'ss_body_tunic_1',
      "backpack": 'ss_backpack_small',
      "minLevel": 1,
      "maxLevel": 10,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      },
      "dialog": 'dialog_mission_sicksbarreljob'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Drumley Barrel Guy'
  };
  _BLUEPRINTS.SPAWNERS.spawner_ira = {
    "isUnique": true,
    "age": '240',
    "meta": {
      "rarelyHasMainWeapon": false,
      "rarelyHasSecondWeapon": true,
      "species": 'species_founder',
      "faction": 'faction_deadhead',
      "brain": 'ss_brain_ira',
      "head": 'mask_bouffet_wig_2',
      "body": 'ss_body_bluedress',
      "minLevel": 0,
      "maxLevel": 5,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      },
      "dialog": 'dialog_escort_ira_npc'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Ira'
  };
  _BLUEPRINTS.SPAWNERS.spawner_cp_zalex = {
    "meta": {
      "name": 'Zalex',
      "age": '220',
      "job": 'Leader',
      "isUnique": true,
      "mainWeapon": 'ss_weapon_nanoshotgun',
      "rarelyHasMainWeapon": false,
      "secondWeapon": 'ss_weapon_reinforced_redword',
      "rarelyHasSecondWeapon": false,
      "species": 'species_founder',
      "faction": 'faction_sincorp',
      "brain": 'ss_brain_clone_police',
      "head": 'ss_item_mask_alexhead',
      "body": 'ss_sin_recon',
      "backpack": 'ss_black_wings',
      "minLevel": 0,
      "maxLevel": 5,
      "stats": {
        "savage": 80,
        "melee": 80,
        "athletics": 75,
        "ranged": 75,
        "toughness": 60,
        "strength": 10,
        "crafting": 10,
        "intelligence": 80
      },
      "bounty": {
        "value": 2000,
        "factions": 'faction_yamakai'
      },
      "lastSeen": 'Landzo'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Zalex'
  };
  _BLUEPRINTS.SPAWNERS.spawner_cp_sin_guard = {
    "meta": {
      "job": 'Guard',
      "mainWeapon": 'ss_weapon_shotty1,ss_weapon_handgun,ss_weapon_scorpion',
      "rarelyHasMainWeapon": true,
      "secondWeapon": 'ss_weapon_rusty_plank,ss_weapon_katana,ss_weapon_rusty_katana,ss_weapon_rust_redword',
      "rarelyHasSecondWeapon": true,
      "species": 'species_mutantclone,species_clone,species_founderkin,species_founder',
      "faction": 'faction_sincorp',
      "brain": 'ss_brain_clone_mk1',
      "head": 'ss_mask_staff',
      "body": 'ss_sin_armor',
      "minLevel": 3,
      "maxLevel": 10,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      }
    },
    "events": {},
    "parent": 'spawners',
    "name": 'SinCorp Guard'
  };
  _BLUEPRINTS.SPAWNERS.spawner_cp_sin_recon = {
    "meta": {
      "job": 'Recon',
      "mainWeapon": 'ss_weapon_shotty1,ss_weapon_handgun,ss_weapon_scorpion',
      "rarelyHasMainWeapon": true,
      "secondWeapon": 'ss_weapon_rusty_plank,ss_weapon_katana,ss_weapon_rusty_katana,ss_weapon_rust_redword',
      "rarelyHasSecondWeapon": true,
      "species": 'species_mutantclone,species_clone,species_founderkin,species_founder',
      "faction": 'faction_sincorp',
      "brain": 'ss_brain_clone_mk1',
      "head": 'ss_mask_staff',
      "body": 'ss_sin_recon',
      "minLevel": 3,
      "maxLevel": 10,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      }
    },
    "events": {},
    "parent": 'spawners',
    "name": 'SinCorp Recon'
  };
  _BLUEPRINTS.SPAWNERS.spawner_cp_desert_tick = {
    "meta": {
      "rarelyHasMainWeapon": true,
      "rarelyHasSecondWeapon": true,
      "species": 'species_sandtick',
      "faction": 'faction_passive_wild',
      "brain": 'ss_brain_wander_mk1',
      "body": 'ss_animal_tick',
      "minLevel": 1,
      "maxLevel": 2,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      }
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Desert Tick'
  };
  _BLUEPRINTS.SPAWNERS.spawner_villager_questgiver = {
    "meta": {
      "mainWeapon": 'ss_weapon_sawnoff',
      "rarelyHasMainWeapon": false,
      "rarelyHasSecondWeapon": true,
      "species": 'species_clone',
      "faction": 'faction_drumley',
      "brain": 'ss_brain_villager_questgiver',
      "head": 'ss_mask_bandit_hatmask',
      "body": 'ss_evo_2',
      "backpack": 'ss_backpack_satchel',
      "minLevel": 1,
      "maxLevel": 10,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      },
      "dialog": 'dialog_villager_bountygiver',
      "lastSeen": 'Drumley'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Drumley Chief'
  };
  _BLUEPRINTS.SPAWNERS.spawner_drumley_questgiver = {
    "meta": {
      "name": 'Slinger',
      "job": 'Chief of Drumley',
      "mainWeapon": 'ss_weapon_handgun',
      "rarelyHasMainWeapon": false,
      "rarelyHasSecondWeapon": true,
      "species": 'species_clone',
      "faction": 'faction_drumley',
      "brain": 'ss_brain_villager_questgiver',
      "head": 'ss_mask_bandit_hatmask',
      "body": 'ss_evo_2',
      "backpack": 'ss_backpack_satchel',
      "minLevel": 1,
      "maxLevel": 10,
      "stats": {
        "savage": 40,
        "melee": 50,
        "athletics": 30,
        "ranged": 60,
        "toughness": 30,
        "strength": 40,
        "crafting": 5,
        "intelligence": 20
      },
      "bounty": {
        "value": 0
      },
      "dialog": 'dialog_villager_bountygiver',
      "lastSeen": 'Drumley'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Drumley Chief'
  };
  _BLUEPRINTS.SPAWNERS.spawner_sicks_questgiver = {
    "meta": {
      "name": 'Randall',
      "job": 'Sicks Bartender',
      "isUnique": true,
      "mainWeapon": 'ss_weapon_antique_rifle',
      "rarelyHasMainWeapon": false,
      "rarelyHasSecondWeapon": true,
      "species": 'species_clone',
      "faction": 'faction_drumley',
      "brain": 'ss_brain_sicks_questgiver',
      "head": 'ss_mask_steamglasses',
      "body": 'ss_evo_1',
      "minLevel": 1,
      "maxLevel": 5,
      "stats": {
        "savage": 20,
        "melee": 20,
        "athletics": 10,
        "ranged": 10,
        "toughness": 5,
        "strength": 10,
        "crafting": 60,
        "intelligence": 60
      },
      "bounty": {
        "value": 0
      },
      "dialog": 'dialog_villager_bountygiver'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Sicks Chief'
  };
  _BLUEPRINTS.SPAWNERS.spawner_axehead_questgiver = {
    "meta": {
      "name": 'Haft',
      "job": 'Axehead Chief',
      "mainWeapon": 'ss_weapon_shotty1',
      "rarelyHasMainWeapon": false,
      "secondWeapon": 'ss_weapon_sabre',
      "rarelyHasSecondWeapon": false,
      "species": 'species_clone',
      "faction": 'faction_axehead',
      "brain": 'ss_brain_sicks_questgiver',
      "head": 'ss_mask_deathspawneye',
      "body": 'ss_body_camo',
      "backpack": 'ss_backpack_small',
      "minLevel": 1,
      "maxLevel": 6,
      "stats": {
        "savage": 60,
        "melee": 30,
        "athletics": 5,
        "ranged": 30,
        "toughness": 40,
        "strength": 50,
        "crafting": 10,
        "intelligence": 5
      },
      "bounty": {
        "value": 5000
      },
      "dialog": 'dialog_villager_bountygiver',
      "lastSeen": 'Fort Axehead'
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Axehead Chief'
  };
  _BLUEPRINTS.SPAWNERS.spawner_turkey_man = {
    "meta": {
      "name": 'Pete Poultry',
      "mainWeapon": 'ss_weapon_shotty1',
      "rarelyHasMainWeapon": false,
      "secondWeapon": 'ss_weapon_katana',
      "rarelyHasSecondWeapon": false,
      "species": 'species_mutantclone,species_clone',
      "faction": 'faction_deadhead',
      "brain": 'ss_brain_deadhead',
      "head": 'ss_mask_turkey',
      "body": 'ss_turkey_costume',
      "minLevel": 0,
      "maxLevel": 5,
      "stats": {
        "savage": 0,
        "melee": 0,
        "athletics": 0,
        "ranged": 0,
        "toughness": 0,
        "strength": 0,
        "crafting": 0,
        "intelligence": 0
      },
      "bounty": {
        "value": 0
      }
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Pete Poultry'
  };
  _BLUEPRINTS.SPAWNERS.spawner_tommy_steel = {
    "meta": {
      "name": 'Tommy Steel',
      "age": '240',
      "isUnique": true,
      "rarelyHasMainWeapon": true,
      "rarelyHasSecondWeapon": true,
      "species": 'species_founder',
      "faction": 'faction_deadhead',
      "brain": 'ss_brain_deadhead',
      "head": 'ss_mask_sunshades',
      "body": 'ss_tommysteel_tattoos',
      "minLevel": 0,
      "maxLevel": 10,
      "stats": {
        "savage": 70,
        "melee": 100,
        "athletics": 100,
        "ranged": 1,
        "toughness": 70,
        "strength": 50,
        "crafting": 1,
        "intelligence": 10
      },
      "bounty": {
        "value": 0
      }
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Tommy Steel'
  };
})();
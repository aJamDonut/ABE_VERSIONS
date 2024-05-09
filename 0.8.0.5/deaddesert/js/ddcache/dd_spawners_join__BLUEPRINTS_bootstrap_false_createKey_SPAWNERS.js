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
  _BLUEPRINTS.SPAWNERS.spawner_pirate = {
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
        "value": 0
      }
    },
    "events": {},
    "parent": 'spawners',
    "name": 'Pirate'
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
      "mainWeapon": 'ss_weapon_handgun',
      "rarelyHasMainWeapon": true,
      "secondWeapon": 'ss_weapon_rusty_plank,ss_weapon_katana,ss_weapon_rusty_katana',
      "rarelyHasSecondWeapon": true,
      "species": 'species_mutantclone,species_clone,species_founderkin,species_founder',
      "faction": 'faction_sincorp',
      "brain": 'ss_brain_clone_mk1',
      "head": 'ss_mask_eyescanner,ss_mask_docoscope,ss_mask_steamglasses',
      "body": 'ss_clone_jacket,ss_clone_jacket2,ss_clone_shirt,ss_clone_shirt2,ss_rags,ss_body_camo',
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
    "name": 'SinCorp Scientist'
  };
})();
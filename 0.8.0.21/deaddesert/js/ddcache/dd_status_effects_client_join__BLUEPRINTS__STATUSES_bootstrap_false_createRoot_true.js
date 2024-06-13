(function () {
  self._BLUEPRINTS._STATUSES = {};
  _BLUEPRINTS._STATUSES.c_effect_damage = {
    "start": function (item, options) {
      item.tookDmg(Math.ceil(options.dmg), options.type);
      item.x = item.x + 2;
      item.y = item.y + 2;
    },
    "tick": function (item, options) {
      item.alpha = Math.random();
    },
    "end": function (item, options) {
      item.alpha = 1;
    },
    "stacks": true,
    "parent": 'status_effects_client',
    "name": 'Damage'
  };
  _BLUEPRINTS._STATUSES.c_effect_flicker = {
    "start": function (item, options) {
      item.alpha = 0.5;
    },
    "tick": function (item, options) {
      item.alpha = Math.random();
    },
    "end": function (item, options) {
      item.alpha = 1;
    },
    "remove": function (item, options) {
      item.alpha = 1;
    },
    "stacks": false,
    "hidden": true,
    "parent": 'status_effects_client',
    "name": 'Flicker'
  };
  _BLUEPRINTS._STATUSES.c_effect_statup = {
    "start": function (item, options) {
      item.data.stats[options.stat] += options.value;
    },
    "stacks": false,
    "hidden": true,
    "parent": 'status_effects_client',
    "name": 'Stat Up'
  };
  _BLUEPRINTS._STATUSES.c_effect_dead = {
    "sprite": 'sprite_icon_status_skull_bad',
    "start": function (item, options) {
      item.setAnim('none/dead_1', true);
      item.data.dead = true;
      if (item.id == game.session.data.firstPawnId) {}
    },
    "stacks": true,
    "parent": 'status_effects_client',
    "name": 'Dead'
  };
  _BLUEPRINTS._STATUSES.c_effect_killed = {
    "start": function (item, options) {
      item.data.dead = true;
    },
    "stacks": false,
    "parent": 'status_effects_client',
    "name": 'Killed'
  };
  _BLUEPRINTS._STATUSES.c_effect_touched = {
    "start": function (item, options) {
      item.touchers[options.source] = true;
    },
    "tick": function (item, options) {},
    "end": function (item, options) {
      item.touchers[options.source] = false;
      delete item.touchers[options.source];
    },
    "remove": function (item, options) {},
    "stacks": false,
    "hidden": true,
    "parent": 'status_effects_client',
    "name": 'Touched'
  };
  _BLUEPRINTS._STATUSES.c_effect_bleed = {
    "sprite": 'sprite_icon_status_blood_bad',
    "description": 'A bleed effect causing blood loss over time. Can be removed with bandages.',
    "start": function (item, options) {
      if (game.settings.blood === false) return;
      item.nextSpit = Date.now();
      var particle = new Particles('blood_impact');
      particle.x = item.x + game.rng(-10, 10);
      particle.y = item.y + game.rng(-10, 10);
      game.render.aboveLife.addChild(particle);
      particle.playOnceAndDestroy();
      var particle = new Particles('blood_impact2');
      particle.x = item.x + game.rng(0, 32);
      particle.y = item.y + game.rng(0, 32);
      game.render.aboveLife.addChild(particle);
      particle.playOnceAndDestroy();
    },
    "tick": function (item, options) {
      if (game.settings.blood === false) return;
      if (item.nextSpit < Date.now()) {
        var blood = new Particles('blood_pool');
        blood.x = item.x;
        blood.y = item.y + 32;
        var scale = game.rng(0, 100);
        blood.scale.x = scale / 100;
        blood.scale.y = scale / 100;
        game.render.underLifeLayer.addChild(blood);
        item.nextSpit = Date.now() + 500;
        blood.playOnceAndDestroy();
        var particle = new Particles('blood_impact');
        particle.x = blood.x + blood.width / 2;
        particle.y = blood.y + blood.height / 2;
        game.render.aboveLife.addChild(particle);
        particle.playOnceAndDestroy();
      }
    },
    "stacks": true,
    "parent": 'status_effects_client',
    "name": 'Bleed'
  };
  _BLUEPRINTS._STATUSES.c_effect_bandaging = {
    "sprite": 'sprite_icon_status_heal',
    "start": function (item, options) {
      item.forceAnim = 'util/bandage';
    },
    "tick": function (item, options) {},
    "end": function (item, options) {
      item.forceAnim = false;
    },
    "stacks": true,
    "parent": 'status_effects_client',
    "name": 'Bandaging'
  };
  _BLUEPRINTS._STATUSES.c_effect_levelling_up = {
    "start": function (item, options) {},
    "stacks": true,
    "parent": 'status_effects_client',
    "name": 'Levelling Up'
  };
  _BLUEPRINTS._STATUSES.c_effect_smoke = {
    "start": function (item, options) {
      item.smoke = new Particles('poison_1');
      item.smoke.flatten();
      item.smoke.x = item.x + 32;
      item.smoke.y = item.y + 32;
      game.render.aboveLife.addChild(item.smoke);
      item.smoke.loop();
    },
    "tick": function (item, options) {
      item.smoke.x = item.x + 32;
      item.smoke.y = item.y + 32;
    },
    "end": function (item, options) {
      item.smoke.play();
    },
    "stacks": true,
    "parent": 'status_effects_client',
    "name": 'Smoke'
  };
  _BLUEPRINTS._STATUSES.c_effect_stealing = {
    "start": function (item, options) {
      item.data.stealing = true;
      item.forceAnim = 'util/bandage';
    },
    "tick": function (item, options) {},
    "end": function (item, options) {
      item.data.stealing = false;
      item.forceAnim = false;
    },
    "stacks": true,
    "parent": 'status_effects_client',
    "name": 'Stealing'
  };
  _BLUEPRINTS._STATUSES.c_effect_talking = {
    "start": function (item, options) {
      item.talk = game.render.text(options.msg, 'ingame-dialog');
      item.talk.anchor.set(0.5);
      game.render.aboveLife.addChild(item.talk);
    },
    "tick": function (item, options) {
      item.talk.x = item.x + 32;
      item.talk.y = item.y - 25;
    },
    "end": function (item, options) {
      item.talk.alpha = 0.5;
      item.talk.destroy();
    },
    "stacks": false,
    "parent": 'status_effects_client',
    "name": 'Talking'
  };
  _BLUEPRINTS._STATUSES.c_effect_revive = {
    "start": function (item, options) {},
    "tick": function (item, options) {},
    "end": function (item, options) {},
    "stacks": true,
    "parent": 'status_effects_client',
    "name": 'Revive'
  };
  _BLUEPRINTS._STATUSES.c_effect_torpor = {
    "start": function (item, options) {},
    "end": function (item, options) {},
    "stacks": false,
    "hidden": false,
    "parent": 'status_effects_client',
    "name": 'Torpor'
  };
  _BLUEPRINTS._STATUSES.c_effect_ko = {
    "sprite": 'sprite_icon_status_sleep_bad',
    "start": function (item, options) {
      item.forceAnim = 'none/dead_1';
    },
    "end": function (item, options) {
      item.forceAnim = false;
    },
    "stacks": false,
    "hidden": false,
    "parent": 'status_effects_client',
    "name": 'Knockout'
  };
  _BLUEPRINTS._STATUSES.c_effect_hurt = {
    "start": function (item, options) {},
    "tick": function (item, options) {},
    "end": function (item, options) {
      item.forceAnim = false;
    },
    "remove": function (item, options) {
      item.forceAnim = false;
    },
    "stacks": false,
    "parent": 'status_effects_client',
    "name": 'Hurt'
  };
  _BLUEPRINTS._STATUSES.c_effect_healing = {
    "sprite": 'sprite_icon_status_heal',
    "start": function (item, options) {
      item.forceAnim = 'util/bandage';
    },
    "tick": function (item, options) {},
    "end": function (item, options) {
      item.forceAnim = false;
    },
    "stacks": true,
    "parent": 'status_effects_client',
    "name": 'Healing'
  };
  _BLUEPRINTS._STATUSES.c_effect_settarget = {
    "start": function (item, options) {
      item.data.targetId = options.targetId;
      item.data.do = 'attack';
      item.data.command = 'attack';
    },
    "parent": 'status_effects_client',
    "name": 'Set Target'
  };
  _BLUEPRINTS._STATUSES.c_effect_sleeping = {
    "sprite": 'sprite_icon_status_heal',
    "start": function (item, options) {
      item.forceAnim = 'none/dead_1';
      item.x = options.sleepX;
      item.y = options.sleepY;
      item.syncXY();
    },
    "tick": function (item, options) {},
    "end": function (item, options) {
      item.syncXY();
      item.forceAnim = false;
    },
    "remove": function (item, options) {
      item.syncXY();
      item.forceAnim = false;
    },
    "stacks": false,
    "parent": 'status_effects_client',
    "name": 'Sleeping'
  };
  _BLUEPRINTS._STATUSES.c_effect_opready = {
    "start": function (item, options) {
      item.opready = true;
    },
    "tick": function (item, options) {
      item.opready = true;
      if (item.data.do !== "idle") {
        item.removeStatus('opready');
        return;
      }
    },
    "end": function (item, options) {
      item.opready = false;
    },
    "remove": function (item, options) {
      item.opready = false;
    },
    "stacks": false,
    "parent": 'status_effects_client',
    "name": 'Operation Ready'
  };
  _BLUEPRINTS._STATUSES.c_effect_clonepod = {
    "sprite": 'play_icon',
    "start": function (item, options) {
      item.setAnim('none/idle_down', true);
      item.data.dead = true;
    },
    "end": function (item, options) {
      item.setAnim('none/idle_down', false);
      item.y = item.y + 128;
      item.syncXY();
      item.data.dead = false;
    },
    "stacks": false,
    "parent": 'status_effects_client',
    "name": 'Clone pod'
  };
  _BLUEPRINTS._STATUSES.c_effect_bleed_protect = {
    "sprite": 'sprite_icon_status_blood',
    "stacks": false,
    "parent": 'status_effects_client',
    "name": 'Bleed Protect'
  };
  _BLUEPRINTS._STATUSES.c_effect_clone_needs = {
    "sprite": 'sprite_icon_status_food',
    "stacks": false,
    "parent": 'status_effects_client',
    "name": 'Clone Needs'
  };
  _BLUEPRINTS._STATUSES.c_effect_setbullet = {
    "start": function (item, options) {},
    "hidden": true,
    "parent": 'status_effects_client',
    "name": 'Set Bullet'
  };
  _BLUEPRINTS._STATUSES.c_effect_syncdata = {
    "start": function (item, options) {
      for (let op in options) {
        if (typeof item.data[op] === "object" && typeof options[op] === "object") {
          item.data[op] = {
            ...item.data[op],
            ...options[op]
          };
        } else {
          item.data[op] = options[op];
        }
      }
    },
    "hidden": true,
    "parent": 'status_effects_client',
    "name": 'Sync Data'
  };
  _BLUEPRINTS._STATUSES.c_effect_drinking = {
    "sprite": 'sprite_icon_status_heal',
    "start": function (item, options) {
      item.forceAnim = 'util/bandage';
    },
    "tick": function (item, options) {},
    "end": function (item, options) {
      item.forceAnim = false;
      try {
        const drink = item.inventory.main.itemList[options.options.source];
        let remove = true;
        if (drink.data.useCount) {
          drink.data.useCount = drink.data.useCount - 1;
          if (drink.data.useCount > 0) {
            remove = false;
          }
        }
        if (remove) {
          item.inventory.main.removeItem(drink);
        }
        item.inventory.main.refreshGrid();
      } catch (e) {}
    },
    "stacks": true,
    "parent": 'status_effects_client',
    "name": 'Drinking'
  };
  _BLUEPRINTS._STATUSES.c_effect_eating = {
    "sprite": 'sprite_icon_status_heal',
    "start": function (item, options) {
      item.forceAnim = 'util/bandage';
    },
    "tick": function (item, options) {},
    "end": function (item, options) {
      item.forceAnim = false;
      item.inventory.main.removeResource(options.options.food, 1);
    },
    "stacks": true,
    "parent": 'status_effects_client',
    "name": 'Eating'
  };
})();
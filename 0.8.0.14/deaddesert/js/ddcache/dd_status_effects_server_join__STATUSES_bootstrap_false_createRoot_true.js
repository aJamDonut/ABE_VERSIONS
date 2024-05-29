(function () {
  self._STATUSES = {};
  _STATUSES.s_effect_damage = {
    "start": function (item, options) {
      if (options.creatorId && !item.data.targetId) {}
      item.hurt(options.dmg, options.type, options);
      if (item.data.isPlayer && typeof item.addStatus == 'function') {
        item.addStatus('levelling_up', {
          action: 'tookdamage',
          additional: {}
        });
      }
    },
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Damage'
  };
  _STATUSES.s_effect_dead = {
    "start": function (item, options) {
      item.data.dead = true;
      item.sync();
    },
    "stacks": false,
    "parent": 'status_effects_server',
    "name": 'Dead'
  };
  _STATUSES.s_effect_killed = {
    "start": function (item, options) {
      item.removeTarget();
      item.data.doAttack = false;
    },
    "stacks": false,
    "parent": 'status_effects_server',
    "name": 'Killed'
  };
  _STATUSES.s_effect_touched = {
    "start": function (item, options) {
      item.alpha = 0.5;
      item.touchers[options.source] = true;
    },
    "tick": function (item, options) {},
    "end": function (item, options) {
      item.touchers[options.source] = false;
      delete item.touchers[options.source];
      item.alpha = 1;
    },
    "remove": function (item, options) {
      item.alpha = 1;
    },
    "stacks": false,
    "hidden": 1,
    "parent": 'status_effects_server',
    "name": 'Touched'
  };
  _STATUSES.s_effect_bleed = {
    "start": function (item, options) {},
    "tick": function (item, options) {
      item.hurt(options.tickDmg || 0.1, 'bleed');
    },
    "stacks": false,
    "parent": 'status_effects_server',
    "name": 'Bleed'
  };
  _STATUSES.s_effect_bandaging = {
    "start": function (item, options) {},
    "tick": function (item, options) {
      item.path = [];
      item.sync();
    },
    "end": function (item, options) {
      item.removeAllOfStatus('bleed');
    },
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Bandaging'
  };
  _STATUSES.s_effect_stealing = {
    "start": function (item, options) {
      item.data.stealing = true;
    },
    "tick": function (item, options) {
      item.path = [];
      item.sync();
    },
    "end": function (item, options) {
      item.data.stealing = false;
    },
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Stealing'
  };
  _STATUSES.s_effect_revive = {
    "start": function (item, options) {
      item.removeAllOfStatus('bleed');
      item.data.stats.hp = 100;
      item.removeAllOfStatus('dead');
      item.data.dead = false;
      item.data.stats.hp = 100;
      item.sync();
    },
    "tick": function (item, options) {},
    "end": function (item, options) {
      item.removeAllOfStatus('bleed');
      item.data.stats.hp = 100;
      item.removeAllOfStatus('dead');
      item.data.dead = false;
      item.data.stats.hp = 100;
      item.sync();
    },
    "stacks": false,
    "parent": 'status_effects_server',
    "name": 'Revive'
  };
  _STATUSES.s_effect_torpor = {
    "start": function (item, options) {},
    "tick": function (item, options) {
      item.torpor(options.dmg);
    },
    "end": function (item, options) {},
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Torpor'
  };
  _STATUSES.s_effect_ko = {
    "start": function (item, options) {
      item.data.ko = true;
      item.sync();
    },
    "tick": function (item, options) {
      const recoverSpeed = 0.01;
      item.recover("sleep", 0.01);
      item.heal(recoverSpeed, "head");
      item.heal(recoverSpeed, "body");
      item.heal(recoverSpeed, "left_arm");
      item.heal(recoverSpeed, "right_arm");
      item.heal(recoverSpeed, "left_leg");
      item.heal(recoverSpeed, "right_leg");
    },
    "end": function (item, options) {
      item.data.ko = false;
      item.sync();
    },
    "stacks": false,
    "parent": 'status_effects_server',
    "name": 'Knockout'
  };
  _STATUSES.s_effect_healing = {
    "start": function (item, options) {},
    "tick": function (item, options) {
      item.path = [];
      item.sync();
    },
    "end": function (item, options) {
      item.data.stats.hp = parseInt(item.data.stats.hp) + 10;
      item.data.stats.hp = item.data.stats.hp > item.data.stats.maxHP ? item.data.stats.maxHP : item.data.stats.hp;
    },
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Healing'
  };
  _STATUSES.s_effect_naturalhealing = {
    "start": function (item, options) {},
    "tick": function (item, options) {
      item.sync();
    },
    "end": function (item, options) {
      item.data.stats.hp = parseInt(item.data.stats.hp) + 0.01;
    },
    "stacks": false,
    "parent": 'status_effects_server',
    "name": 'Human Natural Heal'
  };
  _STATUSES.s_effect_settarget = {
    "start": function (item, options) {
      item.data.targetId = options.targetId;
      item.data.do = 'attack';
      item.data.command = 'attack';
      item.sync();
    },
    "parent": 'status_effects_server',
    "name": 'Set Target'
  };
  _STATUSES.s_effect_sleeping = {
    "start": function (item, options) {},
    "tick": function (item, options) {
      item.path = [];
      const recoverSpeed = 0.01;
      item.recover("sleep", 0.01);
      item.deepHeal(recoverSpeed, "head");
      item.deepHeal(recoverSpeed, "body");
      item.deepHeal(recoverSpeed, "left_arm");
      item.deepHeal(recoverSpeed, "right_arm");
      item.deepHeal(recoverSpeed, "left_leg");
      item.deepHeal(recoverSpeed, "right_leg");
    },
    "end": function (item, options) {},
    "remove": function (item) {
      item.removeAllOfStatus('opready');
    },
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Sleeping'
  };
  _STATUSES.s_effect_hurt = {
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Hurt'
  };
  _STATUSES.s_effect_opready = {
    "start": function (item, options) {
      item.opready = true;
    },
    "tick": function (item, options) {},
    "end": function (item, options) {
      item.opready = false;
    },
    "remove": function (item, options) {
      item.opready = false;
    },
    "stacks": false,
    "parent": 'status_effects_server',
    "name": 'Operation Ready'
  };
  _STATUSES.s_effect_clonepod = {
    "start": function (item, options) {},
    "tick": function (item, options) {},
    "end": function (item, options) {},
    "remove": function (item, options) {},
    "stacks": false,
    "parent": 'status_effects_server',
    "name": 'Clone Pod'
  };
  _STATUSES.s_effect_bleed_protect = {
    "start": function (item, options) {},
    "tick": function (item, options) {},
    "stacks": false,
    "parent": 'status_effects_server',
    "name": 'Bleed Protect'
  };
  _STATUSES.s_effect_clone_needs = {
    "start": function (item, options) {},
    "tick": function (item, options) {
      if (item.data.dead || item.data.ko) return;
      item.upkeep("sleep", 0.001);
      item.upkeep("food", 0.002);
      item.upkeep("water", 0.003);
    },
    "end": function () {},
    "remove": function () {},
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Clone Needs'
  };
  _STATUSES.s_effect_setbullet = {
    "start": function (item, options) {
      item.data.bullet = options.bullet;
      item.data.stance = options.stance;
      item.sync();
    },
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Set Bullet'
  };
  _STATUSES.s_effect_syncdata = {
    "start": function (item, options) {
      const before = Object.keys(item.data.stats);
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
      const after = Object.keys(item.data.stats);
      if (before > after) {
        throw `Destroyed stats here`;
      }
      item.sync();
    },
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Sync Data'
  };
  _STATUSES.s_effect_levelling_up = {
    "start": function (item, options) {
      if (!item.data.isPlayer) {
        return;
      }
      try {
        game.xpActions[options.action].call(item, item, options.additional);
      } catch (e) {}
    },
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Levelling Up'
  };
  _STATUSES.s_effect_add_xp = {
    "start": function (item, options) {
      if (!item.data.isPlayer) {
        return;
      }
      try {
        item.data.levels[options.stat].addXP(options.amount, options.source || 'none');
        item.sync();
      } catch (e) {}
    },
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Add XP'
  };
  _STATUSES.s_effect_drinking = {
    "start": function (item, options) {},
    "tick": function (item, options) {
      item.path = [];
      item.sync();
    },
    "end": function (item, options) {
      item.data.stats.water = parseInt(item.data.stats.water) + 50;
      item.data.stats.water = item.data.stats.water > item.data.stats.maxWater ? item.data.stats.maxWater : item.data.stats.water;
    },
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Drinking'
  };
  _STATUSES.s_effect_eating = {
    "start": function (item, options) {},
    "tick": function (item, options) {
      item.path = [];
      item.sync();
    },
    "end": function (item, options) {
      item.data.stats.food = parseInt(item.data.stats.food) + 45;
      item.data.stats.food = item.data.stats.food > item.data.stats.maxFood ? item.data.stats.maxFood : item.data.stats.food;
    },
    "stacks": true,
    "parent": 'status_effects_server',
    "name": 'Eating'
  };
})();
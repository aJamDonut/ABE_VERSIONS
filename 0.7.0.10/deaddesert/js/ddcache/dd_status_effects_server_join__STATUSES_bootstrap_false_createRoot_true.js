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
      let decayPerSecond = 1;
      let timeDelta = 60 / 1000;
      let decay = decayPerSecond * timeDelta;
      item.data.stats.torp -= decay;
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
      item.sync();
    },
    "end": function (item, options) {
      item.data.stats.hp = parseInt(item.data.stats.hp) + 10;
    },
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
      item.torpor(0.0005);
    },
    "stacks": false,
    "parent": 'status_effects_server',
    "name": 'Clone Needs'
  };
})();
(function () {
  self._PHYSICS = {};
  _PHYSICS.collisions = {};
  _PHYSICS.collisions.explodeOnTouch = {
    "start": function (me, toucher, first) {
      return false;
      servers.physics.updateInternalObject(me.id, {
        die: true
      });
      servers.physics.helper.broadcastUpdate('helperFuncs', 'fireballAtCoords', {
        x: Math.ceil(me.x / 64),
        y: Math.ceil(me.y / 64)
      });
    },
    "end": function () {},
    "parent": 'phys_collisions',
    "name": 'explodeOnTouch'
  };
  _PHYSICS.collisions.npcTouch = {
    "start": function (me, toucher, first, event) {
      if (first) {
        if (event == 'start') {
          servers.physics.helper.physicsUpdate('nudge', {
            id: toucher.id
          });
        } else {
          servers.physics.helper.physicsUpdate('endNudge', {
            id: toucher.id
          });
        }
      }
    },
    "end": function () {},
    "parent": 'phys_collisions',
    "name": 'npcTouch'
  };
  _PHYSICS.collisions.tp = {
    "start": function (me, toucher, first) {
      if (me.data.usedata1.length > 0) {
        servers.physics.removeAllObjects();
        servers.physics.helper.broadcastUpdate('helperFuncs', 'transitionLevel', {
          level: me.data.usedata1
        });
        me.data.usedata1 = '';
      } else {}
    },
    "parent": 'phys_collisions',
    "name": 'TP'
  };
  _PHYSICS.collisions.collision_hurts_1 = {
    "start": function (me, toucher, _first) {
      if (me.removePhysics || toucher.removePhysics) return;
      if (toucher.codename !== 'life') return;
      if (toucher.id === me.data.creatorId) return;
      if (toucher.data.dead) return;
      if (typeof toucher.addStatus !== 'function') return;
      if (me.class !== 'Projectile') return;
      if (!me.data.statuses) return;
      let collided = false;
      const creator = this.index.find(me.data.creatorId);
      collided = creator.data.targetId === toucher.id ? true : collided;
      collided = game.factions.enemies(creator, toucher) ? true : collided;
      if (!collided) return;
      const MAX_HITS = 1;
      me.removePhysics = me.hits && me.hits > game.rng(0, MAX_HITS) || me.data.created < game.ts - 500 ? true : me.removePhysics;
      me.hits = me.hits ? me.hits++ : 1;
      for (let i = 0; i < me.data.statuses.length; i++) {
        if (!toucher.shouldAddStatus(me.data.statuses[i])) return;
        toucher.addStatusFromPhysics(me.data.statuses[i].status, Object.assign(me.data.statuses[i], {
          creatorId: me.data.creatorId,
          source: me.id + '-' + i
        }));
      }
    },
    "end": function (me, toucher, first) {},
    "parent": 'phys_collisions',
    "name": 'Hurts a bit'
  };
  _PHYSICS.collisions.collision_get_touchers = {
    "start": function (me, toucher, first) {
      if (me.data.parentId == toucher.id || toucher.data.parentId == me.id) {
        return false;
      }
      if (typeof toucher.addStatus == 'function') {
        toucher.addStatus('touched', {
          source: me.data.parentId,
          duration: Infinity
        });
      } else {}
    },
    "end": function (me, toucher, first) {
      if (me.data.parentId == toucher.id || toucher.data.parentId == me.id) {
        return false;
      }
      if (typeof toucher.removeStatus == 'function' && first) {
        toucher.removeStatus('touched', {
          source: me.data.parentId
        });
      }
    },
    "parent": 'phys_collisions',
    "name": 'Get Touchers'
  };
  _PHYSICS.collisions.collision_npc_area = {
    "start": function (me, toucher, first) {
      if (me.data.parentId == toucher.id || toucher.data.parentId == me.id) {
        return false;
      }
      if (!me.data.touchers) me.data.touchers = {};
      me.data.touchers[toucher.id] = toucher.id;
      me.sync();
      const parent = this.index.find(me.data.parentId);
      if (parent) {
        parent.data.touchers = me.data.touchers;
        parent.sync();
      }
    },
    "end": function (me, toucher, first) {
      if (me.data.parentId == toucher.id || toucher.data.parentId == me.id) {
        return false;
      }
      if (me.data.touchers) delete me.data.touchers[toucher.id];
      me.sync();
      const parent = this.index.find(me.data.parentId);
      if (parent) {
        parent.data.touchers = me.data.touchers;
        parent.sync();
      }
    },
    "parent": 'phys_collisions',
    "name": 'NPC In Area'
  };
})();
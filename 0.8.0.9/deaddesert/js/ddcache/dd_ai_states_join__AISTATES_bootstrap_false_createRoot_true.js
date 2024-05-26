(function () {
  self._AISTATES = {};
  _AISTATES.aistate_idle = {
    "start": function (life) {
      life.idletime = Date.now();
      return true;
    },
    "run": function (life) {},
    "end": function () {},
    "weight": function (life) {
      if (Date.now() > life.idletime + game.rng(1000, 5000)) {
        return 0;
      }
      return 2;
    },
    "parent": 'ai_states',
    "name": 'Idle'
  };
  _AISTATES.aistate_randompath = {
    "start": function (life) {
      life.searchStart = Date.now();
      life.pathFind = true;
      servers.world.helper.pathUpdate('asyncPathFind', {
        id: life.id,
        x: life.x,
        y: life.y,
        endX: life.x + servers.world.helper.rng(-500, 500),
        endY: life.y + servers.world.helper.rng(-500, 500)
      });
    },
    "run": function (life) {
      if (life.pathFind && life.path.length > 0) {
        life.pathFind = false;
      }
      return true;
    },
    "end": function () {},
    "weight": function (life) {
      if (life.pathFind || life.path.length > 0) {
        if (Date.now() > life.searchStart + 10000) {
          life.pathFind = false;
          return 0;
        } else {
          return 100;
        }
      }
      if (life.state !== 'aistate_randompath') {
        return 90;
      } else {
        return 0;
      }
    },
    "parent": 'ai_states',
    "name": 'Find random path'
  };
  _AISTATES.aistate_runalong = {
    "start": function (life) {
      life.running = true;
    },
    "run": function (life) {
      if (life.hasPath) {}
    },
    "end": function () {},
    "weight": function (life) {
      if (life.path.length !== 0) {
        return 91;
      } else {
        return 0;
      }
    },
    "parent": 'ai_states',
    "name": 'Run along path'
  };
  _AISTATES.aistate_humanoid_idle = {
    "weight": function (life) {
      return 10;
    },
    "parent": 'ai_states',
    "name": 'Humanoid Idle'
  };
  _AISTATES.aistate_attack_chase = {
    "start": function (life) {
      if (life.attackStartX == false) {
        life.attackStartX = life.attackStartX ? life.attackStartX : life.x;
        life.attackStartY = life.attackStartY ? life.attackStartY : life.y;
      }
      life.lastShot = Date.now();
      life.pathFind = false;
      if (life.target !== undefined) {
        if (life.target.markedForDestroy == true) {
          return false;
        }
      }
      return true;
    },
    "run": function (life) {
      if (!life.data.targetId) {
        life.seekObj = false;
        return false;
      }
      var target = servers.world.index.getFromIndex(life.data.targetId, 'all');
      if (target == undefined) {
        life.log("Target removed");
        return false;
      }
      life.seekObj = target;
      return true;
    },
    "weight": function (life) {
      life.log("Should Chase? " + life.data.command + " " + life.data.command);
      if (life.data.isPlayer && life.data.command !== 'attack' && life.data.command !== 'defend') {
        life.log("Must stay");
        return 0;
      }
      if (life.data.holdPosition) {
        life.log("Hold position");
        return 0;
      }
      if (!life.data.targetId) {
        life.log("No target");
        return 0;
      }
      var target = servers.world.index.getFromIndex(life.data.targetId, 'all');
      if (!target) {
        life.data.targetId = false;
        life.log("Invalid target");
        return 0;
      }
      if (target.data.dead) {
        life.log("Target dead");
        return 0;
      }
      life.log("Should probably chase " + this.data.targetId);
      let dist = life.isMelee ? 64 : 600;
      let targetDist = life.dist(target);
      let hasLOS = life.sees[target.id];
      life.log("Distance: " + targetDist);
      if (!life.isMelee && hasLOS && targetDist < 600) {
        life.seekObj = false;
        life.gotoId = false;
        return 0;
      }
      if (life.data.targetId) {
        if (life.isMelee || targetDist > dist || !hasLOS) {
          life.log("LOS" + hasLOS);
          life.log("Chasing" + targetDist + "<" + dist);
          life.seekObj = target;
          life.gotoId = target.id;
        } else {
          life.seekObj = false;
          life.gotoId = false;
        }
      }
      if (life.attackStartX == false) {
        life.attackStartX = life.attackStartX ? life.attackStartX : life.x;
        life.attackStartY = life.attackStartY ? life.attackStartY : life.y;
      }
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Attack Chase'
  };
  _AISTATES.aistate_gather = {
    "start": function (life) {
      life.stopMoving();
      life.lastGather = game.ts;
      var target = servers.world.index.getFromIndex(life.data.gatherId, 'all');
      const HARVEST_AT = 10;
      life.data.harvest = 0;
      life.data.harvestAt = HARVEST_AT;
      target.data.harvest = 0;
    },
    "run": function (life) {
      if (game.ts < life.lastGather + 1000) {
        return;
      }
      var target = servers.world.index.getFromIndex(life.data.gatherId, 'all');
      if (!target) {
        return;
      }
      life.lastGather = game.ts;
      life.data.lastGather = game.ts;
      life.data.harvest++;
      target.data.harvest++;
      target.data.gatherer = life.id;
      target.data.gatherNow = false;
      if (life.data.harvest >= life.data.harvestAt) {
        life.data.harvest = 0;
        life.data.gatherNow = true;
      }
      life.sync();
      target.sync();
    },
    "weight": function (life) {
      if (!life.data.gatherId || life.data.do !== 'gather') {
        return 0;
      }
      var target = servers.world.index.getFromIndex(life.data.gatherId, 'all');
      if (!target) {
        life.data.gatherId = false;
        return 0;
      }
      if (life.dist(target) > 128) {
        return 0;
      } else {
        return 100;
      }
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Gather'
  };
  _AISTATES.aistate_goto_gather = {
    "start": function (life) {
      life.seekObj = servers.world.index.getFromIndex(life.data.gatherId, 'all');
    },
    "run": function (life) {
      return true;
      var target = servers.world.index.getFromIndex(life.data.gatherId, 'all');
      if (life.searchStart === 0) {
        life.searchStart = Date.now();
        if (target == undefined) {
          life.data.gatherId = false;
          return false;
        }
        if (life.pathFind == false) {
          life.pathFind = true;
          servers.world.helper.pathUpdate('asyncPathFind', {
            id: life.id,
            targetId: life.data.gatherId,
            x: life.x,
            y: life.y,
            endX: target.x,
            endY: target.y + target.height
          });
        }
      }
    },
    "end": function (life) {
      life.seekObj = false;
      if (life.id !== servers.world.playerId) {
        life.stopMoving();
        return;
      }
    },
    "weight": function (life) {
      if (!life.data.gatherId || life.data.do !== 'gather') {
        return 0;
      }
      var target = servers.world.index.getFromIndex(life.data.gatherId, 'all');
      if (!target) {
        life.data.gatherId = false;
        return 0;
      }
      if (life.dist(target) > 128) {
        return 51;
      } else {
        return 0;
      }
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Goto Gather'
  };
  _AISTATES.aistate_goto_find = {
    "start": function (life) {
      life.searchStart = 0;
      life.pathFind = false;
      if (!life.data.findId || life.data.do !== 'find') {
        return 0;
      }
      var target = servers.world.index.getFromIndex(life.data.findId, 'all');
      if (target.markedForDestroy == true) {
        life.data.findId = false;
        return false;
      }
    },
    "run": function (life) {
      var target = servers.world.index.getFromIndex(life.data.findId, 'all');
      if (life.searchStart === 0) {
        life.searchStart = Date.now();
        if (target == undefined) {
          life.data.findId = false;
          return false;
        }
        if (life.pathFind == false) {
          life.pathFind = true;
          servers.world.helper.pathUpdate('asyncPathFind', {
            id: life.id,
            targetId: life.data.findId,
            x: life.x,
            y: life.y,
            endX: target.x,
            endY: target.y + target.height
          });
        }
      }
    },
    "end": function (life) {
      if (life.id !== servers.world.playerId) {
        life.stopMoving();
        return;
      }
    },
    "weight": function (life) {
      if (!life.data.findId || life.data.do !== 'find') {
        return 0;
      }
      var target = servers.world.index.getFromIndex(life.data.findId, 'all');
      if (!target) {
        life.data.findId = false;
        return 0;
      }
      if (life.dist(target) > 64) {
        return 61;
      } else {
        return 0;
      }
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Goto Find'
  };
  _AISTATES.aistate_guardpatrol = {
    "start": function (life) {
      if (!life.wait) {
        return life.startSeekRandomObj('helper_guard_point');
      }
    },
    "run": function (life) {
      if (!this.isSearching() && !this.seekObj) return false;
      let guardPoint = this.seekObj;
      if (!guardPoint) {
        return false;
      }
      if (life.wait && life.wait < Date.now()) {
        this.log("Arrived already");
        life.findId = false;
        delete life.wait;
        return false;
      }
      if (life.dist(guardPoint) < 100) {
        this.log("Arrived");
        life.findId = false;
        life.seekObj = false;
        if (!life.wait) {
          this.log("Set WAIT");
          life.wait = Date.now() + servers.world.helper.rng(5000, 10000);
        }
      }
      if (!life.wait && life.search.startTime < Date.now() - 60000) {
        if (life.path.length == 0) {
          if (typeof guardPoint.failed === "function") {
            guardPoint.failed();
          }
          return false;
        }
      }
      return true;
    },
    "end": function (life) {
      delete life.search;
      life.findId = false;
      life.data.do = '';
      life.wait = false;
      life.seekObj = false;
    },
    "weight": function (life) {
      var guardPoints = servers.world.index.getIndex('helper_guard_point');
      var pointIds = Object.keys(guardPoints);
      if (pointIds.length == 0 || life.wait) {
        return 0;
      }
      return 15;
    },
    "parent": 'ai_states',
    "name": 'Guard Patrol'
  };
  _AISTATES.aistate_shuffle = {
    "start": function (life) {
      life.searchStart = Date.now();
      life.pathFind = true;
      if (!life.data.spawnX) {
        life.data.spawnX = life.x;
        life.data.spawnY = life.y;
      }
      let pathAround = life.data.spawnX ? {
        x: life.data.spawnX,
        y: life.data.spawnY
      } : life;
      servers.world.helper.pathUpdate('asyncPathFind', {
        id: life.id,
        x: life.x,
        y: life.y,
        endX: pathAround.x + servers.world.helper.rng(-640, 640),
        endY: pathAround.y + servers.world.helper.rng(-640, 640)
      });
      return true;
    },
    "run": function (life) {
      if (life.searchStart < Date.now() - game.rng(100, 5000)) {
        return false;
      }
    },
    "weight": function (life) {
      if (life.path.length > 0 || life.hasPath) {
        return 0;
      }
      if (game.rng(0, 15) == 5) {
        return 5;
      }
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Shuffle'
  };
  _AISTATES.aistate_ko = {
    "start": function () {
      this.path = [];
      return true;
    },
    "run": function () {
      return true;
    },
    "end": function () {
      return true;
    },
    "weight": function () {
      if (this.data.ko) {
        return 1000;
      }
    },
    "parent": 'ai_states',
    "name": 'Knocked out'
  };
  _AISTATES.aistate_gotocontainer = {
    "start": function (life) {
      life.startCurrentTask();
    },
    "run": function (life) {
      if (life.distanceToTask() < 80) {
        servers.world.helper.execClientObjectFunction(life.data.gotoId, `showInventory`, {});
        life.resetTask();
        return false;
      }
    },
    "weight": function (life) {
      if (life.getCurrentTask() === `opencontainer`) {
        return 80;
      } else {
        return 0;
      }
    },
    "parent": 'ai_states',
    "name": 'Goto Container'
  };
  _AISTATES.aistate_useitem = {
    "start": function (life) {
      life.startCurrentTask();
    },
    "run": function (life) {
      if (life.distanceToTask() < 128) {
        servers.world.helper.execClientObjectFunction(life.data.gotoId, `use`, {
          callerId: life.id
        });
        life.resetTask();
        return false;
      }
    },
    "weight": function (life) {
      if (life.getCurrentTask() === `useitem`) {
        return 80;
      } else {
        return 0;
      }
    },
    "parent": 'ai_states',
    "name": 'Use Item'
  };
  _AISTATES.aistate_spread = {
    "weight": function (life) {
      if (this.path.length > 0 || life.data.targetId) {
        return 0;
      }
      if (typeof life.searchIndex == 'undefined') {
        life.searchIndex = -1;
        life.lastSweep = Date.now() - 10000;
      }
      life.searchIndex++;
      let keys = Object.keys(life.touchers);
      if (keys.length == 0) {
        return false;
      }
      if (life.searchIndex >= keys.length) {
        life.searchIndex = 0;
      }
      let toucher = this.touchers[keys[life.searchIndex]];
      if (!toucher) {
        return 0;
      }
      let target = servers.world.index.getFromIndex(keys[life.searchIndex], 'all');
      if (target.codename !== 'life') {
        return 0;
      }
      if (target.data.dead) {
        return 0;
      }
      if (life.dist(target) < 20) {
        life.makeSpace(target);
      }
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Spread Apart'
  };
  _AISTATES.aistate_go_home = {
    "start": function (life) {
      servers.world.helper.pathUpdate('asyncPathFind', {
        id: life.id,
        targetId: life.data.gatherId,
        x: life.x,
        y: life.y,
        endX: life.data.home.x,
        endY: life.data.home.y
      });
      life.data.goHome = false;
    },
    "run": function () {},
    "end": function () {},
    "weight": function (life) {
      if (life.data.isPlayer && !life.data.actionToggles.defend) {
        return 0;
      }
      if (life.lastShot < game.ts - 30000 || life.dist(life.data.home) > 15 * 64) {
        life.lastShot = game.ts;
        life.data.goHome = true;
        return 10;
      }
    },
    "parent": 'ai_states',
    "name": 'Go Home'
  };
  _AISTATES.aistate_move = {
    "start": function (life) {
      life.removeTarget();
    },
    "run": function (life) {},
    "end": function () {},
    "weight": function (life) {
      if (life.data.isPlayer && life.data.command == 'moveto') {
        life.removeTarget();
      }
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Move'
  };
  _AISTATES.aistate_changeweapon = {
    "start": function (life) {},
    "run": function (life) {},
    "end": function () {},
    "weight": function (life) {
      if (!life.data.targetId || this.lastSwap && this.lastSwap > game.ts - 2000) {
        return 0;
      }
      var target = servers.world.index.getFromIndex(life.data.targetId, 'all');
      if (!target) {
        return 0;
      }
      let dist = life.isMelee ? 128 : 600;
      let targetDist = life.dist(target);
      if ((life.data.stance == 'none' || life.data.stance == 'melee') && targetDist < 64 * 5) {
        return 0;
      }
      if (life.data.stance !== 'none' && life.data.stance !== 'melee' && targetDist < 64 * 2) {
        life.swapWeaponSlots();
        this.lastSwap = game.ts;
        return 0;
      }
      if ((life.data.stance == 'none' || life.data.stance == 'melee') && targetDist > 64 * 5) {
        if (life.data.hasRangedBackWeapon) {
          life.swapWeaponSlots();
          this.lastSwap = game.ts;
        }
      }
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Change Weapon'
  };
  _AISTATES.aistate_solve = {
    "start": function (life) {
      if (!life.data.solveHistory) {
        life.data.solveHistory = {};
      }
      if (typeof life.next !== "function") {
        life.next = function () {
          let x = Math.floor((this.x + 32) / 64);
          let y = Math.floor((this.y + 32) / 64);
          let north = {
            x: x,
            y: y - 1
          };
          let east = {
            x: x + 1,
            y: y
          };
          let south = {
            x: x,
            y: y + 1
          };
          let west = {
            x: x - 1,
            y: y
          };
          if (!this.hasSolved(south)) {
            return south;
          }
          if (!this.hasSolved(east)) {
            return east;
          }
          if (!this.hasSolved(west)) {
            return west;
          }
          if (!this.hasSolved(north)) {
            return north;
          }
          life.data.solveHistory = {};
          return this.next();
        };
        life.hasSolved = function (direction) {
          let x = direction.x;
          let y = direction.y;
          return this.data.solveHistory[x + "-" + y];
        };
        life.addSolve = function (x, y) {
          const MAX_QUEUE_LENGTH = 50;
          let keys = Object.keys(this.data.solveHistory);
          if (keys.length >= MAX_QUEUE_LENGTH) {
            delete this.data.solveHistory[keys[0]];
          }
          x = Math.floor(x / 64);
          y = Math.floor(y / 64);
          life.data.solveHistory[x + "-" + y] = true;
        };
      }
      life.addSolve(life.x, life.y);
      let solve = life.next();
      let x = solve.x * 64;
      let y = solve.y * 64;
      life.addSolve(x, y);
      life.searchStart = Date.now();
      life.pathFind = true;
      servers.world.helper.pathUpdate('asyncPathFind', {
        id: life.id,
        x: life.x,
        y: life.y,
        endX: x,
        endY: y
      });
    },
    "run": function (life) {
      if (life.pathFind && life.path.length > 0) {
        life.pathFind = false;
      }
      return true;
    },
    "end": function (life) {},
    "weight": function (life) {
      if (life.pathFind || life.path.length > 0) {
        if (Date.now() > life.searchStart + 2000) {
          life.pathFind = false;
          return 0;
        } else {
          return 100;
        }
      }
      if (life.state !== 'aistate_solve') {
        return 90;
      } else {
        return 0;
      }
    },
    "parent": 'ai_states',
    "name": 'Solve room'
  };
  _AISTATES.aistate_gotopoints = {
    "start": function (life) {
      if (!life.wait) {
        return life.startSeekRandomObj('helper_job_point');
      }
    },
    "run": function (life) {
      if (!this.isSearching() && !this.seekObj) return false;
      let guardPoint = this.seekObj;
      if (guardPoint.isReserved() && !guardPoint.isReservedBy(life.id)) {
        return false;
      }
      guardPoint.reserve(life.id);
      if (!guardPoint) {
        return false;
      }
      if (life.dist(guardPoint) < 100 || life.wait) {
        life.data.forceDir = guardPoint.data.standDir;
        life.sync();
      }
      if (life.wait && life.wait < Date.now()) {
        guardPoint.release();
        return false;
      }
      if (life.wait && life.wait > Date.now()) {
        return true;
      }
      if (!life.path.length && life.dist(guardPoint) < 100 && !life.wait) {
        this.log("Arrived");
        life.findId = false;
        life.data.dir = guardPoint.data.standDir;
        life.sync();
        this.log("Set WAIT");
        life.wait = guardPoint.data.waitTime || Date.now() + servers.world.helper.rng(5000, 30000);
      }
      if (!life.wait && life.search.startTime < Date.now() - 60000) {
        if (life.path.length == 0) {
          if (typeof guardPoint.failed === "function") {
            guardPoint.failed();
          }
          return false;
        }
      }
      return true;
    },
    "end": function (life) {
      delete life.search;
      life.findId = false;
      life.data.do = '';
      life.wait = false;
      life.seekObj = false;
      life.data.forceDir = false;
      life.sync();
    },
    "weight": function (life) {
      if (life.data.isPlayer) return 0;
      var guardPoints = servers.world.index.getIndex('helper_job_point');
      var pointIds = Object.keys(guardPoints);
      if (pointIds.length == 0) {
        return 0;
      }
      return 20;
    },
    "parent": 'ai_states',
    "name": 'Goto Points'
  };
  _AISTATES.aistate_find_enemies = {
    "weight": function (life) {
      if (life.data.isPlayer && life.data.command !== 'defend') {
        return 0;
      }
      if (life.data.ko || life.data.dead) {
        life.log("I'm dead or KO");
        return 0;
      }
      let target = life.scanningLife;
      if (!target) {
        life.log("Cant scan this undefined");
        return 0;
      }
      if (target.codename !== 'life') {
        life.log("I cant attack none life");
        return 0;
      }
      if (target.data.ko) {
        life.log("Can't attack KO");
        return 0;
      }
      if (target.data.dead) {
        life.log("Cant attack dead");
        return 0;
      }
      if (life.id === target.id) {
        life.log("Its meeee!");
        return 0;
      }
      if (life.data.targetId === target.id) {
        life.log("Im already attachin this guy");
        return 0;
      }
      if (!life.sees[target.id]) {
        life.log("Cant see the one im scanning");
        return 0;
      }
      if (life.dist(target) > 20 * 64) {
        life.log("Its too far away");
        return 0;
      }
      if (!game.factions.enemies(life, target)) {
        life.log("It not my enemey " + life.data.faction + " " + target.data.faction);
        if (!target.data.targetId) return 0;
        if (game.rng(0, 3) == 2) {
          life.searchStart = Date.now();
          life.pathFind = true;
          servers.world.helper.pathUpdate('asyncPathFind', {
            id: life.id,
            x: life.x,
            y: life.y,
            endX: target.x + servers.world.helper.rng(-64, 128),
            endY: target.y + servers.world.helper.rng(-64, 128)
          });
        }
        return 0;
      }
      life.log("MAY SWAP ENEMY LETS SEE");
      let currentTarget = servers.world.index.find(life.data.targetId);
      if (!currentTarget || currentTarget.data.dead) {
        return life.setTarget(target);
      }
      const distToNew = life.dist(target);
      const distToCurrent = life.dist(currentTarget);
      const DISTANCE_CHANGE = 64;
      const distDifference = Math.abs(distToNew - distToCurrent);
      if (distToNew < distToCurrent) {
        return life.setTarget(target);
      }
      const pirahnas = 0;
      if (pirahnas && target.data.stats.hp > currentTarget.data.stats.hp) {
        if (currentTarget.data.stats.hp < 50) {
          return 0;
        }
        return life.setTarget(target);
      }
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Find Enemies'
  };
  _AISTATES.aistate_find_jobs = {
    "start": function (life) {
      return life.getJobs();
    },
    "run": function (life) {
      return life.getJobs();
    },
    "weight": function (life) {
      if (life.data.targetId || life.data.dead || life.data.ko) return 0;
      if (life.hasJobCooldown()) return 0;
      if (life.shouldWork()) {
        if (life.hasJob() === false) {
          life.log("Has job");
          return 50;
        }
      }
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Find Jobs'
  };
  _AISTATES.aistate_do_jobs = {
    "start": function (life) {
      life.log("Start travelling");
      return true;
    },
    "run": function (life) {
      if (life.distanceToTask() < 168) {
        life.doJob();
      }
    },
    "weight": function (life) {
      if (life.hasJob() === true) {
        life.log("Has job should travel");
        return 75;
      }
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Do Jobs'
  };
  _AISTATES.aistate_find_los = {
    "weight": function (life) {
      if (life.data.targetId && game.ts % 4) {
        life.scanningLife = this.helper.world.index.getFromIndex(this.data.targetId, 'all');
      }
      let target = life.scanningLife;
      if (!target) {
        return 0;
      }
      if (target.codename !== 'life') {
        return 0;
      }
      if (target.data.dead) {
        return 0;
      }
      if (!life.hasLOS(target) && life.losSearching) {
        life.searchIndex--;
        return 0;
      }
      if (!life.losRay.includes(target.id)) {
        life.sees[target.id] = false;
        return 0;
      }
      life.sees[target.id] = true;
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Find LOS'
  };
  _AISTATES.aistate_searchindex = {
    "weight": function (life) {
      if (life.searchIndex && life.searchIndex > Object.keys(life.touchers).length) {
        life.searchIndex = -1;
        life.lastSweep = game.ts;
      }
      if (typeof life.searchIndex == 'undefined') {
        life.searchIndex = -1;
        life.lastSweep = Date.now() - 10000;
      }
      let keys = Object.keys(life.touchers);
      if (keys.length == 0) {
        life.log("No keys");
        life.searchIndex = -1;
        life.fullSweep = true;
        life.lastSweep = Date.now();
        return 0;
      }
      life.searchIndex++;
      let target = servers.world.index.getFromIndex(keys[life.searchIndex], 'all');
      if (!target) {
        return 0;
      }
      if (life.dist(target) > 25 * 64) {
        return 0;
      }
      life.log("Scanning " + target.id);
      life.scanningLife = target;
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Start Search Index'
  };
  _AISTATES.aistate_follow_player = {
    "start": function (life) {
      life.searchStart = Date.now();
      life.pathFind = true;
      var player = servers.world.getPlayer();
      life.seekObj = player;
    },
    "run": function (life) {
      if (life.pathFind && life.path.length > 0) {
        life.pathFind = false;
        life.path.pop();
        life.path.pop();
        life.path.pop();
      }
      var player = servers.world.getPlayer();
      if (life.dist(player) < 128) {
        this.seekObj = false;
        this.path = [];
      }
      return true;
    },
    "weight": function (life) {
      if (life.data.command !== 'follow' && life.data.command !== 'retreat' && life.data.command !== 'recall') {
        return 0;
      }
      if (life.pathFind || life.path.length > 0) {
        if (Date.now() > life.searchStart + 2500) {
          life.pathFind = false;
          return 0;
        } else {
          return 100;
        }
      }
      if (life.state !== 'aistate_follow_player') {
        return 90;
      } else {
        return 0;
      }
    },
    "parent": 'ai_states',
    "name": 'Follow Player'
  };
  _AISTATES.aistate_follow_leader = {
    "start": function (life) {
      life.searchStart = Date.now();
      life.pathFind = true;
      const leader = servers.world.index.find(life.data.leaderId);
      if (!leader) {
        life.data.leaderId = false;
        return false;
      }
      life.seekObj = leader;
    },
    "run": function (life) {
      const leader = servers.world.index.find(life.data.leaderId);
      if (life.dist(leader) < 84) {
        this.seekObj = false;
        this.path = [];
      }
      return true;
    },
    "weight": function (life) {
      if (!life.data.leaderId || life.data.targetId) return 0;
      const leader = servers.world.index.find(life.data.leaderId);
      if (!leader) {
        life.data.leaderId = false;
        return 0;
      }
      if (leader.data.dead || leader.data.ko) {
        if (life.data.isPlayer) {
          life.data.leaderId = false;
        }
        return 0;
      }
      if (life.dist(leader) < 128) {
        return 0;
      }
      return 20;
    },
    "parent": 'ai_states',
    "name": 'Follow Leader'
  };
  _AISTATES.aistate_attack = {
    "start": function (life) {},
    "end": function () {},
    "weight": function (life) {
      if (life.data.ko || life.data.dead) {
        life.removeTarget();
        return 0;
      }
      if (!life.data.targetId) {
        return 0;
      }
      var target = servers.world.index.getFromIndex(life.data.targetId, 'all');
      if (!target) {
        life.removeTarget();
        return 0;
      }
      if (life.data.targetId) {
        life.data.doAttack = true;
        let dist = life.isMelee ? 128 : 600;
        let targetDist = life.dist(target);
        if (targetDist > dist) {
          return 0;
        }
        if (target == undefined) {
          life.removeTarget();
          return 0;
        }
        if (target.data.dead || target.data.ko) {
          life.removeTarget();
          return 0;
        }
        if (life.sees[target.id] && life.id !== servers.world.playerId) {
          if (game.rng(0, 3) === 3) {
            life.stopMoving();
          }
        }
        let cooldown = life.data.bullet && life.data.bullet.cooldown ? life.data.bullet.cooldown : 2;
        let skill = 1;
        let cooldownCap = 75;
        let onePercent = cooldownCap / 100;
        let newCooldownReduction = onePercent * skill;
        newCooldownReduction = newCooldownReduction / 100;
        cooldown *= 1 - newCooldownReduction;
        if (!life.lastShot || Date.now() > life.lastShot + 2500) {
          life.attackStartX = life.x;
          life.attackStartY = life.y;
          life.pathFind = false;
          var target = servers.world.index.getFromIndex(life.data.targetId, 'all');
          if (!target) {
            life.removeTarget();
            return false;
          }
          if (target.markedForDestroy == true) {
            return false;
          }
          life.shoot();
          life.lastShot = Date.now() + life.helper.rng(-512, 512);
          if (life.helper.rng(0, 3) === 2) {
            life.searchStart = Date.now();
            life.pathFind = true;
            servers.world.helper.pathUpdate('asyncPathFind', {
              id: life.id,
              x: life.x,
              y: life.y,
              endX: life.attackStartX + servers.world.helper.rng(-64, 128),
              endY: life.attackStartY + servers.world.helper.rng(-64, 128)
            });
          }
        }
      }
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Attack'
  };
  _AISTATES.aistate_attack_stop_chase = {
    "start": function (life) {
      life.searchStart = 0;
      life.pathFind = false;
      life.seekObj = false;
      life.removeTarget();
      life.data.last_log = "i started";
      life.sync();
      if ((!life.data.isPlayer || life.data.do == 'defend') && life.attackStartX && life.attackStartY) {
        servers.world.helper.pathUpdate('asyncPathFind', {
          id: life.id,
          x: life.x,
          y: life.y,
          endX: life.attackStartX,
          endY: life.attackStartY,
          isPlayer: life.data.isPlayer
        });
      }
    },
    "run": function (life) {
      if (life.path.length > 0) {
        return true;
      }
      return false;
    },
    "end": function (life) {
      life.sync();
      life.data.last_log = "i ended";
      life.lastShot = Date.now();
    },
    "weight": function (life) {
      life.data.last_log = "Looking";
      life.sync();
      if (!life.data.targetId) {
        return 0;
      }
      life.data.last_log = "has target";
      var target = servers.world.index.getFromIndex(life.data.targetId, 'all');
      if (!target) {
        life.removeTarget();
        life.sync();
        life.data.last_log = "return 0 invalid";
        return 0;
      }
      if (target.data.dead) {
        life.data.last_log = "target dead";
        return 110;
      }
      life.data.last_log = "past top checks";
      if (servers.world.helper.dist(target, life) > 15 * 64) {
        life.data.last_log = "far away run it";
        return 110;
      }
      if (life.lastShot && Date.now() > life.lastShot + 60000) {
        life.removeTarget();
        life.lastShot = Date.now();
        life.data.last_log = "timed it out";
        return 110;
      }
      if (target.data.dead == true) {
        life.data.last_log = "its dead";
        return 110;
      }
      if (servers.world.helper.dist(target, life) > 5024) {
        life.data.last_log = "its soo far";
        return 110;
      }
      return 0;
    },
    "parent": 'ai_states',
    "name": 'Attack Stop Chase'
  };
  _AISTATES.ais_player_clone = {
    "states": 'aistate_gotocontainer,aistate_find_jobs,aistate_do_jobs,aistate_useitem,aistate_gather,aistate_goto_gather,aistate_follow_player,aistate_move',
    "parent": 'ai_states_collections',
    "name": 'Player Clone'
  };
  _AISTATES.ais_default = {
    "states": 'aistate_go_home,aistate_ko,aistate_idle,aistate_follow_leader,aistate_find_enemies,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistate_changeweapon,aistate_gotopoints',
    "parent": 'ai_states_collections',
    "name": 'Default - all inherit'
  };
  _AISTATES.ais_drone = {
    "states": 'aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistate_gather,aistate_goto_gather',
    "parent": 'ai_states_collections',
    "name": 'Drone (player default)'
  };
  _AISTATES.ais_guard = {
    "states": 'aistate_ko,aistate_idle,aistate_shuffle,aistate_attack,aistate_changeweapon,aistate_attack_chase,aistate_attack_stop_chase,aistate_go_home,aistate_guardpatrol,aistate_gotopoints',
    "parent": 'ai_states_collections',
    "name": 'Guard'
  };
  _AISTATES.ais_wander = {
    "states": 'aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistate_gotopoints',
    "parent": 'ai_states_collections',
    "name": 'Wanderer'
  };
  _AISTATES.ais_deadhead = {
    "states": 'aistate_ko,aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistate_shuffle',
    "parent": 'ai_states_collections',
    "name": 'Wanderer'
  };
  _AISTATES.ais_police = {
    "states": 'aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistate_gotopoints',
    "parent": 'ai_states_collections',
    "name": 'Guard'
  };
  _AISTATES.ais_prop = {
    "states": 'aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistage_go_home',
    "parent": 'ai_states_collections',
    "name": 'Prop'
  };
  _AISTATES.ais_shopkeeper = {
    "states": 'aistate_ko,aistate_idle,aistate_attack,aistate_changeweapon,aistate_attack_chase,aistate_attack_stop_chase',
    "parent": 'ai_states_collections',
    "name": 'Shopkeeper'
  };
  _AISTATES.ais_placid = {
    "states": 'aistate_ko,aistate_idle,aistate_shuffle,aistate_attack,aistate_changeweapon,aistate_attack_chase,aistate_attack_stop_chase,aistate_go_home',
    "parent": 'ai_states_collections',
    "name": 'Placid'
  };
  _AISTATES.ais_solver = {
    "states": 'aistate_ko,aistate_idle,aistate_solve',
    "parent": 'ai_states_collections',
    "name": 'Solver (Simple brain)'
  };
})();
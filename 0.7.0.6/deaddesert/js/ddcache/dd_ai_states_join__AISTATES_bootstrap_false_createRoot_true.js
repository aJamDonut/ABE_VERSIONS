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
      return 1;
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
      var target = servers.world.index.getFromIndex(life.data.targetId, 'all');
      if (target == undefined) {
        life.log("Target removed");
        return false;
      }
      life.seekObj = target;
      return true;
    },
    "weight": function (life) {
      life.log("Chase? " + life.data.command + " " + life.data.command);
      if (life.data.isPlayer && life.data.command !== 'attack' && life.data.command !== 'defend') {
        return 0;
      }
      if (life.data.holdPosition) {
        return 0;
      }
      life.log("Chase?");
      if (!life.data.targetId) {
        return 0;
      }
      life.log("No target");
      var target = servers.world.index.getFromIndex(life.data.targetId, 'all');
      if (!target) {
        life.data.targetId = false;
        return 0;
      }
      if (target.data.dead) {
        return 0;
      }
      life.log("Target dead");
      let dist = life.isMelee ? 80 : 600;
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
      let pathAround = life.data.spawnX ? {
        x: life.data.spawnX,
        y: life.data.spawnY
      } : life;
      servers.world.helper.pathUpdate('asyncPathFind', {
        id: life.id,
        x: life.x,
        y: life.y,
        endX: pathAround.x + servers.world.helper.rng(-64, 64),
        endY: pathAround.y + servers.world.helper.rng(-64, 64)
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
        return 50;
      }
      return 0;
    },
    "startbp": {
      "links": {
        "link-container0-row-4-container1-row-1": {
          "id": "link-container0-row-4-container1-row-1",
          "inputContainerId": "container0",
          "outputContainerId": "container1",
          "inputRowId": "container0-row-4",
          "outputRowId": "container1-row-1"
        }
      },
      "lastContainerId": 2,
      "containers": {
        "container0": {
          "rows": {
            "container0-row-1": {
              "type": "row",
              "id": "container0-row-1",
              "options": {
                "name": "input1",
                "subcomponent": "Drago__List",
                "list": ["lifeobject_created", "grid-loading", "grid-loaded", "leftclick-up", "rightclick-up", "middleclick-up", "world-leftclick-up", "world-rightclick-up", "world-middleclick-up", "newgame-init", "leveleditor-init", "itemcontainer_created", "inventory-additem", "inventory-removeitem"],
                "datatype": "string",
                "type": "variable"
              },
              "subcomponent": "Drago__List",
              "value": "lifeobject_created"
            },
            "container0-row-2": {
              "type": "row",
              "id": "container0-row-2",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Object",
                "value": "life",
                "type": "output",
                "label": "",
                "multi": true
              },
              "subcomponent": "Drago__Object",
              "value": "life"
            },
            "container0-row-3": {
              "type": "row",
              "id": "container0-row-3",
              "options": {
                "name": "output2",
                "label": "Event Name",
                "subcomponent": "Drago__Variable",
                "variable": "input1",
                "type": "output",
                "multi": true
              },
              "subcomponent": "Drago__Variable",
              "value": ""
            },
            "container0-row-4": {
              "type": "row",
              "id": "container0-row-4",
              "options": {
                "name": "output3",
                "subcomponent": "Drago__Label",
                "type": "output",
                "process": true,
                "label": "Execute",
                "multi": true
              },
              "subcomponent": "Drago__Label",
              "value": ""
            }
          },
          "type": "event",
          "options": {
            "component": "Drago_Abe_Event",
            "type": "event",
            "title": "Event",
            "x": 100,
            "y": 100
          },
          "component": "Drago_Abe_Event",
          "x": 180,
          "y": 156
        },
        "container1": {
          "rows": {
            "container1-row-1": {
              "type": "row",
              "id": "container1-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container1"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container1-row-2": {
              "type": "row",
              "id": "container1-row-2",
              "options": {
                "name": "input1",
                "type": "variable",
                "label": "",
                "list": ["true", "false"],
                "subcomponent": "Drago__List"
              },
              "subcomponent": "Drago__List",
              "value": "true"
            }
          },
          "type": "container",
          "options": {
            "component": "Drago_Logic_End",
            "x": 100,
            "y": 945
          },
          "component": "Drago_Logic_End",
          "x": 480,
          "y": 372
        }
      }
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
    "startbp": {
      "links": {
        "link-container2-row-2-container3-row-1": {
          "id": "link-container2-row-2-container3-row-1",
          "inputContainerId": "container2",
          "outputContainerId": "container3",
          "inputRowId": "container2-row-2",
          "outputRowId": "container3-row-1"
        },
        "link-container7-row-1-container3-row-2": {
          "id": "link-container7-row-1-container3-row-2",
          "inputContainerId": "container7",
          "outputContainerId": "container3",
          "inputRowId": "container7-row-1",
          "outputRowId": "container3-row-2"
        }
      },
      "lastContainerId": 11,
      "containers": {
        "container2": {
          "rows": {
            "container2-row-1": {
              "type": "row",
              "id": "container2-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Object",
                "value": "life",
                "type": "output",
                "label": "",
                "multi": true
              },
              "subcomponent": "Drago__Object",
              "value": "life"
            },
            "container2-row-2": {
              "type": "row",
              "id": "container2-row-2",
              "options": {
                "name": "output3",
                "subcomponent": "Drago__Label",
                "type": "output",
                "process": true,
                "label": "Execute",
                "multi": true
              },
              "subcomponent": "Drago__Label",
              "value": ""
            }
          },
          "type": "event",
          "options": {
            "rows": {
              "container2-row-1": {
                "type": "row",
                "id": "container2-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Object",
                  "value": "life",
                  "type": "output",
                  "label": "",
                  "multi": true
                },
                "subcomponent": "Drago__Object",
                "value": "life"
              },
              "container2-row-2": {
                "type": "row",
                "id": "container2-row-2",
                "options": {
                  "name": "output3",
                  "subcomponent": "Drago__Label",
                  "type": "output",
                  "process": true,
                  "label": "Execute",
                  "multi": true
                },
                "subcomponent": "Drago__Label",
                "value": ""
              }
            },
            "id": "container2",
            "component": "Drago_Abe_LifeEvent",
            "x": 220,
            "y": 420
          },
          "component": "Drago_Abe_LifeEvent",
          "x": 220,
          "y": 420
        },
        "container3": {
          "rows": {
            "container3-row-1": {
              "type": "row",
              "id": "container3-row-1",
              "options": {
                "type": "input",
                "label": "Execute",
                "subcomponent": "Drago__Start",
                "name": "container3"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container3-row-2": {
              "type": "row",
              "id": "container3-row-2",
              "options": {
                "name": "input2",
                "type": "input",
                "label": "Function"
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container3-row-1": {
                "type": "row",
                "id": "container3-row-1",
                "options": {
                  "type": "input",
                  "label": "Execute",
                  "subcomponent": "Drago__Start",
                  "name": "container3"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container3-row-2": {
                "type": "row",
                "id": "container3-row-2",
                "options": {
                  "name": "input2",
                  "type": "input",
                  "label": "Function"
                },
                "value": ""
              }
            },
            "id": "container3",
            "component": "Drago_Logic_Execute",
            "x": 510,
            "y": 444
          },
          "component": "Drago_Logic_Execute",
          "x": 510,
          "y": 444
        },
        "container7": {
          "rows": {
            "container7-row-1": {
              "type": "row",
              "id": "container7-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Task",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container7-row-1": {
                "type": "row",
                "id": "container7-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Output",
                  "type": "output",
                  "label": "Task",
                  "multi": true
                },
                "subcomponent": "Drago__Output",
                "value": ""
              }
            },
            "id": "container7",
            "component": "Drago_Life_StartCurrentTask",
            "x": 220,
            "y": 516
          },
          "component": "Drago_Life_StartCurrentTask",
          "x": 220,
          "y": 516
        }
      }
    },
    "runbp": {
      "links": {
        "link-container1-row-2-container2-row-1": {
          "id": "link-container1-row-2-container2-row-1",
          "inputContainerId": "container1",
          "outputContainerId": "container2",
          "inputRowId": "container1-row-2",
          "outputRowId": "container2-row-1"
        },
        "link-container3-row-1-container2-row-2": {
          "id": "link-container3-row-1-container2-row-2",
          "inputContainerId": "container3",
          "outputContainerId": "container2",
          "inputRowId": "container3-row-1",
          "outputRowId": "container2-row-2"
        },
        "link-container4-row-1-container2-row-4": {
          "id": "link-container4-row-1-container2-row-4",
          "inputContainerId": "container4",
          "outputContainerId": "container2",
          "inputRowId": "container4-row-1",
          "outputRowId": "container2-row-4"
        },
        "link-container2-row-5-container5-row-1": {
          "id": "link-container2-row-5-container5-row-1",
          "inputContainerId": "container2",
          "outputContainerId": "container5",
          "inputRowId": "container2-row-5",
          "outputRowId": "container5-row-1"
        },
        "link-container7-row-1-container5-row-2": {
          "id": "link-container7-row-1-container5-row-2",
          "inputContainerId": "container7",
          "outputContainerId": "container5",
          "inputRowId": "container7-row-1",
          "outputRowId": "container5-row-2"
        },
        "link-container2-row-5-container9-row-1": {
          "id": "link-container2-row-5-container9-row-1",
          "inputContainerId": "container2",
          "outputContainerId": "container9",
          "inputRowId": "container2-row-5",
          "outputRowId": "container9-row-1"
        },
        "link-container11-row-1-container9-row-2": {
          "id": "link-container11-row-1-container9-row-2",
          "inputContainerId": "container11",
          "outputContainerId": "container9",
          "inputRowId": "container11-row-1",
          "outputRowId": "container9-row-2"
        },
        "link-container2-row-5-container12-row-1": {
          "id": "link-container2-row-5-container12-row-1",
          "inputContainerId": "container2",
          "outputContainerId": "container12",
          "inputRowId": "container2-row-5",
          "outputRowId": "container12-row-1"
        }
      },
      "lastContainerId": 19,
      "containers": {
        "container1": {
          "rows": {
            "container1-row-1": {
              "type": "row",
              "id": "container1-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Object",
                "value": "life",
                "type": "output",
                "label": "",
                "multi": true
              },
              "subcomponent": "Drago__Object",
              "value": "life"
            },
            "container1-row-2": {
              "type": "row",
              "id": "container1-row-2",
              "options": {
                "name": "output3",
                "subcomponent": "Drago__Label",
                "type": "output",
                "process": true,
                "label": "Execute",
                "multi": true
              },
              "subcomponent": "Drago__Label",
              "value": ""
            }
          },
          "type": "event",
          "options": {
            "rows": {
              "container1-row-1": {
                "type": "row",
                "id": "container1-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Object",
                  "value": "life",
                  "type": "output",
                  "label": "",
                  "multi": true
                },
                "subcomponent": "Drago__Object",
                "value": "life"
              },
              "container1-row-2": {
                "type": "row",
                "id": "container1-row-2",
                "options": {
                  "name": "output3",
                  "subcomponent": "Drago__Label",
                  "type": "output",
                  "process": true,
                  "label": "Execute",
                  "multi": true
                },
                "subcomponent": "Drago__Label",
                "value": ""
              }
            },
            "id": "container1",
            "component": "Drago_Abe_LifeEvent",
            "x": 170,
            "y": 360
          },
          "component": "Drago_Abe_LifeEvent",
          "x": 170,
          "y": 360
        },
        "container2": {
          "rows": {
            "container2-row-1": {
              "type": "row",
              "id": "container2-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container2"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container2-row-2": {
              "type": "row",
              "id": "container2-row-2",
              "options": {
                "name": "input1",
                "type": "input",
                "label": "Var 1"
              },
              "value": ""
            },
            "container2-row-3": {
              "type": "row",
              "id": "container2-row-3",
              "options": {
                "name": "input2",
                "subcomponent": "Drago__List",
                "list": ["===", "==", "!=", "<", ">", "<=", ">="],
                "datatype": "string",
                "type": "variable",
                "process": true
              },
              "subcomponent": "Drago__List",
              "value": "<"
            },
            "container2-row-4": {
              "type": "row",
              "id": "container2-row-4",
              "options": {
                "name": "input3",
                "type": "input",
                "label": "Var 2"
              },
              "value": ""
            },
            "container2-row-5": {
              "type": "row",
              "id": "container2-row-5",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "true",
                "enabled": false,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            },
            "container2-row-6": {
              "type": "row",
              "id": "container2-row-6",
              "options": {
                "name": "output2",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "false",
                "enabled": true,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container2-row-1": {
                "type": "row",
                "id": "container2-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container2"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container2-row-2": {
                "type": "row",
                "id": "container2-row-2",
                "options": {
                  "name": "input1",
                  "type": "input",
                  "label": "Var 1"
                },
                "value": ""
              },
              "container2-row-3": {
                "type": "row",
                "id": "container2-row-3",
                "options": {
                  "name": "input2",
                  "subcomponent": "Drago__List",
                  "list": ["===", "==", "!=", "<", ">", "<=", ">="],
                  "datatype": "string",
                  "type": "variable",
                  "process": true
                },
                "subcomponent": "Drago__List",
                "value": "<"
              },
              "container2-row-4": {
                "type": "row",
                "id": "container2-row-4",
                "options": {
                  "name": "input3",
                  "type": "input",
                  "label": "Var 2"
                },
                "value": ""
              },
              "container2-row-5": {
                "type": "row",
                "id": "container2-row-5",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Boolean",
                  "type": "output",
                  "label": "true",
                  "enabled": false,
                  "process": true,
                  "multi": true
                },
                "subcomponent": "Drago__Boolean",
                "value": ""
              },
              "container2-row-6": {
                "type": "row",
                "id": "container2-row-6",
                "options": {
                  "name": "output2",
                  "subcomponent": "Drago__Boolean",
                  "type": "output",
                  "label": "false",
                  "enabled": true,
                  "process": true,
                  "multi": true
                },
                "subcomponent": "Drago__Boolean",
                "value": ""
              }
            },
            "id": "container2",
            "component": "Drago_Logic_If",
            "x": 440,
            "y": 420
          },
          "component": "Drago_Logic_If",
          "x": 440,
          "y": 420
        },
        "container3": {
          "rows": {
            "container3-row-1": {
              "type": "row",
              "id": "container3-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Distance",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container3-row-1": {
                "type": "row",
                "id": "container3-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Output",
                  "type": "output",
                  "label": "Distance",
                  "multi": true
                },
                "subcomponent": "Drago__Output",
                "value": ""
              }
            },
            "id": "container3",
            "component": "Drago_Life_DistanceToTask",
            "x": 180,
            "y": 480
          },
          "component": "Drago_Life_DistanceToTask",
          "x": 180,
          "y": 480
        },
        "container4": {
          "rows": {
            "container4-row-1": {
              "type": "row",
              "id": "container4-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Int",
                "type": "output",
                "multi": true
              },
              "subcomponent": "Drago__Int",
              "value": 68
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container4-row-1": {
                "type": "row",
                "id": "container4-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Int",
                  "type": "output",
                  "multi": true
                },
                "subcomponent": "Drago__Int",
                "value": 68
              }
            },
            "id": "container4",
            "component": "Drago_Datatype_Int",
            "x": 180,
            "y": 552
          },
          "component": "Drago_Datatype_Int",
          "x": 180,
          "y": 552
        },
        "container5": {
          "rows": {
            "container5-row-1": {
              "type": "row",
              "id": "container5-row-1",
              "options": {
                "type": "input",
                "label": "Execute",
                "subcomponent": "Drago__Start",
                "name": "container5"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container5-row-2": {
              "type": "row",
              "id": "container5-row-2",
              "options": {
                "name": "input2",
                "type": "input",
                "label": "Function"
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container5-row-1": {
                "type": "row",
                "id": "container5-row-1",
                "options": {
                  "type": "input",
                  "label": "Execute",
                  "subcomponent": "Drago__Start",
                  "name": "container5"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container5-row-2": {
                "type": "row",
                "id": "container5-row-2",
                "options": {
                  "name": "input2",
                  "type": "input",
                  "label": "Function"
                },
                "value": ""
              }
            },
            "id": "container5",
            "component": "Drago_Logic_Execute",
            "x": 710,
            "y": 252
          },
          "component": "Drago_Logic_Execute",
          "x": 710,
          "y": 252
        },
        "container7": {
          "rows": {
            "container7-row-1": {
              "type": "row",
              "id": "container7-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Show Inventory",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container7-row-1": {
                "type": "row",
                "id": "container7-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Output",
                  "type": "output",
                  "label": "Show Inventory",
                  "multi": true
                },
                "subcomponent": "Drago__Output",
                "value": ""
              }
            },
            "id": "container7",
            "component": "Drago_LifeTaskObj_ShowInventory",
            "x": 490,
            "y": 216
          },
          "component": "Drago_LifeTaskObj_ShowInventory",
          "x": 490,
          "y": 216
        },
        "container9": {
          "rows": {
            "container9-row-1": {
              "type": "row",
              "id": "container9-row-1",
              "options": {
                "type": "input",
                "label": "Execute",
                "subcomponent": "Drago__Start",
                "name": "container9"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container9-row-2": {
              "type": "row",
              "id": "container9-row-2",
              "options": {
                "name": "input2",
                "type": "input",
                "label": "Function"
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container9-row-1": {
                "type": "row",
                "id": "container9-row-1",
                "options": {
                  "type": "input",
                  "label": "Execute",
                  "subcomponent": "Drago__Start",
                  "name": "container9"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container9-row-2": {
                "type": "row",
                "id": "container9-row-2",
                "options": {
                  "name": "input2",
                  "type": "input",
                  "label": "Function"
                },
                "value": ""
              }
            },
            "id": "container9",
            "component": "Drago_Logic_Execute",
            "x": 700,
            "y": 360
          },
          "component": "Drago_Logic_Execute",
          "x": 700,
          "y": 360
        },
        "container11": {
          "rows": {
            "container11-row-1": {
              "type": "row",
              "id": "container11-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Reset Task",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container11-row-1": {
                "type": "row",
                "id": "container11-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Output",
                  "type": "output",
                  "label": "Reset Task",
                  "multi": true
                },
                "subcomponent": "Drago__Output",
                "value": ""
              }
            },
            "id": "container11",
            "component": "Drago_Life_ResetTask",
            "x": 460,
            "y": 348
          },
          "component": "Drago_Life_ResetTask",
          "x": 460,
          "y": 348
        },
        "container12": {
          "rows": {
            "container12-row-1": {
              "type": "row",
              "id": "container12-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container12"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container12-row-2": {
              "type": "row",
              "id": "container12-row-2",
              "options": {
                "name": "input1",
                "type": "variable",
                "label": "",
                "list": ["true", "false"],
                "subcomponent": "Drago__List"
              },
              "subcomponent": "Drago__List",
              "value": "false"
            },
            "container12-row-3": {
              "type": "row",
              "id": "container12-row-3",
              "options": {
                "name": "info1",
                "type": "info",
                "label": "OR INPUT:"
              },
              "value": ""
            },
            "container12-row-4": {
              "type": "row",
              "id": "container12-row-4",
              "options": {
                "name": "input2",
                "type": "input",
                "label": ""
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container12-row-1": {
                "type": "row",
                "id": "container12-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container12"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container12-row-2": {
                "type": "row",
                "id": "container12-row-2",
                "options": {
                  "name": "input1",
                  "type": "variable",
                  "label": "",
                  "list": ["true", "false"],
                  "subcomponent": "Drago__List"
                },
                "subcomponent": "Drago__List",
                "value": "false"
              },
              "container12-row-3": {
                "type": "row",
                "id": "container12-row-3",
                "options": {
                  "name": "info1",
                  "type": "info",
                  "label": "OR INPUT:"
                },
                "value": ""
              },
              "container12-row-4": {
                "type": "row",
                "id": "container12-row-4",
                "options": {
                  "name": "input2",
                  "type": "input",
                  "label": ""
                },
                "value": ""
              }
            },
            "id": "container12",
            "component": "Drago_Logic_End",
            "x": 690,
            "y": 540
          },
          "component": "Drago_Logic_End",
          "x": 690,
          "y": 540
        }
      }
    },
    "weightbp": {
      "links": {
        "link-container2-row-2-container20-row-1": {
          "id": "link-container2-row-2-container20-row-1",
          "inputContainerId": "container2",
          "outputContainerId": "container20",
          "inputRowId": "container2-row-2",
          "outputRowId": "container20-row-1"
        },
        "link-container22-row-1-container20-row-2": {
          "id": "link-container22-row-1-container20-row-2",
          "inputContainerId": "container22",
          "outputContainerId": "container20",
          "inputRowId": "container22-row-1",
          "outputRowId": "container20-row-2"
        },
        "link-container7-row-1-container20-row-4": {
          "id": "link-container7-row-1-container20-row-4",
          "inputContainerId": "container7",
          "outputContainerId": "container20",
          "inputRowId": "container7-row-1",
          "outputRowId": "container20-row-4"
        },
        "link-container11-row-1-container23-row-4": {
          "id": "link-container11-row-1-container23-row-4",
          "inputContainerId": "container11",
          "outputContainerId": "container23",
          "inputRowId": "container11-row-1",
          "outputRowId": "container23-row-4"
        },
        "link-container20-row-5-container23-row-1": {
          "id": "link-container20-row-5-container23-row-1",
          "inputContainerId": "container20",
          "outputContainerId": "container23",
          "inputRowId": "container20-row-5",
          "outputRowId": "container23-row-1"
        },
        "link-container15-row-1-container24-row-4": {
          "id": "link-container15-row-1-container24-row-4",
          "inputContainerId": "container15",
          "outputContainerId": "container24",
          "inputRowId": "container15-row-1",
          "outputRowId": "container24-row-4"
        },
        "link-container20-row-6-container24-row-1": {
          "id": "link-container20-row-6-container24-row-1",
          "inputContainerId": "container20",
          "outputContainerId": "container24",
          "inputRowId": "container20-row-6",
          "outputRowId": "container24-row-1"
        }
      },
      "lastContainerId": 25,
      "containers": {
        "container2": {
          "rows": {
            "container2-row-1": {
              "type": "row",
              "id": "container2-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Object",
                "value": "life",
                "type": "output",
                "label": "",
                "multi": true
              },
              "subcomponent": "Drago__Object",
              "value": "life"
            },
            "container2-row-2": {
              "type": "row",
              "id": "container2-row-2",
              "options": {
                "name": "output3",
                "subcomponent": "Drago__Label",
                "type": "output",
                "process": true,
                "label": "Execute",
                "multi": true
              },
              "subcomponent": "Drago__Label",
              "value": ""
            }
          },
          "type": "event",
          "options": {
            "rows": {
              "container2-row-1": {
                "type": "row",
                "id": "container2-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Object",
                  "value": "life",
                  "type": "output",
                  "label": "",
                  "multi": true
                },
                "subcomponent": "Drago__Object",
                "value": "life"
              },
              "container2-row-2": {
                "type": "row",
                "id": "container2-row-2",
                "options": {
                  "name": "output3",
                  "subcomponent": "Drago__Label",
                  "type": "output",
                  "process": true,
                  "label": "Execute",
                  "multi": true
                },
                "subcomponent": "Drago__Label",
                "value": ""
              }
            },
            "id": "container2",
            "component": "Drago_Abe_LifeEvent",
            "x": 240,
            "y": 252
          },
          "component": "Drago_Abe_LifeEvent",
          "x": 240,
          "y": 252
        },
        "container7": {
          "rows": {
            "container7-row-1": {
              "type": "row",
              "id": "container7-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__String",
                "type": "output",
                "label": "Hello",
                "multi": true
              },
              "subcomponent": "Drago__String",
              "value": "opencontainer"
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container7-row-1": {
                "type": "row",
                "id": "container7-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__String",
                  "type": "output",
                  "label": "Hello",
                  "multi": true
                },
                "subcomponent": "Drago__String",
                "value": "opencontainer"
              }
            },
            "id": "container7",
            "component": "Drago_Datatype_String",
            "x": 200,
            "y": 432
          },
          "component": "Drago_Datatype_String",
          "x": 200,
          "y": 432
        },
        "container11": {
          "rows": {
            "container11-row-1": {
              "type": "row",
              "id": "container11-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Int",
                "type": "output",
                "multi": true
              },
              "subcomponent": "Drago__Int",
              "value": 80
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container11-row-1": {
                "type": "row",
                "id": "container11-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Int",
                  "type": "output",
                  "multi": true
                },
                "subcomponent": "Drago__Int",
                "value": 80
              }
            },
            "id": "container11",
            "component": "Drago_Datatype_Int",
            "x": 520,
            "y": 552
          },
          "component": "Drago_Datatype_Int",
          "x": 520,
          "y": 552
        },
        "container15": {
          "rows": {
            "container15-row-1": {
              "type": "row",
              "id": "container15-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Int",
                "type": "output",
                "multi": true
              },
              "subcomponent": "Drago__Int",
              "value": 0
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container15-row-1": {
                "type": "row",
                "id": "container15-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Int",
                  "type": "output",
                  "multi": true
                },
                "subcomponent": "Drago__Int",
                "value": 0
              }
            },
            "id": "container15",
            "component": "Drago_Datatype_Int",
            "x": 510,
            "y": 696
          },
          "component": "Drago_Datatype_Int",
          "x": 510,
          "y": 696
        },
        "container20": {
          "rows": {
            "container20-row-1": {
              "type": "row",
              "id": "container20-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container20"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container20-row-2": {
              "type": "row",
              "id": "container20-row-2",
              "options": {
                "name": "input1",
                "type": "input",
                "label": "Var 1"
              },
              "value": ""
            },
            "container20-row-3": {
              "type": "row",
              "id": "container20-row-3",
              "options": {
                "name": "input2",
                "subcomponent": "Drago__List",
                "list": ["===", "==", "!=", "<", ">", "<=", ">="],
                "datatype": "string",
                "type": "variable",
                "process": true
              },
              "subcomponent": "Drago__List",
              "value": "==="
            },
            "container20-row-4": {
              "type": "row",
              "id": "container20-row-4",
              "options": {
                "name": "input3",
                "type": "input",
                "label": "Var 2"
              },
              "value": ""
            },
            "container20-row-5": {
              "type": "row",
              "id": "container20-row-5",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "true",
                "enabled": false,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            },
            "container20-row-6": {
              "type": "row",
              "id": "container20-row-6",
              "options": {
                "name": "output2",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "false",
                "enabled": true,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container20-row-1": {
                "type": "row",
                "id": "container20-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container20"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container20-row-2": {
                "type": "row",
                "id": "container20-row-2",
                "options": {
                  "name": "input1",
                  "type": "input",
                  "label": "Var 1"
                },
                "value": ""
              },
              "container20-row-3": {
                "type": "row",
                "id": "container20-row-3",
                "options": {
                  "name": "input2",
                  "subcomponent": "Drago__List",
                  "list": ["===", "==", "!=", "<", ">", "<=", ">="],
                  "datatype": "string",
                  "type": "variable",
                  "process": true
                },
                "subcomponent": "Drago__List",
                "value": "==="
              },
              "container20-row-4": {
                "type": "row",
                "id": "container20-row-4",
                "options": {
                  "name": "input3",
                  "type": "input",
                  "label": "Var 2"
                },
                "value": ""
              },
              "container20-row-5": {
                "type": "row",
                "id": "container20-row-5",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Boolean",
                  "type": "output",
                  "label": "true",
                  "enabled": false,
                  "process": true,
                  "multi": true
                },
                "subcomponent": "Drago__Boolean",
                "value": ""
              },
              "container20-row-6": {
                "type": "row",
                "id": "container20-row-6",
                "options": {
                  "name": "output2",
                  "subcomponent": "Drago__Boolean",
                  "type": "output",
                  "label": "false",
                  "enabled": true,
                  "process": true,
                  "multi": true
                },
                "subcomponent": "Drago__Boolean",
                "value": ""
              }
            },
            "id": "container20",
            "component": "Drago_Logic_If",
            "x": 490,
            "y": 300
          },
          "component": "Drago_Logic_If",
          "x": 490,
          "y": 300
        },
        "container22": {
          "rows": {
            "container22-row-1": {
              "type": "row",
              "id": "container22-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Task",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container22-row-1": {
                "type": "row",
                "id": "container22-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Output",
                  "type": "output",
                  "label": "Task",
                  "multi": true
                },
                "subcomponent": "Drago__Output",
                "value": ""
              }
            },
            "id": "container22",
            "component": "Drago_Life_GetTask",
            "x": 200,
            "y": 372
          },
          "component": "Drago_Life_GetTask",
          "x": 200,
          "y": 372
        },
        "container23": {
          "rows": {
            "container23-row-1": {
              "type": "row",
              "id": "container23-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container23"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container23-row-2": {
              "type": "row",
              "id": "container23-row-2",
              "options": {
                "name": "input1",
                "type": "variable",
                "label": "",
                "list": ["true", "false"],
                "subcomponent": "Drago__List"
              },
              "subcomponent": "Drago__List",
              "value": "true"
            },
            "container23-row-3": {
              "type": "row",
              "id": "container23-row-3",
              "options": {
                "name": "info1",
                "type": "info",
                "label": "OR INPUT:"
              },
              "value": ""
            },
            "container23-row-4": {
              "type": "row",
              "id": "container23-row-4",
              "options": {
                "name": "input2",
                "type": "input",
                "label": ""
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container23-row-1": {
                "type": "row",
                "id": "container23-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container23"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container23-row-2": {
                "type": "row",
                "id": "container23-row-2",
                "options": {
                  "name": "input1",
                  "type": "variable",
                  "label": "",
                  "list": ["true", "false"],
                  "subcomponent": "Drago__List"
                },
                "subcomponent": "Drago__List",
                "value": "true"
              },
              "container23-row-3": {
                "type": "row",
                "id": "container23-row-3",
                "options": {
                  "name": "info1",
                  "type": "info",
                  "label": "OR INPUT:"
                },
                "value": ""
              },
              "container23-row-4": {
                "type": "row",
                "id": "container23-row-4",
                "options": {
                  "name": "input2",
                  "type": "input",
                  "label": ""
                },
                "value": ""
              }
            },
            "id": "container23",
            "component": "Drago_Logic_End",
            "x": 720,
            "y": 468
          },
          "component": "Drago_Logic_End",
          "x": 720,
          "y": 468
        },
        "container24": {
          "rows": {
            "container24-row-1": {
              "type": "row",
              "id": "container24-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container24"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container24-row-2": {
              "type": "row",
              "id": "container24-row-2",
              "options": {
                "name": "input1",
                "type": "variable",
                "label": "",
                "list": ["true", "false"],
                "subcomponent": "Drago__List"
              },
              "subcomponent": "Drago__List",
              "value": "true"
            },
            "container24-row-3": {
              "type": "row",
              "id": "container24-row-3",
              "options": {
                "name": "info1",
                "type": "info",
                "label": "OR INPUT:"
              },
              "value": ""
            },
            "container24-row-4": {
              "type": "row",
              "id": "container24-row-4",
              "options": {
                "name": "input2",
                "type": "input",
                "label": ""
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container24-row-1": {
                "type": "row",
                "id": "container24-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container24"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container24-row-2": {
                "type": "row",
                "id": "container24-row-2",
                "options": {
                  "name": "input1",
                  "type": "variable",
                  "label": "",
                  "list": ["true", "false"],
                  "subcomponent": "Drago__List"
                },
                "subcomponent": "Drago__List",
                "value": "true"
              },
              "container24-row-3": {
                "type": "row",
                "id": "container24-row-3",
                "options": {
                  "name": "info1",
                  "type": "info",
                  "label": "OR INPUT:"
                },
                "value": ""
              },
              "container24-row-4": {
                "type": "row",
                "id": "container24-row-4",
                "options": {
                  "name": "input2",
                  "type": "input",
                  "label": ""
                },
                "value": ""
              }
            },
            "id": "container24",
            "component": "Drago_Logic_End",
            "x": 720,
            "y": 612
          },
          "component": "Drago_Logic_End",
          "x": 720,
          "y": 612
        }
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
    "startbp": {
      "links": {
        "link-container2-row-2-container3-row-1": {
          "id": "link-container2-row-2-container3-row-1",
          "inputContainerId": "container2",
          "outputContainerId": "container3",
          "inputRowId": "container2-row-2",
          "outputRowId": "container3-row-1"
        },
        "link-container7-row-1-container3-row-2": {
          "id": "link-container7-row-1-container3-row-2",
          "inputContainerId": "container7",
          "outputContainerId": "container3",
          "inputRowId": "container7-row-1",
          "outputRowId": "container3-row-2"
        }
      },
      "lastContainerId": 11,
      "containers": {
        "container2": {
          "rows": {
            "container2-row-1": {
              "type": "row",
              "id": "container2-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Object",
                "value": "life",
                "type": "output",
                "label": "",
                "multi": true
              },
              "subcomponent": "Drago__Object",
              "value": "life"
            },
            "container2-row-2": {
              "type": "row",
              "id": "container2-row-2",
              "options": {
                "name": "output3",
                "subcomponent": "Drago__Label",
                "type": "output",
                "process": true,
                "label": "Execute",
                "multi": true
              },
              "subcomponent": "Drago__Label",
              "value": ""
            }
          },
          "type": "event",
          "options": {
            "rows": {
              "container2-row-1": {
                "type": "row",
                "id": "container2-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Object",
                  "value": "life",
                  "type": "output",
                  "label": "",
                  "multi": true
                },
                "subcomponent": "Drago__Object",
                "value": "life"
              },
              "container2-row-2": {
                "type": "row",
                "id": "container2-row-2",
                "options": {
                  "name": "output3",
                  "subcomponent": "Drago__Label",
                  "type": "output",
                  "process": true,
                  "label": "Execute",
                  "multi": true
                },
                "subcomponent": "Drago__Label",
                "value": ""
              }
            },
            "id": "container2",
            "component": "Drago_Abe_LifeEvent",
            "x": 220,
            "y": 420
          },
          "component": "Drago_Abe_LifeEvent",
          "x": 220,
          "y": 420
        },
        "container3": {
          "rows": {
            "container3-row-1": {
              "type": "row",
              "id": "container3-row-1",
              "options": {
                "type": "input",
                "label": "Execute",
                "subcomponent": "Drago__Start",
                "name": "container3"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container3-row-2": {
              "type": "row",
              "id": "container3-row-2",
              "options": {
                "name": "input2",
                "type": "input",
                "label": "Function"
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container3-row-1": {
                "type": "row",
                "id": "container3-row-1",
                "options": {
                  "type": "input",
                  "label": "Execute",
                  "subcomponent": "Drago__Start",
                  "name": "container3"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container3-row-2": {
                "type": "row",
                "id": "container3-row-2",
                "options": {
                  "name": "input2",
                  "type": "input",
                  "label": "Function"
                },
                "value": ""
              }
            },
            "id": "container3",
            "component": "Drago_Logic_Execute",
            "x": 510,
            "y": 444
          },
          "component": "Drago_Logic_Execute",
          "x": 510,
          "y": 444
        },
        "container7": {
          "rows": {
            "container7-row-1": {
              "type": "row",
              "id": "container7-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Task",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container7-row-1": {
                "type": "row",
                "id": "container7-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Output",
                  "type": "output",
                  "label": "Task",
                  "multi": true
                },
                "subcomponent": "Drago__Output",
                "value": ""
              }
            },
            "id": "container7",
            "component": "Drago_Life_StartCurrentTask",
            "x": 220,
            "y": 516
          },
          "component": "Drago_Life_StartCurrentTask",
          "x": 220,
          "y": 516
        }
      }
    },
    "weightbp": {
      "links": {
        "link-container2-row-2-container20-row-1": {
          "id": "link-container2-row-2-container20-row-1",
          "inputContainerId": "container2",
          "outputContainerId": "container20",
          "inputRowId": "container2-row-2",
          "outputRowId": "container20-row-1"
        },
        "link-container22-row-1-container20-row-2": {
          "id": "link-container22-row-1-container20-row-2",
          "inputContainerId": "container22",
          "outputContainerId": "container20",
          "inputRowId": "container22-row-1",
          "outputRowId": "container20-row-2"
        },
        "link-container7-row-1-container20-row-4": {
          "id": "link-container7-row-1-container20-row-4",
          "inputContainerId": "container7",
          "outputContainerId": "container20",
          "inputRowId": "container7-row-1",
          "outputRowId": "container20-row-4"
        },
        "link-container11-row-1-container23-row-4": {
          "id": "link-container11-row-1-container23-row-4",
          "inputContainerId": "container11",
          "outputContainerId": "container23",
          "inputRowId": "container11-row-1",
          "outputRowId": "container23-row-4"
        },
        "link-container20-row-5-container23-row-1": {
          "id": "link-container20-row-5-container23-row-1",
          "inputContainerId": "container20",
          "outputContainerId": "container23",
          "inputRowId": "container20-row-5",
          "outputRowId": "container23-row-1"
        },
        "link-container15-row-1-container24-row-4": {
          "id": "link-container15-row-1-container24-row-4",
          "inputContainerId": "container15",
          "outputContainerId": "container24",
          "inputRowId": "container15-row-1",
          "outputRowId": "container24-row-4"
        },
        "link-container20-row-6-container24-row-1": {
          "id": "link-container20-row-6-container24-row-1",
          "inputContainerId": "container20",
          "outputContainerId": "container24",
          "inputRowId": "container20-row-6",
          "outputRowId": "container24-row-1"
        }
      },
      "lastContainerId": 25,
      "containers": {
        "container2": {
          "rows": {
            "container2-row-1": {
              "type": "row",
              "id": "container2-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Object",
                "value": "life",
                "type": "output",
                "label": "",
                "multi": true
              },
              "subcomponent": "Drago__Object",
              "value": "life"
            },
            "container2-row-2": {
              "type": "row",
              "id": "container2-row-2",
              "options": {
                "name": "output3",
                "subcomponent": "Drago__Label",
                "type": "output",
                "process": true,
                "label": "Execute",
                "multi": true
              },
              "subcomponent": "Drago__Label",
              "value": ""
            }
          },
          "type": "event",
          "options": {
            "rows": {
              "container2-row-1": {
                "type": "row",
                "id": "container2-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Object",
                  "value": "life",
                  "type": "output",
                  "label": "",
                  "multi": true
                },
                "subcomponent": "Drago__Object",
                "value": "life"
              },
              "container2-row-2": {
                "type": "row",
                "id": "container2-row-2",
                "options": {
                  "name": "output3",
                  "subcomponent": "Drago__Label",
                  "type": "output",
                  "process": true,
                  "label": "Execute",
                  "multi": true
                },
                "subcomponent": "Drago__Label",
                "value": ""
              }
            },
            "id": "container2",
            "component": "Drago_Abe_LifeEvent",
            "x": 240,
            "y": 252
          },
          "component": "Drago_Abe_LifeEvent",
          "x": 240,
          "y": 252
        },
        "container7": {
          "rows": {
            "container7-row-1": {
              "type": "row",
              "id": "container7-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__String",
                "type": "output",
                "label": "Hello",
                "multi": true
              },
              "subcomponent": "Drago__String",
              "value": "opencontainer"
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container7-row-1": {
                "type": "row",
                "id": "container7-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__String",
                  "type": "output",
                  "label": "Hello",
                  "multi": true
                },
                "subcomponent": "Drago__String",
                "value": "opencontainer"
              }
            },
            "id": "container7",
            "component": "Drago_Datatype_String",
            "x": 200,
            "y": 432
          },
          "component": "Drago_Datatype_String",
          "x": 200,
          "y": 432
        },
        "container11": {
          "rows": {
            "container11-row-1": {
              "type": "row",
              "id": "container11-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Int",
                "type": "output",
                "multi": true
              },
              "subcomponent": "Drago__Int",
              "value": 80
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container11-row-1": {
                "type": "row",
                "id": "container11-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Int",
                  "type": "output",
                  "multi": true
                },
                "subcomponent": "Drago__Int",
                "value": 80
              }
            },
            "id": "container11",
            "component": "Drago_Datatype_Int",
            "x": 520,
            "y": 552
          },
          "component": "Drago_Datatype_Int",
          "x": 520,
          "y": 552
        },
        "container15": {
          "rows": {
            "container15-row-1": {
              "type": "row",
              "id": "container15-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Int",
                "type": "output",
                "multi": true
              },
              "subcomponent": "Drago__Int",
              "value": 0
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container15-row-1": {
                "type": "row",
                "id": "container15-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Int",
                  "type": "output",
                  "multi": true
                },
                "subcomponent": "Drago__Int",
                "value": 0
              }
            },
            "id": "container15",
            "component": "Drago_Datatype_Int",
            "x": 510,
            "y": 696
          },
          "component": "Drago_Datatype_Int",
          "x": 510,
          "y": 696
        },
        "container20": {
          "rows": {
            "container20-row-1": {
              "type": "row",
              "id": "container20-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container20"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container20-row-2": {
              "type": "row",
              "id": "container20-row-2",
              "options": {
                "name": "input1",
                "type": "input",
                "label": "Var 1"
              },
              "value": ""
            },
            "container20-row-3": {
              "type": "row",
              "id": "container20-row-3",
              "options": {
                "name": "input2",
                "subcomponent": "Drago__List",
                "list": ["===", "==", "!=", "<", ">", "<=", ">="],
                "datatype": "string",
                "type": "variable",
                "process": true
              },
              "subcomponent": "Drago__List",
              "value": "==="
            },
            "container20-row-4": {
              "type": "row",
              "id": "container20-row-4",
              "options": {
                "name": "input3",
                "type": "input",
                "label": "Var 2"
              },
              "value": ""
            },
            "container20-row-5": {
              "type": "row",
              "id": "container20-row-5",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "true",
                "enabled": false,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            },
            "container20-row-6": {
              "type": "row",
              "id": "container20-row-6",
              "options": {
                "name": "output2",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "false",
                "enabled": true,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container20-row-1": {
                "type": "row",
                "id": "container20-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container20"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container20-row-2": {
                "type": "row",
                "id": "container20-row-2",
                "options": {
                  "name": "input1",
                  "type": "input",
                  "label": "Var 1"
                },
                "value": ""
              },
              "container20-row-3": {
                "type": "row",
                "id": "container20-row-3",
                "options": {
                  "name": "input2",
                  "subcomponent": "Drago__List",
                  "list": ["===", "==", "!=", "<", ">", "<=", ">="],
                  "datatype": "string",
                  "type": "variable",
                  "process": true
                },
                "subcomponent": "Drago__List",
                "value": "==="
              },
              "container20-row-4": {
                "type": "row",
                "id": "container20-row-4",
                "options": {
                  "name": "input3",
                  "type": "input",
                  "label": "Var 2"
                },
                "value": ""
              },
              "container20-row-5": {
                "type": "row",
                "id": "container20-row-5",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Boolean",
                  "type": "output",
                  "label": "true",
                  "enabled": false,
                  "process": true,
                  "multi": true
                },
                "subcomponent": "Drago__Boolean",
                "value": ""
              },
              "container20-row-6": {
                "type": "row",
                "id": "container20-row-6",
                "options": {
                  "name": "output2",
                  "subcomponent": "Drago__Boolean",
                  "type": "output",
                  "label": "false",
                  "enabled": true,
                  "process": true,
                  "multi": true
                },
                "subcomponent": "Drago__Boolean",
                "value": ""
              }
            },
            "id": "container20",
            "component": "Drago_Logic_If",
            "x": 490,
            "y": 300
          },
          "component": "Drago_Logic_If",
          "x": 490,
          "y": 300
        },
        "container22": {
          "rows": {
            "container22-row-1": {
              "type": "row",
              "id": "container22-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Task",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container22-row-1": {
                "type": "row",
                "id": "container22-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Output",
                  "type": "output",
                  "label": "Task",
                  "multi": true
                },
                "subcomponent": "Drago__Output",
                "value": ""
              }
            },
            "id": "container22",
            "component": "Drago_Life_GetTask",
            "x": 200,
            "y": 372
          },
          "component": "Drago_Life_GetTask",
          "x": 200,
          "y": 372
        },
        "container23": {
          "rows": {
            "container23-row-1": {
              "type": "row",
              "id": "container23-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container23"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container23-row-2": {
              "type": "row",
              "id": "container23-row-2",
              "options": {
                "name": "input1",
                "type": "variable",
                "label": "",
                "list": ["true", "false"],
                "subcomponent": "Drago__List"
              },
              "subcomponent": "Drago__List",
              "value": "true"
            },
            "container23-row-3": {
              "type": "row",
              "id": "container23-row-3",
              "options": {
                "name": "info1",
                "type": "info",
                "label": "OR INPUT:"
              },
              "value": ""
            },
            "container23-row-4": {
              "type": "row",
              "id": "container23-row-4",
              "options": {
                "name": "input2",
                "type": "input",
                "label": ""
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container23-row-1": {
                "type": "row",
                "id": "container23-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container23"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container23-row-2": {
                "type": "row",
                "id": "container23-row-2",
                "options": {
                  "name": "input1",
                  "type": "variable",
                  "label": "",
                  "list": ["true", "false"],
                  "subcomponent": "Drago__List"
                },
                "subcomponent": "Drago__List",
                "value": "true"
              },
              "container23-row-3": {
                "type": "row",
                "id": "container23-row-3",
                "options": {
                  "name": "info1",
                  "type": "info",
                  "label": "OR INPUT:"
                },
                "value": ""
              },
              "container23-row-4": {
                "type": "row",
                "id": "container23-row-4",
                "options": {
                  "name": "input2",
                  "type": "input",
                  "label": ""
                },
                "value": ""
              }
            },
            "id": "container23",
            "component": "Drago_Logic_End",
            "x": 720,
            "y": 468
          },
          "component": "Drago_Logic_End",
          "x": 720,
          "y": 468
        },
        "container24": {
          "rows": {
            "container24-row-1": {
              "type": "row",
              "id": "container24-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container24"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container24-row-2": {
              "type": "row",
              "id": "container24-row-2",
              "options": {
                "name": "input1",
                "type": "variable",
                "label": "",
                "list": ["true", "false"],
                "subcomponent": "Drago__List"
              },
              "subcomponent": "Drago__List",
              "value": "true"
            },
            "container24-row-3": {
              "type": "row",
              "id": "container24-row-3",
              "options": {
                "name": "info1",
                "type": "info",
                "label": "OR INPUT:"
              },
              "value": ""
            },
            "container24-row-4": {
              "type": "row",
              "id": "container24-row-4",
              "options": {
                "name": "input2",
                "type": "input",
                "label": ""
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container24-row-1": {
                "type": "row",
                "id": "container24-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container24"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container24-row-2": {
                "type": "row",
                "id": "container24-row-2",
                "options": {
                  "name": "input1",
                  "type": "variable",
                  "label": "",
                  "list": ["true", "false"],
                  "subcomponent": "Drago__List"
                },
                "subcomponent": "Drago__List",
                "value": "true"
              },
              "container24-row-3": {
                "type": "row",
                "id": "container24-row-3",
                "options": {
                  "name": "info1",
                  "type": "info",
                  "label": "OR INPUT:"
                },
                "value": ""
              },
              "container24-row-4": {
                "type": "row",
                "id": "container24-row-4",
                "options": {
                  "name": "input2",
                  "type": "input",
                  "label": ""
                },
                "value": ""
              }
            },
            "id": "container24",
            "component": "Drago_Logic_End",
            "x": 720,
            "y": 612
          },
          "component": "Drago_Logic_End",
          "x": 720,
          "y": 612
        }
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
      if (life.data.isPlayer) {
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
  _AISTATES.aistate_find_enemies = {
    "weight": function (life) {
      if (life.data.isPlayer && life.data.command !== 'defend') {
        return 0;
      }
      let target = life.scanningLife;
      if (!target) {
        return 0;
      }
      if (!life.sees[target.id]) {
        return 0;
      }
      if (life.data.targetId === target.id) {
        return 0;
      }
      if (life.id == target.id) {
        return 0;
      }
      if (target.codename !== 'life') {
        return 0;
      }
      if (target.data.dead) {
        return 0;
      }
      if (life.dist(target) > 20 * 64) {
        return 0;
      }
      if (!game.factions.enemies(life, target)) {
        return 0;
      }
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
      if (distDifference > DISTANCE_CHANGE && life.isHigherThreat(target)) {
        return life.setTarget(target);
      }
      const pirahnas = game.rng(0, 1);
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
      return false;
    },
    "weight": function (life) {
      if (life.hasJobCooldown()) return 0;
      if (`jobs` === life.getCommand()) {
        if (life.hasJob() === false) {
          life.log("Has job");
          return 50;
        }
      }
      return 0;
    },
    "startbp": {
      "links": {
        "link-container2-row-1-container4-row-4": {
          "id": "link-container2-row-1-container4-row-4",
          "inputContainerId": "container2",
          "outputContainerId": "container4",
          "inputRowId": "container2-row-1",
          "outputRowId": "container4-row-4"
        },
        "link-container1-row-2-container4-row-1": {
          "id": "link-container1-row-2-container4-row-1",
          "inputContainerId": "container1",
          "outputContainerId": "container4",
          "inputRowId": "container1-row-2",
          "outputRowId": "container4-row-1"
        }
      },
      "lastContainerId": 5,
      "containers": {
        "container1": {
          "rows": {
            "container1-row-1": {
              "type": "row",
              "id": "container1-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Object",
                "value": "life",
                "type": "output",
                "label": "",
                "multi": true
              },
              "subcomponent": "Drago__Object",
              "value": "life"
            },
            "container1-row-2": {
              "type": "row",
              "id": "container1-row-2",
              "options": {
                "name": "output3",
                "subcomponent": "Drago__Label",
                "type": "output",
                "process": true,
                "label": "Execute",
                "multi": true
              },
              "subcomponent": "Drago__Label",
              "value": ""
            }
          },
          "type": "event",
          "options": {
            "rows": {
              "container1-row-1": {
                "type": "row",
                "id": "container1-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Object",
                  "value": "life",
                  "type": "output",
                  "label": "",
                  "multi": true
                },
                "subcomponent": "Drago__Object",
                "value": "life"
              },
              "container1-row-2": {
                "type": "row",
                "id": "container1-row-2",
                "options": {
                  "name": "output3",
                  "subcomponent": "Drago__Label",
                  "type": "output",
                  "process": true,
                  "label": "Execute",
                  "multi": true
                },
                "subcomponent": "Drago__Label",
                "value": ""
              }
            },
            "id": "container1",
            "component": "Drago_Abe_LifeEvent",
            "x": 280,
            "y": 216
          },
          "component": "Drago_Abe_LifeEvent",
          "x": 280,
          "y": 216
        },
        "container2": {
          "rows": {
            "container2-row-1": {
              "type": "row",
              "id": "container2-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Get Jobs",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container2-row-1": {
                "type": "row",
                "id": "container2-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Output",
                  "type": "output",
                  "label": "Get Jobs",
                  "multi": true
                },
                "subcomponent": "Drago__Output",
                "value": ""
              }
            },
            "id": "container2",
            "component": "Drago_Life_GetJobs",
            "x": 280,
            "y": 324
          },
          "component": "Drago_Life_GetJobs",
          "x": 280,
          "y": 324
        },
        "container4": {
          "rows": {
            "container4-row-1": {
              "type": "row",
              "id": "container4-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container4"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container4-row-2": {
              "type": "row",
              "id": "container4-row-2",
              "options": {
                "name": "input1",
                "type": "variable",
                "label": "",
                "list": ["true", "false"],
                "subcomponent": "Drago__List"
              },
              "subcomponent": "Drago__List",
              "value": "true"
            },
            "container4-row-3": {
              "type": "row",
              "id": "container4-row-3",
              "options": {
                "name": "info1",
                "type": "info",
                "label": "OR INPUT:"
              },
              "value": ""
            },
            "container4-row-4": {
              "type": "row",
              "id": "container4-row-4",
              "options": {
                "name": "input2",
                "type": "input",
                "label": ""
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "component": "Drago_Logic_End",
            "x": 100,
            "y": 698
          },
          "component": "Drago_Logic_End",
          "x": 540,
          "y": 264
        }
      }
    },
    "runbp": {
      "links": {
        "link-container1-row-2-container2-row-1": {
          "id": "link-container1-row-2-container2-row-1",
          "inputContainerId": "container1",
          "outputContainerId": "container2",
          "inputRowId": "container1-row-2",
          "outputRowId": "container2-row-1"
        }
      },
      "lastContainerId": 3,
      "containers": {
        "container1": {
          "rows": {
            "container1-row-1": {
              "type": "row",
              "id": "container1-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Object",
                "value": "life",
                "type": "output",
                "label": "",
                "multi": true
              },
              "subcomponent": "Drago__Object",
              "value": "life"
            },
            "container1-row-2": {
              "type": "row",
              "id": "container1-row-2",
              "options": {
                "name": "output3",
                "subcomponent": "Drago__Label",
                "type": "output",
                "process": true,
                "label": "Execute",
                "multi": true
              },
              "subcomponent": "Drago__Label",
              "value": ""
            }
          },
          "type": "event",
          "options": {
            "component": "Drago_Abe_LifeEvent",
            "x": 100,
            "y": 698
          },
          "component": "Drago_Abe_LifeEvent",
          "x": 320,
          "y": 384
        },
        "container2": {
          "rows": {
            "container2-row-1": {
              "type": "row",
              "id": "container2-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container2"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container2-row-2": {
              "type": "row",
              "id": "container2-row-2",
              "options": {
                "name": "input1",
                "type": "variable",
                "label": "",
                "list": ["true", "false"],
                "subcomponent": "Drago__List"
              },
              "subcomponent": "Drago__List",
              "value": "false"
            },
            "container2-row-3": {
              "type": "row",
              "id": "container2-row-3",
              "options": {
                "name": "info1",
                "type": "info",
                "label": "OR INPUT:"
              },
              "value": ""
            },
            "container2-row-4": {
              "type": "row",
              "id": "container2-row-4",
              "options": {
                "name": "input2",
                "type": "input",
                "label": ""
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "component": "Drago_Logic_End",
            "x": 100,
            "y": 698
          },
          "component": "Drago_Logic_End",
          "x": 570,
          "y": 432
        }
      }
    },
    "weightbp": {
      "links": {
        "link-container16-row-1-container17-row-4": {
          "id": "link-container16-row-1-container17-row-4",
          "inputContainerId": "container16",
          "outputContainerId": "container17",
          "inputRowId": "container16-row-1",
          "outputRowId": "container17-row-4"
        },
        "link-container18-row-1-container17-row-2": {
          "id": "link-container18-row-1-container17-row-2",
          "inputContainerId": "container18",
          "outputContainerId": "container17",
          "inputRowId": "container18-row-1",
          "outputRowId": "container17-row-2"
        },
        "link-container1-row-2-container17-row-1": {
          "id": "link-container1-row-2-container17-row-1",
          "inputContainerId": "container1",
          "outputContainerId": "container17",
          "inputRowId": "container1-row-2",
          "outputRowId": "container17-row-1"
        },
        "link-container19-row-1-container20-row-2": {
          "id": "link-container19-row-1-container20-row-2",
          "inputContainerId": "container19",
          "outputContainerId": "container20",
          "inputRowId": "container19-row-1",
          "outputRowId": "container20-row-2"
        },
        "link-container21-row-1-container20-row-4": {
          "id": "link-container21-row-1-container20-row-4",
          "inputContainerId": "container21",
          "outputContainerId": "container20",
          "inputRowId": "container21-row-1",
          "outputRowId": "container20-row-4"
        },
        "link-container17-row-5-container20-row-1": {
          "id": "link-container17-row-5-container20-row-1",
          "inputContainerId": "container17",
          "outputContainerId": "container20",
          "inputRowId": "container17-row-5",
          "outputRowId": "container20-row-1"
        },
        "link-container23-row-1-container22-row-4": {
          "id": "link-container23-row-1-container22-row-4",
          "inputContainerId": "container23",
          "outputContainerId": "container22",
          "inputRowId": "container23-row-1",
          "outputRowId": "container22-row-4"
        },
        "link-container1-row-2-container22-row-1": {
          "id": "link-container1-row-2-container22-row-1",
          "inputContainerId": "container1",
          "outputContainerId": "container22",
          "inputRowId": "container1-row-2",
          "outputRowId": "container22-row-1"
        },
        "link-container24-row-1-container25-row-4": {
          "id": "link-container24-row-1-container25-row-4",
          "inputContainerId": "container24",
          "outputContainerId": "container25",
          "inputRowId": "container24-row-1",
          "outputRowId": "container25-row-4"
        },
        "link-container26-row-2-container28-row-2": {
          "id": "link-container26-row-2-container28-row-2",
          "inputContainerId": "container26",
          "outputContainerId": "container28",
          "inputRowId": "container26-row-2",
          "outputRowId": "container28-row-2"
        },
        "link-container27-row-1-container26-row-1": {
          "id": "link-container27-row-1-container26-row-1",
          "inputContainerId": "container27",
          "outputContainerId": "container26",
          "inputRowId": "container27-row-1",
          "outputRowId": "container26-row-1"
        },
        "link-container20-row-5-container28-row-1": {
          "id": "link-container20-row-5-container28-row-1",
          "inputContainerId": "container20",
          "outputContainerId": "container28",
          "inputRowId": "container20-row-5",
          "outputRowId": "container28-row-1"
        },
        "link-container20-row-5-container25-row-1": {
          "id": "link-container20-row-5-container25-row-1",
          "inputContainerId": "container20",
          "outputContainerId": "container25",
          "inputRowId": "container20-row-5",
          "outputRowId": "container25-row-1"
        }
      },
      "lastContainerId": 29,
      "containers": {
        "container1": {
          "rows": {
            "container1-row-1": {
              "type": "row",
              "id": "container1-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Object",
                "value": "life",
                "type": "output",
                "label": "",
                "multi": true
              },
              "subcomponent": "Drago__Object",
              "value": "life"
            },
            "container1-row-2": {
              "type": "row",
              "id": "container1-row-2",
              "options": {
                "name": "output3",
                "subcomponent": "Drago__Label",
                "type": "output",
                "process": true,
                "label": "Execute",
                "multi": true
              },
              "subcomponent": "Drago__Label",
              "value": ""
            }
          },
          "type": "event",
          "options": {
            "rows": {
              "container1-row-1": {
                "type": "row",
                "id": "container1-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Object",
                  "value": "life",
                  "type": "output",
                  "label": "",
                  "multi": true
                },
                "subcomponent": "Drago__Object",
                "value": "life"
              },
              "container1-row-2": {
                "type": "row",
                "id": "container1-row-2",
                "options": {
                  "name": "output3",
                  "subcomponent": "Drago__Label",
                  "type": "output",
                  "process": true,
                  "label": "Execute",
                  "multi": true
                },
                "subcomponent": "Drago__Label",
                "value": ""
              }
            },
            "id": "container1",
            "component": "Drago_Abe_LifeEvent",
            "x": 220,
            "y": 288
          },
          "component": "Drago_Abe_LifeEvent",
          "x": 220,
          "y": 288
        },
        "container16": {
          "rows": {
            "container16-row-1": {
              "type": "row",
              "id": "container16-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Command",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container16-row-1": {
                "type": "row",
                "id": "container16-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Output",
                  "type": "output",
                  "label": "Command",
                  "multi": true
                },
                "subcomponent": "Drago__Output",
                "value": ""
              }
            },
            "id": "container16",
            "component": "Drago_Life_GetCommand",
            "x": 210,
            "y": 432
          },
          "component": "Drago_Life_GetCommand",
          "x": 210,
          "y": 432
        },
        "container17": {
          "rows": {
            "container17-row-1": {
              "type": "row",
              "id": "container17-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container17"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container17-row-2": {
              "type": "row",
              "id": "container17-row-2",
              "options": {
                "name": "input1",
                "type": "input",
                "label": "Var 1"
              },
              "value": ""
            },
            "container17-row-3": {
              "type": "row",
              "id": "container17-row-3",
              "options": {
                "name": "input2",
                "subcomponent": "Drago__List",
                "list": ["===", "==", "!=", "<", ">", "<=", ">="],
                "datatype": "string",
                "type": "variable",
                "process": true
              },
              "subcomponent": "Drago__List",
              "value": "==="
            },
            "container17-row-4": {
              "type": "row",
              "id": "container17-row-4",
              "options": {
                "name": "input3",
                "type": "input",
                "label": "Var 2"
              },
              "value": ""
            },
            "container17-row-5": {
              "type": "row",
              "id": "container17-row-5",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "true",
                "enabled": false,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            },
            "container17-row-6": {
              "type": "row",
              "id": "container17-row-6",
              "options": {
                "name": "output2",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "false",
                "enabled": true,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container17-row-1": {
                "type": "row",
                "id": "container17-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container17"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container17-row-2": {
                "type": "row",
                "id": "container17-row-2",
                "options": {
                  "name": "input1",
                  "type": "input",
                  "label": "Var 1"
                },
                "value": ""
              },
              "container17-row-3": {
                "type": "row",
                "id": "container17-row-3",
                "options": {
                  "name": "input2",
                  "subcomponent": "Drago__List",
                  "list": ["===", "==", "!=", "<", ">", "<=", ">="],
                  "datatype": "string",
                  "type": "variable",
                  "process": true
                },
                "subcomponent": "Drago__List",
                "value": "==="
              },
              "container17-row-4": {
                "type": "row",
                "id": "container17-row-4",
                "options": {
                  "name": "input3",
                  "type": "input",
                  "label": "Var 2"
                },
                "value": ""
              },
              "container17-row-5": {
                "type": "row",
                "id": "container17-row-5",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Boolean",
                  "type": "output",
                  "label": "true",
                  "enabled": false,
                  "process": true,
                  "multi": true
                },
                "subcomponent": "Drago__Boolean",
                "value": ""
              },
              "container17-row-6": {
                "type": "row",
                "id": "container17-row-6",
                "options": {
                  "name": "output2",
                  "subcomponent": "Drago__Boolean",
                  "type": "output",
                  "label": "false",
                  "enabled": true,
                  "process": true,
                  "multi": true
                },
                "subcomponent": "Drago__Boolean",
                "value": ""
              }
            },
            "id": "container17",
            "component": "Drago_Logic_If",
            "x": 520,
            "y": 348
          },
          "component": "Drago_Logic_If",
          "x": 520,
          "y": 348
        },
        "container18": {
          "rows": {
            "container18-row-1": {
              "type": "row",
              "id": "container18-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__String",
                "type": "output",
                "label": "Hello",
                "multi": true
              },
              "subcomponent": "Drago__String",
              "value": "jobs"
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container18-row-1": {
                "type": "row",
                "id": "container18-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__String",
                  "type": "output",
                  "label": "Hello",
                  "multi": true
                },
                "subcomponent": "Drago__String",
                "value": "jobs"
              }
            },
            "id": "container18",
            "component": "Drago_Datatype_String",
            "x": 220,
            "y": 372
          },
          "component": "Drago_Datatype_String",
          "x": 220,
          "y": 372
        },
        "container19": {
          "rows": {
            "container19-row-1": {
              "type": "row",
              "id": "container19-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Has Job",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container19-row-1": {
                "type": "row",
                "id": "container19-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Output",
                  "type": "output",
                  "label": "Has Job",
                  "multi": true
                },
                "subcomponent": "Drago__Output",
                "value": ""
              }
            },
            "id": "container19",
            "component": "Drago_Life_HasJob",
            "x": 480,
            "y": 528
          },
          "component": "Drago_Life_HasJob",
          "x": 480,
          "y": 528
        },
        "container20": {
          "rows": {
            "container20-row-1": {
              "type": "row",
              "id": "container20-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container20"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container20-row-2": {
              "type": "row",
              "id": "container20-row-2",
              "options": {
                "name": "input1",
                "type": "input",
                "label": "Var 1"
              },
              "value": ""
            },
            "container20-row-3": {
              "type": "row",
              "id": "container20-row-3",
              "options": {
                "name": "input2",
                "subcomponent": "Drago__List",
                "list": ["===", "==", "!=", "<", ">", "<=", ">="],
                "datatype": "string",
                "type": "variable",
                "process": true
              },
              "subcomponent": "Drago__List",
              "value": "==="
            },
            "container20-row-4": {
              "type": "row",
              "id": "container20-row-4",
              "options": {
                "name": "input3",
                "type": "input",
                "label": "Var 2"
              },
              "value": ""
            },
            "container20-row-5": {
              "type": "row",
              "id": "container20-row-5",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "true",
                "enabled": false,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            },
            "container20-row-6": {
              "type": "row",
              "id": "container20-row-6",
              "options": {
                "name": "output2",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "false",
                "enabled": true,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container20-row-1": {
                "type": "row",
                "id": "container20-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container20"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container20-row-2": {
                "type": "row",
                "id": "container20-row-2",
                "options": {
                  "name": "input1",
                  "type": "input",
                  "label": "Var 1"
                },
                "value": ""
              },
              "container20-row-3": {
                "type": "row",
                "id": "container20-row-3",
                "options": {
                  "name": "input2",
                  "subcomponent": "Drago__List",
                  "list": ["===", "==", "!=", "<", ">", "<=", ">="],
                  "datatype": "string",
                  "type": "variable",
                  "process": true
                },
                "subcomponent": "Drago__List",
                "value": "==="
              },
              "container20-row-4": {
                "type": "row",
                "id": "container20-row-4",
                "options": {
                  "name": "input3",
                  "type": "input",
                  "label": "Var 2"
                },
                "value": ""
              },
              "container20-row-5": {
                "type": "row",
                "id": "container20-row-5",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Boolean",
                  "type": "output",
                  "label": "true",
                  "enabled": false,
                  "process": true,
                  "multi": true
                },
                "subcomponent": "Drago__Boolean",
                "value": ""
              },
              "container20-row-6": {
                "type": "row",
                "id": "container20-row-6",
                "options": {
                  "name": "output2",
                  "subcomponent": "Drago__Boolean",
                  "type": "output",
                  "label": "false",
                  "enabled": true,
                  "process": true,
                  "multi": true
                },
                "subcomponent": "Drago__Boolean",
                "value": ""
              }
            },
            "id": "container20",
            "component": "Drago_Logic_If",
            "x": 780,
            "y": 528
          },
          "component": "Drago_Logic_If",
          "x": 780,
          "y": 528
        },
        "container21": {
          "rows": {
            "container21-row-1": {
              "type": "row",
              "id": "container21-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "False",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container21-row-1": {
                "type": "row",
                "id": "container21-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Output",
                  "type": "output",
                  "label": "False",
                  "multi": true
                },
                "subcomponent": "Drago__Output",
                "value": ""
              }
            },
            "id": "container21",
            "component": "Drago_Datatype_False",
            "x": 470,
            "y": 588
          },
          "component": "Drago_Datatype_False",
          "x": 470,
          "y": 588
        },
        "container22": {
          "rows": {
            "container22-row-1": {
              "type": "row",
              "id": "container22-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container22"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container22-row-2": {
              "type": "row",
              "id": "container22-row-2",
              "options": {
                "name": "input1",
                "type": "variable",
                "label": "",
                "list": ["true", "false"],
                "subcomponent": "Drago__List"
              },
              "subcomponent": "Drago__List",
              "value": "true"
            },
            "container22-row-3": {
              "type": "row",
              "id": "container22-row-3",
              "options": {
                "name": "info1",
                "type": "info",
                "label": "OR INPUT:"
              },
              "value": ""
            },
            "container22-row-4": {
              "type": "row",
              "id": "container22-row-4",
              "options": {
                "name": "input2",
                "type": "input",
                "label": ""
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container22-row-1": {
                "type": "row",
                "id": "container22-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container22"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container22-row-2": {
                "type": "row",
                "id": "container22-row-2",
                "options": {
                  "name": "input1",
                  "type": "variable",
                  "label": "",
                  "list": ["true", "false"],
                  "subcomponent": "Drago__List"
                },
                "subcomponent": "Drago__List",
                "value": "true"
              },
              "container22-row-3": {
                "type": "row",
                "id": "container22-row-3",
                "options": {
                  "name": "info1",
                  "type": "info",
                  "label": "OR INPUT:"
                },
                "value": ""
              },
              "container22-row-4": {
                "type": "row",
                "id": "container22-row-4",
                "options": {
                  "name": "input2",
                  "type": "input",
                  "label": ""
                },
                "value": ""
              }
            },
            "id": "container22",
            "component": "Drago_Logic_End",
            "x": 490,
            "y": 672
          },
          "component": "Drago_Logic_End",
          "x": 490,
          "y": 672
        },
        "container23": {
          "rows": {
            "container23-row-1": {
              "type": "row",
              "id": "container23-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Int",
                "type": "output",
                "multi": true
              },
              "subcomponent": "Drago__Int",
              "value": 0
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container23-row-1": {
                "type": "row",
                "id": "container23-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Int",
                  "type": "output",
                  "multi": true
                },
                "subcomponent": "Drago__Int",
                "value": 0
              }
            },
            "id": "container23",
            "component": "Drago_Datatype_Int",
            "x": 230,
            "y": 720
          },
          "component": "Drago_Datatype_Int",
          "x": 230,
          "y": 720
        },
        "container24": {
          "rows": {
            "container24-row-1": {
              "type": "row",
              "id": "container24-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Int",
                "type": "output",
                "multi": true
              },
              "subcomponent": "Drago__Int",
              "value": 70
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container24-row-1": {
                "type": "row",
                "id": "container24-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Int",
                  "type": "output",
                  "multi": true
                },
                "subcomponent": "Drago__Int",
                "value": 70
              }
            },
            "id": "container24",
            "component": "Drago_Datatype_Int",
            "x": 230,
            "y": 804
          },
          "component": "Drago_Datatype_Int",
          "x": 230,
          "y": 804
        },
        "container25": {
          "rows": {
            "container25-row-1": {
              "type": "row",
              "id": "container25-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container25"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container25-row-2": {
              "type": "row",
              "id": "container25-row-2",
              "options": {
                "name": "input1",
                "type": "variable",
                "label": "",
                "list": ["true", "false"],
                "subcomponent": "Drago__List"
              },
              "subcomponent": "Drago__List",
              "value": "true"
            },
            "container25-row-3": {
              "type": "row",
              "id": "container25-row-3",
              "options": {
                "name": "info1",
                "type": "info",
                "label": "OR INPUT:"
              },
              "value": ""
            },
            "container25-row-4": {
              "type": "row",
              "id": "container25-row-4",
              "options": {
                "name": "input2",
                "type": "input",
                "label": ""
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container25-row-1": {
                "type": "row",
                "id": "container25-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container25"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container25-row-2": {
                "type": "row",
                "id": "container25-row-2",
                "options": {
                  "name": "input1",
                  "type": "variable",
                  "label": "",
                  "list": ["true", "false"],
                  "subcomponent": "Drago__List"
                },
                "subcomponent": "Drago__List",
                "value": "true"
              },
              "container25-row-3": {
                "type": "row",
                "id": "container25-row-3",
                "options": {
                  "name": "info1",
                  "type": "info",
                  "label": "OR INPUT:"
                },
                "value": ""
              },
              "container25-row-4": {
                "type": "row",
                "id": "container25-row-4",
                "options": {
                  "name": "input2",
                  "type": "input",
                  "label": ""
                },
                "value": ""
              }
            },
            "id": "container25",
            "component": "Drago_Logic_End",
            "x": 1070,
            "y": 672
          },
          "component": "Drago_Logic_End",
          "x": 1140,
          "y": 720
        },
        "container26": {
          "rows": {
            "container26-row-1": {
              "type": "row",
              "id": "container26-row-1",
              "options": {
                "name": "input1",
                "type": "input",
                "label": "Log"
              },
              "value": ""
            },
            "container26-row-2": {
              "type": "row",
              "id": "container26-row-2",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Show Inventory",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "component": "Drago_Debug_Log",
            "x": 100,
            "y": 882
          },
          "component": "Drago_Debug_Log",
          "x": 880,
          "y": 384
        },
        "container27": {
          "rows": {
            "container27-row-1": {
              "type": "row",
              "id": "container27-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__String",
                "type": "output",
                "label": "Hello",
                "multi": true
              },
              "subcomponent": "Drago__String",
              "value": "Find jobs"
            }
          },
          "type": "container",
          "options": {
            "component": "Drago_Datatype_String",
            "x": 100,
            "y": 882
          },
          "component": "Drago_Datatype_String",
          "x": 690,
          "y": 264
        },
        "container28": {
          "rows": {
            "container28-row-1": {
              "type": "row",
              "id": "container28-row-1",
              "options": {
                "type": "input",
                "label": "Execute",
                "subcomponent": "Drago__Start",
                "name": "container28"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container28-row-2": {
              "type": "row",
              "id": "container28-row-2",
              "options": {
                "name": "input2",
                "type": "input",
                "label": "Function"
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "component": "Drago_Logic_Execute",
            "x": 100,
            "y": 882
          },
          "component": "Drago_Logic_Execute",
          "x": 1140,
          "y": 576
        }
      }
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
    "startbp": {
      "links": {
        "link-container1-row-2-container4-row-1": {
          "id": "link-container1-row-2-container4-row-1",
          "inputContainerId": "container1",
          "outputContainerId": "container4",
          "inputRowId": "container1-row-2",
          "outputRowId": "container4-row-1"
        }
      },
      "lastContainerId": 5,
      "containers": {
        "container1": {
          "rows": {
            "container1-row-1": {
              "type": "row",
              "id": "container1-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Object",
                "value": "life",
                "type": "output",
                "label": "",
                "multi": true
              },
              "subcomponent": "Drago__Object",
              "value": "life"
            },
            "container1-row-2": {
              "type": "row",
              "id": "container1-row-2",
              "options": {
                "name": "output3",
                "subcomponent": "Drago__Label",
                "type": "output",
                "process": true,
                "label": "Execute",
                "multi": true
              },
              "subcomponent": "Drago__Label",
              "value": ""
            }
          },
          "type": "event",
          "options": {
            "rows": {
              "container1-row-1": {
                "type": "row",
                "id": "container1-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Object",
                  "value": "life",
                  "type": "output",
                  "label": "",
                  "multi": true
                },
                "subcomponent": "Drago__Object",
                "value": "life"
              },
              "container1-row-2": {
                "type": "row",
                "id": "container1-row-2",
                "options": {
                  "name": "output3",
                  "subcomponent": "Drago__Label",
                  "type": "output",
                  "process": true,
                  "label": "Execute",
                  "multi": true
                },
                "subcomponent": "Drago__Label",
                "value": ""
              }
            },
            "id": "container1",
            "component": "Drago_Abe_LifeEvent",
            "x": 280,
            "y": 216
          },
          "component": "Drago_Abe_LifeEvent",
          "x": 280,
          "y": 216
        },
        "container4": {
          "rows": {
            "container4-row-1": {
              "type": "row",
              "id": "container4-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container4"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container4-row-2": {
              "type": "row",
              "id": "container4-row-2",
              "options": {
                "name": "input1",
                "type": "variable",
                "label": "",
                "list": ["true", "false"],
                "subcomponent": "Drago__List"
              },
              "subcomponent": "Drago__List",
              "value": "true"
            },
            "container4-row-3": {
              "type": "row",
              "id": "container4-row-3",
              "options": {
                "name": "info1",
                "type": "info",
                "label": "OR INPUT:"
              },
              "value": ""
            },
            "container4-row-4": {
              "type": "row",
              "id": "container4-row-4",
              "options": {
                "name": "input2",
                "type": "input",
                "label": ""
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container4-row-1": {
                "type": "row",
                "id": "container4-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container4"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container4-row-2": {
                "type": "row",
                "id": "container4-row-2",
                "options": {
                  "name": "input1",
                  "type": "variable",
                  "label": "",
                  "list": ["true", "false"],
                  "subcomponent": "Drago__List"
                },
                "subcomponent": "Drago__List",
                "value": "true"
              },
              "container4-row-3": {
                "type": "row",
                "id": "container4-row-3",
                "options": {
                  "name": "info1",
                  "type": "info",
                  "label": "OR INPUT:"
                },
                "value": ""
              },
              "container4-row-4": {
                "type": "row",
                "id": "container4-row-4",
                "options": {
                  "name": "input2",
                  "type": "input",
                  "label": ""
                },
                "value": ""
              }
            },
            "id": "container4",
            "component": "Drago_Logic_End",
            "x": 540,
            "y": 264
          },
          "component": "Drago_Logic_End",
          "x": 540,
          "y": 264
        }
      }
    },
    "runbp": {
      "links": {
        "link-container3-row-1-container4-row-2": {
          "id": "link-container3-row-1-container4-row-2",
          "inputContainerId": "container3",
          "outputContainerId": "container4",
          "inputRowId": "container3-row-1",
          "outputRowId": "container4-row-2"
        },
        "link-container5-row-1-container4-row-4": {
          "id": "link-container5-row-1-container4-row-4",
          "inputContainerId": "container5",
          "outputContainerId": "container4",
          "inputRowId": "container5-row-1",
          "outputRowId": "container4-row-4"
        },
        "link-container1-row-2-container4-row-1": {
          "id": "link-container1-row-2-container4-row-1",
          "inputContainerId": "container1",
          "outputContainerId": "container4",
          "inputRowId": "container1-row-2",
          "outputRowId": "container4-row-1"
        },
        "link-container4-row-5-container11-row-1": {
          "id": "link-container4-row-5-container11-row-1",
          "inputContainerId": "container4",
          "outputContainerId": "container11",
          "inputRowId": "container4-row-5",
          "outputRowId": "container11-row-1"
        },
        "link-container9-row-1-container11-row-2": {
          "id": "link-container9-row-1-container11-row-2",
          "inputContainerId": "container9",
          "outputContainerId": "container11",
          "inputRowId": "container9-row-1",
          "outputRowId": "container11-row-2"
        }
      },
      "lastContainerId": 12,
      "containers": {
        "container1": {
          "rows": {
            "container1-row-1": {
              "type": "row",
              "id": "container1-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Object",
                "value": "life",
                "type": "output",
                "label": "",
                "multi": true
              },
              "subcomponent": "Drago__Object",
              "value": "life"
            },
            "container1-row-2": {
              "type": "row",
              "id": "container1-row-2",
              "options": {
                "name": "output3",
                "subcomponent": "Drago__Label",
                "type": "output",
                "process": true,
                "label": "Execute",
                "multi": true
              },
              "subcomponent": "Drago__Label",
              "value": ""
            }
          },
          "type": "event",
          "options": {
            "rows": {
              "container1-row-1": {
                "type": "row",
                "id": "container1-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Object",
                  "value": "life",
                  "type": "output",
                  "label": "",
                  "multi": true
                },
                "subcomponent": "Drago__Object",
                "value": "life"
              },
              "container1-row-2": {
                "type": "row",
                "id": "container1-row-2",
                "options": {
                  "name": "output3",
                  "subcomponent": "Drago__Label",
                  "type": "output",
                  "process": true,
                  "label": "Execute",
                  "multi": true
                },
                "subcomponent": "Drago__Label",
                "value": ""
              }
            },
            "id": "container1",
            "component": "Drago_Abe_LifeEvent",
            "x": 320,
            "y": 360
          },
          "component": "Drago_Abe_LifeEvent",
          "x": 320,
          "y": 360
        },
        "container3": {
          "rows": {
            "container3-row-1": {
              "type": "row",
              "id": "container3-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Distance",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container3-row-1": {
                "type": "row",
                "id": "container3-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Output",
                  "type": "output",
                  "label": "Distance",
                  "multi": true
                },
                "subcomponent": "Drago__Output",
                "value": ""
              }
            },
            "id": "container3",
            "component": "Drago_Life_DistanceToTask",
            "x": 320,
            "y": 456
          },
          "component": "Drago_Life_DistanceToTask",
          "x": 320,
          "y": 456
        },
        "container4": {
          "rows": {
            "container4-row-1": {
              "type": "row",
              "id": "container4-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container4"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container4-row-2": {
              "type": "row",
              "id": "container4-row-2",
              "options": {
                "name": "input1",
                "type": "input",
                "label": "Var 1"
              },
              "value": ""
            },
            "container4-row-3": {
              "type": "row",
              "id": "container4-row-3",
              "options": {
                "name": "input2",
                "subcomponent": "Drago__List",
                "list": ["===", "==", "!=", "<", ">", "<=", ">="],
                "datatype": "string",
                "type": "variable",
                "process": true
              },
              "subcomponent": "Drago__List",
              "value": "<"
            },
            "container4-row-4": {
              "type": "row",
              "id": "container4-row-4",
              "options": {
                "name": "input3",
                "type": "input",
                "label": "Var 2"
              },
              "value": ""
            },
            "container4-row-5": {
              "type": "row",
              "id": "container4-row-5",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "true",
                "enabled": false,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            },
            "container4-row-6": {
              "type": "row",
              "id": "container4-row-6",
              "options": {
                "name": "output2",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "false",
                "enabled": true,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container4-row-1": {
                "type": "row",
                "id": "container4-row-1",
                "options": {
                  "type": "input",
                  "label": "",
                  "subcomponent": "Drago__Start",
                  "name": "container4"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container4-row-2": {
                "type": "row",
                "id": "container4-row-2",
                "options": {
                  "name": "input1",
                  "type": "input",
                  "label": "Var 1"
                },
                "value": ""
              },
              "container4-row-3": {
                "type": "row",
                "id": "container4-row-3",
                "options": {
                  "name": "input2",
                  "subcomponent": "Drago__List",
                  "list": ["===", "==", "!=", "<", ">", "<=", ">="],
                  "datatype": "string",
                  "type": "variable",
                  "process": true
                },
                "subcomponent": "Drago__List",
                "value": "<"
              },
              "container4-row-4": {
                "type": "row",
                "id": "container4-row-4",
                "options": {
                  "name": "input3",
                  "type": "input",
                  "label": "Var 2"
                },
                "value": ""
              },
              "container4-row-5": {
                "type": "row",
                "id": "container4-row-5",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Boolean",
                  "type": "output",
                  "label": "true",
                  "enabled": false,
                  "process": true,
                  "multi": true
                },
                "subcomponent": "Drago__Boolean",
                "value": ""
              },
              "container4-row-6": {
                "type": "row",
                "id": "container4-row-6",
                "options": {
                  "name": "output2",
                  "subcomponent": "Drago__Boolean",
                  "type": "output",
                  "label": "false",
                  "enabled": true,
                  "process": true,
                  "multi": true
                },
                "subcomponent": "Drago__Boolean",
                "value": ""
              }
            },
            "id": "container4",
            "component": "Drago_Logic_If",
            "x": 590,
            "y": 456
          },
          "component": "Drago_Logic_If",
          "x": 590,
          "y": 456
        },
        "container5": {
          "rows": {
            "container5-row-1": {
              "type": "row",
              "id": "container5-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Int",
                "type": "output",
                "multi": true
              },
              "subcomponent": "Drago__Int",
              "value": 90
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container5-row-1": {
                "type": "row",
                "id": "container5-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Int",
                  "type": "output",
                  "multi": true
                },
                "subcomponent": "Drago__Int",
                "value": 90
              }
            },
            "id": "container5",
            "component": "Drago_Datatype_Int",
            "x": 320,
            "y": 528
          },
          "component": "Drago_Datatype_Int",
          "x": 320,
          "y": 528
        },
        "container9": {
          "rows": {
            "container9-row-1": {
              "type": "row",
              "id": "container9-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Has Job",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container9-row-1": {
                "type": "row",
                "id": "container9-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Output",
                  "type": "output",
                  "label": "Has Job",
                  "multi": true
                },
                "subcomponent": "Drago__Output",
                "value": ""
              }
            },
            "id": "container9",
            "component": "Drago_Life_DoJob",
            "x": 570,
            "y": 660
          },
          "component": "Drago_Life_DoJob",
          "x": 570,
          "y": 660
        },
        "container11": {
          "rows": {
            "container11-row-1": {
              "type": "row",
              "id": "container11-row-1",
              "options": {
                "type": "input",
                "label": "Execute",
                "subcomponent": "Drago__Start",
                "name": "container11"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container11-row-2": {
              "type": "row",
              "id": "container11-row-2",
              "options": {
                "name": "input2",
                "type": "input",
                "label": "Function"
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "rows": {
              "container11-row-1": {
                "type": "row",
                "id": "container11-row-1",
                "options": {
                  "type": "input",
                  "label": "Execute",
                  "subcomponent": "Drago__Start",
                  "name": "container11"
                },
                "subcomponent": "Drago__Start",
                "value": ""
              },
              "container11-row-2": {
                "type": "row",
                "id": "container11-row-2",
                "options": {
                  "name": "input2",
                  "type": "input",
                  "label": "Function"
                },
                "value": ""
              }
            },
            "id": "container11",
            "component": "Drago_Logic_Execute",
            "x": 820,
            "y": 624
          },
          "component": "Drago_Logic_Execute",
          "x": 820,
          "y": 624
        }
      }
    },
    "weightbp": {
      "links": {
        "link-container27-row-1-container26-row-2": {
          "id": "link-container27-row-1-container26-row-2",
          "inputContainerId": "container27",
          "outputContainerId": "container26",
          "inputRowId": "container27-row-1",
          "outputRowId": "container26-row-2"
        },
        "link-container28-row-1-container26-row-4": {
          "id": "link-container28-row-1-container26-row-4",
          "inputContainerId": "container28",
          "outputContainerId": "container26",
          "inputRowId": "container28-row-1",
          "outputRowId": "container26-row-4"
        },
        "link-container1-row-2-container26-row-1": {
          "id": "link-container1-row-2-container26-row-1",
          "inputContainerId": "container1",
          "outputContainerId": "container26",
          "inputRowId": "container1-row-2",
          "outputRowId": "container26-row-1"
        },
        "link-container32-row-1-container30-row-4": {
          "id": "link-container32-row-1-container30-row-4",
          "inputContainerId": "container32",
          "outputContainerId": "container30",
          "inputRowId": "container32-row-1",
          "outputRowId": "container30-row-4"
        },
        "link-container31-row-1-container29-row-4": {
          "id": "link-container31-row-1-container29-row-4",
          "inputContainerId": "container31",
          "outputContainerId": "container29",
          "inputRowId": "container31-row-1",
          "outputRowId": "container29-row-4"
        },
        "link-container1-row-2-container29-row-1": {
          "id": "link-container1-row-2-container29-row-1",
          "inputContainerId": "container1",
          "outputContainerId": "container29",
          "inputRowId": "container1-row-2",
          "outputRowId": "container29-row-1"
        },
        "link-container26-row-5-container30-row-1": {
          "id": "link-container26-row-5-container30-row-1",
          "inputContainerId": "container26",
          "outputContainerId": "container30",
          "inputRowId": "container26-row-5",
          "outputRowId": "container30-row-1"
        }
      },
      "lastContainerId": 33,
      "containers": {
        "container1": {
          "rows": {
            "container1-row-1": {
              "type": "row",
              "id": "container1-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Object",
                "value": "life",
                "type": "output",
                "label": "",
                "multi": true
              },
              "subcomponent": "Drago__Object",
              "value": "life"
            },
            "container1-row-2": {
              "type": "row",
              "id": "container1-row-2",
              "options": {
                "name": "output3",
                "subcomponent": "Drago__Label",
                "type": "output",
                "process": true,
                "label": "Execute",
                "multi": true
              },
              "subcomponent": "Drago__Label",
              "value": ""
            }
          },
          "type": "event",
          "options": {
            "rows": {
              "container1-row-1": {
                "type": "row",
                "id": "container1-row-1",
                "options": {
                  "name": "output1",
                  "subcomponent": "Drago__Object",
                  "value": "life",
                  "type": "output",
                  "label": "",
                  "multi": true
                },
                "subcomponent": "Drago__Object",
                "value": "life"
              },
              "container1-row-2": {
                "type": "row",
                "id": "container1-row-2",
                "options": {
                  "name": "output3",
                  "subcomponent": "Drago__Label",
                  "type": "output",
                  "process": true,
                  "label": "Execute",
                  "multi": true
                },
                "subcomponent": "Drago__Label",
                "value": ""
              }
            },
            "id": "container1",
            "component": "Drago_Abe_LifeEvent",
            "x": 220,
            "y": 288
          },
          "component": "Drago_Abe_LifeEvent",
          "x": 30,
          "y": 24
        },
        "container26": {
          "rows": {
            "container26-row-1": {
              "type": "row",
              "id": "container26-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container26"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container26-row-2": {
              "type": "row",
              "id": "container26-row-2",
              "options": {
                "name": "input1",
                "type": "input",
                "label": "Var 1"
              },
              "value": ""
            },
            "container26-row-3": {
              "type": "row",
              "id": "container26-row-3",
              "options": {
                "name": "input2",
                "subcomponent": "Drago__List",
                "list": ["===", "==", "!=", "<", ">", "<=", ">="],
                "datatype": "string",
                "type": "variable",
                "process": true
              },
              "subcomponent": "Drago__List",
              "value": "==="
            },
            "container26-row-4": {
              "type": "row",
              "id": "container26-row-4",
              "options": {
                "name": "input3",
                "type": "input",
                "label": "Var 2"
              },
              "value": ""
            },
            "container26-row-5": {
              "type": "row",
              "id": "container26-row-5",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "true",
                "enabled": false,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            },
            "container26-row-6": {
              "type": "row",
              "id": "container26-row-6",
              "options": {
                "name": "output2",
                "subcomponent": "Drago__Boolean",
                "type": "output",
                "label": "false",
                "enabled": true,
                "process": true,
                "multi": true
              },
              "subcomponent": "Drago__Boolean",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "component": "Drago_Logic_If",
            "x": 100,
            "y": 882
          },
          "component": "Drago_Logic_If",
          "x": 350,
          "y": 72
        },
        "container27": {
          "rows": {
            "container27-row-1": {
              "type": "row",
              "id": "container27-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "Has Job",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "component": "Drago_Life_HasJob",
            "x": 100,
            "y": 882
          },
          "component": "Drago_Life_HasJob",
          "x": 100,
          "y": 108
        },
        "container28": {
          "rows": {
            "container28-row-1": {
              "type": "row",
              "id": "container28-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Output",
                "type": "output",
                "label": "True",
                "multi": true
              },
              "subcomponent": "Drago__Output",
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "component": "Drago_Datatype_True",
            "x": 100,
            "y": 882
          },
          "component": "Drago_Datatype_True",
          "x": 80,
          "y": 168
        },
        "container29": {
          "rows": {
            "container29-row-1": {
              "type": "row",
              "id": "container29-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container29"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container29-row-2": {
              "type": "row",
              "id": "container29-row-2",
              "options": {
                "name": "input1",
                "type": "variable",
                "label": "",
                "list": ["true", "false"],
                "subcomponent": "Drago__List"
              },
              "subcomponent": "Drago__List",
              "value": "true"
            },
            "container29-row-3": {
              "type": "row",
              "id": "container29-row-3",
              "options": {
                "name": "info1",
                "type": "info",
                "label": "OR INPUT:"
              },
              "value": ""
            },
            "container29-row-4": {
              "type": "row",
              "id": "container29-row-4",
              "options": {
                "name": "input2",
                "type": "input",
                "label": ""
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "component": "Drago_Logic_End",
            "x": 100,
            "y": 882
          },
          "component": "Drago_Logic_End",
          "x": 370,
          "y": 276
        },
        "container30": {
          "rows": {
            "container30-row-1": {
              "type": "row",
              "id": "container30-row-1",
              "options": {
                "type": "input",
                "label": "",
                "subcomponent": "Drago__Start",
                "name": "container30"
              },
              "subcomponent": "Drago__Start",
              "value": ""
            },
            "container30-row-2": {
              "type": "row",
              "id": "container30-row-2",
              "options": {
                "name": "input1",
                "type": "variable",
                "label": "",
                "list": ["true", "false"],
                "subcomponent": "Drago__List"
              },
              "subcomponent": "Drago__List",
              "value": "true"
            },
            "container30-row-3": {
              "type": "row",
              "id": "container30-row-3",
              "options": {
                "name": "info1",
                "type": "info",
                "label": "OR INPUT:"
              },
              "value": ""
            },
            "container30-row-4": {
              "type": "row",
              "id": "container30-row-4",
              "options": {
                "name": "input2",
                "type": "input",
                "label": ""
              },
              "value": ""
            }
          },
          "type": "container",
          "options": {
            "component": "Drago_Logic_End",
            "x": 100,
            "y": 882
          },
          "component": "Drago_Logic_End",
          "x": 630,
          "y": 168
        },
        "container31": {
          "rows": {
            "container31-row-1": {
              "type": "row",
              "id": "container31-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Int",
                "type": "output",
                "multi": true
              },
              "subcomponent": "Drago__Int",
              "value": 0
            }
          },
          "type": "container",
          "options": {
            "component": "Drago_Datatype_Int",
            "x": 100,
            "y": 882
          },
          "component": "Drago_Datatype_Int",
          "x": 120,
          "y": 348
        },
        "container32": {
          "rows": {
            "container32-row-1": {
              "type": "row",
              "id": "container32-row-1",
              "options": {
                "name": "output1",
                "subcomponent": "Drago__Int",
                "type": "output",
                "multi": true
              },
              "subcomponent": "Drago__Int",
              "value": 75
            }
          },
          "type": "container",
          "options": {
            "component": "Drago_Datatype_Int",
            "x": 100,
            "y": 882
          },
          "component": "Drago_Datatype_Int",
          "x": 370,
          "y": 228
        }
      }
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
  _AISTATES.aistate_attack = {
    "start": function (life) {
      life.attackStartX = life.x;
      life.attackStartY = life.y;
      life.lastShot = Date.now();
      life.pathFind = false;
      if (life.target !== undefined) {
        if (life.target.markedForDestroy == true) {
          return false;
        }
      }
    },
    "end": function () {},
    "weight": function (life) {
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
        let dist = life.isMelee ? 200 : 0;
        let targetDist = life.dist(target);
        if (targetDist > dist) {
          return 0;
        }
        if (target == undefined) {
          life.removeTarget();
          return false;
        }
        if (target.data.dead) {
          life.removeTarget();
          return false;
        }
        if (life.sees[target.id] && life.id !== servers.world.playerId) {
          life.stopMoving();
        }
        let cooldown = life.data.bullet && life.data.bullet.cooldown ? life.data.bullet.cooldown : 2;
        let skill = 1;
        let cooldownCap = 75;
        let onePercent = cooldownCap / 100;
        let newCooldownReduction = onePercent * skill;
        newCooldownReduction = newCooldownReduction / 100;
        cooldown *= 1 - newCooldownReduction;
        if (Date.now() > life.lastShot + 1000 * cooldown) {
          life.shoot();
          life.lastShot = Date.now() + life.helper.rng(100, 2000);
          if (life.data.stance == 'melee' && life.helper.rng(0, 3) === 2) {
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
        return 101;
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
  _AISTATES.ais_drone = {
    "states": 'aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistate_gather,aistate_goto_gather',
    "parent": 'ai_states_collections',
    "name": 'Drone (player default)'
  };
  _AISTATES.ais_guard = {
    "states": 'aistate_ko,aistate_idle,aistate_shuffle,aistate_attack,aistate_changeweapon,aistate_attack_chase,aistate_attack_stop_chase,aistate_go_home,aistate_guardpatrol',
    "parent": 'ai_states_collections',
    "name": 'Guard'
  };
  _AISTATES.ais_wander = {
    "states": 'aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase',
    "parent": 'ai_states_collections',
    "name": 'Wanderer'
  };
  _AISTATES.ais_deadhead = {
    "states": 'aistate_ko,aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistate_shuffle',
    "parent": 'ai_states_collections',
    "name": 'Wanderer'
  };
  _AISTATES.ais_police = {
    "states": 'aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase',
    "parent": 'ai_states_collections',
    "name": 'Guard'
  };
  _AISTATES.ais_player_clone = {
    "states": 'aistate_find_enemies,aistate_ko,aistate_idle,aistate_gotocontainer,aistate_find_jobs,aistate_do_jobs,aistate_useitem,aistate_gather,aistate_goto_gather,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistate_follow_player,aistate_move',
    "parent": 'ai_states_collections',
    "name": 'Player Clone'
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
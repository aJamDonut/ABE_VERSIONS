bootStrap.push(function () {
  self._BLUEPRINTS.EXTENSIONS = {};
  _BLUEPRINTS.EXTENSIONS.ext_door = {
    "events": {
      "onCreate": function (item, options) {
        if (!options) options = {};
        const noLight = options.noLight || false;
        let x = game.gridPos(item.x);
        let y = game.gridPos(item.y);
        item.data.closed = true;
        item.data.locked = typeof item.data.locked !== 'undefined' ? item.data.locked : true;
        item.data.persist = true;
        item.data.peristId = item.id;
        game.offloader.addToIndex('doors', item, x + '_' + y);
        item.sync();
        function flipRotate(item) {
          item._sprite.rotation = 0;
          item._sprite.x = 0;
          item._sprite.y = 0;
          item._sprite.scale.x = 1;
          if (item.data.usedata2 === "rotate" && item.data.usedata3 === "flip") {
            item._sprite.rotation = Math.PI / 2;
            item._sprite.scale.x = -1;
            item._sprite.x = item._sprite.width;
            item._sprite.y = item._sprite.height;
            return;
          }
          if (item.data.usedata2 === "rotate") {
            item._sprite.rotation = Math.PI / 2;
            item._sprite.x = item._sprite.width;
            return;
          }
          if (item.data.usedata3 === 'flip') {
            item._sprite.scale.x = -1;
            item._sprite.x = item._sprite.width;
            return;
          }
        }
        function rotateLight(item, light) {
          light.rotation = 0;
          light.y = item.height / 2 + 15;
          light.y -= 8;
          if (item.data.usedata2 === "rotate") {
            light.rotation = Math.PI / 2;
            light.y = 20;
          }
        }
        if (game.editMode) {
          item.contextMenus['Rotate'] = () => {
            if (item.data.usedata2 === "rotate") {
              item.data.usedata2 = false;
              delete item.data.usedata2;
              rotateLight(item, item.light);
              flipRotate(item);
              return;
            }
            item.data.usedata2 = 'rotate';
            flipRotate(item);
            rotateLight(item, item.light);
          };
          item.contextMenus['Flip'] = () => {
            if (item.data.usedata3 === "flip") {
              item.data.usedata3 = false;
              delete item.data.usedata3;
              flipRotate(item);
            } else {
              item.data.usedata3 = "flip";
              flipRotate(item);
            }
          };
          item.contextMenus['Set Key'] = () => {
            game.askText("Set key codename", "", val => {
              item.data.group = val;
            });
          };
          item.contextMenus['Toggle Lock'] = () => {
            if (item.data.usedata1 !== "unlocked") {
              item.data.locked = false;
              item.data.usedata1 = "unlocked";
              item.canUnlock(item, {
                locked: true
              }, {
                locked: false
              });
            } else {
              item.data.usedata1 = "";
              var myLight = new Sprite('container_2_lightred', {
                anchor: 'center'
              });
              myLight.x = item.light.x;
              myLight.y = item.light.y;
              item.light.destroy();
              item.light = myLight;
              item.addChild(myLight);
              rotateLight(item, myLight);
            }
          };
        }
        if (item.data.usedata1 === 'unlocked') {
          item.data.locked = false;
        }
        flipRotate(item);
        let lightSpright = item.data.locked ? 'container_2_lightred' : 'container_2_light';
        var myLight = new Sprite(lightSpright, {
          anchor: 'center'
        });
        myLight.x = item.width / 2;
        myLight.y = item.height / 2 + 15;
        myLight.x -= 10;
        myLight.y -= 8;
        rotateLight(item, myLight);
        myLight.alpha = noLight ? 0 : 1;
        item.addChild(myLight);
        item.light = myLight;
        let openAnim = 'doorOpenX';
        let closeAnim = 'doorCloseX';
        item.openAnim = openAnim;
        if (item.data.usedata2 == "rotate") {
          openAnim = "doorOpenY";
          closeAnim = "doorCloseY";
        }
        if (item.data.usedata3 == "flip") {
          openAnim = openAnim + "Flip";
        }
        item.unlock = function () {
          item.data.locked = false;
          item.sync();
          game.tween(item, openAnim, {
            onComplete: function (item) {
              item.closing = true;
              item.opening = false;
              item.data.open = false;
              item.sync();
            }
          });
        };
        item.closeDoor = function (item) {
          item.data.open = false;
          item.sync();
          game.tween(item, closeAnim, {
            noXY: true,
            onComplete: function () {}
          });
        };
        item.openDoor = function (item, before, after) {
          if (after.open && item.tweenName != item.openAnim) {
            game.tween(item, openAnim, {
              noXY: true,
              onComplete: item.closeDoor
            });
          }
        };
        item.canUnlock = function (item, before, after) {
          if (before.locked == true && after.locked == false) {
            item.data.usedata1 = "unlocked";
            item.light.destroy();
            var myLight = new Sprite('container_2_light', {
              anchor: 'center'
            });
            myLight.x = item.width / 2;
            myLight.y = item.height / 2 + 15;
            myLight.x -= 10;
            myLight.y -= 8;
            rotateLight(item, myLight);
            item.light = myLight;
            item.addChild(myLight);
          }
        };
        item.events.onUpdate = function (item, before, after) {
          item.canUnlock(item, before, after);
          item.openDoor(item, before, after);
        };
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Door extension'
  };
  _BLUEPRINTS.EXTENSIONS.ext_heal = {
    "events": {
      "onCreate": function (item, options) {
        item.data.block = true;
        item.contextMenus = {};
        item.contextMenus['Heal'] = function (caller) {
          var life = caller.inventory.owner;
          life.addStatusFromClient('bandaging', {
            duration: 4.5,
            source: this.id,
            canCancelWithMove: true
          });
        };
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Heal (Use bandage)'
  };
  _BLUEPRINTS.EXTENSIONS.ext_loot_w_light = {
    "events": {
      "onCreate": function (furni, options) {
        if (game.editMode) {
          return;
        }
        if (!options) {
          options = {};
        }
        if (!options.xSlots) {
          options.xSlots = 8;
        }
        if (!options.ySlots) {
          options.ySlots = 8;
        }
        var hasSaveData = furni.data.inventory ? true : false;
        game.inventories.createInventoryForItem(furni, options.xSlots, options.ySlots);
        var myLight = new Sprite('container_2_light', {
          anchor: 'center'
        });
        myLight.x = furni.width / 2;
        myLight.y = furni.height / 2 + 15;
        myLight.filters = [game.render.filters.bloom];
        game.tween(myLight, 'breathe');
        furni.addChild(myLight);
        var myLight = new Sprite('lightcookie_oval', {
          anchor: 'center'
        });
        myLight.x = furni.x + furni.width / 2;
        myLight.y = furni.y + furni.height / 2 + 15;
        game.tween(myLight, 'breathe');
        game.render.lights.addChild(myLight);
        if (!hasSaveData) {
          game.loot.genLoot(Object.assign(options, {
            inventory: this.inventory
          }));
        }
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Loot Container Extension'
  };
  _BLUEPRINTS.EXTENSIONS.ext_shop = {
    "events": {
      "onCreate": function (furni, options) {
        if (game.editMode) {
          return;
        }
        if (!options) {
          options = {};
        }
        if (!options.xSlots) {
          options.xSlots = 16;
        }
        if (!options.ySlots) {
          options.ySlots = 16;
        }
        if (!options.min) {
          options.min = 5;
        }
        if (!options.max) {
          options.max = 12;
        }
        var hasSaveData = furni.data.inventory ? true : false;
        game.inventories.createInventoryForItem(furni, options.xSlots, options.ySlots);
        furni.inventory.isShop = true;
        if (!hasSaveData) {
          game.queue.add(() => {
            try {
              game.loot.genLoot(Object.assign(options, {
                inventory: furni.inventory
              }));
            } catch (e) {}
          });
        }
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Shop'
  };
  _BLUEPRINTS.EXTENSIONS.ext_buildable = {
    "events": {
      "onCreate": function (item, options) {
        item.finishJob = function () {
          let replacement = {};
          this.data.isPlayer = true;
          if (this.data.complex) {
            replacement = new ComplexItem(this.data.crafts, this.data);
          } else {
            replacement = new SimpleItem(this.data.crafts, this.data);
          }
          replacement.scaleToGame();
          replacement.x = this.x;
          replacement.y = this.y;
          game.world.addObject(replacement);
          game.render.objectLayer.addChild(replacement);
          replacement.onCreate();
          this.data.built = true;
        };
        if (game.cheat === true) return item.finishJob();
        item.alpha = 0.5;
        item.data.owns = true;
        item.data.built = false;
        item.data.hasResources = false;
        item.data.job = 'build';
        item.sync();
        game.offloader.addToIndex('jobs', item);
        game.offloader.addToIndex('ticker', item);
        game.offloader.addToIndex('playerstorage', item);
        item.createJob(ABE.CONSTS.SEARCH_PRIORITIES.BUILD, ABE.CONSTS.JOB_PRIORITIES.LOW);
        item.alpha = 0.5;
        item.steps = 0;
        item.jobAnim = 'build';
        item.maxSteps = 3;
        item.showCost(_BLUEPRINTS.RECIPES['recipe_' + this.data.recipe]);
        game.inventories.createInventoryForItem(item, 10, 10, false, function (item) {
          this.sync();
        });
        item.jobStep = function (data) {
          this.steps++;
          this.msg("Build! " + this.steps);
          let recipe = game.session.getRecipe(this.data.recipe);
          let crafts = this.data.crafts;
          let complex = this.data.complex;
          let caller = game.index.getFromIndex(data.callerId, 'all');
          let inventory = item.inventory;
          let resources = inventory.getResources();
          let requires = [];
          let amounts = [];
          if (recipe && recipe.require && recipe.amount) {
            requires = recipe.require.split(',');
            amounts = recipe.amount.split(',');
          }
          caller.forceAnim = 'util/build_' + caller.data.dir;
          if (this.steps >= this.maxSteps) {
            for (let i = 0; i < requires.length; i++) {
              var need = requires[i];
              var amount = amounts[i];
              if (!resources['ss_item_' + need]) {
                this.msg("Need " + amount + " " + need + "!");
                caller.failJob(this);
                return false;
              }
              if (resources['ss_item_' + need] < parseInt(amount)) {
                this.msg("Need " + (resources['ss_item_' + need] - amount) + " more " + need + "!");
                caller.failJob(this);
                return false;
              }
            }
            this.finishJob();
            caller.completeJob(this);
          }
        };
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Item Buildable'
  };
  _BLUEPRINTS.EXTENSIONS.ext_craftingbench = {
    "events": {
      "onCreate": function (item) {
        game.inventories.createInventoryForItem(item, 10, 10, false, function (item) {
          this.sync();
        });
        if (this.data.queue) {
          this.queue = new CraftQueue(this, item.data.queue);
        } else {
          this.queue = new CraftQueue(this);
        }
        item.data.queue = this.queue;
        this.contextMenus['Craft'] = caller => {
          let craft = game.render.component('hud_bench_crafting', {
            crafter: this
          }, 'hud_bench_crafting');
          craft.x = 400;
          craft.y = 200;
          game.render.aboveAll.addChild(craft);
        };
        item.sync();
        game.offloader.addToIndex('ticker', item);
        game.offloader.addToIndex('playerstorage', item);
        game.index.addToIndex('playerstorage', item);
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Item is Craftbench'
  };
  _BLUEPRINTS.EXTENSIONS.ext_vehicle = {
    "events": {
      "onCreate": function (item, options) {
        if (options.doDriven) {
          item.doDriven = options.doDriven;
        }
        item.use = function (options) {
          let life = game.index.getFromIndex(options.callerId, 'life');
          life.drive(this);
        };
        item.contextMenus['Drive'] = function (item) {
          game.p.data.gotoId = item.id;
          game.session.setCommand(game.p, 'useitem', {
            gotoId: item.id
          });
        };
        if (item.baseClass === "BaseLife") {
          if (item.data.dead || !item.data.isPlayer && !item.data.wildDrive) {
            delete item.contextMenus['Drive'];
          }
        }
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Vehicle extension'
  };
  _BLUEPRINTS.EXTENSIONS.extensions_bullet_default = {
    "events": {
      "onCreate": function (item, options) {
        if (!options) {
          options = {
            BASE_DMG: 15,
            LIFETIME: 3,
            SPEED: 0.2,
            BLEED_DURATION: 10,
            BLEED_CHANCE: 10,
            SPRITE: 'projectile_simple',
            TYPE: 'ballistic'
          };
        }
        item.data = {
          ...item.data,
          ...options
        };
        item.data.type = options.TYPE || options.type;
        item.data.baseDmg = options.BASE_DMG || options.baseDmg;
        item.data.speed = options.SPEED || options.speed;
        item.data.lifetime = options.LIFETIME || options.lifetime;
        item.data.sprite = options.SPRITE || options.sprite;
        const rawStatuses = options.STATUSES || options.statuses;
        item.data.statuses = rawStatuses;
        if (!Array.isArray(rawStatuses) && typeof rawStatuses === "object") {
          item.data.statuses = [];
          const keys = Object.keys(rawStatuses);
          for (let key of keys) {
            item.data.statuses.push(rawStatuses[key]);
          }
        }
        item.data.TYPE = item.data.type;
        item.data.BASE_DMG = item.data.baseDmg;
        item.data.SPEED = item.data.speed;
        item.data.SPRITE = item.data.sprite;
        item.data.LIFETIME = item.data.lifetime;
        item.data.STATUSES = item.data.statuses;
        item.data.BLEED_DURATION = 0;
        item.data.BLEED_CHANCE = 0;
        if (typeof item.events.onEquipt !== "function") {
          item.on('equipt', function (item, life) {
            life.setBullet(item.meta.stance, item.data);
          });
        }
        item.events.onUnEquipt = function (item, life) {
          life.setBullet('none', "none");
        };
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Bullet Default'
  };
  _BLUEPRINTS.EXTENSIONS.extensions_armour_default = {
    "events": {
      "onCreate": function (item, options) {
        if (!options) {
          options = {
            bluntReduction: 4,
            ballisticReduction: 4,
            sharpReduction: 4,
            tempHeat: 4,
            tempCold: 4
          };
        }
        item.on('equipt', function (item, life) {
          life.addStatsFrom(item);
        });
        item.on('unequipt', function (item, life) {
          life.removeStatsFrom(item);
        });
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Armour Default'
  };
  _BLUEPRINTS.EXTENSIONS.extensions_usable_item = {
    "events": {
      "onCreate": function (item, options) {
        item.data.block = true;
        item.contextMenus = {};
        item.contextMenus[options.label || 'Use'] = function (caller) {
          var life = caller.inventory.owner;
        };
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Usable Item'
  };
  _BLUEPRINTS.EXTENSIONS.extensions_platform = {
    "events": {
      "onCreate": function (item, options) {
        if (!options) {
          options = {
            dragWeight: 10
          };
        }
        options.dragWeight = typeof options.dragWeight !== "undefined" ? options.dragWeight : 10;
        item.contextMenus['Drag'] = function (caller) {
          game.p.carry(caller);
        };
        item.on('pointerover', function () {
          game.editPlatform = this;
        });
        item.on('pointerout', function () {
          game.editPlatform = false;
        });
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Platform'
  };
  _BLUEPRINTS.EXTENSIONS.ext_quick_lootable = {
    "events": {
      "onCreate": function (furni, options) {
        if (game.editMode) {
          return;
        }
        furni.addExtension('ext_loot_w_light', {
          count: 2,
          table: ['basic_armour', 'med_armour', 'med_blueprint', 'med_junk']
        });
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Quick Lootable'
  };
  _BLUEPRINTS.EXTENSIONS.ext_drink = {
    "events": {
      "onCreate": function (item, options) {
        item.data.block = item.data.block || true;
        item.data.maxUseCount = item.data.maxUseCount || 4;
        item.data.useCount = item.data.useCount || 4;
        item.contextMenus = {};
        item.contextMenus['Drink'] = function (caller) {
          var life = caller.inventory.owner;
          life.addStatusFromClient('drinking', {
            duration: 4.5,
            source: caller.id,
            canCancelWithMove: true
          });
        };
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Drink (Use drinks)'
  };
  _BLUEPRINTS.EXTENSIONS.ext_food = {
    "events": {
      "onCreate": function (item, options) {
        item.data.block = true;
        item.contextMenus = {};
        item.contextMenus['Consume'] = function (caller) {
          var life = caller.inventory.owner;
          life.addStatusFromClient('eating', {
            duration: 4.5,
            source: caller.id,
            food: caller.codename,
            canCancelWithMove: true
          });
        };
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Food (use food)'
  };
  _BLUEPRINTS.EXTENSIONS.ext_automation = {
    "events": {
      "onCreate": function (item, options) {
        if (!options) options = {};
        item.data.inputs = item.data.inputs || {};
        item.data.outputs = item.data.outputs || {};
        item.inputs = {};
        item.outputs = {};
        if (!item.data.receivers) item.data.receivers = {};
        if (!item.data.transmitters) item.data.transmitters = {};
        item.events.onDestroy = function () {
          this.unbindReceivers();
        };
        function emitterName(name) {
          return "_p_" + name + "_p_";
        }
        item.contextMenus['Automation'] = function () {
          const automation = game.render.component("hud_item_automation", {
            item
          });
          game.render.aboveAll.addChild(automation);
        };
        item.setInputKey = function (codename, key) {
          if (!this.inputs[codename]) throw "Cant find " + codename;
          this.unbindReceivers();
          if (this.inputs[codename].key && this.data.receivers[key]) {
            delete this.receivers[key];
            delete this.data.receivers[key];
          }
          this.inputs[codename].key = key;
          this.data.receivers[key] = codename;
          this.data.inputs[codename] = this.inputs[codename];
          this.bindReceivers();
        };
        item.getInputKey = function (codename) {
          if (!this.inputs[codename]) throw "Cant find " + codename;
          return this.inputs[codename].key;
        };
        item.setOutputKey = function (codename, key, group) {
          if (!group) group = "base";
          if (!this.outputs[group][codename]) throw "Cant find " + codename + " in " + group;
          this.outputs[group][codename].key = key;
          if (!this.data.outputs) this.data.outputs = {};
          if (!this.data.outputs[group]) this.data.outputs[group] = {};
          this.data.outputs[group][codename] = this.outputs[group][codename];
        };
        item.getOutputKey = function (codename, group) {
          if (!group) group = "base";
          if (!this.outputs[group]) throw "Cant find " + group;
          if (!this.outputs[group][codename]) throw "Cant find " + codename + " in " + group;
          return this.outputs[group][codename].key;
        };
        item.addOutput = function (name, codename, group) {
          if (!group) group = "base";
          if (!this.outputs) {
            this.outputs = {};
          }
          if (!this.outputs[group]) {
            this.outputs[group] = {};
          }
          this.outputs[group][codename] = {
            name,
            codename,
            group
          };
          if (this.data.outputs[group] && this.data.outputs[group][codename] && this.data.outputs[group][codename].key) {
            this.setOutputKey(codename, this.data.outputs[group][codename].key, group);
          }
        };
        item.addInput = function (name, codename, callback) {
          if (!this.inputs) {
            this.inputs = {};
          }
          if (!this.receivers) {
            this.receivers = {};
          }
          this.inputs[codename] = {
            name,
            codename,
            callback
          };
          if (this.data.inputs[codename] && this.data.inputs[codename].key) {
            item.setInputKey(codename, this.data.inputs[codename].key);
          }
        };
        item.receiver = function (key, value) {
          emitter = emitterName(key);
          if (!item.data.receivers[key]) return void 0;
          if (typeof item.inputs[item.data.receivers[key]].callback !== "function") return void 0;
          item.inputs[item.data.receivers[key]].callback.call(item, value);
        };
        item.emitOutput = function (group, codename, value) {
          if (!this.outputs[group]) return;
          if (!this.outputs[group][codename]) return;
          if (!this.outputs[group][codename].key) return;
          game.ee.emit(emitterName(this.outputs[group][codename].key), this.outputs[group][codename].key, value);
        };
        item.unbindReceivers = function () {
          if (!this.inputs || !this.inputs) return;
          const inputs = this.inputs;
          for (let inputKey in inputs) {
            const input = inputs[inputKey];
            game.ee.off(emitterName(input.key), this.receiver);
          }
        };
        item.bindReceivers = function () {
          if (!this.inputs || !this.inputs) return;
          const inputs = this.inputs;
          for (let inputKey in inputs) {
            const input = inputs[inputKey];
            game.ee.on(emitterName(input.key), this.receiver);
          }
        };
        if (options.setup) options.setup();
        item.bindReceivers();
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Automation Extension'
  };
  _BLUEPRINTS.EXTENSIONS.ext_use_timer = {
    "events": {
      "onCreate": function (item, options) {
        if (!options) options = {};
        if (!options.callback) return;
        options.timer = options.timer || 5000;
        item.data.useTimer = item.data.useTimer || game.ts + options.timer;
        const timer = () => {
          if (item.data.useTimer < game.ts) {
            item.data.useTimer = game.ts + options.timer;
            options.callback.call(item, item);
          }
        };
        item.addTicker('useTimer', timer);
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Use Timer'
  };
});
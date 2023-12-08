bootStrap.push(function () {
  self._BLUEPRINTS.EXTENSIONS = {};
  _BLUEPRINTS.EXTENSIONS.ext_door = {
    "events": {
      "onCreate": function (item, options) {
        let x = game.gridPos(item.x);
        let y = game.gridPos(item.y);
        item.data.closed = true;
        item.data.locked = typeof item.data.locked !== 'undefined' ? item.data.locked : true;
        game.offloader.addToIndex('doors', item, x + '_' + y);
        item.sync();
        if (item.data.usedata1 == 'unlocked') {
          item.data.locked = false;
        }
        let lightSpright = item.data.locked ? 'container_2_lightred' : 'container_2_light';
        var myLight = new Sprite(lightSpright, {
          anchor: 'center'
        });
        myLight.x = item.width / 2;
        myLight.y = item.height / 2 + 15;
        myLight.x -= 10;
        myLight.y -= 8;
        myLight.filters = [game.render.filters.bloom];
        item.addChild(myLight);
        item.light = myLight;
        var myLight = new Sprite('lightcookie_oval', {
          anchor: 'center'
        });
        myLight.x = item.x + item.width / 2;
        myLight.y = item.y + item.height / 2 + 15;
        game.render.lights.addChild(myLight);
        item.unlock = function () {
          item.data.locked = false;
          item.sync();
          game.tween(item, 'doorOpenX', {
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
          game.tween(item, 'doorCloseX', {
            noXY: true,
            onComplete: function () {}
          });
        };
        item.openDoor = function (item, before, after) {
          if (after.open && item.tweenName != 'doorOpenX') {
            game.tween(item, 'doorOpenX', {
              noXY: true,
              onComplete: item.closeDoor
            });
          }
        };
        item.canUnlock = function (item, before, after) {
          if (before.locked == true && after.locked == false) {
            item.light.destroy();
            var myLight = new Sprite('container_2_light', {
              anchor: 'center'
            });
            myLight.x = item.width / 2;
            myLight.y = item.height / 2 + 15;
            myLight.x -= 10;
            myLight.y -= 8;
            myLight.filters = [game.render.filters.bloom];
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
        this.inventory.isShop = true;
        if (!hasSaveData) {
          game.loot.genLoot(Object.assign(options, {
            inventory: this.inventory
          }));
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
        item.data.job = 'build';
        item.sync();
        game.offloader.addToIndex('jobs', item);
        item.alpha = 0.5;
        item.steps = 0;
        item.jobAnim = 'build';
        item.maxSteps = 3;
        item.showCost(_BLUEPRINTS.RECIPES['recipe_' + this.data.recipe]);
        item.jobStep = function (data) {
          this.steps++;
          let recipe = game.session.getRecipe(this.data.recipe);
          let crafts = this.data.crafts;
          let complex = this.data.complex;
          let caller = game.index.getFromIndex(data.callerId, 'all');
          let inventory = caller.inventory.main;
          let resources = inventory.getResources();
          let requires = recipe.require.split(',');
          let amounts = recipe.amount.split(',');
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
            for (let i = 0; i < requires.length; i++) {
              var need = requires[i];
              var amount = amounts[i];
              inventory.removeResource(need, amount);
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
  _BLUEPRINTS.EXTENSIONS.ext_bullet_default = {
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
        item.data.stats.type = options.TYPE;
        item.data.stats.baseDmg = options.BASE_DMG;
        item.data.stats.speed = options.SPEED;
        item.data.stats.range = options.LIFETIME;
        if (options.bleedChance) {
          item.data.stats.bleedChance = options.BLEED_CHANCE;
          item.data.stats.bleedDuration = options.BLEED_DURATION * 1000;
        }
        item.data = Object.assign(options, item.data);
      }
    },
    "parent": 'entity_extension_items_client',
    "name": 'Bullet Default'
  };
});
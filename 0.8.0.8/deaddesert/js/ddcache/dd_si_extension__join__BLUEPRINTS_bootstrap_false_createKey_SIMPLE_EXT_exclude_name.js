(function () {
  _BLUEPRINTS.SIMPLE_EXT = {};
  _BLUEPRINTS.SIMPLE_EXT.e_w_labclonebed = {
    "meta": {
      "blockZone": 'all'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_projectile_simple = {
    "sprite": 'projectile_simple',
    "meta": {
      "collisionGroups": 'collision_hurts_1',
      "physicsType": 'projectile'
    },
    "events": {
      "onCreate": function (item) {
        item.alpha = 1;
        let sparkles = new Particles('boomstick_smoke');
        sparkles.x = this.x;
        sparkles.y = this.y;
        sparkles.scale.set(0.25);
        sparkles.playOnceAndDestroy();
        game.render.lifeLayer.addChild(sparkles);
        const life = game.index.getFromIndex(item.data.creatorId, 'all');
        if (!life) return;
        if (life && life.aiming !== true) {
          life.toggleAim();
        }
        game.audio.playAt('chunkshot', life.x, life.y);
        life.shoot();
        this.addTicker('move', () => {
          this.counter++;
          if (this.counter < 5) {
            return;
          }
          this.counter = 0;
          let sparkles = new Particles('small_smoke');
          sparkles.x = this.x;
          sparkles.y = this.y;
          sparkles.scale.set(0.25);
          sparkles.playOnceAndDestroy();
          game.render.lifeLayer.addChild(sparkles);
        });
        this.events.onDestroy = function () {
          let sparkles = new Particles('boomstick_smoke');
          sparkles.x = this.x;
          sparkles.y = this.y;
          sparkles.scale.set(0.25);
          sparkles.playOnceAndDestroy();
          game.render.lifeLayer.addChild(sparkles);
        };
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_projectile_arrow = {
    "sprite": 'projectile_arrow',
    "meta": {
      "collisionGroups": 'collision_hurts_1',
      "physicsType": 'projectile'
    },
    "events": {
      "onCreate": function (item) {
        item.alpha = 1;
        var particle = new Particles('shootdebris');
        particle.playOnce();
        item._container.addChild(particle);
        const life = game.index.getFromIndex(item.data.creatorId, 'all');
        if (!life) return;
        if (life && life.aiming !== true) {
          life.toggleAim();
        }
        game.audio.playAt('chunkshot', life.x, life.y);
        life.shoot();
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_lab_securedoor = {
    "meta": {
      "physicsType": 'logic',
      "contextOptions": 'custom',
      "persist": true
    },
    "events": {
      "onCreate": function (item) {
        item.addExtension('ext_door');
      },
      "onUpdate": function (item, oldData, newData) {}
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_smallrecycler = {
    "meta": {
      "blockZone": 'all',
      "contextOptions": 'use'
    },
    "events": {
      "onCreate": function (item) {
        item.data.block = true;
        game.inventories.createInventoryForItem(item, 10, 4);
        item.recycle = function () {
          this.recycling = true;
          this.start = Date.now();
        };
        item.addTicker('recycle', function () {
          if (!this.recycling) {
            return false;
          }
          if (Date.now() < this.start + 3000) {
            return false;
          }
          this.start = Date.now();
          let items = Object.keys(this.inventory.itemList);
          if (items.length == 0) {
            this.recycling = false;
            return false;
          }
          let item = this.inventory.itemList[items[0]];
          if (item.breakdown) {
            game.p.data.stats[item.breakdown.resource] += item.breakdown.amount;
          } else {
            game.p.data.stats.components += game.rng(0, 100);
          }
          this.inventory.removeItem(item);
          this.inventory.refreshGrid();
        });
        item.use = function () {
          var recyler = game.render.component('hud_recycler', {
            recycler: this
          }, 'recycler');
          recyler.x = 20;
          recyler.y = 20;
          game.render.aboveAll.addChild(recyler);
        };
      },
      "onUpdate": function (item, oldData, newData) {}
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_w_whitetable = {
    "meta": {
      "blockZone": 'all'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_campfire = {
    "sprite": 'sprite_campfire',
    "meta": {
      "blockZone": 'all'
    },
    "events": {
      "onCreate": function (options) {
        return;
        var fire = game.render.createAnimatedSprite('anisprite_fire2');
        fire.x = 5;
        fire.y = 0;
        fire.alpha = 0.75;
        fire.scale.x = 0.8;
        fire.scale.y = 0.8;
        fire.animationSpeed = 0.1;
        this.addChild(fire);
        var particle = new Particles('fire_1');
        particle.x = 32;
        particle.y = 32;
        this.addChild(particle);
        particle.playForever();
        var particle = new Particles('smoke_3');
        particle.x = 32;
        particle.y = 20;
        this.addChild(particle);
        particle.playForever();
        var myLight = new Sprite('lightcookie_oval', {
          anchor: 'center'
        });
        myLight.x = this.x + this.width / 2 - 5;
        myLight.y = this.y + this.height / 2;
        game.tween(myLight, 'breathe');
        game.render.lights.addChild(myLight);
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_projectile_melee = {
    "sprite": 'projectile_melee',
    "meta": {
      "collisionGroups": 'collision_hurts_1',
      "physicsType": 'projectile'
    },
    "events": {
      "onCreate": function (item) {
        item.alpha = 1;
        var particle = new Particles('shootdebris');
        particle.playOnce();
        item._container.addChild(particle);
        const life = game.index.getFromIndex(item.data.creatorId, 'all');
        if (!life) return;
        if (life && life.aiming !== true) {
          life.toggleAim();
        }
        life.shoot();
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_ss_battery = {
    "meta": {
      "blockZone": 'all'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_door_jail = {
    "sprite": 'sprite_door_jail',
    "meta": {
      "blockZone": 'all',
      "physicsType": 'logic',
      "contextOptions": 'custom'
    },
    "events": {
      "onCreate": function (item) {
        item.addExtension('ext_door');
      },
      "onUpdate": function (item, oldData, newData) {}
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_pocketclone = {
    "meta": {},
    "events": {
      "onCreate": function (spawner) {
        var player = new LifeObject();
        player.x = spawner.x;
        player.y = spawner.y;
        player.setAnim('none/idle_down', true);
        player.data.static = true;
        player.data.big = true;
        game.render.lifeLayer.addChild(player);
        game.world.addObject(player);
        game.world.addToServer(player);
        player.setAnim('none/idle_down', true);
        player.setWep({
          sprite: 'blank',
          data: {
            stance: 'none'
          }
        });
        player.setBackWep({
          sprite: 'blank'
        });
        player.setMask({
          sprite: 'blank'
        });
        player.setBody({
          sprite: 'body_naked'
        });
        player.setBackpack({
          sprite: 'blank'
        });
        player.scale.x = 2;
        player.scale.y = 2;
        try {
          player.inventory.brain.addItem(new InventoryItem('ss_brain_clone_mk1'), true);
          player.inventory.body.addItem(new InventoryItem('ss_plate_armor'), true);
          player.inventory.mask.addItem(new InventoryItem('ss_mask_failedclone'), true);
        } catch (e) {}
        player.data.size = "xl";
        player.data.enraged = true;
        player.sync();
        player.pivot.x = -16;
        player.pivot.y = -16;
        game.lastp = player;
        spawner.destroy();
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_ss_campfire = {
    "meta": {
      "blockZone": 'all'
    },
    "events": {
      "onCreate": function (options) {
        var fire = game.render.createAnimatedSprite('anisprite_fire2');
        fire.x = 5;
        fire.y = 0;
        fire.alpha = 0.75;
        fire.scale.x = 0.8;
        fire.scale.y = 0.8;
        fire.animationSpeed = 0.1;
        this.addChild(fire);
        var particle = new Particles('fire_1');
        particle.x = 32;
        particle.y = 32;
        this.addChild(particle);
        particle.playForever();
        var particle = new Particles('smoke_3');
        particle.x = 32;
        particle.y = 20;
        this.addChild(particle);
        particle.playForever();
        var myLight = new Sprite('lightcookie_oval', {
          anchor: 'center'
        });
        myLight.x = this.x + this.width / 2 - 5;
        myLight.y = this.y + this.height / 2;
        game.tween(myLight, 'breathe');
        game.render.lights.addChild(myLight);
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_med_box = {
    "meta": {
      "blockZone": 'all',
      "contextOptions": 'loot'
    },
    "events": {
      "onCreate": function (furni) {
        if (game.editMode) {
          return false;
        }
        var hasSaveData = furni.data.inventory ? true : false;
        game.inventories.createInventoryForItem(furni, 4, 4, true);
        if (hasSaveData) {
          return;
        }
        var itemsLow = ['ss_item_bandage_small', 'ss_item_adhesive', 'ss_item_adhesive'];
        var itemsHigh = ['ss_item_bandage_large'];
        for (var i = 0; i < itemsLow.length; i++) {
          let codename = itemsLow[i];
          if (game.rng(0, 10) < 5) {
            furni.inventory.addItem(new InventoryItem(codename), true);
          }
        }
        if (game.rng(0, 1) == 1) {
          return false;
        }
        for (var i = 0; i < itemsHigh.length; i++) {
          let codename = itemsHigh[i];
          if (game.rng(0, 10) < 5) {
            furni.inventory.addItem(new InventoryItem(codename), true);
          }
        }
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_lamppost_large = {
    "meta": {
      "blockZone": 'bottom',
      "sort": 'true'
    },
    "events": {
      "onCreate": function (furni) {
        var myLight = new Sprite('sprite_light_triangle', {
          anchor: 'center'
        });
        myLight.scale.x = 0.8;
        myLight.scale.y = 0.8;
        myLight.alpha = 0.3;
        myLight.x = furni.width / 2;
        myLight.y = furni.height / 2 - 25;
        myLight.filters = [game.render.filters.bloom];
        furni.addChild(myLight);
        var myLight = new Sprite('cookie_light_triangle', {
          anchor: 'center'
        });
        myLight.scale.x = 2;
        myLight.scale.y = 2;
        myLight.x = furni.x + 64;
        myLight.y = furni.y + 80;
        game.render.lights.addChild(myLight);
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_techlight = {
    "sprite": 'sprite_techlight',
    "meta": {},
    "events": {
      "onCreate": function (furni) {
        var myLight = new Sprite('lightgreen_screenwhite', {
          anchor: 'center'
        });
        myLight.scale.x = 2.5;
        myLight.scale.y = 2.5;
        myLight.alpha = 0.2;
        myLight.x = 32;
        myLight.y = 32;
        myLight.filters = [game.render.filters.bloom];
        furni.addChild(myLight);
        var myLight = new Sprite('sprite_effect_light_cookie', {
          anchor: 'center'
        });
        myLight.scale.x = 1;
        myLight.scale.y = 1;
        myLight.x = furni.x;
        myLight.y = furni.y;
        game.render.lights.addChild(myLight);
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_yamalamppost = {
    "meta": {
      "sort": 'true'
    },
    "events": {
      "onCreate": function (furni) {
        var myLight = new Sprite('effect_light_cookie_y', {
          anchor: 'center'
        });
        myLight.scale.x = 0.8;
        myLight.scale.y = 0.8;
        myLight.alpha = 0.3;
        myLight.x = furni.width / 2;
        myLight.y = furni.height / 2 - 25;
        myLight.filters = [game.render.filters.bloom];
        furni.addChild(myLight);
        var myLight = new Sprite('lightcookie_oval', {
          anchor: 'center'
        });
        myLight.scale.x = 2;
        myLight.scale.y = 2;
        myLight.x = furni.x + 64;
        myLight.y = furni.y + 80;
        game.render.lights.addChild(myLight);
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_yamashortpost = {
    "meta": {
      "sort": 'true'
    },
    "events": {
      "onCreate": function (furni) {
        var myLight = new Sprite('effect_light_cookie_y', {
          anchor: 'center'
        });
        myLight.scale.x = 0.8;
        myLight.scale.y = 0.8;
        myLight.alpha = 0.3;
        myLight.x = furni.width / 2;
        myLight.y = furni.height / 2 - 25;
        myLight.filters = [game.render.filters.bloom];
        furni.addChild(myLight);
        var myLight = new Sprite('lightcookie_oval', {
          anchor: 'center'
        });
        myLight.scale.x = 2;
        myLight.scale.y = 2;
        myLight.x = furni.x + 64;
        myLight.y = furni.y + 80;
        game.render.lights.addChild(myLight);
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_uiicon_highquality = {
    "meta": {},
    "events": {
      "onCreate": function (item) {
        setTimeout(() => {
          item.destroy();
        }, 1000);
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_wood_table_v = {
    "sprite": 'sprite_wood_table_v',
    "meta": {
      "blockZone": 'left'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_wood_table_h = {
    "sprite": 'sprite_wood_table_h',
    "meta": {
      "blockZone": 'top'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_wood_bookcase = {
    "sprite": 'sprite_wood_bookcase',
    "meta": {
      "blockZone": 'top'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_craftbench2 = {
    "sprite": 'sprite_craftbench2',
    "meta": {
      "blockZone": 'all'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_w_weaponrack = {
    "sprite": 'w_weaponrack',
    "meta": {
      "blockZone": 'top'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_barricade_h = {
    "sprite": 'sprite_barricade_h',
    "meta": {
      "blockZone": 'all'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_barricade_v = {
    "sprite": 'sprite_barricade_v',
    "meta": {
      "blockZone": 'all'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_bed_shaded = {
    "sprite": 'sprite_bed_shaded',
    "meta": {
      "blockZone": 'top'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_solar_small = {
    "sprite": 'sprite_solar_small',
    "meta": {
      "blockZone": 'top'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_solar_large = {
    "sprite": 'sprite_solar_large',
    "meta": {
      "blockZone": 'all'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_ss_battery_tall = {
    "sprite": 'ss_battery_tall',
    "meta": {
      "blockZone": 'top'
    },
    "events": {},
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_blackdiamond_small = {
    "sprite": 'sprite_blackdiamond_small',
    "meta": {},
    "events": {
      "onCreate": function (obj) {
        game.tween(obj, 'levitate', {
          randomStart: true
        });
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_blackdiamond_small_2 = {
    "sprite": 'sprite_blackdiamond_small_2',
    "meta": {},
    "events": {
      "onCreate": function (obj) {
        game.tween(obj, 'levitate', {
          randomStart: true
        });
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_blackdiamond_3 = {
    "sprite": 'sprite_blackdiamond_3',
    "meta": {},
    "events": {
      "onCreate": function (obj) {
        game.tween(obj, 'levitate', {
          randomStart: true
        });
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_blackdiamond_4 = {
    "sprite": 'sprite_blackdiamond_3',
    "meta": {},
    "events": {
      "onCreate": function (obj) {
        game.tween(obj, 'levitate', {
          randomStart: true
        });
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_aimind_walt = {
    "sprite": 'sprite_aimind_walt',
    "meta": {
      "contextOptions": 'use'
    },
    "events": {
      "onCreate": function (walt) {
        walt.contextMenus['Chat'] = function (caller) {
          if (!caller.data.dead) {
            if (game.world.cDistance(game.p, caller) > 1250) {
              game.input.mouseMsg('Too far away');
              return false;
            }
            game.render.component("game_dialog", {
              dialog: 'dialog_walt',
              callerObject: walt
            }, "game_dialog");
          }
        };
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_container_4_v = {
    "sprite": 'container_4_v',
    "meta": {
      "blockZone": 'all',
      "physicsType": 'logic',
      "weight": 0,
      "contextOptions": 'loot'
    },
    "events": {
      "onCreate": function (item) {
        item.addExtension('ext_quick_lootable');
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_door_wooden = {
    "sprite": 'sprite_door_wooden',
    "meta": {
      "physicsType": 'logic',
      "weight": 0,
      "contextOptions": 'custom'
    },
    "events": {
      "onCreate": function (item) {
        item.addExtension('ext_door');
      },
      "onUpdate": function (item, oldData, newData) {}
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_door_saloon = {
    "sprite": 'sprite_door_saloon',
    "meta": {
      "physicsType": 'logic',
      "weight": 0,
      "contextOptions": 'custom',
      "persist": true
    },
    "events": {
      "onCreate": function (item) {
        item.addExtension('ext_door', {
          noLight: true
        });
      },
      "onUpdate": function (item, oldData, newData) {}
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_berloon = {
    "sprite": 'sprite_berloon',
    "meta": {},
    "events": {
      "onCreate": function (spawner) {
        const shadowSprite = new SimpleItem(spawner.codename);
        shadowSprite.filters = [new ABE.Filters.BlurFilter(8), new ABE.Filters.ColorOverlayFilter(0x000000, 0.5)];
        spawner.shadow = shadowSprite;
        shadowSprite.alpha = 0.25;
        shadowSprite.scale(-0.5);
        shadowSprite.pivot.set(0.5, 1);
        shadowSprite.skew.set(-0.5, 0);
        shadowSprite.position.set(spawner.x + shadowSprite.width * 2 - 32, spawner.y + 32);
        game.render.background.addChild(shadowSprite);
      }
    },
    "parent": 'si_extension_misc'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_boulder_1 = {
    "meta": {
      "blockZone": 'top',
      "physicsType": 'logic',
      "weight": 0,
      "contextOptions": 'gather'
    },
    "events": {
      "onCreate": function (item) {
        if (item.data.autoChop) {
          game.quickAdd(item.x, item.y, new ComplexItem('pers_chop_helper', {
            parentId: item.id
          }));
        }
        item.contextMenus["Auto-gather"] = () => {
          game.p.update({
            actionToggles: {
              gather: true
            }
          });
          item.data.autoChop = true;
          item.sync();
          game.quickAdd(item.x, item.y, new ComplexItem('pers_chop_helper', {
            parentId: item.id
          }));
        };
        item.gather = function (gatherer) {
          let qty = 1;
          if (gatherer.data.tool == 'stone_pickaxe') {
            qty = 2;
          }
          gatherer.xpAction('gatheredstone', item);
          if (gatherer.inventory.main.addResource('stone', qty * game.session.data.settings.lootMulti)) {
            return true;
          } else {
            return false;
          }
        };
      },
      "onUpdate": function (item, oldData, newData) {
        var gatherer = game.index.find(newData.gatherer);
        if (!gatherer) {
          return false;
        }
        gatherer.data.isTargeting = true;
        gatherer.shoot();
        game.tween(item, 'shake');
        var blood = new Particles('particles_fell_on_floor', 'item_stonepile');
        blood.x = item.x + 64;
        blood.y = item.y + 64;
        var scale = game.rng(0, 100);
        blood.scale.x = scale / 100;
        blood.scale.y = scale / 100;
        game.render.underLifeLayer.addChild(blood);
        item.nextSpit = Date.now() + 500;
        blood.playOnceAndDestroy();
      }
    },
    "parent": 'si_extension_resources'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_deviltongue_a = {
    "meta": {
      "physicsType": 'logic',
      "contextOptions": 'gather'
    },
    "events": {
      "onCreate": function (item) {
        item.gather = function (gatherer) {
          let qty = 1;
          if (gatherer.data.tool == 'stone_sickle') {
            qty = 2;
          }
          gatherer.xpAction('gatheredfabric', item);
          if (gatherer.inventory.main.addResource('fiber', qty * game.session.data.settings.lootMulti)) {
            return true;
          } else {
            return false;
          }
        };
      },
      "onUpdate": function (item, oldData, newData) {
        var gatherer = game.index.find(newData.gatherer);
        if (!gatherer) {
          return false;
        }
        gatherer.data.isTargeting = true;
        gatherer.shoot();
        game.tween(item, 'shake');
        var blood = new Particles('particles_fell_on_floor', 'sprite_deviltongue_item');
        blood.x = item.x + 64;
        blood.y = item.y + 64;
        var scale = game.rng(0, 100);
        blood.scale.x = scale / 100;
        blood.scale.y = scale / 100;
        game.render.underLifeLayer.addChild(blood);
        item.nextSpit = Date.now() + 500;
        blood.playOnceAndDestroy();
      }
    },
    "parent": 'si_extension_resources'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_tree_redfern = {
    "meta": {
      "blockZone": 'bottom',
      "physicsType": 'logic',
      "weight": 0,
      "contextOptions": 'gather'
    },
    "events": {
      "onCreate": function (item) {
        if (item.data.autoChop) {
          game.quickAdd(item.x, item.y, new ComplexItem('pers_chop_helper', {
            parentId: item.id
          }));
        }
        item.contextMenus["Auto-gather"] = () => {
          game.p.update({
            actionToggles: {
              gather: true,
              build: true
            }
          });
          item.data.autoChop = true;
          item.sync();
          game.quickAdd(item.x, item.y, new ComplexItem('pers_chop_helper', {
            parentId: item.id
          }));
        };
        item.gather = function (gatherer) {
          let qty = 1;
          if (gatherer.data.tool == 'stone_hatchet') {
            qty = 2;
          }
          gatherer.xpAction('gatheredwood', item);
          if (gatherer.inventory.main.addResource('wood', qty * game.session.data.settings.lootMulti)) {
            return true;
          } else {
            return false;
          }
        };
      },
      "onUpdate": function (item, oldData, newData) {
        var gatherer = game.index.find(newData.gatherer);
        if (!gatherer) {
          return false;
        }
        gatherer.data.isTargeting = true;
        gatherer.shoot();
        game.tween(item, 'shake');
        var blood = new Particles('particles_fell_on_floor', 'sprite_log_item');
        blood.x = item.x + 64;
        blood.y = item.y + 64;
        var scale = game.rng(0, 100);
        blood.scale.x = scale / 100;
        blood.scale.y = scale / 100;
        game.render.underLifeLayer.addChild(blood);
        item.nextSpit = Date.now() + 500;
        blood.playOnceAndDestroy();
      }
    },
    "parent": 'si_extension_resources'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_boulder_2 = {
    "sprite": 'sprite_boulder_2',
    "meta": {
      "blockZone": 'top',
      "physicsType": 'logic',
      "contextOptions": 'gather'
    },
    "events": {
      "onCreate": function (item) {
        item.gather = function (gatherer) {
          let qty = 1;
          let resource = 'stone';
          if (gatherer.data.tool == 'stone_pickaxe') {
            resource = 'redgem';
          }
          gatherer.xpAction('gatheredstone', item);
          if (gatherer.inventory.main.addResource(resource, qty * game.session.data.settings.lootMulti)) {
            return true;
          } else {
            return false;
          }
        };
      },
      "onUpdate": function (item, oldData, newData) {
        var gatherer = game.index.find(newData.gatherer);
        if (!gatherer) {
          return false;
        }
        gatherer.data.isTargeting = true;
        gatherer.shoot();
        game.tween(item, 'shake');
        var blood = new Particles('particles_fell_on_floor', 'item_stonepile');
        blood.x = item.x + 64;
        blood.y = item.y + 64;
        var scale = game.rng(0, 100);
        blood.scale.x = scale / 100;
        blood.scale.y = scale / 100;
        game.render.underLifeLayer.addChild(blood);
        item.nextSpit = Date.now() + 500;
        blood.playOnceAndDestroy();
      }
    },
    "parent": 'si_extension_resources'
  };
  _BLUEPRINTS.SIMPLE_EXT.e_sprite_boulder_3 = {
    "sprite": 'sprite_boulder_3',
    "meta": {
      "blockZone": 'top',
      "physicsType": 'logic',
      "contextOptions": 'gather'
    },
    "events": {
      "onCreate": function (item) {
        if (item.data.autoChop) {
          game.quickAdd(item.x, item.y, new ComplexItem('pers_chop_helper', {
            parentId: item.id
          }));
        }
        item.contextMenus["Auto-gather"] = () => {
          item.data.autoChop = true;
          item.sync();
          game.quickAdd(item.x, item.y, new ComplexItem('pers_chop_helper', {
            parentId: item.id
          }));
        };
        item.gather = function (gatherer) {
          let qty = 1;
          let resource = 'metalore';
          if (gatherer.data.tool == 'stone_pickaxe') {
            resource = 'redgem';
          }
          gatherer.xpAction('gatheredstone', item);
          if (gatherer.inventory.main.addResource(resource, qty * game.session.data.settings.lootMulti)) {
            return true;
          } else {
            return false;
          }
        };
      },
      "onUpdate": function (item, oldData, newData) {
        var gatherer = game.index.find(newData.gatherer);
        if (!gatherer) {
          return false;
        }
        gatherer.data.isTargeting = true;
        gatherer.shoot();
        game.tween(item, 'shake');
        var blood = new Particles('particles_fell_on_floor', 'item_stonepile');
        blood.x = item.x + 64;
        blood.y = item.y + 64;
        var scale = game.rng(0, 100);
        blood.scale.x = scale / 100;
        blood.scale.y = scale / 100;
        game.render.underLifeLayer.addChild(blood);
        item.nextSpit = Date.now() + 500;
        blood.playOnceAndDestroy();
      }
    },
    "parent": 'si_extension_resources'
  };
})();
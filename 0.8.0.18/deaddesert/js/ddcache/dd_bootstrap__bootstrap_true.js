bootStrap.push(function () {
  game.ee.on('inventory-removeitem', function (options) {});
});
bootStrap.push(function () {
  game.cull = {};
  game.cull.batch = 250;
  game.cull.count = -1;
  game.cull.cullCheck = function (item) {
    if (!item || !item.transform) return;
    if (item.destroyed || item._destroyed || item._destroying) {
      item.renderable = false;
      item.visible = false;
    }
    let tl = game.render.viewport.toWorld(0, 0);
    let br = game.render.viewport.toWorld(game.ui._VIEWPORT_RIGHT, game.ui._VIEWPORT_BOTTOM);
    let bounds = {
      width: 250,
      height: 250
    };
    let {
      x,
      y
    } = item;
    tl.x -= 500;
    tl.y -= 500;
    br.x += 500;
    br.y += 500;
    item.renderable = true;
    item.visible = true;
    if (x + bounds.width < tl.x || y + bounds.height < tl.y || x > br.x || y > br.y) {
      item.renderable = false;
      item.visible = false;
      return true;
    }
    return false;
  };
  game.setTicker('cull', function () {
    game.cull.count++;
    var items = game.index.getIndex('cull');
    var keys = Object.keys(items);
    var batches = Math.ceil(keys.length / game.cull.batch);
    if (game.cull.count > batches) {
      game.cull.count = -1;
      return;
    }
    var start = game.cull.count * game.cull.batch;
    for (var c = start; c < start + game.cull.batch; c++) {
      if (!items[keys[c]]) {
        continue;
      }
      game.cull.cullCheck(items[keys[c]]);
    }
  });
});
bootStrap.push(function () {
  game.setTicker('update-selected-box', function () {
    if (!game.editMode) {
      return false;
    }
    if (game.selectedObject && game.selectedObject._destroyed) game.selectedObject = false;
    if (game.selectedObject !== undefined && game.selectedObject !== false) {
      game.watcherBox.alpha = 1;
      if (game.selectedObject.class == 'LifeObject') {
        game.watcherBox.x = game.selectedObject.x;
        game.watcherBox.y = game.selectedObject.y;
      } else {
        game.watcherBox.x = game.selectedObject.x - 8;
        game.watcherBox.y = game.selectedObject.y - game.watcherBox.height + 32 + 8;
      }
    }
  });
  game.select = function (selectObject) {
    if (game.watcherBox) {
      game.watcherBox.destroy();
    }
    if (selectObject.class == 'LifeObject') {
      game.watcherBox = game.render.component('squareWBorder', {
        x: 0,
        y: 0,
        w: 64,
        h: 64
      });
    } else {
      game.watcherBox = game.render.component('squareWBorder', {
        x: 0,
        y: 0,
        w: selectObject.width + 16,
        h: selectObject.height + 16
      });
    }
    game.render.aboveLife.addChild(game.watcherBox);
    game.selectedObject = selectObject;
    game.ee.emit('object_selected', selectObject);
  };
});
bootStrap.push(function () {
  game.ee.on('newgame-init', function (options) {
    let x = game.urlVar("x");
    let y = game.urlVar("y");
    if (game.spawnPoint) {
      x = game.spawnPoint[0];
      y = game.spawnPoint[1];
    }
    game.saves.unload();
    game.grid.loadFirstChunk(x, y);
    game.slot = options.slot;
    game.fs.setFolder(options.slot, true);
    game.session.newGame();
    game.audio.play('windLoop');
    game.ui.mainUI();
    game.play = true;
  });
});
bootStrap.push(function () {
  game.ee.on('world-rightclick-up', function () {
    if (!game.p.id) {
      return;
    }
    var particle = new Particles('pop');
    particle.playOnceAndDestroy();
    particle.x = game.screenMouseX;
    particle.y = game.screenMouseY;
    game.render.aboveAll.addChild(particle);
    game.ui.contextMenuShowing = false;
    setTimeout(() => {
      if (game.index.indexCount('context_menus') > 0) {
        return false;
      }
      game.session.setAllCommand('moveto', {
        x: game.mouseX,
        y: game.mouseY
      });
    }, 100);
  });
});
bootStrap.push(function () {
  game.ee.on('world-rightclick-up', function () {
    if (game.input.dblTimer > Date.now() - 400) {
      game.ee.emit('right-doubleclick', event);
      game.input.dRClick = true;
    }
    game.input.dblTimer = Date.now();
    game.input.rClick = true;
  });
});
bootStrap.push(function () {
  game.ee.on('world-middleclick-down', function () {
    game.cameraFollow = false;
  });
});
bootStrap.push(function () {
  game.ee.on('newgame-clicked', function (options) {
    try {
      game.ee.emit('newgame-init', options);
    } catch (e) {}
  });
});
bootStrap.push(function () {
  game.ee.on('keyup-Escape', function (life) {
    game.render.aboveAll.addChild(game.render.component('frontMenu', {
      close: true
    }, 'frontMenu'));
  });
});
bootStrap.push(function () {
  game.ee.on('inventory-removeitem', function (options) {});
});
bootStrap.push(function () {
  game.playerGlobals = {};
  game.playerGlobals.weaponType = 'fist';
  game.playerGlobals.shootType = 'spray';
  game.playerGlobals.stance = 'walk';
});
bootStrap.push(function () {
  game.customRenderReady = function () {};
});
bootStrap.push(function () {
  game.ui.addEditorStuff = function () {
    var toggles = game.render.component('admin_hud_toggles');
    toggles.x = 20;
    toggles.y = 75;
    game.render.aboveAll.addChild(toggles);
  };
  game.ee.on('leveleditor-init', function (options) {
    game.editMode = true;
    setTimeout(function () {
      game.render.viewport.x = -(64 * 10 * game.urlVar('x'));
      game.render.viewport.y = -(64 * 10 * game.urlVar('y'));
      game.resume();
      game.grid.loadFirstChunk(game.urlVar('x'), game.urlVar('y'));
    }, 1000);
    game.ui.mainUI();
    game.ui.addEditorStuff();
    game.setBuildMode();
    if (game.urlVar('more')) {
      game.setTicker('lifeList', showLifeList);
    }
    game.ee.on('itemcontainer_created', function (item) {
      item.enableEvents();
      item.on('pointerup', function () {
        if (game.input.isDown(189)) {
          this.scale(-0.05);
        }
        if (game.input.isDown(187)) {
          this.scale(0.05);
        }
        if (game.input.isDown(88)) {
          this.markDelete();
        }
        if (game.input.isDown(82)) {
          this.rotate(0.1);
        }
        if (game.input.isDown(39)) {
          this.x++;
        }
        if (game.input.isDown(37)) {
          this.x--;
        }
        if (game.input.isDown(38)) {
          this.y--;
        }
        if (game.input.isDown(40)) {
          this.y++;
        }
        if (game.input.isDown(69)) {
          this.rotate(-0.1);
        }
      });
    });
    game.ee.on('lifeobject_created', function (life) {
      life.enableEvents();
      life.on('pointerup', function (e) {
        if (game.input.isDown(189)) {
          this.scale(-0.05);
        }
        if (game.input.isDown(187)) {
          this.scale(0.05);
        }
        if (game.input.isDown(88)) {
          this.markDelete();
        }
        if (game.input.isDown(82)) {
          this.rotate(0.1);
        }
        if (game.input.isDown(39)) {
          this.x += 32;
        }
        if (game.input.isDown(37)) {
          this.x -= 32;
        }
        if (game.input.isDown(38)) {
          this.y -= 32;
        }
        if (game.input.isDown(40)) {
          this.y += 32;
        }
        if (game.input.isDown(68)) {
          this.x++;
        }
        if (game.input.isDown(65)) {
          this.x--;
        }
        if (game.input.isDown(87)) {
          this.y--;
        }
        if (game.input.isDown(83)) {
          this.y++;
        }
        if (game.input.isDown(191)) {
          this.x += game.rng(-32, 32);
          this.y += game.rng(-32, 32);
        }
        if (game.input.isDown(69)) {
          this.rotate(-0.1);
        }
        if (game.input.isDown(75)) {
          this.data.dead = true;
          this.setAnim('none/dead_1', true);
        }
        if (game.input.isDown(49)) {
          game.clone1 = JSON.parse(JSON.stringify(this));
        }
      });
    });
  });
});
bootStrap.push(function () {
  game.c = 0;
  game.ee.on('grid-loading', function () {
    game.c++;
    if (game.c > 1) {
      return false;
    }
    game.hider = new UIPane();
    game.hider.x = 0;
    game.hider.y = 0;
    game.hider.width = game.ui._VIEWPORT_RIGHT;
    game.hider.height = game.ui._VIEWPORT_BOTTOM;
    game.render.aboveAll.addChild(game.hider);
    let text = game.render.text('Loading the dead desert... \n\n\n');
    game.render.loadingInfo = text;
    text.x = 100;
    text.y = 100;
    game.hider.addChild(text);
    game.hider.alpha = 1;
    game.hider.enableEvents();
  });
  game.ee.on('grid-loaded', function () {
    game.hider.alpha = 0;
    game.hider.interactive = false;
    game.hider.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
  });
});
bootStrap.push(function () {
  game.ee.on('itemcontainer_created', function (item) {
    if (!game.editMode && (!item.meta || !item.meta.contextOptions) && (!item.contextMenus || !Object.keys(item.contextMenus).length)) {
      return;
    }
    item.enableEvents();
    item.on('pointerover', function (e) {
      if (!this.filters) {
        this.filters = [];
      }
      this.filters.push(new ABE.Filters.OutlineFilter(2, 0x99ff99));
    });
    item.on('pointerout', function (e) {
      this.filters.pop();
    });
    item.on('pointerup', function (e) {
      game.select(this);
      if (game.input.isRightClick(e)) {
        e.stopPropagation();
        var contextMenuLinks = {};
        var name = this.name || this.data.name || this.readName || this.codename || 'Container';
        if (game.editMode) {
          contextMenuLinks['Edit Instance'] = function (caller) {
            caller.settingsContainer = game.render.componentRaw('settings_dialog', {
              callerObject: caller,
              settings: ['id', 'codename', 'group', 'blockX', 'blockY', 'persist', 'persistId', 'class', 'locked', 'alpha', 'spriteName', 'physicsType', 'usedata1', 'usedata2', 'usedata3']
            });
            caller.settingsContainer.x = game.render._VIEWPORT_RIGHT / 2 - caller.settingsContainer.width / 2;
            caller.settingsContainer.y = game.render._VIEWPORT_BOTTOM / 2 - caller.settingsContainer.height / 2;
            game.render.aboveAll.addChild(caller.settingsContainer);
          };
          contextMenuLinks['Edit Base'] = function (caller) {
            const comp = game.render.component('component_iframe_item_editor', {
              editItem: caller
            });
            game.render.aboveAll.addChild(comp);
            comp.x = game.render._VIEWPORT_RIGHT / 2 - comp.width / 2;
            comp.y = game.render._VIEWPORT_BOTTOM / 2 - comp.height / 2;
          };
          contextMenuLinks['Clone'] = function (caller) {
            game.util.placeObject(caller);
          };
          contextMenuLinks['Delete'] = function (caller) {
            caller.markDelete();
          };
          if (this.meta.contextOptions && this.meta.contextOptions.includes('loot')) {
            contextMenuLinks['[A] Open'] = function (caller) {
              caller.showInventory();
            };
          }
        }
        if (this.meta.contextOptions && this.meta.contextOptions.includes('loot')) {
          contextMenuLinks['Open'] = function (caller) {
            game.p.update({
              command: 'loot',
              do: 'opencontainer',
              gotoId: caller.id
            });
          };
        }
        if (this.meta.contextOptions && this.meta.contextOptions.includes('gather')) {
          contextMenuLinks['Gather'] = function (caller) {
            if (game.world.cDistance(game.p, caller) > 11000 && !game.editMode) {
              game.input.mouseMsg('Too far away');
            } else {
              game.p.update({
                do: 'gather',
                gatherId: caller.id
              });
            }
          };
        }
        if (this.meta.contextOptions && this.meta.contextOptions.includes('hack')) {
          contextMenuLinks['Hack'] = function (caller) {
            if (game.world.cDistance(game.p, caller) > 115) {
              game.input.mouseMsg('Too far away');
            } else {}
          };
        }
        if (this.meta.contextOptions && this.meta.contextOptions.includes('use')) {
          contextMenuLinks['Use'] = function (caller) {
            game.p.update({
              command: 'use',
              do: 'use',
              gotoId: caller.id
            });
          };
        }
        if (this.meta.contextOptions && this.meta.contextOptions.includes('pickup')) {
          contextMenuLinks['Pick up'] = function (caller) {
            if (game.world.cDistance(game.p, caller) > 115) {
              game.input.mouseMsg('Too far away');
            } else {}
          };
        }
        if (this.contextMenus) {
          contextMenuLinks = game.merge(contextMenuLinks, this.contextMenus);
        }
        if (Object.keys(contextMenuLinks).length == 0) {
          return false;
        }
        var contextMenu = game.render.componentRaw('context_menu', {
          callerObject: this,
          links: contextMenuLinks
        });
        game.render.aboveAll.addChild(contextMenu);
        var updateTo = game.render.viewport.toScreen(contextMenu.x, contextMenu.y);
        contextMenu.x = updateTo.x;
        contextMenu.y = updateTo.y;
        return false;
      }
    });
  });
});
bootStrap.push(function () {
  game.ee.on('lifeobject_created', function (life) {
    life.on('pointerup', function () {
      game.select(this);
    });
  });
  game.ee.on('lifeobject_created', function (life) {
    life.enableEvents();
    life.on('pointerover', function (e) {
      this.filters = [new ABE.Filters.OutlineFilter(2, 0x99ff99)];
    });
    life.on('pointerout', function (e) {
      this.filters = [];
    });
    life.on('pointerup', function (e) {
      if (this.lastClick > Date.now() - 400) {
        if (game.input.isLeftClick(e) && game.session.isPlayerPawn(this)) {
          game.cameraFollow = this;
        }
      }
      this.lastClick = Date.now();
      if (game.input.isLeftClick(e) && game.session.isPlayerPawn(this)) {
        game.session.deselectPawns();
        game.session.setMainPawn(this);
        game.session.selectPawn(this);
        game.watching = this;
      } else {
        game.watching = this;
        game.offloader.helper.world('setWatching', {
          id: this.id
        });
      }
      if (game.input.isMiddleClick(e)) {
        this.saySomething();
      }
      if (game.input.isRightClick(e)) {
        game.audio.playSticky(this, 'ding');
        var contextMenuLinks = {
          ...this.contextMenus
        } || {};
        if (game.editMode) {
          contextMenuLinks[this.data.name] = function (caller) {
            var settingsContainer = game.render.componentRaw('settings_dialog', {
              callerObject: caller,
              settings: ['name', 'dir', 'dialog', 'faction', 'bounty', 'dynamicLevel', 'usedata1', 'usedata2', 'usedata3', 'age', 'chr', 'str', 'spd', 'cft', 'svg', 'tgh']
            });
            game.render.aboveAll.addChild(settingsContainer);
          };
        }
        if (game.editMode || game.session.isPlayerPawn(this) || this.data.ko || this.data.dead) {
          contextMenuLinks['Inventory'] = function (caller) {
            caller.showInventory();
            if (game.p && typeof game.p.showInventory == 'function') {
              game.p.showInventory();
            }
          };
        }
        if (this.data.drivingId) {
          contextMenuLinks['Stop Driving'] = function (caller) {
            caller.stopDriving();
          };
        }
        if (this.data.dialog && !this.data.dead) {
          contextMenuLinks['Chat'] = function (caller) {
            if (!caller.data.dead) {
              if (game.world.cDistance(game.p, caller) > 250) {
                game.input.mouseMsg('Too far away');
                return false;
              }
              caller.chat();
            }
          };
        }
        if (this.data.do == "becarried") {
          contextMenuLinks['Drop'] = function (caller) {
            game.p.stopCarrying(caller);
          };
        } else if (game.p && game.p.data.hasRope && (this.data.ko || this.data.dead)) {
          contextMenuLinks['Carry'] = function (caller) {
            game.p.carry(caller);
          };
        }
        contextMenuLinks['Follow'] = function (caller) {
          game.session.setAllCommand('follow', {
            leaderId: caller.id
          });
        };
        if (!game.editMode && game.urlVar('hideUI') !== true) {
          contextMenuLinks['Attack'] = function (caller) {
            game.session.setAllCommand('attack', {
              targetId: caller.id
            });
          };
        }
        if (this.data.bounty && typeof this.data.bounty === "object" && this.data.bounty.value > 0 && this.data.dead) {
          contextMenuLinks['Take Bounty'] = function (caller) {
            if (game.world.dist(game.p, caller) > 200) {
              game.notify("Too far");
              return;
            }
            let item = new InventoryItem('ss_item_bountyhead');
            item.data.bounty = caller.data.bounty;
            item.data.name = "Head of " + caller.data.name;
            if (game.p.inventory.main.addItemNow(item)) {
              caller.data.bounty = false;
              caller.inventory.mask.addItemNow({
                sprite: 'blank'
              });
            } else {
              game.notify("Inventory full");
            }
          };
        }
        if (this.id == game.p.id) {
          delete contextMenuLinks['Attack'];
          delete contextMenuLinks['Chat'];
        }
        var contextMenu = game.render.componentRaw('context_menu', {
          callerObject: this,
          links: contextMenuLinks
        });
        game.render.aboveAll.addChild(contextMenu);
        var updateTo = game.render.viewport.toScreen(contextMenu.x, contextMenu.y);
        contextMenu.x = updateTo.x;
        contextMenu.y = updateTo.y;
        return false;
      }
    });
  });
});
bootStrap.push(function () {
  if (game.urlVar("cheat")) {
    game.ee.once("set_main_pawn", () => {
      runCheats(game.urlVar("cheat"));
    });
  }
});
bootStrap.push(function () {
  game.setTicker('lifetick', function () {
    var lives = game.index.getIndex('life');
    for (var lifeId in lives) {
      try {
        lives[lifeId].tick();
      } catch (e) {
        delete lives[lifeId];
      }
    }
  });
});
bootStrap.push(function () {
  game.rDownLastCheck = Date.now();
  game.setTicker('checkRDown', function () {
    if (!game.rDown) {
      return false;
    }
    if (game.rDownLastCheck < Date.now() - 1000) {
      game.rDownLastCheck = Date.now();
    }
  });
  game.mDownLastCheck = Date.now();
  game.setTicker('checkMDown', function () {
    if (!game.mDown) {
      return false;
    }
    if (game.mDownLastCheck + 200 < Date.now()) {
      game.ee.emit('middleclick-up');
      game.mDownLastCheck = Date.now();
    }
  });
});
bootStrap.push(function () {
  game.findPath = function (startx, starty, endx, endy) {
    game.offloader.do(this, 'findpath', {
      startx: startx,
      starty: starty,
      endx: endx,
      endy: endy
    }, function (res) {});
  };
});
bootStrap.push(function () {
  game.ui.displayInventory = function (name, inventory) {
    var pane = new UIContainer();
    var label = game.render.text(name, 'ingame-label');
    inventory.getInventoryGrid(pane);
    inventory.gridComponent.y = 10;
    pane.addChild(label);
    pane.addChild(inventory.gridComponent);
    return pane;
  };
  game.ui.displayInventoryAsSlot = function (name, inventory, disabled) {
    var pane = new UIContainer();
    var label = game.render.text(name, 'ingame-label');
    label.x = 10;
    inventory.getInventoryGrid(pane, disabled);
    pane.addChild(label);
    pane.addChild(inventory.gridComponent);
    return pane;
  };
  game.ui.showLifeInventory = function (life) {
    var uiContainer = new UIContainer();
    game.render.aboveAll.addChild(uiContainer);
    var offsetX = 50;
    var offsetY = 90;
    var xGap = 150;
    var yGap = 150;
    var pane = game.render.component('drawBoxPane', {
      onTop: true,
      showX: true,
      name: 'test',
      title: 'Inventory',
      x: 10,
      y: 10,
      w: 470,
      h: 500
    });
    uiContainer.addChild(pane);
    var inv = game.ui.displayInventoryAsSlot('WEAPON', life.inventory.weapon);
    inv.x = offsetX;
    inv.y = offsetY;
    uiContainer.addChild(inv);
    var inv = game.ui.displayInventoryAsSlot('MASK', life.inventory.mask);
    inv.x = offsetX + xGap;
    inv.y = offsetY;
    uiContainer.addChild(inv);
    var inv = game.ui.displayInventoryAsSlot('BACK WEAPON', life.inventory.backWeapon);
    inv.x = offsetX;
    inv.y = offsetY + yGap;
    uiContainer.addChild(inv);
    var inv = game.ui.displayInventoryAsSlot('ARMOR', life.inventory.body);
    inv.x = offsetX + xGap;
    inv.y = offsetY + yGap;
    uiContainer.addChild(inv);
    var inv = game.ui.displayInventoryAsSlot('BACKPACK', life.inventory.backPack);
    inv.x = offsetX;
    inv.y = offsetY + yGap + yGap;
    uiContainer.addChild(inv);
    var inv = game.ui.displayInventoryAsSlot('INVENTORY', life.inventory.main);
    inv.x = offsetX + xGap + xGap - 30;
    inv.y = offsetY;
    uiContainer.addChild(inv);
  };
  game.showLifeList = function () {
    if (game.rng(0, 100) < 90) {
      return false;
    }
    var newString = JSON.stringify(game.index.getIndex('all'));
    if (game.last == newString) {
      return false;
    }
    game.last = newString;
    $("#lifelist").remove();
    $("#viewport").css('float', 'left');
    $("#viewport").prepend(`
            <div
                id='lifelist'
                style='
                    float: left;
                    padding: 20px;
                    border-right: 2px solid white;
                    z-index: 1000000;
                    background-color: #1d1d1d;
                    min-width: 300px;
                    min-height: 100px;
                    top: 25px;
                    left: 25;
                    height: 100%;
                    font-family: Calibri !important;
                    font-size: 8;    
                '>
            </div>
        `);
    $("#lifelist").append("<h3>Life</h3>");
    $("#lifelist").append("<ul id='lifelist-ul'></ul>");
    var l = game.index.getIndex('life');
    var c = 0;
    for (var k in l) {
      i = l[k];
      c++;
      var x = Math.ceil(i.x) / 10;
      var y = Math.ceil(i.y) / 10;
      var id = i.id.substring(i.id.length - 6);
      var n = `
                <span style='font-size: 6;width:50px;word-break:break-all'>
                   ${id}
                </span>
            `;
      var alpha = i.alpha == 0 ? "<span style='color:green;'>Hidden</span>" : "";
      $("#lifelist-ul").append(`<li id='${c}' data-guid='${i.id}'>${k}<br />- ${alpha} ${n} ${x} ${y}</li>`);
      $("#" + c).off();
      $("#" + c).on('click', function (e) {
        var guid = $(this).data('guid');
        var life = game.index.getFromIndex(guid, 'life');
        life.emit('pointerup', e);
      });
    }
    $("#lifelist").append("<hr /><h3>Objects</h3>");
    $("#lifelist").append(`
          <ul 
            id='objectlist-ul'
            style='height: 600px;overflow-y: scroll;'
          >
          </ul>
        `);
    var l = game.index.getIndex('objects');
    var c = 0;
    var known = {};
    for (var k in l) {
      i = l[k];
      if (known[i.codename]) {
        known[i.codename]++;
        continue;
      } else {
        known[i.codename] = 1;
      }
      c++;
      var x = Math.ceil(i.x) / 10;
      var y = Math.ceil(i.y) / 10;
      var id = i.id.substring(i.id.length - 6);
      var n = `
                <span style='font-size: 6;width:50px;word-break:break-all'>
                   ${id}
                </span>
            `;
      var alpha = i.alpha == 0 ? "<span style='color:green;'>Hidden</span>" : "";
      $("#objectlist-ul").append(`<li id='${c}' data-guid='${i.id}'>${i.codename} ${known[i.codename]}</li>`);
      $("#" + c).off();
      $("#" + c).on('click', function (e) {
        var guid = $(this).data('guid');
        var life = game.index.getFromIndex(guid, 'life');
        life.emit('pointerup', e);
      });
    }
  };
});
bootStrap.push(function () {
  game.ui.scenes.lvleditor = {
    "startup": function () {
      game.ee.emit('leveleditor-init');
    }
  };
  game.ui.scenes.lvltest = {
    "startup": function () {
      game.ee.emit('newgame-init', {
        slot: 'lvltest'
      });
    }
  };
  game.ui.scenes.newgame = {
    "startup": function () {
      var level = game.startLevel;
      game.ui.attachEvents();
      if (level.length > 0) {
        game.saves.unload();
        $.getJSON(game.folder + 'levels/' + level + '.json', game.saves.loadLevel).fail(game.DD.start);
      } else {}
    }
  };
});
bootStrap.push(function () {
  game.pawnSelector = {};
  game.pawnSelector.getPawns = function () {
    let startX = this.x;
    let endX = this.endX;
    let startY = this.y;
    let endY = this.endY;
    if (this.endX < startX) {
      startX = this.endX;
      endX = this.x;
    }
    if (this.endY < startY) {
      startY = this.endY;
      endY = this.y;
    }
    let worldStart = game.render.viewport.toWorld(startX, startY);
    let worldEnd = game.render.viewport.toWorld(endX, endY);
    let pawns = game.session.getPlayerPawns();
    let ids = Object.keys(pawns);
    let cleared = false;
    for (let i = 0; i < ids.length; i++) {
      let pawn = pawns[ids[i]];
      if (game.simpleCollision(pawn, {
        x: worldStart.x,
        y: worldStart.y,
        width: worldEnd.x - worldStart.x,
        height: worldEnd.y - worldStart.y
      })) {
        if (!cleared) {
          game.session.deselectPawns();
          cleared = true;
        }
        game.session.selectPawn(pawn);
      }
    }
  };
  game.pawnSelector.square = false;
  game.ee.on('world-leftclick-down', function () {
    game.pawnSelector.down = true;
    game.pawnSelector.x = game.screenMouseX;
    game.pawnSelector.y = game.screenMouseY;
  });
  game.ee.on('leftclick-up', function () {
    game.pawnSelector.down = false;
    if (game.pawnSelector.square) {
      game.pawnSelector.square.destroy();
      game.pawnSelector.square = false;
    }
  });
  game.setTicker('pawn_pawnSelector', function () {
    if (!game.pawnSelector.down) {
      return false;
    }
    game.pawnSelector.endX = game.screenMouseX;
    game.pawnSelector.endY = game.screenMouseY;
    if (!game.pawnSelector.square) {
      game.pawnSelector.square = new UIPane();
      let innerPane = new UIPane({
        fill: 0xffffff
      });
      game.pawnSelector.square.addChild(innerPane);
      innerPane.x = 5;
      innerPane.y = 5;
      innerPane.width = game.pawnSelector.square.width;
      innerPane.height = game.pawnSelector.square.height;
      game.pawnSelector.square.alpha = 0.2;
      game.render.aboveAll.addChild(game.pawnSelector.square);
    }
    game.pawnSelector.square.x = game.pawnSelector.x;
    game.pawnSelector.square.y = game.pawnSelector.y;
    game.pawnSelector.square.width = game.pawnSelector.endX - game.pawnSelector.x;
    game.pawnSelector.square.height = game.pawnSelector.endY - game.pawnSelector.y;
    if (game.pawnSelector.square.width < 10 && game.pawnSelector.square.height < 10) {
      return;
    }
    try {
      game.pawnSelector.getPawns();
    } catch (e) {}
  });
});
bootStrap.push(function () {
  game.alias = {};
  game.alias.saveName = {};
  game.alias.saveDisableads = 'disableads';
  game.alias.saveDefaultname = 'save';
  game.alias.saveFile = 'mainsave';
  game.alias.savePrefix = 'arcadebuilder';
  game.alias.saveSpeedtools = 'speedtools';
  game.alias.get = function (name) {
    return game.alias[name] || name;
  };
});
bootStrap.push(function () {
  game.pawnMover = {};
  game.pawnMover.check = function (x, y, cache) {
    if (cache[x + "_" + y]) {
      return false;
    }
    if (game.grid.isBlocked(x, y)) {
      return false;
    }
    return true;
  };
  game.pawnMover.cache = {};
  game.pawnMover.positions = [];
  game.setTicker('pawn-positioner', function () {
    mouseX = game.screenMouseX;
    mouseY = game.screenMouseY;
    grid = game.render.viewport.toWorld(mouseX, mouseY);
    grid.x = game.gridPos(grid.x);
    grid.y = game.gridPos(grid.y);
    if (grid.x == game.pawnMover.lastX && grid.y == game.pawnMover.lastY) {
      return false;
    }
    game.pawnMover.lastX = grid.x;
    game.pawnMover.lastY = grid.y;
    worldX = game.atGridPos(grid.x);
    worldY = game.atGridPos(grid.y);
    let pawns = game.session.getSelectedPawns();
    let pawnCount = Object.keys(pawns).length;
    if (pawnCount === 0) {
      return false;
    }
    let posX = grid.x;
    let posY = grid.y;
    let dir = 'left';
    let cache = game.pawnMover.cache;
    let cacheKeys = Object.keys(cache);
    for (let i = 0; i < cacheKeys.length; i++) {
      cache[cacheKeys[i]].alpha = 0;
      cache[cacheKeys[i]].destroy();
    }
    game.pawnMover.cache = {};
    cache = {};
    game.pawnMover.positions = [];
    let i = -1;
    while (pawnCount > 0) {
      i++;
      if (game.pawnMover.check(posX, posY, game.pawnMover.cache)) {
        let square1 = new UIPane();
        square1.alpha = 0;
        game.pawnMover.cache[posX + "_" + posY] = square1;
        square1.x = game.atGridPos(posX);
        square1.y = game.atGridPos(posY);
        square1.width = 64;
        square1.height = 64;
        game.pawnMover.positions.push({
          x: game.atGridPos(posX),
          y: game.atGridPos(posY)
        });
        pawnCount--;
      }
      if (dir == 'left') {
        if (game.pawnMover.check(posX, posY - 1, game.pawnMover.cache)) {
          posY--;
          dir = 'up';
          continue;
        }
        if (game.pawnMover.check(posX - 1, posY, game.pawnMover.cache)) {
          posX--;
          continue;
        } else {
          dir = 'up';
          posY++;
          continue;
        }
      }
      if (dir == 'up') {
        if (game.pawnMover.check(posX + 1, posY, game.pawnMover.cache)) {
          posX++;
          dir = 'right';
          continue;
        }
        if (game.pawnMover.check(posX, posY - 1, game.pawnMover.cache)) {
          posY--;
          continue;
        } else {
          dir = 'right';
          posX++;
          continue;
        }
      }
      if (dir == 'right') {
        if (game.pawnMover.check(posX, posY + 1, game.pawnMover.cache)) {
          posY++;
          dir = 'down';
          continue;
        }
        if (game.pawnMover.check(posX + 1, posY, game.pawnMover.cache)) {
          posX++;
          continue;
        } else {
          dir = 'down';
          posY++;
          continue;
        }
      }
      if (dir == 'down') {
        if (game.pawnMover.check(posX - 1, posY, game.pawnMover.cache)) {
          posX--;
          dir = 'left';
          continue;
        }
      }
      if (game.pawnMover.check(posX, posY + 1, game.pawnMover.cache)) {
        posY++;
        continue;
      } else {
        dir = 'left';
        posX--;
        continue;
      }
    }
  });
});
bootStrap.push(function () {
  class PixelCircle {
    constructor(x, y, rad, callback, iterations) {
      iterations = iterations || 1;
      let deg = 0;
      let blocked = {};
      for (let i = 0; i < 360; i += 360 / iterations) {
        deg++;
        let angleX = Math.floor(x + rad * Math.cos(deg));
        let angleY = Math.floor(y + rad * Math.sin(deg));
        let key = angleX + "-" + angleY;
        if (blocked[key]) {
          continue;
        }
        callback(angleX, angleY);
        blocked[key] = true;
      }
    }
  }
  game.quickSpawn = {};
  game.loopy2 = function () {
    let x = 10;
    let y = 10;
    let degIncrease = 10;
    game.degree = game.degree ? game.degree + degIncrease : 0;
    new PixelCircle(x, y, rad, game.quickSpawn.fire, 90);
    setTimeout(game.loopy2, 100);
  };
  game.loopy = function () {
    game.radX = game.radX ? game.radX : 10;
    game.radY = game.radY ? game.radY : 10;
    if (!game.rad) {
      game.rad = 0;
    }
    if (game.radAsc == undefined) {
      game.radAsc = true;
    }
    if (game.rad > 10) {
      game.radAsc = false;
      game.radX += game.rng(-2, 1);
      game.radY += game.rng(-2, 1);
    }
    if (game.rad < 0) {
      game.radAsc = true;
    }
    game.rad += game.radAsc ? 1 : -1;
    game.quickSpawn.fireCircle(game.radX, game.radY, game.rad);
    setTimeout(game.loopy, 100);
  };
  game.quickSpawn.fireCircle = function (x, y, rad) {
    let circle = new PixelCircle(x, y, rad, game.quickSpawn.fire, 90);
  };
  game.quickSpawn.fire = function (x, y) {
    let fire = game.render.createSdAnimatedSprite('anisprite_fire1');
    fire.x = x * 64;
    fire.y = y * 64;
    fire.play();
    game.render.underLifeLayer.addChild(fire);
  };
  game.quickSpawn.skulls = function (x, y) {
    game.quickSpawn.fire(x, y);
    let fire = game.render.createSdAnimatedSprite('anisprite_skulls1');
    fire.anchor.set(0.5);
    fire.scale.set(3);
    fire.x = x * 64;
    fire.y = y * 64;
    fire.play();
    game.render.underLifeLayer.addChild(fire);
  };
});
bootStrap.push(function () {
  game.loopyo = function () {
    if (!game.radius) {
      game.radius = {
        x: 1,
        y: 1
      };
      game.tween(game.radius, 'slide', {
        x: 10,
        y: 10,
        duration: 1000
      });
    }
    if (!game.deg) {
      game.deg = {
        x: 1,
        y: 1
      };
      game.tween(game.deg, 'slide', {
        x: 360,
        y: 360,
        duration: 60000
      });
    }
    if (!game.firepos) {
      game.firepos = {
        x: 10,
        y: 10
      };
      game.tween(game.firepos, 'slide', {
        x: 10,
        y: 10,
        duration: 10000
      });
    }
    let angleX = Math.floor(game.firepos.x + game.radius.x * Math.cos(game.deg.x));
    let angleY = Math.floor(game.firepos.y + game.radius.x * Math.sin(game.deg.x));
    game.quickSpawn.skulls(angleX, angleY);
    setTimeout(game.loopyo, 10);
  };
});
bootStrap.push(function () {
  game.loopyo2 = function () {
    if (!game.radius) {
      game.radius = {
        x: 6,
        y: 6
      };
      game.tween(game.radius, 'slide', {
        x: 6,
        y: 6,
        duration: 1000
      });
    }
    if (!game.deg) {
      game.deg = {
        x: 1,
        y: 1
      };
      game.tween(game.deg, 'slide', {
        x: 360,
        y: 360,
        duration: 120000
      });
    }
    if (!game.firepos) {
      game.firepos = {
        x: 10,
        y: 10
      };
    }
    let offAngle = game.deg.x;
    let angleX = Math.floor(game.firepos.x + game.radius.x * Math.cos(game.deg.x));
    let angleY = Math.floor(game.firepos.y + game.radius.x * Math.sin(game.deg.x));
    if (game.rng(1, 1000) < 20) {
      let distance = game.radius.x * 2;
      let newAngleX = Math.floor(game.firepos.x + game.radius.x + distance * Math.cos(game.deg.x));
      let newAngleY = Math.floor(game.firepos.y + game.radius.x + distance * Math.cos(game.deg.x));
      game.firepos.x = newAngleX;
      game.firepos.y = newAngleY;
      game.radius.x = distance / 2;
      game.radius.y = distance / 2;
      createjs.Tween.removeTweens(game.deg);
      if (game.deg.x > 0 && game.deg.x < 180 && !game.degdesc) {
        game.tween(game.deg, 'slide', {
          x: 1,
          y: 1,
          duration: 120000
        });
        game.degdesc = true;
      } else {
        game.tween(game.deg, 'slide', {
          x: 360,
          y: 360,
          duration: 120000
        });
        game.degdesc = false;
      }
    }
    game.quickSpawn.skulls(angleX, angleY);
    setTimeout(game.loopyo2, 10);
  };
});
bootStrap.push(function () {
  const MAP_PARSE_TIMEOUT = 600000;
  game.mapParser = {};
  game.mapParser.reset = function () {
    game.mapParser.uniqueLife = {};
    game.mapParser.lifeCount = 0;
    game.mapParser.itemCount = 0;
    game.mapParser.nodeCount = 0;
    game.mapParser.lastCheck = game.mapParser.lastCheck ? Date.now() : Date.now() - MAP_PARSE_TIMEOUT * 2;
  };
  game.mapParser.reset();
  game.updateState = function (force) {
    let lastCheck = Date.now() - game.mapParser.lastCheck;
    if (!force && lastCheck < MAP_PARSE_TIMEOUT) {
      return;
    }
    game.mapParser.parseMap();
  };
  game.getState = function (state) {};
  game.getLifeState = function (name) {
    game.mapParser.updateState();
    if (!game.mapParser.uniqueLife[name]) {}
    return game.mapParser.uniqueLife[name];
  };
  game.mapParser.parseLife = function (life) {
    if (!life.data.name || life.data.name == 'undefined') {
      return;
    }
    game.mapParser.lifeCount++;
    game.mapParser.uniqueLife[life.data.name] = life;
    if (game.index.find(life.id)) {
      game.mapParser.uniqueLife[life.data.name] = game.index.find(life.id);
    }
  };
  game.mapParser.parseItem = function (item) {
    game.mapParser.itemCount++;
    if (item.class == 'LifeObject') {
      game.mapParser.parseLife(item);
    }
  };
  game.mapParser.parseNode = function (node, key) {
    game.mapParser.nodeCount++;
    let items = node.objects;
    let keys = Object.keys(items);
    let keyLen = keys.length;
    for (let i = 0; i < keyLen; i++) {
      let key = keys[i];
      let item = items[key];
      game.mapParser.parseItem(item);
    }
  };
  game.mapParser.parseMap = function () {
    const t0 = performance.now();
    game.mapParser.reset();
    let tree = game.grid.chunkTree;
    let keys = Object.keys(tree);
    let keyLen = keys.length;
    for (let i = 0; i < keyLen; i++) {
      let key = keys[i];
      let node = tree[key];
      game.mapParser.parseNode(node, key);
    }
    const t1 = performance.now();
    let delay = Math.ceil(t1 - t0);
    if (delay > 1000) {}
  };
});
bootStrap.push(function () {
  game.buildTools = {};
  game.buildTools.blocks = {};
  game.buildTools.rad = 10;
  game.input.on('b', function () {
    game.buildTools.rad = Math.min(10, game.buildTools.rad + 0.165);
  });
  game.input.on('c', function () {
    game.buildTools.commit();
  });
  game.input.on('s', function () {
    game.buildTools.rad = Math.max(0, game.buildTools.rad - 0.165);
  });
  game.setTicker('tool', function () {
    if (game.buildTools && !game.buildTools.active) {
      return false;
    }
    game.buildTools.refresh.call(game.buildTools);
  });
  game.buildTools.floodFill = function (x, y, callback, known) {
    let key = x + "-" + y;
    if (known[key]) {
      return;
    }
    known[key] = true;
    callback(x, y);
    let n = game.buildTools.floodFill(x, y - 1, callback, known);
    let e = game.buildTools.floodFill(x + 1, y, callback, known);
    let s = game.buildTools.floodFill(x, y + 1, callback, known);
    let w = game.buildTools.floodFill(x - 1, y, callback, known);
  };
  game.buildTools.drawCircle = function (x, y, rad, callback, iterations) {
    iterations = iterations || 1;
    let deg = 0;
    let blocked = {};
    for (let i = 0; i < 360; i += 360 / iterations) {
      deg++;
      let angleX = Math.floor(x + rad * Math.cos(deg));
      let angleY = Math.floor(y + rad * Math.sin(deg));
      let key = angleX + "-" + angleY;
      if (blocked[key]) {
        continue;
      }
      callback(angleX, angleY);
      blocked[key] = true;
    }
  };
  game.buildTools.commit = function () {
    if (!game.buildTools.timeout) {
      game.grid.allowUndo();
    } else {
      clearTimeout(game.buildTools.timeout);
    }
    game.buildTools.timeout = setTimeout(function () {
      game.grid.forceResolve();
      game.buildTools.timeout = false;
    }, 250);
    let keys = Object.keys(game.buildTools.blocks);
    for (let i = 0; i < keys.length; i++) {
      game.grid.updateTile(game.gridPos(game.buildTools.blocks[keys[i]].x), game.gridPos(game.buildTools.blocks[keys[i]].y), game.buildTools.tileAcross, game.buildTools.tileDown, game.drawLayer);
    }
  };
  game.buildTools.toggleCircle = function () {
    if (game.buildTools.mode === 'circle') {
      game.buildTools.stopCircle();
    } else {
      game.buildTools.circle();
    }
  };
  game.buildTools.stopCircle = function () {
    game.buildTools.active = false;
    game.buildTools.mode = 'none';
    let keys = Object.keys(game.buildTools.blocks);
    for (let i = 0; i < keys.length; i++) {
      game.buildTools.blocks[keys[i]].destroy();
    }
  };
  game.buildTools.circle = function () {
    game.buildTools.active = true;
    game.buildTools.mode = 'circle';
    game.buildTools.newBlock = function (x, y) {
      let key = x + "-" + y;
      let block = new Sprite('uiicon_degraded');
      block.x = game.atGridPos(x);
      block.y = game.atGridPos(y);
      game.render.aboveLife.addChild(block);
      game.buildTools.blocks[key] = block;
    };
    game.buildTools.refresh = function () {
      let x = game.mouseX;
      let y = game.mouseY;
      let gridX = game.gridPos(x);
      let gridY = game.gridPos(y);
      let keys = Object.keys(game.buildTools.blocks);
      for (let i = 0; i < keys.length; i++) {
        game.buildTools.blocks[keys[i]].destroy();
      }
      game.buildTools.blocks = [];
      game.buildTools.drawCircle(gridX, gridY, game.buildTools.rad, game.buildTools.newBlock, 360);
      game.buildTools.floodFill(gridX, gridY, game.buildTools.newBlock, game.buildTools.blocks);
    };
  };
});
bootStrap.push(function () {
  const map = {};
  map.newDrawMatrix = function (regionSize, x, y) {
    let drawMatrix = [];
    for (let i = 0; i < regionSize; i++) {
      drawMatrix.push([]);
      for (let j = 0; j < regionSize; j++) {
        drawMatrix[i].push([[1, 1]]);
      }
    }
    return drawMatrix;
  };
  map.genMap = function (size) {
    if (size < 1) {
      return false;
    }
    const regionSize = 10;
    const newMap = {};
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        newMap['region_' + i + '_' + j + '.json'] = {
          objects: {},
          drawMatrix: this.newDrawMatrix(regionSize, i, j)
        };
      }
    }
    return newMap;
  };
  map.gotoGenMap = function (size) {
    let chunkTree = this.genMap(size);
    game.grid.reset(chunkTree);
    let center = size * 10 * 64 / 2;
    game.render.viewport.moveCenter(center, center);
  };
  game.mapGenerator = map;
});
bootStrap.push(function () {
  game.spriteParser = function () {
    let texture = new Sprite('sprite_boulder_1');
    const renderTexture = PIXI.RenderTexture.create(texture.width, texture.height);
    let image = game.render.draw.render(texture, renderTexture);
    let canvas = document.createElement("canvas");
    $(canvas).css('zIndex', 1000000);
    $(canvas).css('position', 'absolute');
    $(body).append(canvas);
    let ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    let pixel = ctx.getImageData(0, 0, 1, 1);
    let data = pixel.data;
  };
});
bootStrap.push(function () {
  game.activeEncounters = {};
  game.checkActiveEncounters = function () {
    const ONE_MINUTE = 60;
    const ENCOUNTER_DURATION = ONE_MINUTE * 10;
    let keys = Object.keys(game.activeEncounters);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let encounter = game.activeEncounters[key];
      if (encounter.start < game.ts - ENCOUNTER_DURATION) {
        delete game.activeEncounters[key];
      }
    }
  };
  game.addEncounter = function (name, x, y, init) {
    init(x, y);
    game.activeEncounters[game.randID()] = {
      start: game.ts
    };
  };
  game.encounter = function (gridX, gridY) {
    const MAX_ENCOUNTERS = 5;
    const ONE_MINUTE = 60;
    const ENCOUNTER_COOLDOWN_START_BEGINNER = ONE_MINUTE * 5;
    if (Object.keys(game.activeEncounters).length >= MAX_ENCOUNTERS) {
      return;
    }
    if (!this.lastEncounter) {
      this.lastEncounter = game.ts - ENCOUNTER_COOLDOWN_START_BEGINNER;
    }
    if (this.lastEncounter > game.ts - ENCOUNTER_COOLDOWN_START_BEGINNER) {
      return;
    }
    this.lastEncounter = game.ts;
    game.spawnRandomEncounter(gridX, gridY);
    game.checkActiveEncounters();
  };
  game.spawnRandomEncounter = function (gridX, gridY) {
    if (1 == 1) {
      game.addEncounter('Spawn ticks', gridX, gridY, function (gridX, gridY) {
        let x = game.atGridPos(gridX);
        let y = game.atGridPos(gridY);
        let spawn = game.quickAdd(x, y, new ComplexItem('spawn_tick'));
      });
    }
  };
});
bootStrap.push(function () {
  game.quickAdd = function (x, y, item) {
    item.x = x;
    item.y = y;
    item.scaleToGame();
    game.world.addObject(item);
    game.render.objectLayer.addChild(item);
    item.onCreate();
  };
});
bootStrap.push(function () {
  game.clearWilds = function () {
    let lives = game.index.getIndex('life');
    for (id in lives) {
      let life = lives[id];
      if (life.data.isPlayer) {
        continue;
      }
      life.markDelete();
    }
  };
});
bootStrap.push(function () {
  grayText = '#9b9fa5';
  game.render.textStyles['tiny'] = {
    fontFamily: 'Calibri',
    fontSize: 8,
    fill: '#cccccc',
    strokeThickness: 0
  };
  game.render.textStyles['tiny-black'] = {
    fontFamily: 'Calibri',
    fontSize: 8,
    fill: '#000000',
    strokeThickness: 1
  };
  game.render.textStyles['tiny-gold'] = {
    fontFamily: 'Calibri',
    fontSize: 8,
    fill: '#ffff14',
    strokeThickness: 1
  };
  game.render.textStyles['ingame-menu-title'] = {
    fontFamily: 'Aldrich',
    fontSize: 20,
    fill: '#FFFFFF',
    stroke: '#FFFFFF',
    strokeThickness: 0
  };
  game.render.textStyles['ui-title'] = {
    fontFamily: 'Aldrich',
    fontSize: 24,
    fill: '#FFFFFF',
    stroke: '#FFFFFF',
    strokeThickness: 0
  };
  game.render.textStyles['dialog-main'] = {
    fontFamily: 'Calibri',
    breakWords: true,
    wordWrapWidth: 500,
    fontSize: 16,
    fill: '#ffff14',
    stroke: '#000000',
    strokeThickness: 1
  };
  game.render.textStyles['ui-bold'] = {
    fontFamily: 'Calibri',
    wordWrap: true,
    wordWrapWidth: 550,
    fontSize: 16,
    fill: '#ffffff',
    fontWeight: 'bold'
  };
  game.render.textStyles['ingame-dialog'] = {
    fontFamily: 'Calibri',
    fontSize: 18,
    fill: '#cf5eff',
    fontWeight: 'bold',
    stroke: '#000000',
    strokeThickness: 2,
    align: 'center'
  };
  game.render.textStyles['readable'] = {
    fontFamily: 'Calibri',
    wordWrap: true,
    wordWrapWidth: 550,
    fontSize: 16,
    fill: '#cf5eff',
    fontWeight: 'bold',
    stroke: '#000000',
    strokeThickness: 1
  };
  game.render.textStyles['damage'] = {
    fontFamily: 'Calibri',
    wordWrap: true,
    wordWrapWidth: 550,
    fontSize: 16,
    fill: '#a80317',
    fontWeight: 'bold',
    stroke: '#a80317',
    strokeThickness: 1
  };
  game.render.textStyles['ui-subtle'] = {
    fontFamily: 'Calibri',
    wordWrap: true,
    wordWrapWidth: 550,
    fontSize: 16,
    fill: '#626161'
  };
  game.render.textStyles['item-gold'] = {
    fontFamily: 'Calibri',
    fontSize: 16,
    fill: '#ffff14',
    stroke: '#000000',
    strokeThickness: 1
  };
  game.render.textStyles['item-name-1'] = {
    fontFamily: 'Calibri',
    fontSize: 16,
    fill: '#FFFFFF'
  };
  game.render.textStyles['item-name-2'] = {
    fontFamily: 'Calibri',
    fontSize: 16,
    fill: '#36C8C6'
  };
  game.render.textStyles['item-name-3'] = {
    fontFamily: 'Calibri',
    fontSize: 16,
    fill: '#D926ED'
  };
  game.render.textStyles['item-name-4'] = {
    fontFamily: 'Calibri',
    fontSize: 16,
    fill: '#ffff14',
    stroke: '#000000',
    strokeThickness: 1
  };
  game.render.textStyles['item-desc'] = {
    fontFamily: 'Calibri',
    fontSize: 16,
    fill: '#aeafb8',
    wordWrap: true,
    wordWrapWidth: 380,
    stroke: '#000000',
    strokeThickness: 1
  };
  game.render.textStyles['item-desc-small'] = {
    fontFamily: 'Calibri',
    fontSize: 16,
    fill: '#e1e1e6',
    wordWrap: true,
    wordWrapWidth: 365,
    stroke: '#000000',
    strokeThickness: 1
  };
  game.render.textStyles['item-desc-wide'] = {
    fontFamily: 'Calibri',
    fontSize: 16,
    fill: '#e1e1e6',
    wordWrap: true,
    wordWrapWidth: 415,
    stroke: '#000000',
    strokeThickness: 1
  };
  game.render.textStyles['ingame-label'] = {
    fontFamily: 'Calibri',
    fontSize: 16,
    fill: '#FFFFFF',
    stroke: '#FFFFFF',
    strokeThickness: 0
  };
  game.render.textStyles['win-title'] = {
    fontFamily: 'Bungee',
    fontSize: 24,
    fill: '#38b64d',
    stroke: '#1a5524',
    strokeThickness: 4
  };
  game.render.textStyles['win-text'] = {
    fontFamily: 'Bungee',
    fontSize: 20,
    fill: '#38b64d',
    wordWrap: true,
    strokeThickness: 0,
    wordWrapWidth: 260,
    stroke: '#1a5524'
  };
  game.render.textStyles.time = {
    fontFamily: 'Aldrich',
    fontSize: 24,
    fill: '#FFFFFF',
    fontWeight: 'bold',
    strokeThickness: 0
  };
  game.render.textStyles['sign-closed'] = {
    fontFamily: 'Bungee',
    fontSize: 16,
    fill: '#bf4e50',
    strokeThickness: 0
  };
  game.render.textStyles['sign-open'] = {
    fontFamily: 'Bungee',
    fontSize: 16,
    fill: '#38b64d',
    strokeThickness: 0
  };
  game.render.textStyles['happy-peeps'] = {
    fontFamily: 'Bungee',
    fontSize: 16,
    fill: '#FFFFFF',
    strokeThickness: 0,
    align: 'left'
  };
  game.render.textStyles['menu-title-red'] = {
    fontFamily: 'Bungee',
    fontSize: 42,
    fill: '#FFFFFF',
    padding: 10,
    stroke: '#5c5c5c',
    strokeThickness: 4
  };
  game.render.textStyles['menu-title-red-shadow'] = {
    fontFamily: 'Bungee',
    fontSize: 50,
    fill: '#000000',
    padding: 10,
    fontWeight: 'bold',
    stroke: '#CCCCCC',
    strokeThickness: 2
  };
  game.render.textStyles['menu-title'] = {
    fontFamily: 'Aldrich',
    fontSize: 28,
    fill: '#FFFFFF',
    fontWeight: 'bold',
    stroke: '#3797b5',
    strokeThickness: 4
  };
  game.render.textStyles['standard-title'] = {
    fontFamily: 'Aldrich',
    fontSize: 18,
    fill: '#FFFFFF',
    fontWeight: 'bold',
    stroke: '#23272a',
    strokeThickness: 4
  };
  game.render.textStyles['button-text-green'] = {
    fontFamily: 'Aldrich',
    fontSize: 14,
    fill: '#FFFFFF',
    fontWeight: 'bold',
    stroke: '#3797b5',
    strokeThickness: 4
  };
  game.render.textStyles.standard = {
    fontFamily: 'Aldrich',
    fontSize: 12,
    fill: '#FFFFFF',
    fontWeight: 'bold',
    strokeThickness: 0
  };
  game.render.textStyles.small = {
    fontFamily: 'Aldrich',
    fontSize: 10,
    fill: '#FFFFFF',
    fontWeight: 'bold',
    strokeThickness: 0
  };
  game.render.textStyles.whiteotext = {
    fontFamily: 'Aldrich',
    fontSize: 14,
    fill: '#FFFFFF',
    fontWeight: 'bold',
    strokeThickness: 0,
    wordWrap: true,
    wordWrapWidth: 260
  };
  game.render.textStyles['info-tagline'] = {
    fontFamily: 'Aldrich',
    fontSize: 14,
    fill: '#FFFFFF',
    strokeThickness: 0
  };
  game.render.textStyles['small-item-title'] = {
    fontFamily: 'Aldrich',
    fontSize: 10,
    fill: '#FFFFFF',
    fontWeight: 'bold',
    strokeThickness: 0,
    align: 'center'
  };
  game.render.textStyles['small-pawn-title'] = {
    fontFamily: 'Aldrich',
    fontSize: 18,
    fill: '#FFFFFF',
    stroke: '#545454',
    strokeThickness: 6,
    wordWrap: false,
    align: 'center'
  };
  game.render.textStyles['small-item-title-disabled'] = {
    fontFamily: 'Aldrich',
    fontSize: 10,
    fill: grayText,
    fontWeight: 'bold',
    strokeThickness: 0,
    align: 'center'
  };
  game.render.textStyles['smallish-bold'] = {
    fontFamily: 'Aldrich',
    fontSize: 14,
    fill: '#FFFFFF',
    fontWeight: 'bold',
    strokeThickness: 0
  };
  game.render.textStyles.smallish = {
    fontFamily: 'Aldrich',
    fontSize: 14,
    fill: '#FFFFFF',
    fontWeight: 'normal',
    stroke: '#23272a',
    strokeThickness: 4
  };
  game.render.textStyles['smallish-center'] = {
    fontFamily: 'Aldrich',
    fontSize: 14,
    fill: '#FFFFFF',
    fontWeight: 'normal',
    stroke: '#23272a',
    strokeThickness: 4,
    align: 'center'
  };
  game.render.textStyles.itemtitle = {
    fontFamily: 'Aldrich',
    fontSize: 20,
    fill: '#00f6dd',
    strokeThickness: 0
  };
  game.render.textStyles.cash = {
    fontFamily: 'Aldrich',
    fontSize: 22,
    fill: '#2cd633',
    stroke: '#1a5524',
    strokeThickness: 3
  };
  game.render.textStyles.hudcash = {
    fontFamily: 'Bungee',
    fontSize: 22,
    fill: '#FFFFFF',
    strokeThickness: 0,
    align: 'left'
  };
  game.render.textStyles['med-cash'] = {
    fontFamily: 'Aldrich',
    fontSize: 18,
    fill: '#2cd633',
    stroke: '#1a5524',
    strokeThickness: 4
  };
  game.render.textStyles.smallcash = {
    fontFamily: 'Aldrich',
    fontSize: 14,
    fill: '#2cd633',
    fontWeight: 'bold',
    stroke: '#1a5524',
    strokeThickness: 2
  };
  game.render.textStyles.smallpower = {
    fontFamily: 'Aldrich',
    fontSize: 14,
    fill: '#ffee33',
    fontWeight: 'bold',
    stroke: '#ccbb00',
    strokeThickness: 2
  };
  game.render.textStyles.redcash = {
    fontFamily: 'Aldrich',
    fontSize: 22,
    fill: '#732323',
    strokeThickness: 0
  };
  game.render.textStyles.helptext = {
    fontFamily: 'Aldrich',
    fontSize: 14,
    fill: '#000000',
    wordWrap: true,
    wordWrapWidth: 260,
    strokeThickness: 0
  };
  game.render.textStyles.whitedesc = {
    fontFamily: 'Aldrich',
    fontSize: 14,
    fill: '#ffffff',
    wordWrap: true,
    wordWrapWidth: 260,
    strokeThickness: 0
  };
  game.render.textStyles.longerwhitedesc = {
    fontFamily: 'Aldrich',
    fontSize: 14,
    fill: '#ffffff',
    wordWrap: true,
    wordWrapWidth: 600,
    strokeThickness: 0
  };
  game.render.textStyles.longerwhitedesc_700 = {
    fontFamily: 'Aldrich',
    fontSize: 14,
    fill: '#ffffff',
    wordWrap: true,
    wordWrapWidth: 1000,
    strokeThickness: 0
  };
});
bootStrap.push(function () {
  let allBps = ['ss_item_bp_ss_backpack_satchel', 'ss_item_bp_weakrope', 'ss_item_bp_ss_weapon_shinai', 'ss_item_bp_pers_worlditem_buildwall', 'ss_item_bp_pers_worlditem_craftingbench', 'ss_item_bp_pers_worlditem_materialbench', 'ss_item_bp_ss_solar_small', 'ss_item_bp_ss_clone_jacket', 'ss_item_bp_ss_body_smoker', 'ss_item_bp_ss_sin_armor', 'ss_item_bp_ss_sin_recon', 'ss_item_bp_ss_body_bluedress', 'ss_item_bp_ss_body_pinkdress', 'ss_item_bp_ss_body_tunic_1', 'ss_item_bp_ss_body_tunic_2', 'ss_item_bp_body_royalarmor', 'ss_item_bp_body_royal', 'ss_item_bp_ss_plate_armor', 'ss_item_bp_ss_clone_jacket2', 'ss_item_bp_ss_clone_shirt', 'ss_item_bp_ss_clone_shirt2', 'ss_item_bp_ss_body_spacevader_1', 'ss_item_bp_ss_body_medical', 'ss_item_bp_body_techdress', 'ss_item_bp_ss_rags2', 'ss_item_bp_body_robot_slim', 'ss_item_bp_ss_mask_failedclone', 'ss_item_bp_ss_mask_junkdroid', 'ss_item_bp_ss_mask_gasmask', 'ss_item_bp_ss_mask_staff', 'ss_item_bp_ss_mask_bandana', 'ss_item_bp_ss_mask_ranchet', 'ss_item_bp_ss_mask_bandit_hatmask', 'ss_item_bp_ss_mask_farmerhat', 'ss_item_bp_ss_body_gray', 'ss_item_bp_ss_mask_eyescanner', 'ss_item_bp_ss_mask_steamglasses', 'ss_item_bp_ss_mask_deathspawneye', 'ss_item_bp_mask_robothead', 'ss_item_bp_body_robot', 'ss_item_bp_ss_mask_sunshades', 'ss_item_bp_ss_mask_deathspawn', 'ss_item_bp_ss_mask_deadhead', 'ss_item_bp_ss_mask_happymask', 'ss_item_bp_mask_alexhead', 'ss_item_bp_mask_collector', 'ss_item_bp_ss_mask_thejester', 'ss_item_bp_mask_spherehead', 'ss_item_bp_ss_weapon_katana', 'ss_item_bp_ss_weapon_sabre', 'ss_item_bp_ss_weapon_black_katana', 'ss_item_bp_ss_weapon_plank', 'ss_item_bp_ss_weapon_reine_plank', 'ss_item_bp_ss_weapon_redword', 'ss_item_bp_ss_weapon_reinforced_redword', 'ss_item_bp_ss_weapon_skedeye_clipper', 'ss_item_bp_ss_weapon_shotty1', 'ss_item_bp_ss_weapon_scorpion', 'ss_item_bp_ss_weapon_antique_shotgun', 'ss_item_bp_ss_weapon_antique_rifle', 'ss_item_bp_ss_weapon_sawnoff', 'ss_item_bp_ss_weapon_boomstick', 'ss_item_bp_ss_weapon_xbow', 'ss_item_bp_ss_weapon_bow', 'ss_item_bp_ss_weapon_abow', 'ss_item_bp_ss_weapon_kunai', 'ss_item_bp_ss_weapon_shuriken', 'ss_item_bp_ss_weapon_sin_baton', 'ss_item_bp_pickaxe', 'ss_item_bp_satchel', 'ss_item_bp_bandage_small', 'ss_item_bp_ss_weapon_crossbow', 'ss_item_bp_ss_weapon_hatchet_st', 'ss_item_bp_ss_weapon_sickle_st', 'ss_item_bp_ss_weapon_club_w', 'ss_item_bp_ss_weapon_club_w2', 'ss_item_bp_building_material', 'ss_item_bp_ss_weapon_handgun', 'ss_item_bp_cooked_meat', 'ss_item_bp_bandage_large', 'ss_item_bp_ss_rags', 'ss_item_bp_ss_body_camo', 'ss_item_bp_ss_mask_plainmask', 'ss_item_bp_ss_weapon_rusty_katana', 'ss_item_bp_ss_weapon_rusty_plank', 'ss_item_bp_ss_weapon_rust_redword'];
  let stdBps = ['ss_item_research_node', 'ss_item_bp_bandage_small', 'ss_item_bp_bed', 'ss_item_bp_ss_campfire', 'bp_ss_container_smallstorage', 'ss_item_bp_ss_weapon_sickle_st', 'ss_item_bp_ss_weapon_hatchet_st', 'ss_item_bp_pickaxe', 'ss_item_bp_ss_weapon_club_w'];
  let medBps = ['ss_item_research_node', 'ss_item_bp_ss_weapon_crossbow', 'ss_item_bp_satchel'];
  let rareBps = ['ss_item_research_node', 'ss_item_bp_solar_small', 'ss_item_bp_training_dummy', 'ss_item_bp_recycler'];
  let stdRes = ['ss_item_research_node', 'ss_item_stone', 'ss_item_wood', 'ss_item_fiber'];
  let medRes = ['ss_item_research_node', 'ss_item_adhesive', 'ss_item_skin', 'ss_item_gunpowder', 'ss_item_cookedmeat'];
  let rareRes = ['ss_item_research_node', 'ss_item_sinchip', 'ss_item_composites'];
  game.loot.addTable('basic_armour', {
    "std": ['ss_body_smoker'].concat(allBps),
    "med": ['ss_body_camo'].concat(stdRes),
    "rare": ['ss_plate_armor'].concat(stdBps.concat(stdRes))
  });
  game.loot.addTable('basic_weapons', {
    "std": ['ss_weapon_rusty_plank', 'ss_weapon_rusty_katana'].concat(allBps),
    "med": ['ss_weapon_sabre', 'ss_weapon_rust_redword'].concat(stdRes),
    "rare": ['ss_weapon_katana']
  });
  game.loot.addTable('basic_junk', {
    "std": ['ss_body_smoker', 'ss_weapon_rusty_katana'].concat(stdRes),
    "med": ['ss_body_camo', 'ss_weapon_rusty_plank'].concat(medRes),
    "rare": ['ss_plate_armor'].concat(allBps)
  });
  game.loot.addTable('basic_mask', {
    "std": ['ss_body_smoker'].concat(allBps),
    "med": ['ss_body_camo'].concat(stdRes),
    "rare": ['ss_plate_armor'].concat(allBps)
  });
  game.loot.addTable('basic_blueprint', {
    "std": stdBps,
    "med": stdBps.concat(stdRes),
    "rare": stdBps.concat(stdRes.concat(medBps))
  });
  game.loot.addTable('basic_medical', {
    "std": ['ss_item_bandage_small'],
    "med": ['ss_item_bandage_small'],
    "rare": ['ss_item_bandage_small']
  });
  game.loot.addTable('med_armour', {
    "std": ['ss_body_smoker'],
    "med": ['ss_body_camo'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('med_weapons', {
    "std": ['ss_weapon_rusty_katana', 'ss_weapon_katana', 'ss_weapon_sabre', 'ss_weapon_plank'],
    "med": ['ss_weapon_katana', 'ss_weapon_plank', 'ss_weapon_rust_redword'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('med_junk', {
    "std": ['ss_body_smoker'],
    "med": ['ss_weapon_rust_redword'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('med_mask', {
    "std": ['ss_body_smoker'],
    "med": ['ss_body_camo'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('med_blueprint', {
    "std": ['ss_body_smoker'],
    "med": ['ss_body_camo'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('med_medical', {
    "std": ['ss_body_smoker'],
    "med": ['ss_body_camo'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('adv_armour', {
    "std": ['ss_body_smoker'],
    "med": ['ss_body_camo'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('adv_weapons', {
    "std": ['ss_weapon_plank', 'ss_weapon_rusty_katana', 'ss_weapon_plank', 'ss_weapon_katana'],
    "med": ['ss_weapon_rusty_katana', 'ss_weapon_redword'],
    "rare": ['ss_weapon_black_katana']
  });
  game.loot.addTable('adv_junk', {
    "std": ['ss_body_smoker'],
    "med": ['ss_body_camo'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('adv_mask', {
    "std": ['ss_body_smoker'],
    "med": ['ss_body_camo'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('adv_medical', {
    "std": ['ss_body_smoker'],
    "med": ['ss_body_camo'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('rare_armour', {
    "std": ['ss_body_smoker'],
    "med": ['ss_body_camo'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('rare_weapons', {
    "std": ['ss_body_smoker'],
    "med": ['ss_body_camo'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('rare_junk', {
    "std": ['ss_body_smoker'],
    "med": ['ss_body_camo'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('rare_mask', {
    "std": ['ss_body_smoker'],
    "med": ['ss_body_camo'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('rare_medical', {
    "std": ['ss_body_smoker'],
    "med": ['ss_body_camo'],
    "rare": ['ss_plate_armor']
  });
  game.loot.addTable('starter_armor_shop', {
    "std": ['ss_rags', 'ss_rags2', 'ss_clone_shirt', 'ss_clone_shirt2', 'ss_item_bp_ss_rags', 'ss_item_bp_ss_rags2', 'ss_item_bp_ss_clone_shirt', 'ss_item_bp_ss_clone_shirt2'],
    "med": ['ss_body_smoker', 'ss_body_camo', 'ss_body_medical', 'ss_clone_jacket', 'ss_item_bp_ss_clone_jacket', 'ss_item_bp_ss_body_smoker', 'ss_item_bp_ss_body_medical', 'ss_item_bp_ss_body_camo'],
    "rare": ['ss_body_tunic_1', 'ss_item_bp_ss_body_tunic_1']
  });
  game.loot.addTable('medium_armor_shop', {
    "std": ['ss_body_medical', 'ss_body_camo', 'ss_body_tunic_1', 'ss_body_tunic_2', 'ss_item_bp_ss_body_medical', 'ss_item_bp_ss_body_camo', 'ss_item_bp_ss_body_tunic_1', 'ss_item_bp_ss_body_tunic_2'],
    "med": ['ss_item_body_royal', 'ss_plate_armor', 'ss_item_body_techdress', 'ss_item_bp_body_royal', 'ss_item_bp_ss_plate_armor', 'ss_item_bp_body_techdress'],
    "rare": ['ss_item_body_royalarmor', 'ss_item_bp_body_royalarmor']
  });
  game.loot.addTable('endgame_armor_shop', {
    "std": ['ss_item_body_royal', 'ss_item_body_techdress', 'ss_sin_armor', 'ss_item_body_robot', 'ss_item_bp_body_royal', 'ss_item_bp_body_techdress', 'ss_item_bp_ss_sin_armor', 'ss_item_bp_body_robot'],
    "med": ['ss_item_body_royalarmor', 'ss_sin_recon', 'ss_item_body_robot_slim', 'ss_item_bp_body_royalarmor', 'ss_item_bp_ss_sin_recon', 'ss_item_bp_body_robot_slim'],
    "rare": ['ss_body_spacevader_1', 'ss_item_bp_ss_body_spacevader_1']
  });
  game.loot.addTable('starter_weapon_shop', {
    "std": ['pickaxe', 'ss_weapon_hatchet_st', 'ss_weapon_sickle_st', 'ss_weapon_club_w', 'ss_weapon_shinai', 'ss_item_bp_pickaxe', 'ss_item_bp_ss_weapon_hatchet_st', 'ss_item_bp_ss_weapon_sickle_st', 'ss_item_bp_ss_weapon_club_w', 'ss_item_bp_ss_weapon_shinai'],
    "med": ['ss_weapon_rusty_katana', 'ss_weapon_rusty_plank', 'ss_weapon_crossbow', 'ss_item_bp_ss_weapon_rusty_katana', 'ss_item_bp_ss_weapon_rusty_plank', 'ss_item_bp_ss_weapon_crossbow'],
    "rare": ['ss_weapon_abow', 'ss_weapon_plank', 'ss_item_bp_ss_weapon_abow', 'ss_item_bp_ss_weapon_plank']
  });
  game.loot.addTable('medium_weapon_shop', {
    "std": ['ss_weapon_rusty_katana', 'ss_weapon_rusty_plank', 'ss_weapon_crossbow', 'ss_weapon_bow', 'ss_weapon_rust_redword', 'ss_item_bp_ss_weapon_rusty_katana', 'ss_item_bp_ss_weapon_rusty_plank', 'ss_item_bp_ss_weapon_crossbow', 'ss_item_bp_ss_weapon_bow', 'ss_item_bp_ss_weapon_rust_redword'],
    "med": ['ss_weapon_skedeye_clipper', 'ss_weapon_katana', 'ss_weapon_sabre', 'ss_item_bp_ss_weapon_skedeye_clipper', 'ss_item_bp_ss_weapon_katana', 'ss_item_bp_ss_weapon_sabre'],
    "rare": ['ss_weapon_reine_plank', 'ss_weapon_redword', 'ss_item_bp_ss_weapon_reine_plank', 'ss_item_bp_ss_weapon_redword']
  });
  game.loot.addTable('endgame_weapon_shop', {
    "std": ['ss_weapon_kunai', 'ss_weapon_shuriken', 'ss_weapon_plank', 'ss_weapon_katana', 'ss_item_bp_ss_weapon_kunai', 'ss_item_bp_ss_weapon_shuriken', 'ss_item_bp_ss_weapon_plank', 'ss_item_bp_ss_weapon_katana'],
    "med": ['ss_weapon_sin_baton', 'ss_weapon_reine_plank', 'ss_weapon_redword', 'ss_item_bp_ss_weapon_sin_baton', 'ss_item_bp_ss_weapon_reine_plank', 'ss_item_bp_ss_weapon_redword'],
    "rare": ['ss_weapon_black_katana', 'ss_weapon_reinforced_redword', 'ss_weapon_xbow', 'ss_item_bp_ss_weapon_black_katana', 'ss_item_bp_ss_weapon_reinforced_redword', 'ss_item_bp_ss_weapon_xbow']
  });
  game.loot.addTable('starter_resources_shop', {
    "std": ['ss_item_rawmeat', 'ss_item_whitemeat', 'ss_item_cookedmeat', 'ss_item_stone'],
    "med": ['ss_item_fiber', 'ss_item_wood', 'ss_item_sand', 'ss_item_bedroll'],
    "rare": ['ss_item_gunpowder', 'ss_item_sheetmetal']
  });
  game.loot.addTable('medium_resources_shop', {
    "std": ['ss_item_fiber', 'ss_item_wood', 'ss_item_sand', 'ss_item_skin', 'ss_item_glass', 'ss_item_bedroll'],
    "med": ['ss_item_jyelo', 'ss_item_gunpowder', 'ss_item_sheetmetal', 'ss_item_mechscrap'],
    "rare": ['ss_item_composites', 'ss_item_roboeye', 'ss_item_gazoline']
  });
  game.loot.addTable('endgame_resources_shop', {
    "std": ['ss_item_spidereye', 'ss_item_composites', '', 'ss_item_mechscrap'],
    "med": ['ss_item_redgem', 'ss_item_redbar', 'ss_item_sinstone'],
    "rare": ['ss_item_sinchip', 'ss_item_darkiron', 'ss_item_adhesive']
  });
});
bootStrap.push(function () {
  game.randomLists = {};
  game.randomLists.names = ['Cat', 'Dog', 'Parrot', 'Horse', 'Pig', 'Rat', 'Bat', 'Sheep', 'Lamp', 'Lamb', 'Lizard', 'Eagle', 'Owl', 'Pidgeon', 'Cow', 'Parry', 'Kooma', 'Yamas', 'Humus', 'Biro', 'Cottonbud', 'Trop', 'Chaud', 'Si', 'Fatige', 'Tu', 'Maim', 'Deman', 'Alor', 'On', 'Danse', 'Susu', 'Zuzu', 'Rusu', 'Parce', 'Que', 'Sampl', 'Meuf', 'Femme', 'Homme', 'Whistle', 'Maboosh', 'Jedor', 'Hank', 'Toozie', 'Woozie', 'Yoozie', 'Loozie', 'Babmboozie', 'Jambalam', 'Wababalimbam', 'Snoosnoo', 'Crabby', 'Paddy', 'Patty', 'Hombre', 'Tuna Cant', 'Tuna Can', 'Seaside', 'Mountain', 'Monarch', 'River', 'Ocean', 'Mer', 'Lau', 'Leau', 'Montagne', 'Chui', 'Mort', 'De', 'Rire', 'Fudge', 'Choc', 'Berry', 'Peanut', 'DundunDunnn', 'Amaze', 'Spooky', 'Kranky', 'Smoothbrain', 'Smoothskin', 'Eye Capn', 'Whale', 'Baluga', 'Dolphin', 'Baeline', 'Bae', 'Glasses', 'Bigfoot', 'Troody', 'Pterry', 'Tractor', 'Radok', 'Shadok', 'Theri', 'Itchy', 'Sana', 'Jed', 'Sed', 'Zed', 'Sab', 'Carin', 'Caron', 'Cimer', 'Reuf', 'Ouais', 'Yeah', 'Zoot', 'Taz', 'Senna', 'Vik', 'Hue', 'Log', 'Zoo', 'Guy', 'Ted', 'Key', 'Bozo', 'Koi', 'Koy', 'Esc', 'Alt', 'Hashtag', 'Kim', 'Xii', 'Xax', 'Soon', 'Bubblegum', 'Mits', 'Glove', 'Mitten', 'Sock', 'Zebby', 'Taco', 'Nacho', 'Rainbow', 'Floyd', 'Karma', 'Fish', 'Cake', 'Pan', 'Rocket', 'Bus', 'Bowl', 'Shoe', 'Bart', 'Homer', 'Kenny', 'Burp', 'Wind', 'Chicken', 'Mouse', 'Migu', 'Poncho', 'Jazz', 'Shleem', 'Parker', 'Zero', 'Scrub', 'Pants', 'Art', 'Crypto', 'Drama', 'Gary', 'Angry', 'Biscuit', 'Badger', 'Curly', 'Giggles', 'Lunchbox', 'Brains', 'Trashbag', 'Lisa', 'Badger', 'Hank', 'Happy', 'Avion', 'Cedric', 'Jerba', 'Lockpin', 'Paper', 'Bic', 'Zoob', 'Peep', 'Torvald', 'Iamleym', 'Unsubnu', 'Newfon', 'Hudis', 'Ilest', 'Ilya', 'Yesterday', 'Today', 'Hier', 'Aujourdhui', 'Circle', 'Carre', 'Jim', 'Dipsil', 'Tata', 'Howie', 'Slinky', 'Dorkin', 'Whimper', 'Doob', 'Kettle', 'Bigmouth', 'Terrapin', 'Entiendo', 'Namaste', 'Krabby', 'Tonto', 'Schweebett'];
  game.util.randomName = function () {
    return game.randomLists.names[game.rng(0, game.randomLists.names.length - 1)];
  };
});
bootStrap.push(function () {
  _BLUEPRINTS.RESEARCH_NODES = {
    "survival": {
      "codename": "survival",
      "name": "Survival",
      "sprite": "sprite_campfire",
      "children": []
    },
    "armor": {
      "codename": "armor",
      "name": "Armor",
      "sprite": "sprite_loom",
      "children": []
    },
    "weapons": {
      "codename": "weapons",
      "name": "Weapons",
      "sprite": "wep_crossbow",
      "children": []
    },
    "building": {
      "codename": "building",
      "name": "Building",
      "sprite": "sprite_stonebench",
      "children": []
    }
  };
  const researchTree = _BLUEPRINTS.RESEARCH_NODES;
  const parentMap = {};
  let recipes = _BLUEPRINTS.RECIPES;
  let recipeNames = Object.keys(recipes);
  const parsed = {};
  const parse = () => {
    for (let i = 0; i < recipeNames.length; i++) {
      if (parsed[recipeNames[i]]) continue;
      let recipe = recipes[recipeNames[i]];
      recipe.codename = recipeNames[i];
      if (!recipe.researchParent || recipe.researchParent.length === 0) {
        continue;
      }
      let parent = null;
      let myParent = null;
      if (researchTree[recipe.researchParent]) {
        parent = researchTree[recipe.researchParent];
        myParent = false;
      }
      if (!parent) {
        parent = parentMap["p_" + recipe.researchParent];
        myParent = "p_" + recipe.researchParent;
      }
      if (!parent) {}
      if (!parent) continue;
      parsed[recipeNames[i]] = true;
      parentMap["p_" + recipe.crafts] = parent;
      parent.children.push({
        "parent": myParent,
        "name": recipe.name,
        "codename": "p_" + recipe.crafts,
        "unlocks": recipe.codename,
        "sprite": recipe.sprite,
        "require": recipe.researchRequire,
        "amount": recipe.researchAmount
      });
    }
  };
  parse();
  parse();
  parse();
  game.parsedResearch = true;
});
bootStrap.push(function () {
  game.util.getBaseStats = function (stats) {
    stats = stats || {};
    return Object.assign({
      hp: 100,
      torp: 0,
      weight: 0,
      energy: 100,
      maxHP: stats.maxHp || stats.maxHP || 120,
      maxEnergy: 100,
      maxWeight: 25,
      maxSpeed: 5,
      maxTorp: 150,
      energyRegen: 0.1,
      healthRegen: 0.0,
      savage: 1,
      melee: 1,
      athletics: 1,
      ranged: 1,
      toughness: 1,
      strength: 1,
      craft: 1,
      intelligence: 1,
      bluntReduction: 0,
      ballisticReduction: 0,
      sharpReduction: 0,
      tempHeat: 25,
      tempCold: 0
    }, stats);
  };
  game.util.getSpeciesBaseStats = function (species) {
    let speciesBlueprint = _BLUEPRINTS.SPECIES[species];
    if (!speciesBlueprint) speciesBlueprint = {};
    return game.util.getBaseStats(speciesBlueprint.stats || {});
    switch (species) {
      case "human":
        return game.util.getBaseStats({
          maxHP: 200,
          maxTorp: 200
        });
      case "robot":
        return game.util.getBaseStats({
          maxHP: 300,
          maxTorp: 2000
        });
      case "lokal":
        return game.util.getBaseStats({
          maxTorp: 1000
        });
      case "animal":
        return game.util.getBaseStats({
          maxHP: 200,
          maxTorp: 350
        });
      case "clone":
      default:
        return game.util.getBaseStats({});
    }
    ;
  };
});
bootStrap.push(function () {
  game.randomTalks = {};
  function addTalks(mixedKey, chatter, attack, defend) {
    if (!chatter) {
      chatter = [];
    }
    if (!attack) {
      attack = [];
    }
    if (!defend) {
      defend = [];
    }
    game.randomTalks[mixedKey] = {
      chatter,
      attack,
      defend
    };
  }
  game.util.getRandomTalk = function (pawn, talkType) {
    let talkList = game.randomTalks[game.data.name];
    if (!talkList) {
      talkList = game.randomTalks[game.data.faction];
    }
    if (!talkList) {
      talkList = game.randomTalks[game.data.species];
    }
    if (!talkList) return;
    if (!talkType) {
      talkType = 'chatter';
    }
    if (!talkList[talkType]) return;
    const sayThis = talkList[talkType][game.rng(0, talkList[talkType].length - 1)];
    if (!sayThis) {
      return;
    }
    return sayThis;
  };
  addTalks('nomad', ["Gof I hate this place so much", "I dont know what golf is, but I always wanted to play it"], ["Lets be stupid yaaaaay"], ["Maybe we should back out"]);
  addTalks('bandit', ["Ergh this meat taste like crap", "Fkn sandticks in my pants again"], ["Get em lads", "Oooo I love stabbin'"], ["If I don't escape tell my creator... go to hell."]);
});
bootStrap.push(function () {
  game.spawnPoints = {
    'default': 'The Default'
  };
  game.spawnPointsLoc = {
    'default': [81, 52]
  };
  const gameStarts = {};
  game.gameStarts = gameStarts;
  gameStarts['clone'] = {
    title: "Discarded Clone",
    desc: "[Difficulty: Medium] Start out as a discarded clone. You weren't even wanted by your creators due to a lack of any impressive personal qualities, face the challenge of surviving in a world where everything will see you as an easy target",
    selected: function () {},
    startX: 159,
    startY: 144
  };
  gameStarts['escaped_clone'] = {
    title: "Escaped Clone",
    desc: "[Difficulty: Medium] Start out as an escaped clone finding themselves already amongst the dunes and creatures of the reset.",
    selected: function () {},
    startX: 99,
    startY: 127
  };
  gameStarts['crazy_founder'] = {
    title: "Crazy Founder",
    desc: "[Difficulty: Easy] You're fed up of the boring life back at Landzo. You and a few of your servient clones find themselves in the old ruins of a Sincorp Lab. Can you get started rebuilding this once bustling structure?",
    selected: function () {},
    startX: 99,
    startY: 127
  };
});
bootStrap.push(function () {
  game.util.getDefaultZones = function () {
    const zones = Array(50);
    zones[0] = GameSession.prototype.newZone(0, "city", "The desert", "the_desert", GameSession.prototype.newZoneMeta("nomad", true, 100));
    zones[1] = GameSession.prototype.newZone(1, "city", "Landzo City", "landzo", GameSession.prototype.newZoneMeta("sincorp", false, 100, 35));
    zones[2] = GameSession.prototype.newZone(2, "city", "Nugarden", "nugarden", GameSession.prototype.newZoneMeta("yamakai", false, 100, 35));
    zones[3] = GameSession.prototype.newZone(3, "city", "Olgarden", "olgarden", GameSession.prototype.newZoneMeta("yamakai", false, 20, 25));
    zones[4] = GameSession.prototype.newZone(4, "city", "Bleak", "bleak", GameSession.prototype.newZoneMeta("sincorp", false, 20, 20));
    zones[5] = GameSession.prototype.newZone(5, "city", "Bloodpikes", "bloodpikes", GameSession.prototype.newZoneMeta("bandit", true, 20, 5));
    zones[6] = GameSession.prototype.newZone(6, "camp", "Deadheads Camp", "deadheads_camp", GameSession.prototype.newZoneMeta("deadhead", true, 25, 5));
    zones[7] = GameSession.prototype.newZone(7, "city", "Overther", "overther", GameSession.prototype.newZoneMeta("sincorp", false, 20));
    zones[8] = GameSession.prototype.newZone(8, "city", "Bogden", "bogden", GameSession.prototype.newZoneMeta("ftc", true, 75, 20));
    zones[9] = GameSession.prototype.newZone(9, "city", "Fakton", "fakton", GameSession.prototype.newZoneMeta("ftc", true, 20, 20));
    zones[10] = GameSession.prototype.newZone(10, "city", "Chunt", "chunt", GameSession.prototype.newZoneMeta("ftc", true, 20, 8));
    zones[11] = GameSession.prototype.newZone(11, "city", "Eska Samarch", "eska", GameSession.prototype.newZoneMeta("yamakai", false, 10, 8));
    zones[12] = GameSession.prototype.newZone(12, "city", "Esperay", "esperay", GameSession.prototype.newZoneMeta("lokals", false, 10, 8));
    zones[13] = GameSession.prototype.newZone(13, "city", "Lokai", "lokai", GameSession.prototype.newZoneMeta("lokals", false, 75));
    zones[14] = GameSession.prototype.newZone(14, "city", "Ailko", "ailko", GameSession.prototype.newZoneMeta("lokals", false));
    zones[15] = GameSession.prototype.newZone(15, "city", "Sytadel Keep", "sytadel", GameSession.prototype.newZoneMeta("sincorp", false, 100));
    zones[16] = GameSession.prototype.newZone(16, "city", "Ashton", "ashton", GameSession.prototype.newZoneMeta("hunter", false));
    zones[17] = GameSession.prototype.newZone(17, "city", "Kailo", "kailo", GameSession.prototype.newZoneMeta("lokals", false));
    zones[18] = GameSession.prototype.newZone(18, "city", "Tufar", "tufar", GameSession.prototype.newZoneMeta("hunter", false));
    zones[19] = GameSession.prototype.newZone(19, "city", "Drumley", "drumley", GameSession.prototype.newZoneMeta("drumley", false));
    zones[20] = GameSession.prototype.newZone(20, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[21] = GameSession.prototype.newZone(21, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[22] = GameSession.prototype.newZone(22, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[23] = GameSession.prototype.newZone(23, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[24] = GameSession.prototype.newZone(24, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[25] = GameSession.prototype.newZone(25, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[26] = GameSession.prototype.newZone(26, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[27] = GameSession.prototype.newZone(27, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[28] = GameSession.prototype.newZone(28, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[29] = GameSession.prototype.newZone(29, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[30] = GameSession.prototype.newZone(30, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[31] = GameSession.prototype.newZone(31, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[32] = GameSession.prototype.newZone(32, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[33] = GameSession.prototype.newZone(33, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[34] = GameSession.prototype.newZone(34, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[35] = GameSession.prototype.newZone(35, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[36] = GameSession.prototype.newZone(36, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[37] = GameSession.prototype.newZone(37, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[38] = GameSession.prototype.newZone(38, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[39] = GameSession.prototype.newZone(39, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[40] = GameSession.prototype.newZone(40, "city", "RESERVED", "RESERVED", GameSession.prototype.newZoneMeta("civilian", false));
    zones[41] = GameSession.prototype.newZone(41, "house", "Player House 1", "civilian", GameSession.prototype.newZoneMeta("civilian", false));
    zones[42] = GameSession.prototype.newZone(42, "house", "Player House 2", "civilian", GameSession.prototype.newZoneMeta("civilian", false));
    zones[43] = GameSession.prototype.newZone(43, "house", "Player House 3", "civilian", GameSession.prototype.newZoneMeta("civilian", false));
    zones[44] = GameSession.prototype.newZone(44, "house", "Player House 4", "civilian", GameSession.prototype.newZoneMeta("civilian", false));
    zones[45] = GameSession.prototype.newZone(45, "house", "Player House 5", "civilian", GameSession.prototype.newZoneMeta("civilian", false));
    zones[46] = GameSession.prototype.newZone(46, "house", "Player House 6", "civilian", GameSession.prototype.newZoneMeta("civilian", false));
    zones[47] = GameSession.prototype.newZone(47, "house", "Player House 7", "civilian", GameSession.prototype.newZoneMeta("civilian", false));
    zones[48] = GameSession.prototype.newZone(48, "house", "Player House 8", "civilian", GameSession.prototype.newZoneMeta("civilian", false));
    zones[49] = GameSession.prototype.newZone(49, "house", "Player House 9", "civilian", GameSession.prototype.newZoneMeta("civilian", false));
    return zones;
  };
});
bootStrap.push(function () {
  _BLUEPRINTS.AUDIO.joe_1 = {
    name: "joe_1",
    file: "joe/joe_1.mp3",
    title: "Beth's Song",
    vol: 1.0,
    loop: false
  };
  _BLUEPRINTS.AUDIO.joe_2 = {
    name: "joe_2",
    file: "joe/joe_2.mp3",
    title: "Capital Blues",
    vol: 1.0,
    loop: false
  };
  _BLUEPRINTS.AUDIO.joe_3 = {
    name: "joe_3",
    file: "joe/joe_3.mp3",
    title: "Fears",
    vol: 1.0,
    loop: false
  };
  _BLUEPRINTS.AUDIO.joe_4 = {
    name: "joe_4",
    file: "joe/joe_4.mp3",
    title: "Cross The Line",
    vol: 1.0,
    loop: false
  };
  _BLUEPRINTS.AUDIO.joe_5 = {
    name: "joe_5",
    file: "joe/joe_5.mp3",
    title: "The Gambler",
    vol: 1.0,
    loop: false
  };
  _BLUEPRINTS.AUDIO.joe_6 = {
    name: "joe_6",
    file: "joe/joe_6.mp3",
    title: "Trouble",
    vol: 1.0,
    loop: false
  };
  _BLUEPRINTS.AUDIO.joe_7 = {
    name: "joe_7",
    file: "joe/joe_7.mp3",
    title: "Don't Let 'Em Get You Down",
    vol: 1.0,
    loop: false
  };
  _BLUEPRINTS.AUDIO.joe_8 = {
    name: "joe_8",
    file: "joe/joe_8.mp3",
    title: "Keep on Running",
    vol: 1.0,
    loop: false
  };
  _BLUEPRINTS.AUDIO.joe_9 = {
    name: "joe_9",
    file: "joe/joe_9.mp3",
    title: "Driving Home",
    vol: 1.0,
    loop: false
  };
  _BLUEPRINTS.AUDIO.joe_10 = {
    name: "joe_10",
    file: "joe/joe_10.mp3",
    title: "Back On The Road",
    vol: 1.0,
    loop: false
  };
  _BLUEPRINTS.AUDIO.joe_11 = {
    name: "joe_11",
    file: "joe/joe_11.mp3",
    title: "Mine Oh Mine",
    vol: 1.0,
    loop: false
  };
  _BLUEPRINTS.ALBUM = [_BLUEPRINTS.AUDIO.joe_1, _BLUEPRINTS.AUDIO.joe_2, _BLUEPRINTS.AUDIO.joe_3, _BLUEPRINTS.AUDIO.joe_4, _BLUEPRINTS.AUDIO.joe_5, _BLUEPRINTS.AUDIO.joe_6, _BLUEPRINTS.AUDIO.joe_7, _BLUEPRINTS.AUDIO.joe_8, _BLUEPRINTS.AUDIO.joe_9, _BLUEPRINTS.AUDIO.joe_10, _BLUEPRINTS.AUDIO.joe_11];
});
bootStrap.push(function () {
  function addFloor(layer, across, down, name, desc = false, color = "", canColor = false) {
    if (!canColor) canColor = false;
    if (!desc) desc = "";
    game.world.objectTemplates.walls.push({
      name: 'buildroom',
      readName: name,
      codename: 'floor',
      description: desc,
      cost: 0,
      across: across,
      down: down,
      blocks: 1,
      collide: 'allowwall',
      canColor: canColor,
      data: {
        canColor: canColor,
        layer: layer,
        fill: [across, down],
        buildFloor: true,
        wallBuild: true,
        across: across,
        down: down
      }
    });
    return {
      tile: {
        name: 'buildroom',
        readName: name,
        codename: 'floor',
        description: desc,
        cost: 0,
        across: across,
        down: down,
        blocks: 1,
        collide: 'allowwall',
        canColor: canColor,
        data: {
          canColor: canColor,
          layer: layer,
          fill: [across, down],
          buildFloor: true,
          wallBuild: true,
          across: across,
          down: down
        }
      },
      playerBuildable: function (options = {}) {
        if (!options) options = {};
        game.world.objectTemplates.player_tools.push({
          name: 'planning',
          type: 'walls',
          toolName: 'playersquaring',
          readName: this.tile.readName,
          codename: 'playersquaring',
          description: _LANG.WAITING_FOR_DESCRIPTION,
          cost: 0,
          across: this.tile.across,
          down: this.tile.down,
          blocks: 1,
          fill: typeof options.fill === "undefined" ? true : options.fill,
          complex: true,
          blockZone: 'all',
          recipe: 'pers_worlditem_buildwall',
          crafts: 'pers_worlditem_buildwall',
          collide: 'allowwall',
          data: this.tile.data
        });
      }
    };
  }
  game.ee.on('bootstrap_post', () => {
    addFloor(1, 1, 29, 'Tarbrick', false, "#2A2A2A");
    addFloor(1, 2, 29, 'Redrow', false, "#2A2A2A");
    addFloor(1, 3, 29, 'Vertrow', false, "#2A2A2A");
    addFloor(1, 4, 29, 'Floor dark', false, "#2A2A2A");
    addFloor(1, 1, 30, 'Hard gravel', false, "#2A2A2A");
    addFloor(1, 2, 30, 'Red Hex', false, "#2A2A2A");
    addFloor(1, 3, 30, 'Colored Hex', false, "#2A2A2A");
    addFloor(1, 4, 30, 'Grayth Hex', false, "#2A2A2A");
    addFloor(1, 5, 30, 'Whythe Gray', false, "#2A2A2A");
    addFloor(2, 5, 29, 'Shadow Light', false, "#2A2A2A");
    addFloor(2, 6, 29, 'Shadow Dark', false, "#2A2A2A");
    addFloor(2, 7, 29, 'Pt Shadow Light', false, "#2A2A2A");
    addFloor(2, 8, 29, 'Pt Shadow Dark', false, "#2A2A2A");
    addFloor(1, 1, 31, 'Plain wood', false, "#2A2A2A");
    addFloor(1, 2, 31, 'Ash wood', false, "#2A2A2A");
    addFloor(1, 3, 31, 'Sider wood', false, "#2A2A2A");
    addFloor(1, 4, 31, 'Bluth wood', false, "#2A2A2A");
    addFloor(1, 5, 31, 'Plumpth wood', false, "#2A2A2A");
    addFloor(1, 6, 31, 'Whythe wood', false, "#2A2A2A").playerBuildable();
    addFloor(5, 6 + 1, 3 + 1, 'Tint Wall', false, "#2A2A2A", true).playerBuildable();
    addFloor(5, 18 + 1, 3 + 1, 'Tint LogWall', false, "#2A2A2A", true).playerBuildable();
    addFloor(5, 28 + 1, 3 + 1, 'Tint Bar', false, "#2A2A2A", true);
    addFloor(3, 16, 28, 'Wall Side', false, "#2A2A2A");
    addFloor(3, 20, 28, 'Wall Side 2', false, "#2A2A2A", true);
    addFloor(3, 21, 28, 'Wall Side Blank', false, "#2A2A2A", true);
    addFloor(3, 22, 28, 'Brick Side', false, "#2A2A2A", true);
    addFloor(3, 23, 28, 'Brick Side 2', false, "#2A2A2A", true);
    addFloor(3, 24, 28, 'Wood Side', false, "#2A2A2A", true);
    addFloor(3, 25, 28, 'Wood Side 2', false, "#2A2A2A", true);
    addFloor(6, 17, 28, 'Glass 1', false, "#2A2A2A");
    addFloor(6, 18, 28, 'Glass 2', false, "#2A2A2A");
    addFloor(6, 19, 28, 'Glass 3', false, "#2A2A2A");
    addFloor(1, 15, 31, 'Block', false, "#ffffff", true);
    addFloor(1, 16, 31, 'Squares', false, "#ffffff", true);
    addFloor(1, 17, 31, 'Mis-Squares', false, "#ffffff", true);
    addFloor(1, 18, 31, 'Tiles', false, "#ffffff", true);
    addFloor(1, 28, 31, 'LightWood', false, "#ffffff", true);
    addFloor(1, 29, 31, 'Brickedout', false, "#ffffff", true);
    addFloor(1, 30, 31, 'Brickedout Dark', false, "#ffffff", true);
    addFloor(1, 19, 31, 'Chevron Down', false, "#ffffff", true);
    addFloor(1, 20, 31, 'Chevron Right', false, "#ffffff", true);
    addFloor(1, 21, 31, 'Zigzag', false, "#ffffff", true);
    addFloor(1, 22, 31, 'Zigzag Right', false, "#ffffff", true);
    addFloor(1, 23, 31, 'Circles', false, "#ffffff", true);
    addFloor(1, 24, 31, 'Rough', false, "#ffffff", true);
    addFloor(1, 25, 31, 'Biscuits', false, "#ffffff", true);
    addFloor(1, 26, 31, 'H Wood', false, "#ffffff", true);
    addFloor(1, 27, 31, 'V Wood', false, "#ffffff", true);
    addFloor(2, 16, 30, 'Circles', false, "#ffffff", true);
    addFloor(2, 17, 30, 'Lines', false, "#ffffff", true);
    addFloor(2, 18, 30, 'Wooded', false, "#ffffff", true);
    addFloor(6, 19, 30, 'Chevron Up', false, "#ffffff", true);
    addFloor(6, 22, 30, 'Chevron Right', false, "#ffffff", true);
    addFloor(6, 23, 30, 'Chevron Right White', false, "#ffffff", true);
    addFloor(6, 20, 30, 'Lines Up', false, "#ffffff", true);
    addFloor(6, 21, 30, 'Lines Right', false, "#ffffff", true);
    addFloor(6, 9, 31, 'Cracks 1', false, "#ffffff");
    addFloor(6, 10, 31, 'Cracks 2', false, "#ffffff");
    addFloor(6, 10, 30, 'Muck 1', false, "#ffffff");
    addFloor(6, 11, 30, 'Muck 2', false, "#ffffff");
    addFloor(6, 11, 31, 'Muck 3', false, "#ffffff");
    addFloor(6, 17, 29, 'Dirt Sand', false, "#ffffff");
    addFloor(6, 18, 29, 'Dirt Sand Short', false, "#ffffff");
    addFloor(6, 19, 29, 'Dirt Sand Top', false, "#ffffff");
    addFloor(6, 20, 29, 'Dirt Sand Top Short', false, "#ffffff");
    addFloor(6, 21, 29, 'Dirt Sand Cover', false, "#ffffff");
    addFloor(6, 22, 29, 'Dirt Sand Cover 2', false, "#ffffff");
    addFloor(6, 24, 29, 'Barb Left', false, "#ffffff");
    addFloor(6, 25, 29, 'Barb Mid', false, "#ffffff");
    addFloor(6, 26, 29, 'Barb Right', false, "#ffffff");
    addFloor(6, 27, 28, 'VBarb Up', false, "#ffffff");
    addFloor(6, 27, 29, 'VBarb Mid', false, "#ffffff");
    addFloor(6, 27, 30, 'VBarb Down', false, "#ffffff");
    addFloor(1, 9, 22, 'Red Royale', false, "#2A2A2A");
    addFloor(1, 9 + 3, 22, 'Orange Royale', false, "#2A2A2A");
    addFloor(1, 9 + 3 + 3, 22, 'Blue Royale', false, "#2A2A2A");
    addFloor(1, 9 + 3 + 3 + 3, 22, 'Green Royale', false, "#2A2A2A");
    addFloor(3, 13, 31, 'Dock Under', false, "#2A2A2A");
    addFloor(3, 13, 30, 'Rail', false, "#2A2A2A");
    addFloor(3, 14, 30, 'Rail R-Corner', false, "#2A2A2A");
    addFloor(3, 15, 30, 'Rail L-Corner', false, "#2A2A2A");
    addFloor(3, 14, 29, 'Rail R-End', false, "#2A2A2A");
    addFloor(3, 14, 28, 'Rail L-End', false, "#2A2A2A");
    addFloor(3, 15, 28, 'Dock wall', false, "#2A2A2A");
    addFloor(5, 9 + 3 + 3 + 3 + 9, 22, 'Countertop', false, "#2A2A2A");
    addFloor(2, 24, 7, 'Grass', false, "#2A2A2A");
    addFloor(2, 27, 7, 'Swamp', false, "#2A2A2A");
    addFloor(2, 6, 14, 'Box TL', false, "#2A2A2A");
    addFloor(2, 22, 14, 'Red box', false, "#2A2A2A");
    addFloor(2, 9, 7, 'Mountain Outline', false, "#2A2A2A");
    addFloor(2, 21, 7, 'Ocean', false, "#2A2A2A");
    addFloor(2, 3, 7, 'Dark Sand', false, "#2A2A2A");
    addFloor(2, 18, 7, 'Pond Water', false, "#2A2A2A");
    addFloor(2, 13, 7, 'Road Dark', false, "#2A2A2A");
    addFloor(2, 17, 7, 'Lava', false, "#2A2A2A");
    addFloor(1, 25, 4, 'Snow Biome', false, "#2A2A2A");
    addFloor(1, 25, 2, 'Lava Biome', false, "#2A2A2A");
  });
});
bootStrap.push(function () {
  game.world.objectTemplates['spawners'] = [];
  const spawners = _BLUEPRINTS.SPAWNERS;
  const template = _BLUEPRINTS.COMPLEX_ITEMS['spawner_template'];
  const keys = Object.keys(spawners);
  for (let key of keys) {
    const spawnerData = spawners[key];
    spawnerData.codename = key;
    const copy = game.clone(template);
    copy.codename = spawnerData.codename;
    if (!copy.meta) copy.meta = {};
    copy.name = spawnerData.name;
    copy.meta = {
      ...copy.meta,
      ...spawnerData.meta
    };
    _BLUEPRINTS.COMPLEX_ITEMS[copy.codename] = copy;
    game.world.objectTemplates['spawners'].push(_BLUEPRINTS.COMPLEX_ITEMS[copy.codename]);
  }
});
bootStrap.push(function () {
  let objList = _BLUEPRINTS.COMPLEX_ITEMS;
  let keys = Object.keys(objList);
  for (let i = 0; i < keys.length; i++) {
    let item = objList[keys[i]];
    if (!game.world.objectTemplates[item.parent]) {
      game.world.objectTemplates[item.parent] = [];
    }
    item.readName = item.name;
    item.codename = keys[i];
    game.world.objectTemplates[item.parent].push(item);
  }
});
bootStrap.push(function () {
  game.regenUITools = function () {
    game.world.objectTemplates.player_survival = [];
    game.world.objectTemplates.player_misc = [];
    game.world.objectTemplates.player_crafting = [];
    game.world.objectTemplates.player_tools = [{
      name: 'planning',
      type: 'walls',
      toolName: 'playersquaring',
      readName: 'Wall',
      codename: 'playersquaring',
      description: _LANG.WAITING_FOR_DESCRIPTION,
      cost: 0,
      across: 3,
      down: 3,
      blocks: 1,
      fill: false,
      complex: true,
      blockZone: 'all',
      recipe: 'pers_worlditem_buildwall',
      crafts: 'pers_worlditem_buildwall',
      collide: 'allowwall',
      data: {
        across: 4,
        down: 4
      }
    }, {
      type: 'walls',
      name: 'planning',
      fill: true,
      toolName: 'playersquaring',
      readName: 'Wood floor',
      codename: 'playersquaring',
      description: _LANG.WAITING_FOR_DESCRIPTION,
      cost: 0,
      across: 1,
      complex: true,
      blockZone: false,
      recipe: 'pers_worlditem_buildwall',
      crafts: 'pers_worlditem_buildwall',
      down: 13,
      blocks: 1,
      data: {
        across: 1,
        down: 13
      }
    }, {
      type: 'walls',
      name: 'planning',
      toolName: 'playersquaring',
      readName: 'Sand',
      codename: 'playersquaring',
      description: _LANG.WAITING_FOR_DESCRIPTION,
      cost: 0,
      fill: true,
      across: 1,
      complex: true,
      blockZone: false,
      recipe: 'pers_worlditem_buildwall',
      crafts: 'pers_worlditem_buildwall',
      down: 1,
      blocks: 1,
      data: {
        across: 1,
        down: 1
      }
    }, {
      name: 'planning',
      type: 'walls',
      toolName: 'playersquaring',
      readName: 'Cancel',
      codename: 'playersquaring',
      description: _LANG.WAITING_FOR_DESCRIPTION,
      cancel: true,
      fill: true,
      cost: 0,
      across: 3,
      down: 3,
      blocks: 1,
      collide: 'allowwall',
      data: {
        across: 1,
        down: 1
      }
    }];
    game.ui.data = {};
    var sprites = [];
    for (var sprite in _BLUEPRINTS.SPRITES) {
      sprites.push(_BLUEPRINTS.SPRITES[sprite]);
      _BLUEPRINTS.SPRITES[sprite].sprite = sprite;
      _BLUEPRINTS.SPRITES[sprite].simpleItem = true;
      _BLUEPRINTS.SPRITES[sprite].readName = _BLUEPRINTS.SPRITES[sprite].name;
    }
    game.uisprites = sprites;
    if (!game.editMode) {
      game.ui.data.menus = [{
        name: 'goBack',
        editMode: false,
        readName: 'Cancel',
        description: "",
        across: 1,
        down: 1,
        tools: game.world.objectTemplates.player_tools
      }, {
        name: 'planning',
        editMode: false,
        readName: 'Building',
        description: "",
        across: 2,
        down: 1,
        tools: game.world.objectTemplates.player_tools
      }, {
        name: 'utility',
        isPlayer: true,
        editMode: false,
        readName: 'Utility',
        description: "",
        across: 3,
        down: 1,
        tools: game.world.objectTemplates.player_survival
      }, {
        name: 'build',
        isPlayer: true,
        editMode: false,
        readName: 'Crafting',
        description: "",
        across: 3,
        down: 1,
        tools: game.world.objectTemplates.player_crafting
      }, {
        name: 'lab',
        isPlayer: true,
        editMode: false,
        readName: 'Lab',
        description: "",
        across: 3,
        down: 1,
        tools: game.world.objectTemplates.player_lab
      }];
    } else {
      game.ui.data.menus = [{
        name: 'playerwalls',
        editMode: true,
        readName: 'Player Walls',
        description: "",
        across: 2,
        down: 1,
        tools: game.world.objectTemplates.player_tools
      }, {
        name: 'playersurvival',
        editMode: true,
        readName: 'Player Survival',
        description: "",
        across: 3,
        down: 1,
        tools: game.world.objectTemplates.player_survival
      }, {
        name: 'walls',
        editMode: true,
        readName: "Walls",
        description: "",
        across: 2,
        down: 1,
        tools: game.world.objectTemplates.walls
      }, {
        name: 'npcs',
        editMode: true,
        readName: "NPCs",
        description: "",
        across: 24,
        down: 3,
        tools: game.world.objectTemplates.spawners
      }, {
        name: 'sprites',
        editMode: true,
        readName: 'Sprites',
        description: "",
        across: 19,
        down: 3,
        tools: sprites
      }, {
        name: 'worlditems',
        editMode: true,
        readName: "World Items",
        description: "",
        across: 24,
        down: 3,
        tools: game.world.objectTemplates.build_world_items
      }, {
        name: 'oldspawners',
        editMode: true,
        readName: 'Spawners',
        description: "",
        across: 21,
        down: 4,
        tools: game.world.objectTemplates.build_world_spawners
      }, {
        name: 'loot',
        editMode: true,
        readName: 'Loot',
        description: "",
        across: 19,
        down: 4,
        tools: game.world.objectTemplates.build_world_lootcontainers
      }, {
        name: 'persistent',
        editMode: true,
        readName: 'Persistent',
        description: "",
        across: 19,
        down: 4,
        tools: game.world.objectTemplates.build_persistent_items
      }, {
        name: 'utility',
        editMode: true,
        readName: 'Utility',
        description: "",
        across: 19,
        down: 4,
        tools: game.world.objectTemplates.build_util_objects
      }, {
        name: 'vehicles',
        editMode: true,
        readName: 'Vehicles',
        description: "",
        across: 19,
        down: 4,
        tools: game.world.objectTemplates.build_vehicles
      }, {
        name: 'crafting',
        editMode: true,
        readName: 'Crafting',
        description: "",
        across: 19,
        down: 4,
        tools: game.world.objectTemplates.build_persistent_craftbench
      }];
    }
  };
  game.regenUITools();
});
bootStrap.push(function () {
  game.util.clearTrees = function () {
    var trees = Object.assign(game.index.getIndex('sprite_lots_o_grass'), game.index.getIndex('sprite_tree_redfern'), game.index.getIndex('sprite_tree_redfernsmalld'), game.index.getIndex('sprite_tree_yellowfern'));
    for (let name in trees) {
      trees[name].markDelete();
    }
  };
});
bootStrap.push(function () {
  game.util.makeObjectFall = function (sprite) {
    if (!sprite || !sprite.y) {
      return false;
    }
    sprite.gotoY = sprite.y;
    sprite.y -= 1500;
    setTimeout(() => {
      game.tween(sprite, 'slideTo', {
        x: sprite.x,
        y: sprite.gotoY,
        duration: 2500
      });
      let shadow = new Sprite('effect_floor_shadow');
      game.render.objectLayer.addChild(shadow);
      shadow.x = sprite.x - 32;
      shadow.y = sprite.gotoY;
      shadow.alpha = 0;
      game.tween(shadow, 'fadeIn', {
        alpha: 0.75
      });
    }, game.rng(100, 1000));
  };
  game.util.makeAllFall = function () {
    game.index.getIndexesAsArray(['objects', 'life']).forEach(i => {
      game.util.makeObjectFall(i);
    });
  };
});
bootStrap.push(function () {
  game.util.closeDialog = function () {
    game.index.index.open_components['game_dialog'].destroy();
  };
});
bootStrap.push(function () {
  game.util.exportItems = function () {
    let csv = "name,codename,hasBp,hasRecipe,recipe";
    let bpCsv = "name,codename";
    let recipes = _BLUEPRINTS.RECIPES;
    let recipesKeys = Object.keys(recipes);
    let itemRecipes = {};
    let itemBps = {};
    for (let i = 0; i < recipesKeys.length; i++) {
      let key = recipesKeys[i];
      let recipe = recipes[key];
      itemRecipes[recipe.crafts] = recipe;
      itemRecipes[recipe.crafts].name = key;
    }
    let invItems = Object.assign({}, _BLUEPRINTS.COMPLEX_ITEMS, _BLUEPRINTS.INV_ITEMS);
    let invItemsKeys = Object.keys(invItems);
    for (let i = 0; i < invItemsKeys.length; i++) {
      let key = invItemsKeys[i];
      let item = invItems[key];
      if (!item.meta || !item.meta.recipe) {
        continue;
      }
      itemBps['recipe_' + item.meta.recipe] = item;
      bpCsv = bpCsv + "\n" + item.name + "," + key;
    }
    for (let i = 0; i < invItemsKeys.length; i++) {
      let key = invItemsKeys[i];
      let item = invItems[key];
      let recipe = itemRecipes[key] || false;
      let hasRecipe = !recipe ? false : true;
      let hasBlueprint = !itemBps[recipe.name] ? false : true;
      if (item.meta && item.meta.recipe) {
        continue;
      }
      csv = csv + "\n" + item.name + "," + key + "," + hasBlueprint + "," + hasRecipe + ",'" + JSON.stringify(recipe) + "'";
    }
  };
});
bootStrap.push(function () {
  game.util.toggleCircleTool = function () {
    game.buildTools.toggleCircle();
  };
  game.util.allowUndo = function () {
    game.grid.allowUndo();
  };
  game.util.undo = function () {
    game.grid.undo();
  };
});
bootStrap.push(function () {
  game.ee.on('world-rightclick-up', function () {
    game.util.destroyPlaceObject();
  });
  game.ee.on('world-leftclick-up', function () {
    game.util.doPlaceObject();
  });
  game.util.destroyPlaceObject = function () {
    if (game.util.placeObjectContainer) {
      game.util.placeObjectContainer.destroy();
      game.util.placeObjectContainer = false;
    }
  };
  game.util.makeItem = function (item) {
    const copy = JSON.parse(JSON.stringify(item));
    if (_BLUEPRINTS.COMPLEX_ITEMS[item.codename]) {
      return new ComplexItem(copy.codename, copy.data);
    } else {
      return new SimpleItem(copy.sprite, copy.data);
    }
  };
  game.util.doPlaceObject = function () {
    if (!game.util.placeObjectContainer) {
      return;
    }
    let tool = game.util.placeObjectContainer;
    let furni = {};
    furni = game.util.makeItem(tool.item);
    furni.scaleToGame();
    furni.x = tool.x;
    furni.y = tool.y;
    game.world.addObject(furni, true);
    game.render.objectLayer.addChild(furni);
    furni.onCreate();
    this.lastsweep = false;
  };
  game.setTicker('placeObject', function () {
    if (!game.util.placeObjectContainer) {
      return false;
    }
    let x = game.mouseX - game.util.placeObjectContainer.width + 32;
    let y = game.mouseY - game.util.placeObjectContainer.height + 32;
    if (game.snap == true) {
      x = game.atGridPos(game.gridPos(x));
      y = game.atGridPos(game.gridPos(y));
    }
    game.util.placeObjectContainer.x = x;
    game.util.placeObjectContainer.y = y;
  });
  game.util.placeObject = function (item, options) {
    if (!item) {}
    if (!options) {
      options = {
        type: 'editor',
        snapDefault: true
      };
    }
    game.snap = typeof options.snapDefault == 'undefined' ? true : options.snapDefault;
    game.util.destroyPlaceObject();
    game.util.placeObjectContainer = new SimpleItem(item.sprite);
    game.util.placeObjectContainer.item = item;
    game.util.placeObjectContainer.scaleToGame();
    game.render.aboveLife.addChild(game.util.placeObjectContainer);
  };
});
bootStrap.push(function () {
  game.util.linking = false;
  game.util.isLinking = function () {
    return game.util.linking;
  };
  game.util.stopLinking = function () {
    game.util.linking = false;
    game.util.resetLink();
  };
  game.util.resetLink = function () {
    game.util.selectOne = false;
    game.util.selectTwo = false;
  };
  game.util.createLink = function (source, dest) {
    game.util.linkingSlot = source || 'usedata1';
    game.util.linkingToSlot = dest || game.util.linkingSlot;
    game.util.linking = true;
  };
  game.util.unlink = function (item, slot) {
    let linkTo = game.index.find(item.data[slot]);
    if (!linkTo) {
      return;
    }
    linkTo.data[slot] = false;
    delete linkTo.data[slot];
  };
  game.util.makeLink = function (linkFrom, linkTo) {
    game.util.unlink(linkTo, game.util.linkingToSlot);
    game.util.unlink(linkFrom, game.util.linkingSlot);
    linkTo.data.persist = 1;
    linkFrom.data.persist = 1;
    linkTo.data.persistId = linkTo.id;
    linkFrom.data.persistId = linkFrom.id;
    linkTo.data[game.util.linkingToSlot] = linkFrom.id;
    linkFrom.data[game.util.linkingSlot] = linkTo.id;
    game.util.showLink(linkTo);
  };
  game.util.showLink = function (item, slot) {
    if (game.util.rope1) {
      game.util.rope1.destroy();
      game.util.rope1 = false;
    }
    slot = slot || 'usedata1';
    let linkTo = game.index.find(item.data[slot]);
    if (!linkTo) {
      return;
    }
    game.util.rope1 = game.util.createRope(item, linkTo);
  };
  game.ee.on('object_selected', function (item) {
    if (game.util.rope1) {
      game.util.rope1.destroy();
      game.util.rope1 = false;
    }
    game.util.showLink(item);
    if (!game.util.isLinking()) {
      return;
    }
    if (!game.util.selectOne) {
      game.util.selectOne = item;
      return;
    }
    if (game.util.selectOne.id === item.id) {
      return;
    }
    game.util.makeLink(game.util.selectOne, item);
    game.util.stopLinking();
  });
});
bootStrap.push(function () {
  game.util.createRope = function (start, end) {
    let rope = new ABE.UIPane();
    rope.meta = {
      sort: false
    };
    rope.parentGroup = game.render.sortGroup;
    rope.height = 5;
    rope.pivot.set(0, 0);
    game.render.lifeLayer.addChild(rope);
    rope.change = function (start, end) {
      this.x = start.x + 32;
      this.y = start.y + 32;
      let ropeStart = this;
      let ropeEnd = {
        x: end.x + 32,
        y: end.y + 50
      };
      let dist = game.world.dist(ropeStart, ropeEnd);
      this.rotation = game.world.angleAsRad(ropeStart, ropeEnd);
      this.width = dist;
    };
    rope.change(start, end);
    return rope;
  };
});
bootStrap.push(function () {
  game.ee.on('game_started_new_game', () => {
    game.util.albearNpc = new LifeObject();
    game.util.albearNpc.setBlank();
    game.util.albearNpc.data.name = "Albear";
    game.util.albearRevive = function (player, teleport) {
      player.mutationRevive();
      if (teleport) player.teleportSafe();
    };
    game.util.albear = function (dialog, dir, body) {
      game.util.albearNpc.data.dialog = dialog;
      body = body || "";
      dir = dir || "down";
      dialog = dialog || "dialog_albear_anytime";
      game.util.albearNpc.chat({
        dialog: dialog,
        dir: dir,
        cantClose: true,
        picOffsetY: -20
      });
    };
    game.util.albearNpc.init();
    game.util.albearNpc.inventory.body.addItem(new InventoryItem('ss_item_body_albear'), true);
  });
});
bootStrap.push(function () {
  game.lines = {};
  const updatePawnLines = () => {
    if (!game.pawnLineTick) {
      game.pawnLineTick = game.ts + 200;
      return;
    }
    if (game.pawnLineTick > game.ts) {
      return;
    }
    const pawns = game.session.getSelectedPawns();
    const PAWN_COUNT = Object.keys(pawns).length;
    if (!PAWN_COUNT) return;
    game.pawnLineTick = game.ts + 40;
    if (!game.lines.active) {
      clearHolders();
      if (game.lines.line) game.lines.line.destroy();
      return false;
    }
    game.lines.endX = game.snapToGrid(game.mouseX);
    game.lines.endY = game.snapToGrid(game.mouseY);
    const p1 = {
      x: game.lines.startX,
      y: game.lines.startY
    };
    const p2 = {
      x: game.lines.endX,
      y: game.lines.endY
    };
    let distance = game.world.dist(p1, p2);
    distance = Math.max(distance, 68);
    const angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    game.lines.line.x = game.lines.startX + 32;
    game.lines.line.y = game.lines.startY + 32;
    game.lines.line.angle = angleDeg;
    game.lines.line.width = distance;
    clearHolders();
    let pointI = 0;
    let norun = 0;
    let maxSquares = Math.ceil(distance / 64);
    maxSquares = Math.min(maxSquares, PAWN_COUNT);
    if (PAWN_COUNT === 1) game.lines.line.alpha = 0;
    for (let i = 0; i < PAWN_COUNT; i++) {
      norun++;
      if (norun > 100) {
        break;
      }
      const holder = pawnHolder(i);
      holder.alpha = 0.7;
      game.render.lifeLayer.addChild(holder);
      let percentage = distance / Math.max(1, maxSquares - 1) * pointI;
      if (maxSquares === 1) {
        percentage = distance / maxSquares * maxSquares;
      }
      const point = {
        x: p1.x + percentage / distance * (p2.x - p1.x),
        y: p1.y + percentage / distance * (p2.y - p1.y)
      };
      point.x = game.snapToGrid(point.x);
      point.y = game.snapToGrid(point.y);
      if (i % maxSquares === 0) {
        pointI = 0;
      }
      let loopout = 0;
      let flip = 0;
      while (PAWN_COUNT > 0 && game.lines.positions[point.x + "-" + point.y]) {
        loopout++;
        if (loopout > 100) break;
        switch (flip) {
          case -2:
            point.y -= 64;
            point.x += 128;
            break;
          case -1:
            point.y -= 64;
            break;
          case 0:
            point.x += 64;
            break;
          case 1:
            point.y += 64;
            break;
          case 2:
            point.x -= 64;
            break;
          case 3:
            point.y += 64;
            flip = -3;
            break;
        }
        point.x = game.snapToGrid(point.x);
        point.y = game.snapToGrid(point.y);
        flip++;
      }
      holder.x = point.x;
      holder.y = point.y;
      game.lines.positions[holder.x + "-" + holder.y] = holder;
      game.lines.pawnPositions[holder.data.originalId] = {
        x: holder.x + 16,
        y: holder.y + 16
      };
      pointI++;
    }
  };
  game.ee.on("background-rightclick-down", () => {
    if (game.index.indexCount('context_menus') > 0) {
      return false;
    }
    clearHolders();
    if (game.lines.line) game.lines.line.destroy();
    game.lines.startX = game.snapToGrid(game.mouseX);
    game.lines.startY = game.snapToGrid(game.mouseY);
    game.lines.active = true;
    game.lines.positions = {};
    game.lines.pawnPositions = {};
    game.lines.line = new UIPane({
      fullscreen: false,
      fill: "0x000000",
      padding: 0,
      x: game.mouseX,
      y: game.mouseY,
      w: 10,
      h: 10
    });
    game.lines.line.alpha = 0.5;
    game.render.lifeLayer.addChild(game.lines.line);
    updatePawnLines();
  });
  game.ee.on("rightclick-up", () => {
    game.lines.active = false;
  });
  function pawnHolder(offset) {
    const pawns = game.session.getSelectedPawns();
    let ids = Object.keys(pawns);
    if (!ids.length) return new UIContainer();
    const selectedPawn = pawns[ids[offset]];
    if (!selectedPawn) {}
    const clone = selectedPawn.cloneForUI("down");
    clone.data.originalId = selectedPawn.id;
    return clone;
  }
  function findPosition(positions, line, holder, gap) {
    let posX = holder.x;
    let posY = holder.y;
    let key = posX + "-" + posY;
    let flip = 0;
    const GAP_SIZE = gap || 64;
    const limit = 100;
    let i = 0;
    while (positions[key]) {
      i++;
      if (i > limit) {
        break;
      }
      switch (flip) {
        case 0:
          posX += GAP_SIZE;
          break;
        case 1:
          posY += GAP_SIZE;
          break;
        case 2:
          posX -= GAP_SIZE;
          break;
        case 3:
          posY -= GAP_SIZE;
          break;
      }
      key = posX + "-" + posY;
      flip++;
      if (flip === 3) flip = 0;
    }
    positions[key] = holder;
    holder.x = line.x + posX;
    holder.y = line.y + posY;
  }
  function clearHolders() {
    for (let key in game.lines.positions) {
      game.lines.positions[key].destroy();
    }
    game.lines.positions = {};
  }
  game.setTicker("pawn_lines", () => {
    updatePawnLines();
  });
});
bootStrap.push(function () {
  game.util.newLife = function (lifeClass, id, isPlayer, level, species, faction, bodies, brains, masks, weapons, backWeapons, dummyObject) {
    const life = game.world.spawnNpc(id, {
      species: species,
      isPlayer: isPlayer || false
    }, lifeClass);
    life.setBlank();
    life.randomizeStats(level);
    life.data.faction = faction || "nomad";
    if (!dummyObject) {
      game.render.lifeLayer.addChild(life);
      game.world.addObject(life);
      game.world.addToServer(life);
    }
    let disabledBody = false;
    let disabledBrain = true;
    let disabledMask = false;
    let disabledWeapon = false;
    let disabledBackWeapon = false;
    if (species === "species_robot") {
      disabledMask = true;
      disabledBody = true;
    }
    if (species === "species_animal") {
      disabledMask = true;
      disabledBody = true;
    }
    if (species === "species_lokal") {
      disabledMask = true;
    }
    life.setSpecies(species);
    try {
      if (brains) {
        life.inventory.brain.addItem(new ABE.InventoryItem(brains[game.rng(0, brains.length - 1)], {
          disabled: disabledBrain
        }), true);
      }
      if (bodies) {
        life.inventory.body.addItem(new ABE.InventoryItem(bodies[game.rng(0, bodies.length - 1)], {
          disabled: disabledBody
        }), true);
      }
      if (masks) {
        life.inventory.mask.addItem(new ABE.InventoryItem(masks[game.rng(0, masks.length - 1)], {
          disabled: disabledMask
        }), true);
      }
      if (weapons) {
        life.inventory.weapon.addItemNow(new ABE.InventoryItem(weapons[game.rng(0, weapons.length - 1)], {
          disabled: disabledWeapon
        }), true);
      }
      if (backWeapons) {
        life.inventory.backWeapon.addItemNow(new ABE.InventoryItem(backWeapons[game.rng(0, backWeapons.length - 1)], {
          disabled: disabledBackWeapon
        }), true);
      }
    } catch (e) {}
    if (!dummyObject) {
      life.sync();
    }
    return life;
  };
});
bootStrap.push(function () {
  if (!game.urlVar('useMic')) return;
  var paths = document.getElementsByTagName('path');
  var visualizer = document.getElementById('visualizer');
  var mask = visualizer.getElementById('mask');
  var h = document.getElementsByTagName('h1')[0];
  var path;
  var report = 0;
  var soundAllowed = function (stream) {
    window.persistAudioStream = stream;
    h.innerHTML = "Thanks";
    h.setAttribute('style', 'opacity: 0;');
    var audioContent = new AudioContext();
    var audioStream = audioContent.createMediaStreamSource(stream);
    var analyser = audioContent.createAnalyser();
    audioStream.connect(analyser);
    analyser.fftSize = 1024;
    var frequencyArray = new Uint8Array(analyser.frequencyBinCount);
    visualizer.setAttribute('viewBox', '0 0 255 255');
    for (var i = 0; i < 255; i++) {
      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('stroke-dasharray', '4,1');
      mask.appendChild(path);
    }
    var doDraw = function () {
      requestAnimationFrame(doDraw);
      analyser.getByteFrequencyData(frequencyArray);
      var adjustedLength;
      for (var i = 0; i < 255; i++) {
        adjustedLength = Math.floor(frequencyArray[i]) - Math.floor(frequencyArray[i]) % 5;
        paths[i].setAttribute('d', 'M ' + i + ',255 l 0,-' + adjustedLength);
      }
    };
    doDraw();
  };
  var soundNotAllowed = function (error) {
    h.innerHTML = "You must allow your microphone.";
  };
  navigator.getUserMedia({
    audio: true
  }, soundAllowed, soundNotAllowed);
});
bootStrap.push(function () {
  function makeColor(number) {
    const normalizedNumber = Math.max(0, Math.min(number % 10 / 10, 1));
    const blue = 10 + Math.floor((1 - normalizedNumber) * 205);
    const green = 50 + Math.floor((1 - normalizedNumber) * 205);
    const red = Math.floor((1 - normalizedNumber) * 120) + Math.floor((1 - normalizedNumber) * 120);
    const componentToHex = c => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    const hexColor = '#' + componentToHex(red) + componentToHex(green) + componentToHex(blue);
    return hexColor;
  }
  if (!game.editMode) return;
  game.util.drawTool = {
    zone: game.activeDrawZone || 1,
    isActive: false,
    isDown: false
  };
  game.util.drawZoneTool = zone => {
    game.util.drawTool.isActive = true;
    game.drawingTool = true;
    showZones();
  };
  let drawnZones = [];
  function cleanup() {
    for (let zone of drawnZones) {
      zone.destroy();
    }
    drawnZones = [];
  }
  function showZones() {
    cleanup();
    for (let chunkKey in game.grid.loadedChunks) {
      const chunkData = game.grid.loadedChunks[chunkKey];
      if (!chunkData.chunk.meta || !chunkData.chunk.meta.zone) continue;
      const holder = new UIContainer();
      const label = game.render.text("Zone: " + chunkData.chunk.meta.zone);
      label.scale.set(5);
      const graphics = new UIPane({
        fill: makeColor(chunkData.chunk.meta.zone),
        w: 10 * 64,
        h: 10 * 64
      });
      graphics.alpha = 0.75;
      graphics.x = chunkData.x * 10 * 64;
      graphics.y = chunkData.y * 10 * 64;
      holder.addChild(graphics);
      holder.addChild(label);
      game.render.lifeLayer.addChild(holder);
      drawnZones.push(holder);
    }
  }
  game.util.drawTool.replaceAllLoadedZones = () => {
    for (let chunkKey in game.grid.loadedChunks) {
      const chunkData = game.grid.loadedChunks[chunkKey];
      if (!chunkData) return void 0;
      if (!chunkData.chunk.meta) {
        chunkData.chunk.meta = {};
      }
      chunkData.chunk.meta.zone = game.activeDrawZone;
    }
  };
  if (game.util.drawZoneTool.onDown) {
    game.ee.off('leftclick-down', game.util.drawZoneTool.onDown);
  }
  game.ee.on('leftclick-up', () => {
    game.util.drawTool.isDown = false;
  });
  if (game.util.drawZoneTool.onRDown) {
    game.ee.off('rightclick-down', game.util.drawZoneTool.onRDown);
  }
  game.util.drawZoneTool.onRDown = () => {
    if (game.util.drawTool.isActive) {
      game.util.drawTool.isActive = false;
    }
    cleanup();
  };
  game.util.drawZoneTool.onDown = e => {
    if (!game.input.isLeftClick(e)) return;
    if (!game.util.drawTool.isActive) return;
    game.util.drawTool.isDown = true;
    game.util.drawZoneTool.updateZoneAtMouse();
  };
  game.util.drawZoneTool.updateZoneAtMouse = () => {
    for (let chunkKey in game.grid.loadedChunks) {
      const chunkData = game.grid.loadedChunks[chunkKey];
      if (!chunkData) return void 0;
      if (!chunkData.chunk.meta) {
        chunkData.chunk.meta = {};
      }
      const region = game.grid.getRegion({
        x: game.mouseX,
        y: game.mouseY
      });
      if (game.util.insideCircle(chunkData.x, chunkData.y, region.x, region.y, 3)) {
        chunkData.chunk.meta.zone = game.activeDrawZone;
        chunkData.chunk.meta.genTrees = game.zoneTreesEnabled || 0;
      }
    }
    showZones();
  };
  game.util.drawZoneTool.updateZoneAtMouseOld = () => {
    const region = game.grid.getRegion({
      x: game.mouseX,
      y: game.mouseY
    });
    const chunkData = game.grid.loadedChunks[region.x + "-" + region.y];
    if (!chunkData) return void 0;
    if (!chunkData.chunk.meta) {
      chunkData.chunk.meta = {};
    }
    chunkData.chunk.meta.zone = game.activeDrawZone;
    showZones();
  };
  game.ee.on('rightclick-down', game.util.drawZoneTool.onRDown);
  game.render.viewport.on('pointerdown', game.util.drawZoneTool.onDown);
  game.setTicker("zoningtool", () => {
    if (!game.util.drawTool.isActive) return;
    if (!game.util.drawTool.lastRefresh || game.util.drawTool.lastRefresh < Date.now() - 500) {
      game.util.drawTool.lastRefresh = Date.now();
      showZones();
    }
    if (game.util.drawTool.lastDown && game.util.drawTool.lastDown > Date.now() - 10) return;
    game.util.drawTool.lastDown = Date.now();
    if (!game.util.drawTool.isDown) return;
    game.util.drawZoneTool.updateZoneAtMouse();
  });
});
bootStrap.push(function () {
  let infoHolder = null;
  function newInfoHolder() {
    const holder = game.render.text("Info:");
    game.render.gameGUI.addChild(holder);
    return holder;
  }
  function showZoneInfo() {
    const {
      x,
      y
    } = game.render.viewport.toScreen(game.mouseX, game.mouseY);
    const worldX = game.mouseX;
    const worldY = game.mouseY;
    const zone = game.session.getZoneAt(worldX, worldY);
    if (!infoHolder) {
      infoHolder = newInfoHolder();
    }
    const region = game.grid.getRegion({
      x: game.mouseX,
      y: game.mouseY
    });
    const temp = ABE.getTemp(region.x, region.y);
    infoHolder.text = `
		Zone: ${zone.name} [${zone.id}]\r\n
		Economy: ${zone.meta.economy}
		Visited: ${zone.meta.visited}
		Faction: ${zone.meta.faction}
		Region: ${region.x} ${region.y}
		Temp: ${temp}
		`;
    infoHolder.x = x;
    infoHolder.y = y + 32;
  }
  if (game.editMode && game.urlVar('version') !== "editor") {
    game.setTicker("zone_info", () => {
      showZoneInfo();
    });
  }
});
bootStrap.push(function () {
  game.util.spawnerToLife = function (spawner) {
    if (!spawner.meta || !spawner.meta.species) {
      return;
    }
    let species = spawner.meta.species.split(',');
    if (!species.length) species = ['species_clone'];
    let weapon = [];
    let secondWeapon = [];
    spawner.meta.mainWeapon = spawner.meta.mainWeapon || "";
    spawner.meta.secondWeapon = spawner.meta.secondWeapon || "";
    spawner.meta.body = spawner.meta.body || "";
    spawner.meta.brain = spawner.meta.brain || "";
    spawner.meta.head = spawner.meta.head || "";
    if (spawner.meta.mainWeapon !== "") {
      weapon = spawner.meta.mainWeapon.split(',');
    }
    if (!weapon.length) weapon = false;
    if (spawner.meta.rarelyHasMainWeapon && game.rng(0, 3) !== 2) weapon = false;
    if (spawner.meta.secondWeapon !== "") {
      secondWeapon = spawner.meta.secondWeapon.split(',');
    }
    if (!secondWeapon.length) secondWeapon = false;
    if (spawner.meta.rarelyHasSecondWeapon && game.rng(0, 3) !== 2) secondWeapon = false;
    const npcSpecies = species[game.rng(0, species.length - 1)];
    const speciesData = _BLUEPRINTS.SPECIES[npcSpecies];
    if (!speciesData) {
      return;
    }
    const npc = game.util.newLife(speciesData.lifeClass || 'LifeObject', spawner.id + "-npc", false, game.rng(spawner.meta.minLevel || 1, spawner.meta.maxLevel || 10), npcSpecies, spawner.meta.faction, spawner.meta.body.split(",") || false, spawner.meta.brain.split(",") || false, spawner.meta.head.split(",") || false, weapon, secondWeapon, true);
    npc.data = {
      ...spawner.meta,
      ...npc.data,
      ...spawner.data
    };
    npc.x = spawner.x;
    npc.y = spawner.y;
    npc.data.levels.savage.level = spawner.meta.stats.savage || npc.data.levels.savage.level;
    npc.data.levels.melee.level = spawner.meta.stats.melee || npc.data.levels.melee.level;
    npc.data.levels.athletics.level = spawner.meta.stats.athletics || npc.data.levels.athletics.level;
    npc.data.levels.ranged.level = spawner.meta.stats.ranged || npc.data.levels.ranged.level;
    npc.data.levels.toughness.level = spawner.meta.stats.toughness || npc.data.levels.toughness.level;
    npc.data.levels.strength.level = spawner.meta.stats.strength || npc.data.levels.strength.level;
    npc.data.levels.crafting.level = spawner.meta.stats.crafting || npc.data.levels.crafting.level;
    npc.data.levels.intelligence.level = spawner.meta.stats.intelligence || npc.data.levels.intelligence.level;
    return npc;
  };
});
bootStrap.push(function () {
  game.util.insideCircle = function (x, y, circleX, circleY, radius) {
    let distanceFromCenter = Math.sqrt((x - circleX) ** 2 + (y - circleY) ** 2);
    return distanceFromCenter < radius;
  };
});
bootStrap.push(function () {
  if (!game.editMode) return;
  function saveChunk(chunk, destroy) {
    if (chunk.destroying || chunk.destroyed) {
      return false;
    }
    if (!chunk.loaded || chunk.loading) {
      return false;
    }
    if (chunk.saving) {
      return false;
    }
    chunk.saving = true;
    let indexName = "region-" + chunk.x + "-" + chunk.y;
    let chunkData = JSON.parse(JSON.stringify(game.grid.index.getIndex(indexName)));
    let key = chunk.x + "_" + chunk.y + ".json";
    const currentChunk = game.grid.chunkTree[key];
    var save = {
      drawMatrix: chunk.tiles.drawMatrix,
      objects: chunkData
    };
    if (chunk.chunk.meta) {
      save.meta = chunk.chunk.meta;
    }
    if (currentChunk.meta) {
      save.meta = currentChunk.meta;
    }
    if (chunk.meta && save.meta) {
      save.meta = {
        ...save.meta,
        ...chunk.meta
      };
    }
    if (chunk.meta && !save.meta) {
      save.meta = currentChunk.meta;
    }
    return game.miniJsonEncode(save);
  }
  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  game.util.exportLoadedChunks = () => {
    const save = {};
    for (let chunkKey in game.grid.loadedChunks) {
      save[chunkKey.replace(/-/, "_") + ".json"] = saveChunk(game.grid.loadedChunks[chunkKey]);
    }
    download("exportmap.json", JSON.stringify(save));
  };
  game.util.importChunks = () => {
    readChunkFile();
  };
  function doImport(contents) {
    const tree = JSON.parse(contents);
    for (let chunkKey in game.grid.loadedChunks) {
      game.grid.unloadChunk(game.grid.loadedChunks[chunkKey], true);
    }
    game.grid.loadedChunks = {};
    game.grid.chunkTree = {
      ...game.grid.chunkTree,
      ...tree
    };
  }
  function readChunkFile() {
    var input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', function (event) {
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.onload = function (event) {
        doImport(event.target.result);
      };
      reader.readAsText(file);
    });
    input.click();
  }
});
bootStrap.push(function () {
  if (!game.urlVar('cameraControls')) return;
  const keyPanRight = "6";
  const keyPanLeft = "4";
  const keyPanUp = "8";
  const keyPanDown = "2";
  const keyPanIn = "1";
  const keyPanOut = "7";
  const keySpeedUp = "9";
  const keySpeedDown = "3";
  const keyFullscreen = "0";
  const keyHidecursor = "+";
  let pan = false;
  let hideCursor = false;
  let cursor = game.render.pixi.view.style.cursor;
  game.ee.on('keyup-' + keyFullscreen, () => {
    if (!document.fullscreenElement) {
      game.render.pixi.view.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });
  game.ee.on('keyup-' + keyHidecursor, () => {
    if (!hideCursor) cursor = game.render.pixi.view.style.cursor;
    hideCursor = !hideCursor;
    if (!hideCursor) game.render.pixi.view.style.cursor = cursor;
  });
  game.ee.on('keyup-' + keyPanLeft, () => {
    if (pan) return pan = false;
    pan = "left";
  });
  game.ee.on('keyup-' + keyPanRight, () => {
    if (pan) return pan = false;
    pan = "right";
  });
  game.ee.on('keyup-' + keyPanUp, () => {
    if (pan) return pan = false;
    pan = "up";
  });
  game.ee.on('keyup-' + keyPanDown, () => {
    if (pan) return pan = false;
    pan = "down";
  });
  game.ee.on('keyup-' + keyPanIn, () => {
    if (pan) return pan = false;
    pan = "in";
  });
  game.ee.on('keyup-' + keyPanOut, () => {
    if (pan) return pan = false;
    pan = "out";
  });
  game.ee.on('keyup-' + keySpeedUp, () => {
    game.panSpeed += 1;
  });
  game.ee.on('keyup-' + keySpeedDown, () => {
    game.panSpeed -= 1;
  });
  game.panSpeed = 10;
  game.setTicker("dev_camera", () => {
    if (hideCursor) game.render.pixi.view.style.cursor = 'none';
    if (!pan) return;
    let addX = 0;
    let addY = 0;
    let addScale = 0.01;
    if (pan === "in") return game.render.viewport.scaled += addScale;
    if (pan === "out") return game.render.viewport.scaled -= addScale;
    if (pan === "left") addX = -game.panSpeed;
    if (pan === "right") addX = game.panSpeed;
    if (pan === "up") addY = game.panSpeed;
    if (pan === "down") addY = -game.panSpeed;
    game.render.viewport.moveCenter(game.render.viewport.center.x + addX, game.render.viewport.center.y + addY);
  });
  game.ee.on('keyup-5', function () {
    game.render.aboveAll.alpha = !game.render.aboveAll.alpha;
  });
});
bootStrap.push(function () {
  return;
  class OptimizedQuadtree {
    constructor(bounds, capacity, maxDepth, depth = 0) {
      this.bounds = bounds;
      this.capacity = capacity;
      this.maxDepth = maxDepth;
      this.depth = depth;
      this.roofs = [];
      this.divided = false;
    }
    subdivide() {
      const {
        x,
        y,
        width,
        height
      } = this.bounds;
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      this.northeast = new OptimizedQuadtree({
        x: x + halfWidth,
        y: y,
        width: halfWidth,
        height: halfHeight
      }, this.capacity, this.maxDepth, this.depth + 1);
      this.northwest = new OptimizedQuadtree({
        x: x,
        y: y,
        width: halfWidth,
        height: halfHeight
      }, this.capacity, this.maxDepth, this.depth + 1);
      this.southeast = new OptimizedQuadtree({
        x: x + halfWidth,
        y: y + halfHeight,
        width: halfWidth,
        height: halfHeight
      }, this.capacity, this.maxDepth, this.depth + 1);
      this.southwest = new OptimizedQuadtree({
        x: x,
        y: y + halfHeight,
        width: halfWidth,
        height: halfHeight
      }, this.capacity, this.maxDepth, this.depth + 1);
      this.divided = true;
    }
    insert(roof) {
      if (!this.contains(this.bounds, roof)) return false;
      if (this.roofs.length < this.capacity || this.depth >= this.maxDepth) {
        this.roofs.push(roof);
        return true;
      }
      if (!this.divided) {
        this.subdivide();
      }
      if (this.northeast.insert(roof) || this.northwest.insert(roof) || this.southeast.insert(roof) || this.southwest.insert(roof)) {
        return true;
      }
    }
    contains(bounds, roof) {
      return roof.some(point => point.x >= bounds.x && point.x < bounds.x + bounds.width && point.y >= bounds.y && point.y < bounds.y + bounds.height);
    }
    query(range, found) {
      if (!this.intersects(range, this.bounds)) return found;
      for (let roof of this.roofs) {
        if (this.contains(range, roof)) {
          found.push(roof);
        }
      }
      if (this.divided) {
        this.northwest.query(range, found);
        this.northeast.query(range, found);
        this.southwest.query(range, found);
        this.southeast.query(range, found);
      }
      return found;
    }
    intersects(range, bounds) {
      return !(range.x > bounds.x + bounds.width || range.x + range.width < bounds.x || range.y > bounds.y + bounds.height || range.y + range.height < bounds.y);
    }
  }
  const GRID_SIZE = 64;
  const quadtreeBounds = {
    x: 0,
    y: 0,
    width: 12800,
    height: 640
  };
  const quadtree = new OptimizedQuadtree(quadtreeBounds, 4, 8);
  const app = game.render.pixi;
  const roofContainer = new PIXI.Container();
  game.render.lifeLayer.addChild(roofContainer);
  function createRoofGraphics(roof) {
    const roofGraphics = new PIXI.Graphics();
    roofGraphics.beginFill(0x8B4513);
    roofGraphics.moveTo(game.atGridPos(roof[0].x), game.atGridPos(roof[0].y));
    for (let i = 1; i < roof.length; i++) {
      roofGraphics.lineTo(game.atGridPos(roof[i].x), game.atGridPos(roof[i].y));
    }
    roofGraphics.lineTo(game.atGridPos(roof[0].x), game.atGridPos(roof[0].y));
    roofGraphics.endFill();
    roofContainer.addChild(roofGraphics);
    return roofGraphics;
  }
  function isPlayerInsideRoof(player, roof) {
    let inside = false;
    for (let i = 0, j = roof.length - 1; i < roof.length; j = i++) {
      const xi = roof[i].x,
        yi = roof[i].y;
      const xj = roof[j].x,
        yj = roof[j].y;
      const intersect = yi > player.y != yj > player.y && player.x < (xj - xi) * (player.y - yi) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
  function updateRoofVisibility() {
    const range = {
      x: player.x - player.width / 2,
      y: player.y - player.height / 2,
      width: player.width,
      height: player.height
    };
    const visibleRoofs = quadtree.query(range, []);
    roofContainer.children.forEach(child => child.visible = true);
    return;
    visibleRoofs.forEach(roof => {
      if (!roof.graphics) {
        roof.graphics = createRoofGraphics(roof);
      }
      roof.graphics.visible = !isPlayerInsideRoof(player, roof);
    });
  }
  function discoverRoofPolygon(x, y, across, down) {
    const boundary = floodFill(x, y);
    if (boundary) {
      return boundary;
    }
    return [];
  }
  let player = {
    x: 150,
    y: 150,
    width: 50,
    height: 50
  };
  app.ticker.add(() => {
    updateRoofVisibility();
  });
  function olfloodFill(x, y, known, boundary) {
    if (!known) {
      known = {};
    }
    if (!boundary) {
      boundary = [];
    }
    let key = x + "-" + y;
    if (known[key]) {
      return;
    }
    if (game.grid.isTileWall(x, y)) {
      return;
    }
    known[key] = true;
    if (x === 0 || y === 0 || game.grid.isTileWall(x - 1, y) || game.grid.isTileWall(x + 1, y) || game.grid.isTileWall(x, y - 1) || game.grid.isTileWall(x, y + 1)) {
      boundary.push({
        x,
        y
      });
      known[key] = true;
    }
    floodFill(x, y - 1, known, boundary);
    floodFill(x + 1, y, known, boundary);
    floodFill(x, y + 1, known, boundary);
    floodFill(x - 1, y, known, boundary);
    return boundary;
  }
  function floodFill(x, y) {
    const height = 200 * 10;
    const width = 200 * 10;
    const visited = new Set();
    const boundaryPoints = new Set();
    const directions = [{
      dx: 1,
      dy: 0
    }, {
      dx: -1,
      dy: 0
    }, {
      dx: 0,
      dy: 1
    }, {
      dx: 0,
      dy: -1
    }];
    function isInside(x, y) {
      return x >= 0 && x < width && y >= 0 && y < height;
    }
    function dfs(x, y) {
      if (!isInside(x, y) || visited.has(`${x},${y}`) || game.grid.isTileWall(x, y)) {
        return;
      }
      visited.add(`${x},${y}`);
      if (isBoundary(x, y)) {
        boundaryPoints.add(`${x},${y}`);
      }
      for (const {
        dx,
        dy
      } of directions) {
        dfs(x + dx, y + dy);
      }
    }
    function isBoundary(x, y) {
      for (const {
        dx,
        dy
      } of directions) {
        if (isInside(x + dx, y + dy) && game.grid.isTileWall(x + dx, y + dy)) {
          return true;
        }
      }
      return false;
    }
    function getBoundaryPoints() {
      const points = [];
      for (const point of boundaryPoints) {
        const [x, y] = point.split(',').map(Number);
        points.push({
          x,
          y
        });
      }
      return points;
    }
    function convexHull(points) {
      points.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
      const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
      const lower = [];
      for (const point of points) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
          lower.pop();
        }
        lower.push(point);
      }
      const upper = [];
      for (let i = points.length - 1; i >= 0; i--) {
        const point = points[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
          upper.pop();
        }
        upper.push(point);
      }
      upper.pop();
      lower.pop();
      return lower.concat(upper);
    }
    dfs(x, y);
    const boundaryPointsArray = getBoundaryPoints();
    return boundaryPointsArray;
    const smoothedPolygon = convexHull(boundaryPointsArray);
    return smoothedPolygon;
  }
  app.stage.interactive = true;
  app.stage.on('pointerdown', function (event) {
    if (!game.drawRoofNow) return;
    const mouseX = game.gridPos(game.mouseX);
    const mouseY = game.gridPos(game.mouseY);
    const roofPolygon = discoverRoofPolygon(mouseX, mouseY, GRID_SIZE, GRID_SIZE);
    if (roofPolygon.length > 0) {
      quadtree.insert(roofPolygon);
      createRoofGraphics(roofPolygon);
    }
  });
});
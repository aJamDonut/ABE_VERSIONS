bootStrap.push(function () {
  game.ee.on('inventory-removeitem', function (options) {});
});
bootStrap.push(function () {
  game.ee.on('lifeobject_created', function (life) {
    life.on('pointerup', function () {
      game.select(this);
    });
  });
  game.ee.on('lifeobject_created', function (life) {
    life.isInteractive();
    life.on('pointerover', function (e) {
      this.filters = [new PIXI.filters.OutlineFilter(2, 0x99ff99)];
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
        this.talk();
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
        if (!game.editMode) {
          contextMenuLinks['Attack'] = function (caller) {
            game.session.setAllCommand('attack', {
              targetId: caller.id
            });
          };
        }
        if (this.data.bounty && this.data.bounty > 0 && this.data.dead) {
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
  game.ee.on('right-doubleclick', function (event) {});
});
bootStrap.push(function () {
  game.ee.on('itemcontainer_created', function (item) {
    if (!game.editMode && (!item.meta || !item.meta.contextOptions) && (!item.contextMenus || !Object.keys(item.contextMenus).length)) {
      return;
    }
    item.isInteractive();
    item.on('pointerover', function (e) {
      if (!this.filters) {
        this.filters = [];
      }
      this.filters.push(new PIXI.filters.OutlineFilter(2, 0x99ff99));
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
          contextMenuLinks[name] = function (caller) {
            caller.settingsContainer = game.render.componentRaw('settings_dialog', {
              callerObject: caller,
              settings: ['id', 'codename', 'group', 'blockX', 'blockY', 'persist', 'persistId', 'class', 'locked', 'alpha', 'spriteName', 'physicsType', 'usedata1', 'usedata2', 'usedata3']
            });
            game.render.aboveAll.addChild(caller.settingsContainer);
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
            game.p.data.command = 'loot';
            game.p.data.do = 'opencontainer';
            game.p.data.gotoId = caller.id;
            game.world.sync(game.p);
          };
        }
        if (this.meta.contextOptions && this.meta.contextOptions.includes('gather')) {
          contextMenuLinks['Gather'] = function (caller) {
            if (game.world.cDistance(game.p, caller) > 11000 && !game.editMode) {
              game.input.mouseMsg('Too far away');
            } else {
              game.p.data.do = 'gather';
              game.p.data.gatherId = caller.id;
              game.world.sync(game.p);
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
            game.p.data.do = 'useitem';
            game.p.data.gotoId = caller.id;
            game.world.sync(game.p);
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
  game.cull = {};
  game.cull.batch = 250;
  game.cull.count = -1;
  game.cull.cullCheck = function (item) {
    let tl = game.render.viewport.toWorld(0, 0);
    let br = game.render.viewport.toWorld(game.ui._VIEWPORT_RIGHT, game.ui._VIEWPORT_BOTTOM);
    let bounds = item.getLocalBounds(false, true);
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
    }
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
    if (game.selectedObject !== undefined && game.selectedObject !== false) {
      game.watcherBox.alpha = 1;
      if (game.selectedObject.class == 'LifeObject') {
        game.watcherBox.x = game.selectedObject.x;
        game.watcherBox.y = game.selectedObject.y;
      } else {
        game.watcherBox.x = game.selectedObject.x - game.watcherBox.width / 8;
        game.watcherBox.y = game.selectedObject.y - game.watcherBox.height / 8;
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
    let text = game.render.text('Loading... ' + game.c);
    text.x = 100;
    text.y = 100;
    game.hider.addChild(text);
    game.hider.alpha = 1;
    game.hider.isInteractive();
  });
  game.ee.on('grid-loaded', function () {
    game.hider.alpha = 0;
    game.hider.interactive = false;
    game.hider.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
  });
});
bootStrap.push(function () {
  game.ui.addEditorStuff = function () {
    var toggles = game.render.component('admin_hud_toggles');
    toggles.x = 20;
    toggles.y = 75;
    game.render.aboveAll.addChild(toggles);
    game.last = JSON.stringify(game.index.getIndex('all'));
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
      item.isInteractive();
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
      life.isInteractive();
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
  game.world.objectTemplates.walls.push({
    name: 'buildroom',
    readName: 'Dark Sand',
    codename: 'floor',
    description: _LANG.WAITING_FOR_DESCRIPTION,
    cost: 0,
    across: 3,
    down: 7,
    blocks: 1,
    collide: 'allowwall',
    data: {
      layer: 2,
      fill: [4, 8],
      buildFloor: true,
      wallBuild: true,
      across: 3,
      down: 7
    }
  });
  game.world.objectTemplates.walls.push({
    name: 'buildroom',
    readName: 'Darker Sand',
    codename: 'floor',
    description: _LANG.WAITING_FOR_DESCRIPTION,
    cost: 0,
    across: 18,
    down: 7,
    blocks: 1,
    collide: 'allowwall',
    data: {
      layer: 2,
      fill: [19, 8],
      buildFloor: true,
      wallBuild: true,
      across: 18,
      down: 7
    }
  });
  game.world.objectTemplates.walls.push({
    name: 'buildroom',
    readName: 'Gravel',
    codename: 'floor',
    description: _LANG.WAITING_FOR_DESCRIPTION,
    cost: 0,
    across: 21,
    down: 7,
    blocks: 1,
    collide: 'allowwall',
    data: {
      layer: 2,
      fill: [21, 8],
      buildFloor: true,
      wallBuild: true,
      across: 21,
      down: 7
    }
  });
  game.world.objectTemplates.walls.push({
    name: 'buildroom',
    readName: 'Lqd Lite Green',
    codename: 'floor',
    description: _LANG.WAITING_FOR_DESCRIPTION,
    cost: 0,
    across: 9,
    down: 7,
    blocks: 1,
    collide: 'allowwall',
    data: {
      layer: 3,
      fill: [10, 8],
      buildFloor: true,
      wallBuild: true,
      across: 9,
      down: 7
    }
  });
  game.world.objectTemplates.walls.push({
    name: 'buildroom',
    readName: 'Lqd Dark Green',
    codename: 'floor',
    description: _LANG.WAITING_FOR_DESCRIPTION,
    cost: 0,
    across: 13,
    down: 7,
    blocks: 1,
    collide: 'allowwall',
    data: {
      layer: 4,
      fill: [14, 8],
      buildFloor: true,
      wallBuild: true,
      across: 13,
      down: 7
    }
  });
  game.world.objectTemplates.walls.push({
    name: 'buildroom',
    readName: 'Grass',
    codename: 'floor',
    description: _LANG.WAITING_FOR_DESCRIPTION,
    cost: 0,
    across: 17,
    down: 7,
    blocks: 1,
    collide: 'allowwall',
    data: {
      layer: 2,
      fill: [17, 8],
      buildFloor: true,
      wallBuild: true,
      across: 17,
      down: 7
    }
  });
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
    fill: '#aeafb8',
    wordWrap: true,
    wordWrapWidth: 350,
    stroke: '#000000',
    strokeThickness: 1
  };
  game.render.textStyles['item-desc-wide'] = {
    fontFamily: 'Calibri',
    fontSize: 16,
    fill: '#aeafb8',
    wordWrap: true,
    wordWrapWidth: 380,
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
    wordWrap: true,
    wordWrapWidth: 100,
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
  game.util.getBaseStats = function (stats) {
    stats = stats || {};
    return Object.assign({
      hp: 100,
      torp: 0,
      weight: 0,
      energy: 100,
      maxHP: 120,
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
  for (let i = 0; i < recipeNames.length; i++) {
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
  game.parsedResearch = true;
});
bootStrap.push(function () {
  game.regenUITools = function () {
    game.world.objectTemplates.player_survival = [];
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
      name: 'planning',
      type: 'walls',
      toolName: 'playersquaring',
      readName: 'Cancel',
      codename: 'playersquaring',
      description: _LANG.WAITING_FOR_DESCRIPTION,
      cost: 0,
      across: 3,
      down: 3,
      blocks: 1,
      collide: 'allowwall',
      data: {
        across: 1,
        down: 1
      }
    }, {
      name: 'planning',
      type: 'walls',
      toolName: 'playersquaring',
      readName: 'Destroy',
      codename: 'playersquaring',
      description: _LANG.WAITING_FOR_DESCRIPTION,
      cost: 0,
      across: 3,
      down: 3,
      blocks: 1,
      collide: 'allowwall',
      data: {
        across: 1,
        down: 1
      }
    }, {
      type: 'walls',
      name: 'planning',
      toolName: 'playersquaring',
      readName: 'Oak floor',
      codename: 'playersquaring',
      description: _LANG.WAITING_FOR_DESCRIPTION,
      cost: 0,
      across: 1,
      recipe: 'pers_worlditem_buildwall',
      crafts: 'pers_worlditem_buildwall',
      down: 14,
      blocks: 1,
      data: {
        layer: 1,
        buildFloor: true,
        wallBuild: true,
        fill: [1, 14],
        killOnBuild: true,
        friction: 0,
        across: 1,
        down: 14
      }
    }, {
      type: 'floors',
      name: 'planning',
      readName: 'Carpet',
      toolName: 'playersquaring',
      codename: 'playersquaring',
      description: _LANG.WAITING_FOR_DESCRIPTION,
      cost: 0,
      across: 1,
      down: 15,
      blocks: 1,
      data: {
        layer: 1,
        buildFloor: true,
        wallBuild: true,
        fill: [1, 15],
        killOnBuild: true,
        friction: 0,
        across: 1,
        down: 15
      }
    }, {
      type: 'floors',
      name: 'planning',
      readName: 'Path',
      toolName: 'playersquaring',
      codename: 'playersquaring',
      description: _LANG.WAITING_FOR_DESCRIPTION,
      cost: 0,
      across: 1,
      down: 19,
      blocks: 1,
      data: {
        layer: 1,
        buildFloor: true,
        wallBuild: true,
        fill: [1, 19],
        killOnBuild: true,
        friction: 0,
        across: 1,
        down: 19
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
        readName: 'Walls',
        description: "",
        across: 2,
        down: 1,
        tools: game.world.objectTemplates.player_tools
      }, {
        name: 'survival',
        editMode: false,
        readName: 'Survival',
        description: "",
        across: 3,
        down: 1,
        tools: game.world.objectTemplates.player_survival
      }];
    } else {
      game.ui.data.menus = [{
        name: 'planning',
        editMode: true,
        readName: 'Player Walls',
        description: "",
        across: 2,
        down: 1,
        tools: game.world.objectTemplates.player_tools
      }, {
        name: 'survival',
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
        name: 'sprites',
        editMode: true,
        readName: 'Sprites',
        description: "",
        across: 19,
        down: 3,
        tools: sprites
      }, {
        name: 'tables',
        editMode: true,
        readName: "World Items",
        description: "",
        across: 24,
        down: 3,
        tools: game.world.objectTemplates.build_world_items
      }, {
        name: 'other',
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
        name: 'util',
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
    if (_BLUEPRINTS.COMPLEX_ITEMS[item.codename]) {
      return new ComplexItem(item.codename, item.data);
    } else {
      return new SimpleItem(item.sprite, item.data);
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
    game.world.addObject(furni);
    game.render.objectLayer.addChild(furni);
    furni.onCreate();
    this.lastsweep = false;
  };
  game.setTicker('placeObject', function () {
    if (!game.util.placeObjectContainer) {
      return false;
    }
    let x = game.mouseX;
    let y = game.mouseY;
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
    if (game.util.rope1) {
      game.util.rope1.destroy();
    }
  };
  game.util.resetLink = function () {
    game.util.selectOne = false;
    game.util.selectTwo = false;
  };
  game.util.createLink = function () {
    game.util.linking = true;
  };
  game.util.makeLink = function (linkTo, linkFrom) {
    linkTo.data.persistId = linkTo.id;
    linkFrom.data.persistId = linkFrom.id;
    linkTo.data.usedata1 = linkFrom.id;
    linkFrom.data.usedata1 = linkTo.id;
    game.util.showLink(linkTo);
  };
  game.util.showLink = function (item) {
    let linkTo = game.index.find(item.data.usedata1);
    if (!linkTo) {
      return;
    }
    if (game.util.rope1) {
      game.util.rope1.destroy();
    }
    game.util.rope1 = game.util.createRope(item, linkTo);
  };
  game.ee.on('object_selected', function (item) {
    if (!game.util.isLinking()) {
      return;
    }
    if (item.baseClass === "BaseLife") {
      game.util.selectOne = item;
      if (item.data.usedata1) {
        game.util.showLink(item);
      }
      return;
    }
    if (game.util.selectOne.id === item.id) {
      game.util.resetLink();
      return;
    }
    game.util.selectTwo = item;
    game.util.makeLink(game.util.selectOne, game.util.selectTwo);
    game.util.resetLink();
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
  game.util.albearNpc = new LifeObject();
  game.util.albearNpc.setBlank();
  game.util.albearNpc.data.name = "Albear";
  game.util.albearNpc.init();
  game.util.albearNpc.inventory.body.addItem(new InventoryItem('ss_item_body_albear'), true);
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
  game.ee.on("world-rightclick-down", () => {
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
  game.util.newLife = function (isPlayer, level, species, faction, bodies, brains, masks, weapons, backWeapons, dummyObject) {
    const life = new ABE.LifeObject(false, {
      isPlayer: isPlayer || false
    });
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
    if (species === "robot") {
      disabledMask = true;
      disabledBody = true;
    }
    if (species === "animal") {
      disabledMask = true;
      disabledBody = true;
    }
    if (species === "lokal") {
      disabledMask = true;
    }
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
var tool=function(){game.selector=new PIXI.Graphics,game.selector.beginFill(65280,0),game.selector.lineStyle(2,16777215),game.selector.drawRect(0,0,game.tileSize,game.tileSize),game.render.lifeLayer.addChild(game.selector),game.selector.visible=!1;var a=new Tool("select");a.selectedLife=function(a){a.selected=!0,game.ui.addUI("selected-life",a,function(a){var b=a.x+16,c=a.y-16,d=0,e=10;game.ui.panel1(b,c,100,100),d+=10+e,game.ui.text1(a.name,b+e,c+d),d+=10+e,game.ui.text1("Age: "+a.age,b+e,c+d)},function(){},function(){},function(){},a.x,a.y,64,64)},a.onMouseDown=function(a){return"tablet"!=game.clientMode&&void(game.mouseDown=!0,this.mouseDownX=a.clientX,this.mouseDownY=a.clientY,gridX=game.gridPos(game.mouseX),gridY=game.gridPos(game.mouseY),console.log(["Sho",gridX,gridY]),tileType=game.grid.getTileType(gridX,gridY),console.log(a),show={},show.name="Tile: "+tileType,game.selector.x=game.atGridPos(gridX),game.selector.y=game.atGridPos(gridY),game.selector.visible=!0,game.ui.showItemInfo(show))},a.onMouseMove=function(){game.cursorUnHide()},a.onMouseUp=function(){game.mouseDown=!1},a.deactivate=function(){game.selector.visible=!1},game.tools.addTool(a),game.tools.setActiveTool("select")};bootStrap.push(tool);
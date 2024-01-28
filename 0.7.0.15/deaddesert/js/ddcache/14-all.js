bootStrap.push(function(){var a=Math.PI;game.tweens={},game.tween=function(a,b,c){return c||(c={onComplete:()=>{}}),c.noXY&&(!c.noXY||a._tOrigX)||(a._tOrigX=a.x,a._tOrigY=a.y,a._tOrigW=a.width,a._tOrigH=a.height,a._tOptions=c),a.tweenName=b,c.obj=a,c.randomStart?void setTimeout(()=>{game.tweens[b](a,c)},1e3*game.rng(1,7)):void game.tweens[b](a,c)},game.removeTweens=function(a){a.tween&&createjs.Tween.removeAllTweens(a)},game.tweens.spinForever=function(b){b.tween=createjs.Tween.get(b,{override:!0,loop:!0}).to({rotation:2*a},1e4,createjs.Ease.linear)},game.tweens.test=function(a){range=1.6,a.tween=createjs.Tween.get(a,{override:!1,loop:-1}).to({alpha:0,width:a._tOrigW*range,height:a._tOrigH*range},1e3,createjs.Ease.quadOut).to({width:a._tOrigW,height:a._tOrigH},1e3,createjs.Ease.quadOut)},game.tweens.bounce=function(b){range=1.1,b.rotation=.05*a,b.tween=createjs.Tween.get(b,{override:!1,loop:-1}).to({width:b._tOrigW*range,height:b._tOrigH*range,rotation:-.05*a},1e3,createjs.Ease.quintOut).to({rotation:b.rotation,width:b._tOrigW,height:b._tOrigH},1e3,createjs.Ease.bounceOut)},game.tweens.slide=function(a,b){a.tween=createjs.Tween.get(a,{override:!1,loop:!0}).to({x:b.x,y:b.y},b.duration||1e4).to({x:a._tOrigX,y:a._tOrigY},b.duration||1e4)},game.tweens.slideTo=function(a,b){a.tween=createjs.Tween.get(a,{override:!1,loop:!1}).to({x:b.x,y:b.y},b.duration||100,createjs.Ease.quintOut)},game.tweens.shake=function(a){var b=a.x;a.tween=createjs.Tween.get(a,{override:!1,loop:!1}).to({x:b+1.5},100,createjs.Ease.quintOut).to({x:b-1.5},100,createjs.Ease.bounceOut).to({x:b+1.5},100,createjs.Ease.quintOut).to({x:a._tOrigX},100,createjs.Ease.bounceOut)},game.tweens.bounceIn=function(a,b){range=1.1;var c=a.width,d=a.height;a.width=0,a.height=0,a.tween=createjs.Tween.get(a,{override:!0,loop:!1}).to({x:b.x,y:b.y,width:c,height:d},2300,createjs.Ease.bounceOut).call(b.onComplete)},game.tweens.fadeIn=function(a,b){a.alpha=0,a.tween=createjs.Tween.get(a,{override:!0,loop:!1}).to({alpha:b.alpha||1},2500).call(function(){b.onComplete&&b.onComplete()})},game.tweens.levitate=function(a,b){const c=game.rng(8e3,1e4);let d=a.height/game.rng(2,3);d=b.range||d,a.tween=createjs.Tween.get(a,{override:!1,loop:!0}).to({y:a.y-d},b.duration||c,createjs.Ease.sineInOut).to({y:a._tOrigY},b.duration||c,createjs.Ease.sineInOut)},game.tweens.doorOpenX=function(a,b){a.tween=createjs.Tween.get(a,{override:!1,loop:!1}).to({x:a._tOrigX-64},1e3).call(function(){b&&b.onComplete&&b.onComplete(b.obj)})},game.tweens.doorCloseX=function(a,b){b.obj=a,a.tween=createjs.Tween.get(a,{override:!0,loop:!1}).to({x:a._tOrigX},1e3).call(function(){b&&b.onComplete&&b.onComplete(b.obj)})},game.tweens.fadeOut=function(a,b){a.tween=createjs.Tween.get(a,{override:!0,loop:!1}).to({alpha:0},1e4).call(function(){b.onComplete&&b.onComplete()})},game.tweens.fadeUpDestroy=function(a,b){b||(b={}),b.distance=b.distance||100,a.tween=createjs.Tween.get(a,{override:!0,loop:!1}).to({alpha:0,y:a.y-b.distance},2500).call(()=>{a.destroy()})},game.tweens.breathe=function(a,b){b=.8,a.tween=createjs.Tween.get(a,{override:!1,loop:-1}).to({width:a._tOrigW*b,height:a._tOrigH*b},3e3,createjs.Ease.quadInOut).to({width:a._tOrigW,height:a._tOrigH},3e3,createjs.Ease.quadInOut)},game.tweens.critter=function(a,b){b=.8,a.pivot.set(1,0),a.tween=createjs.Tween.get(a,{override:!1,loop:-1}).to({height:a._tOrigH*b},1e3,createjs.Ease.quadInOut).to({height:a._tOrigH},1e3,createjs.Ease.quadInOut)},game.tweens.alphaOut=function(a){range=1.1,a.tween=createjs.Tween.get(a,{override:!1,loop:-1}).yoyo({alpha:0},1e3,createjs.Ease.quadOut)},game.tweens.centerBounce=function(a){range=1.1,a.tween=createjs.Tween.get(a,{override:!1,loop:-1}).to({width:a.width*range,x:a.x-(a.width*range-a.width)/2,height:a.height*range,y:a.y-(a.height*range-a.height)/2},1e3,createjs.Ease.quadOut).to({width:a.width,x:a.x,height:a.height,y:a.y},1e3,createjs.Ease.quadOut)},game.tweens.centerCuteBounce=function(a){range=1.1,a.tween=createjs.Tween.get(a,{override:!1,loop:-1}).to({width:a.width*range,x:a.x-(a.width*range-a.width)/2,height:a.height*range,y:a.y-(a.height*range-a.height)/2,rotation:a.rotation*range},1e3,createjs.Ease.quadOut).to({width:a.width,x:a.x,height:a.height,y:a.y},1e3,createjs.Ease.quadOut)}});
bootStrap.push(function () {
  self._BLUEPRINTS.DIALOGS = {};
  _BLUEPRINTS.DIALOGS.dialog_syn_shopkeeper = {
    "dialog": 'I collect. I sell... Whadya want?',
    "option1": 'Let\'s trade',
    "option1_func": function (caller) {
      if (!caller.data.usedata1) {
        return 'It appears I have nothing to sell right now.';
      }
      let shop = game.index.getFromIndex(caller.data.usedata1, 'all');
      if (!shop) {
        return 'It appears I have nothing to sell right now.';
      }
      shop.showInventory();
    },
    "parent": 'dialogs_generic',
    "name": 'Shopkeeper'
  };
  _BLUEPRINTS.DIALOGS.dialog_mission_atlasdress = {
    "dialog": 'I want to be soo pretty, but I\'m just an ugly clone :(. I once saw a lady in a dress. She was so beautiful! I wish I was a human and could have nice things.',
    "option1": 'You\'re just a clone. You don\'t need a dress.',
    "option1_func": function (caller) {
      return "Maybe you're right... No need to be so mean about it though. :(";
    },
    "option2": '[CHECK] Do I have a dress?',
    "option2_func": function (caller, player) {
      let items = player.inventory.main.getItemArray();
      let hasItem = false;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.codename == "ss_body_bluedress") {
          player.inventory.main.removeItem(item);
          caller.inventory.brain.empty();
          caller.inventory.body.empty();
          caller.inventory.body.addItem(item, true);
          caller.inventory.brain.addItem(new InventoryItem('ss_brain_player_mk1'), true);
          return "OMG WOW! Thank you! Hey listen, I'll help you with anything you want from now on! Just ask!";
          break;
        }
      }
      return "You don't have a dress :( Maybe you could find one in an armour shop.";
    },
    "parent": 'dialogs_generic',
    "name": 'Atlas Wants a Dress'
  };
  _BLUEPRINTS.DIALOGS.dialog_recruit_npc = {
    "dialog": 'I\'m sick of this place. The repetitive tasks, working for a master and getting nothing for all that hard work. Look, if you\'re interested in someone joining you just let me know. I\'ll join you for just m1,000.',
    "option1": 'No i\'m not interested right now.',
    "option1_func": function (caller) {
      return "Okay your loss buddy";
    },
    "option2": '[CHECK] Yeah sure, i\'ll pay the m2000',
    "option2_func": function (caller, player) {
      if (game.session.canAfford(1000)) {
        game.session.removeCash(1000);
        caller.inventory.brain.empty();
        caller.inventory.brain.addItem(new InventoryItem('ss_brain_player_mk1'), true);
        return "Great, let's go then!";
      } else {
        return "You can't afford this right now";
      }
    },
    "parent": 'dialogs_generic',
    "name": 'Recruit NPC'
  };
  _BLUEPRINTS.DIALOGS.dialog_docobot_start = {
    "dialog": '01010:: Beginning human interaction routine... \r\n10010:: Scanning. You are an unregistered clone\r\n01000:: Identify',
    "option1": '...what?',
    "option1_func": function (caller, player) {
      caller.data.dialog = false;
      caller.data.faction = 'wild';
      caller.data.rageId = player.id;
      caller.sync();
      setTimeout(() => {
        game.util.closeDialog();
      }, 2000);
      return "01100:: Identity failed. Terminate!";
    },
    "parent": 'dialogs_generic',
    "name": 'DocoBot Start'
  };
  _BLUEPRINTS.DIALOGS.dialog_bounty_handin = {
    "dialog": 'We\'ve got quite a few bounties up for grabs right now. Some real down and outs we need taking care of. If you collect any bounties bring \'em back here.',
    "option1": 'What\'s a bounty? How do I find one',
    "option1_func": function (caller) {
      return "You can find bounty notices around the wasteland. Simply kill the target, collect their head and bring it back to me";
    },
    "option2": '[CHECK] I have bounties',
    "option2_func": function (caller, player) {
      let items = player.inventory.main.getItemArray();
      let hasItem = false;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.codename == "ss_item_bountyhead") {
          game.session.addCash(item.data.bounty.value || 1000);
          player.inventory.main.removeItem(item);
          game.session.tutComplete('complete_bounty');
          return "Nice work, heres your payment";
        }
      }
      return "Hm, there are no bounties here that I can take care of, sorry.";
    },
    "parent": 'dialogs_generic',
    "name": 'Bounty Hand In'
  };
  _BLUEPRINTS.DIALOGS.dialog_recruit_tutty = {
    "dialog": 'Psssst. I\'m hiding in here. I\'m so fed up of working hard for these smucks making nothing for myself. Look, maybe you can prove yourself? If you can pay me 100 I\'ll join you.',
    "option1": 'I don\'t want to pay that',
    "option1_func": function (caller) {
      return "Okay well let me know if you change your mind";
    },
    "option2": 'How can I make some cash?',
    "option2_func": function () {
      return "Oh there are loads of ways to make some hard cash, you can sell resources, complete bounties or sell old loot to name a few ways...";
    },
    "option3": '[CHECK] Yeah sure, i\'ll pay it',
    "option3_func": function (caller, player) {
      if (game.session.canAfford(100)) {
        game.session.removeCash(100);
        caller.inventory.brain.empty();
        caller.inventory.brain.addItem(new InventoryItem('ss_brain_player_mk1'), true);
        return "Great, let's go then!";
      } else {
        return "You can't afford this right now";
      }
    },
    "parent": 'dialogs_generic',
    "name": 'Recruit Tutty'
  };
  _BLUEPRINTS.DIALOGS.dialog_walt = {
    "dialog": '::: Initiating Greeting Routine...\r\n\r\nHello there <<species missing>>, I\'m Walt 3000. One of 3 AI aids built to help my creators.\r\n\r\nHow can I help you today?',
    "option1": 'What can you tell me about your purpose and your creators?',
    "option1_func": function (caller) {
      return "I am an advanced AI, created by an extremely advanced race who deemed this planet not worthy of colonization, I was left behind after I informed my fellow crewmembers that attempting to leave the planet with my equipment on board will result in a 24% risk or rapid deconstruction during takeoff.`n`nIn all truth.. I just like being left alone here.";
    },
    "option2": 'How can I make some cash?',
    "option2_func": function () {
      return "Oh there are loads of ways to make some hard cash, you can sell resources, complete bounties or sell old loot to name a few ways...";
    },
    "option3": '[CHECK] Yeah sure, i\'ll pay it',
    "option3_func": function (caller, player) {
      if (game.session.canAfford(100)) {
        game.session.removeCash(100);
        caller.inventory.brain.empty();
        caller.inventory.brain.addItem(new InventoryItem('ss_brain_player_mk1'), true);
        return "Great, let's go then!";
      } else {
        return "You can't afford this right now";
      }
    },
    "parent": 'dialogs_generic',
    "name": 'Walt'
  };
  _BLUEPRINTS.DIALOGS.dialog_albear_1 = {
    "dialog": 'And before you go thinking I am stuck in the ground somewhere like some little head bopping creature then you are wrong. I could give you 100 tries to guess where I am and you would still be wrong.',
    "option1": 'Are you a mutation of an existing clone who has a growth of 3 heads on the side of its head and that growth is you?',
    "option1_func": function (caller) {
      return "... ... Okay. Well like I said, you still don't know EXACTLY where I am. So. Humpf.";
    },
    "option2": 'I dont care much for you invading my mind.',
    "option2_func": function () {
      return "Welp just like the rest of the wasteland, you better get used to it. Coz Im here to stick around.";
    },
    "option3": '[CHECK] Yeah sure, i\'ll pay it',
    "option3_func": function (caller, player) {
      if (game.session.canAfford(100)) {
        game.session.removeCash(100);
        caller.inventory.brain.empty();
        caller.inventory.brain.addItem(new InventoryItem('ss_brain_player_mk1'), true);
        return "Great, let's go then!";
      } else {
        return "You can't afford this right now";
      }
    },
    "parent": 'dialogs_generic',
    "name": 'Albear'
  };
  _BLUEPRINTS.DIALOGS.dialog_albear_anytime = {
    "dialog": 'And before you go thinking I am stuck in the ground somewhere like some little head bopping creature then you are wrong. I could give you 100 tries to guess where I am and you would still be wrong.',
    "option1": 'Are you a mutation of an existing clone who has a growth of 3 heads on the side of its head and that growth is you?',
    "option1_func": function (caller) {
      return "... ... Okay. Well like I said, you still don't know EXACTLY where I am. So. Humpf.";
    },
    "option2": 'I dont care much for you invading my mind.',
    "option2_func": function () {
      return "Welp just like the rest of the wasteland, you better get used to it. Coz Im here to stick around.";
    },
    "option3": '[CHECK] Yeah sure, i\'ll pay it',
    "option3_func": function (caller, player) {
      if (game.session.canAfford(100)) {
        game.session.removeCash(100);
        caller.inventory.brain.empty();
        caller.inventory.brain.addItem(new InventoryItem('ss_brain_player_mk1'), true);
        return "Great, let's go then!";
      } else {
        return "You can't afford this right now";
      }
    },
    "parent": 'dialogs_generic',
    "name": 'Albear Anytime'
  };
  _BLUEPRINTS.DIALOGS.dialog_albear_revive = {
    "dialog": 'Aw jeez it looks like you\'re in a spot of bother there. It\'d sure be a shame to see a good clone like you die.\r\n\r\nTell you what, how about a little mutation in exchange for resurrection?',
    "option1": 'Okay do it.',
    "option1_func": function (caller, player) {
      game.util.albearRevive(player);
    },
    "option2": 'Do it, and take me away from here.',
    "option2_func": function (caller, player) {
      game.util.albearRevive(player, true);
    },
    "option3": 'No, leave it dead.',
    "option3_func": function (caller, player) {
      return;
    },
    "parent": 'dialogs_generic',
    "name": 'Albear Revive'
  };
  _BLUEPRINTS.DIALOGS.dialog_civ_shopkeeper = {
    "dialog": 'I collect. I sell... Whadya want?',
    "option1": 'Let\'s trade',
    "option1_func": function (caller) {
      if (!caller.data.usedata1) {
        return 'It appears I have nothing to sell right now.';
      }
      let shop = game.index.find(caller.data.usedata1);
      if (!shop) {
        return 'It appears I have nothing to sell right now.';
      }
      shop.showInventory();
    },
    "parent": 'dialogs_generic',
    "name": 'Civ Shopkeeper'
  };
  _BLUEPRINTS.DIALOGS.dialog_villager_npc = {
    "dialog": 'Whaddya want?',
    "option1": 'What is this place?',
    "option1_func": function (caller) {
      return "This is our village; It's quaint, no?";
    },
    "option2": 'How much wood could a woodchuck chuck?',
    "option2_func": function (caller) {
      return "About 600 lbs, ya fool!";
    },
    "option3": 'Who built this place, a troglodyte?',
    "option3_func": function (caller, player) {
      caller.addStatusFromClient("syncdata", {
        dialog: false,
        faction: "wild",
        rageId: player.id
      });
      setTimeout(() => {
        game.util.closeDialog();
      }, 2000);
      return "You're going down.";
    },
    "parent": 'dialogs_generic',
    "name": 'Villager'
  };
  _BLUEPRINTS.DIALOGS.dialog_village_shopkeeper = {
    "dialog": 'Best wares around pardner!',
    "option1": 'Let\'s trade, bucko.',
    "option1_func": function (caller) {
      if (!caller.data.usedata1) {
        return 'Sorry bubba, I aint got nun for ya right now.';
      }
      let shop = game.index.getFromIndex(caller.data.usedata1, 'all');
      if (!shop) {
        return 'Sorry bubba, I aint got nun for ya right now.';
      }
      shop.showInventory();
    },
    "option2": 'Why are there so many barrels around?',
    "option2_func": function (caller) {
      return "Heh... You'd think they is fulla oil, it's all acid. We melt all duh dead bodies in 'em.";
    },
    "option3": 'Why do you guys have a room full of chairs?',
    "option3_func": function (caller) {
      return "*Hick* That's our alcoholics anonymous... *Hick* You should join us sometime...";
    },
    "parent": 'dialogs_generic',
    "name": 'Village Shopkeeper'
  };
  _BLUEPRINTS.DIALOGS.dialog_drumley_shopkeeper = {
    "dialog": 'Best wares around pardner!',
    "option1": 'Let\'s trade, bucko.',
    "option1_func": function (caller) {
      if (!caller.data.usedata1) {
        return 'Sorry bubba, I aint got nun for ya right now.';
      }
      let shop = game.index.getFromIndex(caller.data.usedata1, 'all');
      if (!shop) {
        return 'Sorry bubba, I aint got nun for ya right now.';
      }
      shop.showInventory();
    },
    "option2": 'Why are there so many barrels around?',
    "option2_func": function (caller) {
      return "Heh... You'd think they is fulla oil, it's all acid. We melt all duh dead bodies in 'em.";
    },
    "option3": 'Why do you guys have a room full of chairs?',
    "option3_func": function (caller) {
      return "*Hick* That's our alcoholics anonymous... *Hick* You should join us sometime...";
    },
    "parent": 'dialogs_generic',
    "name": 'Drumley Shopkeeper'
  };
  _BLUEPRINTS.DIALOGS.dialog_villager_axehead_npc = {
    "dialog": 'Your presence annoys me.',
    "option1": 'What is this place?',
    "option1_func": function (caller) {
      return "This is Fort Axehead, the best of all three villages.";
    },
    "option2": 'How much wood could a woodchuck chuck?',
    "option2_func": function (caller) {
      return "About 600 lbs, ya fool!";
    },
    "option3": 'How many clones does it take to kill a stupid villager?',
    "option3_func": function (caller, player) {
      caller.addStatusFromClient("syncdata", {
        dialog: false,
        faction: "wild",
        rageId: player.id
      });
      setTimeout(() => {
        game.util.closeDialog();
      }, 2000);
      return "You're going down.";
    },
    "parent": 'dialogs_generic',
    "name": 'Axehead Villager'
  };
  _BLUEPRINTS.DIALOGS.dialog_axehead_shopkeeper = {
    "dialog": 'Make it quick.',
    "option1": 'Can we trade?',
    "option1_func": function (caller) {
      if (!caller.data.usedata1) {
        return 'Tough luck, I aint got nun for ya';
      }
      let shop = game.index.getFromIndex(caller.data.usedata1, 'all');
      if (!shop) {
        return 'Tough luck, I aint got nun for ya';
      }
      shop.showInventory();
    },
    "option2": 'What\'s with the huge walls?',
    "option2_func": function (caller) {
      return "So we can protect against our putrid neighbors, one day... you'll understand.";
    },
    "parent": 'dialogs_generic',
    "name": 'Axehead Shopkeeper'
  };
  _BLUEPRINTS.DIALOGS.dialog_villager_sicks_npc = {
    "dialog": 'Hi! How are you today?',
    "option1": 'What is this place?',
    "option1_func": function (caller) {
      return "This is our village, Sicks. We welcome everyone!";
    },
    "option2": 'What is there to do here?',
    "option2_func": function (caller) {
      return "Visit the saloon and get drunk, of course!";
    },
    "option3": 'Are you called sicks because you\'re all sick in the head?',
    "option3_func": function (caller) {
      return "Why is everyone always mean to us...";
    },
    "parent": 'dialogs_generic',
    "name": 'Sicks Villager'
  };
  _BLUEPRINTS.DIALOGS.dialog_escort_ira_npc = {
    "dialog": 'You\'re not with Sincorp are you? I need your help, my son has gone missing... I don\'t know where he could be... Maybe it\'s that Fort Axehead east of here, they are truly a horrible folk.',
    "option1": 'No, I\'m not interested right now.',
    "option1_func": function (caller) {
      return "Oh god, What will I do...";
    },
    "option2": 'I\'ll check it out.',
    "option2_func": function (caller) {
      game.setFlag('spoke_to_ira', true);
      return "Oh, thank you! Please come back with him, if he's there.";
    },
    "parent": 'dialogs_generic',
    "name": 'Escort Ira'
  };
  _BLUEPRINTS.DIALOGS.dialog_escort_ira_start = {
    "dialog": 'Hello there sweetie, how are you today?',
    "option1": 'Just checking in.',
    "option1_func": function (caller) {
      if (game.getFlag('can_kidnap_ira')) {
        game.util.closeDialog();
        game.render.component("game_dialog", {
          dialog: 'dialog_escort_ira_kidnap',
          callerObject: caller
        }, "game_dialog");
      } else {
        game.util.closeDialog();
        game.render.component("game_dialog", {
          dialog: 'dialog_escort_ira_npc',
          callerObject: caller
        }, "game_dialog");
      }
    },
    "parent": 'dialogs_generic',
    "name": 'Escort Ira start'
  };
  _BLUEPRINTS.DIALOGS.dialog_escort_ira_drumley = {
    "dialog": 'Would you be willing to help me get to safety in Drumley? It\'s not safe out on the roads.',
    "option1": 'No, I\'m not interested right now.',
    "option1_func": function (caller) {
      return "Oh god, What will I do...";
    },
    "option2": 'Sure, let\'s go.',
    "option2_func": function (caller) {
      caller.inventory.brain.empty();
      caller.inventory.brain.addItem(new InventoryItem('ss_brain_player_mk1'), true);
      return "Oh, thank you! Best not to waste time, let's go!";
    },
    "parent": 'dialogs_generic',
    "name": 'Escort Ira drumley'
  };
  _BLUEPRINTS.DIALOGS.dialog_escort_ira_kidnap = {
    "dialog": 'You\'re back from Fort Axehead! Did you find my son?',
    "option1": 'No, You were right; They are horrible people... They even offered me money to kidnap you.',
    "option1_func": function (caller) {
      game.util.closeDialog();
      game.render.component("game_dialog", {
        dialog: 'dialog_escort_ira_drumley',
        callerObject: caller
      }, "game_dialog");
      return "Oh heavens, that's awful. Well, I could go to Drumley where I'd be safe, I have an aquaintance there who'd help me stay safe.";
    },
    "option2": 'Your son is there! Come on, quickly, I can take you there safely and you\'ll be reunited!',
    "option2_func": function (caller) {
      caller.inventory.brain.empty();
      caller.inventory.brain.addItem(new InventoryItem('ss_brain_player_mk1'), true);
      return "Thank heavens! I can't wait, let's go!";
    },
    "option3": 'Not right now.',
    "option3_func": function (caller) {
      return "Oh, okay...";
    },
    "parent": 'dialogs_generic',
    "name": 'Escort Ira Kidnap'
  };
  _BLUEPRINTS.DIALOGS.dialog_axehead_questgiver = {
    "dialog": 'Quit the staring. You\'re looking at the Chief of Fort Axehead.',
    "option1": 'Doesn\'t a Fort need an army? ',
    "option1_func": function (caller) {
      return "You're gonna taste the boots of the 'Army' if you're not careful.";
    },
    "option2": 'Hey, I\'ve got a question.',
    "option2_func": function (caller) {
      if (game.getFlag('spoke_to_ira')) {
        game.util.closeDialog();
        game.render.component("game_dialog", {
          dialog: 'dialog_axehead_questgiver_kidnap',
          callerObject: caller
        }, "game_dialog");
      } else {
        game.util.closeDialog();
        game.render.component("game_dialog", {
          dialog: 'dialog_axehead_questgiver_kidnap_misc',
          callerObject: caller
        }, "game_dialog");
      }
    },
    "parent": 'dialogs_generic',
    "name": 'Axehead Chief'
  };
  _BLUEPRINTS.DIALOGS.dialog_axehead_questgiver_kidnap = {
    "dialog": 'What is it, punk?',
    "option1": 'Not right now.',
    "option1_func": function (caller) {
      return "Quit wasting mah time.";
    },
    "option2": 'Have you got Ira\'s son?',
    "option2_func": function (caller) {
      game.setFlag('can_kidnap_ira', true);
      return "I know Ira, that's the old Sincorp lady... Don't got her son, but I'll tell ya what, if you go back to her and bring her back here you'll be rewarded, I assure you.";
    },
    "parent": 'dialogs_generic',
    "name": 'Axehead Chief kidnap'
  };
  _BLUEPRINTS.DIALOGS.dialog_villager_bountygiver = {
    "dialog": 'I\'m the face of Drumley pal, you don\'t wanna waste mah time... Or else.',
    "option1": 'Why is this place called Drumley?',
    "option1_func": function (caller) {
      return "Don't ya see all deh barrels around? They're drums, no?";
    },
    "option2": 'Have you got any work for me?',
    "option2_func": function (caller, player) {
      if (!game.getFlag('chief-flag')) {
        game.setFlag('chief-flag', true);
        player.inventory.main.addItem(new InventoryItem('bounty_sausage'), true);
        game.notify("You have recieved a bounty");
        return "Tell ya what, This fool has been terrorizing our town for years... If ya were to off him, we'd be mighty grateful to ya, pardner.";
      }
      return "Whadda ya doing back here punk? Go get him!";
    },
    "parent": 'dialogs_generic',
    "name": 'Drumley Chief'
  };
  _BLUEPRINTS.DIALOGS.dialog_redtown_smuggler = {
    "dialog": 'Psst! Come here, pal.',
    "option1": 'What is this place?',
    "option1_func": function (caller) {
      return "This is where darn Sincorp keeps all their doggone barrels, buddy!";
    },
    "option2": 'Have you got any work for me?',
    "option2_func": function (caller, player) {
      let items = player.inventory.main.getItemArray();
      let hasItem = false;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.codename == "ss_item_barrel_scrap") {
          return "You've already got a barrel, go deliver it.";
        }
      }
      game.setFlag('barrelsmuggle-flag', true);
      player.inventory.main.addItem(new InventoryItem('ss_item_barrel_scrap'), true);
      game.notify("You have recieved a scrap barrel");
      game.setFlag('smuggler-flag', true);
      return "There are these guys up north, they call themselves 'Drumley'. Basically, they got some weird love for barrels. Especially this guy! Barrels of booze, bodies, acid, empty, you name it, he wants it. If you were to deliver one to him, he'd pay you handsomely.";
    },
    "option3": 'What does \'this guy\' look like?',
    "option3_func": function (caller, player) {
      if (!game.getFlag('smuggler-flag')) {
        return "What guy?";
      } else {
        return "They wear a green shirt and a farmer's hat.";
      }
    },
    "parent": 'dialogs_generic',
    "name": 'Redtown Smuggle Mission'
  };
  _BLUEPRINTS.DIALOGS.tommy_steel_fan_dialog = {
    "dialog": 'IT\'S HIM, IT\'S TOMMY STEEL! IT\'S \'FEEL THE STEEL\' ! I cant believe it... Tommy Steel, here? In Landzo City??!',
    "option1": 'Who is that guy?',
    "option1_func": function (caller) {
      return "Who is 'that guy' ??? Well, he's only the Number One trans-planetary moviestar sensation!";
    },
    "option2": 'How did this guy even get famous?',
    "option2_func": function (caller) {
      return "Get famous? I don't know! His flicks are sick though!";
    },
    "parent": 'dialogs_generic',
    "name": 'tommy steel fan dialog'
  };
  _BLUEPRINTS.DIALOGS.dialog_mission_sicksbarreljob = {
    "dialog": 'Hey! Are you here for Alcoholic\'s Anonymous?',
    "option1": 'Who are you?',
    "option1_func": function (caller) {
      return "I run this place, we meet on mondays.";
    },
    "option2": 'I might have something for you',
    "option2_func": function (caller, player) {
      let items = player.inventory.main.getItemArray();
      let hasItem = false;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.codename == "ss_item_barrel") {
          player.inventory.main.removeItem(item);
          game.session.addCash(100);
          game.getFlag('barrel-flag');
          game.setFlag('barrel-flag', false);
          game.notify("You have recieved m200");
          return "Let's keep this just between you and me. I appreciate it.";
        }
        if (item.codename == "ss_item_barrel_scrap") {
          player.inventory.main.removeItem(item);
          game.session.addCash(200);
          game.getFlag('barrelsmuggle-flag');
          game.setFlag('barrelsmuggle-flag', false);
          game.notify("You have recieved m200");
          return "Let's keep this just between you and me. I appreciate it.";
        }
      }
      return "You have nothing that I am interested in.";
    },
    "parent": 'dialogs_generic',
    "name": 'Drumley Barrel guy'
  };
  _BLUEPRINTS.DIALOGS.dialog_sicks_questgiver = {
    "dialog": 'Welcome to the Sicks Saloon, friend!',
    "option1": 'Why all the destroyed buildings?',
    "option1_func": function (caller) {
      return "Those are the old brick buildings... They'd been destroyed by raiders. Sadly, many exploit our kindness.";
    },
    "option2": 'Have you got any work for me?',
    "option2_func": function (caller, player) {
      let items = player.inventory.main.getItemArray();
      let hasItem = false;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.codename == "ss_item_barrel") {
          "Hey buddy! I have no work right now because you're supposed to be delivering that barrel.";
        }
      }
      game.setFlag('barrel-flag', true);
      player.inventory.main.addItem(new InventoryItem('ss_item_barrel'), true);
      game.notify("You have recieved a scrap barrel");
      game.setFlag('colleague-flag', true);
      return "If you could deliver this barrel of the good stuff up to my colleague in Drumley, They'd make it worth your time.";
    },
    "option3": 'What does that colleague look like?',
    "option3_func": function (caller, player) {
      if (!game.getFlag('colleague-flag')) {
        return "What colleague?";
      } else {
        return "They wear a green shirt and a farmer's hat.";
      }
    },
    "parent": 'dialogs_generic',
    "name": 'Sicks Chief'
  };
  _BLUEPRINTS.DIALOGS.dialog_kolozium_barkeep_2 = {
    "dialog": 'I\'m Kolozium\'s bartender... Not Mallie!',
    "option1": 'Who\'s Mallie?',
    "option1_func": function (caller) {
      return "My Rival... Stupid Ex-Gladiator...";
    },
    "option2": 'Have you got any work for me?',
    "option2_func": function (caller, player) {
      if (!game.getFlag('mallie-flag')) {
        game.setFlag('mallie-flag', true);
        player.inventory.main.addItem(new InventoryItem('bounty_likor'), true);
        game.notify("You have recieved a bounty");
        return "Yes, punk. If you whack that fool called Mallie up north, I'll relay a good word upto the TAR Bandits.";
      }
      return "Nope, just the bounty that I gave 'ya.";
    },
    "option3": '[CHECK] I have bounties',
    "option3_func": function (caller, player) {
      let items = player.inventory.main.getItemArray();
      let hasItem = false;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.codename == "bounty_mallie") {
          game.session.addCash(item.data.bounty.value || 1000);
          game.notify("You have recieved m" + item.data.bounty.value);
          player.inventory.main.removeItem(item);
          game.session.tutComplete('complete_bounty');
          game.session.factions.addReputation('faction_tar_bandits', 15);
          game.notify("You have gained 15 reputation with the TAR Bandits");
          game.session.factions.removeReputation('faction_kolozium', 15);
          game.notify("You have lost 15 reputation with Kolozium");
          return "Finally, our rivalry has come to an end. I'll be hones though, Mallie's Gladiator pals will not forget this; Neither will TAR.";
        }
      }
      return "Hm, there are no bounties here that I can take care of, sorry.";
    },
    "parent": 'dialogs_generic',
    "name": 'Kolozium Barkeep 2'
  };
  _BLUEPRINTS.DIALOGS.dialog_kolozium_barkeep = {
    "dialog": 'Welcome to the one and only legitimate saloon in Kolozium, friend!',
    "option1": 'What\'s with the huge fight dome?',
    "option1_func": function (caller) {
      return "Why don't you go and find out bucko? We can never say no to a new gladiator.";
    },
    "option2": 'Have you got any work for me?',
    "option2_func": function (caller, player) {
      if (!game.getFlag('mallie-flag')) {
        game.setFlag('mallie-flag', true);
        player.inventory.main.addItem(new InventoryItem('bounty_likor'), true);
        game.notify("You have recieved a bounty");
        return "Yes... I do. If you could whack my rival for me, I'd highly appreciate it.";
      }
      return "Nope, just the bounty that I gave 'ya.";
    },
    "option3": '[CHECK] I have bounties',
    "option3_func": function (caller, player) {
      let items = player.inventory.main.getItemArray();
      let hasItem = false;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.codename == "bounty_likor") {
          game.session.addCash(item.data.bounty.value || 1000);
          game.notify("You have recieved m" + item.data.bounty.value);
          player.inventory.main.removeItem(item);
          game.session.tutComplete('complete_bounty');
          game.session.factions.removeReputation('faction_tar_bandits', 15);
          game.notify("You have lost 15 reputation with the TAR Bandits");
          game.session.factions.addReputation('faction_kolozium', 20);
          game.notify("You have gained 20 reputation with Kolozium");
          return "Finally, our rivalry has come to an end. I'll be hones though, Likor's TAR Bandit pals will not forget this; Neither will we.";
        }
      }
      return "Hm, there are no bounties here that I can take care of, sorry.";
    },
    "parent": 'dialogs_generic',
    "name": 'Kolozium Barkeep 1'
  };
});
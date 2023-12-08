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
          game.session.addCash(item.data.bounty || 1000);
          player.inventory.main.removeItem(item);
          game.session.tutComplete('complete_bounty');
          return "Nice work, heres your payment";
          break;
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
});
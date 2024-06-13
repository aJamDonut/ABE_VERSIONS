(function () {
  _BLUEPRINTS.SPECIES = {};
  _BLUEPRINTS.SPECIES.species_sandtick = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Sandticks are everywhere, a small native to the desert - they crawl their way into just about anywhere they can fit. They\'re relatively weak but an infestation could lead to atleast some injury.',
    "stats": {
      "maxHp": 50,
      "maxTorp": 50,
      "torpDegrade": 0.01,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 1,
      "baseSpeed": 5,
      "baseWeight": 2
    },
    "parent": 'species',
    "name": 'Sandtick'
  };
  _BLUEPRINTS.SPECIES.species_noirpup = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Noirpup are the offspring of a Noirtree. They are small and quick and explode when they come into contact with their prey. They are a drone mind controlled from a central tree and so to stop Noirpups breeding one must first destroy the Noirtree.',
    "stats": {
      "maxHp": 25,
      "maxTorp": 25,
      "torpDegrade": 0.01,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 1,
      "baseSpeed": 12,
      "baseWeight": 2
    },
    "parent": 'species',
    "name": 'Noirpup'
  };
  _BLUEPRINTS.SPECIES.species_shnel = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Shnel are very slow... But tasty.',
    "stats": {
      "maxHp": 10,
      "maxTorp": 10,
      "torpDegrade": 0.01,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 1,
      "baseSpeed": 1,
      "baseWeight": 2
    },
    "parent": 'species',
    "name": 'Shnel'
  };
  _BLUEPRINTS.SPECIES.species_mutantclone = {
    "lifeClass": 'LifeObject',
    "desc": 'Mutated Clones are much more heavily mutated versions of Clones. In modern times these clones are destroyed before they get to make a change on reality but many years ago they were tolerated and utilized until more preferable clones were available to replace them. Now hoards of mutated clones can be found in various scatterings across the desert.',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'rawmeat,whitemeat,cookedmeat',
    "validMedicalItems": 'extendyolife,bandage_small,medical_pen',
    "stats": {
      "maxHp": 80,
      "maxTorp": 80,
      "torpDegrade": 0.1,
      "torpRestRecovery": 3,
      "hpRecovery": 0.01,
      "hpRestRecovery": 1,
      "baseSpeed": 5,
      "baseWeight": 5
    },
    "parent": 'species',
    "name": 'Mutated Clone'
  };
  _BLUEPRINTS.SPECIES.species_skren = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Skren are a mouse-like creature found in the burrowed holes in the desert. They are quite crafty and can quickly thief from an unsuspecting passer-by.',
    "stats": {
      "maxHp": 40,
      "maxTorp": 40,
      "torpDegrade": 0.01,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 1,
      "baseSpeed": 15,
      "baseWeight": 5
    },
    "parent": 'species',
    "name": 'Skren'
  };
  _BLUEPRINTS.SPECIES.species_mecha = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Mecha are very fast but weak engineered devices. Nobody knows who\'s fabricating these things, all we know is that they\'re extremely quick, and always aggressive.',
    "stats": {
      "maxHp": 150,
      "maxTorp": 150,
      "torpDegrade": 0.01,
      "torpRestRecovery": 0.1,
      "hpRecovery": 0.9,
      "hpRestRecovery": 5,
      "baseSpeed": 20,
      "baseWeight": 5
    },
    "parent": 'species',
    "name": 'Mecha'
  };
  _BLUEPRINTS.SPECIES.species_neurobiote = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Neurobiote are a slimey gooey create found within abandoned research labs and disbanded outposts. No one is sure of their origin and most are avoided by anybody who comes across them.',
    "stats": {
      "maxHp": 50,
      "maxTorp": 50,
      "torpDegrade": 0.01,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 1,
      "baseSpeed": 8,
      "baseWeight": 4
    },
    "parent": 'species',
    "name": 'Neurobiote'
  };
  _BLUEPRINTS.SPECIES.species_noircat = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Noircat are cat-like creatures surprisingly found on the planet upon first landing. At first they were skittish and untrusting, but with little co-operation and treats and kibbles, they easily began a relationship with colonists.',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'rawmeat,whitemeat,cookedmeat',
    "stats": {
      "maxHp": 80,
      "maxTorp": 80,
      "torpDegrade": 0.1,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 10,
      "baseSpeed": 20,
      "baseWeight": 3
    },
    "parent": 'species',
    "name": 'Noir Cat'
  };
  _BLUEPRINTS.SPECIES.species_lokaltribute = {
    "lifeClass": 'LifeObject',
    "desc": 'Lokal Tributes are guardians of the Lokal villages. They are a mix of Lokals and banished clones, they will attack enemies on site but if you approach in a small group they will likely let you approach for conversation.',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'skin,hemp,spidereye,jyelo',
    "validMedicalItems": 'bandage_small,bandage_large,medical_pen',
    "stats": {
      "maxHp": 300,
      "maxTorp": 100,
      "torpDegrade": 0.01,
      "torpRestRecovery": 5,
      "hpRecovery": 0.25,
      "hpRestRecovery": 3,
      "baseSpeed": 15,
      "baseWeight": 15
    },
    "parent": 'species',
    "name": 'Lokal Tribute'
  };
  _BLUEPRINTS.SPECIES.species_dag = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Dag are a spliced species from the Homeworld brought over from founders. Through countless experimentation this species were developed to be less aggressive than typical dogs and serves more as a big fluffy companion.',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'rawmeat,whitemeat,cookedmeat',
    "stats": {
      "maxHp": 100,
      "maxTorp": 100,
      "torpDegrade": 0.1,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 10,
      "baseSpeed": 12,
      "baseWeight": 5
    },
    "parent": 'species',
    "name": 'Dag'
  };
  _BLUEPRINTS.SPECIES.species_wolfen = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Wolfen are named as such thanks to their large teeth and gray fur but this species developed on the planet through the breding after the feralization of dogs brought from the homeworld, these agile wolf-likes are the few that survived when abandoned by their owners.',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'rawmeat,whitemeat,cookedmeat',
    "stats": {
      "maxHp": 200,
      "maxTorp": 80,
      "torpDegrade": 0.1,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 10,
      "baseSpeed": 15,
      "baseWeight": 5
    },
    "parent": 'species',
    "name": 'Wolfen'
  };
  _BLUEPRINTS.SPECIES.species_clone = {
    "lifeClass": 'LifeObject',
    "desc": 'Clones are very weak and very controlled individuals. They were concocted through many iterations of splicing and formulation over many years back on planet Earth. No clone has any form of individuality and most are devoid of ability to perform most common human interactions apart from labour work except for the exceptions; those which may have mutated past these inhibitions.',
    "stats": {
      "maxHp": 75,
      "maxTorp": 100,
      "torpDegrade": 0.3,
      "torpRestRecovery": 2,
      "hpRecovery": 0.1,
      "hpRestRecovery": 2,
      "baseSpeed": 10,
      "baseWeight": 10
    },
    "parent": 'species',
    "name": 'Clone'
  };
  _BLUEPRINTS.SPECIES.species_rb1 = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'RB-1 is the first generation Robot developed by SinCorp. They are easy to fabricate yet lack many components which make the RB-2 and RB-3 much more superior.',
    "lifestyle": 'c_effect_clone_needs',
    "stats": {
      "maxHp": 80,
      "maxTorp": 80,
      "torpDegrade": 0.1,
      "torpRestRecovery": 3,
      "hpRecovery": 0.01,
      "hpRestRecovery": 1,
      "baseSpeed": 20,
      "baseWeight": 5
    },
    "parent": 'species',
    "name": 'RB-1'
  };
  _BLUEPRINTS.SPECIES.species_jackal = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Jackals are well adapted to this planet and are a result of breeding between Dags and Wofen. As such they provide a nice middle grown between loyalty and adaptability in the desert.',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'rawmeat,whitemeat,cookedmeat',
    "stats": {
      "maxHp": 150,
      "maxTorp": 150,
      "torpDegrade": 0.1,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 10,
      "baseSpeed": 10,
      "baseWeight": 3
    },
    "parent": 'species',
    "name": 'Jackal'
  };
  _BLUEPRINTS.SPECIES.species_lunacat = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Luna Cat are cat-like creatures very similar to Noir Cat yet slightly less trusting. After Noir Cat had become common place within the colonies, Luna Cat began to turn up, beginning a competition of sorts between the two species',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'rawmeat,whitemeat,cookedmeat',
    "stats": {
      "maxHp": 120,
      "maxTorp": 120,
      "torpDegrade": 0.1,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 10,
      "baseSpeed": 15,
      "baseWeight": 5
    },
    "parent": 'species',
    "name": 'Luna Cat'
  };
  _BLUEPRINTS.SPECIES.species_chien = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Chien are a mutt species as a result of Grayback breeding with other species. They have extremely high health but do not have much energy to sustain their speed and attacks for long.',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'rawmeat,whitemeat,cookedmeat',
    "stats": {
      "maxHp": 200,
      "maxTorp": 50,
      "torpDegrade": 0.25,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 10,
      "baseSpeed": 12,
      "baseWeight": 6
    },
    "parent": 'species',
    "name": 'Chien'
  };
  _BLUEPRINTS.SPECIES.species_bloodhound = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Bloodhound are the purest species found on the planet, even compared to founders their blood is considered pure to their counterparts back on the homeworld. They are known to be loyal and good fighters.',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'rawmeat,whitemeat,cookedmeat',
    "stats": {
      "maxHp": 200,
      "maxTorp": 150,
      "torpDegrade": 0.25,
      "torpRestRecovery": 2,
      "hpRecovery": 0.5,
      "hpRestRecovery": 10,
      "baseSpeed": 10,
      "baseWeight": 10
    },
    "parent": 'species',
    "name": 'Bloodhound'
  };
  _BLUEPRINTS.SPECIES.species_boarhog = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Boarhog are a creature originating from natural cross breeding of the Hogs brought by the Founders as well as the Skren found in the desert. By chance these Boarhog can actually survive in the desert lands and therefore outlasted the Hogs brought from the Homeworld.',
    "stats": {
      "maxHp": 100,
      "maxTorp": 70,
      "torpDegrade": 0.01,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 1,
      "baseSpeed": 8,
      "baseWeight": 7
    },
    "parent": 'species',
    "name": 'Boarhog'
  };
  _BLUEPRINTS.SPECIES.species_lokal = {
    "lifeClass": 'LifeObject',
    "desc": 'Lokals are hardier strangers who were on this land before the Founders arrived. They hide in the dunes and only the odd Lokal has ever been caught here and there. Through fear, most have been killed or tortured to death before learning more of their species.',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'skin,hemp,spidereye,jyelo',
    "validMedicalItems": 'bandage_small,bandage_large,medical_pen',
    "stats": {
      "maxHp": 280,
      "maxTorp": 500,
      "torpDegrade": 0.1,
      "torpRestRecovery": 5,
      "hpRecovery": 0.25,
      "hpRestRecovery": 3,
      "baseSpeed": 20,
      "baseWeight": 20
    },
    "parent": 'species',
    "name": 'Lokal'
  };
  _BLUEPRINTS.SPECIES.species_rb2 = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'RB-2 is the second generation Robot developed by SinCorp. They are much sturdier than the RB-1 and degrade at a much slower rate. They trade the base speed of the RB-1 for a much larger base weight.',
    "lifestyle": 'c_effect_clone_needs',
    "stats": {
      "maxHp": 120,
      "maxTorp": 150,
      "torpDegrade": 0.1,
      "torpRestRecovery": 3,
      "hpRecovery": 0.01,
      "hpRestRecovery": 1,
      "baseSpeed": 5,
      "baseWeight": 20
    },
    "parent": 'species',
    "name": 'RB-2'
  };
  _BLUEPRINTS.SPECIES.species_rb3 = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'RB-3 is the final rendition of the RB series by SinCorp. It boasts a balance of weight and speed compared to the RB-1 and RB-2 but it really excels in having much sturdier body.',
    "lifestyle": 'c_effect_clone_needs',
    "stats": {
      "maxHp": 200,
      "maxTorp": 200,
      "torpDegrade": 0.1,
      "torpRestRecovery": 6,
      "hpRecovery": 0.01,
      "hpRestRecovery": 6,
      "baseSpeed": 10,
      "baseWeight": 10
    },
    "parent": 'species',
    "name": 'RB-3'
  };
  _BLUEPRINTS.SPECIES.species_docobot = {
    "lifeClass": 'LifeObject',
    "desc": 'A really useless docobot',
    "stats": {
      "maxHp": 1,
      "maxTorp": 1,
      "torpDegrade": 0.1,
      "torpRestRecovery": 0.1,
      "hpRecovery": 0.001,
      "hpRestRecovery": 0.1,
      "baseSpeed": 1,
      "baseWeight": 1
    },
    "parent": 'species',
    "name": 'Docobot'
  };
  _BLUEPRINTS.SPECIES.species_skinner = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Skinners are a putrid mess of splicing gone wrong. The origins of this creature are unknown. The only reporting\'s in local colonies are those where the creature has decimated entire laboratories before zipping away, only leaving behind a trail of blood and limbs.',
    "stats": {
      "maxHp": 50,
      "maxTorp": 50,
      "torpDegrade": 0.01,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 1,
      "baseSpeed": 8,
      "baseWeight": 4
    },
    "parent": 'species',
    "name": 'Skinner'
  };
  _BLUEPRINTS.SPECIES.species_grayback = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Grayback are a very quick tracking dog. They have been used by Police for decades to quickly find escaped clones or bandits.',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'rawmeat,whitemeat,cookedmeat',
    "stats": {
      "maxHp": 80,
      "maxTorp": 80,
      "torpDegrade": 0.1,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 10,
      "baseSpeed": 15,
      "baseWeight": 5
    },
    "parent": 'species',
    "name": 'Grayback'
  };
  _BLUEPRINTS.SPECIES.species_mantis = {
    "lifeClass": 'LifeObjectAnim',
    "desc": 'Desert Mantis come in many shapes and sizes, the creepiest being the large Red Mantis. They pounce at near to anything edible and begin to exhibit violence against anything within their hunting grounds',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'rawmeat,whitemeat,cookedmeat,skin,hemp',
    "stats": {
      "maxHp": 500,
      "maxTorp": 500,
      "torpDegrade": 0.1,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 10,
      "baseSpeed": 10,
      "baseWeight": 20
    },
    "parent": 'species',
    "name": 'Mantis'
  };
  _BLUEPRINTS.SPECIES.species_founderkin = {
    "lifeClass": 'LifeObject',
    "desc": 'Founder Kin are children of those who came from Earth and are amongst the strongest species on the planet. They lack the medical enhancements of founders but still have extremely durable bodies and spirit',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'cookedmeat',
    "validMedicalItems": 'extendyolife,bandage_small,bandage_large,medical_pen',
    "stats": {
      "maxHp": 250,
      "maxTorp": 250,
      "torpDegrade": 0.4,
      "torpRestRecovery": 4,
      "hpRecovery": 0.4,
      "hpRestRecovery": 4,
      "baseSpeed": 20,
      "baseWeight": 20
    },
    "parent": 'species',
    "name": 'Founder Kin'
  };
  _BLUEPRINTS.SPECIES.species_horse = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Horse are a prized species, imported during colonization and bred rarely by only a few. These breeds are known to last well within the hot deserts and can decrease the pain of traversing across a the lands under a scorching sun.',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'hemp',
    "stats": {
      "maxHp": 400,
      "maxTorp": 150,
      "torpDegrade": 0.25,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 10,
      "baseSpeed": 12,
      "baseWeight": 6
    },
    "parent": 'species',
    "name": 'Horse'
  };
  _BLUEPRINTS.SPECIES.species_argent = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Argent are a bird-like species first discovered when exploring in the north regions of the desert. They are believed to be territorial, quick and quite hardy. It has been observed sometimes that the Lokals will interact with these bird-like creatures.',
    "stats": {
      "maxHp": 150,
      "maxTorp": 150,
      "torpDegrade": 0.01,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 1,
      "baseSpeed": 15,
      "baseWeight": 15
    },
    "parent": 'species',
    "name": 'Argent'
  };
  _BLUEPRINTS.SPECIES.species_founder = {
    "lifeClass": 'LifeObject',
    "desc": 'Founders from Earth are amongst the strongest species on the planet. Enhanced by their incredible medical enhancements from their home planet as well many of them having loyal clones at their disposal',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'cookedmeat',
    "validMedicalItems": 'extendyolife,bandage_small,bandage_large,medical_pen',
    "stats": {
      "maxHp": 300,
      "maxTorp": 300,
      "torpDegrade": 0.2,
      "torpRestRecovery": 5,
      "hpRecovery": 0.5,
      "hpRestRecovery": 5,
      "baseSpeed": 20,
      "baseWeight": 20
    },
    "parent": 'species',
    "name": 'Founder'
  };
  _BLUEPRINTS.SPECIES.species_longneck = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Longneck are a passive creature native to the desert. Their longs necks and hardened fur ensure they can resist most attackers. They are very large, very slow and very strong. If a Longneck is coming in your direction, you move out of the way.',
    "stats": {
      "maxHp": 550,
      "maxTorp": 550,
      "torpDegrade": 0.01,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 1,
      "baseSpeed": 4,
      "baseWeight": 4
    },
    "parent": 'species',
    "name": 'Longneck'
  };
  _BLUEPRINTS.SPECIES.species_unicorn = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Unicorn! I mean...? Unicorn? Wait... Is that really a Unicorn?',
    "lifestyle": 'c_effect_clone_needs',
    "diet": 'hemp',
    "stats": {
      "maxHp": 350,
      "maxTorp": 150,
      "torpDegrade": 0.25,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 10,
      "baseSpeed": 14,
      "baseWeight": 8
    },
    "parent": 'species',
    "name": 'Unicorn'
  };
  _BLUEPRINTS.SPECIES.species_gremblo = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Gremblo are extremely hardy beasts. Native to the desert they can last for days without food or water. They have huge pools of health and can carry many items. This makes a Gremblo a much desired beast, birthing to the phrase "Shremblo in my Gremblo", in other words, give my Gremblo everything it needs to be taken care of properly.',
    "stats": {
      "maxHp": 350,
      "maxTorp": 350,
      "torpDegrade": 0.01,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 1,
      "baseSpeed": 14,
      "baseWeight": 8
    },
    "parent": 'species',
    "name": 'Gremblo'
  };
  _BLUEPRINTS.SPECIES.species_phoenix = {
    "lifeClass": 'LifeObjectSimple',
    "desc": 'Phoenix are a myth first reported by the younglings of the Yamakai. It is said to be a rare occurrence during the hottest weather days. No one knows much about this creature, but if they do exist they must be a sight to behold.',
    "stats": {
      "maxHp": 250,
      "maxTorp": 250,
      "torpDegrade": 0.01,
      "torpRestRecovery": 0.1,
      "hpRecovery": 1,
      "hpRestRecovery": 1,
      "baseSpeed": 15,
      "baseWeight": 5
    },
    "parent": 'species',
    "name": 'Phoenix'
  };
})();
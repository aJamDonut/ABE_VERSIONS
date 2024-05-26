(function () {
  _BLUEPRINTS.FACTIONS = {};
  _BLUEPRINTS.FACTIONS.faction_sincorp = {
    "desc": 'The original founders of the planet, they come from Earth and settled in the desert a little over 200 years ago.',
    "enemies": 'faction_yamakai,faction_deadhead,faction_superhappyclones,faction_hunter,faction_axehead',
    "leader1": 'spawner_cp_zalex',
    "parent": 'factions',
    "name": 'Sincorp'
  };
  _BLUEPRINTS.FACTIONS.faction_nomad = {
    "parent": 'factions',
    "name": 'Nomad'
  };
  _BLUEPRINTS.FACTIONS.faction_wild = {
    "allies": 'faction_passive_wild',
    "enemies": 'faction_sincorp,faction_nomad,faction_wild,faction_bandit,faction_yamakai,faction_civilian,faction_deadhead,faction_superhappyclones,faction_hunter,faction_drumley,faction_axehead,faction_sicks',
    "parent": 'factions',
    "name": 'Wild'
  };
  _BLUEPRINTS.FACTIONS.faction_bandit = {
    "parent": 'factions',
    "name": 'Bandits'
  };
  _BLUEPRINTS.FACTIONS.faction_yamakai = {
    "enemies": 'faction_sincorp,faction_wild,faction_bandit,faction_deadhead,faction_superhappyclones,faction_axehead',
    "parent": 'factions',
    "name": 'Yamakai'
  };
  _BLUEPRINTS.FACTIONS.faction_civilian = {
    "parent": 'factions',
    "name": 'Civilian'
  };
  _BLUEPRINTS.FACTIONS.faction_deadhead = {
    "parent": 'factions',
    "name": 'Deadhead'
  };
  _BLUEPRINTS.FACTIONS.faction_superhappyclones = {
    "parent": 'factions',
    "name": 'Super Happy Clones'
  };
  _BLUEPRINTS.FACTIONS.faction_hunter = {
    "parent": 'factions',
    "name": 'Hunter'
  };
  _BLUEPRINTS.FACTIONS.faction_passive_wild = {
    "parent": 'factions',
    "name": 'Passive Wild'
  };
  _BLUEPRINTS.FACTIONS.faction_drumley = {
    "desc": 'Drumley is a small town surrounded by the desert mountains, they are known for their love for barrel drums hence the name \'Drumley\'. Rumours are that this town loves to drink a little too much, despite not having a saloon.',
    "allies": 'faction_bandit,faction_yamakai,faction_civilian',
    "enemies": 'faction_deadhead',
    "leader1": 'spawner_drumley_questgiver',
    "parent": 'factions',
    "name": 'Drumley'
  };
  _BLUEPRINTS.FACTIONS.faction_axehead = {
    "desc": 'Fort Axehead is a brutal settlement riddled with punks and ex-military, coming together to cause as much crime and chaos in order to gain a place in the world. They kidnap, raid, pillage, and insult everyone who comes their way.',
    "allies": 'faction_bandit,faction_yamakai',
    "enemies": 'faction_deadhead',
    "leader1": 'spawner_axehead_questgiver',
    "parent": 'factions',
    "name": 'Axehead'
  };
  _BLUEPRINTS.FACTIONS.faction_sicks = {
    "desc": 'The town of Sicks, named after the six lakes on which it resides, is known for its kindness and acceptance. However, this fatal flaw has lead to numerous attacks against the peaceful settlement, which surprisingly hasn\'t deterred their kindness.',
    "allies": 'faction_civilian',
    "leader1": 'spawner_sicks_questgiver',
    "parent": 'factions',
    "name": 'Sicks'
  };
})();
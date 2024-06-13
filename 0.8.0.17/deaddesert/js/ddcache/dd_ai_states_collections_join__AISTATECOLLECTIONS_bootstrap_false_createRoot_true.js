(function () {
  self._AISTATECOLLECTIONS = {};
  _AISTATECOLLECTIONS.ais_player_clone = {
    "states": 'aistate_gotocontainer,aistate_find_jobs,aistate_do_jobs,aistate_useitem,aistate_gather,aistate_goto_gather,aistate_follow_player,aistate_move',
    "parent": 'ai_states_collections',
    "name": 'Player Clone'
  };
  _AISTATECOLLECTIONS.ais_default = {
    "states": 'aistate_go_home,aistate_ko,aistate_idle,aistate_follow_leader,aistate_find_enemies,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistate_changeweapon,aistate_gotopoints',
    "parent": 'ai_states_collections',
    "name": 'Default - all inherit'
  };
  _AISTATECOLLECTIONS.ais_drone = {
    "states": 'aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistate_gather,aistate_goto_gather',
    "parent": 'ai_states_collections',
    "name": 'Drone (player default)'
  };
  _AISTATECOLLECTIONS.ais_guard = {
    "states": 'aistate_ko,aistate_idle,aistate_shuffle,aistate_attack,aistate_changeweapon,aistate_attack_chase,aistate_attack_stop_chase,aistate_go_home,aistate_guardpatrol,aistate_gotopoints',
    "parent": 'ai_states_collections',
    "name": 'Guard'
  };
  _AISTATECOLLECTIONS.ais_wander = {
    "states": 'aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistate_gotopoints',
    "parent": 'ai_states_collections',
    "name": 'Wanderer'
  };
  _AISTATECOLLECTIONS.ais_deadhead = {
    "states": 'aistate_ko,aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistate_shuffle',
    "parent": 'ai_states_collections',
    "name": 'Wanderer'
  };
  _AISTATECOLLECTIONS.ais_police = {
    "states": 'aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistate_gotopoints',
    "parent": 'ai_states_collections',
    "name": 'Guard'
  };
  _AISTATECOLLECTIONS.ais_prop = {
    "states": 'aistate_idle,aistate_attack,aistate_attack_chase,aistate_attack_stop_chase,aistage_go_home',
    "parent": 'ai_states_collections',
    "name": 'Prop'
  };
  _AISTATECOLLECTIONS.ais_shopkeeper = {
    "states": 'aistate_ko,aistate_idle,aistate_attack,aistate_changeweapon,aistate_attack_chase,aistate_attack_stop_chase',
    "parent": 'ai_states_collections',
    "name": 'Shopkeeper'
  };
  _AISTATECOLLECTIONS.ais_placid = {
    "states": 'aistate_ko,aistate_idle,aistate_shuffle,aistate_attack,aistate_changeweapon,aistate_attack_chase,aistate_attack_stop_chase,aistate_go_home',
    "parent": 'ai_states_collections',
    "name": 'Placid'
  };
  _AISTATECOLLECTIONS.ais_solver = {
    "states": 'aistate_ko,aistate_idle,aistate_solve',
    "parent": 'ai_states_collections',
    "name": 'Solver (Simple brain)'
  };
})();
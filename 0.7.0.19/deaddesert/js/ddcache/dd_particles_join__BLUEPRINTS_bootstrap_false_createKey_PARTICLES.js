(function () {
  _BLUEPRINTS.PARTICLES = {};
  _BLUEPRINTS.PARTICLES.particles_pop = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.02,
        "end": 0.1,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#ffe0e0",
        "end": "#fc0000"
      },
      "speed": {
        "start": 200,
        "end": 200,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 0
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 0.1,
        "max": 0.05
      },
      "blendMode": "normal",
      "frequency": 0.001,
      "emitterLifetime": 0.1,
      "maxParticles": 1000,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": false,
      "spawnType": "burst",
      "particlesPerWave": 8,
      "particleSpacing": 45,
      "angleStart": 0
    },
    "parent": 'particles',
    "name": 'Pop'
  };
  _BLUEPRINTS.PARTICLES.particles_smoke_1 = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 0.74,
        "end": 0
      },
      "scale": {
        "start": 2,
        "end": 1.2,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#ffdfa0",
        "end": "#100f0c"
      },
      "speed": {
        "start": 700,
        "end": 0,
        "minimumSpeedMultiplier": 0.1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 200
      },
      "lifetime": {
        "min": 0.5,
        "max": 0.75
      },
      "blendMode": "normal",
      "ease": [{
        "s": 0,
        "cp": 0.329,
        "e": 0.548
      }, {
        "s": 0.548,
        "cp": 0.767,
        "e": 0.876
      }, {
        "s": 0.876,
        "cp": 0.985,
        "e": 1
      }],
      "frequency": 0.001,
      "emitterLifetime": 0.1,
      "maxParticles": 50,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": 'Smoke 1'
  };
  _BLUEPRINTS.PARTICLES.particles_sparks_1 = {
    "sprites": 'tex_spark_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.5,
        "end": 1,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#d1b200",
        "end": "#f2ff03"
      },
      "speed": {
        "start": 300,
        "end": 100,
        "minimumSpeedMultiplier": 0.2
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 180,
        "max": 180
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 0.5,
        "max": 0.81
      },
      "blendMode": "normal",
      "frequency": 1,
      "emitterLifetime": -1,
      "maxParticles": 200,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "burst",
      "particlesPerWave": 3,
      "particleSpacing": 0,
      "angleStart": 0
    },
    "parent": 'particles',
    "name": 'Sparks 1'
  };
  _BLUEPRINTS.PARTICLES.particles_trail_1 = {
    "sprites": 'tex_square_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.11,
        "end": 0.11,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#ffffff",
        "end": "#000000"
      },
      "speed": {
        "start": 600,
        "end": 200,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 180,
        "max": 180
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 0.81,
        "max": 5.81
      },
      "blendMode": "normal",
      "frequency": 0.001,
      "emitterLifetime": -1,
      "maxParticles": 100,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": false,
      "spawnType": "rect",
      "spawnRect": {
        "x": 0,
        "y": 0,
        "w": 0,
        "h": 0
      }
    },
    "parent": 'particles',
    "name": 'Trail 1'
  };
  _BLUEPRINTS.PARTICLES.particles_smoke_2 = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 0.45,
        "end": 0
      },
      "scale": {
        "start": 0.1,
        "end": 1,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#85888d",
        "end": "#100f0c"
      },
      "speed": {
        "start": 10,
        "end": 20,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 0.5,
        "max": 1
      },
      "blendMode": "normal",
      "frequency": 0.001,
      "emitterLifetime": -1,
      "maxParticles": 50,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "circle",
      "spawnCircle": {
        "x": 0,
        "y": 0,
        "r": 1
      }
    },
    "parent": 'particles',
    "name": 'Smoke 2'
  };
  _BLUEPRINTS.PARTICLES.particles_shootdebris = {
    "sprites": 'tex_spark_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0.31
      },
      "scale": {
        "start": 0.5,
        "end": 1,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#ffffff",
        "end": "#c9c9c9"
      },
      "speed": {
        "start": 1000,
        "end": 200,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 225,
        "max": 320
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 20
      },
      "lifetime": {
        "min": 0.25,
        "max": 0.25
      },
      "blendMode": "normal",
      "frequency": 0.001,
      "emitterLifetime": 0.2,
      "maxParticles": 5,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": false,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": 'Shoot Debris'
  };
  _BLUEPRINTS.PARTICLES.particles_smoke_3 = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 0.45,
        "end": 0
      },
      "scale": {
        "start": 0.01,
        "end": 0.5,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#85888d",
        "end": "#100f0c"
      },
      "speed": {
        "start": 50,
        "end": 100,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 270,
        "max": 280
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 0.5,
        "max": 2
      },
      "blendMode": "normal",
      "frequency": 0.001,
      "emitterLifetime": -1,
      "maxParticles": 10,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": 'Smoke 2'
  };
  _BLUEPRINTS.PARTICLES.particles_fire_1 = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.25,
        "end": 0.1,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#ebca0c",
        "end": "#dbc12c"
      },
      "speed": {
        "start": 50,
        "end": 100,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 270,
        "max": 280
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 0.5,
        "max": 2
      },
      "blendMode": "screen",
      "frequency": 0.001,
      "emitterLifetime": -1,
      "maxParticles": 25,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": 'Smoke 2'
  };
  _BLUEPRINTS.PARTICLES.particles_blood_impact = {
    "sprites": 'tex_particle_1,tex_rain_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.1,
        "end": 0.1,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#520606",
        "end": "#ff0000"
      },
      "speed": {
        "start": 10,
        "end": 10,
        "minimumSpeedMultiplier": 50
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 0.2,
        "max": 0.2
      },
      "blendMode": "normal",
      "frequency": 0.01,
      "emitterLifetime": 0.25,
      "maxParticles": 21,
      "pos": {
        "x": 0.5,
        "y": 0.5
      },
      "addAtBack": true,
      "spawnType": "circle",
      "spawnCircle": {
        "x": 0,
        "y": 0,
        "r": 1
      }
    },
    "parent": 'particles',
    "name": 'Blood Impact'
  };
  _BLUEPRINTS.PARTICLES.particles_blood_impact2 = {
    "sprites": 'tex_particle_1,tex_rain_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.1,
        "end": 0.4,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#520606",
        "end": "#750000"
      },
      "speed": {
        "start": 50,
        "end": 10,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 0.1,
        "max": 0.2
      },
      "blendMode": "normal",
      "frequency": 0.01,
      "emitterLifetime": 0.1,
      "maxParticles": 21,
      "pos": {
        "x": 0.5,
        "y": 0.5
      },
      "addAtBack": true,
      "spawnType": "circle",
      "spawnCircle": {
        "x": 0,
        "y": 0,
        "r": 1
      }
    },
    "parent": 'particles',
    "name": 'Blood Impact 2'
  };
  _BLUEPRINTS.PARTICLES.particles_poison_1 = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 0.64,
        "end": 0
      },
      "scale": {
        "start": 0.1,
        "end": 0.4,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#143d12",
        "end": "#9bbf1b"
      },
      "speed": {
        "start": 10,
        "end": 10,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 2,
        "max": 1.8
      },
      "blendMode": "darken",
      "frequency": 0.01,
      "emitterLifetime": 1,
      "maxParticles": 30,
      "pos": {
        "x": 0.5,
        "y": 0.5
      },
      "addAtBack": true,
      "spawnType": "circle",
      "spawnCircle": {
        "x": 0,
        "y": 0,
        "r": 50
      }
    },
    "parent": 'particles',
    "name": 'Poison 1'
  };
  _BLUEPRINTS.PARTICLES.particles_poison_2 = {
    "sprites": 'tex_ktoon_smoke',
    "data": {
      "alpha": {
        "start": 0.74,
        "end": 0
      },
      "scale": {
        "start": 5,
        "end": 1.2,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#ffdb94",
        "end": "#b8b8b8"
      },
      "speed": {
        "start": 900,
        "end": 0,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 200
      },
      "lifetime": {
        "min": 0.5,
        "max": 1
      },
      "blendMode": "normal",
      "ease": [{
        "s": 0,
        "cp": 0.329,
        "e": 0.548
      }, {
        "s": 0.548,
        "cp": 0.767,
        "e": 0.876
      }, {
        "s": 0.876,
        "cp": 0.985,
        "e": 1
      }],
      "frequency": 0.001,
      "emitterLifetime": 0.02,
      "maxParticles": 20,
      "pos": {
        "x": 100,
        "y": 50
      },
      "addAtBack": true,
      "spawnType": "ring",
      "spawnCircle": {
        "x": 100,
        "y": 100,
        "r": 5,
        "minR": 5
      }
    },
    "parent": 'particles',
    "name": 'cgh me'
  };
  _BLUEPRINTS.PARTICLES.particles_poison_3 = {
    "sprites": 'tex_skulls_1',
    "data": {
      "alpha": {
        "start": 0.52,
        "end": 0
      },
      "scale": {
        "start": 0.001,
        "end": 1,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#1eff00",
        "end": "#000000"
      },
      "speed": {
        "start": 10,
        "end": 50,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 0
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 0.5,
        "max": 2
      },
      "blendMode": "normal",
      "frequency": 0.01,
      "emitterLifetime": -1,
      "maxParticles": 5,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": false,
      "spawnType": "circle",
      "spawnCircle": {
        "x": 0,
        "y": 50,
        "r": 50
      }
    },
    "parent": 'particles',
    "name": 'Poison 3'
  };
  _BLUEPRINTS.PARTICLES.particles_blood_pool = {
    "sprites": 'tex_blood_splat',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.05,
        "end": 3,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#ff0000",
        "end": "#ff0011"
      },
      "speed": {
        "start": 1,
        "end": 2,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 0
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 5,
        "max": 20
      },
      "blendMode": "normal",
      "frequency": 0.01,
      "emitterLifetime": 0.2,
      "maxParticles": 4,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": false,
      "spawnType": "circle",
      "spawnCircle": {
        "x": 0,
        "y": 50,
        "r": 50
      }
    },
    "parent": 'particles',
    "name": 'Blood pool'
  };
  _BLUEPRINTS.PARTICLES.particles_fell_on_floor = {
    "sprites": 'tex_log_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 1
      },
      "scale": {
        "start": 0.5,
        "end": 0.5,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#ffffff",
        "end": "#404040"
      },
      "speed": {
        "start": 200,
        "end": 0,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 90,
        "max": 180
      },
      "noRotation": true,
      "rotationSpeed": {
        "min": 0,
        "max": 25
      },
      "lifetime": {
        "min": 0.5,
        "max": 1
      },
      "blendMode": "normal",
      "ease": [{
        "s": 0,
        "cp": 0.329,
        "e": 0.548
      }, {
        "s": 0.548,
        "cp": 0.767,
        "e": 0.876
      }, {
        "s": 0.876,
        "cp": 0.985,
        "e": 1
      }],
      "frequency": 0.001,
      "emitterLifetime": 0.1,
      "maxParticles": 3,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": 'Fell on floor'
  };
  _BLUEPRINTS.PARTICLES.particles_flitter = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.001,
        "end": 1,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#fff3b2",
        "end": "#edff24"
      },
      "speed": {
        "start": 10,
        "end": 10,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 50
      },
      "lifetime": {
        "min": 15,
        "max": 15
      },
      "blendMode": "normal",
      "frequency": 5,
      "emitterLifetime": 15,
      "maxParticles": 3,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": false,
      "spawnType": "circle",
      "spawnCircle": {
        "x": 100,
        "y": 100,
        "r": 0
      }
    },
    "parent": 'particles',
    "name": 'Flitter '
  };
  _BLUEPRINTS.PARTICLES.particles_mininova = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 1
      },
      "scale": {
        "start": 0.1,
        "end": 0.01,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#e4f9ff",
        "end": "#3fcbff"
      },
      "speed": {
        "start": 10,
        "end": 50,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 50
      },
      "lifetime": {
        "min": 0.2,
        "max": 5
      },
      "blendMode": "normal",
      "frequency": 0.001,
      "emitterLifetime": -1,
      "maxParticles": 500,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": false,
      "spawnType": "circle",
      "spawnCircle": {
        "x": 0,
        "y": 0,
        "r": 0
      }
    },
    "parent": 'particles',
    "name": 'Mini nova'
  };
  _BLUEPRINTS.PARTICLES.particles_flies = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.001,
        "end": 0.25,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#000000",
        "end": "#000000"
      },
      "speed": {
        "start": 10,
        "end": 10,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 50
      },
      "lifetime": {
        "min": 15,
        "max": 15
      },
      "blendMode": "normal",
      "frequency": 5,
      "emitterLifetime": 15,
      "maxParticles": 3,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": false,
      "spawnType": "circle",
      "spawnCircle": {
        "x": 100,
        "y": 100,
        "r": 0
      }
    },
    "parent": 'particles',
    "name": 'Flies'
  };
  _BLUEPRINTS.PARTICLES.particles_dirtyflies = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 0.34,
        "end": 0
      },
      "scale": {
        "start": 0.09,
        "end": 0.1,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#000000",
        "end": "#000000"
      },
      "speed": {
        "start": 10,
        "end": 10,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 2,
        "max": 1.8
      },
      "blendMode": "normal",
      "frequency": 0.01,
      "emitterLifetime": -1,
      "maxParticles": 25,
      "pos": {
        "x": 0.5,
        "y": 0.5
      },
      "addAtBack": true,
      "spawnType": "circle",
      "spawnCircle": {
        "x": 0,
        "y": 0,
        "r": 150
      }
    },
    "parent": 'particles',
    "name": 'Dirty Flies'
  };
  _BLUEPRINTS.PARTICLES.particles_poison_qk = {
    "sprites": 'tex_skulls_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.001,
        "end": 1,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#1eff00",
        "end": "#000000"
      },
      "speed": {
        "start": 10,
        "end": 50,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 0
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 0.5,
        "max": 2
      },
      "blendMode": "normal",
      "frequency": 0.01,
      "emitterLifetime": 1,
      "maxParticles": 5,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": false,
      "spawnType": "circle",
      "spawnCircle": {
        "x": 0,
        "y": 50,
        "r": 50
      }
    },
    "parent": 'particles',
    "name": 'Quick Poison'
  };
  _BLUEPRINTS.PARTICLES.particles_boomstick_smoke = {
    "sprites": 'tex_ktoon_smoke',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.25,
        "end": 0.25,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#ffffff",
        "end": "#d1d1d1"
      },
      "speed": {
        "start": 500,
        "end": 0,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 360
      },
      "lifetime": {
        "min": 0.5,
        "max": 0.25
      },
      "blendMode": "normal",
      "frequency": 0.001,
      "emitterLifetime": 0.25,
      "maxParticles": 15,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": 'Boomstick Smoke'
  };
  _BLUEPRINTS.PARTICLES.particles_small_smoke = {
    "sprites": 'tex_ktoon_smoke',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.25,
        "end": 0.25,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#ffffff",
        "end": "#d1d1d1"
      },
      "speed": {
        "start": 50,
        "end": 50,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 360
      },
      "lifetime": {
        "min": 0.5,
        "max": 0.25
      },
      "blendMode": "normal",
      "frequency": 0.001,
      "emitterLifetime": 0.25,
      "maxParticles": 15,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": 'Small Smoke'
  };
  _BLUEPRINTS.PARTICLES.particles_no_particles = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.02,
        "end": 0.1,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#ffe0e0",
        "end": "#fc0000"
      },
      "speed": {
        "start": 200,
        "end": 200,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 0
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 0.1,
        "max": 0.1
      },
      "blendMode": "normal",
      "frequency": 0.001,
      "emitterLifetime": 0.01,
      "maxParticles": 1,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": false,
      "spawnType": "burst",
      "particlesPerWave": 8,
      "particleSpacing": 45,
      "angleStart": 0
    },
    "parent": 'particles',
    "name": 'No Particles'
  };
  _BLUEPRINTS.PARTICLES.particles_flume = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 0.81,
        "end": 0
      },
      "scale": {
        "start": 0.001,
        "end": 2,
        "minimumScaleMultiplier": 0.05
      },
      "color": {
        "start": "#e0e0e0",
        "end": "#dedede"
      },
      "speed": {
        "start": 1,
        "end": 10,
        "minimumSpeedMultiplier": 4
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 10,
      "startRotation": {
        "min": -150,
        "max": -120
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": -10,
        "max": -50
      },
      "lifetime": {
        "min": 5,
        "max": 15
      },
      "blendMode": "normal",
      "frequency": 0.25,
      "emitterLifetime": -1,
      "maxParticles": 25,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": 'Flume Smoke'
  };
  _BLUEPRINTS.PARTICLES.particles_pretty = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 0,
        "end": 1
      },
      "scale": {
        "start": 1,
        "end": 0.001,
        "minimumScaleMultiplier": 0.05
      },
      "color": {
        "start": "#e0e0e0",
        "end": "#dedede"
      },
      "speed": {
        "start": 1,
        "end": 10,
        "minimumSpeedMultiplier": 4
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 10,
      "startRotation": {
        "min": -150,
        "max": -120
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": -10,
        "max": -50
      },
      "lifetime": {
        "min": 5,
        "max": 15
      },
      "blendMode": "normal",
      "frequency": 0.25,
      "emitterLifetime": -1,
      "maxParticles": 25,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": 'Pretty lights'
  };
  _BLUEPRINTS.PARTICLES.particles_weird = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 0,
        "end": 1
      },
      "scale": {
        "start": 10,
        "end": 0.001,
        "minimumScaleMultiplier": 0.05
      },
      "color": {
        "start": "#ff0000",
        "end": "#000000"
      },
      "speed": {
        "start": 0,
        "end": 0,
        "minimumSpeedMultiplier": 4
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 10,
      "startRotation": {
        "min": 0,
        "max": 0
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": -10,
        "max": -50
      },
      "lifetime": {
        "min": 5,
        "max": 15
      },
      "blendMode": "normal",
      "frequency": 0.25,
      "emitterLifetime": -1,
      "maxParticles": 25,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": 'Weird Waves'
  };
  _BLUEPRINTS.PARTICLES.particles_embers = {
    "sprites": 'tex_particle_1',
    "data": {
      "alpha": {
        "start": 0,
        "end": 1
      },
      "scale": {
        "start": 0.25,
        "end": 0.001,
        "minimumScaleMultiplier": 3
      },
      "color": {
        "start": "#ff800a",
        "end": "#ede13b"
      },
      "speed": {
        "start": 1,
        "end": 10,
        "minimumSpeedMultiplier": 10
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 100,
      "startRotation": {
        "min": -150,
        "max": -90
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": -10,
        "max": -50
      },
      "lifetime": {
        "min": 0.2,
        "max": 1
      },
      "blendMode": "normal",
      "frequency": 0.25,
      "emitterLifetime": -1,
      "maxParticles": 5,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": 'Fire Embers'
  };
  _BLUEPRINTS.PARTICLES.particles_circle_300 = {
    "sprites": 'sprite_smoke_ring_3_1',
    "data": {
      "alpha": {
        "start": 0.8,
        "end": 0.34
      },
      "scale": {
        "start": 1.5,
        "end": 1.4,
        "minimumScaleMultiplier": 0.95
      },
      "color": {
        "start": "#ff0000",
        "end": "#ff0000"
      },
      "speed": {
        "start": 0,
        "end": 0,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 250,
        "max": 290
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 25,
        "max": 100
      },
      "lifetime": {
        "min": 1,
        "max": 5
      },
      "blendMode": "screen",
      "frequency": 0.15,
      "emitterLifetime": -1,
      "maxParticles": 9,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": '300x300'
  };
  _BLUEPRINTS.PARTICLES.particles_static = {
    "sprites": 'sprite_smoke_ring_3_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 1
      },
      "scale": {
        "start": 1,
        "end": 1,
        "minimumScaleMultiplier": 0.95
      },
      "color": {
        "start": "#5e7eff",
        "end": "#0d00ff"
      },
      "speed": {
        "start": 0,
        "end": 0,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 0
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 1,
        "max": 100
      },
      "blendMode": "normal",
      "frequency": 0.25,
      "emitterLifetime": -1,
      "maxParticles": 1,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": 'Static'
  };
  _BLUEPRINTS.PARTICLES.particles_ring_flies = {
    "sprites": 'sprite_smoke_ring_3_1',
    "data": {
      "alpha": {
        "start": 1,
        "end": 0
      },
      "scale": {
        "start": 0.1,
        "end": 0.01,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#e4f9ff",
        "end": "#3fcbff"
      },
      "speed": {
        "start": 200,
        "end": 50,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 0,
        "max": 360
      },
      "noRotation": false,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 0.2,
        "max": 0.8
      },
      "blendMode": "normal",
      "frequency": 0.001,
      "emitterLifetime": -1,
      "maxParticles": 100,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": false,
      "spawnType": "ring",
      "spawnCircle": {
        "x": 0,
        "y": 0,
        "r": 100,
        "minR": 0
      }
    },
    "parent": 'particles',
    "name": 'Ring Flies'
  };
  _BLUEPRINTS.PARTICLES.particles_sprinkle_up = {
    "sprites": 'sprite_smoke_ring_3_1',
    "data": {
      "alpha": {
        "start": 0,
        "end": 1
      },
      "scale": {
        "start": 1,
        "end": 2,
        "minimumScaleMultiplier": 1
      },
      "color": {
        "start": "#eaff00",
        "end": "#ffff00"
      },
      "speed": {
        "start": 300,
        "end": 700,
        "minimumSpeedMultiplier": 1
      },
      "acceleration": {
        "x": 0,
        "y": 0
      },
      "maxSpeed": 0,
      "startRotation": {
        "min": 280,
        "max": 300
      },
      "noRotation": true,
      "rotationSpeed": {
        "min": 0,
        "max": 0
      },
      "lifetime": {
        "min": 3,
        "max": 3
      },
      "blendMode": "normal",
      "frequency": 0.2,
      "emitterLifetime": -1,
      "maxParticles": 5,
      "pos": {
        "x": 0,
        "y": 0
      },
      "addAtBack": true,
      "spawnType": "point"
    },
    "parent": 'particles',
    "name": 'Sprinkle Up'
  };
})();
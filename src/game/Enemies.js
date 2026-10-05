// Enemy content lives here so encounters can share MainScene.
const enemies = {
  joblin: {
    id: 'joblin',
    name: 'JOBLIN',
    maxHP: 100,
    baseDamage: 5,
    damageIncrease: 2,
    scale: 3,
    hitDuration: 1000,
    victoryText: 'YOU\u2019RE HIRED!',
    textures: {
      idle: 'JoblinIdle',
      attack: 'JoblinDealDMG',
      hit: 'JoblinTakeDMG',
      death: 'JoblinDeath'
    },
    assets: [
      { key: 'JoblinIdle', path: '/assets/mobs/Joblin/JoblinIdle.png', frameWidth: 64, frameHeight: 64 },
      { key: 'JoblinDealDMG', path: '/assets/mobs/Joblin/JoblinDealDMG.png', frameWidth: 64, frameHeight: 64 },
      { key: 'JoblinTakeDMG', path: '/assets/mobs/Joblin/JoblinTakeDMG.png' },
      { key: 'JoblinDeath', path: '/assets/mobs/Joblin/JoblinDeath.png', frameWidth: 64, frameHeight: 64 }
    ],
    animations: {
      idle: { key: 'joblin-idle', start: 0, end: 1, frameRate: 2, repeat: -1 },
      attack: { key: 'joblin-attack', start: 0, end: 14, frameRate: 10, repeat: 0 },
      death: { key: 'joblin-death', start: 0, end: 23, frameRate: 10, repeat: 0 }
    },
    quotes: [
        'Kan du forklare hullet i dit CV fra 1998 til 2012?',
        'Er du god til at tænke ud af boksen?',
        'Vi leder efter en rigtig "Team Player"',
        'SYNERGY',
        'Er du god under pres? Vi har nogle skarpe deadlines.',
        'Lad os "Circle back" til dette senere.'
      ]
  }
};

export default enemies;

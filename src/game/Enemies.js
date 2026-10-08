// Enemy content lives here so encounters can share MainScene.
const enemies = {
  joblin: {
    id: 'joblin',
    name: 'JOBLIN',
    maxHP: 100,
    baseDamage: 5,
    damageIncrease: 2,
    abilities: [
      {
        id: 'unexpectedFollowUp',
        type: 'doubleAttack',
        hpThreshold: 0.5,
        hitDelay: 1200,
        dialogueEvent: 'unexpectedFollowUp'
      }
    ],
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
    dialogue: {
      intro: ['So... tell me a little about yourself.'],
      badMove: ['Interesting strategy.', 'Are you nervous?'],
      normalMove: ['Okay.', 'Noted.', "We will circle back to that."],
      goodMove: ['You came prepared.', 'That looks good on your CV.'],
      greatMove: ['Please stop exceeding expectations.'],
      combo: ['Multitasking. Management will love you.'],
      playerLowMorale: ['Are you good under pressure?'],
      enemyLowHP: ['One final question. Why should we hire you?'],
      unexpectedFollowUp: ['One more thing. This role combines three full-time positions.'],
      enemyAction: [
        'Where do you see yourself in 45 years?',
        'What is your greatest weakness?',
        'We need ten years of entry-level experience.',
        'Are you a Team Player?',
        'SYNERGY.'
      ],
      defeat: ['You got the job. The salary is competitive.']
    }
  }
};

export default enemies;

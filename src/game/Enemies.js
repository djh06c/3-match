// Enemy content lives here so encounters can share MainScene.
const enemies = {
  joblin: {
    id: 'joblin',
    name: 'JOBLIN',
    maxHP: 100,
    baseDamage: 5,
    damageIncrease: 1,
    abilities: [
      {
        id: 'unexpectedFollowUp',
        type: 'doubleAttack',
        description: 'Joblin\'s attack damage increases each turn. The first time his HP falls below 50%, he asks two questions, attacking twice on his next turn. Both hits and all later attacks deal the damage reached on that turn. This happens once per fight.',
        stopDamageScaling: true,
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
  },
  printosaurus: {
    id: 'printosaurus',
    name: 'PRINTOSAURUS',
    maxHP: 100,
    baseDamage: 5,
    damageIncrease: 0,
    abilities: [
      {
        id: 'inkSmudge',
        type: 'ink',
        minTurns: 1,
        maxTurns: 3,
        tilePercentage: 0.4,
        description: 'Printosaurus fires ink at random intervals of 1 to 3 attacks, covering 40% of the tiles at random and hiding their icons and colors. The tiles still match normally. Ink clears after your next valid normal move; invalid swaps and free AI actions do not clear it.'
      }
    ],
    scale: 3,
    hitDuration: 1000,
    victoryText: 'PAPER JAM CLEARED!',
    textures: {
      idle: 'PrinterIdle', attack: 'PrinterAttack',
      hit: 'PrinterNormal', death: 'PrinterNormal', spawn: 'PrinterSpawn'
    },
    assets: [
      { key: 'PrinterSpawn', path: new URL('../../assets/mobs/Printosaurus/PrintosaurusSpawn.png', import.meta.url).href, frameWidth: 64, frameHeight: 64 },
      { key: 'PrinterIdle', path: new URL('../../assets/mobs/Printosaurus/PrintosaurusIdle.png', import.meta.url).href, frameWidth: 64, frameHeight: 64 },
      { key: 'PrinterAttack', path: new URL('../../assets/mobs/Printosaurus/PrintosaurusDealDMG.png', import.meta.url).href, frameWidth: 64, frameHeight: 64 },
      { key: 'PrinterNormal', path: new URL('../../assets/mobs/Printosaurus/PrintosaurusNormal.png', import.meta.url).href }
    ],
    animations: {
      idle: { key: 'printer-idle', start: 0, end: 1, frameRate: 2, repeat: -1 },
      spawn: { key: 'printer-spawn', start: 0, end: 18, frameRate: 10, repeat: 0 },
      attack: { key: 'printer-attack', start: 0, end: 17, frameRate: 10, repeat: 0 }
    },
    dialogue: {
      intro: ['PC LOAD LETTER. Good luck with that.'],
      badMove: ['Paper jam. Try again.'],
      normalMove: ['Processing...'],
      goodMove: ['Unexpected productivity detected.'],
      greatMove: ['Please contact IT.'],
      combo: ['Too many jobs in the print queue!'],
      playerLowMorale: ['Low toner. Lower morale.'],
      enemyLowHP: ['Have you tried turning me off and on?'],
      enemyAction: ['Out of paper.', 'Your document is stuck in the queue.'],
      defeat: ['Your document has finally printed.']
    }
  }
};

export default enemies;

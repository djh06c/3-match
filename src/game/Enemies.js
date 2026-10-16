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
  cardboardMimic: {
    id: 'cardboardMimic',
    name: 'CARDBOARD MIMIC',
    defeatClickMorale: 15,
    y: 135,
    maxHP: 100,
    baseDamage: 5,
    damageIncrease: 0,
    abilities: [
      {
        id: 'weakToOrganisation',
        type: 'matchDamageReduction',
        damagePerExtraTile: 1,
        description: 'The Cardboard Mimic is weak to being organised. Matching 3 tiles makes its next attack deal 5 Morale damage. Each extra tile matched reduces that attack by 1 damage. Below 0, it restores that much Morale instead, up to your maximum. Tiles matched in cascades count too. The reduction resets for each move.'
      }
    ],
    scale: 3,
    hitDuration: 1000,
    victoryText: 'DELIVERY HANDLED!',
    textures: {
      idle: 'MimicIdle', attack: 'MimicAttack',
      hit: 'MimicIdle', death: 'MimicDeath', spawn: 'MimicOpening'
    },
    assets: [
      { key: 'MimicIdle', path: new URL('../../assets/mobs/CardboardMimic/cardboard_mimic_IDLE.png', import.meta.url).href, frameWidth: 64, frameHeight: 64 },
      { key: 'MimicOpening', path: new URL('../../assets/mobs/CardboardMimic/Cardboard Mimic - Opening Animation.png', import.meta.url).href, frameWidth: 64, frameHeight: 64 },
      { key: 'MimicAttack', path: new URL('../../assets/mobs/CardboardMimic/Cardboard Mimic - Barrage attack.png', import.meta.url).href, frameWidth: 64, frameHeight: 64 },
      { key: 'MimicDeath', path: new URL('../../assets/mobs/CardboardMimic/MimicDeath.png', import.meta.url).href, frameWidth: 64, frameHeight: 64 }
    ],
    animations: {
      idle: { key: 'mimic-idle', start: 0, end: 0, frameRate: 1, repeat: -1 },
      spawn: { key: 'mimic-opening', start: 0, end: 6, frameRate: 8, repeat: 0 },
      attack: { key: 'mimic-attack', start: 0, end: 15, frameRate: 10, repeat: 0 },
      // Play only the ten drawn frames and leave the final pose visible.
      death: { key: 'mimic-death', start: 0, end: 9, frameRate: 10, repeat: 0 }
    },
    dialogue: {
      intro: ['Special delivery. Please sign with your remaining morale.'],
      badMove: ['Return to sender.'],
      normalMove: ['Contents may have shifted.'],
      goodMove: ['Handle with care!'],
      greatMove: ['That was not covered by shipping insurance.'],
      combo: ['One package at a time, please!'],
      playerLowMorale: ['You look ready to be boxed up.'],
      enemyLowHP: ['Some assembly required.'],
      enemyAction: ['Your delivery window is now.', 'Unexpected item in the office area.'],
      defeat: ['Package successfully delivered.']
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

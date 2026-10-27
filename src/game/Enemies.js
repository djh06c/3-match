// =====================================
// MOBS OPSÆTNING
// =====================================
// Mobs indhold samles her, og bruges i samme kampscene
const enemies = {
  // =====================================
  // JOBLIN
  // =====================================
  joblin: {
    id: 'joblin',
    name: 'JOBLIN',
    maxHP: 100,
    baseDamage: 4,
    damageIncrease: 1,

  sounds: {
    attack: '/assets/audio/joblinYap.mp3',

    death: [
        {
            path: '/assets/audio/JoblinPetrify.wav',
            delay: 500
        },
        {
            path: '/assets/audio/JoblinCrumble.wav',
            delay: 1200
        }
    ]
},

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
      playerLowMorale: ['Are you good under pressure?'],
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
  // =====================================
  // CARDBOARD MIMI
  // =====================================
  cardboardMimic: {
    id: 'cardboardMimic',
    name: 'CARDBOARD MIMIC',
    defeatClickMorale: 15,
    y: 135,
    maxHP: 100,
    baseDamage: 5,
    damageIncrease: 0,

    sounds: {

      spawn: '/assets/audio/cardboard.wav',

      attack: 
      {
        path: '/assets/audio/mimicAtt.wav',
        delay: 500
      },
      death: {
        path: '/assets/audio/mimicDeath.wav',
        delay: 500
      },
  },

    abilities: [
      {
        id: 'weakToOrganisation',
        type: 'matchDamageReduction',
        damagePerExtraTile: 1,
        description: 'The Cardboard Mimic is weak to being organised. Matching 3 tiles makes its next attack deal 5 Morale damage. Each extra tile matched reduces that attack by 1 damage. Below 0, it restores that much Morale instead, up to your maximum. Tiles matched in cascades count too.'
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
      { key: 'MimicIdle', path: import.meta.env.BASE_URL + 'assets/mobs/CardboardMimic/cardboard_mimic_IDLE.png', frameWidth: 64, frameHeight: 64 },
      { key: 'MimicOpening', path: import.meta.env.BASE_URL + 'assets/mobs/CardboardMimic/Cardboard Mimic - Opening Animation.png', frameWidth: 64, frameHeight: 64 },
      { key: 'MimicAttack', path: import.meta.env.BASE_URL + 'assets/mobs/CardboardMimic/Cardboard Mimic - Barrage attack.png', frameWidth: 64, frameHeight: 64 },
      { key: 'MimicDeath', path: import.meta.env.BASE_URL + 'assets/mobs/CardboardMimic/MimicDeath.png', frameWidth: 64, frameHeight: 64 }
    ],
    animations: {
      idle: { key: 'mimic-idle', start: 0, end: 0, frameRate: 1, repeat: -1 },
      spawn: { key: 'mimic-opening', start: 0, end: 6, frameRate: 8, repeat: 0 },
      attack: { key: 'mimic-attack', start: 0, end: 15, frameRate: 10, repeat: 0 },
      // låser sidste frame efter death
      death: { key: 'mimic-death', start: 0, end: 9, frameRate: 10, repeat: 0 }
    },
    dialogue: {
      intro: ['Special delivery. Please sign with your remaining morale.'],
      badMove: ['Return to sender.'],
      playerLowMorale: ['You look ready to be boxed up.'],
      enemyAction: ['Your delivery window is now.', 'Unexpected item in the office area.']
    }
  },
  // =====================================
  // DEADLINE DEMON
  // =====================================
  deadlineDemon: {
    id: 'deadlineDemon',
    name: 'DEADLINE DEMON',

    sounds: {
      attack: '/assets/audio/clock.wav',
      death: [
       '/assets/audio/doomBell.mp3',
       '/assets/audio/doomSand.wav'
      ]
    },
    abilities: [
      {
        id: 'risingExpectations',
        type: 'growingDamageRequirement',
        startingRequirement: 8,
        damagePerRound: 1,
        description: 'Deal at least 8 damage on your first round. The required damage increases by 1 each round: 8, 9, 10, and so on. Each time you deal less than required, his attack damage permanently increases by 1. Cascades, AI bonus damage and free AI moves count toward your round\'s damage.'
      }
    ],
    introReadTime: 3500,
    maxHP: 100,
    baseDamage: 5,
    damageIncrease: 0,
    scale: 3,
    hitDuration: 1000,
    victoryText: 'DEADLINE MET!',
    textures: {
      idle: 'DeadlineDemonIdle', attack: 'DeadlineDemonAttack',
      hit: 'DeadlineDemonHit', death: 'DeadlineDemonDeath'
    },
    assets: [
      { key: 'DeadlineDemonIdle', path: import.meta.env.BASE_URL + 'assets/mobs/DeadlineDemon/DeadlineDemonIdle.png', frameWidth: 64, frameHeight: 64 },
      { key: 'DeadlineDemonAttack', path: import.meta.env.BASE_URL + 'assets/mobs/DeadlineDemon/DeadlineDemonAttack.png', frameWidth: 64, frameHeight: 64 },
      { key: 'DeadlineDemonHit', path: import.meta.env.BASE_URL + 'assets/mobs/DeadlineDemon/DeadlineDemonTakeDMG.png', frameWidth: 64, frameHeight: 64 },
      { key: 'DeadlineDemonDeath', path: import.meta.env.BASE_URL + 'assets/mobs/DeadlineDemon/DeadlineDemonDeath.png', frameWidth: 64, frameHeight: 64 }
    ],
    animations: {
      idle: { key: 'deadline-demon-idle', start: 0, end: 3, frameRate: 4, repeat: -1 },
      attack: { key: 'deadline-demon-attack', start: 0, end: 13, frameRate: 10, repeat: 0 },
      hit: { key: 'deadline-demon-hit', start: 0, end: 4, frameRate: 10, repeat: 0 },
      death: { key: 'deadline-demon-death', start: 0, end: 22, frameRate: 10, repeat: 0 }
    },
    dialogue: {
      intro: ['This task belonged to the previous hire. It became yours when you signed the contract.'],
      enemyAction: [
        'I can make the deadline yesterday with the swipe of a pen.',
        'The previous hire said it was almost finished.',
        'You signed the contract. The deadline signed you.',
        'I have extended the scope. The deadline stays.',
        'Consider this your final reminder. Again.',
        'We needed this yesterday. I can make that official.'
      ]
    }
  },
  // =====================================
  // CEOVERLORD
  // =====================================
  ceoOverlord: {
    id: 'ceoOverlord',
    name: 'CEO-VERLORD',

     sounds: {

      spawn: '/assets/audio/ceOverSpawn.wav',

      attack: [
      { 
        path: '/assets/audio/papir1.wav',
        delay: 0
      },
      {
        path: '/assets/audio/burnpapir.wav',
        delay: 1250
      }
    ],
      death: [
        {
        path: '/assets/audio/CEOdeath.wav',
        delay: 0,

        path: '/assets/audio/ceOverSpawn.wav',
        delay: 0
        }
      ]
    },
    abilities: [{ type: 'banTiles', everyTurns: 3,
      description: 'At the start of the fight and every third round, CEO-VERLORD bans a random tile type for your next two rounds. Free AI moves do not shorten the ban. Grey tiles can still be moved and matched, but you lose Morale equal to 50% of the damage dealt by that tile type, including cascades.' }],
    hideAfterDeath: true,
    maxHP: 100,
    baseDamage: 5,
    damageIncrease: 0,
    scale: 3,
    hitDuration: 1000,
    victoryText: 'CEO DEFEATED!',
    textures: {
      idle: 'CEOIdle', spawn: 'CEOOpening',
      attack: 'CEOAttack', hit: 'CEOIdle', death: 'CEODeath'
    },
    assets: [
      { key: 'CEOIdle', path: import.meta.env.BASE_URL + 'assets/mobs/CEOverlord/Red Rift Portal - IDLE.png', frameWidth: 64, frameHeight: 64 },
      { key: 'CEOOpening', path: import.meta.env.BASE_URL + 'assets/mobs/CEOverlord/Red Rift Portal - Opening.png', frameWidth: 64, frameHeight: 64 },
      { key: 'CEOAttack', path: import.meta.env.BASE_URL + 'assets/mobs/CEOverlord/Red Rift Portal - attack.png', frameWidth: 64, frameHeight: 64 },
      { key: 'CEODeath', path: import.meta.env.BASE_URL + 'assets/mobs/CEOverlord/Red Rift Portal - Death.png', frameWidth: 64, frameHeight: 64 }
    ],
    animations: {
      idle: { key: 'ceo-idle', start: 0, end: 5, frameRate: 8, repeat: -1 },
      hit: { key: 'ceo-hit', start: 0, end: 5, frameRate: 8, repeat: -1 },
      spawn: { key: 'ceo-opening', start: 0, end: 20, frameRate: 10, repeat: 0 },
      attack: { key: 'ceo-attack', start: 0, end: 23, frameRate: 10, repeat: 0 },
      death: { key: 'ceo-death', start: 0, end: 15, frameRate: 10, repeat: 0, reverse: true }
    },
    dialogue: {
      ban: [
        'No more coffee breaks!',
        'No emailing your friends when at work!',
        'Don\'t use your laptop unproductively!',
        'Are you taking notes or doodling?',
        'Stop using your phone on company time!',
        'Time at work doesn\'t go faster by looking at the clock!'
      ],
      enemyAction: [
        'I won\'t burn the next one.',
        'I can make these papers permanent.',
        'Do you really want one of these on your desk?',
        'Consider this a draft of your future.',
        'The next copy goes straight to HR.'
      ]
    }
  },
  // =====================================
  // NECROMANAGER
  // =====================================
  necromanager: {
    id: 'necromanager',
    name: 'NECROMANAGER',

    sounds: {

      attack: [
        {
          path: '/assets/audio/papir1.wav',
          delay: 500
        }

      ],
      summon: '/assets/audio/ceOverSpawn.wav',

      death: {
        path: '/assets/audio/necromancerDeath.mp3',
        delay: 1000
      }
    },

    y: 125,
    maxHP: 100,
    baseDamage: 5,
    damageIncrease: 0,
    scale: 3,
    hitDuration: 1000,
    victoryText: 'MANAGEMENT HANDLED!',
    abilities: [
      {
        id: 'summonComplaint', type: 'copyRound', everyTurns: 3,
        dialogueEvent: 'summon', offsetX: -65, hitDelay: 1200,
        description: 'After every third round you play, the Necromanager gets tired of your S#%T! Whatever you do can and will be used against you'
      }
    ],
    textures: {
      idle: 'NecromanagerIdle', attack: 'NecromanagerThrow',
      hit: 'NecromanagerIdle', death: 'NecromanagerDeath',
      summon: 'NecromanagerSummon', summoned: 'NecromanagerSummoned'
    },
    assets: [
      { key: 'NecromanagerIdle', path: import.meta.env.BASE_URL + 'assets/mobs/Necromanager/Necromanager - Idle.png', frameWidth: 64, frameHeight: 64 },
      { key: 'NecromanagerThrow', path: import.meta.env.BASE_URL + 'assets/mobs/Necromanager/Necromanager - Throw.png', frameWidth: 64, frameHeight: 64 },
      { key: 'NecromanagerSummon', path: import.meta.env.BASE_URL + 'assets/mobs/Necromanager/Necromanager - Summon.png', frameWidth: 64, frameHeight: 64 },
      { key: 'NecromanagerSummoned', path: import.meta.env.BASE_URL + 'assets/mobs/Necromanager/Thesummoned.png', frameWidth: 64, frameHeight: 64 },
      { key: 'NecromanagerDeath', path: import.meta.env.BASE_URL + 'assets/mobs/Necromanager/Necromanager - Death.png', frameWidth: 64, frameHeight: 64 }
    ],
    animations: {
      idle: { key: 'necromanager-idle', start: 0, end: 6, frameRate: 8, repeat: -1 },
      attack: { key: 'necromanager-throw', start: 0, end: 9, frameRate: 10, repeat: 0 },
      summon: { key: 'necromanager-summon', start: 0, end: 12, frameRate: 10, repeat: 0 },
      summoned: { key: 'necromanager-summoned', start: 0, end: 19, frameRate: 10, repeat: 0, holdFrame: 11, extraFrames: 4 },
      death: { key: 'necromanager-death', start: 0, end: 7, frameRate: 10, repeat: 0 }
    },
    dialogue: {
      enemyAction: [
        'I am not paid enough to manage you.',
        'Manage THIS!',
        'Let us circle back to your performance.',
        'I need you to take ownership of this.',
        'We are like a family. A very understaffed family.'
      ],
      summon: ['That wasn\'t me, technically.']
    }
  },
  // =====================================
  // PRINTOSAURUS
  // =====================================
  printosaurus: {
    id: 'printosaurus',
    name: 'PRINTOSAURUS',
    y: 135,
    maxHP: 100,
    baseDamage: 5,
    damageIncrease: 0,

    sounds: {

      spawn: [
      {
        path: '/assets/audio/printoSpawn2.wav',
        delay: 0
      },
      {
        path: '/assets/audio/printoSpawn1.wav',
        delay: 1000
      }
      ],
    attack: 
    {
      path: '/assets/audio/printoFart.wav',
      delay: 1000
    },

    death: [
        {
            path: '/assets/audio/printoExpl.wav',
            delay: 1100
        },
        {
            path: '/assets/audio/printoShock.wav',
            delay: 500
        }
    ]
},

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
      idle: 'PrinterIdle', 
      attack: 'PrinterAttack',
      hit: 'PrinterTakeDMG', 
      death: 'PrinterDeath', 
      spawn: 'PrinterSpawn'
    },
    assets: [
      { key: 'PrinterSpawn', path: import.meta.env.BASE_URL + 'assets/mobs/Printosaurus/PrintosaurusSpawn.png', frameWidth: 64, frameHeight: 64 },
      { key: 'PrinterIdle', path: import.meta.env.BASE_URL + 'assets/mobs/Printosaurus/PrintosaurusIdle.png', frameWidth: 64, frameHeight: 64 },
      { key: 'PrinterAttack', path: import.meta.env.BASE_URL + 'assets/mobs/Printosaurus/PrintosaurusDealDMG.png', frameWidth: 64, frameHeight: 64 },
      { key: 'PrinterDeath', path: import.meta.env.BASE_URL + 'assets/mobs/Printosaurus/PrintosaurusDeath.png', frameWidth: 64, frameHeight: 64 },
      { key: 'PrinterTakeDMG', path: import.meta.env.BASE_URL + 'assets/mobs/Printosaurus/PrintosaurusTakeDMG.png', frameWidth: 64, frameHeight: 64},
    ], 
    animations: {
      idle: { key: 'printer-idle', start: 0, end: 1, frameRate: 2, repeat: -1 },
      spawn: { key: 'printer-spawn', start: 0, end: 18, frameRate: 10, repeat: 0 },
      attack: { key: 'printer-attack', start: 0, end: 17, frameRate: 10, repeat: 0 },
      hit: { key: 'printer-hit', start: 0, end: 5, frameRate: 10, repeat: 0},
      death: { key: 'printer-death', start: 0, end: 19, frameRate: 10, repeat: 0}
    },
    dialogue: {
      intro: ['PC LOAD LETTER. Good luck with that.'],
      badMove: ['Paper jam. Try again.'],
      playerLowMorale: ['Low toner. Lower morale.'],
      enemyAction: ['Out of paper.', 'Your document is stuck in the queue.'],
      defeat: ['Your document has finally printed.']
    }
  }
};

export default enemies;

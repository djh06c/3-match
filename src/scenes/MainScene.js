import Phaser from 'phaser';
import Match3Board from '../game/Match3Board.js';
import enemies from '../game/Enemies.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  // =====================================
  // MODTAGELSE AF KAMPENS DATA
  // =====================================
  init(data = {}) {
    this.encounterId = data.encounterId ?? 'joblin';
    this.encounterIndex = data.encounterIndex ?? 0;
    this.startingMorale = data.playerMorale ?? 100;
    this.startingMaxMorale = data.playerMaxMorale ?? 100;
    this.enemyConfig = enemies[this.encounterId];

    if (!this.enemyConfig) {
      throw new Error(`Unknown encounter: ${this.encounterId}`);
    }
  }

  preload() {
    this.load.image('inkStain',
      import.meta.env.BASE_URL + 'assets/mobs/Printosaurus/Inkstain.png');
    this.load.image('aiChip',
      import.meta.env.BASE_URL + 'assets/icons/Chip - AI.png');
    // =====================================
    // IKONER TIL MATCH-3
    // =====================================

    this.load.image(
      'coffee',
      '/assets/icons/Kaffe.png'
    );

    this.load.image(
      'email',
      '/assets/icons/Email.png'
    );

    this.load.image(
      'laptop',
      '/assets/icons/Laptop.png'
    );

    this.load.image(
      'notebook',
      '/assets/icons/Notesbog.png'
    );

    this.load.image(
      'phone',
      '/assets/icons/Telefon2.png'
    );

    this.load.image(
      'clock',
      '/assets/icons/Ur.png'
    );

    // =====================================
    // BAGGRUNDE
    // =====================================

    this.load.image(
      'officeBackground',
      '/assets/backgrounds/KontorBaggrund.png'
    );

    this.load.image(
      'match3Background',
      '/assets/backgrounds/Baggrund-match3-2.0.png'
    );

    // =====================================
    // BOBS GRAFIK
    // =====================================

    this.load.image(
      'Bob',
      '/assets/mobs/Bob/Bob.png'
    );

    this.load.spritesheet(
      'BobIdle',
      '/assets/mobs/Bob/BobIdle.png',
      {
        frameWidth: 64,
        frameHeight: 64
      }
    );

    this.load.spritesheet(
      'BobDealDMG',
      '/assets/mobs/Bob/BobDealDMG.png',
      {
        frameWidth: 64,
        frameHeight: 64
      }
    );

    this.load.spritesheet(
      'BobTakeDMG',
      '/assets/mobs/Bob/BobTakeDMG.png',
      {
        frameWidth: 64,
        frameHeight: 64
      }
    );

    this.load.spritesheet(
      'BobDeath',
      '/assets/mobs/Bob/BobDeath.png',
      {
        frameWidth: 64,
        frameHeight: 64
      }
    );

    // =====================================
    // FJENDENS GRAFIK
    // =====================================

    for (const asset of this.enemyConfig.assets) {
      if (asset.frameWidth) {
        this.load.spritesheet(asset.key, asset.path, {
          frameWidth: asset.frameWidth,
          frameHeight: asset.frameHeight
        });
      } else {
        this.load.image(asset.key, asset.path);
      }
    }
  }

  create() {
    const width = this.scale.width;

    // =====================================
    // KAMPENS TILSTAND
    // =====================================

    this.battleWon = false;
    this.battleLost = false;

    // Scene instances are reused when TRY AGAIN restarts combat.
    this.gameWonText = null;
    this.gameOverText = null;
    this.resultTransitionActive = false;

    this.playerMoveCount = 0;
    this.enemyAttackCount = 0;
    this.banRoundsRemaining = 0;
    this.lastMoveTotalMatched = 0;
    this.freeMoveTilesMatched = 0;
    this.deadlineAbility = (this.enemyConfig.abilities ?? []).find(ability =>
      ability.type === 'growingDamageRequirement'
    );
    this.deadlineMoveCount = 0;
    this.deadlineDamageBonus = 0;
    this.deadlineRoundDamage = 0;
    this.deadlineRequirement = this.deadlineAbility?.startingRequirement ?? 0;
    this.announcedDeadlineRequirement = this.deadlineRequirement;
    const inkAbility = (this.enemyConfig.abilities ?? []).find(ability => ability.type === 'ink');
    this.nextInkAttack = inkAbility
      ? Phaser.Math.Between(inkAbility.minTurns, inkAbility.maxTurns)
      : null;
    this.enemyTurnActive = false;

    this.usedEnemyAbilities = [];
    this.enemyActions = [];
    this.playerRoundActions = [];
    this.copyRoundAbility = (this.enemyConfig.abilities ?? []).find(ability => ability.type === 'copyRound');
    this.enemyTurnDamage = 0;
    this.enemyAbility = null;
    this.fixedEnemyDamage = null;

    this.enemyHitDuration = this.enemyConfig.hitDuration;

    this.enemyHitTimer = null;

    this.enemySpeechBubble = null;
    this.bobSpeechBubble = null;

    // =====================================
    // FJENDENS DIALOG
    // =====================================

    this.enemyDialogueTimer = null;
    this.bobDialogueTimer = null;
    this.enemyTypingTimer = null;
    this.bobTypingTimer = null;
    this.playerLowMoraleShown = false;

    // =====================================
    // BOBS REPLIKKER
    // =====================================

    this.bobQuotes = [
      'Wh... what?',
      'Right. Okay.',
      'Is this normal here?',
      'Nobody mentioned this.',
      'I need this job.',
      'Just get through today.',
      'Sure. I can handle this.',
      "That's probably fine.",
      'Do we have a procedure for this?',
      'I should have read the handbook.',
      'Please let this count as experience.',
      "I'm putting this on my timesheet.",
      'I could be working from home.'
    ];

    this.remainingBobQuotes = [];
    this.lastBobQuote = null;

    // =====================================
    // KAMPOMRÅDET ØVERST
    // =====================================

    this.topAreaHeight = 240;

    const officeBackground =
      this.add.image(
        width / 2,
        this.topAreaHeight / 2,
        'officeBackground'
      );

    officeBackground
      .setDisplaySize(
        width,
        this.topAreaHeight
      )
      .setDepth(0);

    // =====================================
    // BOBS ANIMATIONER
    // =====================================

    if (
      !this.anims.exists(
        'bob-idle'
      )
    ) {
      this.anims.create({
        key: 'bob-idle',

        frames:
          this.anims.generateFrameNumbers(
            'BobIdle'
          ),

        frameRate: 2,

        repeat: -1
      });
    }

    if (
      !this.anims.exists(
        'bob-attack'
      )
    ) {
      this.anims.create({
        key: 'bob-attack',

        frames:
          this.anims.generateFrameNumbers(
            'BobDealDMG',
            {
              start: 0,
              end: 13
            }
          ),

        frameRate: 10,

        repeat: 0
      });
    }

    if (
      !this.anims.exists(
        'bob-take-dmg'
      )
    ) {
      this.anims.create({
        key: 'bob-take-dmg',

        frames:
          this.anims.generateFrameNumbers(
            'BobTakeDMG',
            {
              start: 0,
              end: 10
            }
          ),

        frameRate: 10,

        repeat: 0
      });
    }

    if (
      !this.anims.exists(
        'bob-death'
      )
    ) {
      this.anims.create({
        key: 'bob-death',

        frames:
          this.anims.generateFrameNumbers(
            'BobDeath',
            {
              start: 0,
              end: 16
            }
          ),

        frameRate: 10,

        repeat: 0
      });
    }

    // =====================================
    // SPILLEREN BOB
    // =====================================

    this.player = this.add.sprite(
      width * 0.25,
      100,
      'BobIdle',
      0
    );

    this.player
      .setScale(3)
      .setDepth(5);

    this.playerBaseX =
      this.player.x;

    this.playerBaseY =
      this.player.y;

    this.player.play(
      'bob-idle'
    );

    // =====================================
    // FJENDENS ANIMATIONER
    // =====================================

    for (const action of Object.keys(this.enemyConfig.animations)) {
      const animation = this.enemyConfig.animations[action];

      if (!this.anims.exists(animation.key)) {
        const frames = this.anims.generateFrameNumbers(this.enemyConfig.textures[action], {
          start: animation.start,
          end: animation.end
        });
        if (animation.reverse) frames.reverse();
        if (animation.holdFrame !== undefined) {
          // Varigheden lægges oven i billedets normale visningstid.
          frames[animation.holdFrame - animation.start].duration = animation.extraFrames * 1000 / animation.frameRate;
        }
        this.anims.create({
          key: animation.key,
          frames,
          frameRate: animation.frameRate,
          repeat: animation.repeat
        });
      }
    }

    // =====================================
    // FJENDENS GRAFIK
    // =====================================

    this.enemy = this.add.sprite(
      width * 0.75,
      this.enemyConfig.y ?? 100,
      this.enemyConfig.textures.idle,
      0
    );

    this.enemy
      .setScale(this.enemyConfig.scale)
      .setDepth(5);

    this.enemyBaseX =
      this.enemy.x;

    this.enemyBaseY =
      this.enemy.y;

    this.enemy.play(
      this.enemyConfig.animations.idle.key
    );

    // =====================================
    // LIV OG MORALE
    // =====================================

    this.PlayerMaxHP = this.startingMaxMorale;
    this.PlayerHP = this.startingMorale;

    this.EnemyMaxHP = this.enemyConfig.maxHP;
    this.EnemyHP = this.EnemyMaxHP;

    // =====================================
    // SPILLERENS NAVN
    // =====================================

    this.playerNameText =
      this.add.text(
        width * 0.25,
        205,
        'BOB',
        {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'Arial',
          fontStyle: 'bold'
        }
      )
        .setOrigin(0.5)
        .setDepth(10);

    // =====================================
    // FJENDENS NAVN
    // =====================================

    this.enemyNameText =
      this.add.text(
        width * 0.75,
        205,
        this.enemyConfig.name,
        {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'Arial',
          fontStyle: 'bold'
        }
      )
        .setOrigin(0.5)
        .setDepth(10);

    // =====================================
    // INFORMATION OM FJENDENS EVNER
    // =====================================

    const abilityDescriptions = (this.enemyConfig.abilities ?? [])
      .map(ability => ability.description)
      .filter(description => description);

    if (abilityDescriptions.length > 0) {
      const infoX = this.enemyNameText.x + this.enemyNameText.width / 2 + 20;
      const infoY = this.enemyNameText.y;

      const infoIcon = this.add.circle(infoX, infoY, 10, 0x222222)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true })
        .setDepth(12);

      this.add.text(infoX, infoY, 'i', {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(13);

      const tooltip = this.add.text(width - 20, infoY - 20,
        abilityDescriptions.join('\n\n'), {
          fontSize: '14px',
          color: '#ffffff',
          backgroundColor: '#222222',
          fontFamily: 'Arial',
          padding: { x: 12, y: 10 },
          wordWrap: { width: 280 }
        }).setOrigin(1, 1).setDepth(50).setVisible(false);

      infoIcon.on('pointerover', () => {
        tooltip.setVisible(true);
      });

      infoIcon.on('pointerout', () => {
        tooltip.setVisible(false);
      });
    }

    // =====================================
    // SPILLERENS MORALEBJÆLKE
    // =====================================

    this.playerHpBarBackground =
      this.add.rectangle(
        width * 0.25,
        224,
        100,
        12,
        0x222222
      )
        .setOrigin(0.5)
        .setDepth(10);

    this.playerHpBar =
      this.add.rectangle(
        width * 0.25 - 50,
        224,
        100,
        12,
        0x00aa00
      )
        .setOrigin(0, 0.5)
        .setDepth(11);

    this.playerHpText =
      this.add.text(
        width * 0.25,
        224,
        `${this.PlayerHP} / ${this.PlayerMaxHP}`,
        {
          fontSize: '9px',
          color: '#ffffff',
          fontFamily: 'Arial',
          fontStyle: 'bold'
        }
      )
        .setOrigin(0.5)
        .setDepth(12);

    // =====================================
    // FJENDENS LIVSBJÆLKE
    // =====================================

    this.enemyHpBarBackground =
      this.add.rectangle(
        width * 0.75,
        224,
        100,
        12,
        0x222222
      )
        .setOrigin(0.5)
        .setDepth(10);

    this.enemyHpBar =
      this.add.rectangle(
        width * 0.75 - 50,
        224,
        100,
        12,
        0x00aa00
      )
        .setOrigin(0, 0.5)
        .setDepth(11);

    this.enemyHpText =
      this.add.text(
        width * 0.75,
        224,
        `${this.EnemyHP} / ${this.EnemyMaxHP}`,
        {
          fontSize: '9px',
          color: '#ffffff',
          fontFamily: 'Arial',
          fontStyle: 'bold'
        }
      )
        .setOrigin(0.5)
        .setDepth(12);

    // =====================================
    // ADSKILLELSE AF KAMP OG SPILLEBRÆT
    // =====================================

    this.add.rectangle(
      width / 2,
      this.topAreaHeight,
      width,
      4,
      0xffffff
    );

    // =====================================
    // SPILLEBRÆTTETS BAGGRUND
    // =====================================

    const match3Background =
      this.add.image(
        width / 2,
        this.topAreaHeight + 230,
        'match3Background'
      );

    match3Background
      .setScale(4)
      .setDepth(0);

    // =====================================
    // VISNING AF SKADE
    // =====================================

    this.turnDamage = 0;
    this.damageBreakdown = [];
    this.damageHistory = [];

    const damageCenterX = 704;

    this.damageTitle =
      this.add.text(
        damageCenterX,
        this.topAreaHeight + 54,
        'DAMAGE',
        {
          fontSize: '16px',
          color: '#000000',
          fontFamily:
            'Arial, sans-serif',
          fontStyle: 'bold'
        }
      )
        .setOrigin(0.5)
        .setDepth(10);

    this.damageCalculationText =
      this.add.text(
        damageCenterX,
        this.topAreaHeight + 80,
        '',
        {
          fontSize: '11px',
          color: '#000000',
          fontFamily:
            'Arial, sans-serif',
          fontStyle: 'bold',
          align: 'center',
          lineSpacing: 11,

          wordWrap: {
            width: 150
          }
        }
      )
        .setOrigin(0.5, 0)
        .setDepth(10);

    this.damageTotalText =
      this.add.text(
        damageCenterX,
        this.topAreaHeight + 309,
        'TOTAL: 0',
        {
          fontSize: '15px',
          color: '#000000',
          fontFamily:
            'Arial, sans-serif',
          fontStyle: 'bold',
          align: 'center'
        }
      )
        .setOrigin(0.5)
        .setDepth(10);

    // =====================================
    // STATUSBESKED
    // =====================================

    this.statusText =
      this.add.text(
        width / 2,
        this.topAreaHeight + 10,
        'Board klar.',
        {
          fontSize: '16px',
          color: '#ffff88'
        }
      )
        .setOrigin(0.5)
        .setDepth(10);

    // =====================================
    // SPILLEBRÆTTET
    // =====================================

    const tileSize = 52;

    const boardWidth =
      8 * tileSize;

    const boardX =
      (width - boardWidth) / 2;

    const boardY =
      this.topAreaHeight + 22;

    this.board =
      new Match3Board(
        this,
        {
          x: boardX,
          y: boardY,

          rows: 8,
          cols: 8,

          colorCount: 6,

          tileSize,

          iconSize: 32,

          tileTextures: [
            'coffee',
            'email',
            'laptop',
            'notebook',
            'phone',
            'clock'
          ],

          tileColors: [
            0x8b5cf6,
            0x06b6d4,
            0x22c55e,
            0xf59e0b,
            0xef4444,
            0xe5e7eb
          ],

          onStateChange:
            state => {
              this.handleBoardState(
                state
              );
            },

          onMoveComplete:
            result => {
              this.handleMoveComplete(
                result
              );
            }
        }
      );

    this.board.container
      .setDepth(5);

    this.createAIControls();
    if (import.meta.env.DEV) this.createDevSkipButton();
    this.updatePlayerHealthBar();
    this.startEncounter();
  }

  // =====================================
  // MIDLERTIDIG KNAP TIL AT SPRINGE KAMPE OVER
  // =====================================
  createDevSkipButton() {
    const button = this.add.text(this.scale.width - 12, 12, 'DEV: SKIP FIGHT', {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffff88',
      backgroundColor: '#222222', padding: { x: 10, y: 8 }
    }).setOrigin(1, 0).setDepth(60).setInteractive({ useHandCursor: true });

    button.on('pointerdown', () => {
      // Vent på spillerens tur, så igangværende animationer ikke afbrydes.
      if (this.board.state !== 'IDLE' || this.battleWon || this.battleLost || this.enemyTurnActive) return;
      button.disableInteractive().setVisible(false);
      this.EnemyHP = 0;
      this.updateEnemyHealthBar();
      this.winBattle();
    });
  }

  // =====================================
  // KAMPSTART OG FJENDENS INTRODUKTION
  // =====================================
  async startEncounter() {
    const readyState = this.enemyConfig.introReadTime ? 'ENCOUNTER_INTRO' : 'IDLE';
    const spawn = this.enemyConfig.animations.spawn;
    if (spawn) {
      const spawnFinished = new Promise(resolve => {
        this.enemy.once(`animationcomplete-${spawn.key}`, () => {
          this.enemy.play(this.enemyConfig.animations.idle.key);
          resolve();
        });
        this.enemy.play(spawn.key);
      });

      // Tile drop must not unlock input while the enemy is still spawning.
      await Promise.all([spawnFinished, this.board.playInitialDrop('ENCOUNTER_INTRO')]);
      if (this.battleWon || this.battleLost || !this.scene.isActive()) return;
      this.board.setState(readyState);
    } else {
      await this.board.playInitialDrop(readyState);
    }
    this.showEnemyDialogue('intro');
    if (this.aiPowerHint) {
      this.aiPowerHint.setVisible(true);
      this.aiButton.setTint(0xffff00);
    }
    if (this.enemyConfig.introReadTime) {
      this.time.delayedCall(this.enemyConfig.introReadTime, () => {
        if (!this.battleWon && !this.battleLost) {
          this.board.setState('IDLE');
        }
      });
    }
  }

  // =====================================
  // AI-KNAP OG MISTANKEBJÆLKE
  // =====================================
  createAIControls() {
    this.aiBoosters = this.registry.get('aiBoosters') ?? {
      unlocked: false, selectedPower: null, suspicion: 0
    };
    this.aiBoosters.unlockedPowers = this.aiBoosters.unlockedPowers
      ?? (this.aiBoosters.selectedPower ? [this.aiBoosters.selectedPower] : []);
    // Keep a separate copy so AI use and result recovery cannot change the retry point.
    this.startingAIBoosters = { ...this.aiBoosters };
    this.registry.set('aiBoosters', this.aiBoosters);
    this.aiMenu = null;
    this.aiHint = null;
    this.aiPowerUsesRemaining = this.aiBoosters.selectedPower === 'moraleBoost' ? 3 : 2;
    this.aiUsesRemaining = { bestMove: 2, moraleBoost: 3, tileSwap: 1 };
    this.freeAIMove = false;
    this.supervisorActive = false;
    this.suspicionRecovered = false;

    const button = this.add.image(75, 620, 'aiChip')
      .setDisplaySize(90, 90).setDepth(20);
    this.aiButton = button;
    this.aiPowerHint = null;
    if (this.encounterId === 'printosaurus' && this.aiBoosters.unlocked) {
      this.aiPowerHint = this.add.text(75, 565, 'click here to use your powers', {
        fontSize: '14px', color: '#ffff00', fontFamily: 'Arial',
        align: 'center', wordWrap: { width: 140 }
      }).setOrigin(0.5).setDepth(22).setVisible(false);
    }
    if (this.aiBoosters.unlocked) {
      button.setInteractive({ useHandCursor: true });
      button.on('pointerdown', () => this.openAIMenu());
    } else {
      button.setAlpha(0.4);
    }

    this.add.text(75, 295, 'SUPERVISOR', {
      fontSize: '12px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(20);
    this.add.rectangle(25, 318, 100, 12, 0x333333).setOrigin(0, 0.5).setDepth(20);
    this.suspicionBar = this.add.rectangle(25, 318, 100, 12, 0xffaa33)
      .setOrigin(0, 0.5).setDepth(21);
    this.suspicionBar.displayWidth = this.aiBoosters.suspicion;
    this.suspicionText = this.add.text(75, 340,
      `Suspicion: ${this.aiBoosters.suspicion}/100`, {
        fontSize: '11px', color: '#ffffff', fontFamily: 'Arial'
      }).setOrigin(0.5).setDepth(20);
    if (this.aiBoosters.suspicion >= 100) {
      this.startSupervisorIntervention();
    }
  }

  // =====================================
  // FJERNELSE AF INTRODUKTION TIL AI-KNAPPEN
  // =====================================
  hideAIPowerHint() {
    if (!this.aiPowerHint) return;
    this.aiPowerHint.destroy();
    this.aiPowerHint = null;
    this.aiButton.clearTint();
  }

  // =====================================
  // MENU MED AI-EVNER
  // =====================================
  openAIMenu() {
    if (this.board.state !== 'IDLE' || this.battleWon || this.battleLost || this.supervisorActive) {
      return;
    }

    this.board.resetPointerState();
    this.board.setState('AI_MENU');
    this.aiMenu = this.add.container(0, 0).setDepth(60);
    const shade = this.add.rectangle(400, 350, 800, 700, 0x000000, 0.65).setInteractive();
    const panel = this.add.rectangle(400, 365, 600, 450, 0x222222).setStrokeStyle(2, 0xffffff);
    const title = this.add.text(400, 175, 'AI BOOSTERS', {
      fontSize: '24px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5);
    this.aiMenu.add([shade, panel, title]);
    for (let index = 0; index < this.aiBoosters.unlockedPowers.length; index++) {
      const power = this.aiBoosters.unlockedPowers[index];
      const y = 260 + index * 110;
      const healing = power === 'moraleBoost';
      const swapping = power === 'tileSwap';
      const powerName = swapping ? 'TILE SWAP' : healing ? 'MORALE BOOST' : 'BEST MOVE';
      const effect = swapping
        ? 'Drag any tile onto another to swap them.\nUses your turn. No extra move.'
        : healing
        ? 'Recover 10 Morale. Keep your turn.'
        : 'Finds and automatically plays the best available match.\nAdds +3 damage and keeps your turn.';
      const suspicionCost = swapping ? 20 : healing ? Math.min(10, this.PlayerMaxHP - this.PlayerHP) : 15;
      const useButton = this.add.rectangle(400, y, 560, 95, 0x555555)
        .setInteractive({ useHandCursor: true });
      if (this.aiUsesRemaining[power] <= 0) {
        useButton.disableInteractive().setFillStyle(0x333333);
      }
      const label = this.add.text(400, y,
        `${powerName} - ${this.aiUsesRemaining[power]} uses left this fight\n${effect}\n+${suspicionCost} Suspicion per use.`, {
          fontSize: '15px', color: '#ffffff', fontFamily: 'Arial', align: 'center'
        }).setOrigin(0.5);
      this.aiMenu.add([useButton, label]);
      useButton.on('pointerdown', () => {
        this.aiBoosters.selectedPower = power;
        this.aiPowerUsesRemaining = this.aiUsesRemaining[power];
        if (swapping) this.useTileSwap();
        else if (healing) this.useMoraleBoost();
        else this.useBestMove();
      });
    }
    const close = this.add.text(400, 565, 'CLOSE', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.aiMenu.add(close);
    close.on('pointerdown', () => this.closeAIMenu());
  }

  closeAIMenu() {
    this.aiMenu?.destroy(true);
    this.aiMenu = null;
    if (this.board.state === 'AI_MENU') {
      this.board.setState('IDLE');
    }
  }

  // =====================================
  // AI-EVNE: FRIT BRIKBYT
  // =====================================
  useTileSwap() {
    if (this.board.state !== 'AI_MENU' || this.aiUsesRemaining.tileSwap <= 0
      || this.aiBoosters.selectedPower !== 'tileSwap'
      || this.supervisorActive || this.battleWon || this.battleLost) return;
    this.closeAIMenu();
    this.statusText.setText('Drag a tile onto another tile. This uses your turn.');
    const cancel = this.add.text(75, 675, 'CANCEL SWAP', {
      fontFamily: 'Arial', fontSize: '12px', color: '#ffff88'
    }).setOrigin(0.5).setDepth(40).setInteractive({ useHandCursor: true });
    cancel.once('pointerdown', () => {
      this.board.cancelManualSwap();
      cancel.destroy();
      this.statusText.setText('Your turn.');
    });
    this.board.beginManualSwap(() => {
      cancel.destroy();
      this.finishAIPowerUse(20);
    });
  }

  // =====================================
  // AI-EVNE: BEDSTE TRÆK
  // =====================================
  useBestMove() {
    if (this.board.state !== 'AI_MENU' || this.aiPowerUsesRemaining <= 0 || this.supervisorActive ||
        this.aiBoosters.selectedPower !== 'bestMove' ||
        this.battleWon || this.battleLost) {
      return;
    }

    const grid = this.board.grid;
    let bestMove = null;
    let bestScore = 0;

    // Medregn kaskader fra eksisterende brikker uden at gætte nye brikker.
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        for (const [otherRow, otherCol] of [[row, col + 1], [row + 1, col]]) {
          if (!grid.inBounds(otherRow, otherCol)) continue;
          const score = grid.scoreSwapWithCascades(row, col, otherRow, otherCol);
          if (score > bestScore) {
            bestScore = score;
            bestMove = [{ row, col }, { row: otherRow, col: otherCol }];
          }
        }
      }
    }

    if (!bestMove) {
      this.statusText.setText('No valid move found.');
      return;
    }

    this.aiHint?.destroy(true);
    this.aiHint = this.add.container(0, 0).setDepth(15);
    for (const cell of bestMove) {
      const position = this.board.getCellPosition(cell.row, cell.col);
      this.aiHint.add(this.add.rectangle(position.x, position.y, 48, 48)
        .setFillStyle(0xffffff, 0).setStrokeStyle(4, 0xffff00));
    }

    this.finishAIPowerUse(15);
    this.board.setState('AI_PREVIEW');
    this.statusText.setText('AI is playing a free move!');
    this.time.delayedCall(700, () => {
      if (this.battleWon || this.battleLost) return;
      this.freeAIMove = true;
      this.board.setState('IDLE');
      this.board.performSwap(bestMove[0].row, bestMove[0].col,
        bestMove[1].row, bestMove[1].col);
    });
  }

  // =====================================
  // AI-EVNE: GENDANNELSE AF MORALE
  // =====================================
  useMoraleBoost() {
    if (this.board.state !== 'AI_MENU' || this.aiPowerUsesRemaining <= 0 || this.supervisorActive ||
        this.aiBoosters.selectedPower !== 'moraleBoost' || this.battleWon || this.battleLost) {
      return;
    }
    if (this.PlayerHP >= this.PlayerMaxHP) {
      this.statusText.setText('Morale is already full.');
      return;
    }

    const healedMorale = Math.min(10, this.PlayerMaxHP - this.PlayerHP);
    this.PlayerHP += healedMorale;
    this.updatePlayerHealthBar();
    if (this.copyRoundAbility) {
      this.playerRoundActions.push({ type: 'heal', amount: healedMorale });
    }
    this.finishAIPowerUse(healedMorale);
    this.statusText.setText('Recovered up to 10 Morale. Your turn continues!');
  }

  // =====================================
  // FORBRUG AF AI OG STIGNING I MISTANKE
  // =====================================
  finishAIPowerUse(suspicionCost) {
    this.aiPowerUsesRemaining--;
    this.aiUsesRemaining[this.aiBoosters.selectedPower] = this.aiPowerUsesRemaining;
    this.aiBoosters.suspicion = Math.min(100, this.aiBoosters.suspicion + suspicionCost);
    this.registry.set('aiBoosters', this.aiBoosters);
    this.suspicionBar.displayWidth = this.aiBoosters.suspicion;
    this.suspicionText.setText(`Suspicion: ${this.aiBoosters.suspicion}/100`);
    this.closeAIMenu();
    if (this.aiBoosters.suspicion >= 100) {
      this.startSupervisorIntervention();
    }
  }

  // =====================================
  // SUPERVISORENS INDGRIBEN
  // =====================================
  startSupervisorIntervention() {
    if (this.supervisorActive || this.battleWon || this.battleLost) return;

    this.supervisorActive = true;
    this.hideAIPowerHint();
    this.EnemyHP = this.EnemyMaxHP;
    this.updateEnemyHealthBar();
    this.aiButton.disableInteractive();
    this.aiButton.setAlpha(0.4);

    const message = this.add.text(this.scale.width / 2, 80,
      'SUPERVISOR\nWe have noticed a huge incline in your effectiveness and we would like to see you do it live.', {
        fontSize: '16px', color: '#ffffff', backgroundColor: '#222222',
        fontFamily: 'Arial', align: 'center', padding: { x: 12, y: 10 },
        wordWrap: { width: 650 }
      }).setOrigin(0.5).setDepth(55);
    this.time.delayedCall(8000, () => message.destroy());
  }

  // =====================================
  // FALD I MISTANKE EFTER KAMPEN
  // =====================================
  recoverSuspicionAfterFight() {
    // Both result paths can show a result more than once; recovery happens only once.
    if (this.suspicionRecovered) return;
    this.suspicionRecovered = true;
    this.aiBoosters.suspicion = Math.max(0, this.aiBoosters.suspicion - 5);
    this.registry.set('aiBoosters', this.aiBoosters);
    this.suspicionBar.displayWidth = this.aiBoosters.suspicion;
    this.suspicionText.setText(`Suspicion: ${this.aiBoosters.suspicion}/100`);
  }

  // =====================================
  // SPILLEBRÆTTETS TILSTAND
  // =====================================

  handleBoardState(state) {
    switch (state) {
      case 'SWAPPING':
        this.aiHint?.destroy(true);
        this.aiHint = null;
        this.hideEnemySpeechBubble();
        this.hideBobSpeechBubble();
        this.statusText.setText(
          'Bytter...'
        );
        break;

      case 'SWAP_BACK':
        this.statusText.setText(
          'Ugyldigt træk.'
        );
        break;

      case 'REMOVING':
        this.statusText.setText(
          'Match!'
        );
        break;

      case 'FALLING':
        this.statusText.setText(
          'Tiles falder...'
        );
        break;

      case 'ENEMY_TURN':
        this.statusText.setText(
          `${this.enemyConfig.name}s tur...`
        );
        break;

      case 'GAME_OVER_FALL':
        this.statusText.setText('');
        break;

      case 'GAME_OVER':
        this.statusText.setText('');

        this.time.delayedCall(
          0,
          () => {
            if (
              !this.battleWon &&
              !this.battleLost &&
              this.EnemyHP > 0
            ) {
              this.showGameOver();
            }
          }
        );

        break;

      case 'GAME_WON':
        this.statusText.setText('');
        break;
    }
  }

  // =====================================
  // RESULTAT AF SPILLERENS TRÆK
  // =====================================

  handleMoveComplete(result) {
    if (
      this.battleWon ||
      this.battleLost ||
      this.enemyTurnActive
    ) {
      return;
    }

    const freeMove = this.freeAIMove;
    this.freeAIMove = false;

    if (!result.valid) {
      const moraleBeforePenalty = this.PlayerHP;
      this.damagePlayer(5);
      if (this.copyRoundAbility) {
        this.playerRoundActions.push({
          type: 'selfDamage', amount: moraleBeforePenalty - this.PlayerHP
        });
      }
      if (this.PlayerHP <= 0) {
        this.loseBattle();
        return;
      }
      this.showEnemyDialogue('badMove');
      this.statusText.setText(
        'No match - lost 5 Morale. Try again.'
      );

      return;
    }

    if (freeMove) {
      this.freeMoveTilesMatched += result.totalMatched;
    } else {
      // Free AI matches contribute to the same response as the following normal move.
      this.hideAIPowerHint();
      this.lastMoveTotalMatched = this.freeMoveTilesMatched + result.totalMatched;
      this.freeMoveTilesMatched = 0;
      this.board.clearInk();
    }

    const damageResult =
      this.calculateDamage(
        result
      );

    // Kun skaden fra den forbudte briktype giver tilbageslag, ikke AI-bonussen.
    const bannedTileDamage = this.board.bannedTileType == null ? 0 : damageResult.breakdown
      .filter(match => match.tileValue === this.board.bannedTileType)
      .reduce((total, match) => total + match.damage, 0);
    if (!freeMove && this.board.bannedTileType != null) {
      this.banRoundsRemaining--;
      if (this.banRoundsRemaining <= 0) this.board.setBannedTile(null);
    }

    if (freeMove) {
      damageResult.totalDamage += 3;
      damageResult.breakdown.push({
        chain: 1, tileAmount: 1, damagePerTile: 3, damage: 3, type: 'AI bonus'
      });
    }

    this.turnDamage =
      damageResult.totalDamage;
    this.updateDeadlineRequirement(this.turnDamage, freeMove);
    if (this.copyRoundAbility) {
      this.playerRoundActions.push({ type: 'damage', amount: this.turnDamage });
    }

    this.damageBreakdown =
      damageResult.breakdown;

    this.renderDamage();

    // =====================================
    // BOBS ANGREB
    // =====================================

    this.playPlayerAttackAnimation();

    // Enemy takes damage
    this.damageEnemy(
      this.turnDamage
    );

    if (bannedTileDamage > 0) {
      this.damagePlayer(bannedTileDamage * 0.5);
      if (this.PlayerHP <= 0) {
        this.loseBattle();
        return;
      }
    }

    if (this.EnemyHP <= 0) {
      this.winBattle();

      return;
    }

    if (!result.hasValidMoves) {
      return;
    }

    // A free AI swap deals damage, then returns input without an enemy turn.
    if (freeMove) {
      this.statusText.setText(`${this.turnDamage} damage. Your extra turn!`);
      return;
    }

    this.playerMoveCount++;

    // =====================================
    // FJENDENS SVAR PÅ ET GYLDIGT TRÆK
    // =====================================

    if (
      this.playerMoveCount >= 1
    ) {
      this.playerMoveCount = 0;

      this.enemyTurnActive = true;

      if (
        this.board &&
        this.board.setState
      ) {
        this.board.setState(
          'ENEMY_TURN'
        );
      }

      this.statusText.setText(
        `${this.enemyConfig.name} gør sig klar...`,
      );

      this.time.delayedCall(
        Math.max(this.enemyHitDuration, 3000),
        () => {
          if (
            this.battleWon ||
            this.battleLost
          ) {
            return;
          }

          this.startEnemyTurn();
        }
      );

      return;
    }

    if (result.chains > 1) {
      this.statusText.setText(
        `${this.turnDamage} damage - ` +
        `${result.chains} chains`
      );

      return;
    }

    this.statusText.setText(
      `${this.turnDamage} damage`
    );
  }

  // =====================================
  // DEADLINE DEMONS STIGENDE SKADEKRAV
  // =====================================
  updateDeadlineRequirement(damage, freeMove) {
    if (!this.deadlineAbility) return;
    this.deadlineRoundDamage += damage;
    if (freeMove) return;

    if (this.deadlineRoundDamage < this.deadlineRequirement) {
      this.deadlineDamageBonus++;
    }
    this.deadlineRoundDamage = 0;
    this.deadlineMoveCount++;
    this.deadlineRequirement = this.deadlineAbility.startingRequirement
      + this.deadlineMoveCount * this.deadlineAbility.damagePerRound;
  }

  // =====================================
  // BEREGNING AF SKADE
  // =====================================

  calculateDamage(result) {
    const tileNames = [
      'Kaffe',
      'Email',
      'Laptop',
      'Notesbog',
      'Telefon',
      'Ur'
    ];

    let totalDamage = 0;

    const breakdown = [];

    for (
      const chainData
      of result.matches
    ) {
      let damagePerTile;

      if (
        chainData.chain === 1
      ) {
        damagePerTile = 3;
      } else if (
        chainData.chain === 2
      ) {
        damagePerTile = 2;
      } else {
        damagePerTile = 1;
      }

      const mergedMatches =
        this.mergeConnectedMatches(
          chainData.matches
        );

      for (
        const match
        of mergedMatches
      ) {
        const tileAmount =
          match.cells.length;

        const damage =
          tileAmount *
          damagePerTile;

        totalDamage += damage;

        breakdown.push({
          tileValue: match.tileValue,
          chain:
            chainData.chain,

          tileAmount,

          damagePerTile,

          damage,

          type:
            tileNames[
              match.tileValue
            ] ?? 'Ukendt'
        });
      }
    }

    return {
      totalDamage,
      breakdown
    };
  }

  // =====================================
  // VISNING AF SKADEBEREGNINGEN
  // =====================================

  renderDamage() {
    if (
      this.damageBreakdown.length === 0
    ) {
      return;
    }

    let totalTiles = 0;
    let tileDamage = 0;
    let aiBonus = 0;
    for (const entry of this.damageBreakdown) {
      if (entry.type === 'AI bonus') {
        aiBonus += entry.damage;
      } else {
        totalTiles += entry.tileAmount;
        tileDamage += entry.damage;
      }
    }

    const lines = [`${totalTiles} tile = ${tileDamage} DMG`];
    if (aiBonus > 0) {
      lines.push(`AI bonus = ${aiBonus} DMG`);
    }

    this.damageHistory.unshift(...lines);
    this.damageCalculationText.setText(this.damageHistory.join('\n'));

    // Fjern de ældste linjer, når historikken når ned til totalfeltet.
    const availableHeight = this.damageTotalText.y - this.damageTotalText.height / 2
      - this.damageCalculationText.y - 10;
    while (this.damageHistory.length > 1 && this.damageCalculationText.height > availableHeight) {
      this.damageHistory.pop();
      this.damageCalculationText.setText(this.damageHistory.join('\n'));
    }

    this.damageTotalText
      .setText(
        `TOTAL: ${this.turnDamage}`
      );
  }

  // =====================================
  // BOBS ANGREB
  // =====================================

  playPlayerAttackAnimation() {
    if (
      !this.player ||
      this.battleLost
    ) {
      return;
    }

    this.player.stop();

    this.tweens.killTweensOf(
      this.player
    );

    this.player.x =
      this.playerBaseX;

    this.player.y =
      this.playerBaseY;

    const quote =
      this.getNextBobQuote();

    this.showBobSpeechBubble(
      quote
    );

    this.player.setTexture(
      'BobDealDMG',
      0
    );

    this.player.once(
      'animationcomplete-bob-attack',
      () => {
        if (
          this.battleLost
        ) {
          return;
        }

        this.player.setTexture(
          'BobIdle',
          0
        );

        this.player.play(
          'bob-idle'
        );
      }
    );

    this.player.play(
      'bob-attack'
    );
  }

  // =====================================
  // BOBS REPLIKKER
  // =====================================

  getNextBobQuote() {
    if (this.remainingBobQuotes.length === 0) {
      this.remainingBobQuotes = Phaser.Utils.Array.Shuffle([...this.bobQuotes]);
      // pop() reads from the end; avoid repeating the previous pool's final line.
      const lastIndex = this.remainingBobQuotes.length - 1;
      if (lastIndex > 0 && this.remainingBobQuotes[lastIndex] === this.lastBobQuote) {
        const firstQuote = this.remainingBobQuotes[0];
        this.remainingBobQuotes[0] = this.remainingBobQuotes[lastIndex];
        this.remainingBobQuotes[lastIndex] = firstQuote;
      }
    }

    const quote = this.remainingBobQuotes.pop();
    this.lastBobQuote = quote;
    return quote;
  }

  // =====================================
  // SKRIVEEFFEKT I TALEBOBLER
  // =====================================
  typeSpeechText(text, message) {
    let characterCount = 0;
    return this.time.addEvent({
      delay: 25,
      // Give the bubble's 150 ms entrance time to finish before typing.
      startAt: -150,
      repeat: message.length - 1,
      callback: () => {
        characterCount++;
        text.setText(message.slice(0, characterCount));
      }
    });
  }

  // =====================================
  // BOBS TALEBOBLE
  // =====================================

  showBobSpeechBubble(message) {
    this.hideBobSpeechBubble();

    /*
     * Bob står i venstre side,
     * så boblen placeres til højre
     * for ham.
     *
     * Flyt disse værdier hvis du vil
     * justere placeringen.
     */
    const bubbleX =
      this.player.x + 45;

    const bubbleY =
      this.playerBaseY - 10;

    const bubbleWidth = 190;
    const bubbleHeight = 65;

    const container =
      this.add.container(
        bubbleX,
        bubbleY
      );

    container.setDepth(40);

    const graphics =
      this.add.graphics();

    // Sort outline
    graphics.fillStyle(
      0x111111,
      1
    );

    graphics.fillRoundedRect(
      -3,
      -3,
      bubbleWidth + 6,
      bubbleHeight + 6,
      8
    );

    // Hvid boble
    graphics.fillStyle(
      0xffffff,
      1
    );

    graphics.fillRoundedRect(
      0,
      0,
      bubbleWidth,
      bubbleHeight,
      6
    );

    // Sort hale mod Bob
    graphics.fillStyle(
      0x111111,
      1
    );

    graphics.fillTriangle(
      17,
      bubbleHeight - 5,

      -18,
      bubbleHeight + 15,

      3,
      bubbleHeight - 25
    );

    // Hvid hale
    graphics.fillStyle(
      0xffffff,
      1
    );

    graphics.fillTriangle(
      15,
      bubbleHeight - 8,

      -12,
      bubbleHeight + 10,

      5,
      bubbleHeight - 22
    );

    const text =
      this.add.text(
        bubbleWidth / 2,
        bubbleHeight / 2,
        message,
        {
          fontSize: '12px',
          color: '#000000',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          align: 'center',

          wordWrap: {
            width:
              bubbleWidth - 20
          }
        }
      )
        .setOrigin(0.5);

    container.add(
      [
        graphics,
        text
      ]
    );

    container
      .setScale(0.8)
      .setAlpha(0);

    this.tweens.add({
      targets: container,

      scaleX: 1,
      scaleY: 1,
      alpha: 1,

      duration: 150,

      ease: 'Back.Out'
    });

    text.setText('');
    this.bobTypingTimer = this.typeSpeechText(text, message);

    this.bobSpeechBubble =
      container;

    this.bobDialogueTimer = this.time.delayedCall(5000, () => {
      this.hideBobSpeechBubble();
    });
  }

  // =====================================
  // FJERNELSE AF BOBS TALEBOBLE
  // =====================================

  hideBobSpeechBubble() {
    this.bobTypingTimer?.remove();
    this.bobTypingTimer = null;
    if (this.bobDialogueTimer) {
      this.bobDialogueTimer.remove();
      this.bobDialogueTimer = null;
    }

    if (
      !this.bobSpeechBubble
    ) {
      return;
    }

    this.bobSpeechBubble.destroy(
      true
    );

    this.bobSpeechBubble = null;
  }

  // =====================================
  // START PÅ FJENDENS TUR
  // =====================================

  startEnemyTurn() {
    if (
      this.battleWon ||
      this.battleLost
    ) {
      return;
    }

    this.statusText.setText(
      `${this.enemyConfig.name}s tur...`
    );

    if (this.enemyHitTimer) {
      this.enemyHitTimer.remove();

      this.enemyHitTimer = null;
    }

    this.tweens.killTweensOf(
      this.enemy
    );

    this.enemy.x =
      this.enemyBaseX;

    this.enemy.y =
      this.enemyBaseY;

    const abilities = this.enemyConfig.abilities ?? [];
    this.enemyAbility = abilities.find(ability =>
      (ability.type === 'copyRound' && (this.enemyAttackCount + 1) % ability.everyTurns === 0) ||
      (ability.type === 'doubleAttack' &&
      !this.usedEnemyAbilities.includes(ability.id) &&
      this.EnemyHP < this.EnemyMaxHP * ability.hpThreshold)
    );

    const normalDamage = this.getEnemyAttackDamage();
    this.enemyActions = this.enemyAbility?.type === 'copyRound'
      ? [...this.playerRoundActions]
      : [{ type: 'damage', amount: normalDamage }];
    this.playerRoundActions = [];
    this.enemyTurnDamage = 0;

    const banAbility = abilities.find(ability => ability.type === 'banTiles');
    if (banAbility && (this.enemyAttackCount + 1) % banAbility.everyTurns === 0) {
      this.showEnemyDialogue('ban');
    } else if (this.enemyAbility?.type === 'doubleAttack') {
      // Reaching the threshold sooner locks in lower damage for the rest of the fight.
      if (this.enemyAbility.stopDamageScaling) {
        this.fixedEnemyDamage = normalDamage;
      }
      this.usedEnemyAbilities.push(this.enemyAbility.id);
      this.enemyActions.push({ type: 'damage', amount: normalDamage });
      this.showEnemyDialogue(this.enemyAbility.dialogueEvent);
      this.statusText.setText(`${this.enemyConfig.name}: DOUBLE ATTACK!`);
    } else if (this.enemyAbility?.type === 'copyRound') {
      this.showEnemyDialogue(this.enemyAbility.dialogueEvent);
    } else {
      this.showEnemyDialogue('enemyAction');
    }

    this.playEnemyAttackAnimation();
  }

  // =====================================
  // FJENDENS DIALOG
  // =====================================

  showEnemyDialogue(event) {
    if (this.battleLost || (this.battleWon && event !== 'defeat')) {
      return;
    }

    const lines = this.enemyConfig.dialogue?.[event];
    if (!lines || lines.length === 0) {
      return;
    }

    const index = Math.floor(Math.random() * lines.length);
    if (event === 'ban') {
      this.board.setBannedTile(index);
      this.banRoundsRemaining = 2;
    }
    let message = lines[index];
    if (this.deadlineAbility && event === 'enemyAction'
      && this.deadlineRequirement > this.announcedDeadlineRequirement) {
      message += `\nThe scope has grown to ${this.deadlineRequirement} damage.`;
      this.announcedDeadlineRequirement = this.deadlineRequirement;
    }
    this.showEnemySpeechBubble(message);
    this.enemyDialogueTimer = this.time.delayedCall(5000, () => {
      this.hideEnemySpeechBubble();
    });
  }

  // =====================================
  // FJENDENS TALEBOBLE
  // =====================================

  showEnemySpeechBubble(message) {
    this.hideEnemySpeechBubble();

    const bubbleX =
      this.enemy.x - 280;

    const bubbleY =
      this.enemy.y - 100;

    const bubbleWidth = 190;
    const bubbleHeight = 65;

    const container =
      this.add.container(
        bubbleX,
        bubbleY
      );

    container.setDepth(40);

    const graphics =
      this.add.graphics();

    graphics.fillStyle(
      0x111111,
      1
    );

    graphics.fillRoundedRect(
      -3,
      -3,
      bubbleWidth + 6,
      bubbleHeight + 6,
      8
    );

    graphics.fillStyle(
      0xffffff,
      1
    );

    graphics.fillRoundedRect(
      0,
      0,
      bubbleWidth,
      bubbleHeight,
      6
    );

    graphics.fillStyle(
      0x111111,
      1
    );

    graphics.fillTriangle(
      bubbleWidth - 17,
      bubbleHeight - 5,

      bubbleWidth + 18,
      bubbleHeight + 15,

      bubbleWidth - 3,
      bubbleHeight - 25
    );

    graphics.fillStyle(
      0xffffff,
      1
    );

    graphics.fillTriangle(
      bubbleWidth - 15,
      bubbleHeight - 8,

      bubbleWidth + 12,
      bubbleHeight + 10,

      bubbleWidth - 5,
      bubbleHeight - 22
    );

    const text =
      this.add.text(
        bubbleWidth / 2,
        bubbleHeight / 2,
        message,
        {
          fontSize: '12px',
          color: '#000000',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          align: 'center',

          wordWrap: {
            width:
              bubbleWidth - 20
          }
        }
      )
        .setOrigin(0.5);

    container.add(
      [
        graphics,
        text
      ]
    );

    container
      .setScale(0.8)
      .setAlpha(0);

    this.tweens.add({
      targets: container,

      scaleX: 1,
      scaleY: 1,
      alpha: 1,

      duration: 150,

      ease: 'Back.Out'
    });

    text.setText('');
    this.enemyTypingTimer = this.typeSpeechText(text, message);

    this.enemySpeechBubble =
      container;
  }

  // =====================================
  // FJERNELSE AF FJENDENS TALEBOBLE
  // =====================================

  hideEnemySpeechBubble() {
    this.enemyTypingTimer?.remove();
    this.enemyTypingTimer = null;
    if (this.enemyDialogueTimer) {
      this.enemyDialogueTimer.remove();
      this.enemyDialogueTimer = null;
    }

    if (
      !this.enemySpeechBubble
    ) {
      return;
    }

    this.enemySpeechBubble.destroy(
      true
    );

    this.enemySpeechBubble = null;
  }

  // =====================================
  // FJENDENS ANGREB
  // =====================================

  playEnemyAttackAnimation() {
    if (
      !this.enemy ||
      this.battleWon ||
      this.battleLost
    ) {
      return;
    }

    this.enemy.stop();

    this.tweens.killTweensOf(
      this.enemy
    );

    this.enemy.x =
      this.enemyBaseX;

    this.enemy.y =
      this.enemyBaseY;

    const nextAction = this.enemyActions[0];
    if (nextAction?.type === 'heal' || nextAction?.type === 'selfDamage') {
      this.enemy.play(this.enemyConfig.animations.idle.key);
      this.time.delayedCall(1200, () => this.finishEnemyAttack());
      return;
    }

    const attackAction = this.enemyAbility?.type === 'copyRound' ? 'summon' : 'attack';
    const attackAnimation = this.enemyConfig.animations[attackAction];
    let animationsRemaining = 1;
    const finishAnimation = () => {
      animationsRemaining--;
      if (animationsRemaining === 0) this.finishEnemyAttack();
    };
    if (attackAction === 'summon') {
      animationsRemaining++;
      // Effekten er kun grafik og fjernes, når dens animation er færdig.
      const summoned = this.add.sprite(this.enemyBaseX + this.enemyAbility.offsetX,
        this.enemyBaseY, this.enemyConfig.textures.summoned)
        .setScale(this.enemyConfig.scale).setDepth(5);
      const summonedAnimation = this.enemyConfig.animations.summoned;
      summoned.once(`animationcomplete-${summonedAnimation.key}`, () => {
        summoned.destroy();
        finishAnimation();
      });
      summoned.play(summonedAnimation.key);
    }

    this.enemy.setTexture(
      this.enemyConfig.textures[attackAction],
      0
    );

    this.enemy.once(
      `animationcomplete-${attackAnimation.key}`,
      finishAnimation
    );

    this.enemy.play(
      attackAnimation.key
    );
  }

  // =====================================
  // AFSLUTNING AF FJENDENS ANGREB
  // =====================================

  finishEnemyAttack() {
    if (
      this.battleWon ||
      this.battleLost
    ) {
      return;
    }

    const action = this.enemyActions.shift();
    if (!action) {
      return;
    }
    const damage = action.type === 'damage' ? action.amount : 0;

    this.enemyTurnDamage += damage;

    const healedMorale = damage < 0 ? Math.min(-damage, this.PlayerMaxHP - this.PlayerHP) : 0;
    if (action.type === 'selfDamage') {
      this.damageEnemy(action.amount);
      if (this.EnemyHP <= 0) {
        this.winBattle();
        return;
      }
    } else if (action.type === 'heal') {
      this.EnemyHP = Math.min(this.EnemyMaxHP, this.EnemyHP + action.amount);
      this.updateEnemyHealthBar();
      this.statusText.setText(`${this.enemyConfig.name} copies your healing!`);
    } else if (damage < 0) {
      this.PlayerHP += healedMorale;
      this.updatePlayerHealthBar();
    } else {
      this.damagePlayer(damage);
    }

    if (
      this.PlayerHP <= 0
    ) {
      this.loseBattle();

      return;
    }

    // Keep input locked between hits and give Bob's hit animation time to finish.
    if (this.enemyActions.length > 0) {
      this.time.delayedCall(this.enemyAbility.hitDelay, () => {
        if (!this.battleWon && !this.battleLost) {
          this.playEnemyAttackAnimation();
        }
      });
      return;
    }

    // Damage scaling advances once per turn, including a double-attack turn.
    this.enemyAttackCount++;

    const inkAbility = (this.enemyConfig.abilities ?? []).find(ability =>
      ability.type === 'ink' && this.enemyAttackCount >= this.nextInkAttack
    );
    if (inkAbility) {
      const tileCount = Math.round(this.board.rows * this.board.cols * inkAbility.tilePercentage);
      this.board.coverTilesWithInk(tileCount);
      this.nextInkAttack = this.enemyAttackCount + Phaser.Math.Between(inkAbility.minTurns, inkAbility.maxTurns);
    }

    this.enemy.setTexture(
      this.enemyConfig.textures.idle,
      0
    );

    this.enemy.play(
      this.enemyConfig.animations.idle.key
    );

    if (!this.playerLowMoraleShown && this.PlayerHP <= this.PlayerMaxHP * 0.3) {
      this.playerLowMoraleShown = true;
      this.showEnemyDialogue('playerLowMorale');
    }

    this.enemyTurnActive = false;

    if (
      this.board &&
      this.board.setState
    ) {
      this.board.setState(
        'IDLE'
      );
    }

    this.statusText.setText(
      inkAbility
        ? `${this.enemyConfig.name}: INK ATTACK! Tiles hidden for one turn.`
        : damage < 0
        ? `Organisation restored ${healedMorale} Morale!`
        : `${this.enemyConfig.name} gjorde ${this.enemyTurnDamage} morale damage!`
    );
  }

  // =====================================
  // BEREGNING AF FJENDENS SKADE
  // =====================================

  getEnemyAttackDamage() {
    if (this.fixedEnemyDamage !== null) {
      return this.fixedEnemyDamage;
    }
    const matchReduction = (this.enemyConfig.abilities ?? []).find(ability =>
      ability.type === 'matchDamageReduction'
    );
    if (matchReduction) {
      const extraTiles = Math.max(0, this.lastMoveTotalMatched - 3);
      return this.enemyConfig.baseDamage - extraTiles * matchReduction.damagePerExtraTile;
    }
    // Increasing pressure rewards larger matches and cascades over basic matches.
    return this.enemyConfig.baseDamage + this.enemyAttackCount * this.enemyConfig.damageIncrease
      + this.deadlineDamageBonus;
  }

  // =====================================
  // FJENDENS REAKTION PÅ SKADE
  // =====================================

  playEnemyHitAnimation() {
    if (!this.enemy) {
      return;
    }

    if (this.enemyHitTimer) {
      this.enemyHitTimer.remove();

      this.enemyHitTimer = null;
    }

    this.tweens.killTweensOf(
      this.enemy
    );

    this.enemy.x =
      this.enemyBaseX;

    this.enemy.y =
      this.enemyBaseY;

    this.enemy.stop();

    const hitAnimation = this.enemyConfig.animations.hit;

    if (hitAnimation) {
      this.enemy.play(hitAnimation.key);
    } else {
      this.enemy.setTexture(
        this.enemyConfig.textures.hit,
        0
      );
    }

    this.tweens.add({
      targets: this.enemy,

      x:
        this.enemyBaseX + 8,

      duration: 55,

      yoyo: true,

      repeat: 4,

      ease: 'Linear',

      onComplete: () => {
        this.enemy.x =
          this.enemyBaseX;
      }
    });

    this.cameras.main.shake(
      120,
      0.003
    );

    this.enemyHitTimer =
      this.time.delayedCall(
        this.enemyHitDuration,
        () => {
          this.enemyHitTimer = null;

          if (
            this.EnemyHP <= 0 ||
            this.battleWon ||
            this.battleLost ||
            this.enemyTurnActive
          ) {
            return;
          }

          this.enemy.setTexture(
            this.enemyConfig.textures.idle,
            0
          );

          this.enemy.play(
            this.enemyConfig.animations.idle.key
          );
        }
      );
  }

  // =====================================
  // FJENDENS DØDSANIMATION
  // =====================================

  playEnemyDeathAnimation() {
    if (!this.enemy) {
      this.showGameWon();
      return;
    }

    if (this.enemyHitTimer) {
      this.enemyHitTimer.remove();

      this.enemyHitTimer = null;
    }

    this.enemy.stop();

    this.tweens.killTweensOf(
      this.enemy
    );

    this.enemy.x =
      this.enemyBaseX;

    this.enemy.y =
      this.enemyBaseY;

    // Enemies without a death sheet still use the shared victory flow.
    if (!this.enemyConfig.animations.death) {
      this.tweens.add({
        targets: this.enemy, alpha: 0, duration: 600,
        onComplete: () => this.showGameWon()
      });
      return;
    }

    this.tweens.add({
      targets: this.enemy,

      x:
        this.enemyBaseX + 10,

      duration: 60,

      yoyo: true,

      repeat: 4,

      ease: 'Linear',

      onComplete: () => {
        this.enemy.x =
          this.enemyBaseX;

        this.enemy.setTexture(
          this.enemyConfig.textures.death,
          0
        );

        this.enemy.once(
          `animationcomplete-${this.enemyConfig.animations.death.key}`,
          () => {
            if (this.enemyConfig.hideAfterDeath) {
              this.enemy.setVisible(false);
            }
            this.showGameWon();
            if (this.enemyConfig.defeatClickMorale) {
              this.showBobSpeechBubble('I should clean up after myself');
              // No cursor hint: closing the defeated box is a hidden, optional reward.
              this.enemy.setInteractive();
              this.enemy.once('pointerdown', () => {
                if (this.resultTransitionActive) return;
                this.enemy.disableInteractive();
                this.enemy.playReverse(this.enemyConfig.animations.spawn.key);
                const healedMorale = Math.min(this.enemyConfig.defeatClickMorale,
                  this.PlayerMaxHP - this.PlayerHP);
                // Apply on click so CONTINUE can carry the reward during the animation.
                this.PlayerHP += healedMorale;
                this.updatePlayerHealthBar();
                this.statusText.setText(`Organisation complete! +${healedMorale} Morale.`);
              });
            }
          }
        );

        this.enemy.play(
          this.enemyConfig.animations.death.key
        );
      }
    });

    this.cameras.main.shake(
      250,
      0.005
    );
  }

  // =====================================
  // BOBS REAKTION PÅ SKADE
  // =====================================

  playPlayerHitAnimation() {
    if (
      !this.player ||
      this.battleLost
    ) {
      return;
    }

    this.player.stop();

    this.tweens.killTweensOf(
      this.player
    );

    this.player.x =
      this.playerBaseX;

    this.player.y =
      this.playerBaseY;

    this.player.setTexture(
      'BobTakeDMG',
      0
    );

    // Shake samtidig med animationen
    this.tweens.add({
      targets: this.player,

      x:
        this.playerBaseX - 8,

      duration: 55,

      yoyo: true,

      repeat: 4,

      ease: 'Linear',

      onComplete: () => {
        this.player.x =
          this.playerBaseX;
      }
    });

    this.player.once(
      'animationcomplete-bob-take-dmg',
      () => {
        if (
          this.PlayerHP <= 0 ||
          this.battleLost
        ) {
          return;
        }

        this.player.setTexture(
          'BobIdle',
          0
        );

        this.player.play(
          'bob-idle'
        );
      }
    );

    this.player.play(
      'bob-take-dmg'
    );

    this.cameras.main.shake(
      180,
      0.004
    );
  }

  // =====================================
  // BOBS DØDSANIMATION
  // =====================================

  playPlayerDeathAnimation() {
    if (!this.player) {
      this.showGameOver();
      return;
    }

    this.hideBobSpeechBubble();

    this.player.stop();

    this.tweens.killTweensOf(
      this.player
    );

    this.player.x =
      this.playerBaseX;

    this.player.y =
      this.playerBaseY;

    // Lille death shake
    this.tweens.add({
      targets: this.player,

      x:
        this.playerBaseX - 10,

      duration: 60,

      yoyo: true,

      repeat: 4,

      ease: 'Linear',

      onComplete: () => {
        this.player.x =
          this.playerBaseX;

        this.player.setTexture(
          'BobDeath',
          0
        );

        this.player.once(
          'animationcomplete-bob-death',
          () => {
            this.showGameOver();
          }
        );

        this.player.play(
          'bob-death'
        );
      }
    });

    this.cameras.main.shake(
      250,
      0.005
    );
  }

  // =====================================
  // SKADETAL OVER FJENDEN
  // =====================================

  showEnemyDamageNumber(amount) {
    const damageText =
      this.add.text(
        this.enemy.x,
        this.enemy.y,
        `-${amount}`,
        {
          fontSize: '24px',
          color: '#ff4444',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4
        }
      )
        .setOrigin(0.5)
        .setDepth(30);

    this.tweens.add({
      targets: damageText,

      y:
        damageText.y - 35,

      scaleX: 1.25,
      scaleY: 1.25,

      duration: 180,

      ease: 'Back.Out',

      onComplete: () => {
        this.tweens.add({
          targets: damageText,

          y:
            damageText.y + 55,

          alpha: 0,

          scaleX: 0.9,
          scaleY: 0.9,

          duration: 500,

          ease: 'Quad.In',

          onComplete: () => {
            damageText.destroy();
          }
        });
      }
    });
  }

  // =====================================
  // MORALETAB OVER SPILLEREN
  // =====================================

  showPlayerMoraleLoss(amount) {
    const moraleText =
      this.add.text(
        this.player.x,
        this.player.y,
        `-${amount} MORALE`,
        {
          fontSize: '20px',
          color: '#ff5555',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 4
        }
      )
        .setOrigin(0.5)
        .setDepth(30);

    this.tweens.add({
      targets: moraleText,

      y:
        moraleText.y - 35,

      scaleX: 1.2,
      scaleY: 1.2,

      duration: 180,

      ease: 'Back.Out',

      onComplete: () => {
        this.tweens.add({
          targets: moraleText,

          y:
            moraleText.y + 55,

          alpha: 0,

          scaleX: 0.9,
          scaleY: 0.9,

          duration: 600,

          ease: 'Quad.In',

          onComplete: () => {
            moraleText.destroy();
          }
        });
      }
    });
  }

  // =====================================
  // SEJR I KAMPEN
  // =====================================

  winBattle() {
    if (this.battleWon) {
      return;
    }

    this.battleWon = true;
    this.hideAIPowerHint();
    this.recoverSuspicionAfterFight();

    this.enemyTurnActive = false;

    if (this.enemyHitTimer) {
      this.enemyHitTimer.remove();

      this.enemyHitTimer = null;
    }

    this.hideEnemySpeechBubble();
    this.hideBobSpeechBubble();
    this.showEnemyDialogue('defeat');

    if (this.gameOverText) {
      this.gameOverText.destroy();

      this.gameOverText = null;
    }

    if (
      this.board &&
      this.board.setState
    ) {
      this.board.setState(
        'GAME_WON'
      );
    } else if (
      this.board
    ) {
      this.board.state =
        'GAME_WON';
    }

    this.statusText.setText('');

    this.playEnemyDeathAnimation();
  }

  // =====================================
  // NEDERLAG I KAMPEN
  // =====================================

  loseBattle() {
    if (this.battleLost) {
      return;
    }

    this.battleLost = true;
    this.hideAIPowerHint();
    this.recoverSuspicionAfterFight();

    this.enemyTurnActive = false;

    this.hideEnemySpeechBubble();
    this.hideBobSpeechBubble();

    if (
      this.board &&
      this.board.setState
    ) {
      this.board.setState(
        'GAME_OVER'
      );
    } else if (
      this.board
    ) {
      this.board.state =
        'GAME_OVER';
    }

    this.statusText.setText('');

    // Bob spiller death-animation først
    this.playPlayerDeathAnimation();
  }

  // =====================================
  // SEJRSSKÆRM
  // =====================================

  showGameWon() {
    if (this.gameWonText) {
      return;
    }

    const boardCenterX =
      this.scale.width / 2;

    const boardCenterY =
      this.topAreaHeight +
      22 +
      (8 * 52) / 2;

    this.gameWonText =
      this.add.text(
        boardCenterX,
        boardCenterY,
        this.enemyConfig.victoryText ?? 'ENCOUNTER COMPLETE',
        {
          fontSize: '42px',
          color: '#ffffff',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 6
        }
      )
        .setOrigin(0.5)
        .setDepth(20);

    this.addResultButton(boardCenterX, boardCenterY + 75, 'CONTINUE', () => {
      this.scene.start('ProgressionScene', {
        completedEncounterId: this.encounterId,
        nextEncounterIndex: this.encounterIndex + 1,
        playerMorale: this.PlayerHP,
        playerMaxMorale: this.PlayerMaxHP
      });
    });
  }

  // =====================================
  // SPILLET ER SLUT
  // =====================================

  showGameOver() {
    if (
      this.gameOverText ||
      this.battleWon
    ) {
      return;
    }

    this.recoverSuspicionAfterFight();

    const boardCenterX =
      this.scale.width / 2;

    const boardCenterY =
      this.topAreaHeight +
      22 +
      (8 * 52) / 2;

    this.gameOverText =
      this.add.text(
        boardCenterX,
        boardCenterY,
        this.battleLost ? 'BURNOUT' : 'GAME OVER',
        {
          fontSize: '42px',
          color: '#ffffff',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 6
        }
      )
        .setOrigin(0.5)
        .setDepth(20);

    this.addResultButton(boardCenterX, boardCenterY + 75, 'TRY AGAIN', () => {
      this.registry.set('aiBoosters', { ...this.startingAIBoosters });
      this.scene.restart({
        encounterId: this.encounterId,
        encounterIndex: this.encounterIndex,
        playerMorale: this.startingMorale,
        playerMaxMorale: this.startingMaxMorale
      });
    });

    this.addResultButton(boardCenterX, boardCenterY + 140, 'MAIN MENU', () => {
      this.scene.start('MainMenuScene');
    });
  }

  // =====================================
  // KNAPPER PÅ RESULTATSKÆRMEN
  // =====================================
  addResultButton(x, y, label, onClick) {
    const button = this.add.rectangle(x, y, 220, 50, 0x555555, 0.95)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);

    this.add.text(x, y, label, {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(22);

    button.on('pointerover', () => button.setFillStyle(0x777777, 0.95));
    button.on('pointerout', () => button.setFillStyle(0x555555, 0.95));
    button.on('pointerdown', () => {
      if (this.resultTransitionActive) {
        return;
      }

      this.resultTransitionActive = true;
      onClick();
    });
  }

  // =====================================
  // SAMMENLÆGNING AF OVERLAPPENDE MATCH
  // =====================================

  mergeConnectedMatches(matches) {
    const groups = [];

    for (
      const match
      of matches
    ) {
      const cellKeys =
        new Set(
          match.cells.map(
            cell =>
              `${cell.row},${cell.col}`
          )
        );

      const overlappingGroups =
        groups.filter(
          group =>
            group.tileValue ===
              match.tileValue &&
            this.setsOverlap(
              group.cellKeys,
              cellKeys
            )
        );

      if (
        overlappingGroups.length === 0
      ) {
        groups.push({
          tileValue:
            match.tileValue,

          cellKeys:
            new Set(
              cellKeys
            )
        });

        continue;
      }

      const mainGroup =
        overlappingGroups[0];

      for (
        const key
        of cellKeys
      ) {
        mainGroup.cellKeys.add(
          key
        );
      }

      for (
        let i = 1;
        i <
        overlappingGroups.length;
        i++
      ) {
        const extraGroup =
          overlappingGroups[i];

        for (
          const key
          of extraGroup.cellKeys
        ) {
          mainGroup.cellKeys.add(
            key
          );
        }

        const index =
          groups.indexOf(
            extraGroup
          );

        if (
          index !== -1
        ) {
          groups.splice(
            index,
            1
          );
        }
      }
    }

    return groups.map(
      group => {
        const cells =
          Array.from(
            group.cellKeys
          ).map(
            key => {
              const [
                row,
                col
              ] =
                key
                  .split(',')
                  .map(Number);

              return {
                row,
                col
              };
            }
          );

        return {
          tileValue:
            group.tileValue,

          cells
        };
      }
    );
  }

  // =====================================
  // KONTROL AF OVERLAP MELLEM MÆNGDER
  // =====================================

  setsOverlap(
    firstSet,
    secondSet
  ) {
    for (
      const value
      of firstSet
    ) {
      if (
        secondSet.has(
          value
        )
      ) {
        return true;
      }
    }

    return false;
  }

  // =====================================
  // OPDATERING AF LIV OG MORALE
  // =====================================

  updateEnemyHealthBar() {
    this.EnemyHP =
      Phaser.Math.Clamp(
        this.EnemyHP,
        0,
        this.EnemyMaxHP
      );

    const hpPercent =
      this.EnemyHP /
      this.EnemyMaxHP;

    this.enemyHpBar.displayWidth =
      100 * hpPercent;

    this.enemyHpText.setText(
      `${this.EnemyHP} / ${this.EnemyMaxHP}`
    );
  }

  updatePlayerHealthBar() {
    this.PlayerHP =
      Phaser.Math.Clamp(
        this.PlayerHP,
        0,
        this.PlayerMaxHP
      );

    const hpPercent =
      this.PlayerHP /
      this.PlayerMaxHP;

    this.playerHpBar.displayWidth =
      100 * hpPercent;

    this.playerHpText.setText(
      `${this.PlayerHP} / ${this.PlayerMaxHP}`
    );
  }

  // =====================================
  // SKADE PÅ FJENDEN
  // =====================================

  damageEnemy(amount) {
    if (amount <= 0) {
      return;
    }

    this.EnemyHP =
      Math.max(
        0,
        this.EnemyHP - amount
      );

    this.updateEnemyHealthBar();

    this.showEnemyDamageNumber(
      amount
    );

    this.playEnemyHitAnimation();
  }

  // =====================================
  // MORALETAB HOS SPILLEREN
  // =====================================

  damagePlayer(amount) {
    if (amount <= 0) {
      return;
    }

    this.PlayerHP =
      Math.max(
        0,
        this.PlayerHP - amount
      );

    this.updatePlayerHealthBar();

    this.showPlayerMoraleLoss(
      amount
    );

    this.playPlayerHitAnimation();
  }
}

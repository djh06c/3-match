import Phaser from 'phaser';
import Match3Board from '../game/Match3Board.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // =====================================
    // MATCH-3 ICONS
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
    // BACKGROUND
    // =====================================

    this.load.image(
      'match3Background',
      '/assets/backgrounds/Baggrund-match3-2.0.png'
    );

    // =====================================
    // PLAYER
    // =====================================

    this.load.image(
      'player',
      '/assets/mobs/Bob/Bob.png'
    );

    // =====================================
    // JOBLIN
    // =====================================

    this.load.image(
      'Joblin',
      '/assets/mobs/Joblin/Joblin.png'
    );

    this.load.spritesheet(
      'JoblinIdle',
      '/assets/mobs/Joblin/JoblinIdle.png',
      {
        frameWidth: 64,
        frameHeight: 64
      }
    );

    this.load.image(
      'JoblinTakeDMG',
      '/assets/mobs/Joblin/JoblinTakeDMG.png'
    );

    this.load.spritesheet(
      'JoblinDealDMG',
      '/assets/mobs/Joblin/JoblinDealDMG.png',
      {
        frameWidth: 64,
        frameHeight: 64
      }
    );
  }

  create() {
    const width = this.scale.width;

    // =====================================
    // BATTLE STATE
    // =====================================

    this.battleWon = false;
    this.battleLost = false;

    this.playerMoveCount = 0;
    this.enemyAttackCount = 0;
    this.enemyTurnActive = false;

    this.enemyHitDuration = 1000;
    this.enemySpeechDuration = 1200;

    this.enemyHitTimer = null;
    this.joblinSpeechBubble = null;

    // =====================================
    // JOBLIN QUOTES
    // =====================================

    this.joblinQuotes = [
      'Har du søgt bredt nok?',
      'Har du opdateret dit CV?',
      'Du skal være mere fleksibel.',
      'Har du prøvet at netværke?',
      'Du skal sende flere ansøgninger.',
      'Vi skal lige tale om din indsats.'
    ];

    this.joblinQuoteIndex = 0;

    // =====================================
    // TOP / BATTLE AREA
    // =====================================

    this.topAreaHeight = 240;

    this.add.rectangle(
      width / 2,
      this.topAreaHeight / 2,
      width,
      this.topAreaHeight,
      0x3a3a3a
    );

    this.add.text(
      width / 2,
      55,
      'BATTLE AREA PLACEHOLDER',
      {
        fontSize: '22px',
        color: '#ffffff'
      }
    )
      .setOrigin(0.5);

    // =====================================
    // PLAYER
    // =====================================

    this.player = this.add.image(
      width * 0.25,
      100,
      'player'
    );

    this.player
      .setScale(3)
      .setDepth(5);

    this.playerBaseX = this.player.x;
    this.playerBaseY = this.player.y;

    // =====================================
    // JOBLIN ANIMATIONS
    // =====================================

    if (
      !this.anims.exists(
        'joblin-idle'
      )
    ) {
      this.anims.create({
        key: 'joblin-idle',

        frames:
          this.anims.generateFrameNumbers(
            'JoblinIdle',
            {
              start: 0,
              end: 1
            }
          ),

        frameRate: 2,

        repeat: -1
      });
    }

    if (
      !this.anims.exists(
        'joblin-attack'
      )
    ) {
      this.anims.create({
        key: 'joblin-attack',

        frames:
          this.anims.generateFrameNumbers(
            'JoblinDealDMG',
            {
              start: 0,
              end: 15
            }
          ),

        frameRate: 10,

        repeat: 0
      });
    }

    // =====================================
    // ENEMY
    // =====================================

    this.Joblin = this.add.sprite(
      width * 0.75,
      100,
      'JoblinIdle',
      0
    );

    this.Joblin
      .setScale(3)
      .setDepth(5);

    this.enemyBaseX =
      this.Joblin.x;

    this.enemyBaseY =
      this.Joblin.y;

    this.Joblin.play(
      'joblin-idle'
    );

    // =====================================
    // HP / MORALE VALUES
    // =====================================

    this.PlayerMaxHP = 100;
    this.PlayerHP = 100;

    this.EnemyMaxHP = 100;
    this.EnemyHP = 100;

    // =====================================
    // PLAYER NAME
    // =====================================

    this.playerNameText = this.add.text(
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
    // ENEMY NAME
    // =====================================

    this.enemyNameText = this.add.text(
      width * 0.75,
      205,
      'JOBLIN',
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
    // PLAYER HEALTH / MORALE BAR
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

    this.playerHpText = this.add.text(
      width * 0.25,
      224,
      '100 / 100',
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
    // ENEMY HEALTH BAR
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

    this.enemyHpText = this.add.text(
      width * 0.75,
      224,
      '100 / 100',
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
    // SKILLELINJE
    // =====================================

    this.add.rectangle(
      width / 2,
      this.topAreaHeight,
      width,
      4,
      0xffffff
    );

    // =====================================
    // MATCH-3 BACKGROUND
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
    // DAMAGE DISPLAY
    // =====================================

    this.turnDamage = 0;
    this.damageBreakdown = [];

    const damageCenterX = 704;

    this.damageTitle = this.add.text(
      damageCenterX,
      this.topAreaHeight + 60,
      'DAMAGE',
      {
        fontSize: '16px',
        color: '#000000',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(10);

    this.damageCalculationText =
      this.add.text(
        damageCenterX,
        this.topAreaHeight + 86,
        '',
        {
          fontSize: '11px',
          color: '#000000',
          fontFamily:
            'Arial, sans-serif',
          fontStyle: 'bold',
          align: 'center',
          lineSpacing: 6,

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
        this.topAreaHeight + 315,
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
    // STATUS
    // =====================================

    this.statusText = this.add.text(
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
    // BOARD
    // =====================================

    const tileSize = 52;

    const boardWidth =
      8 * tileSize;

    const boardX =
      (width - boardWidth) / 2;

    const boardY =
      this.topAreaHeight + 22;

    this.board = new Match3Board(
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

    this.board.playInitialDrop();
  }

  // =====================================
  // BOARD STATE
  // =====================================

  handleBoardState(state) {
    switch (state) {
      case 'SWAPPING':
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
          'Joblins tur...'
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
  // MOVE RESULT
  // =====================================

  handleMoveComplete(result) {
    if (
      this.battleWon ||
      this.battleLost ||
      this.enemyTurnActive
    ) {
      return;
    }

    if (!result.valid) {
      this.statusText.setText(
        'Ingen match - prøv igen.'
      );

      return;
    }

    const damageResult =
      this.calculateDamage(
        result
      );

    this.turnDamage =
      damageResult.totalDamage;

    this.damageBreakdown =
      damageResult.breakdown;

    this.renderDamage();

    this.damageEnemy(
      this.turnDamage
    );

    if (this.EnemyHP <= 0) {
      this.winBattle();

      return;
    }

    if (!result.hasValidMoves) {
      return;
    }

    this.playerMoveCount++;

    if (this.playerMoveCount >= 3) {
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
        'Joblin gør sig klar...'
      );

      this.time.delayedCall(
        this.enemyHitDuration,
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
  // DAMAGE CALCULATION
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
  // RENDER DAMAGE
  // =====================================

  renderDamage() {
    if (
      this.damageBreakdown.length === 0
    ) {
      this.damageCalculationText
        .setText('');

      this.damageTotalText
        .setText('TOTAL: 0');

      return;
    }

    const lines =
      this.damageBreakdown.map(
        entry => {
          return (
            `${entry.tileAmount}x ` +
            `${entry.type}` +
            ` x${entry.damagePerTile}` +
            ` = ${entry.damage}`
          );
        }
      );

    this.damageCalculationText
      .setText(
        lines.join('\n')
      );

    this.damageTotalText
      .setText(
        `TOTAL: ${this.turnDamage}`
      );
  }

  // =====================================
  // START ENEMY TURN
  // =====================================

  startEnemyTurn() {
    if (
      this.battleWon ||
      this.battleLost
    ) {
      return;
    }

    this.statusText.setText(
      'Joblins tur...'
    );

    if (this.enemyHitTimer) {
      this.enemyHitTimer.remove();
      this.enemyHitTimer = null;
    }

    this.tweens.killTweensOf(
      this.Joblin
    );

    this.Joblin.x =
      this.enemyBaseX;

    this.Joblin.y =
      this.enemyBaseY;

    const quote =
      this.getNextJoblinQuote();

    // Boble + attack starter samtidig
    this.showJoblinSpeechBubble(
      quote
    );

    this.playEnemyAttackAnimation();
  }

  // =====================================
  // JOBLIN QUOTES
  // =====================================

  getNextJoblinQuote() {
    const quote =
      this.joblinQuotes[
        this.joblinQuoteIndex
      ];

    this.joblinQuoteIndex =
      (
        this.joblinQuoteIndex + 1
      ) %
      this.joblinQuotes.length;

    return quote;
  }

  // =====================================
  // SPEECH BUBBLE
  // =====================================

  showJoblinSpeechBubble(message) {
    this.hideJoblinSpeechBubble();

    const bubbleX =
      this.Joblin.x - 280;

    const bubbleY =
      this.Joblin.y - 100;

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

    container.setScale(0.8);
    container.setAlpha(0);

    this.tweens.add({
      targets: container,

      scaleX: 1,
      scaleY: 1,
      alpha: 1,

      duration: 150,

      ease: 'Back.Out'
    });

    this.joblinSpeechBubble =
      container;
  }

  // =====================================
  // HIDE SPEECH BUBBLE
  // =====================================

  hideJoblinSpeechBubble() {
    if (
      !this.joblinSpeechBubble
    ) {
      return;
    }

    this.joblinSpeechBubble.destroy(
      true
    );

    this.joblinSpeechBubble = null;
  }

  // =====================================
  // JOBLIN ATTACK ANIMATION
  // =====================================

  playEnemyAttackAnimation() {
    if (
      !this.Joblin ||
      this.battleWon ||
      this.battleLost
    ) {
      return;
    }

    this.Joblin.stop();

    this.tweens.killTweensOf(
      this.Joblin
    );

    this.Joblin.x =
      this.enemyBaseX;

    this.Joblin.y =
      this.enemyBaseY;

    this.Joblin.setTexture(
      'JoblinDealDMG',
      0
    );

    this.Joblin.once(
      'animationcomplete-joblin-attack',
      () => {
        this.finishEnemyAttack();
      }
    );

    this.Joblin.play(
      'joblin-attack'
    );
  }

  // =====================================
  // FINISH ENEMY ATTACK
  // =====================================

  finishEnemyAttack() {
    if (
      this.battleWon ||
      this.battleLost
    ) {
      return;
    }

    // =====================================
    // NY ÆNDRING:
    // Fjern taleboblen når angrebet slutter
    // =====================================

    this.hideJoblinSpeechBubble();

    const damage =
      this.getEnemyAttackDamage();

    this.damagePlayer(
      damage
    );

    this.enemyAttackCount++;

    if (this.PlayerHP <= 0) {
      this.loseBattle();

      return;
    }

    this.Joblin.setTexture(
      'JoblinIdle',
      0
    );

    this.Joblin.play(
      'joblin-idle'
    );

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
      `Joblin gjorde ${damage} morale damage!`
    );
  }

  // =====================================
  // ENEMY DAMAGE CALCULATION
  // =====================================

  getEnemyAttackDamage() {
    return (
      10 +
      this.enemyAttackCount * 5
    );
  }

  // =====================================
  // JOBLIN TAKE DAMAGE ANIMATION
  // =====================================

  playEnemyHitAnimation() {
    if (!this.Joblin) {
      return;
    }

    if (this.enemyHitTimer) {
      this.enemyHitTimer.remove();

      this.enemyHitTimer = null;
    }

    this.tweens.killTweensOf(
      this.Joblin
    );

    this.Joblin.x =
      this.enemyBaseX;

    this.Joblin.y =
      this.enemyBaseY;

    this.Joblin.stop();

    this.Joblin.setTexture(
      'JoblinTakeDMG'
    );

    this.tweens.add({
      targets: this.Joblin,

      x:
        this.enemyBaseX + 8,

      duration: 55,

      yoyo: true,

      repeat: 4,

      ease: 'Linear',

      onComplete: () => {
        this.Joblin.x =
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

          this.Joblin.setTexture(
            'JoblinIdle',
            0
          );

          this.Joblin.play(
            'joblin-idle'
          );
        }
      );
  }

  // =====================================
  // ENEMY DAMAGE NUMBER
  // =====================================

  showEnemyDamageNumber(amount) {
    const damageText =
      this.add.text(
        this.Joblin.x,
        this.Joblin.y,
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
  // PLAYER MORALE DAMAGE NUMBER
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
  // PLAYER HIT ANIMATION
  // =====================================

  playPlayerHitAnimation() {
    this.tweens.killTweensOf(
      this.player
    );

    this.player.x =
      this.playerBaseX;

    this.player.y =
      this.playerBaseY;

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

    this.cameras.main.shake(
      180,
      0.004
    );
  }

  // =====================================
  // WIN BATTLE
  // =====================================

  winBattle() {
    if (this.battleWon) {
      return;
    }

    this.battleWon = true;

    this.enemyTurnActive = false;

    if (this.enemyHitTimer) {
      this.enemyHitTimer.remove();

      this.enemyHitTimer = null;
    }

    this.hideJoblinSpeechBubble();

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

    this.showGameWon();
  }

  // =====================================
  // LOSE BATTLE
  // =====================================

  loseBattle() {
    if (this.battleLost) {
      return;
    }

    this.battleLost = true;

    this.enemyTurnActive = false;

    this.hideJoblinSpeechBubble();

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

    this.showGameOver();
  }

  // =====================================
  // GAME WON
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
        'GAME WON',
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
  }

  // =====================================
  // GAME OVER
  // =====================================

  showGameOver() {
    if (
      this.gameOverText ||
      this.battleWon
    ) {
      return;
    }

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
        'GAME OVER',
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
  }

  // =====================================
  // MERGE OVERLAPPING MATCHES
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
  // CHECK SET OVERLAP
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
  // HEALTH
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
  // DAMAGE ENEMY
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
  // DAMAGE PLAYER / MORALE
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
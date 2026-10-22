import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  // =====================================
  // INDLÆSNING AF GRAFIK
  // =====================================
  preload() {
    // Main menu background animation
    // Antager 30 frames og 148x126 pr frame
    this.load.spritesheet(
      'mainMenuAnimation',
      '/assets/backgrounds/MainMenuAnimation.png',
      {
        frameWidth: 200,
        frameHeight: 175
      }
    );
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // =====================================
    // BAGGRUNDSANIMATION
    // =====================================

    if (!this.anims.exists('main-menu-bg')) {
      this.anims.create({
        key: 'main-menu-bg',
        frames: this.anims.generateFrameNumbers(
          'mainMenuAnimation',
          {
            start: 0,
            end: 39
          }
        ),
        frameRate: 10,
        repeat: -1
      });
    }

    const background = this.add.sprite(
      width / 2,
      height / 2,
      'mainMenuAnimation',
      0
    );

    // Fyld hele menuen ud
    background
      .setDisplaySize(width, height)
      .setDepth(0);

    background.play('main-menu-bg');

    // =====================================
    // KNAP TIL NYT SPIL
    // =====================================

    // Jeg har placeret den nede ved
    // parkeringspladsen i venstre side.
    // Hvis du vil have den i højre side,
    // så ændr bare buttonX.
    const buttonX = 160;
    const buttonY = height - 95;

    const button = this.add.rectangle(
      buttonX,
      buttonY,
      220,
      60,
      0x555555,
      0.95
    )
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);

    const buttonText = this.add.text(
      buttonX,
      buttonY,
      'NEW GAME',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(11);

    // Hover
    button.on('pointerover', () => {
      button.setFillStyle(0x777777, 0.95);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x555555, 0.95);
    });

    // Start spillet
    button.on('pointerdown', () => {
      this.registry.set('campaignScore', {
        damage: 0, suspicionGained: 0, interventions: 0, retries: 0, fruitFound: false, boxFound: false
      });
      this.registry.set('aiBoosters', {
        unlocked: false,
        selectedPower: null,
        suspicion: 0
      });
      this.scene.start('MainScene', {
        encounterId: 'joblin',
        encounterIndex: 0,
        playerMorale: 100,
        playerMaxMorale: 100
      });
    });
  }
}

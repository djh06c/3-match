import Phaser from 'phaser';

export default class ProgressionScene extends Phaser.Scene {
  constructor() {
    super('ProgressionScene');
  }

  init(data = {}) {
    // Keep the handoff independent of enemy-specific combat presentation.
    // Future rewards/rest and the next encounter can consume this state.
    this.progression = {
      completedEncounterId: data.completedEncounterId ?? null,
      nextEncounterIndex: data.nextEncounterIndex ?? 0,
      playerMorale: data.playerMorale ?? 100,
      playerMaxMorale: data.playerMaxMorale ?? 100
    };
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.text(width / 2, height / 2 - 100, 'YOUR CAREER CONTINUES', {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 25,
      `MORALE: ${this.progression.playerMorale} / ${this.progression.playerMaxMorale}`, {
        fontSize: '20px',
        color: '#ffff88',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 60,
      'You have completed the current playable encounter.\nMore workplace challenges are coming soon.', {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
        align: 'center',
        lineSpacing: 10,
        wordWrap: { width: 650 }
      }).setOrigin(0.5);

    const button = this.add.rectangle(width / 2, height / 2 + 160, 220, 50, 0x555555)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height / 2 + 160, 'MAIN MENU', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.on('pointerover', () => {
      button.setFillStyle(0x777777);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x555555);
    });

    button.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }
}

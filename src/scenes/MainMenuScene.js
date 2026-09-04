import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Baggrund
    this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x222222
    );

    // Titel
    this.add.text(
      width / 2,
      150,
      'CORPORATE CRUSH',
      {
        fontSize: '42px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5);

    // Knap-baggrund
    const button =
      this.add.rectangle(
        width / 2,
        height / 2,
        220,
        60,
        0x555555
      )
        .setStrokeStyle(
          3,
          0xffffff
        )
        .setInteractive({
          useHandCursor: true
        });

    // Knap-tekst
    this.add.text(
      width / 2,
      height / 2,
      'NEW GAME',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5);

    // Hover
    button.on(
      'pointerover',
      () => {
        button.setFillStyle(
          0x777777
        );
      }
    );

    button.on(
      'pointerout',
      () => {
        button.setFillStyle(
          0x555555
        );
      }
    );

    // Start spillet
    button.on(
      'pointerdown',
      () => {
        this.scene.start(
          'MainScene'
        );
      }
    );
  }
}
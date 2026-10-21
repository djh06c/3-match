import Phaser from 'phaser';
import enemies from '../game/Enemies.js';

export default class ProgressionScene extends Phaser.Scene {
  constructor() {
    super('ProgressionScene');
  }

  // =====================================
  // OVERFØRSEL AF KAMPAGNENS TILSTAND
  // =====================================
  init(data = {}) {
    // Keep the handoff independent of enemy-specific combat presentation.
    // Future rewards/rest and the next encounter can consume this state.
    this.progression = {
      completedEncounterId: data.completedEncounterId ?? null,
      nextEncounterIndex: data.nextEncounterIndex ?? 0,
      playerMorale: data.playerMorale ?? 100,
      playerMaxMorale: data.playerMaxMorale ?? 100,
      hrVisited: data.hrVisited ?? false
    };
  }

  // =====================================
  // VISNING AF NÆSTE KAMPAGNETRIN
  // =====================================
  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const isBreak = ['joblin', 'cardboardMimic'].includes(this.progression.completedEncounterId);
    const nextEncounters = {
      printosaurus: 'cardboardMimic',
      deadlineDemon: 'necromanager'
    };
    const nextEncounterId = nextEncounters[this.progression.completedEncounterId];

    this.add.text(width / 2, height / 2 - 140, isBreak ? 'TIME FOR A BREAK' : 'ENCOUNTER COMPLETE', {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 85,
      `MORALE: ${this.progression.playerMorale} / ${this.progression.playerMaxMorale}`, {
        fontSize: '20px',
        color: '#ffff88',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

    // =====================================
    // PAUSE EFTER JOBLIN OG PAPKASSEMIMIK
    // =====================================
    if (isBreak) {
      this.add.text(width / 2, height / 2 - 30,
        'Where would you like to go?', {
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: 'Arial',
          align: 'center',
          lineSpacing: 10,
          wordWrap: { width: 650 }
        }).setOrigin(0.5);

      const lunchButton = this.add.rectangle(width / 2 - 140, height / 2 + 40,
        240, 60, 0x555555)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true });

      this.add.text(width / 2 - 140, height / 2 + 40, 'LUNCH BREAK', {
        fontSize: '22px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      lunchButton.on('pointerover', () => lunchButton.setFillStyle(0x777777));
      lunchButton.on('pointerout', () => lunchButton.setFillStyle(0x555555));
      lunchButton.on('pointerdown', () => {
        lunchButton.disableInteractive();
        this.scene.start('LunchScene', this.progression);
      });

      const hrButton = this.add.rectangle(width / 2 + 140, height / 2 + 40, 240, 60, 0x555555)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true });

      this.add.text(width / 2 + 140, height / 2 + 40, this.progression.hrVisited ? 'HR\nVISITED' : 'HR', {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);

      hrButton.on('pointerover', () => hrButton.setFillStyle(0x777777));
      hrButton.on('pointerout', () => hrButton.setFillStyle(0x555555));
      hrButton.on('pointerdown', () => {
        hrButton.disableInteractive();
        lunchButton.disableInteractive();
        this.scene.start('HRScene', this.progression);
      });
      if (this.progression.hrVisited) {
        hrButton.disableInteractive();
        hrButton.setFillStyle(0x333333).setStrokeStyle(3, 0x777777);
      }

    } else if (nextEncounterId) {
      this.add.text(width / 2, height / 2 - 30, `NEXT: ${enemies[nextEncounterId].name}`, {
        fontSize: '20px', color: '#ffffff', fontFamily: 'Arial'
      }).setOrigin(0.5);

      const continueButton = this.add.rectangle(width / 2, height / 2 + 40,
        240, 60, 0x555555)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true });
      this.add.text(width / 2, height / 2 + 40, 'CONTINUE', {
        fontSize: '22px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
      }).setOrigin(0.5);
      continueButton.on('pointerover', () => continueButton.setFillStyle(0x777777));
      continueButton.on('pointerout', () => continueButton.setFillStyle(0x555555));
      continueButton.on('pointerdown', () => {
        continueButton.disableInteractive();
        this.scene.start('MainScene', {
          encounterId: nextEncounterId,
          encounterIndex: this.progression.nextEncounterIndex,
          playerMorale: this.progression.playerMorale,
          playerMaxMorale: this.progression.playerMaxMorale
        });
      });
    } else {
      this.add.text(width / 2, height / 2 + 20,
        'You completed the current campaign section.\nMore workplace challenges are coming soon.', {
          fontSize: '18px', color: '#ffffff', fontFamily: 'Arial', align: 'center'
        }).setOrigin(0.5);
    }

    // =====================================
    // TILBAGE TIL HOVEDMENUEN
    // =====================================
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

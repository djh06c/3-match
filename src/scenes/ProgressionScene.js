import Phaser from 'phaser';
import enemies from '../game/Enemies.js';
import { createMusicToggleButton } from '../ui/MusicToggleButton.js';

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

    this.createAIControls();
    if (import.meta.env.DEV) this.createDevSkipButton();
    this.updatePlayerHealthBar();
    this.startEncounter();

    createAudioControls(this);

    createMusicToggleButton(this);

    const width = this.scale.width;
    const height = this.scale.height;
    const campaignComplete = this.progression.completedEncounterId === 'ceoOverlord';
    const isBreak = ['joblin', 'cardboardMimic', 'necromanager'].includes(this.progression.completedEncounterId);
    const nextEncounters = {
      printosaurus: 'cardboardMimic',
      deadlineDemon: 'necromanager'
    };
    const nextEncounterId = nextEncounters[this.progression.completedEncounterId];

    if (campaignComplete) {
      const score = this.registry.get('campaignScore')
        ?? { damage: 0, suspicionGained: 0, interventions: 0 };
      const suspicionPenalty = score.suspicionGained * 3;
      const interventionPenalty = score.interventions * 40;
      const retries = score.retries ?? 0;
      const retryPenalty = retries * 10;
      const easterEggsFound = Number(Boolean(score.fruitFound)) + Number(Boolean(score.boxFound));
      const easterEggBonus = easterEggsFound * 10;
      const remainingMoraleBonus = this.progression.playerMorale;
      const finalScore = score.damage - suspicionPenalty - interventionPenalty - retryPenalty
        + easterEggBonus + remainingMoraleBonus;
      this.add.text(width / 2, height / 2 - 50, `FINAL SCORE: ${finalScore}`, {
        fontFamily: 'Arial', fontSize: '30px', fontStyle: 'bold', color: '#ffff88'
      }).setOrigin(0.5);
      this.add.text(width / 2, height / 2 + 35,
        `Damage dealt: +${score.damage}\nSuspicion gained: ${score.suspicionGained} (-${suspicionPenalty})`
        + `\nSupervisor interventions: ${score.interventions} (-${interventionPenalty})`
        + `\nRetries: ${retries} (-${retryPenalty})`
        + `\nEaster eggs interacted with: ${easterEggsFound}/2 (+${easterEggBonus})`
        + `\nRemaining Morale: +${remainingMoraleBonus}`, {
          fontFamily: 'Arial', fontSize: '18px', color: '#edf1eb',
          align: 'center', lineSpacing: 10
        }).setOrigin(0.5);
    }

    this.add.text(width / 2, height / 2 - 140,
      campaignComplete ? 'Thank you for playing' : isBreak ? 'TIME FOR A BREAK' : 'ENCOUNTER COMPLETE', {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    if (!campaignComplete && !isBreak) {
      this.add.text(width / 2, height / 2 - 85,
      `MORALE: ${this.progression.playerMorale} / ${this.progression.playerMaxMorale}`, {
        fontSize: '20px',
        color: '#ffff88',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }

    // =====================================
    // PAUSE EFTER JOBLIN, PAPKASSEMIMIK OG NECROMANAGER
    // =====================================
    if (isBreak) {
      // Samme overblik som i HR, inden spilleren vælger sin pause.
      const morale = this.progression.playerMorale;
      const maxMorale = this.progression.playerMaxMorale;
      const suspicion = this.registry.get('aiBoosters')?.suspicion ?? 0;
      this.add.rectangle(12, 12, 210, 108, 0x222222, 0.95).setOrigin(0).setDepth(10);
      this.add.text(24, 22, `MORALE: ${morale} / ${maxMorale}`, {
        fontFamily: 'Arial', fontSize: '16px', color: '#ffffff'
      }).setDepth(11);
      this.add.rectangle(24, 47, 180, 12, 0x444444).setOrigin(0, 0.5).setDepth(10);
      const moraleBar = this.add.rectangle(24, 47, 180, 12, 0x55cc77)
        .setOrigin(0, 0.5).setDepth(11);
      moraleBar.displayWidth = 180 * Phaser.Math.Clamp(morale / maxMorale, 0, 1);

      this.add.text(24, 68, `SUSPICION: ${suspicion} / 100`, {
        fontFamily: 'Arial', fontSize: '16px', color: '#ffffff'
      }).setDepth(11);
      this.add.rectangle(24, 97, 180, 12, 0x444444).setOrigin(0, 0.5).setDepth(10);
      const suspicionBar = this.add.rectangle(24, 97, 180, 12, 0xffaa33)
        .setOrigin(0, 0.5).setDepth(11);
      suspicionBar.displayWidth = 180 * Phaser.Math.Clamp(suspicion / 100, 0, 1);

      this.add.text(width / 2, height / 2 - 30,
        'Choose one', {
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

      this.add.text(width / 2 - 140, height / 2 + 40, 'LUNCH BREAK\n(Choose power)', {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        align: 'center'
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

      this.add.text(width / 2 + 140, height / 2 + 40, this.progression.hrVisited ? 'HR\nVISITED' : 'HR\n(Morale boost)', {
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
    } else if (!campaignComplete) {
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

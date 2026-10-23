import Phaser from 'phaser';
import roundedPanel from '../ui/roundedPanel.js';
import { musicManager } from '../audio/musicManager.js';

export default class HRScene extends Phaser.Scene {
  constructor() {
    super('HRScene');
  }

  // =====================================
  // MODTAGELSE AF KAMPAGNENS DATA
  // =====================================
  init(data = {}) {
    this.progression = data;
  }

  // =====================================
  // INDLÆSNING AF HR-LOKALET
  // =====================================
  preload() {
    this.load.image('hrOfficeStart',
      import.meta.env.BASE_URL + 'assets/backgrounds/HRofficeStatic1.png');
    this.load.spritesheet('hrOfficeAnimation',
      import.meta.env.BASE_URL + 'assets/backgrounds/HRoffice.png',
      { frameWidth: 120, frameHeight: 100 });
    this.load.image('hrOfficeEnd',
      import.meta.env.BASE_URL + 'assets/backgrounds/HRofficeStatic2.png');
  }

  // =====================================
  // INTRODUKTION OG FAST BAGGRUND
  // =====================================
  create() {

    musicManager.setMuffled(true);

    const room = this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'hrOfficeStart');
    room.setScale(Math.min(this.scale.width / 120, this.scale.height / 100));

    // =====================================
    // OVERBLIK OVER MORALE OG MISTANKE
    // =====================================
    this.add.rectangle(12, 12, 210, 108, 0x222222, 0.95).setOrigin(0).setDepth(10);
    this.moraleText = this.add.text(24, 22, '', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffffff'
    }).setDepth(11);
    this.add.rectangle(24, 47, 180, 12, 0x444444).setOrigin(0, 0.5).setDepth(10);
    this.moraleBar = this.add.rectangle(24, 47, 180, 12, 0x55cc77)
      .setOrigin(0, 0.5).setDepth(11);

    this.suspicionText = this.add.text(24, 68, '', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffffff'
    }).setDepth(11);
    this.add.rectangle(24, 97, 180, 12, 0x444444).setOrigin(0, 0.5).setDepth(10);
    this.suspicionBar = this.add.rectangle(24, 97, 180, 12, 0xffaa33)
      .setOrigin(0, 0.5).setDepth(11);
    this.updateOverview();

    if (!this.anims.exists('hr-office-intro')) {
      this.anims.create({
        key: 'hr-office-intro',
        // De sidste fire felter i arket er tomme.
        frames: this.anims.generateFrameNumbers('hrOfficeAnimation', { start: 0, end: 25 }),
        frameRate: 10,
        repeat: 0
      });
    }

    room.once('animationcomplete-hr-office-intro', () => {
      room.setTexture('hrOfficeEnd');
      this.showConversation();
    });

    this.time.delayedCall(500, () => {
      room.play('hr-office-intro');
    });
  }

  // =====================================
  // OPDATERING AF MÅLERNE
  // =====================================
  updateOverview() {
    const morale = this.progression.playerMorale;
    const maxMorale = this.progression.playerMaxMorale;
    const suspicion = this.registry.get('aiBoosters')?.suspicion ?? 0;
    this.moraleText.setText(`MORALE: ${morale} / ${maxMorale}`);
    this.moraleBar.displayWidth = 180 * Phaser.Math.Clamp(morale / maxMorale, 0, 1);
    this.suspicionText.setText(`SUSPICION: ${suspicion} / 100`);
    this.suspicionBar.displayWidth = 180 * Phaser.Math.Clamp(suspicion / 100, 0, 1);
  }

  // =====================================
  // SAMTALE MED HR
  // =====================================
  showConversation() {
    const width = this.scale.width;
    const height = this.scale.height;
    const thirdVisit = this.progression.completedEncounterId === 'necromanager';
    const secondVisit = this.progression.completedEncounterId === 'cardboardMimic' || thirdVisit;
    const dialoguePanel = roundedPanel(this, width / 2, height - 295, 744, 174, 0x1d272f);
    const dialogue = this.add.text(width / 2, height - 295, 'HR\n', {
        fontFamily: 'Arial', fontSize: '18px', color: '#edf1eb',
        lineSpacing: 3,
        align: 'center', wordWrap: { width: 690 }
      }).setOrigin(0.5);

    const updateDialogue = text => {
      dialogue.setText(text);
      const panelHeight = dialogue.height + 32;
      const panelY = height - 210 - panelHeight / 2;
      dialoguePanel.setPanelSize(744, panelHeight).setY(panelY);
      dialogue.setY(panelY);
    };

    const choices = thirdVisit ? [
      {
        text: '(Talk it out +25 Morale) Me? Is it bad?? What did I do?',
        reply: 'I can\'t really say. Go see him - but I\'m sure you\'ll be fine.',
        moraleBoost: 25
      },
      {
        text: 'Meh, I\'ll do it after lunch (Go to lunch)',
        reply: 'Hah! I also stress eat - my wife hates it...',
        leave: true,
        goToLunch: true
      }
    ] : secondVisit ? [
      {
        text: 'I feel like this work environment is a bit... hostile? (+40 Morale)',
        reply: 'WhHaaAt? Impossible. I will talk to someone about this, at some point. '
          + 'Rest assured, I hear you.',
        moraleBoost: 40
      },
      {
        text: 'Go to lunch instead (choose another power)',
        reply: 'Of course. Nothing resolves workplace concerns like a sandwich.',
        leave: true,
        goToLunch: true
      }
    ] : [
      {
        text: 'I just wanted to check out HR. Nice office - are those windows real?',
        reply: 'Of course. The view is part of our benefits package.'
      },
      {
        text: 'I want to talk to you about that Joblin guy.',
        reply: 'I understand. Joblin can be a bit intimidating. I will have a talk with him. '
          + 'But it is a little early to start coming to HR, don\'t you think? '
          + 'Give the workplace a chance. You might settle in just fine.',
        moraleBoost: 5
      },
      { text: 'Nevermind...', reply: 'Of course. My door is always open. During office hours.', leave: true }
    ];
    const choiceButtons = [];
    let speaking = false;
    const showContinue = (onContinue, caption = 'CONTINUE', y = height - 115) => {
      const button = roundedPanel(this, width / 2, y,
        thirdVisit ? 720 : 240, 50, 0x354b4b)
        .setInteractive({ useHandCursor: true });
      button.on('pointerover', () => button.setFillStyle(0x456361));
      button.on('pointerout', () => button.setFillStyle(0x354b4b));
      const label = this.add.text(width / 2, y, caption, {
        fontFamily: 'Arial', fontSize: '20px', color: '#ffffff'
      }).setOrigin(0.5);
      button.once('pointerdown', () => {
        button.disableInteractive();
        button.destroy();
        label.destroy();
        onContinue();
      });
    };
    const leaveHR = (goToLunch = false) => {
      if (goToLunch) {
        this.scene.start('LunchScene', this.progression);
      } else if (secondVisit) {
        this.scene.start('MainScene', {
          encounterId: thirdVisit ? 'ceoOverlord' : 'deadlineDemon',
          encounterIndex: this.progression.nextEncounterIndex,
          playerMorale: this.progression.playerMorale,
          playerMaxMorale: this.progression.playerMaxMorale
        });
      } else {
        speak('Remember to enjoy our free fruits.', () => {
          showContinue(() => {
            this.scene.start('ProgressionScene', { ...this.progression, hrVisited: true });
          });
        });
      }
    };

    // Valgte emner forbliver grå, og alle valg låses under HR's svar.
    const updateChoices = enabled => {
      for (const { button, label, choice } of choiceButtons) {
        button.disableInteractive();
        button.setFillStyle(0x202930);
        label.setColor('#879399');
        if (enabled && !choice.used) {
          button.setInteractive({ useHandCursor: true });
          button.setFillStyle(0x29343d);
          label.setColor('#edf1eb');
        }
      }
    };

    const speak = (message, onComplete) => {
      speaking = true;
      updateChoices(false);
      updateDialogue('HR\n');
      let characterCount = 0;
      this.time.addEvent({
        delay: 25,
        repeat: message.length - 1,
        callback: () => {
          characterCount++;
          updateDialogue(`HR\n${message.slice(0, characterCount)}`);
          if (characterCount === message.length) {
            speaking = false;
            onComplete();
          }
        }
      });
    };

    for (let index = 0; index < choices.length; index++) {
      const choice = choices[index];
      const y = height - 175 + index * 60;
      const button = roundedPanel(this, width / 2, y, 720, 50)
        .setVisible(false);
      const label = this.add.text(width / 2, y, choice.text, {
        fontFamily: 'Arial', fontSize: '16px', color: '#ffffff',
        align: 'center', wordWrap: { width: 690 }
      }).setOrigin(0.5).setVisible(false);
      choiceButtons.push({ button, label, choice });

      button.on('pointerover', () => button.setFillStyle(0x3b5057));
      button.on('pointerout', () => button.setFillStyle(speaking || choice.used ? 0x202930 : 0x29343d));
      button.on('pointerdown', () => {
        if (speaking || choice.used) return;
        choice.used = true;
        const endingConversation = choice.moraleBoost || choice.leave;
        if (endingConversation) {
          for (const entry of choiceButtons) {
            entry.button.setVisible(false);
            entry.label.setVisible(false);
          }
        }

        speak(choice.reply, () => {
          if (choice.leave) {
            if (thirdVisit) {
              showContinue(() => leaveHR(true));
            } else if (!secondVisit) {
              showContinue(() => leaveHR());
            } else {
              // Lad spilleren nå at læse afskeden, inden scenen skifter.
              this.time.delayedCall(1500, () => leaveHR(choice.goToLunch));
            }
          } else if (choice.moraleBoost) {
            const healedMorale = Math.min(choice.moraleBoost,
              this.progression.playerMaxMorale - this.progression.playerMorale);
            this.progression.playerMorale += healedMorale;
            this.updateOverview();
            updateDialogue(`HR\n${choice.reply}\n\n+${healedMorale} Morale`);

            if (thirdVisit) {
              showContinue(() => leaveHR(), 'Go see the CEO', height - 175);
              showContinue(() => this.scene.start('MainMenuScene'),
                'I CANT DO THIS ANYMORE! (Go to main menu)', height - 115);
            } else {
              showContinue(() => leaveHR());
            }
          } else {
            updateChoices(true);
          }
        });
      });
    }

    const greeting = thirdVisit
      ? 'Here we are again, huh? So, I spoke to the higher-ups and, uhm... the boss wants to see you.'
      : secondVisit
      ? 'Good to see you again. Just know that this meeting will make you miss lunch.'
      : 'Ah, the new hire! Nice to meet you. What can I do for you?';
    speak(greeting, () => {
      for (const { button, label } of choiceButtons) {
        button.setVisible(true);
        label.setVisible(true);
      }
      updateChoices(true);
    });
  }
}

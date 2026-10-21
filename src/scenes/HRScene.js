import Phaser from 'phaser';

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
      new URL('../../assets/backgrounds/HRofficeStatic1.png', import.meta.url).href);
    this.load.spritesheet('hrOfficeAnimation',
      new URL('../../assets/backgrounds/HRoffice.png', import.meta.url).href,
      { frameWidth: 120, frameHeight: 100 });
    this.load.image('hrOfficeEnd',
      new URL('../../assets/backgrounds/HRofficeStatic2.png', import.meta.url).href);
  }

  // =====================================
  // INTRODUKTION OG FAST BAGGRUND
  // =====================================
  create() {
    const room = this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'hrOfficeStart');
    room.setScale(Math.min(this.scale.width / 120, this.scale.height / 100));

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
  // SAMTALE MED HR
  // =====================================
  showConversation() {
    const width = this.scale.width;
    const height = this.scale.height;
    const secondVisit = this.progression.completedEncounterId === 'cardboardMimic';
    const dialogue = this.add.text(width / 2, height - 260, 'HR\n', {
        fontFamily: 'Arial', fontSize: '18px', color: '#ffffff',
        backgroundColor: '#222222', padding: { x: 16, y: 12 },
        align: 'center', wordWrap: { width: 660 }
      }).setOrigin(0.5);

    const choices = secondVisit ? [
      {
        text: 'I feel like this work environment is a bit... hostile? (+40 Morale)',
        reply: 'WhHaaAt? Impossible. I will talk to someone about this, at some point. '
          + 'Rest assured, I hear you.',
        moraleBoost: 40
      },
      {
        text: 'Go to lunch instead',
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
    const leaveHR = (goToLunch = false) => {
      if (goToLunch) {
        this.scene.start('LunchScene', this.progression);
      } else if (secondVisit) {
        this.scene.start('MainScene', {
          encounterId: 'deadlineDemon',
          encounterIndex: this.progression.nextEncounterIndex,
          playerMorale: this.progression.playerMorale,
          playerMaxMorale: this.progression.playerMaxMorale
        });
      } else {
        this.scene.start('ProgressionScene', { ...this.progression, hrVisited: true });
      }
    };

    // Valgte emner forbliver grå, og alle valg låses under HR's svar.
    const updateChoices = enabled => {
      for (const { button, label, choice } of choiceButtons) {
        button.disableInteractive();
        button.setFillStyle(0x222222);
        label.setColor('#888888');
        if (enabled && !choice.used) {
          button.setInteractive({ useHandCursor: true });
          button.setFillStyle(0x333333);
          label.setColor('#ffffff');
        }
      }
    };

    const speak = (message, onComplete) => {
      speaking = true;
      updateChoices(false);
      dialogue.setText('HR\n');
      let characterCount = 0;
      this.time.addEvent({
        delay: 25,
        repeat: message.length - 1,
        callback: () => {
          characterCount++;
          dialogue.setText(`HR\n${message.slice(0, characterCount)}`);
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
      const button = this.add.rectangle(width / 2, y, 720, 50, 0x333333)
        .setStrokeStyle(2, 0xffffff)
        .setVisible(false);
      const label = this.add.text(width / 2, y, choice.text, {
        fontFamily: 'Arial', fontSize: '16px', color: '#ffffff',
        align: 'center', wordWrap: { width: 690 }
      }).setOrigin(0.5).setVisible(false);
      choiceButtons.push({ button, label, choice });

      button.on('pointerover', () => button.setFillStyle(0x555555));
      button.on('pointerout', () => button.setFillStyle(speaking || choice.used ? 0x222222 : 0x333333));
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
            // Lad spilleren nå at læse afskeden, inden scenen skifter.
            this.time.delayedCall(1500, () => leaveHR(choice.goToLunch));
          } else if (choice.moraleBoost) {
            const healedMorale = Math.min(choice.moraleBoost,
              this.progression.playerMaxMorale - this.progression.playerMorale);
            this.progression.playerMorale += healedMorale;
            dialogue.setText(`HR\n${choice.reply}\n\n+${healedMorale} Morale`);

            const continueButton = this.add.rectangle(width / 2, height - 115,
              240, 50, 0x333333).setStrokeStyle(2, 0xffffff)
              .setInteractive({ useHandCursor: true });
            this.add.text(width / 2, height - 115, 'CONTINUE', {
              fontFamily: 'Arial', fontSize: '20px', color: '#ffffff'
            }).setOrigin(0.5);
            continueButton.once('pointerdown', () => {
              continueButton.disableInteractive();
              leaveHR();
            });
          } else {
            updateChoices(true);
          }
        });
      });
    }

    const greeting = secondVisit
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

import Phaser from 'phaser';
import roundedPanel from '../ui/roundedPanel.js';

export default class LunchScene extends Phaser.Scene {
  constructor() {
    super('LunchScene');
  }

  init(data = {}) {
    this.progression = data;
  }

  // =====================================
  // INDLÆSNING AF LOKALE OG FRUGT
  // =====================================
  preload() {
    // Import the room asset so Vite includes it in the production build.
    this.load.image('lunchRoom',
      import.meta.env.BASE_URL + 'assets/backgrounds/Frokost Stue.png');
    this.load.image('apple', import.meta.env.BASE_URL + 'assets/Food/Apple.png');
    this.load.image('banana', import.meta.env.BASE_URL + 'assets/Food/Banana.png');
    this.load.image('pear', import.meta.env.BASE_URL + 'assets/Food/Pear.png');
    this.load.spritesheet('mysteriousColleague',
      import.meta.env.BASE_URL + 'assets/mobs/Extras/MystCol.png',
      { frameWidth: 64, frameHeight: 64 });
  }

  // =====================================
  // FROKOSTLOKALE OG MORALE
  // =====================================
  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const secondVisit = this.progression.completedEncounterId === 'cardboardMimic';
    const thirdVisit = this.progression.completedEncounterId === 'necromanager';
    const boosters = this.registry.get('aiBoosters') ?? { suspicion: 0 };
    const unlockedPowers = boosters.unlockedPowers ?? (boosters.selectedPower ? [boosters.selectedPower] : []);

    const background = this.add.image(width / 2, height / 2, 'lunchRoom');
    background.setScale(width / background.width);

    this.add.rectangle(width / 2, 90, 220, 16, 0x333333).setStrokeStyle(2, 0xffffff);
    const moraleBar = this.add.rectangle(width / 2 - 110, 90, 220, 16, 0x55cc77)
      .setOrigin(0, 0.5);
    moraleBar.displayWidth = 220 * Phaser.Math.Clamp(
      this.progression.playerMorale / this.progression.playerMaxMorale, 0, 1);

    const moraleText = this.add.text(width / 2, 120,
      `MORALE: ${this.progression.playerMorale} / ${this.progression.playerMaxMorale}`, {
        fontSize: '20px',
        color: '#ffff88',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

    // =====================================
    // FRUGT PÅ BORDENE
    // =====================================
    // Positionerne følger baggrundens oprindelige størrelse på 160 x 80 pixels.
    const tableSpots = [{ x: 20, y: 44 }, { x: 27, y: 44 }, { x: 45, y: 44 }, { x: 52, y: 44 }];
    const deskSpots = [{ x: 127, y: 33 }, { x: 139, y: 33 }, { x: 151, y: 33 }];
    Phaser.Utils.Array.Shuffle(tableSpots);
    Phaser.Utils.Array.Shuffle(deskSpots);
    const fruitSpots = [tableSpots.pop(), deskSpots.pop(),
      ...Phaser.Utils.Array.Shuffle([...tableSpots, ...deskSpots])];
    const fruitTypes = ['apple', 'banana', 'pear'];
    const fruitCount = Phaser.Math.Between(3, 5);
    const roomLeft = background.x - background.displayWidth / 2;
    const roomTop = background.y - background.displayHeight / 2;

    for (const spot of fruitSpots.slice(0, fruitCount)) {
      const fruit = this.add.image(
        roomLeft + (spot.x + Phaser.Math.Between(-1, 1)) * background.scaleX,
        roomTop + spot.y * background.scaleY,
        Phaser.Utils.Array.GetRandom(fruitTypes)
      ).setDisplaySize(48, 48).setOrigin(0.5, 0.85)
        .setInteractive({ useHandCursor: true, pixelPerfect: true });

      fruit.once('pointerdown', () => {
        const score = this.registry.get('campaignScore')
          ?? { damage: 0, suspicionGained: 0, interventions: 0, retries: 0, fruitFound: false, boxFound: false };
        score.fruitFound = true;
        this.registry.set('campaignScore', score);
        this.progression.playerMorale = Math.min(this.progression.playerMaxMorale,
          this.progression.playerMorale + 2);
        moraleText.setText(`MORALE: ${this.progression.playerMorale} / ${this.progression.playerMaxMorale}`);
        moraleBar.displayWidth = 220 * Phaser.Math.Clamp(
          this.progression.playerMorale / this.progression.playerMaxMorale, 0, 1);
        const feedback = this.add.text(width / 2 + 130, 90, '+2', {
          fontFamily: 'Arial', fontSize: '20px', fontStyle: 'bold', color: '#ffff00'
        }).setOrigin(0, 0.5).setDepth(10);
        this.tweens.add({
          targets: feedback, y: 65, alpha: 0, duration: 800,
          onComplete: () => feedback.destroy()
        });
        fruit.destroy();
      });
    }

    // =====================================
    // DEN MYSTISKE KOLLEGA
    // =====================================
    if (!this.anims.exists('mysterious-colleague-idle')) {
      this.anims.create({
        key: 'mysterious-colleague-idle',
        frames: this.anims.generateFrameNumbers('mysteriousColleague', { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1
      });
    }
    if (!thirdVisit) {
      // Bordpladens midte er y=43,5; figuren har 12 gennemsigtige pixels under fødderne.
      this.add.sprite(170, roomTop + 43.5 * background.scaleY + 12 * 2, 'mysteriousColleague')
        .setOrigin(0.5, 1).setScale(2).play('mysterious-colleague-idle');
    }

    const dialoguePanel = roundedPanel(this, width / 2, height - 245, 680, 140, 0x1d272f)
      .setVisible(!thirdVisit);
    const dialogue = this.add.text(width / 2, height - 245, '', {
      fontSize: '16px',
      color: '#edf1eb',
      lineSpacing: 4,
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 620 }
    }).setOrigin(0.5).setVisible(!thirdVisit);

    const updateDialogue = text => {
      dialogue.setText(text);
      const panelHeight = dialogue.height + 32;
      const panelY = height - 175 - panelHeight / 2;
      dialoguePanel.setPanelSize(680, panelHeight).setY(panelY);
      dialogue.setY(panelY);
    };

    // Stop den forrige skriveeffekt, hvis spilleren vælger et svar undervejs.
    let dialogueTimer = null;
    const typeDialogue = message => {
      if (thirdVisit) return;
      dialogueTimer?.remove();
      updateDialogue('MYSTERIOUS COLLEAGUE\n');
      let characterCount = 0;
      dialogueTimer = this.time.addEvent({
        delay: 25,
        repeat: message.length - 1,
        callback: () => {
          characterCount++;
          updateDialogue(`MYSTERIOUS COLLEAGUE\n${message.slice(0, characterCount)}`);
        }
      });
    };
    typeDialogue(secondVisit
      ? 'Hey there, fellow "workhorse". Have you had time to use ClawedIMP?\nTry the other power. You can keep both.'
      : 'Hey there, new guy. Heard of the new AI made by Beta?\nIt’s called ClawedIMP.\nJust keep it quiet. The Supervisor notices.');

    // =====================================
    // VALG AF AI-EVNE
    // =====================================
    const powers = [
      { id: 'bestMove', uses: 2, title: 'BEST MOVE', text: 'Finds and automatically plays\nthe best available match.\n+3 damage. +20 Suspicion per use.' },
      { id: 'moraleBoost', uses: 3, title: 'MORALE BOOST', text: '+10 Morale. +10 Suspicion.' }
    ];
    if (thirdVisit) {
      powers.push({ id: 'tileSwap', uses: 1, title: 'TILE SWAP', text: 'Drag any tile onto another to swap them.\nUses your turn. +15 Suspicion.', keepTurn: false });
    }
    const choiceButtons = [];
    const choiceLabels = [];

    for (let index = 0; index < powers.length; index++) {
      const power = powers[index];
      const x = thirdVisit ? width / 2 : width / 2 + (index === 0 ? -170 : 170);
      const y = thirdVisit ? height - 320 + index * 95 : height - 125;
      const choiceButton = roundedPanel(this, x, y, thirdVisit ? 600 : 320, 90)
        .setInteractive({ useHandCursor: true });
      const choiceLabel = this.add.text(x, y,
        `${power.title}\n${power.text}\n${power.uses} use(s) per fight.${power.keepTurn === false ? '' : ' Keep your turn.'}`, {
          fontSize: '13px', color: '#edf1eb', fontFamily: 'Arial', align: 'center', lineSpacing: 2
        }).setOrigin(0.5);
      choiceButtons.push(choiceButton);
      choiceLabels.push(choiceLabel);
      if (unlockedPowers.includes(power.id) || this.progression.lunchChoiceMade) {
        choiceButton.disableInteractive().setFillStyle(0x202930);
        choiceLabel.setColor('#888888');
        if (unlockedPowers.includes(power.id)) choiceLabel.setText(`${power.title} UNLOCKED`);
      }

      choiceButton.on('pointerover', () => choiceButton.setFillStyle(0x3b5057));
      choiceButton.on('pointerout', () => choiceButton.setFillStyle(0x29343d));
      choiceButton.on('pointerdown', () => {
        if (this.progression.lunchChoiceMade || unlockedPowers.includes(power.id)) return;
        this.progression.lunchChoiceMade = true;
        boosters.unlocked = true;
        boosters.selectedPower = power.id;
        boosters.unlockedPowers = [...unlockedPowers, power.id];
        this.registry.set('aiBoosters', boosters);
        choiceButtons.forEach(button => button.disableInteractive().setFillStyle(0x202930));
        choiceButton.setFillStyle(0x354b4b).setStrokeStyle(2, 0x95b9a4);
        choiceLabels[index].setText(`${power.title} SELECTED`);
        typeDialogue(`Your AI power is ready. ${power.uses} use(s) per fight.\nYou keep your turn, but the Supervisor notices.`);
      });
    }

    // =====================================
    // FORTSÆT TIL NÆSTE KAMP
    // =====================================
    const button = roundedPanel(this, width / 2, height - 50, 220, 44, 0x354b4b)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height - 50, 'CONTINUE', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.on('pointerover', () => button.setFillStyle(0x456361));
    button.on('pointerout', () => button.setFillStyle(0x354b4b));
    button.on('pointerdown', () => {
      if (!this.progression.lunchChoiceMade) {
        typeDialogue('Choose an AI power before returning to work.');
        return;
      }
      button.disableInteractive();
      this.scene.start('MainScene', {
        encounterId: thirdVisit ? 'ceoOverlord' : secondVisit ? 'deadlineDemon' : 'printosaurus',
        encounterIndex: this.progression.nextEncounterIndex,
        playerMorale: this.progression.playerMorale,
        playerMaxMorale: this.progression.playerMaxMorale
      });
    });
  }
}

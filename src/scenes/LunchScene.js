import Phaser from 'phaser';

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
      new URL('../../assets/backgrounds/Frokost Stue.png', import.meta.url).href);
    this.load.image('apple', new URL('../../assets/Food/Apple.png', import.meta.url).href);
    this.load.image('banana', new URL('../../assets/Food/Banana.png', import.meta.url).href);
    this.load.image('pear', new URL('../../assets/Food/Pear.png', import.meta.url).href);
  }

  // =====================================
  // FROKOSTLOKALE OG MORALE
  // =====================================
  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    const background = this.add.image(width / 2, height / 2, 'lunchRoom');
    background.setScale(width / background.width);

    this.add.text(width / 2, 70, 'LUNCH BREAK', {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

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
        this.progression.playerMorale = Math.min(this.progression.playerMaxMorale,
          this.progression.playerMorale + 2);
        moraleText.setText(`MORALE: ${this.progression.playerMorale} / ${this.progression.playerMaxMorale}`);
        fruit.destroy();
      });
    }

    // =====================================
    // DEN MYSTISKE KOLLEGA
    // =====================================
    // Silhuetten bruges, indtil kollegaen har sin egen grafik.
    this.add.circle(170, height / 2 - 15, 18, 0x111111);
    this.add.rectangle(170, height / 2 + 25, 38, 55, 0x111111);

    const dialogue = this.add.text(width / 2, height - 205,
      'MYSTERIOUS COLLEAGUE\nHey there, new guy. Heard of the new AI made by Beta?\nIt’s called ClawedIMP.\nJust keep it quiet. The Supervisor notices.', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#222222',
      fontFamily: 'Arial',
      align: 'center',
      padding: { x: 12, y: 10 },
      wordWrap: { width: 620 }
    }).setOrigin(0.5);

    // =====================================
    // VALG AF AI-EVNE
    // =====================================
    const powers = [
      { id: 'bestMove', uses: 2, title: 'BEST MOVE', text: 'Finds and automatically plays\nthe best available match.\n+3 damage. +15 Suspicion per use.' },
      { id: 'moraleBoost', uses: 3, title: 'MORALE BOOST', text: '+10 Morale. Suspicion = healing.' }
    ];
    const choiceButtons = [];
    const choiceLabels = [];

    for (let index = 0; index < powers.length; index++) {
      const power = powers[index];
      const x = width / 2 + (index === 0 ? -170 : 170);
      const choiceButton = this.add.rectangle(x, height - 115, 320, 82, 0x555555)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });
      const choiceLabel = this.add.text(x, height - 115,
        `${power.title}\n${power.text}\n${power.uses} use(s) per fight. Keep your turn.`, {
          fontSize: '13px', color: '#ffffff', fontFamily: 'Arial', align: 'center'
        }).setOrigin(0.5);
      choiceButtons.push(choiceButton);
      choiceLabels.push(choiceLabel);

      choiceButton.on('pointerdown', () => {
        const boosters = this.registry.get('aiBoosters') ?? { suspicion: 0 };
        boosters.unlocked = true;
        boosters.selectedPower = power.id;
        this.registry.set('aiBoosters', boosters);
        choiceButtons.forEach(button => button.disableInteractive());
        choiceLabels[index].setText(`${power.title} SELECTED`);
        dialogue.setText(`Your AI power is ready. ${power.uses} use(s) per fight.\nYou keep your turn, but the Supervisor notices.`);
      });
    }

    const selectedPower = this.registry.get('aiBoosters')?.selectedPower;
    if (selectedPower) {
      choiceButtons.forEach(button => button.disableInteractive());
      const index = powers.findIndex(power => power.id === selectedPower);
      if (index >= 0) choiceLabels[index].setText(`${powers[index].title} SELECTED`);
    }

    // =====================================
    // FORTSÆT TIL NÆSTE KAMP
    // =====================================
    const button = this.add.rectangle(width / 2, height - 50, 220, 44, 0x555555)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height - 50, 'CONTINUE', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.on('pointerover', () => button.setFillStyle(0x777777));
    button.on('pointerout', () => button.setFillStyle(0x555555));
    button.on('pointerdown', () => {
      if (!this.registry.get('aiBoosters')?.selectedPower) {
        dialogue.setText('Choose an AI power before returning to work.');
        return;
      }
      button.disableInteractive();
      this.scene.start('MainScene', {
        encounterId: 'printosaurus',
        encounterIndex: this.progression.nextEncounterIndex,
        playerMorale: this.progression.playerMorale,
        playerMaxMorale: this.progression.playerMaxMorale
      });
    });
  }
}

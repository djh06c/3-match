import Phaser from 'phaser';

export default class LunchScene extends Phaser.Scene {
  constructor() {
    super('LunchScene');
  }

  init(data = {}) {
    this.progression = data;
  }

  preload() {
    // Import the room asset so Vite includes it in the production build.
    this.load.image('lunchRoom',
      new URL('../../assets/backgrounds/Frokost Stue.png', import.meta.url).href);
  }

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

    this.add.text(width / 2, 120,
      `MORALE: ${this.progression.playerMorale} / ${this.progression.playerMaxMorale}`, {
        fontSize: '20px',
        color: '#ffff88',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

    // A silhouette stands in for the mysterious character until their art exists.
    this.add.circle(170, height / 2 - 15, 18, 0x111111);
    this.add.rectangle(170, height / 2 + 25, 38, 55, 0x111111);

    const dialogue = this.add.text(width / 2, height - 185,
      'MYSTERIOUS COLLEAGUE\nAI and its incredible uses...\nChoose one power. But remember: the Supervisor notices.', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#222222',
      fontFamily: 'Arial',
      align: 'center',
      padding: { x: 12, y: 10 },
      wordWrap: { width: 620 }
    }).setOrigin(0.5);

    const powers = [
      { id: 'bestMove', uses: 1, title: 'BEST MOVE', text: 'Free swap. +20 Suspicion.' },
      { id: 'moraleBoost', uses: 3, title: 'MORALE BOOST', text: '+10 Morale. Suspicion = healing.' }
    ];
    const choiceButtons = [];
    const choiceLabels = [];

    for (let index = 0; index < powers.length; index++) {
      const power = powers[index];
      const x = width / 2 + (index === 0 ? -170 : 170);
      const choiceButton = this.add.rectangle(x, height - 115, 320, 62, 0x555555)
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

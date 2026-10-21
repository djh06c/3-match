
export default class HowToPlayPopup {
    constructor(scene) {
        this.scene = scene;
        this.currentPage = 0;

        this.pages = [
            { image: 'tutorial1', text: 'Swap adjacent tiles to creates matches of 3 or more' },
            { image: 'tutorial2', text: 'Every time you make a match, you damage the enemy based on the match - the bigger the match, the more damage' },
            { image: 'tutorial3', text: 'Match three or more identical tiles.' },
            { image: 'tutorial4', text: 'Matches deal damage to enemies.' },
            { image: 'tutorial5', text: 'Larger matches deal more damage.' },
            { image: 'tutorial6', text: 'Chain reactions create additional damage.' },
            { image: 'tutorial7', text: 'Watch your health and plan your moves.' },
            { image: 'tutorial8', text: 'Defeat your enemies to win!' }
        ];

        this.container = null;
    }

    open() {
        if (this.container) return;

        const { width, height } = this.scene.scale;

        this.currentPage = 0;

        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(1000);

        const overlay = this.scene.add.rectangle(
            width / 2, height / 2,
            width, height, 0x000000, 0.75
        ).setInteractive();

        const panel = this.scene.add.rectangle(
            width / 2, height / 2,
            650, 560, 0x222b3a
        ).setStrokeStyle(4, 0xffffff);

        const title = this.scene.add.text(
            width / 2, height / 2 - 245,
            'HOW TO PLAY',
            { fontSize: '28px', color: '#ffffff' }
        ).setOrigin(0.5);

        this.image = this.scene.add.image(
            width / 2, height / 2 - 65,
            this.pages[0].image
        );

        this.image.setDisplaySize(540, 300);

        this.description = this.scene.add.text(
            width / 2, height / 2 + 135,
            '',
            {
                fontSize: '18px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 550 }
            }
        ).setOrigin(0.5);

        this.pageCounter = this.scene.add.text(
            width / 2, height / 2 + 235,
            '',
            { fontSize: '20px', color: '#ffffff' }
        ).setOrigin(0.5);

        const left = this.createButton(
            width / 2 - 180,
            height / 2 + 235,
            '<',
            () => this.previousPage()
        );

        const right = this.createButton(
            width / 2 + 180,
            height / 2 + 235,
            '>',
            () => this.nextPage()
        );

        const close = this.createButton(
            width / 2 + 285,
            height / 2 - 245,
            'X',
            () => this.close()
        );

        this.container.add([
            overlay, panel, title,
            this.image, this.description,
            this.pageCounter, left, right, close
        ]);

        this.escapeKey = this.scene.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.ESC
        );

        this.escapeHandler = () => this.close();
        this.escapeKey?.on('down', this.escapeHandler);

        this.updatePage();
    }

    createButton(x, y, label, callback) {
        const button = this.scene.add.text(x, y, label, {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#44546a',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        button.on('pointerdown', callback);
        return button;
    }

    updatePage() {
        const page = this.pages[this.currentPage];

        this.image.setTexture(page.image);
        this.image.setDisplaySize(540, 300);

        this.description.setText(page.text);
        this.pageCounter.setText(
            `${this.currentPage + 1} / ${this.pages.length}`
        );
    }

    nextPage() {
        this.currentPage =
            (this.currentPage + 1) % this.pages.length;
        this.updatePage();
    }

    previousPage() {
        this.currentPage =
            (this.currentPage - 1 + this.pages.length)
            % this.pages.length;
        this.updatePage();
    }

    close() {
        if (!this.container) return;

        this.escapeKey?.off('down', this.escapeHandler);
        this.container.destroy();
        this.container = null;
    }
}

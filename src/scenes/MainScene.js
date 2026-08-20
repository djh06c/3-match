import Phaser from 'phaser';
import Match3Grid from '../game/Match3Grid.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  create() {
    this.tileSize = 64;
    this.boardOffsetX = 140;
    this.boardOffsetY = 110;

    this.tileColors = [
      0x8b5cf6, // lilla
      0x06b6d4, // cyan
      0x22c55e, // grøn
      0xf59e0b, // orange
      0xef4444, // rød
      0xe5e7eb  // lys grå
    ];

    this.tileLabels = ['CO', 'EM', 'XL', 'FD', 'PC', 'LP'];
    // Coffee, Email, Excel, Folder, PaperClip, Laptop

    this.selectedCell = null;

    this.grid = new Match3Grid(8, 8, 6);
    this.grid.generateGrid();

    this.titleText = this.add.text(20, 20, 'Corporate Crush - Match-3 Prototype', {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.infoText = this.add.text(
      20,
      55,
      'Klik på 2 nabo-brikker for at bytte dem',
      {
        fontSize: '16px',
        color: '#dddddd'
      }
    );

    this.statusText = this.add.text(20, 80, 'Board klar.', {
      fontSize: '16px',
      color: '#ffff88'
    });

    this.boardContainer = this.add.container(0, 0);

    this.renderBoard();

    console.log('Grid genereret:');
    console.table(this.grid.cells);
  }

  renderBoard() {
    this.boardContainer.removeAll(true);

    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        const value = this.grid.cells[r][c];
        const x = this.boardOffsetX + c * this.tileSize + this.tileSize / 2;
        const y = this.boardOffsetY + r * this.tileSize + this.tileSize / 2;

        const isSelected =
          this.selectedCell &&
          this.selectedCell.row === r &&
          this.selectedCell.col === c;

        const rect = this.add.rectangle(
          x,
          y,
          this.tileSize - 4,
          this.tileSize - 4,
          this.tileColors[value]
        );

        rect.setStrokeStyle(isSelected ? 4 : 2, isSelected ? 0xffff00 : 0x111111);
        rect.setInteractive();

        rect.on('pointerdown', () => {
          this.handleTileClick(r, c);
        });

        const label = this.add.text(x, y, this.tileLabels[value], {
          fontSize: '18px',
          color: '#111111',
          fontStyle: 'bold'
        });
        label.setOrigin(0.5);

        this.boardContainer.add(rect);
        this.boardContainer.add(label);
      }
    }
  }

  handleTileClick(row, col) {
    if (!this.selectedCell) {
      this.selectedCell = { row, col };
      this.statusText.setText(`Valgt felt: (${row}, ${col})`);
      this.renderBoard();
      return;
    }

    const first = this.selectedCell;

    // Klik på samme igen = fjern valg
    if (first.row === row && first.col === col) {
      this.selectedCell = null;
      this.statusText.setText('Valg fjernet.');
      this.renderBoard();
      return;
    }

    // Kun naboer må byttes
    if (!this.grid.areAdjacent(first.row, first.col, row, col)) {
      this.selectedCell = { row, col };
      this.statusText.setText('Vælg en nabo-brik.');
      this.renderBoard();
      return;
    }

    const success = this.grid.trySwap(first.row, first.col, row, col);
    this.selectedCell = null;

    if (!success) {
      this.statusText.setText('Ingen match - bytte blev annulleret.');
      this.renderBoard();
      return;
    }

    let chainCount = 0;

    while (true) {
      const matches = this.grid.findMatches();

      if (matches.length === 0) {
        break;
      }

      chainCount++;
      console.log(`Chain ${chainCount}:`, matches);
      this.grid.collapseAndRefill(matches);
    }

    this.renderBoard();

    if (!this.grid.hasValidMoves()) {
      this.statusText.setText(`Match lavet! Chain count: ${chainCount}. Ingen gyldige træk tilbage.`);
    } else {
      this.statusText.setText(`Match lavet! Chain count: ${chainCount}.`);
    }

    console.table(this.grid.cells);
  }
}
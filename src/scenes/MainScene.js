import Phaser from 'phaser';
import Match3Board from '../game/Match3Board.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image(
      'coffee',
      '/assets/icons/Kaffe.png'
    );

    this.load.image(
      'email',
      '/assets/icons/Email.png'
    );

    this.load.image(
      'laptop',
      '/assets/icons/Laptop.png'
    );

    this.load.image(
      'notebook',
      '/assets/icons/Notesbog.png'
    );

    this.load.image(
      'phone',
      '/assets/icons/Telefon.png'
    );

    this.load.image(
      'clock',
      '/assets/icons/Ur.png'
    );
  }

  create() {
    const width =
      this.scale.width;

    // =====================================
    // TOP / BATTLE AREA
    // =====================================

    this.topAreaHeight = 240;

    this.add.rectangle(
      width / 2,
      this.topAreaHeight / 2,
      width,
      this.topAreaHeight,
      0x3a3a3a
    );

    this.add.text(
      width / 2,
      55,
      'BATTLE AREA PLACEHOLDER',
      {
        fontSize: '22px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    // Player placeholder
    this.add.rectangle(
      width * 0.25,
      155,
      90,
      110,
      0x4f6fad
    );

    this.add.text(
      width * 0.25,
      155,
      'PLAYER',
      {
        fontSize: '16px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    // Enemy placeholder
    this.add.rectangle(
      width * 0.75,
      155,
      90,
      110,
      0x9b3d3d
    );

    this.add.text(
      width * 0.75,
      155,
      'ENEMY',
      {
        fontSize: '16px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    // Skillelinje
    this.add.rectangle(
      width / 2,
      this.topAreaHeight,
      width,
      4,
      0xffffff
    );

    // =====================================
    // STATUS
    // =====================================

    this.statusText =
      this.add.text(
        width / 2,
        this.topAreaHeight + 15,
        'Board klar.',
        {
          fontSize: '16px',
          color: '#ffff88'
        }
      )
      .setOrigin(0.5);

    // =====================================
    // BOARD
    // =====================================

    const tileSize = 52;

    const boardWidth =
      8 * tileSize;

    const boardX =
      (width - boardWidth) / 2;

    const boardY =
      this.topAreaHeight + 40;

    this.board =
      new Match3Board(
        this,
        {
          x: boardX,
          y: boardY,

          rows: 8,
          cols: 8,

          colorCount: 6,

          tileSize,

          iconSize: 32,

          tileTextures: [
            'coffee',
            'email',
            'laptop',
            'notebook',
            'phone',
            'clock'
          ],

          tileColors: [
            0x8b5cf6,
            0x06b6d4,
            0x22c55e,
            0xf59e0b,
            0xef4444,
            0xe5e7eb
          ],

          onStateChange:
            state => {
              this.handleBoardState(
                state
              );
            },

          onMoveComplete:
            result => {
              this.handleMoveComplete(
                result
              );
            }
        }
      );
  }

  // =====================================
  // BOARD STATE
  // =====================================

  handleBoardState(state) {
    switch (state) {
      case 'SWAPPING':
        this.statusText.setText(
          'Bytter...'
        );
        break;

      case 'SWAP_BACK':
        this.statusText.setText(
          'Ugyldigt træk.'
        );
        break;

      case 'REMOVING':
        this.statusText.setText(
          'Match!'
        );
        break;

      case 'FALLING':
        this.statusText.setText(
          'Tiles falder...'
        );
        break;
    }
  }

  // =====================================
  // MOVE RESULT
  // =====================================

  handleMoveComplete(result) {
    if (!result.valid) {
      this.statusText.setText(
        'Ingen match - prøv igen.'
      );

      return;
    }

    if (!result.hasValidMoves) {
      this.statusText.setText(
        `Chain x${result.chains} - ingen mulige træk!`
      );

      return;
    }

    if (result.chains > 1) {
      this.statusText.setText(
        `Chain x${result.chains}! ` +
        `${result.totalMatched} tiles fjernet.`
      );

      return;
    }

    this.statusText.setText(
      `${result.totalMatched} tiles matchet.`
    );

    console.log(
      'Move result:',
      result
    );
  }
}
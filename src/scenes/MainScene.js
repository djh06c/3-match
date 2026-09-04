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

    this.load.image(
      'match3Background',
      '/assets/backgrounds/Baggrund-match3-2.0.png'
    );
  }

  create() {
    const width = this.scale.width;

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
    // MATCH-3 BACKGROUND
    // =====================================

    const match3Background = this.add.image(
      width / 2,
      this.topAreaHeight + 230,
      'match3Background'
    );

    match3Background.setScale(4);
    match3Background.setDepth(0);

    // =====================================
    // MATCH HISTORY / TOP 9
    // =====================================

    this.matchHistory = [];

    /*
     * Midten af history-panelet.
     *
     * Hvis hele teksten senere skal
     * lidt til højre/venstre,
     * ændrer du kun denne værdi.
     */
    const historyCenterX = 704;

    // -------------------------
    // Titel
    // -------------------------

    this.matchHistoryTitle = this.add.text(
      historyCenterX,
      this.topAreaHeight + 60,
      'MATCHES',
      {
        fontSize: '16px',
        color: '#000000',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(10);

    // -------------------------
    // 9 match-rækker
    // -------------------------

    this.matchHistoryTexts = [];

    /*
     * Hver række i pixel-art:
     *
     * 5 source-pixels høj
     *
     * Background scale = 4
     *
     * 5 * 4 = 20 game-pixels
     */
    const firstMatchY =
      this.topAreaHeight + 86;

    const matchRowSpacing = 24;

    for (let i = 0; i < 9; i++) {
      const matchText =
        this.add.text(
          historyCenterX,
          firstMatchY +
            i * matchRowSpacing,
          '',
          {
            fontSize: '12px',
            color: '#000000',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
          }
        )
          .setOrigin(0.5)
          .setDepth(10);

      this.matchHistoryTexts.push(
        matchText
      );
    }

    // =====================================
    // STATUS
    // =====================================

    this.statusText = this.add.text(
      width / 2,
      this.topAreaHeight + 10,
      'Board klar.',
      {
        fontSize: '16px',
        color: '#ffff88'
      }
    )
      .setOrigin(0.5)
      .setDepth(10);

    // =====================================
    // BOARD
    // =====================================

    const tileSize = 52;

    const boardWidth =
      8 * tileSize;

    const boardX =
      (width - boardWidth) / 2;

    const boardY =
      this.topAreaHeight + 22;

    this.board = new Match3Board(
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

    this.board.container.setDepth(5);
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

      case 'GAME_OVER':
        this.statusText.setText(
          'GAME OVER'
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

    this.addMatchesToHistory(
      result
    );

    if (!result.hasValidMoves) {
      this.statusText.setText(
        `Chain x${result.chains} - GAME OVER`
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

  // =====================================
  // MATCH HISTORY
  // =====================================

  addMatchesToHistory(result) {
    const tileNames = [
      'Kaffe',
      'Email',
      'Laptop',
      'Notesbog',
      'Telefon',
      'Ur'
    ];

    for (
      const chainData
      of result.matches
    ) {
      const mergedMatches =
        this.mergeConnectedMatches(
          chainData.matches
        );

      for (
        const match
        of mergedMatches
      ) {
        this.matchHistory.push({
          chain:
            chainData.chain,

          amount:
            match.cells.length,

          type:
            tileNames[
              match.tileValue
            ] ?? 'Ukendt'
        });
      }
    }

    this.renderMatchHistory();
  }

  // =====================================
  // MERGE OVERLAPPING MATCHES
  // =====================================

  mergeConnectedMatches(matches) {
    const groups = [];

    for (
      const match
      of matches
    ) {
      const cellKeys =
        new Set(
          match.cells.map(
            cell =>
              `${cell.row},${cell.col}`
          )
        );

      const overlappingGroups =
        groups.filter(
          group =>
            group.tileValue ===
              match.tileValue &&
            this.setsOverlap(
              group.cellKeys,
              cellKeys
            )
        );

      if (
        overlappingGroups.length === 0
      ) {
        groups.push({
          tileValue:
            match.tileValue,

          cellKeys:
            new Set(
              cellKeys
            )
        });

        continue;
      }

      const mainGroup =
        overlappingGroups[0];

      for (
        const key
        of cellKeys
      ) {
        mainGroup.cellKeys.add(
          key
        );
      }

      for (
        let i = 1;
        i < overlappingGroups.length;
        i++
      ) {
        const extraGroup =
          overlappingGroups[i];

        for (
          const key
          of extraGroup.cellKeys
        ) {
          mainGroup.cellKeys.add(
            key
          );
        }

        const index =
          groups.indexOf(
            extraGroup
          );

        if (
          index !== -1
        ) {
          groups.splice(
            index,
            1
          );
        }
      }
    }

    return groups.map(
      group => {
        const cells =
          Array.from(
            group.cellKeys
          ).map(key => {
            const [
              row,
              col
            ] =
              key
                .split(',')
                .map(Number);

            return {
              row,
              col
            };
          });

        return {
          tileValue:
            group.tileValue,

          cells
        };
      }
    );
  }

  // =====================================
  // CHECK SET OVERLAP
  // =====================================

  setsOverlap(
    firstSet,
    secondSet
  ) {
    for (
      const value
      of firstSet
    ) {
      if (
        secondSet.has(
          value
        )
      ) {
        return true;
      }
    }

    return false;
  }

  // =====================================
  // RENDER TOP 9 MATCHES
  // =====================================

  renderMatchHistory() {
    /*
     * Største match først.
     *
     * Hvis to matches har samme størrelse,
     * kommer højeste chain først.
     *
     * Kun top 9 vises.
     */
    const topMatches =
      this.matchHistory
        .slice()
        .sort(
          (a, b) => {
            if (
              b.amount !==
              a.amount
            ) {
              return (
                b.amount -
                a.amount
              );
            }

            return (
              b.chain -
              a.chain
            );
          }
        )
        .slice(
          0,
          9
        );

    for (
      let i = 0;
      i < this.matchHistoryTexts.length;
      i++
    ) {
      const textObject =
        this.matchHistoryTexts[i];

      const match =
        topMatches[i];

      if (!match) {
        textObject.setText('');
        continue;
      }

      textObject.setText(
        `${match.amount}x ${match.type}`
      );
    }
  }

  // =====================================
  // CLEAR HISTORY
  // =====================================

  clearMatchHistory() {
    this.matchHistory = [];

    this.renderMatchHistory();
  }
}
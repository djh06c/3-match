import Phaser from 'phaser';
import Match3Grid from './Match3Grid.js';

export default class Match3Board {
  constructor(scene, config = {}) {
    this.scene = scene;

    // =====================================
    // OPSÆTNING
    // =====================================

    this.rows = config.rows ?? 8;
    this.cols = config.cols ?? 8;
    this.colorCount = config.colorCount ?? 6;

    this.tileSize = config.tileSize ?? 52;
    this.iconSize = config.iconSize ?? 32;

    this.x = config.x ?? 0;
    this.y = config.y ?? 0;

    this.onMoveComplete =
      config.onMoveComplete ?? null;

    this.onStateChange =
      config.onStateChange ?? null;

    // =====================================
    // TILSTAND
    // =====================================

    this.state = 'IDLE';

    this.selectedCell = null;

    // Drag state
    this.pointerDown = false;
    this.dragStartTile = null;
    this.dragSwapTriggered = false;

    // =====================================
    // BRIKKERNES UDSEENDE
    // =====================================

    this.tileColors =
      config.tileColors ?? [
        0x8b5cf6,
        0x06b6d4,
        0x22c55e,
        0xf59e0b,
        0xef4444,
        0xe5e7eb
      ];

    this.tileTextures =
      config.tileTextures ?? [
        'coffee',
        'email',
        'laptop',
        'notebook',
        'phone',
        'clock'
      ];

    // =====================================
    // DET LOGISKE SPILLEBRÆT
    // =====================================

    this.grid = new Match3Grid(
      this.rows,
      this.cols,
      this.colorCount
    );

    this.grid.generateGrid();

    // =====================================
    // PHASER-OBJEKTER
    // =====================================

    this.container =
      this.scene.add.container(
        0,
        0
      );

    // =====================================
    // AFGRÆNSNING AF SPILLEBRÆTTET
    // =====================================

    /*
     * Masken gør, at tiles kun kan ses
     * inde i selve match-3-boardets område.
     *
     * Tiles kan derfor godt eksistere over
     * eller under boardet under animationer,
     * men de bliver først synlige, når de
     * bevæger sig ind i dette rektangel.
     */

    this.boardMaskShape =
      this.scene.make.graphics({
        x: 0,
        y: 0,
        add: false
      });

    this.boardMaskShape.fillStyle(
      0xffffff
    );

    this.boardMaskShape.fillRect(
      this.x,
      this.y,
      this.cols * this.tileSize,
      this.rows * this.tileSize
    );

    this.boardMask =
      this.boardMaskShape.createGeometryMask();

    this.container.setMask(
      this.boardMask
    );

    // =====================================
    // TILES GRAFIK
    // =====================================

    this.tileViews =
      Array.from(
        {
          length: this.rows
        },
        () =>
          Array(
            this.cols
          ).fill(null)
      );

    this.createInitialTiles();

    // Hvis pointer bliver sluppet
    // udenfor en tile.
    this.scene.input.on(
      'pointerup',
      () => {
        if (
          this.pointerDown &&
          !this.dragSwapTriggered
        ) {
          this.resetPointerState();
        }
      }
    );
  }

  // =====================================
  // TILSTAND
  // =====================================

  // =====================================
  // INK PÅ BRIKKERNE
  // =====================================
  coverTilesWithInk(count) {
    this.clearInk();
    const tiles = this.tileViews.flat().filter(tile => tile);

    for (let index = 0; index < count && tiles.length > 0; index++) {
      const randomIndex = Phaser.Math.Between(0, tiles.length - 1);
      const tile = tiles.splice(randomIndex, 1)[0];
      const ink = this.scene.add.image(0, 0, 'inkStain');
      ink.setDisplaySize(this.tileSize - 4, this.tileSize - 4);
      tile.icon?.setVisible(false);
      // Attach ink to the tile so it follows swaps and falling tiles.
      tile.add(ink);
      tile.ink = ink;
    }
    this.updateSelectionVisuals();
  }

  clearInk() {
    for (const tile of this.tileViews.flat()) {
      if (tile?.ink) {
        tile.ink.destroy();
        tile.ink = null;
        tile.icon?.setVisible(true);
      }
    }
    this.updateSelectionVisuals();
  }

  setState(state) {
    this.state = state;

    if (this.onStateChange) {
      this.onStateChange(
        state
      );
    }
  }

  // =====================================
  // OPRETTELSE AF DE FØRSTE TILES
  // =====================================

  createInitialTiles() {
    for (
      let row = 0;
      row < this.rows;
      row++
    ) {
      for (
        let col = 0;
        col < this.cols;
        col++
      ) {
        const value =
          this.grid.cells
            [row]
            [col];

        const position =
          this.getCellPosition(
            row,
            col
          );

        const tile =
          this.createTileView(
            value,
            row,
            col,
            position.x,
            position.y
          );

        this.tileViews
          [row]
          [col] = tile;
      }
    }
  }

  // =====================================
  // OPRETTELSE AF EN TILE
  // =====================================

  createTileView(
    value,
    row,
    col,
    x,
    y
  ) {
    const tile =
      this.scene.add.container(
        x,
        y
      );

    tile.gridRow = row;
    tile.gridCol = col;
    tile.tileValue = value;

    // =====================================
    // BAGGRUND OG RAMME
    // =====================================

    const background =
      this.scene.add.rectangle(
        0,
        0,
        this.tileSize - 4,
        this.tileSize - 4,
        0x111111,
        0.20
      );

    background.setStrokeStyle(
      3,
      this.tileColors[value]
    );

    tile.border = background;

    tile.add(
      background
    );

    // =====================================
    // IKON
    // =====================================

    const texture =
      this.tileTextures[
        value
      ];

    if (
      this.scene.textures.exists(
        texture
      )
    ) {
      const icon =
        this.scene.add.image(
          0,
          0,
          texture
        );

      icon.setDisplaySize(
        this.iconSize,
        this.iconSize
      );

      tile.icon = icon;

      tile.add(
        icon
      );
    } else {
      const fallback =
        this.scene.add.text(
          0,
          0,
          `${value}`,
          {
            fontSize: '18px',
            color: '#ffffff'
          }
        );

      fallback.setOrigin(
        0.5
      );

      tile.add(
        fallback
      );
    }

    // =====================================
    // KLIKOMRÅDE
    // =====================================

    const hitZone =
      this.scene.add.rectangle(
        0,
        0,
        this.tileSize - 6,
        this.tileSize - 6,
        0xffffff,
        0
      );

    hitZone.setInteractive({
      useHandCursor: true
    });

    tile.hitZone =
      hitZone;

    tile.add(
      hitZone
    );

    hitZone.on(
      'pointerdown',
      pointer => {
        this.handlePointerDown(
          tile,
          pointer
        );
      }
    );

    hitZone.on(
      'pointerover',
      pointer => {
        this.handlePointerOver(
          tile,
          pointer
        );
      }
    );

    hitZone.on(
      'pointerup',
      pointer => {
        this.handlePointerUp(
          tile,
          pointer
        );
      }
    );

    this.container.add(
      tile
    );

    return tile;
  }

  // =====================================
  // PLACERING
  // =====================================

  getCellPosition(
    row,
    col
  ) {
    return {
      x:
        this.x +
        col * this.tileSize +
        this.tileSize / 2,

      y:
        this.y +
        row * this.tileSize +
        this.tileSize / 2
    };
  }

  // =====================================
  // MUS OG BERØRING
  // =====================================

  handlePointerDown(
    tile,
    pointer
  ) {
    if (
      this.state !== 'IDLE'
    ) {
      return;
    }

    this.pointerDown = true;
    this.dragStartTile = tile;
    this.dragSwapTriggered = false;
  }

  async handlePointerOver(
    tile,
    pointer
  ) {
    if (
      !this.pointerDown ||
      !this.dragStartTile ||
      this.dragSwapTriggered ||
      this.state !== 'IDLE'
    ) {
      return;
    }

    const start =
      this.dragStartTile;

    if (
      start === tile
    ) {
      return;
    }

    if (
      !this.grid.areAdjacent(
        start.gridRow,
        start.gridCol,
        tile.gridRow,
        tile.gridCol
      )
    ) {
      return;
    }

    this.dragSwapTriggered =
      true;

    this.selectedCell =
      null;

    this.updateSelectionVisuals();

    await this.performSwap(
      start.gridRow,
      start.gridCol,
      tile.gridRow,
      tile.gridCol
    );

    this.resetPointerState();
  }

  async handlePointerUp(
    tile,
    pointer
  ) {
    if (
      !this.pointerDown
    ) {
      return;
    }

    if (
      this.dragSwapTriggered
    ) {
      this.resetPointerState();
      return;
    }

    const clickedTile =
      this.dragStartTile;

    this.resetPointerState();

    if (
      !clickedTile
    ) {
      return;
    }

    await this.handleTileClick(
      clickedTile.gridRow,
      clickedTile.gridCol
    );
  }

  resetPointerState() {
    this.pointerDown = false;
    this.dragStartTile = null;
    this.dragSwapTriggered = false;
  }

  // =====================================
  // BYT BRIKKER MED KLIK
  // =====================================

  async handleTileClick(
    row,
    col
  ) {
    if (
      this.state !== 'IDLE'
    ) {
      return;
    }

    if (
      !this.selectedCell
    ) {
      this.selectedCell = {
        row,
        col
      };

      this.updateSelectionVisuals();

      return;
    }

    const first =
      this.selectedCell;

    if (
      first.row === row &&
      first.col === col
    ) {
      this.selectedCell =
        null;

      this.updateSelectionVisuals();

      return;
    }

    if (
      !this.grid.areAdjacent(
        first.row,
        first.col,
        row,
        col
      )
    ) {
      this.selectedCell = {
        row,
        col
      };

      this.updateSelectionVisuals();

      return;
    }

    this.selectedCell =
      null;

    this.updateSelectionVisuals();

    await this.performSwap(
      first.row,
      first.col,
      row,
      col
    );
  }

  // =====================================
  // FÆLLES BRIKBYT
  // =====================================

  async performSwap(
    firstRow,
    firstCol,
    secondRow,
    secondCol
  ) {
    if (
      this.state !== 'IDLE'
    ) {
      return;
    }

    this.setState(
      'SWAPPING'
    );

    const tileA =
      this.tileViews
        [firstRow]
        [firstCol];

    const tileB =
      this.tileViews
        [secondRow]
        [secondCol];

    if (
      !tileA ||
      !tileB
    ) {
      this.setState(
        'IDLE'
      );

      return;
    }

    // =====================================
    // ANIMERET BRIKBYT
    // =====================================

    await this.animateSwap(
      tileA,
      tileB
    );

    // =====================================
    // LOGISK BRIKBYT
    // =====================================

    const success =
      this.grid.trySwap(
        firstRow,
        firstCol,
        secondRow,
        secondCol
      );

    // =====================================
    // UGYLDIGT TRÆK
    // =====================================

    if (
      !success
    ) {
      this.setState(
        'SWAP_BACK'
      );

      await this.animateSwap(
        tileA,
        tileB
      );

      this.setState(
        'IDLE'
      );

      if (
        this.onMoveComplete
      ) {
        this.onMoveComplete({
          valid: false,
          chains: 0,
          totalMatched: 0,
          matches: []
        });
      }

      return;
    }

    // =====================================
    // OPDATERING AF BRIKKERNES GRAFIK
    // =====================================

    this.tileViews
      [firstRow]
      [firstCol] = tileB;

    this.tileViews
      [secondRow]
      [secondCol] = tileA;

    this.updateTilePositionData(
      tileB,
      firstRow,
      firstCol
    );

    this.updateTilePositionData(
      tileA,
      secondRow,
      secondCol
    );

    // =====================================
    // AFVIKLING AF MATCH
    // =====================================

    await this.resolveBoard();
  }

  // =====================================
  // MARKERING AF VALGTE BRIKKER
  // =====================================

  updateSelectionVisuals() {
    for (
      let row = 0;
      row < this.rows;
      row++
    ) {
      for (
        let col = 0;
        col < this.cols;
        col++
      ) {
        const tile =
          this.tileViews
            [row]
            [col];

        if (
          !tile
        ) {
          continue;
        }

        const selected =
          this.selectedCell &&
          this.selectedCell.row ===
            row &&
          this.selectedCell.col ===
            col;

        tile.border.setStrokeStyle(
          selected
            ? 5
            : 3,

          tile.ink
            ? 0x000000
            : selected
            ? 0xffff00
            : this.tileColors[
                tile.tileValue
              ]
        );
      }
    }
  }

  // =====================================
  // ANIMATION AF BRIKBYT
  // =====================================

  async animateSwap(
    tileA,
    tileB
  ) {
    const a = {
      x: tileA.x,
      y: tileA.y
    };

    const b = {
      x: tileB.x,
      y: tileB.y
    };

    await Promise.all([
      this.tween(
        tileA,
        {
          x: b.x,
          y: b.y,
          duration: 140,
          ease:
            'Quad.easeInOut'
        }
      ),

      this.tween(
        tileB,
        {
          x: a.x,
          y: a.y,
          duration: 140,
          ease:
            'Quad.easeInOut'
        }
      )
    ]);
  }

  // =====================================
  // AFVIKLING AF SPILLEBRÆTTET
  // =====================================

  async resolveBoard() {
    let chainCount = 0;
    let totalMatched = 0;

    const allMatches = [];

    while (true) {
      const matches =
        this.grid.findMatches();

      if (
        matches.length === 0
      ) {
        break;
      }

      chainCount++;

      const uniqueCells =
        this.getUniqueMatchCells(
          matches
        );

      totalMatched +=
        uniqueCells.length;

      // Gem tile-typen før tiles bliver fjernet.
      const matchesWithTypes =
        matches.map(match => {
          const firstCell =
            match.cells[0];

          const tileValue =
            this.grid.cells
              [firstCell.row]
              [firstCell.col];

          return {
            ...match,
            tileValue
          };
        });

      allMatches.push({
        chain:
          chainCount,

        matches:
          matchesWithTypes
      });

      // =====================================
      // FJERNELSE AF MATCHEDE BRIKKER
      // =====================================

      this.setState(
        'REMOVING'
      );

      await this.animateMatches(
        matches
      );

      // =====================================
      // FALD OG GENOPFYLDNING
      // =====================================

      const changes =
        this.grid.collapseAndRefill(
          matches
        );

      this.setState(
        'FALLING'
      );

      await this.animateCollapseAndRefill(
        changes
      );

      await this.pause(
        60
      );
    }

    const hasValidMoves =
      this.grid.hasValidMoves();

    // =====================================
    // SPILLET ER SLUT
    // =====================================

    if (
      !hasValidMoves
    ) {
      this.setState(
        'GAME_OVER_FALL'
      );

      await this.playGameOverDrop();

      this.setState(
        'GAME_OVER'
      );
    } else {
      this.setState(
        'IDLE'
      );
    }

    if (
      this.onMoveComplete
    ) {
      this.onMoveComplete({
        valid: true,

        chains:
          chainCount,

        totalMatched,

        matches:
          allMatches,

        hasValidMoves
      });
    }
  }

  // =====================================
  // ANIMATION AF MATCH
  // =====================================

  async animateMatches(
    matches
  ) {
    const cells =
      this.getUniqueMatchCells(
        matches
      );

    const targets = [];

    for (
      const cell
      of cells
    ) {
      const tile =
        this.tileViews
          [cell.row]
          [cell.col];

      if (
        tile
      ) {
        targets.push(
          tile
        );
      }
    }

    if (
      targets.length === 0
    ) {
      return;
    }

    // Lille pop
    await this.tween(
      targets,
      {
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 70,
        ease:
          'Quad.easeOut'
      }
    );

    // Forsvind
    await this.tween(
      targets,
      {
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 110,
        ease:
          'Back.easeIn'
      }
    );

    // Destroy matched tiles
    for (
      const cell
      of cells
    ) {
      const tile =
        this.tileViews
          [cell.row]
          [cell.col];

      if (
        !tile
      ) {
        continue;
      }

      tile.destroy();

      this.tileViews
        [cell.row]
        [cell.col] = null;
    }
  }

  // =====================================
  // FALD OG GENOPFYLDNING
  // =====================================

  async animateCollapseAndRefill(
    changes
  ) {
    const newViews =
      Array.from(
        {
          length:
            this.rows
        },
        () =>
          Array(
            this.cols
          ).fill(null)
      );

    const moveMap =
      new Map();

    for (
      const movement
      of changes.moved
    ) {
      moveMap.set(
        `${movement.fromRow},${movement.col}`,
        movement
      );
    }

    const animations = [];

    // =====================================
    // EKSISTERENDE BRIKKER
    // =====================================

    for (
      let row = 0;
      row < this.rows;
      row++
    ) {
      for (
        let col = 0;
        col < this.cols;
        col++
      ) {
        const tile =
          this.tileViews
            [row]
            [col];

        if (
          !tile
        ) {
          continue;
        }

        const movement =
          moveMap.get(
            `${row},${col}`
          );

        const targetRow =
          movement
            ? movement.toRow
            : row;

        newViews
          [targetRow]
          [col] = tile;

        this.updateTilePositionData(
          tile,
          targetRow,
          col
        );

        if (
          movement
        ) {
          const target =
            this.getCellPosition(
              targetRow,
              col
            );

          const distance =
            Math.abs(
              movement.toRow -
              movement.fromRow
            );

          animations.push(
            this.tween(
              tile,
              {
                x:
                  target.x,

                y:
                  target.y,

                duration:
                  150 +
                  distance *
                    35,

                ease:
                  'Cubic.easeIn'
              }
            )
          );
        }
      }
    }

    // =====================================
    // NYE BRIKKER
    // =====================================

    for (
      const spawn
      of changes.spawned
    ) {
      const start =
        this.getCellPosition(
          spawn.fromRow,
          spawn.col
        );

      const end =
        this.getCellPosition(
          spawn.toRow,
          spawn.col
        );

      const tile =
        this.createTileView(
          spawn.value,
          spawn.toRow,
          spawn.col,
          start.x,
          start.y
        );

      newViews
        [spawn.toRow]
        [spawn.col] =
        tile;

      const distance =
        spawn.toRow -
        spawn.fromRow;

      animations.push(
        this.tween(
          tile,
          {
            x:
              end.x,

            y:
              end.y,

            duration:
              170 +
              distance *
                35,

            ease:
              'Cubic.easeIn'
          }
        )
      );
    }

    this.tileViews =
      newViews;

    await Promise.all(
      animations
    );

    // Reset visuelle properties
    for (
      let row = 0;
      row < this.rows;
      row++
    ) {
      for (
        let col = 0;
        col < this.cols;
        col++
      ) {
        const tile =
          this.tileViews
            [row]
            [col];

        if (
          !tile
        ) {
          continue;
        }

        tile.setScale(
          1
        );

        tile.setAlpha(
          1
        );
      }
    }
  }

  // =====================================
  // BRIKKERNES FALD VED SPILSTART
  // =====================================

  async playInitialDrop(endState = 'IDLE') {
    /*
     * Boardet låses mens tiles falder ind.
     */
    this.setState(
      'FALLING'
    );

    const animations = [];

    for (
      let row = 0;
      row < this.rows;
      row++
    ) {
      for (
        let col = 0;
        col < this.cols;
        col++
      ) {
        const tile =
          this.tileViews
            [row]
            [col];

        if (
          !tile
        ) {
          continue;
        }

        const target =
          this.getCellPosition(
            row,
            col
          );

        /*
         * Tiles starter fysisk over boardet.
         *
         * Board-masken sørger for, at de
         * IKKE kan ses deroppe.
         */
        tile.y =
          this.y -
          this.tileSize *
            (
              this.rows -
              row +
              2
            );

        animations.push(
          this.tween(
            tile,
            {
              y:
                target.y,

              duration:
                350 +
                row * 35,

              delay:
                col * 25,

              ease:
                'Cubic.easeIn'
            }
          )
        );
      }
    }

    await Promise.all(
      animations
    );

    this.setState(
      endState
    );
  }

  // =====================================
  // BRIKKERNES FALD VED NEDERLAG
  // =====================================

  async playGameOverDrop() {
    const animations = [];

    for (
      let row = 0;
      row < this.rows;
      row++
    ) {
      for (
        let col = 0;
        col < this.cols;
        col++
      ) {
        const tile =
          this.tileViews
            [row]
            [col];

        if (
          !tile
        ) {
          continue;
        }

        animations.push(
          this.tween(
            tile,
            {
              /*
               * Flyt tilen langt ned.
               *
               * Så snart den forlader
               * board-masken, bliver den
               * usynlig.
               */
              y:
                tile.y +
                600,

              duration:
                450 +
                row * 25,

              delay:
                col * 18,

              ease:
                'Cubic.easeIn'
            }
          )
        );
      }
    }

    await Promise.all(
      animations
    );
  }

  // =====================================
  // HJÆLPEFUNKTIONER
  // =====================================

  updateTilePositionData(
    tile,
    row,
    col
  ) {
    tile.gridRow =
      row;

    tile.gridCol =
      col;
  }

  getUniqueMatchCells(
    matches
  ) {
    const map =
      new Map();

    for (
      const match
      of matches
    ) {
      for (
        const cell
        of match.cells
      ) {
        map.set(
          `${cell.row},${cell.col}`,
          cell
        );
      }
    }

    return Array.from(
      map.values()
    );
  }

  tween(
    targets,
    config
  ) {
    return new Promise(
      resolve => {
        this.scene.tweens.add({
          targets,
          ...config,
          onComplete:
            resolve
        });
      }
    );
  }

  pause(
    milliseconds
  ) {
    return new Promise(
      resolve => {
        this.scene.time.delayedCall(
          milliseconds,
          resolve
        );
      }
    );
  }
}

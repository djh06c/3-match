export default class Match3Grid {
  constructor(rows, cols, colorCount) {
    this.rows = rows;
    this.cols = cols;
    this.colorCount = colorCount;

    this.cells = [];

    // Hvor kraftigt boardets nuværende fordeling
    // påvirker sandsynligheden.
    //
    // 0 = helt tilfældigt
    // 1 = moderat balancing
    // 2+ = stærkere balancing
    this.weightStrength = 1.0;

    // En tile må aldrig få mindre end denne vægt.
    // Ellers kan en type næsten forsvinde helt.
    this.minimumWeight = 0.15;
  }

  // =====================================================
  // GENERATION
  // =====================================================

  generateGrid() {
    let attempts = 0;

    do {
      this.cells = [];

      for (let row = 0; row < this.rows; row++) {
        const newRow = [];

        for (let col = 0; col < this.cols; col++) {
          let color;

          do {
            color = this.randomColor();
          } while (
            this.wouldCreateInitialMatch(
              row,
              col,
              color,
              newRow
            )
          );

          newRow.push(color);
        }

        this.cells.push(newRow);
      }

      attempts++;
    } while (
      !this.hasValidMoves() &&
      attempts < 100
    );
  }

  // =====================================================
  // WEIGHTED TILE SELECTION
  // =====================================================

  randomColor() {
    const counts = this.getColorCounts();

    const totalTiles =
      counts.reduce(
        (sum, count) => sum + count,
        0
      );

    // Når boardet endnu er tomt,
    // brug normal random.
    if (totalTiles === 0) {
      return Math.floor(
        Math.random() * this.colorCount
      );
    }

    const expectedAmount =
      totalTiles / this.colorCount;

    const weights = [];

    for (
      let color = 0;
      color < this.colorCount;
      color++
    ) {
      const count = counts[color];

      /*
       * count < expectedAmount
       *      -> større chance
       *
       * count > expectedAmount
       *      -> mindre chance
       *
       * Eksempel:
       *
       * Ur:      16 tiles -> lavere weight
       * Kaffe:    7 tiles -> højere weight
       */

      const difference =
        (count - expectedAmount) /
        Math.max(expectedAmount, 1);

      let weight =
        Math.exp(
          -this.weightStrength *
          difference
        );

      weight = Math.max(
        this.minimumWeight,
        weight
      );

      weights.push(weight);
    }

    return this.pickWeightedColor(
      weights
    );
  }

  getColorCounts() {
    const counts =
      Array(this.colorCount).fill(0);

    for (const row of this.cells) {
      for (const value of row) {
        if (
          value !== null &&
          value !== undefined
        ) {
          counts[value]++;
        }
      }
    }

    return counts;
  }

  pickWeightedColor(weights) {
    const totalWeight =
      weights.reduce(
        (sum, weight) =>
          sum + weight,
        0
      );

    let roll =
      Math.random() * totalWeight;

    for (
      let color = 0;
      color < weights.length;
      color++
    ) {
      roll -= weights[color];

      if (roll <= 0) {
        return color;
      }
    }

    // Sikkerheds-fallback
    return weights.length - 1;
  }

  // =====================================================
  // INITIAL MATCH PREVENTION
  // =====================================================

  wouldCreateInitialMatch(
    row,
    col,
    color,
    currentRow
  ) {
    if (
      col >= 2 &&
      currentRow[col - 1] === color &&
      currentRow[col - 2] === color
    ) {
      return true;
    }

    if (
      row >= 2 &&
      this.cells[row - 1][col] === color &&
      this.cells[row - 2][col] === color
    ) {
      return true;
    }

    return false;
  }

  // =====================================================
  // BASIC HELPERS
  // =====================================================

  inBounds(row, col) {
    return (
      row >= 0 &&
      row < this.rows &&
      col >= 0 &&
      col < this.cols
    );
  }

  areAdjacent(
    r1,
    c1,
    r2,
    c2
  ) {
    const rowDifference =
      Math.abs(r1 - r2);

    const colDifference =
      Math.abs(c1 - c2);

    return (
      rowDifference +
      colDifference ===
      1
    );
  }

  swapCells(
    r1,
    c1,
    r2,
    c2
  ) {
    const temp =
      this.cells[r1][c1];

    this.cells[r1][c1] =
      this.cells[r2][c2];

    this.cells[r2][c2] =
      temp;
  }

  // =====================================================
  // SWAP VALIDATION
  // =====================================================

  matchesContainEitherCell(
    matches,
    r1,
    c1,
    r2,
    c2
  ) {
    return matches.some(
      match =>
        match.cells.some(
          cell =>
            (
              cell.row === r1 &&
              cell.col === c1
            ) ||
            (
              cell.row === r2 &&
              cell.col === c2
            )
        )
    );
  }

  trySwap(
    r1,
    c1,
    r2,
    c2
  ) {
    if (
      !this.inBounds(r1, c1) ||
      !this.inBounds(r2, c2)
    ) {
      return false;
    }

    if (
      !this.areAdjacent(
        r1,
        c1,
        r2,
        c2
      )
    ) {
      return false;
    }

    this.swapCells(
      r1,
      c1,
      r2,
      c2
    );

    const matches =
      this.findMatches();

    const valid =
      this.matchesContainEitherCell(
        matches,
        r1,
        c1,
        r2,
        c2
      );

    if (!valid) {
      this.swapCells(
        r1,
        c1,
        r2,
        c2
      );

      return false;
    }

    return true;
  }

  // =====================================================
  // FIND MATCHES
  // =====================================================

  findMatches() {
    const matches = [];

    // -------------------------
    // Horizontal
    // -------------------------

    for (
      let row = 0;
      row < this.rows;
      row++
    ) {
      let col = 0;

      while (col < this.cols) {
        const color =
          this.cells[row][col];

        let length = 1;

        while (
          col + length <
            this.cols &&
          this.cells[row]
            [col + length] ===
            color
        ) {
          length++;
        }

        if (
          color !== null &&
          length >= 3
        ) {
          const cells = [];

          for (
            let i = 0;
            i < length;
            i++
          ) {
            cells.push({
              row,
              col: col + i
            });
          }

          matches.push({
            color,
            length,
            direction:
              'horizontal',
            cells
          });
        }

        col += length;
      }
    }

    // -------------------------
    // Vertical
    // -------------------------

    for (
      let col = 0;
      col < this.cols;
      col++
    ) {
      let row = 0;

      while (row < this.rows) {
        const color =
          this.cells[row][col];

        let length = 1;

        while (
          row + length <
            this.rows &&
          this.cells
            [row + length][col] ===
            color
        ) {
          length++;
        }

        if (
          color !== null &&
          length >= 3
        ) {
          const cells = [];

          for (
            let i = 0;
            i < length;
            i++
          ) {
            cells.push({
              row: row + i,
              col
            });
          }

          matches.push({
            color,
            length,
            direction:
              'vertical',
            cells
          });
        }

        row += length;
      }
    }

    return matches;
  }

  // =====================================================
  // COLLAPSE + REFILL
  // =====================================================

  collapseAndRefill(matches) {
    const matchedCells =
      new Set();

    for (const match of matches) {
      for (
        const cell of match.cells
      ) {
        matchedCells.add(
          `${cell.row},${cell.col}`
        );
      }
    }

    const removed = [];

    for (
      const key of matchedCells
    ) {
      const [row, col] =
        key
          .split(',')
          .map(Number);

      removed.push({
        row,
        col,
        value:
          this.cells[row][col]
      });

      this.cells[row][col] =
        null;
    }

    const moved = [];
    const spawned = [];

    // -------------------------
    // Gravity
    // -------------------------

    for (
      let col = 0;
      col < this.cols;
      col++
    ) {
      let writeRow =
        this.rows - 1;

      for (
        let row =
          this.rows - 1;
        row >= 0;
        row--
      ) {
        const value =
          this.cells[row][col];

        if (value === null) {
          continue;
        }

        if (row !== writeRow) {
          this.cells
            [writeRow][col] =
            value;

          this.cells[row][col] =
            null;

          moved.push({
            fromRow: row,
            toRow: writeRow,
            col,
            value
          });
        }

        writeRow--;
      }

      // -------------------------
      // Weighted refill
      // -------------------------

      for (
        let row = writeRow;
        row >= 0;
        row--
      ) {
        const value =
          this.randomColor();

        this.cells[row][col] =
          value;

        const fromRow =
          row - writeRow - 1;

        spawned.push({
          fromRow,
          toRow: row,
          col,
          value
        });
      }
    }

    return {
      removed,
      moved,
      spawned
    };
  }

  // =====================================================
  // VALID MOVE CHECK
  // =====================================================

  hasValidMoves() {
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
        // Kun højre og ned,
        // ellers tjekker vi hvert par
        // to gange.
        const neighbours = [
          [row, col + 1],
          [row + 1, col]
        ];

        for (
          const [
            otherRow,
            otherCol
          ] of neighbours
        ) {
          if (
            !this.inBounds(
              otherRow,
              otherCol
            )
          ) {
            continue;
          }

          this.swapCells(
            row,
            col,
            otherRow,
            otherCol
          );

          const matches =
            this.findMatches();

          const valid =
            this.matchesContainEitherCell(
              matches,
              row,
              col,
              otherRow,
              otherCol
            );

          this.swapCells(
            row,
            col,
            otherRow,
            otherCol
          );

          if (valid) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
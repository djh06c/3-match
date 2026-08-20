export default class Match3Grid {
  constructor(rows, cols, colorCount) {
    this.rows = rows;
    this.cols = cols;
    this.colorCount = colorCount;
    this.cells = [];
  }

  generateGrid() {
    this.cells = [];

    for (let r = 0; r < this.rows; r++) {
      const row = [];

      for (let c = 0; c < this.cols; c++) {
        let color;
        do {
          color = this.randomColor();
        } while (this.wouldCreateInitialMatch(r, c, color, row));

        row.push(color);
      }

      this.cells.push(row);
    }
  }

  randomColor() {
    return Math.floor(Math.random() * this.colorCount);
  }

  wouldCreateInitialMatch(r, c, color, currentRow) {
    if (c >= 2) {
      if (currentRow[c - 1] === color && currentRow[c - 2] === color) {
        return true;
      }
    }

    if (r >= 2) {
      if (
        this.cells[r - 1][c] === color &&
        this.cells[r - 2][c] === color
      ) {
        return true;
      }
    }

    return false;
  }

  inBounds(r, c) {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
  }

  areAdjacent(r1, c1, r2, c2) {
    const rowDiff = Math.abs(r1 - r2);
    const colDiff = Math.abs(c1 - c2);
    return rowDiff + colDiff === 1;
  }

  swapCells(r1, c1, r2, c2) {
    const temp = this.cells[r1][c1];
    this.cells[r1][c1] = this.cells[r2][c2];
    this.cells[r2][c2] = temp;
  }

  trySwap(r1, c1, r2, c2) {
    if (!this.inBounds(r1, c1) || !this.inBounds(r2, c2)) {
      return false;
    }

    if (!this.areAdjacent(r1, c1, r2, c2)) {
      return false;
    }

    this.swapCells(r1, c1, r2, c2);

    const matches = this.findMatches();

    if (matches.length === 0) {
      this.swapCells(r1, c1, r2, c2);
      return false;
    }

    return true;
  }

  findMatches() {
    const matches = [];

    for (let r = 0; r < this.rows; r++) {
      let c = 0;

      while (c < this.cols) {
        const color = this.cells[r][c];
        let length = 1;

        while (
          c + length < this.cols &&
          this.cells[r][c + length] === color
        ) {
          length++;
        }

        if (color !== null && length >= 3) {
          const groupCells = [];
          for (let i = 0; i < length; i++) {
            groupCells.push({ row: r, col: c + i });
          }

          matches.push({
            color,
            length,
            direction: 'horizontal',
            cells: groupCells
          });
        }

        c += length;
      }
    }

    for (let c = 0; c < this.cols; c++) {
      let r = 0;

      while (r < this.rows) {
        const color = this.cells[r][c];
        let length = 1;

        while (
          r + length < this.rows &&
          this.cells[r + length][c] === color
        ) {
          length++;
        }

        if (color !== null && length >= 3) {
          const groupCells = [];
          for (let i = 0; i < length; i++) {
            groupCells.push({ row: r + i, col: c });
          }

          matches.push({
            color,
            length,
            direction: 'vertical',
            cells: groupCells
          });
        }

        r += length;
      }
    }

    return matches;
  }

  collapseAndRefill(matches) {
    const matchedSet = new Set();

    for (const match of matches) {
      for (const cell of match.cells) {
        matchedSet.add(`${cell.row},${cell.col}`);
      }
    }

    for (const key of matchedSet) {
      const [r, c] = key.split(',').map(Number);
      this.cells[r][c] = null;
    }

    for (let c = 0; c < this.cols; c++) {
      let writeRow = this.rows - 1;

      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.cells[r][c] !== null) {
          this.cells[writeRow][c] = this.cells[r][c];
          writeRow--;
        }
      }

      for (let r = writeRow; r >= 0; r--) {
        this.cells[r][c] = this.randomColor();
      }
    }
  }

  hasValidMoves() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const directions = [
          [0, 1],
          [1, 0]
        ];

        for (const [dr, dc] of directions) {
          const nr = r + dr;
          const nc = c + dc;

          if (!this.inBounds(nr, nc)) continue;

          this.swapCells(r, c, nr, nc);
          const matches = this.findMatches();
          this.swapCells(r, c, nr, nc);

          if (matches.length > 0) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
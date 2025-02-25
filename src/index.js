import "./style.css";

export class Ship {
  constructor(length = 2, orientation = "stern left") {
    this.hits = 0;
    this.length = length;
    this.orientation = orientation;
  }

  hit() {
    this.hits++;
  }

  isSunk() {
    if (this.hits >= this.length) {
      return true;
    }
    return false;
  }
}

export class Gameboard {
    constructor(length = 9, width = 9) {
        this.rows = length;
        this.columns = width;
        this.board = [];

        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.columns; j++) {
                this.board[i].push(new Cell());
            }
        }
    }
}

export class Cell {
    constructor() {
        this.testProperty = "";
    }
}
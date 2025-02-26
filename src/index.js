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
  constructor(length = 9, width = 9, shipCount = 5) {
    this.rows = length;
    this.columns = width;
    this.players = [new Player(), new Player()];
    this.shipCount = shipCount;
    this.board = [];
    
    this.createBoard();
    this.createShips();
  }

  createBoard() {
    for (let i = 0; i < this.rows; i++) {
      this.board[i] = [];
      for (let j = 0; j < this.columns; j++) {
        this.board[i].push(new Cell());
      }
    }
  }

  createShips() {
    this.players.forEach(player => {
      for (let i = 0; i < this.shipCount; i++) {
        player.ships.push(new Ship());
      }
    })
  }
}

export class Cell {
  constructor(type = "Ocean") {
    this.type = type;
  }
}

export class Player {
  constructor(playerType = "Human") {
    this.type = playerType;
    this.ships = [];
  }
}

import "./style.css";

export class Ship {
  constructor(length = 2, orientation = "stern left") {
    this.hits = 0;
    this.length = length;
    // Ships are oriented with their stern pointing either left or up.
    this.orientation = orientation;
  }

  hit() {
    this.hits++;
  }

  setLocation(coordinates) {
    this.location = coordinates;
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
    this.placeShips();
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

  placeShips() {
    this.players.forEach(player => {
      player.ships.forEach(ship => {
        const place = this.getFirstLegalPosition(ship);
        ship.setLocation(place);
        // TODO: Set board cells to Ship type.
      })
    })
  }

  getFirstLegalPosition(ship) {
    // Find the first cell where the ship fits.
    // A ship can be oriented with its stern pointing left or up.
    // A ship's location refers only to the cell containing the ship's stern.
    // Find the first cell that has ship.length free tiles to the right or below.
  }
}

export class Cell {
  constructor(type = "Ocean") {
    this.setType(type);
  }

  setType(type) {
    this.type = type;
  }
}

export class Player {
  constructor(playerType = "Human") {
    this.type = playerType;
    this.ships = [];
  }
}

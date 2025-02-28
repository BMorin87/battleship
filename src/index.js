import "./style.css";

export class Ship {
  constructor(length = 2, orientation = Ship.Orientations.HORIZONTAL) {
    this.hits = 0;
    this.length = length;
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

  static Orientations = Object.freeze({
    // For horizontal ships, ship.location is at the left and the rest of the ship extends to the right.
    HORIZONTAL: "Horizontal",
    // For vertical ships, ship.location is at the top and the rest of the ship extends down.
    VERTICAL: "Vertical",
  });
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
        this.board[i].push(new Cell([j, i]));
      }
    }
  }

  createShips() {
    this.players.forEach((player) => {
      for (let i = 0; i < this.shipCount; i++) {
        player.ships.push(new Ship());
      }
    });
  }

  placeShips() {
    this.players.forEach((player) => {
      player.ships.forEach((ship) => {
        const coordinates = this.getFirstLegalPosition(ship);
        ship.setLocation(coordinates);
        // Set board cells to Ship type.
        for (let i = 0; i < ship.length; i++) {
          if (ship.orientation === Ship.Orientations.HORIZONTAL) {
            const currentCell = this.board[coordinates[0]][coordinates[1] + i];
            currentCell.type = Cell.Types.SHIP;
          } else if (ship.orientation === Ship.Orientations.VERTICAL) {
            const currentCell = this.board[coordinates[0] + i][coordinates[1]];
            currentCell.type = Cell.Types.SHIP;
          }
        }
      });
    });
  }

  // Find the first cell where the ship fits.
  getFirstLegalPosition(ship) {
    for (let i = 0; i < this.columns; i++) {
      for (let j = 0; j < this.rows; j++) {
        if (ship.orientation === Ship.Orientations.HORIZONTAL) {
          // Test if the ship stays within bounds.
          if (j + ship.length > this.columns) continue;

          // Test if the tiles are Oceans.
          const testCells = [];
          for (let k = 0; k < ship.length; k++) {
            testCells.push(this.board[i][j + k]);
          }
          const isAllOceans = testCells.every(
            (cell) => cell.type === Cell.Types.OCEAN
          );
          if (isAllOceans) return [i, j];
          // Else discard the cell and check the next one.
        } else if (ship.orientation === Ship.Orientations.VERTICAL) {
          if (i + ship.length > this.rows) continue;

          const testCells = [];
          for (let k = 0; k < ship.length; k++) {
            testCells.push(this.board[i][j + k]);
          }
          const isAllOceans = testCells.every(
            (cell) => cell.type === Cell.Types.OCEAN
          );
          if (isAllOceans) return [i, j];
        }
      }
    }
  }
}

export class Cell {
  constructor(coordinates, type = Cell.Types.OCEAN) {
    this.coordinates = coordinates;
    this.setType(type);
  }

  setType(type) {
    this.type = type;
  }

  static Types = Object.freeze({
    OCEAN: "Ocean",
    SHIP: "Ship",
  });
}

export class Player {
  constructor(playerType = "Human") {
    this.type = playerType;
    this.ships = [];
  }
}

const game = new Gameboard();
console.log(game.board);

//import "./style.css";

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
    this.columns = length;
    this.rows = width;
    this.players = [new Player(), new Player()];
    this.shipCount = shipCount;
    this.board = [];

    this.createBoard();
    this.createShips();
    this.placeShips();
  }

  createBoard() {
    for (let i = 0; i < this.columns; i++) {
      this.board[i] = [];
      for (let j = 0; j < this.rows; j++) {
        // Use j and i as x and y coordinates.
        this.board[i].push(new Cell([i, j]));
      }
    }
  }

  createShips() {
    for (const player of this.players) {
      for (let i = 0; i < this.shipCount; i++) {
        player.ships.push(new Ship());
      }
    }
  }

  placeShips() {
    for (const player of this.players) {
      for (const ship of player.ships) {
        const coordinates = this.getFirstLegalPosition(ship);
        ship.setLocation(coordinates);

        const shipCells = this.getShipCells(coordinates, ship);
        for (const cell of shipCells) {
          cell.setType(Cell.Types.SHIP);
        }
      }
    }
  }

  // Find the first cell where the ship fits.
  getFirstLegalPosition(ship) {
    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.columns; i++) {
        if (this.shipIsOutOfBounds(i, j, ship)) continue;

        const testCells = this.getShipCells([i, j], ship);
        const isAllOceans = testCells.every(
          (cell) => cell.type === Cell.Types.OCEAN
        );
        // Success, return the valid ship coordinates.
        if (isAllOceans) return [i, j];
      }
    }
  }

  shipIsOutOfBounds(x, y, ship) {
    if (
      (ship.orientation === Ship.Orientations.HORIZONTAL &&
        x + ship.length > this.columns) ||
      (ship.orientation === Ship.Orientations.VERTICAL &&
        y + ship.length > this.rows)
    )
      return true;
    return false;
  }

  receiveAttack(targetCoordinates) {
    // Get an array of arrays that contain each ship's cells.
    let allShipCells = [];
    for (const player of this.players) {
      for (const ship of player.ships) {
        const shipArray = this.getShipCells(ship.location, ship);
        allShipCells.push(shipArray);
      }
    }
    // Case: the attack hit a ship.
    for (const cellArray of allShipCells) {
      const coordinates = [];
      for (const cell of cellArray) {
        coordinates.push(cell.coordinates);
      }
      if (this.containsTarget(coordinates, targetCoordinates)) {
        const targetShip = this.getShipFromLocation(coordinates[0]);
        targetShip.hit();
        return;
      }
    }
    // Case: the attack missed a ship.
    const [x, y] = targetCoordinates;
    const targetCell = this.board[targetCoordinates[0]][targetCoordinates[1]];
    if (targetCell.type === Cell.Types.OCEAN) {
      targetCell.setType(Cell.Types.MISS);
    }
  }

  getShipCells(coordinates, ship) {
    const cellArray = [];
    const [x, y] = coordinates;
    for (let i = 0; i < ship.length; i++) {
      if (ship.orientation === Ship.Orientations.HORIZONTAL) {
        cellArray.push(this.board[x + i][y]);
      } else if (ship.orientation === Ship.Orientations.VERTICAL) {
        cellArray.push(this.board[x][y + i]);
      }
    }
    return cellArray;
  }

  containsTarget(array, target) {
    if (!Array.isArray(target) || target.length !== 2) {
      return false;
    }

    const [targetX, targetY] = target;
    return array.some((coordinate) => {
      return (
        Array.isArray(coordinate) &&
        coordinate.length === 2 &&
        coordinate[0] === targetX &&
        coordinate[1] === targetY
      );
    });
  }

  getShipFromLocation(coordinates) {
    const [x, y] = coordinates;
    for (const player of this.players) {
      for (const ship of player.ships) {
        const [shipX, shipY] = ship.location;
        if (shipX === x && shipY === y) return ship;
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
    MISS: "Miss",
  });
}

export class Player {
  constructor(playerType = "Human") {
    this.type = playerType;
    this.ships = [];
  }
}

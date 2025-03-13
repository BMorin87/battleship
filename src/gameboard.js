import { Cell } from "./cell.js";
import { Ship } from "./ship.js";
import { Utility } from "./utility.js";

export class Gameboard {
  constructor(length = 9, width = 9, shipCount = 5) {
    this.columns = length;
    this.rows = width;
    this.shipCount = shipCount;
    this.gameboard = [];
    this.pastShots = new Set();

    this.createboard();
  }

  createboard() {
    for (let i = 0; i < this.columns; i++) {
      this.gameboard[i] = [];
      for (let j = 0; j < this.rows; j++) {
        this.gameboard[i].push(new Cell([i, j]));
      }
    }
  }

  // This method places ships in the first available position.
  placeShips(ships) {
    for (const ship of ships) {
      const coordinate = this.getRandomLegalPosition(ship);
      const shipCells = this.getShipCells(coordinate, ship);
      ship.setLocations(shipCells);

      for (const cell of shipCells) {
        cell.setType(Cell.Types.SHIP);
      }
    }
  }

  getRandomLegalPosition(ship) {
    let targetX, targetY;
    let isLegal = false;
    do {
      targetX = Utility.randomNum(this.rows);
      targetY = Utility.randomNum(this.columns);

      if (this.shipIsOutOfBounds(targetX, targetY, ship)) continue;

      const testCells = this.getShipCells([targetX, targetY], ship);
      const isAllOceans = testCells.every(
        (cell) => cell.type === Cell.Types.OCEAN
      );
      if (isAllOceans) {
        isLegal = true;
        break;
      }
    } while (!isLegal);

    return [targetX, targetY];
  }

  shipIsOutOfBounds(x, y, ship) {
    if (
      (ship.orientation === Ship.Orientations.HORIZONTAL &&
        x + ship.length > this.columns) ||
      (ship.orientation === Ship.Orientations.VERTICAL &&
        y + ship.length > this.rows)
    ) {
      return true;
    }
    return false;
  }

  receiveAttack(targetCoordinates, ships) {
    // targetCoordinates are verified not to be in pastShots when generated.
    this.pastShots.add(targetCoordinates);
    const [x, y] = targetCoordinates;

    // Case: the attack hit a ship.
    for (const ship of ships) {
      for (const cell of ship.locations) {
        if (cell.coordinates[0] == x && cell.coordinates[1] == y) {
          ship.hit();
          return true;
        }
      }
    }

    // Case: the attack missed a ship.
    const targetCell = this.gameboard[x][y];
    if (targetCell.type === Cell.Types.OCEAN) {
      targetCell.setType(Cell.Types.MISS);
    }
    return false;
  }

  getShipCells(coordinates, ship) {
    const cellArray = [];
    const [x, y] = coordinates;
    for (let i = 0; i < ship.length; i++) {
      if (ship.orientation === Ship.Orientations.HORIZONTAL) {
        cellArray.push(this.gameboard[x + i][y]);
      } else if (ship.orientation === Ship.Orientations.VERTICAL) {
        cellArray.push(this.gameboard[x][y + i]);
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

import { Gameboard } from "./gameboard.js";
import { Ship } from "./ship.js";
import { Utility } from "./utility.js";

export class Player {
  constructor(playerType = Player.Types.HUMAN, shipCount = 5) {
    this.type = playerType;
    this.shipCount = shipCount;
    this.ships = [];
    this.shipBoard = new Gameboard();
    this.targetBoard = new Gameboard();

    if (playerType === Player.Types.CPU) {
      for (let i = 0; i < shipCount; i++) {
        this.ships.push(new Ship());
      }
      this.shipBoard.placeShips(this.ships);
    }
  }

  static Types = Object.freeze({
    HUMAN: "Human",
    CPU: "CPU",
  });

  sendAttack(coordinates, attackedPlayer) {
    const isHit = this.targetBoard.receiveAttack(
      coordinates,
      attackedPlayer.ships
    );

    if (isHit) return true;
    return false;
  }

  chooseTarget(targetPlayer) {
    // TODO: Add ship-hunting behaviour after a hit.

    // Choose coordinates at random, but don't repeat shots.
    let isNewTarget, targetX, targetY;
    do {
      targetX = Utility.randomNum(targetPlayer.shipBoard.rows);
      targetY = Utility.randomNum(targetPlayer.shipBoard.columns);

      isNewTarget = true;
      for (const pastShot of this.targetBoard.pastShots) {
        const [x, y] = pastShot;
        if (targetX === x && targetY === y) {
          isNewTarget = false;
          break;
        }
      }
    } while (!isNewTarget);

    return [targetX, targetY];
  }
}

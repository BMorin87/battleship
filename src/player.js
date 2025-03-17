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

    // For humans, the ships are created in the dock UI component.
    if (playerType === Player.Types.CPU) {
      const ship1 = new Ship(4, this.randomOrientation());
      this.ships.push(ship1);
      const ship2 = new Ship(4, this.randomOrientation());
      this.ships.push(ship2);
      const ship3 = new Ship(3, this.randomOrientation());
      this.ships.push(ship3);
      const ship4 = new Ship(3, this.randomOrientation());
      this.ships.push(ship4);
      const ship5 = new Ship(2, this.randomOrientation());
      this.ships.push(ship5);
      this.shipBoard.placeShips(this.ships);
    }
  }

  static Types = Object.freeze({
    HUMAN: "Human",
    CPU: "CPU",
  });

  randomOrientation() {
    const coinFlip = Math.random() < 0.5;
    const orientation = coinFlip
      ? Ship.Orientations.HORIZONTAL
      : Ship.Orientations.VERTICAL;
    return orientation;
  }

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

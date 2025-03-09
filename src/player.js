import {Gameboard} from "./gameboard.js";
import {Ship} from "./ship.js";

export class Player {
    constructor(playerType = Player.Types.HUMAN, shipCount = 5) {
      this.type = playerType;
      this.shipCount = shipCount;
      this.ships = [];
      for (let i = 0; i < shipCount; i++) {
        this.ships.push(new Ship());
      }

      this.shipBoard = new Gameboard();
      this.shipBoard.placeShips(this.ships);
      this.targetBoard = new Gameboard();
    }

    static Types = Object.freeze({
      HUMAN: "Human",
      CPU: "CPU"
    })
  }
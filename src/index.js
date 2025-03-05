import "./style.css";
import { Gameboard } from "./gameboard.js";
import { Player } from "./player.js";
import { Cell } from "./cell.js";
import { Ship } from "./ship.js";

class UIManager {
  constructor() {
    this.game = new Gameboard();
    const gameContainerDiv = document.querySelector(".gameContainer");
    const shipGridDiv = gameContainerDiv.querySelector("#shipGrid");
    const targetGridDiv = gameContainerDiv.querySelector("#targetGrid");

    const gridContainers = document.querySelectorAll(".gridContainer");
    for (const grid of gridContainers) {
      grid.style.setProperty("--columns", this.game.columns);
      grid.style.setProperty("--rows", this.game.rows);
    }
    for (let i = 0; i < this.game.columns; i++) {
      for (let j = 0; j < this.game.rows; j++) {
        const shipGridCell = document.createElement("div");
        shipGridCell.classList.add("gameCell");
        shipGridDiv.appendChild(shipGridCell);

        const targetGridCell = document.createElement("div");
        targetGridCell.classList.add("gameCell");
        targetGridDiv.appendChild(targetGridCell);
      }
    }
  }
}

new UIManager();

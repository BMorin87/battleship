import "./style.css";
import { Gameboard } from "./gameboard.js";
import { Player } from "./player.js";
import { Cell } from "./cell.js";
import { Ship } from "./ship.js";

class UIManager {
  constructor() {
    this.game = new Gameboard(7, 7);
    this.gameContainerDiv = document.querySelector(".gameContainer");
    this.shipGridDiv = this.gameContainerDiv.querySelector("#shipGrid");
    this.targetGridDiv = this.gameContainerDiv.querySelector("#targetGrid");

    this.gridContainers = document.querySelectorAll(".gridContainer");
    for (const grid of this.gridContainers) {
      grid.style.setProperty("--columns", this.game.columns + 1); // +1 for row labels
      grid.style.setProperty("--rows", this.game.rows + 1); // +1 for column labels
    }

    this.createGridWithCoordinates(this.shipGridDiv);
    this.createGridWithCoordinates(this.targetGridDiv);
  }

  createGridWithCoordinates(gridDiv) {
    // Add column headers (numbers)
    for (let i = 0; i <= this.game.columns; i++) {
      const cell = document.createElement("div");
      cell.classList.add("gameCell", "coordinateCell");

      if (i > 0) {
        cell.textContent = i;
        cell.classList.add("columnHeader");
      }

      gridDiv.appendChild(cell);
    }

    // Add rows with row headers (letters)
    for (let j = 0; j < this.game.rows; j++) {
      // Add row header (letter)
      const rowLabel = document.createElement("div");
      rowLabel.classList.add("gameCell", "coordinateCell", "rowHeader");
      rowLabel.textContent = String.fromCharCode(65 + j); // A, B, C, etc.
      gridDiv.appendChild(rowLabel);

      // Add regular cells
      for (let i = 0; i < this.game.columns; i++) {
        const cell = document.createElement("div");
        cell.classList.add("gameCell");
        cell.dataset.row = j;
        cell.dataset.col = i;
        gridDiv.appendChild(cell);
      }
    }
  }
}

new UIManager();

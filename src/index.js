import "./style.css";
import { Gameboard } from "./gameboard.js";
import { Player } from "./player.js";
import { Cell } from "./cell.js";
import { Ship } from "./ship.js";

class UIManager {
  constructor() {
    this.game = new Gameboard();
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
    
    this.drawShips(this.game.players[0]);
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

  // This searches game cells for a Ship type and colors the cell on the page.
  /* colorShipCells() {
    const cellDivs = this.shipGridDiv.children;
    this.game.board.flat().forEach((cell) => {
      if (cell.type === Cell.Types.SHIP) {
        for (const cellDiv of cellDivs) {
          if (
            cellDiv.dataset.row == cell.coordinates[0] &&
            cellDiv.dataset.col == cell.coordinates[1]
          ) {
            cellDiv.classList.add("shipCell");
          }
        }
      }
    });
  } */

  drawShips(player) {
    const shipCells = [];
    for (const ship of player.ships) {
      const cells = this.game.getShipCells(ship.location, ship);
      shipCells.push(...cells);
    }
    const cellDivs = this.shipGridDiv.children;
    for (const cell of shipCells) {
      for (const cellDiv of cellDivs) {
        if (
          cellDiv.dataset.row == cell.coordinates[0] &&
          cellDiv.dataset.col == cell.coordinates[1]
        ) {
          cellDiv.classList.add("shipCell");
        }
      }
    }
  }
}

const ui = new UIManager();
console.log(ui.game.board);

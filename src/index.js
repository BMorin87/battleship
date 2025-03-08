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

    this.addTargetEventListeners(this.targetGridDiv);
  }

  createGridWithCoordinates(gridDiv) {
    // Add column headers (numbers).
    for (let i = 0; i <= this.game.columns; i++) {
      const cell = document.createElement("div");
      cell.classList.add("gameCell", "coordinateCell");

      if (i > 0) {
        cell.textContent = i;
        cell.classList.add("columnHeader");
      }

      gridDiv.appendChild(cell);
    }

    // Add rows.
    for (let j = 0; j < this.game.rows; j++) {
      // Add row header (letter).
      const rowLabel = document.createElement("div");
      rowLabel.classList.add("gameCell", "coordinateCell", "rowHeader");
      rowLabel.textContent = String.fromCharCode(65 + j); // A, B, C, etc.
      gridDiv.appendChild(rowLabel);

      // Add regular cells.
      for (let i = 0; i < this.game.columns; i++) {
        const cell = document.createElement("div");
        cell.classList.add("gameCell");
        cell.dataset.row = j;
        cell.dataset.col = i;
        gridDiv.appendChild(cell);
      }
    }
  }

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

  addTargetEventListeners(gridDiv) {
    // Get only the gameboard cells, not coordinate cells.
    const gameCells = [...gridDiv.children].filter(
      (gameCell) => gameCell.dataset["row"] !== undefined
    );

    for (const cell of gameCells) {
      cell.addEventListener(
        "mouseenter",
        this.targetGridOnMouseEnter.bind(this)
      );
      cell.addEventListener(
        "mouseleave",
        this.targetGridOnMouseLeave.bind(this)
      );
      cell.addEventListener("click", this.targetGridOnClick.bind(this));
    }
  }

  targetGridOnMouseEnter(event) {
    const cell = event.target;
    cell.classList.add("hovered");
  }

  targetGridOnMouseLeave(event) {
    const cell = event.target;
    cell.classList.remove("hovered");
  }

  targetGridOnClick(event) {
    const cellDiv = event.target;
    const gameCell = this.game.board[cellDiv.dataset.row][cellDiv.dataset.col];
    const isHit = this.game.receiveAttack(gameCell.coordinates);
    if (isHit) {
      cellDiv.classList.add("hit");
    } else {
      cellDiv.classList.add("miss");
    }
  }
}

new UIManager();

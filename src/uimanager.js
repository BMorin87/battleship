import { Player } from "./player.js";

export class UIManager {
  constructor() {
    this.players = [new Player(), new Player(Player.Types.CPU)];
    this.currentPlayer = this.players[0];
    this.gameContainerDiv = document.querySelector(".gameContainer");
    this.shipGridDiv = document.querySelector("#shipGrid");
    this.targetGridDiv = document.querySelector("#targetGrid");
    this.gameStatusDiv = document.querySelector(".gameStatus");
    // A reference to this event is needed so that it can be removed.
    this.boundTargetGridOnClick = this.targetGridOnClick.bind(this);

    this.setGridRowsAndColumns(this.currentPlayer);
    this.createGridWithCoordinates(this.shipGridDiv);
    this.createGridWithCoordinates(this.targetGridDiv);

    this.drawShips(this.currentPlayer);

    const startButton = document.getElementById("startGame");
    startButton.addEventListener("click", () => {
      this.addTargetGridEventListeners(this.targetGridDiv);
      this.targetGridDiv.classList.add("game-active");
      this.gameStatusDiv.textContent = UIManager.statusMessages.YOURTURN;
    });
  }

  // Set CSS grid based on gameboard size.
  setGridRowsAndColumns(player) {
    const gridContainers = document.querySelectorAll(".gridContainer");
    for (const gridContainer of gridContainers) {
      const rows = player.shipBoard.rows;
      const columns = player.shipBoard.columns;

      // Add 1 for row and column labels.
      gridContainer.style.setProperty("--rows", rows + 1);
      gridContainer.style.setProperty("--columns", columns + 1);
    }
  }

  createGridWithCoordinates(gridDiv) {
    // Add column headers (numbers).
    for (let i = 0; i <= this.players[0].shipBoard.columns; i++) {
      const cell = document.createElement("div");
      cell.classList.add("gameCell", "coordinateCell");

      if (i > 0) {
        cell.textContent = i;
        cell.classList.add("columnHeader");
      }

      gridDiv.appendChild(cell);
    }

    // Add rows.
    for (let j = 0; j < this.players[0].shipBoard.rows; j++) {
      // Add row header (letter).
      const rowLabel = document.createElement("div");
      rowLabel.classList.add("gameCell", "coordinateCell", "rowHeader");
      rowLabel.textContent = String.fromCharCode(65 + j); // A, B, C, etc.
      gridDiv.appendChild(rowLabel);

      // Add regular cells.
      for (let i = 0; i < this.players[0].shipBoard.columns; i++) {
        const cell = document.createElement("div");
        cell.classList.add("gameCell");
        cell.dataset.row = j;
        cell.dataset.col = i;
        gridDiv.appendChild(cell);
      }
    }
  }

  drawShips(player) {
    for (const ship of player.ships) {
      for (const cell of ship.locations) {
        for (const cellDiv of this.shipGridDiv.children) {
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

  addTargetGridEventListeners(gridDiv) {
    // Exclude coordinate cells based on game cells having row data.
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
      cell.addEventListener("click", this.boundTargetGridOnClick);
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
    const coordinates = [cellDiv.dataset.row, cellDiv.dataset.col];

    // Send the attack.
    const attackedPlayer = this.players[1];
    const isHit = this.players[0].targetBoard.receiveAttack(
      coordinates,
      attackedPlayer.ships
    );

    // Display the result of the attack.
    if (isHit) {
      cellDiv.classList.add("hit");
    } else {
      cellDiv.classList.add("miss");
    }
    cellDiv.removeEventListener("click", this.boundTargetGridOnClick);

    // The computer takes its turn.
    if (this.players[1].type === Player.Types.CPU) {
      this.enemyTurn();
    }
  }

  enemyTurn() {
    this.disablePlayerActions();
    this.gameStatusDiv.textContent = UIManager.statusMessages.CPUTURN;

    // Delay the enemy's response by 1-2 seconds.
    const delay = (Math.random() + 1) * 1000;
    setTimeout(() => {
      this.executeAttack();
      this.gameStatusDiv.textContent = UIManager.statusMessages.YOURTURN;
      this.enablePlayerActions();
    }, delay);
  }

  disablePlayerActions() {
    this.targetGridDiv.classList.add("disabled");
  }

  enablePlayerActions() {
    this.targetGridDiv.classList.remove("disabled");
  }

  executeAttack() {
    const coordinates = this.chooseTarget();

    const attackedPlayer = this.players[0];
    const isHit = this.players[1].targetBoard.receiveAttack(
      coordinates,
      attackedPlayer.ships
    );

    const cellDiv = this.getCellDivFromCoordinates(coordinates);
    if (isHit) {
      cellDiv.classList.add("hit");
    } else {
      cellDiv.classList.add("miss");
    }
  }

  chooseTarget() {
    const rows = this.players[0].shipBoard.rows;
    const columns = this.players[0].shipBoard.columns;

    // Choose coordinates at random, but don't repeat shots.
    let isOldTarget, targetX, targetY;
    do {
      targetX = this.randomNum(rows);
      targetY = this.randomNum(columns);

      isOldTarget = false;
      for (const pastShot of this.players[1].targetBoard.pastShots) {
        if (targetX === pastShot[0] && targetY === pastShot[1]) {
          isOldTarget = true;
          break;
        }
      }
    } while (isOldTarget);

    return [targetX, targetY];
  }

  // Returns a random natural number strictly smaller than n.
  randomNum(n) {
    return Math.floor(Math.random() * n);
  }

  getCellDivFromCoordinates(coordinates) {
    const [x, y] = coordinates;
    for (const cellDiv of this.shipGridDiv.children) {
      if (cellDiv.dataset.row == x && cellDiv.dataset.col == y) {
        return cellDiv;
      }
    }
  }

  static statusMessages = Object.freeze({
    YOURTURN: "Your turn - fire at enemy waters!",
    CPUTURN: "Enemy's turn - choosing a target."
  })
}

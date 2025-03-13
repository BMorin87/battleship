import { Player } from "./player.js";
import { Ship } from "./ship.js";

export class UIManager {
  constructor() {
    this.players = [new Player(), new Player(Player.Types.CPU)];
    this.currentPlayer = this.players[0];
    this.gameContainerDiv = document.querySelector(".gameContainer");
    this.shipGridDiv = document.querySelector("#shipGrid");
    this.targetGridDiv = document.querySelector("#targetGrid");
    this.gameStatusDiv = document.querySelector(".gameStatus");
    this.dockContainerDiv = document.querySelector(".dockContainer");
    this.startButton = document.getElementById("startGame");
    this.randomizeButton = document.getElementById("randomizeShips");
    // A reference to this event is needed so that it can be removed.
    this.boundTargetGridOnClick = this.targetGridOnClick.bind(this);

    // Ship placement state
    this.shipBeingDragged = null;
    this.shipOrientation = Ship.Orientations.HORIZONTAL;
    this.playerShipsPlaced = 0;

    this.setGridRowsAndColumns(this.currentPlayer);
    this.createGridWithCoordinates(this.shipGridDiv);
    this.createGridWithCoordinates(this.targetGridDiv);

    this.initializeShipDock();
    this.addShipPlacementEvents();

    this.randomizeButton.addEventListener("click", () => {
      this.randomizeShips();
    });

    const startButton = document.getElementById("startGame");
    startButton.addEventListener("click", () => {
      this.addTargetGridEventListeners(this.targetGridDiv);
      this.targetGridDiv.classList.add("game-active");
      this.gameStatusDiv.textContent = UIManager.statusMessages.YOURTURN;

      // Hide elements once the game starts.
      document.getElementById("shipDock").style.display = "none";
      this.randomizeButton.style.display = "none";
      this.startButton.style.display = "none";
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "r" || e.key === "R") {
        this.rotateShipBeingDragged();
      }
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
    // Erase any ships.
    for (const cellDiv of this.shipGridDiv.children) {
      cellDiv.classList.remove("shipCell");
    }
    // Update the display.
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

  initializeShipDock() {
    this.currentPlayer.ships = [];

    const shipLengths = [4, 4, 3, 3, 2];

    shipLengths.forEach((length, index) => {
      // Create ship object.
      const ship = new Ship(length, Ship.Orientations.HORIZONTAL);
      this.currentPlayer.ships.push(ship);

      // Create visual representation.
      const shipDiv = document.createElement("div");
      shipDiv.classList.add("dockShip");
      shipDiv.dataset.shipIndex = index;

      // Add ship cells.
      for (let i = 0; i < length; i++) {
        const cellDiv = document.createElement("div");
        cellDiv.classList.add("dockShipCell");
        shipDiv.appendChild(cellDiv);
      }

      shipDiv.draggable = true;
      shipDiv.addEventListener("dragstart", (e) => this.onDragStart(e, index));

      this.dockContainerDiv.appendChild(shipDiv);
    });
    this.clearShipGrid();
  }

  clearShipGrid() {
    const cells = this.shipGridDiv.querySelectorAll(
      ".gameCell:not(.coordinateCell)"
    );
    for (const cell of cells) {
      cell.classList.remove("shipCell");
    }
  }
  
  addShipPlacementEvents() {
    const cells = this.shipGridDiv.querySelectorAll(
      ".gameCell:not(.coordinateCell)"
    );

    cells.forEach((cell) => {
      cell.addEventListener("dragover", (e) => this.onDragOver(e, cell));
      cell.addEventListener("dragleave", (e) => this.onDragLeave(e, cell));
      cell.addEventListener("drop", (e) => this.onDrop(e, cell));
    });
  }

  onDragStart(e, shipIndex) {
    // Check if ship is already placed
    if (e.target.classList.contains("placed")) {
      e.preventDefault();
      return;
    }

    this.shipBeingDragged = shipIndex;
    e.dataTransfer.setData("text/plain", shipIndex);

    // Set drag image offset to center of first cell
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setDragImage(e.target, offsetX, offsetY);
  }

  onDragOver(e, cell) {
    e.preventDefault(); // Allow drop

    // Clear previous preview
    this.clearShipPreview();

    // Show placement preview
    const shipIndex = this.shipBeingDragged;
    const ship = this.currentPlayer.ships[shipIndex];
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    // Validate and show preview
    const isValid = this.validateShipPlacement(
      row,
      col,
      ship.length,
      this.shipOrientation
    );
    this.showShipPreview(row, col, ship.length, this.shipOrientation, isValid);
  }

  onDragLeave(e, cell) {
    // Clear preview when leaving a cell
    this.clearShipPreview();
  }

  onDrop(e, cell) {
    e.preventDefault();

    const shipIndex = this.shipBeingDragged;
    const ship = this.currentPlayer.ships[shipIndex];
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    // Check if placement is valid
    if (
      this.validateShipPlacement(row, col, ship.length, this.shipOrientation)
    ) {
      // Place the ship
      this.placeShip(shipIndex, row, col, this.shipOrientation);

      // Mark ship as placed in the dock
      const shipDiv = document.querySelector(
        `.dockShip[data-ship-index="${shipIndex}"]`
      );
      shipDiv.classList.add("placed");

      // Check if all ships are placed and enable start button if they are
      this.playerShipsPlaced++;
      if (this.playerShipsPlaced === this.currentPlayer.ships.length) {
        this.startButton.disabled = false;
      }
    }

    // Clear preview
    this.clearShipPreview();
  }

  validateShipPlacement(row, column, length, orientation) {
    // Check out of bounds.
    if (orientation === Ship.Orientations.HORIZONTAL) {
      if (column + length > this.currentPlayer.shipBoard.columns) {
        return false;
      }
    } else if (orientation === Ship.Orientations.VERTICAL) {
      if (row + length > this.currentPlayer.shipBoard.rows) {
        return false;
      }
    }

    // Check for overlapping ships.
    for (let i = 0; i < length; i++) {
      let checkRow = row;
      let checkCol = column;

      if (orientation === Ship.Orientations.HORIZONTAL) {
        checkCol += i;
      } else {
        checkRow += i;
      }

      const cell = this.getCellDivFromCoordinates([checkRow, checkCol]);
      if (cell && cell.classList.contains("shipCell")) {
        return false;
      }
    }
    return true;
  }

  showShipPreview(row, column, length, orientation, isValid) {
    for (let i = 0; i < length; i++) {
      let previewRow = row;
      let previewCol = column;

      if (orientation === Ship.Orientations.HORIZONTAL) {
        previewCol += i;
      } else {
        previewRow += i;
      }

      if (
        previewRow >= this.currentPlayer.shipBoard.rows ||
        previewCol >= this.currentPlayer.shipBoard.columns
      ) {
        continue;
      }

      const cell = this.getCellDivFromCoordinates([previewRow, previewCol]);
      if (cell) {
        cell.classList.add(isValid ? "shipPreview" : "invalidPlacement");
      }
    }
  }

  clearShipPreview() {
    const cells = this.shipGridDiv.querySelectorAll(".gameCell");
    for (const cell of cells) {
      cell.classList.remove("shipPreview", "invalidPlacement");
    }
  }

  placeShip(shipIndex, row, column, orientation) {
    const ship = this.currentPlayer.ships[shipIndex];
    ship.orientation = orientation;

    // TODO: Clear previous placement for this ship if any.

    // Place ship on grid visually.
    for (let i = 0; i < ship.length; i++) {
      let shipRow = row;
      let shipCol = column;

      if (orientation === Ship.Orientations.HORIZONTAL) {
        shipCol += i;
      } else {
        shipRow += i;
      }

      const cell = this.getCellDivFromCoordinates([shipRow, shipCol]);
      if (cell) {
        cell.classList.add("shipCell");
      }
    }

    const shipCells = this.currentPlayer.shipBoard.getShipCells(
      [row, column],
      ship
    );
    ship.setLocations(shipCells);
  }

  rotateShipBeingDragged() {
    if (this.shipShipBeingDragged !== null) {
      this.shipOrientation =
        this.shipOrientation === Ship.Orientations.HORIZONTAL
          ? Ship.Orientations.VERTICAL
          : Ship.Orientations.HORIZONTAL;

      const shipDiv = document.querySelector(
        `.dockShip[data-ship-index="${this.shipBeingDragged}"]`
      );
      shipDiv.classList.toggle("vertical");

      const hoveredCell = document.querySelector(
        ".shipPreview, .invalidPlacement"
      );
      if (hoveredCell) {
        const event = new Event("dragover", { bubbles: true });
        hoveredCell.dispatchEvent(event);
      }
    }
  }

  randomizeShips() {
    this.players[0] = new Player();
    this.currentPlayer = this.players[0];

    this.dockContainerDiv.innerHTML = "";
    this.playerShipsPlaced = this.currentPlayer.ships.length;

    this.drawShips(this.currentPlayer);

    this.startButton.disabled = false;

    this.initializeShipDock();
    const dockShips = document.querySelectorAll(".dockShip");
    for (const ship of dockShips) {
      ship.classList.add("placed");
    }
  }

  addTargetGridEventListeners(gridDiv) {
    // Exclude coordinate cells based on game cell Divs having row data.
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
    const attacker = this.players[1];
    const attackedPlayer = this.players[0];

    const coordinates = attacker.chooseTarget(attackedPlayer);
    const isHit = attacker.sendAttack(coordinates, attackedPlayer);

    const cellDiv = this.getCellDivFromCoordinates(coordinates);
    if (isHit) {
      cellDiv.classList.add("hit");
    } else {
      cellDiv.classList.add("miss");
    }
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
    CPUTURN: "Enemy's turn - choosing a target.",
  });
}

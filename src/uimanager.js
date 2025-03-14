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

    this.boundKeydownHandler = this.handleKeyPress.bind(this);
    document.addEventListener("keydown", this.boundKeydownHandler);

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
  
      // Create container for ship and rotate button
      const shipContainer = document.createElement("div");
      shipContainer.classList.add("ship-container");
  
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
  
      // Add rotate button
      const rotateBtn = document.createElement("button");
      rotateBtn.textContent = "↻";
      rotateBtn.classList.add("rotate-btn");
      rotateBtn.addEventListener("click", () => {
        // Toggle ship orientation in the object
        ship.orientation = 
          ship.orientation === Ship.Orientations.HORIZONTAL
            ? Ship.Orientations.VERTICAL
            : Ship.Orientations.HORIZONTAL;
        
        // Toggle the visual orientation
        shipDiv.classList.toggle("vertical");
      });
  
      shipDiv.draggable = true;
      shipDiv.addEventListener("dragstart", (e) => this.onDragStart(e, index));
  
      // Add elements to container
      shipContainer.appendChild(shipDiv);
      shipContainer.appendChild(rotateBtn);
  
      this.dockContainerDiv.appendChild(shipContainer);
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

    // Add dragend listeners to all dock ships
    document.querySelectorAll(".dockShip").forEach((shipDiv) => {
      shipDiv.addEventListener("dragend", () => {
        this.shipBeingDragged = null;
      });
    });
  }

  onDragStart(e, shipIndex) {
    // Check if ship is already placed
    if (e.target.classList.contains("placed")) {
      e.preventDefault();
      return;
    }
  
    this.shipBeingDragged = shipIndex;
    const ship = this.currentPlayer.ships[shipIndex];
    
    // Set the orientation based on the ship's current orientation
    this.shipOrientation = ship.orientation;
    
    e.dataTransfer.setData("text/plain", shipIndex);
  
    // Set drag image offset to center of first cell
    const rect = e.target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setDragImage(e.target, offsetX, offsetY);
  }

  onDragOver(e, cell) {
    e.preventDefault(); // Allow drop

    // Clear previous hover class from all cells
    const hoveredCells = document.querySelectorAll(".gameCell.hovered");
    hoveredCells.forEach((cell) => cell.classList.remove("hovered"));

    // Add hovered class to current cell
    cell.classList.add("hovered");

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
    cell.classList.remove("hovered");
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
      
      // Disable the corresponding rotate button
      const shipContainer = shipDiv.parentElement;
      const rotateBtn = shipContainer.querySelector(".rotate-btn");
      if (rotateBtn) {
        rotateBtn.disabled = true;
      }
  
      // Check if all ships are placed and enable start button if they are
      this.playerShipsPlaced++;
      if (this.playerShipsPlaced === this.currentPlayer.ships.length) {
        this.startButton.disabled = false;
      }
    }
  
    // Clear preview
    this.clearShipPreview();
    cell.classList.remove("hovered");
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
      cell.classList.remove("shipPreview", "invalidPlacement", "hovered");
    }
  }

  placeShip(shipIndex, row, column, orientation) {
    const ship = this.currentPlayer.ships[shipIndex];
    ship.orientation = orientation;
  
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

  handleKeyPress(e) {
    if ((e.key === "r" || e.key === "R") && this.shipBeingDragged !== null) {
      // Toggle orientation
      this.shipOrientation =
        this.shipOrientation === Ship.Orientations.HORIZONTAL
          ? Ship.Orientations.VERTICAL
          : Ship.Orientations.HORIZONTAL;

      // Update visual representation in dock
      const shipDiv = document.querySelector(
        `.dockShip[data-ship-index="${this.shipBeingDragged}"]`
      );

      if (shipDiv) {
        shipDiv.classList.toggle("vertical");
      }

      // Find the cell currently being hovered over
      const hoverCell = document.querySelector(".gameCell.hovered");
      if (hoverCell) {
        const row = parseInt(hoverCell.dataset.row);
        const col = parseInt(hoverCell.dataset.col);
        const ship = this.currentPlayer.ships[this.shipBeingDragged];

        // Clear existing preview
        this.clearShipPreview();

        // Validate and show preview with new orientation
        const isValid = this.validateShipPlacement(
          row,
          col,
          ship.length,
          this.shipOrientation
        );

        this.showShipPreview(
          row,
          col,
          ship.length,
          this.shipOrientation,
          isValid
        );
      }
    }
  }

  /* rotateShipBeingDragged() {
    // Toggle orientation
    this.shipOrientation =
      this.shipOrientation === Ship.Orientations.HORIZONTAL
        ? Ship.Orientations.VERTICAL
        : Ship.Orientations.HORIZONTAL;

    // Update visual representation in dock
    const shipDiv = document.querySelector(
      `.dockShip[data-ship-index="${this.shipBeingDragged}"]`
    );
    if (shipDiv) {
      shipDiv.classList.toggle("vertical");

      // Re-trigger dragover to update preview if currently over the grid
      const hoveredCell = document.querySelector(
        ".shipPreview, .invalidPlacement"
      );
      if (hoveredCell) {
        const event = new MouseEvent("dragover", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        hoveredCell.dispatchEvent(event);
      }
    }
  } */

    randomizeShips() {
      this.players[0] = new Player();
      this.currentPlayer = this.players[0];
    
      this.dockContainerDiv.innerHTML = "";
      this.playerShipsPlaced = this.currentPlayer.ships.length;
    
      this.drawShips(this.currentPlayer);
    
      this.startButton.disabled = false;
    
      this.initializeShipDock();
      const dockShips = document.querySelectorAll(".dockShip");
      const rotateButtons = document.querySelectorAll(".rotate-btn");
      
      for (const ship of dockShips) {
        ship.classList.add("placed");
      }
      
      for (const button of rotateButtons) {
        button.disabled = true;
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

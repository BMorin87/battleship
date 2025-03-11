import { Gameboard } from "./gameboard.js";
import { Player } from "./player.js";
import { Cell } from "./cell.js";
import { Ship } from "./ship.js";

describe("Gameboard tests", () => {
  test("Gameboard is initialized with Cell objects.", () => {
    const game = new Gameboard();
    expect(game.gameboard[0][0]).toBeInstanceOf(Cell);
  });

  test("Placing ships initializes ship locations property.", () => {
    const game = new Gameboard();
    const ships = [new Ship(), new Ship(), new Ship()];
    game.placeShips(ships);
    for (const ship of ships) {
      expect(ship).toHaveProperty("locations");
    }
  });

  test("Each cell with a ship on it is of type Ship.", () => {
    const game = new Gameboard();
    const ships = [new Ship(), new Ship(), new Ship()];
    game.placeShips(ships);
    const occupiedCells = [];

    for (const ship of ships) {
      occupiedCells.push(...ship.locations);
    }
    const isAllShips = occupiedCells.every(
      (cell) => cell.type === Cell.Types.SHIP
    );
    expect(isAllShips).toBe(true);
  });

  test("receiveAttack function hits ships as expected.", () => {
    const game = new Gameboard();
    const ships = [new Ship(), new Ship(), new Ship()];
    game.placeShips(ships);
    const targetShip = ships[0];
    const targetCoordinates = targetShip.locations[0].coordinates;
    game.receiveAttack(targetCoordinates, ships);
    expect(targetShip.hits).toBeGreaterThan(0);
  });

  test("receiveAttack function sets a missed shot's target cell type to Miss.", () => {
    const game = new Gameboard();
    const ships = [new Ship(), new Ship(), new Ship()];
    game.placeShips(ships);
    const targetCell = game.gameboard[8][8];
    // Ideally get specifically an Ocean cell rather than one I think will miss.
    if (targetCell.type === Cell.Types.OCEAN) {
      game.receiveAttack(targetCell.coordinates, ships);
    }
    expect(targetCell.type).toBe(Cell.Types.MISS);
  });

  test("Missed shots are recorded.", () => {
    const game = new Gameboard();
    const ships = [new Ship(), new Ship(), new Ship()];
    game.placeShips(ships);
    const targetCell = game.gameboard[8][8];
    if (targetCell.type === Cell.Types.OCEAN) {
      game.receiveAttack(targetCell.coordinates, ships);
    }
    const isRecorded = game.missedShots.has(targetCell.coordinates);
    expect(isRecorded).toBe(true);
  });
});

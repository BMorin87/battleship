import { Ship, Gameboard, Cell, Player } from "./index.js";

describe("Ship tests", () => {
  test("ship.hits is initialized to zero.", () => {
    const ship = new Ship();
    expect(ship.hits).toBe(0);
  });

  test("ship.hit() increments ship.hits counter.", () => {
    const ship = new Ship();
    ship.hit();
    expect(ship.hits).toBe(1);
  });

  test("ship.length is initialized via constructor.", () => {
    const length = 4;
    const ship = new Ship(length);
    expect(ship.length).toBe(length);
  });

  test("isSunk is false on initialization.", () => {
    const ship = new Ship();
    expect(ship.isSunk()).toBe(false);
  });

  test("isSunk is true when the ship's been hit enough.", () => {
    const ship = new Ship(2);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
});

describe("Gameboard tests", () => {
  test("Gameboard is initialized with Cell objects.", () => {
    const game = new Gameboard();
    expect(game.board[0][0]).toBeInstanceOf(Cell);
  });

  test("Gameboard Cells default type is Ocean.", () => {
    const game = new Gameboard();
    const isAllOceans = game.board.every((row) =>
      row.every((cell) => cell.type === "Ocean")
    );
    expect(isAllOceans).toBe(true);
  });

  test("Gameboard creates ships for each player.", () => {
    const game = new Gameboard();
    const isAllShips = game.players.every(player =>
      player.ships.every(ship => ship instanceof Ship)
    );
    expect(isAllShips).toBe(true);
  });

  test("Gameboard creates shipCount number of ships for each player.", () => {
    const game = new Gameboard();
    expect(game.players[0].ships.length).toBe(game.shipCount);
  });
});

describe("Cell tests", () => {
  test("Default cell type is Ocean.", () => {
    const cell = new Cell();
    expect(cell.type).toBe("Ocean");
  });

  test("Cell type is set via constructor.", () => {
    const testType = "Ship";
    const cell = new Cell(testType);
    expect(cell.type).toBe(testType);
  });
});

describe("Player tests", () => {
  test("Player object is created with a type property.", () => {
    const player = new Player();
    expect(player).toHaveProperty("type");
  });

  test("Player object is created with a ships property.", () => {
    const player = new Player();
    expect(player).toHaveProperty("ships");
  });

  test("player.type is set via constructor.", () => {
    const testType = "CPU";
    const player = new Player(testType);
    expect(player.type).toBe(testType);
  });
});

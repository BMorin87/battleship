import { Ship, Gameboard, Cell } from "./index.js";

describe("Ship object tests", () => {
  test("ship.hits is initialized to zero.", () => {
    const ship = new Ship();
    expect(ship.hits).toBe(0);
  });

  test("ship.hit() increments ship.hits counter.", () => {
    const ship = new Ship();
    ship.hit();
    expect(ship.hits).toBe(1);
  });

  test("ship.length is initialized via constructor", () => {
    const length = 4;
    const ship = new Ship(length);
    expect(ship.length).toBe(length);
  });

  test("isSunk is false on initialization.", () => {
    const ship = new Ship();
    expect(ship.isSunk()).toBe(false);
  });

  test("isSunk is true when the ship's been hit enough", () => {
    const ship = new Ship(2);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
});

describe("Gameboard object tests", () => {
    test("Gameboard is initialized with Cell objects.", () => {
        const game = new Gameboard();
        expect(game.board[0][0]).toBeInstanceOf(Cell);
    })
})

describe("Cell object tests", () => {
    test("Test property is initialized", () => {
        const cell = new Cell();
        expect(cell).toHaveProperty("testProperty");
    })
})

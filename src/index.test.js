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

  test("Gameboard creates ships for each player.", () => {
    const game = new Gameboard();
    const isAllShips = game.players.every((player) =>
      player.ships.every((ship) => ship instanceof Ship)
    );
    expect(isAllShips).toBe(true);
  });

  test("Gameboard creates shipCount number of ships for each player.", () => {
    const game = new Gameboard();
    expect(game.players[0].ships.length).toBe(game.shipCount);
  });

  test("Gameboard initializes each ship location.", () => {
    const game = new Gameboard();
    game.players.forEach((player) => {
      player.ships.forEach((ship) => {
        expect(ship).toHaveProperty("location");
      });
    });
  });

  test("Each cell with a ship on it is of type Ship.", () => {
    const game = new Gameboard();
    const occupiedCells = [];
    game.players.forEach((player) => {
      player.ships.forEach((ship) => {
        for (let i = 0; i < ship.length; i++) {
          if (ship.orientation === Ship.Orientations.HORIZONTAL) {
            occupiedCells.push(
              game.board[ship.location[0]][ship.location[1] + i]
            );
          } else if (ship.orientation === Ship.Orientations.VERTICAL) {
            occupiedCells.push(
              game.board[ship.location[0] + i][ship.location[1]]
            );
          }
        }
      });
    });
    const isAllShips = occupiedCells.every(
      (cell) => cell.type === Cell.Types.SHIP
    );
    expect(isAllShips).toBe(true);
  });

  test("receiveAttack function hits ships as expected.", () => {
    const game = new Gameboard();
    const target = game.players[0].ships[0];
    game.receiveAttack(target.location);
    expect(target.hits).toBeGreaterThan(0);
  })
});

describe("Cell tests", () => {
  test("Default cell type is Ocean.", () => {
    const cell = new Cell([0, 0]);
    expect(cell.type).toBe(Cell.Types.OCEAN);
  });

  test("Cell type is set via constructor.", () => {
    const testType = Cell.Types.SHIP;
    const cell = new Cell([0, 0], testType);
    expect(cell.type).toBe(testType);
  });

  test("Cell coordinates are set via constructor.", () => {
    const cell = new Cell([0, 0]);
    const isOrigin =
      cell.coordinates.length === 2 &&
      cell.coordinates.every(
        (member) => Number.isInteger(member) && member === 0
      );
    expect(isOrigin).toBe(true);
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

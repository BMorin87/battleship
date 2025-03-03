import { Gameboard } from "./gameboard.js";
import { Player } from "./player.js";
import { Cell } from "./cell.js";
import { Ship } from "./ship.js"

describe("Gameboard tests", () => {
    test("Gameboard is initialized with Cell objects.", () => {
      const game = new Gameboard();
      expect(game.board[0][0]).toBeInstanceOf(Cell);
    });
  
    test("Gameboard creates shipCount number of ships for each player.", () => {
      const game = new Gameboard();
      expect(game.players[0].ships.length).toBe(game.shipCount);
    });
  
    test("Gameboard initializes each ship location.", () => {
      const game = new Gameboard();
      for (const player of game.players) {
        for (const ship of player.ships) {
          expect(ship).toHaveProperty("location");
        }
      }
    });
  
    test("Each cell with a ship on it is of type Ship.", () => {
      const game = new Gameboard();
      const occupiedCells = [];
      game.players.forEach((player) => {
        player.ships.forEach((ship) => {
          for (let i = 0; i < ship.length; i++) {
            if (ship.orientation === Ship.Orientations.HORIZONTAL) {
              occupiedCells.push(
                game.board[ship.location[0] + i][ship.location[1]]
              );
            } else if (ship.orientation === Ship.Orientations.VERTICAL) {
              occupiedCells.push(
                game.board[ship.location[0]][ship.location[1] + i]
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
    });
  
    test("receiveAttack function sets a missed shot's target cell type to Miss.", () => {
      const game = new Gameboard();
      const targetCell = game.board[8][8];
      // Ideally get specifically an Ocean cell rather than one I think will miss.
      if (targetCell.type === Cell.Types.OCEAN) {
        game.receiveAttack(targetCell.coordinates);
      }
      expect(targetCell.type).toBe(Cell.Types.MISS);
    });
  
    test("Missed shots are recorded.", () => {
      const game = new Gameboard();
      const targetCell = game.board[8][8];
      if (targetCell.type === Cell.Types.OCEAN) {
        game.receiveAttack(targetCell.coordinates);
      }
      const isRecorded = game.missedShots.has(targetCell.coordinates);
      expect(isRecorded).toBe(true);
    })
  })
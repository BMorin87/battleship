import { Cell } from "./cell.js";

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
  
export class Cell {
    constructor(coordinates, type = Cell.Types.OCEAN) {
      this.coordinates = coordinates;
      this.setType(type);
    }
  
    setType(type) {
      this.type = type;
    }
  
    static Types = Object.freeze({
      OCEAN: "Ocean",
      SHIP: "Ship",
      MISS: "Miss",
    });
  }
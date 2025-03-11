export class Ship {
    constructor(length = 2, orientation = Ship.Orientations.HORIZONTAL) {
      this.hits = 0;
      this.length = length;
      this.orientation = orientation;
    }
  
    hit() {
      this.hits++;
    }
  
    // Ships occupy a number of game cells.
    setLocations(cellArray) {
      this.locations = cellArray;
    }
  
    isSunk() {
      if (this.hits >= this.length) {
        return true;
      }
      return false;
    }
  
    static Orientations = Object.freeze({
      HORIZONTAL: "Horizontal",
      VERTICAL: "Vertical",
    });
  }
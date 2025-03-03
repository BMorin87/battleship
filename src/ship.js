export class Ship {
    constructor(length = 2, orientation = Ship.Orientations.HORIZONTAL) {
      this.hits = 0;
      this.length = length;
      this.orientation = orientation;
    }
  
    hit() {
      this.hits++;
    }
  
    setLocation(coordinates) {
      this.location = coordinates;
    }
  
    isSunk() {
      if (this.hits >= this.length) {
        return true;
      }
      return false;
    }
  
    static Orientations = Object.freeze({
      // For horizontal ships, ship.location is at the left and the rest of the ship extends to the right.
      HORIZONTAL: "Horizontal",
      // For vertical ships, ship.location is at the top and the rest of the ship extends down.
      VERTICAL: "Vertical",
    });
  }
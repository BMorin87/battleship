import "./style.css";

class Ship {
    constructor(length = 2) {
        this.hits = 0;
        this.length = length;
    }

    hit() {
        this.hits++;
    }

    isSunk() {
        if (this.hits >= this.length) {
            return true;
        }
        return false;
    }
}

export default Ship;
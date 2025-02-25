import Ship from "./index.js";

test('Hitting a ship increments hit counter', () => {
    const ship = new Ship();
    ship.hit();
    expect(ship.hits).toBe(1);
})

test('New ships have are not sunk', () => {
    const ship = new Ship();
    expect(ship.isSunk()).toBe(false);
})

test('Enough hits sink ships', () => {
    const ship = new Ship(2);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
})
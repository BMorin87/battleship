import { Player } from "./player.js";

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
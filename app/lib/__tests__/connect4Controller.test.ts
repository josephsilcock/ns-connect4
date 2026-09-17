import { Connect4Controller } from "../connect4Controller";

describe("Connect4Controller", () => {
  describe("makeMove", () => {
    it("should fill a 1x1 grid when making a move in column 0", () => {
      const controller = new Connect4Controller(1, 1);
      controller.newGame();

      const status = controller.makeMove(0);

      expect(status).not.toBeNull();
      expect(status?.board[0][0]).toBe(1);
    });

    it("should return null when making a move on a full column", () => {
      const controller = new Connect4Controller(1, 2);
      controller.newGame();

      controller.makeMove(1);
      controller.makeMove(1);
      const status = controller.makeMove(1);

      expect(status).toBeNull();
    });

    it("should return null when making a move outside the grid", () => {
      const controller = new Connect4Controller(1, 1);
      controller.newGame();

      const status = controller.makeMove(2);

      expect(status).toBeNull();
    });

    it("should allow a retry after placing it in a filled column", () => {
      const controller = new Connect4Controller(1, 1);
      controller.newGame();

      let status = controller.makeMove(2);
      expect(status).toBeNull();

      status = controller.makeMove(0);
      expect(status).not.toBeNull();
      expect(status?.board[0][0]).not.toBe(0);
    });
  });
  describe("checkDraw", () => {
    it("should detect a draw when the board is full", () => {
      const controller = new Connect4Controller(1, 1);
      controller.newGame();

      const status = controller.makeMove(0);

      expect(status?.state).toBe("draw");
      expect(status?.winner).toBeUndefined();
    });
  });
});

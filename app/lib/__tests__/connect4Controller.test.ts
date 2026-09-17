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

  describe("newGame", () => {
    it("should clear every placed piece when restarting a game in progress", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      controller.makeMove(0);
      controller.makeMove(3);
      controller.makeMove(3);
      controller.makeMove(6);

      const status = controller.newGame();

      expect(status.board.flat().every((cell) => cell === 0)).toBe(true);
    });

    it("should reset the turn and game state when restarting", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();
      controller.makeMove(2);

      const status = controller.newGame();

      expect(status.state).toBe("ongoing");
      expect(status.currentPlayer).toBe(1);
      expect(status.winner).toBeUndefined();
    });

    it("should keep the cleared board visible through getStatus", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();
      controller.makeMove(4);

      controller.newGame();

      expect(
        controller
          .getStatus()
          .board.flat()
          .every((cell) => cell === 0),
      ).toBe(true);
    });

    it("should allow the bottom row to be refilled after restarting", () => {
      const controller = new Connect4Controller(1, 1);
      controller.newGame();
      expect(controller.makeMove(0)).not.toBeNull();
      expect(controller.makeMove(0)).toBeNull();

      controller.newGame();

      expect(controller.makeMove(0)).not.toBeNull();
    });
  });
});

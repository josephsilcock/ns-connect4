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

    it("should drop the token to the bottom row of an empty column", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      const status = controller.makeMove(3);

      expect(status?.board[5][3]).toBe(1);
      expect(status?.board[4][3]).toBe(0);
    });

    it("should stack tokens on top of each other in the same column", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      controller.makeMove(2);
      const status = controller.makeMove(2);

      expect(status?.board[5][2]).toBe(1);
      expect(status?.board[4][2]).toBe(2);
    });

    it("should switch the current player after a valid move", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      expect(controller.getStatus().currentPlayer).toBe(1);
      expect(controller.makeMove(0)?.currentPlayer).toBe(2);
      expect(controller.makeMove(0)?.currentPlayer).toBe(1);
    });

    it.each([-1, 7, 100, 1.5, NaN])(
      "should reject the out-of-range column %p",
      (column) => {
        const controller = new Connect4Controller(7, 6);
        controller.newGame();

        expect(controller.makeMove(column)).toBeNull();
        expect(controller.getStatus().currentPlayer).toBe(1);
      },
    );

    it("should not change the board when the move is invalid", () => {
      const controller = new Connect4Controller(7, 6);
      const before = controller.newGame().board;

      controller.makeMove(-1);

      expect(controller.getStatus().board).toEqual(before);
    });

    it("should reject a move in a full column", () => {
      const controller = new Connect4Controller(2, 3);
      controller.newGame();

      controller.makeMove(0);
      controller.makeMove(0);
      controller.makeMove(0);

      const status = controller.makeMove(0);

      expect(status).toBeNull();
      expect(controller.getStatus().board.map((row) => row[0])).toEqual([
        1, 2, 1,
      ]);
    });

    it("should still allow moves in other columns when one column is full", () => {
      const controller = new Connect4Controller(2, 1);
      controller.newGame();

      controller.makeMove(0);
      expect(controller.makeMove(0)).toBeNull();
      expect(controller.makeMove(1)?.board[0][1]).toBe(2);
    });

    it("should reject moves before the game has started", () => {
      const controller = new Connect4Controller(7, 6);

      expect(controller.makeMove(0)).toBeNull();
      expect(controller.getStatus().state).toBe("idle");
    });

    it("should reset the board and current player on newGame", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();
      controller.makeMove(0);

      const status = controller.newGame();

      expect(status.currentPlayer).toBe(1);
      expect(status.state).toBe("ongoing");
      expect(status.board.flat().every((cell) => cell === 0)).toBe(true);
    });
  });
});

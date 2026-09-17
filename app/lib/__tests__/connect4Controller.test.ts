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

      controller.makeMove(0);
      controller.makeMove(0);
      const status = controller.makeMove(0);

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

  describe("switchPlayers", () => {
    it("should be able to start with a player", () => {
      const controller = new Connect4Controller(1, 1);
      controller.newGame();
      const status = controller.getStatus();
      expect(status?.currentPlayer).toBe(1);
    });
    it("should be able to change to player 2 after player 1 made a valid move", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();
      controller.makeMove(0);
      const status = controller.getStatus();
      expect(status?.currentPlayer).toBe(2);
    });
    it("should be able to change to player 1 after player 2 made a valid move", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();
      controller.makeMove(0);
      controller.makeMove(0);
      const status = controller.getStatus();
      expect(status?.currentPlayer).toBe(1);
    });
    it("should not be able to change player 2 after player 1 made an invalid move", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();
      controller.makeMove(21);
      const status = controller.getStatus();
      expect(status?.currentPlayer).toBe(1);
    });
    it("should not be able to change player 1 after player 2 made an invalid move", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();
      controller.makeMove(0);
      controller.makeMove(21);
      const status = controller.getStatus();
      expect(status?.currentPlayer).toBe(2);
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

  // Turns alternate, so each of player 1's moves below is paired with a move
  // for player 2. Where player 2's token is not needed as support underneath
  // one of player 1's cells, it is parked in column 6, far from the line
  // being built.
  describe("checkWin", () => {
    it("should detect a horizontal win", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      controller.makeMove(0); // p1 -> (5,0)
      controller.makeMove(6); // p2 parks
      controller.makeMove(1); // p1 -> (5,1)
      controller.makeMove(6); // p2 parks
      controller.makeMove(2); // p1 -> (5,2)
      controller.makeMove(6); // p2 parks
      const status = controller.makeMove(3); // p1 -> (5,3), completes the row

      expect(status?.state).toBe("won");
      expect(status?.winner).toBe(1);
    });

    it("should detect a vertical win", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      controller.makeMove(0); // p1 -> (5,0)
      controller.makeMove(6); // p2 parks
      controller.makeMove(0); // p1 -> (4,0)
      controller.makeMove(6); // p2 parks
      controller.makeMove(0); // p1 -> (3,0)
      controller.makeMove(6); // p2 parks
      const status = controller.makeMove(0); // p1 -> (2,0), completes the column

      expect(status?.state).toBe("won");
      expect(status?.winner).toBe(1);
    });

    it("should detect a descending diagonal win (top-left to bottom-right)", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      // Player 1 builds (2,0) (3,1) (4,2) (5,3); player 2 supplies the
      // tokens that raise columns 0-2 to the needed heights.
      controller.makeMove(3); // p1 -> (5,3)
      controller.makeMove(2); // p2 -> (5,2), support
      controller.makeMove(2); // p1 -> (4,2)
      controller.makeMove(1); // p2 -> (5,1), support
      controller.makeMove(6); // p1 parks
      controller.makeMove(1); // p2 -> (4,1), support
      controller.makeMove(1); // p1 -> (3,1)
      controller.makeMove(0); // p2 -> (5,0), support
      controller.makeMove(6); // p1 parks
      controller.makeMove(0); // p2 -> (4,0), support
      controller.makeMove(6); // p1 parks
      controller.makeMove(0); // p2 -> (3,0), support
      const status = controller.makeMove(0); // p1 -> (2,0), completes the diagonal

      expect(status?.state).toBe("won");
      expect(status?.winner).toBe(1);
    });

    it("should detect an ascending diagonal win (bottom-left to top-right)", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      // Player 1 builds (5,0) (4,1) (3,2) (2,3); player 2 supplies the
      // tokens that raise columns 1-3 to the needed heights.
      controller.makeMove(0); // p1 -> (5,0)
      controller.makeMove(1); // p2 -> (5,1), support
      controller.makeMove(1); // p1 -> (4,1)
      controller.makeMove(2); // p2 -> (5,2), support
      controller.makeMove(6); // p1 parks
      controller.makeMove(2); // p2 -> (4,2), support
      controller.makeMove(2); // p1 -> (3,2)
      controller.makeMove(3); // p2 -> (5,3), support
      controller.makeMove(6); // p1 parks
      controller.makeMove(3); // p2 -> (4,3), support
      controller.makeMove(6); // p1 parks
      controller.makeMove(3); // p2 -> (3,3), support
      const status = controller.makeMove(3); // p1 -> (2,3), completes the diagonal

      expect(status?.state).toBe("won");
      expect(status?.winner).toBe(1);
    });

    it("should not declare a win with only three in a row", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      controller.makeMove(0); // p1 -> (5,0)
      controller.makeMove(6); // p2 parks
      controller.makeMove(1); // p1 -> (5,1)
      controller.makeMove(6); // p2 parks
      const status = controller.makeMove(2); // p1 -> (5,2), exactly three

      expect(status?.state).toBe("ongoing");
      expect(status?.winner).toBeUndefined();
    });
  });

  describe("game over guard", () => {
    it("should reject moves before a game has been started", () => {
      const controller = new Connect4Controller(7, 6);

      expect(controller.makeMove(0)).toBeNull();
      expect(
        controller
          .getStatus()
          .board.flat()
          .every((cell) => cell === 0),
      ).toBe(true);
    });

    it("should reject moves after a draw", () => {
      const controller = new Connect4Controller(1, 1);
      controller.newGame();
      expect(controller.makeMove(0)?.state).toBe("draw");

      expect(controller.makeMove(0)).toBeNull();
      expect(controller.getStatus().state).toBe("draw");
    });

    it("should reject moves after a win", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      controller.makeMove(0); // p1 -> (5,0)
      controller.makeMove(6); // p2 parks
      controller.makeMove(0); // p1 -> (4,0)
      controller.makeMove(6); // p2 parks
      controller.makeMove(0); // p1 -> (3,0)
      controller.makeMove(6); // p2 parks
      expect(controller.makeMove(0)?.state).toBe("won"); // p1 -> (2,0)

      expect(controller.makeMove(4)).toBeNull();
      expect(controller.getStatus().state).toBe("won");
      expect(controller.getStatus().winner).toBe(1);
    });

    it("should allow moves again after newGame clears a finished game", () => {
      const controller = new Connect4Controller(1, 1);
      controller.newGame();
      controller.makeMove(0);
      expect(controller.makeMove(0)).toBeNull();

      controller.newGame();

      expect(controller.makeMove(0)).not.toBeNull();
    });
  });

  describe("getValidColumns", () => {
    it("should list every column when the board is empty", () => {
      const controller = new Connect4Controller(3, 2);
      controller.newGame();

      expect(controller.getValidColumns()).toEqual([0, 1, 2]);
    });

    it("should exclude columns that are full", () => {
      const controller = new Connect4Controller(3, 1);
      controller.newGame();

      controller.makeMove(1);

      expect(controller.getValidColumns()).toEqual([0, 2]);
    });

    it("should be empty when the board is completely full", () => {
      const controller = new Connect4Controller(1, 1);
      controller.newGame();

      controller.makeMove(0);

      expect(controller.getValidColumns()).toEqual([]);
    });
  });

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

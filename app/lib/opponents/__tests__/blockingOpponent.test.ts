import { Player } from "../../connect4Controller";
import { BlockingOpponent } from "../blockingOpponent";

function emptyBoard(width: number, height: number): Player[][] {
  return Array.from({ length: height }, () => Array(width).fill(0));
}

describe("BlockingOpponent", () => {
  it("takes a winning move when one is available", async () => {
    const opponent = new BlockingOpponent();
    const board = emptyBoard(7, 6);
    board[5][1] = 1;
    board[5][2] = 1;
    board[5][3] = 1;
    board[5][0] = 2;

    const column = await opponent.chooseMove(board, 1, [0, 4, 5, 6]);

    expect(column).toBe(4);
  });

  it("blocks the opponent's winning move when it cannot win itself", async () => {
    const opponent = new BlockingOpponent();
    const board = emptyBoard(7, 6);
    board[5][1] = 2;
    board[5][2] = 2;
    board[5][3] = 2;
    board[5][0] = 1;
    board[4][0] = 1;

    const column = await opponent.chooseMove(board, 1, [0, 4, 5, 6]);

    expect(column).toBe(4);
  });

  it("prefers winning over blocking when both are available", async () => {
    const opponent = new BlockingOpponent();
    const board = emptyBoard(7, 6);
    board[5][1] = 2;
    board[5][2] = 2;
    board[5][3] = 2;
    board[5][0] = 1;
    board[5][5] = 1;
    board[4][5] = 1;
    board[3][5] = 1;

    const column = await opponent.chooseMove(board, 2, [0, 4, 6]);

    expect(column).toBe(4);
  });

  it("chooses a random valid column when no win or block is available", async () => {
    const opponent = new BlockingOpponent();
    const board = emptyBoard(7, 6);
    const validColumns = [1, 3, 5];

    const column = await opponent.chooseMove(board, 1, validColumns);

    expect(validColumns).toContain(column);
  });
});

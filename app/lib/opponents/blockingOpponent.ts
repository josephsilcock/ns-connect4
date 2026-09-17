import { Player } from "../connect4Controller";
import {
  getLowestAvailableRow,
  getOpponentPlayer,
  wouldWinAt,
} from "../connect4Rules";
import { Opponent } from "./opponent";

export class BlockingOpponent implements Opponent {
  async chooseMove(
    board: Player[][],
    currentPlayer: Player,
    validColumns: number[],
  ): Promise<number> {
    const opponent = getOpponentPlayer(currentPlayer);

    const winningColumn = validColumns.find((column) =>
      wouldWinAt(
        board,
        getLowestAvailableRow(board, column),
        column,
        currentPlayer,
      ),
    );
    if (winningColumn !== undefined) return winningColumn;

    const blockingColumn = validColumns.find((column) =>
      wouldWinAt(board, getLowestAvailableRow(board, column), column, opponent),
    );
    if (blockingColumn !== undefined) return blockingColumn;

    const index = Math.floor(Math.random() * validColumns.length);
    return validColumns[index];
  }
}

import type { Player } from "./connect4Controller";

const DIRECTIONS = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal down-right
  [1, -1], // diagonal down-left
] as const;

export function getLowestAvailableRow(
  board: Player[][],
  column: number,
): number {
  for (let row = board.length - 1; row >= 0; row--) {
    if (board[row][column] === 0) {
      return row;
    }
  }
  return -1; // Column is filled.
}

export function wouldWinAt(
  board: Player[][],
  row: number,
  column: number,
  player: Player,
): boolean {
  const countInDirection = (deltaRow: number, deltaColumn: number): number => {
    let count = 0;
    let r = row + deltaRow;
    let c = column + deltaColumn;
    while (board[r]?.[c] === player) {
      count++;
      r += deltaRow;
      c += deltaColumn;
    }
    return count;
  };

  return DIRECTIONS.some(
    ([deltaRow, deltaColumn]) =>
      1 +
        countInDirection(deltaRow, deltaColumn) +
        countInDirection(-deltaRow, -deltaColumn) >=
      4,
  );
}

export function getOpponentPlayer(player: Player): Player {
  return player === 1 ? 2 : 1;
}

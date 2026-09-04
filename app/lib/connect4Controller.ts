export type GameState = "ongoing" | "won" | "draw" | "idle";
export type Player = 0 | 1 | 2; // 0 = empty, 1 = player 1, 2 = player 2

export interface GameStatus {
  state: GameState;
  winner?: Player;
  currentPlayer: Player;
  board: Player[][];
}

const WIN_LENGTH = 4;

// The four axes to search along: horizontal, vertical and the two diagonals.
const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal down-right
  [1, -1], // diagonal down-left
];

export class Connect4Controller {
  public width: number;
  private height: number;
  private board: Player[][];
  private currentPlayer: Player = 1;
  private gameState: GameState = "idle";
  private winner?: Player;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.board = this.initializeBoard();
  }

  private initializeBoard(): Player[][] {
    return Array.from({ length: this.height }, () => Array(this.width).fill(0));
  }

  public newGame(): GameStatus {
    this.board = this.initializeBoard();
    this.currentPlayer = 1;
    this.gameState = "ongoing";
    this.winner = undefined;
    return this.getStatus();
  }

  public makeMove(column: number): GameStatus | null {
    if (this.gameState !== "ongoing") return null;
    if (!Number.isInteger(column) || column < 0 || column >= this.width) {
      return null;
    }

    const row = this.findLowestEmptyRow(column);
    if (row === null) return null;

    this.board[row][column] = this.currentPlayer;

    if (this.isWinningMove(row, column)) {
      this.gameState = "won";
      this.winner = this.currentPlayer;
    } else if (this.isBoardFull()) {
      this.gameState = "draw";
    } else {
      this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    }

    return this.getStatus();
  }

  /**
   * A move can only ever complete a line through the cell just played, so we
   * only need to look outwards from that cell along each of the four axes.
   */
  private isWinningMove(row: number, column: number): boolean {
    const player = this.board[row][column];
    if (player === 0) return false;

    return DIRECTIONS.some(([rowStep, colStep]) => {
      const line =
        1 +
        this.countInDirection(row, column, rowStep, colStep, player) +
        this.countInDirection(row, column, -rowStep, -colStep, player);
      return line >= WIN_LENGTH;
    });
  }

  private countInDirection(
    row: number,
    column: number,
    rowStep: number,
    colStep: number,
    player: Player,
  ): number {
    let count = 0;
    let r = row + rowStep;
    let c = column + colStep;

    while (
      r >= 0 &&
      r < this.height &&
      c >= 0 &&
      c < this.width &&
      this.board[r][c] === player
    ) {
      count++;
      r += rowStep;
      c += colStep;
    }

    return count;
  }

  private isBoardFull(): boolean {
    return this.board.every((row) => row.every((cell) => cell !== 0));
  }

  private findLowestEmptyRow(column: number): number | null {
    for (let row = this.height - 1; row >= 0; row--) {
      if (this.board[row][column] === 0) return row;
    }
    return null;
  }

  public getStatus(): GameStatus {
    return {
      board: this.board.map((row) => [...row]),
      state: this.gameState,
      winner: this.winner,
      currentPlayer: this.currentPlayer,
    };
  }
}

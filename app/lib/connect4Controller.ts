export type GameState = "ongoing" | "won" | "draw" | "idle";
export type Player = 0 | 1 | 2; // 0 = empty, 1 = player 1, 2 = player 2

export interface GameStatus {
  state: GameState;
  winner?: Player;
  currentPlayer: Player;
  board: Player[][];
}

export class Connect4Controller {
  public width: number;
  private height: number;
  private board: Player[][];
  private currentPlayer: Player = 1;
  private gameState: GameState = "idle";

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
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;

    return this.getStatus();
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
      winner: this.gameState === "won" ? this.currentPlayer : undefined,
      currentPlayer: this.currentPlayer,
    };
  }
}

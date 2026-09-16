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

  private validMove(row: number, column: number): boolean {
    if (row === -1 || this.board[row][column] === null) {
      return false;
    }
    return true;
    // Column filled or position does not exist.
  }

  private getLowestAvailablePosition(column: number): number {
    for (let row = this.board.length - 1; row >= 0; row--) {
      if (this.board[row][column] === 0) {
        return row;
      }
    }
    return -1; // Column is filled.
  }

  public newGame(): GameStatus {
    this.board = this.initializeBoard();
    this.currentPlayer = 1;
    this.gameState = "ongoing";
    return this.getStatus();
  }

  public makeMove(column: number): GameStatus | null {
    console.log("Dropping a token into a column:", column);

    // This method needs to be implemented!
    const row = this.getLowestAvailablePosition(column);
    if (this.validMove(row, column)) {
      this.board[row][column] = this.currentPlayer;
      if (this.checkDraw()) this.gameState = "draw";
      return this.getStatus();
    }
    return null;
  }

  private checkWin(): boolean {
    for (let i = 0; i < this.height; i++) {
      //Check horizontal
      for (let j = 0; j < this.width - 3; j++) {
        if (
          this.board[i][j] === this.currentPlayer &&
          this.board[i][j + 1] === this.currentPlayer &&
          this.board[i][j + 2] === this.currentPlayer &&
          this.board[i][j + 3] === this.currentPlayer
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private checkDraw(): boolean {
    for (let i = 0; i < this.width; i++) {
      if (this.board[0][i] === 0) return false;
    }
    return true;
  }

  public getStatus(): GameStatus {
    return {
      board: this.board,
      state: this.gameState,
      winner: this.gameState === "won" ? this.currentPlayer : undefined,
      currentPlayer: this.currentPlayer,
    };
  }
}

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

  private validMove(height: number, column: number): boolean {
    if (height === -1 || this.board[height][column] === null) {
      return false;
    }
    return true;
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
    const maxHeight = this.getMaxHeight(column);
    if (this.validMove(maxHeight, column)) {
      this.board[maxHeight][column] = this.currentPlayer;
      return this.getStatus();
    }
    return null;
  }

  public getMaxHeight(column: number): number {
    for (let row = this.board.length - 1; row >= 0; row--) {
      if (this.board[row][column] === 0) {
        return row;
      }
    }
  return -1;
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

import { getLowestAvailableRow, wouldWinAt } from "./connect4Rules";

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

  public newGame(): GameStatus {
    this.board = this.initializeBoard();
    this.currentPlayer = 1;
    this.gameState = "ongoing";
    return this.getStatus();
  }

  public makeMove(column: number): GameStatus | null {
    if (this.gameState !== "ongoing") {
      return null; // Game has not started, or is already over.
    }

    const row = getLowestAvailableRow(this.board, column);
    if (this.validMove(row, column)) {
      this.board[row][column] = this.currentPlayer;
      if (wouldWinAt(this.board, row, column, this.currentPlayer))
        this.gameState = "won";
      else if (this.checkDraw()) this.gameState = "draw";
      else this.changePlayer();

      return this.getStatus();
    }
    return null;
  }

  private changePlayer(): GameStatus | null {
    if (this.getStatus().currentPlayer == 1) {
      this.currentPlayer = 2;
    } else {
      this.currentPlayer = 1;
    }
    return this.getStatus();
  }

  private checkDraw(): boolean {
    for (let i = 0; i < this.width; i++) {
      if (this.board[0][i] === 0) return false;
    }
    return true;
  }

  public getValidColumns(): number[] {
    const columns: number[] = [];
    for (let column = 0; column < this.width; column++) {
      if (getLowestAvailableRow(this.board, column) !== -1) {
        columns.push(column);
      }
    }
    return columns;
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

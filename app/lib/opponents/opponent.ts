import { Player } from "../connect4Controller";

export interface Opponent {
  chooseMove(
    board: Player[][],
    currentPlayer: Player,
    validColumns: number[],
  ): Promise<number>;
}

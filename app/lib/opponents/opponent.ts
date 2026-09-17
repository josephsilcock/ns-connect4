import { Player } from "../connect4Controller";

export interface Opponent {
  chooseMove(board: Player[][], validColumns: number[]): Promise<number>;
}

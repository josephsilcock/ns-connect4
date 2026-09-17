import { Player } from "../connect4Controller";
import { Opponent } from "./opponent";

export class RandomOpponent implements Opponent {
  async chooseMove(
    _board: Player[][],
    validColumns: number[],
  ): Promise<number> {
    const index = Math.floor(Math.random() * validColumns.length);

    return validColumns[index];
  }
}

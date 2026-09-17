"use client";

import { useEffect, useState } from "react";
import {
  Connect4Controller,
  GameStatus,
  Player,
} from "../lib/connect4Controller";
import { Opponent } from "../lib/opponents/opponent";

type UseConnect4GameOptions = {
  computerPlayer?: Player;
  opponent?: Opponent;
};

export function useConnect4Game(
  controller: Connect4Controller,
  { computerPlayer, opponent }: UseConnect4GameOptions = {},
) {
  const [gameStatus, setGameStatus] = useState<GameStatus>(() =>
    controller.newGame(),
  );

  const isComputerTurn =
    gameStatus.state === "ongoing" &&
    gameStatus.currentPlayer === computerPlayer;

  useEffect(() => {
    if (!isComputerTurn || !opponent) return;

    let cancelled = false;

    opponent
      .chooseMove(
        gameStatus.board,
        gameStatus.currentPlayer,
        controller.getValidColumns(),
      )
      .then((column) => {
        if (cancelled) return;
        const newStatus = controller.makeMove(column);
        if (newStatus) setGameStatus(newStatus);
      });

    return () => {
      cancelled = true;
    };
  }, [gameStatus, isComputerTurn, opponent, controller]);

  const playColumn = (column: number): GameStatus | null => {
    if (gameStatus.state !== "ongoing" || isComputerTurn) return null;

    const newStatus = controller.makeMove(column);
    if (newStatus) setGameStatus(newStatus);
    return newStatus;
  };

  return { gameStatus, isComputerTurn, playColumn };
}

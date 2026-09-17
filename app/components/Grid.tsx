"use client";

import { Connect4Controller, Player } from "../lib/connect4Controller";
import { useConnect4Game } from "../hooks/useConnect4Game";
import { Opponent } from "../lib/opponents/opponent";

type GridProps = {
  controller: Connect4Controller;
  computerPlayer?: Player;
  opponent?: Opponent;
};

const PIECE_COLOURS = {
  0: "transparent",
  1: "rgb(239, 68, 68)",
  2: "rgb(234, 179, 8)",
};

export default function Grid({
  controller,
  computerPlayer,
  opponent,
}: GridProps) {
  const { gameStatus, isComputerTurn, playColumn } = useConnect4Game(
    controller,
    { computerPlayer, opponent },
  );

  const handleColumnClick = (column: number) => {
    if (gameStatus.state !== "ongoing" || isComputerTurn) {
      return;
    }

    const newStatus = playColumn(column);
    if (!newStatus) {
      console.log("Invalid move.");
      alert("Invalid move, column full.");
    }
  };

  const getStatusMessage = () => {
    switch (gameStatus.state) {
      case "idle":
        return "Game not started";
      case "ongoing":
        return isComputerTurn
          ? "Computer is thinking..."
          : `Player ${gameStatus.currentPlayer}'s turn`;
      case "won":
        return `Player ${gameStatus.winner} wins!`;
      case "draw":
        return "Draw!";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-lg font-semibold">{getStatusMessage()}</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${controller.width}, minmax(0, 1fr))`,
        }}
      >
        {gameStatus.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className="aspect-square w-10 h-10 border-1 border-gray-300 dark:border-gray-700 transition-colors"
              onClick={() => handleColumnClick(colIndex)}
              disabled={isComputerTurn}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  backgroundColor: PIECE_COLOURS[cell],
                }}
              />
            </button>
          )),
        )}
      </div>
    </div>
  );
}

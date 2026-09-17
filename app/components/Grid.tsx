"use client";

import { useState } from "react";
import {
  Connect4Controller,
  GameStatus,
  Player,
} from "../lib/connect4Controller";

type GridProps = {
  controller: Connect4Controller;
  /** Piece colour per player. Index 0 is the empty cell. */
  colours: Record<Player, string>;
};

export default function Grid({ controller, colours }: GridProps) {
  const [gameStatus, setGameStatus] = useState<GameStatus>(() =>
    controller.newGame(),
  );

  const handleColumnClick = (column: number) => {
    if (gameStatus.state !== "ongoing") return;

    const newStatus = controller.makeMove(column);
    if (newStatus) {
      setGameStatus(newStatus);
    } else {
      console.log("Invalid move.");
      alert("Invalid move, column full.");
    }
  };

  const getStatusMessage = () => {
    switch (gameStatus.state) {
      case "idle":
        return "Game not started";
      case "ongoing":
        return `Player ${gameStatus.currentPlayer}'s turn`;
      case "won":
        return `Player ${gameStatus.winner} wins!`;
      case "draw":
        return "Draw!";
    }
  };

  const getStatusColour = () => {
    if (gameStatus.state === "ongoing")
      return colours[gameStatus.currentPlayer];
    if (gameStatus.state === "won" && gameStatus.winner !== undefined) {
      return colours[gameStatus.winner];
    }
    return null;
  };

  const statusColour = getStatusColour();

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        {statusColour && (
          <span
            aria-hidden
            className="h-4 w-4 rounded-full ring-1 ring-black/10 dark:ring-white/20"
            style={{ backgroundColor: statusColour }}
          />
        )}
        {getStatusMessage()}
      </div>
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
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  backgroundColor: colours[cell],
                }}
              />
            </button>
          )),
        )}
      </div>
    </div>
  );
}

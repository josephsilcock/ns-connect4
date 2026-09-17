"use client";

import { useEffect, useRef } from "react";
import { Connect4Controller, Player } from "../lib/connect4Controller";
import { GameSubmission } from "../lib/database.types";
import GameOver from "./GameOver";
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
  const hasReportedResult = useRef(false);

  useEffect(() => {
    if (hasReportedResult.current) return;
    if (gameStatus.state !== "won" && gameStatus.state !== "draw") return;

    hasReportedResult.current = true;

    const result: GameSubmission =
      gameStatus.state === "won"
        ? { winner: gameStatus.winner!, loser: gameStatus.winner === 1 ? 2 : 1 }
        : { winner: 0, loser: 0 };

    fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    })
      .then(async (response) => {
        console.log("Got response", response);
        if (!response.ok) {
          const { error } = await response.json();
          console.error("Failed to record game result:", error);
        }
      })
      .catch((error) => {
        console.error("Failed to record game result:", error);
      });
  }, [gameStatus]);

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
      <div>
        {gameStatus.state === "won" || gameStatus.state === "draw" ? (
          <GameOver gameState={gameStatus.state} winner={gameStatus.winner} />
        ) : (
          <div>
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
        )}
      </div>
    </div>
  );
}

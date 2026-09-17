"use client";

import { useEffect, useRef } from "react";
import { GameSubmission } from "../lib/database.types";
import GameOver from "./GameOver";
import { Connect4Controller, Player } from "../lib/connect4Controller";
import { useConnect4Game } from "../hooks/useConnect4Game";
import { Opponent } from "../lib/opponents/opponent";

type GridProps = {
  controller: Connect4Controller;
  computerPlayer?: Player;
  opponent?: Opponent;
  playerOneName: string;
  playerTwoName: string;
  /** Piece colour per player. Index 0 is the empty cell. */
  colours: Record<Player, string>;
};

export default function Grid({
  controller,
  computerPlayer,
  opponent,
  playerOneName,
  playerTwoName,
  colours,
}: GridProps) {
  const { gameStatus, isComputerTurn, playColumn } = useConnect4Game(
    controller,
    { computerPlayer, opponent },
  );
  const hasReportedResult = useRef(false);

  const getPlayerName = (player: Player) =>
    player === 1 ? playerOneName : playerTwoName;

  useEffect(() => {
    if (hasReportedResult.current) return;
    if (gameStatus.state !== "won" && gameStatus.state !== "draw") return;

    hasReportedResult.current = true;

    const result: GameSubmission = {
      playerOneName,
      playerTwoName,
      winner:
        gameStatus.state === "won"
          ? gameStatus.winner === 1
            ? playerOneName
            : playerTwoName
          : "draw",
    };

    fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    })
      .then(async (response) => {
        if (!response.ok) {
          const { error } = await response.json();
          console.error("Failed to record game result:", error);
        }
      })
      .catch((error) => {
        console.error("Failed to record game result:", error);
      });
  }, [gameStatus, playerOneName, playerTwoName]);

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
          : `${getPlayerName(gameStatus.currentPlayer)}'s turn`;
      case "won":
        return `${getPlayerName(gameStatus.winner!)} wins!`;
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
      <div>
        {gameStatus.state === "won" || gameStatus.state === "draw" ? (
          <GameOver
            gameState={gameStatus.state}
            winner={gameStatus.winner}
            winnerName={
              gameStatus.winner !== undefined
                ? getPlayerName(gameStatus.winner)
                : ""
            }
            colours={colours}
          />
        ) : (
          <div>
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
                    disabled={isComputerTurn}
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
        )}
      </div>
    </div>
  );
}

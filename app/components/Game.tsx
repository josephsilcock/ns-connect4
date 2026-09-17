"use client";

import { useMemo, useState } from "react";
import { Connect4Controller, Player } from "../lib/connect4Controller";
import { isColourPairAllowed } from "../lib/colours";
import ColourPicker from "./ColourPicker";
import Grid from "./Grid";

const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 6;

export default function Game() {
  // Built once. A controller constructed during render would hand Grid an
  // empty board on every re-render while Grid held on to the old game state.
  const controller = useMemo(
    () => new Connect4Controller(BOARD_WIDTH, BOARD_HEIGHT),
    [],
  );
  const [gameKey, setGameKey] = useState(0);
  const [playerOneColour, setPlayerOneColour] = useState<string | null>(null);
  const [playerTwoColour, setPlayerTwoColour] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const handleRestart = () => {
    controller.newGame();
    setGameKey((key) => key + 1);
  };

  const choosePlayerOneColour = (hex: string) => {
    setPlayerOneColour(hex);
    // Player one's new colour may rule out what player two already has.
    if (playerTwoColour && !isColourPairAllowed(hex, playerTwoColour).ok) {
      setPlayerTwoColour(null);
    }
  };

  if (!hasStarted || playerOneColour === null || playerTwoColour === null) {
    return (
      <div className="flex flex-col items-center gap-6">
        <ColourPicker
          label="Player 1"
          selected={playerOneColour}
          opponentColour={playerTwoColour}
          onSelect={choosePlayerOneColour}
        />
        <ColourPicker
          label={
            playerOneColour
              ? "Player 2"
              : "Player 2 — waiting for player 1 to choose"
          }
          selected={playerTwoColour}
          opponentColour={playerOneColour}
          disabled={playerOneColour === null}
          onSelect={setPlayerTwoColour}
        />
        <button
          type="button"
          disabled={playerOneColour === null || playerTwoColour === null}
          onClick={() => setHasStarted(true)}
          className="rounded-full bg-black px-6 py-2 font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-black"
        >
          Start game
        </button>
      </div>
    );
  }

  const colours: Record<Player, string> = {
    0: "transparent",
    1: playerOneColour,
    2: playerTwoColour,
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Grid key={gameKey} controller={controller} colours={colours} />
      <button
        type="button"
        onClick={handleRestart}
        className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300"
      >
        Restart game
      </button>
      <button
        type="button"
        onClick={() => setHasStarted(false)}
        className="text-sm underline underline-offset-4 opacity-70 hover:opacity-100"
      >
        Change colours
      </button>
    </div>
  );
}

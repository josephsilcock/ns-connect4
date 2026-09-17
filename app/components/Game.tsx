"use client";

import { useMemo, useState } from "react";
import { Connect4Controller, Player } from "../lib/connect4Controller";
import { isColourPairAllowed } from "../lib/colours";
import { RandomOpponent } from "../lib/opponents/randomOpponent";
import ColourPicker from "./ColourPicker";
import Grid from "./Grid";

const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 6;

/** The computer always takes player 2, so player 1 moves first. */
const COMPUTER_PLAYER: Player = 2;

export default function Game() {
  // Built once. A controller constructed during render would hand Grid an
  // empty board on every re-render while Grid held on to the old game state.
  const controller = useMemo(
    () => new Connect4Controller(BOARD_WIDTH, BOARD_HEIGHT),
    [],
  );
  const opponent = useMemo(() => new RandomOpponent(), []);
  const [gameKey, setGameKey] = useState(0);
  const [vsComputer, setVsComputer] = useState(true);
  const [playerOneColour, setPlayerOneColour] = useState<string | null>(null);
  const [playerTwoColour, setPlayerTwoColour] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [playerOneName, setPlayerOneName] = useState("");
  const [playerTwoName, setPlayerTwoName] = useState("");

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

  const toggleVsComputer = () => {
    setVsComputer((on) => !on);
    // The opponent changing mid-game would leave the computer to inherit a
    // board it never played into, so start afresh.
    handleRestart();
  };

  const opponentToggle = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={vsComputer}
        aria-label="Play against the computer"
        onClick={toggleVsComputer}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
          vsComputer
            ? "bg-black dark:bg-zinc-50"
            : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      >
        {/* Anchored with left-0: without it the knob starts from its static
            position, which the button's centred text alignment puts halfway
            across the pill, and the translate then pushes it off the end. */}
        <span
          className={`absolute top-1 left-0 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow transition-transform dark:bg-black ${
            vsComputer ? "translate-x-7" : "translate-x-1"
          }`}
        >
          🤖
        </span>
      </button>
      <span className="text-sm font-medium">
        {vsComputer ? "Playing the computer" : "Two players"}
      </span>
    </div>
  );

  const playerTwoLabel = vsComputer ? "Computer" : "Player 2";
  const displayPlayerOneName = playerOneName.trim() || "Player 1";
  const displayPlayerTwoName = vsComputer
    ? "Computer"
    : playerTwoName.trim() || "Player 2";

  if (!hasStarted || playerOneColour === null || playerTwoColour === null) {
    return (
      <div className="flex flex-col items-center gap-6">
        {opponentToggle}
        <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Player 1 name
            <input
              type="text"
              value={playerOneName}
              onChange={(event) => setPlayerOneName(event.target.value)}
              placeholder="Player 1"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-50"
            />
          </label>
          {!vsComputer && (
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Player 2 name
              <input
                type="text"
                value={playerTwoName}
                onChange={(event) => setPlayerTwoName(event.target.value)}
                placeholder="Player 2"
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-zinc-50"
              />
            </label>
          )}
        </div>
        <ColourPicker
          label="Player 1"
          selected={playerOneColour}
          opponentColour={playerTwoColour}
          onSelect={choosePlayerOneColour}
        />
        <ColourPicker
          label={
            playerOneColour
              ? playerTwoLabel
              : `${playerTwoLabel} — waiting for player 1 to choose`
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
      <Grid
        key={gameKey}
        controller={controller}
        colours={colours}
        opponent={vsComputer ? opponent : undefined}
        computerPlayer={vsComputer ? COMPUTER_PLAYER : undefined}
        playerOneName={displayPlayerOneName}
        playerTwoName={displayPlayerTwoName}
      />
      {opponentToggle}
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

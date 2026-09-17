"use client";

import { useMemo, useState } from "react";
import Grid from "./components/Grid";
import { Connect4Controller } from "./lib/connect4Controller";
import { RandomOpponent } from "@/app/lib/opponents/randomOpponent";

export default function Home() {
  const controller: Connect4Controller = useMemo(
    () => new Connect4Controller(7, 6),
    [],
  );
  const opponent = useMemo(() => new RandomOpponent(), []);
  const [gameKey, setGameKey] = useState(0);
  const [vsComputer, setVsComputer] = useState(true);
  const [playerOneName, setPlayerOneName] = useState("");
  const [playerTwoName, setPlayerTwoName] = useState("");

  const handleRestart = () => {
    controller.newGame();
    setGameKey((key) => key + 1);
  };

  const displayPlayerOneName = playerOneName.trim() || "Player 1";
  const displayPlayerTwoName = vsComputer
    ? "Computer"
    : playerTwoName.trim() || "Player 2";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-12 py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Connect 4
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A very complex Connect 4 game
          </p>
        </div>
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
        <Grid
          key={gameKey}
          controller={controller}
          opponent={vsComputer ? opponent : undefined}
          computerPlayer={vsComputer ? 2 : undefined}
          playerOneName={displayPlayerOneName}
          playerTwoName={displayPlayerTwoName}
        />
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            role="switch"
            aria-checked={vsComputer}
            onClick={() => setVsComputer((on) => !on)}
            className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
              vsComputer
                ? "bg-black dark:bg-zinc-50"
                : "bg-zinc-300 dark:bg-zinc-700"
            }`}
          >
            <span
              className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow transition-transform dark:bg-black ${
                vsComputer ? "translate-x-7" : "translate-x-1"
              }`}
            >
              🤖
            </span>
          </button>
          <button
            type="button"
            onClick={handleRestart}
            className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300"
          >
            Restart game
          </button>
        </div>
      </main>
    </div>
  );
}

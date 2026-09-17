"use client";

import { useMemo, useState } from "react";
import Grid from "./components/Grid";
import { Connect4Controller, GameStatus } from "./lib/connect4Controller";

export default function Home() {
  const controller: Connect4Controller = useMemo(
    () => new Connect4Controller(7, 6),
    [],
  );
  const [gameKey, setGameKey] = useState(0);

  const handleRestart = () => {
    controller.newGame();
    setGameKey((key) => key + 1);
  };

  const handleSaveGame = async () => {
  try {
    const response = await fetch("/api/game-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(controller.getStatus()),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error ?? `Request failed with ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to save game:", error);
  }
  };

  const handleLoadGame = async () => {
    try {
      const response = await fetch("/api/game-status");

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error ?? `Request failed with ${response.status}`);
      }

      const status: GameStatus = await response.json();
      controller.loadGame(status);
      setGameKey((key) => key + 1);
    } catch (error) {
      console.error("Failed to load saved game:", error);
    }
  };

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
        <Grid key={gameKey} controller={controller} />
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleSaveGame}
            className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300"
          >
            Save game
          </button>
          <button
            type="button"
            onClick={handleLoadGame}
            className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300"
          >
            Load game
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

"use client";

import { useMemo, useState } from "react";
import Grid from "./components/Grid";
import { Connect4Controller } from "./lib/connect4Controller";
import Game from "./components/Game";

export default function Home() {
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
        <Game />
      </main>
    </div>
  );
}

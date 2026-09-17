import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 },
      );
    }

    const [playerOneWins, playerTwoWins] = await Promise.all([
      prisma.games.count({ where: { playerOneWin: true } }),
      prisma.games.count({ where: { playerTwoWin: true } }),
    ]);

    const leaderboard = [
      { player: "Player One", wins: playerOneWins, losses: playerTwoWins },
      { player: "Player Two", wins: playerTwoWins, losses: playerOneWins },
    ];

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error building leaderboard:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to build leaderboard: ${message}` },
      { status: 500 },
    );
  }
}

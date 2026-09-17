import { NextRequest, NextResponse } from "next/server";
import { GameSubmission } from "@/app/lib/database.types";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body: GameSubmission = await request.json();

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 },
      );
    }

    if (!body.playerOneName || !body.playerTwoName || !body.winner) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (
      body.winner !== body.playerOneName &&
      body.winner !== body.playerTwoName &&
      body.winner !== "draw"
    ) {
      return NextResponse.json(
        {
          error: `winner must be "${body.playerOneName}", "${body.playerTwoName}", or "draw"`,
        },
        { status: 400 },
      );
    }

    await prisma.games.create({
      data: {
        playerOneName: body.playerOneName,
        playerTwoName: body.playerTwoName,
        winner: body.winner,
      },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Error saving game:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to save game: ${message}` },
      { status: 500 },
    );
  }
}

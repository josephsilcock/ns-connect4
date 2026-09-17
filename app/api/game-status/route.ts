import { NextRequest, NextResponse } from "next/server";
import { GameStatus } from "@/app/lib/connect4Controller";
import { prisma } from "@/app/lib/prisma";


export async function GET() {


}

export async function POST(request: NextRequest) {

  try{

    const body: GameStatus = await request.json();
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 },
      );
    }
    
    if (body.board === undefined || body.state === undefined || body.currentPlayer == undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    } else {
      await prisma.gameStatus.create({ data: { board: body.board, state: body.state, currentPlayer: body.currentPlayer } });
    }
    
    return NextResponse.json({ status: 200 });

  } catch (error) {
    console.error("Error saving game:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to save current game: ${message}` },
      { status: 500 },
    );
  }
}
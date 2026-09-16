import { NextRequest } from "next/server";
import { POST } from "../route";
import { prisma } from "@/app/lib/prisma";

jest.mock("@/app/lib/prisma", () => ({
  prisma: {
    games: {
      create: jest.fn(),
    },
  },
}));

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/games", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/games", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL =
      "postgresql://username:password@localhost:5432/connect4";
  });

  afterAll(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it("returns 400 when winner is missing", async () => {
    const response = await POST(makeRequest({ loser: 2 }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing required fields" });
    expect(prisma.games.create).not.toHaveBeenCalled();
  });

  it("returns 400 when loser is missing", async () => {
    const response = await POST(makeRequest({ winner: 1 }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing required fields" });
    expect(prisma.games.create).not.toHaveBeenCalled();
  });

  it("records a playerOneWin when winner is 1", async () => {
    (prisma.games.create as jest.Mock).mockResolvedValue({});

    const response = await POST(makeRequest({ winner: 1, loser: 2 }));

    expect(prisma.games.create).toHaveBeenCalledWith({
      data: { playerOneWin: true },
    });
    expect(response.status).toBe(200);
  });

  it("records a playerTwoWin when winner is 2", async () => {
    (prisma.games.create as jest.Mock).mockResolvedValue({});

    const response = await POST(makeRequest({ winner: 2, loser: 1 }));

    expect(prisma.games.create).toHaveBeenCalledWith({
      data: { playerTwoWin: true },
    });
    expect(response.status).toBe(200);
  });

  it("records a game with no winner flags for any other winner value", async () => {
    (prisma.games.create as jest.Mock).mockResolvedValue({});

    const response = await POST(makeRequest({ winner: 0, loser: 0 }));

    expect(prisma.games.create).toHaveBeenCalledWith({});
    expect(response.status).toBe(200);
  });

  it("returns 500 when DATABASE_URL is not configured", async () => {
    delete process.env.DATABASE_URL;
    (prisma.games.create as jest.Mock).mockResolvedValue({});

    const response = await POST(makeRequest({ winner: 1, loser: 2 }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Database not configured" });
  });

  it("returns 500 with the error message when prisma throws", async () => {
    (prisma.games.create as jest.Mock).mockRejectedValue(
      new Error("connection refused"),
    );

    const response = await POST(makeRequest({ winner: 1, loser: 2 }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to save game: connection refused",
    });
  });
});

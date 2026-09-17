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

  it("returns 400 when playerOneName is missing", async () => {
    const response = await POST(
      makeRequest({ playerTwoName: "Bob", winner: "Bob" }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing required fields" });
    expect(prisma.games.create).not.toHaveBeenCalled();
  });

  it("returns 400 when playerTwoName is missing", async () => {
    const response = await POST(
      makeRequest({ playerOneName: "Alice", winner: "Alice" }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing required fields" });
    expect(prisma.games.create).not.toHaveBeenCalled();
  });

  it("returns 400 when winner is missing", async () => {
    const response = await POST(
      makeRequest({ playerOneName: "Alice", playerTwoName: "Bob" }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing required fields" });
    expect(prisma.games.create).not.toHaveBeenCalled();
  });

  it("returns 400 when winner is not playerOneName, playerTwoName, or draw", async () => {
    const response = await POST(
      makeRequest({
        playerOneName: "Alice",
        playerTwoName: "Bob",
        winner: "Charlie",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'winner must be "Alice", "Bob", or "draw"',
    });
    expect(prisma.games.create).not.toHaveBeenCalled();
  });

  it("records a game when playerOneName wins", async () => {
    (prisma.games.create as jest.Mock).mockResolvedValue({});

    const response = await POST(
      makeRequest({
        playerOneName: "Alice",
        playerTwoName: "Bob",
        winner: "Alice",
      }),
    );

    expect(prisma.games.create).toHaveBeenCalledWith({
      data: {
        playerOneName: "Alice",
        playerTwoName: "Bob",
        winner: "Alice",
      },
    });
    expect(response.status).toBe(200);
  });

  it("records a game when playerTwoName wins", async () => {
    (prisma.games.create as jest.Mock).mockResolvedValue({});

    const response = await POST(
      makeRequest({
        playerOneName: "Alice",
        playerTwoName: "Bob",
        winner: "Bob",
      }),
    );

    expect(prisma.games.create).toHaveBeenCalledWith({
      data: {
        playerOneName: "Alice",
        playerTwoName: "Bob",
        winner: "Bob",
      },
    });
    expect(response.status).toBe(200);
  });

  it("records a game when the result is a draw", async () => {
    (prisma.games.create as jest.Mock).mockResolvedValue({});

    const response = await POST(
      makeRequest({
        playerOneName: "Alice",
        playerTwoName: "Bob",
        winner: "draw",
      }),
    );

    expect(prisma.games.create).toHaveBeenCalledWith({
      data: {
        playerOneName: "Alice",
        playerTwoName: "Bob",
        winner: "draw",
      },
    });
    expect(response.status).toBe(200);
  });

  it("returns 500 when DATABASE_URL is not configured", async () => {
    delete process.env.DATABASE_URL;
    (prisma.games.create as jest.Mock).mockResolvedValue({});

    const response = await POST(
      makeRequest({
        playerOneName: "Alice",
        playerTwoName: "Bob",
        winner: "Alice",
      }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Database not configured" });
  });

  it("returns 500 with the error message when prisma throws", async () => {
    (prisma.games.create as jest.Mock).mockRejectedValue(
      new Error("connection refused"),
    );

    const response = await POST(
      makeRequest({
        playerOneName: "Alice",
        playerTwoName: "Bob",
        winner: "Alice",
      }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to save game: connection refused",
    });
  });
});

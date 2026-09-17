import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import { GameStatus, Player } from "@/app/lib/connect4Controller";
import { prisma } from "@/app/lib/prisma";

jest.mock("@/app/lib/prisma", () => ({
  prisma: {
    gameStatus: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const findFirst = prisma.gameStatus.findFirst as jest.Mock;
const create = prisma.gameStatus.create as jest.Mock;

const board: Player[][] = Array.from({ length: 6 }, () =>
  Array<Player>(7).fill(0),
);

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    board,
    state: "ongoing",
    currentPlayer: 1,
    updatedAt: new Date("2026-09-17T10:00:00.000Z"),
    ...overrides,
  };
}

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/game-status", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("/api/game-status", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL =
      "postgresql://username:password@localhost:5432/connect4";
    // The handlers log expected failures; keep the test output readable.
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    process.env.DATABASE_URL = originalDatabaseUrl;
    jest.restoreAllMocks();
  });

  describe("GET", () => {
    it("returns 404 when no game has been saved", async () => {
      findFirst.mockResolvedValue(null);

      const response = await GET();

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "No saved games" });
    });

    it("reads the most recently saved row", async () => {
      findFirst.mockResolvedValue(makeRow());

      await GET();

      expect(findFirst).toHaveBeenCalledWith({ orderBy: { id: "desc" } });
    });

    it("maps a stored row onto a GameStatus", async () => {
      findFirst.mockResolvedValue(makeRow({ currentPlayer: 2 }));

      const response = await GET();

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        board,
        state: "ongoing",
        currentPlayer: 2,
      });
    });

    it("omits the id and updatedAt columns from the response", async () => {
      findFirst.mockResolvedValue(makeRow());

      const body = await (await GET()).json();

      expect(body).not.toHaveProperty("id");
      expect(body).not.toHaveProperty("updatedAt");
    });

    it("derives winner from currentPlayer once the game is won", async () => {
      findFirst.mockResolvedValue(makeRow({ state: "won", currentPlayer: 2 }));

      const body = await (await GET()).json();

      expect(body.winner).toBe(2);
    });

    it("returns 500 with the error message when prisma throws", async () => {
      findFirst.mockRejectedValue(new Error("connection refused"));

      const response = await GET();

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Failed to load saved game: connection refused",
      });
    });
  });

  describe("POST", () => {
    const status: GameStatus = { board, state: "ongoing", currentPlayer: 1 };

    it("saves the board, state and current player", async () => {
      create.mockResolvedValue(makeRow());

      const response = await POST(makeRequest(status));

      expect(create).toHaveBeenCalledWith({
        data: { board, state: "ongoing", currentPlayer: 1 },
      });
      expect(response.status).toBe(200);
    });

    it("returns 500 when DATABASE_URL is not configured", async () => {
      delete process.env.DATABASE_URL;

      const response = await POST(makeRequest(status));

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Database not configured",
      });
      expect(create).not.toHaveBeenCalled();
    });

    it("returns 500 with the error message when prisma throws", async () => {
      create.mockRejectedValue(new Error("connection refused"));

      const response = await POST(makeRequest(status));

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Failed to save current game: connection refused",
      });
    });
  });

  it("round-trips a won game through POST and GET", async () => {
    const won: GameStatus = {
      board,
      state: "won",
      currentPlayer: 2,
      winner: 2,
    };
    create.mockResolvedValue(makeRow());

    await POST(makeRequest(won));

    // Feed whatever POST stored back through GET, as the database would.
    const stored = create.mock.calls[0][0].data;
    findFirst.mockResolvedValue(makeRow(stored));

    expect(await (await GET()).json()).toEqual(won);
  });
});

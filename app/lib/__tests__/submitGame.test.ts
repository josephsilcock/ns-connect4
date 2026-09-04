import { submitGame } from "../submitGame";

describe("submitGame", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should POST the submission to the games endpoint", async () => {
    fetchMock.mockResolvedValue({ ok: true });

    await submitGame({ winner: 1, loser: 2 });

    expect(fetchMock).toHaveBeenCalledWith("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner: 1, loser: 2 }),
    });
  });

  it("should log rather than throw when the API rejects the game", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "boom",
    });

    await expect(submitGame({ winner: 1, loser: 2 })).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it("should log rather than throw when the request fails", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));

    await expect(submitGame({ winner: 0, loser: 0 })).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});

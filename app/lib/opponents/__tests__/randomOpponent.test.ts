import { RandomOpponent } from "../randomOpponent";

describe("RandomOpponent", () => {
  it("should choose a column from the valid columns list", async () => {
    const opponent = new RandomOpponent();
    const validColumns = [1, 3, 5];

    const column = await opponent.chooseMove([[0]], 1, validColumns);

    expect(validColumns).toContain(column);
  });

  it("should choose the only column when just one is valid", async () => {
    const opponent = new RandomOpponent();

    const column = await opponent.chooseMove([[0]], 1, [4]);

    expect(column).toBe(4);
  });

  it("should pick the column at the index Math.random maps to", async () => {
    const opponent = new RandomOpponent();
    jest.spyOn(Math, "random").mockReturnValue(0.5);

    const column = await opponent.chooseMove([[0]], 1, [1, 3, 5, 6]);

    expect(column).toBe(5);

    jest.restoreAllMocks();
  });
});

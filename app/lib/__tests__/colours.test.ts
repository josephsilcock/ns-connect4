import {
  BOARD_BACKGROUNDS,
  LIGHTNESS_SEPARATION_WAIVING_HUE,
  MIN_DELTA_E,
  MIN_DELTA_E_COLOUR_VISION,
  PALETTE,
  allowedPartners,
  chroma,
  deltaE,
  hexToOklab,
  hexToRgb,
  hueSeparation,
  isColourPairAllowed,
  isColourVisible,
  rgbToHex,
  simulateColourVision,
} from "../colours";

const byName = (name: string) => {
  const colour = PALETTE.find((entry) => entry.name === name);
  if (!colour) throw new Error(`No palette colour named ${name}`);
  return colour.hex;
};

describe("colour conversion", () => {
  it("should parse hex with and without a leading hash", () => {
    expect(hexToRgb("#ef4444")).toEqual({ r: 239, g: 68, b: 68 });
    expect(hexToRgb("ef4444")).toEqual({ r: 239, g: 68, b: 68 });
  });

  it("should reject anything that is not a six digit hex colour", () => {
    expect(() => hexToRgb("#fff")).toThrow();
    expect(() => hexToRgb("red")).toThrow();
  });

  it("should round trip through rgb", () => {
    expect(rgbToHex(hexToRgb("#3b82f6"))).toBe("#3b82f6");
  });

  it("should place white and black at the ends of the lightness axis", () => {
    const white = hexToOklab("#ffffff");
    const black = hexToOklab("#000000");

    expect(white.L).toBeCloseTo(1, 2);
    expect(black.L).toBeCloseTo(0, 2);
    expect(chroma(white)).toBeCloseTo(0, 2);
    expect(chroma(black)).toBeCloseTo(0, 2);
  });
});

describe("deltaE", () => {
  it("should be zero for a colour against itself", () => {
    expect(deltaE(hexToOklab("#ef4444"), hexToOklab("#ef4444"))).toBe(0);
  });

  it("should be symmetric", () => {
    const a = hexToOklab("#ef4444");
    const b = hexToOklab("#3b82f6");

    expect(deltaE(a, b)).toBeCloseTo(deltaE(b, a), 10);
  });
});

describe("hueSeparation", () => {
  it("should never exceed half a turn", () => {
    for (const first of PALETTE) {
      for (const second of PALETTE) {
        const separation = hueSeparation(
          hexToOklab(first.hex),
          hexToOklab(second.hex),
        );
        expect(separation).toBeGreaterThanOrEqual(0);
        expect(separation).toBeLessThanOrEqual(180);
      }
    }
  });

  it("should measure the short way round the hue circle", () => {
    // 350 degrees apart one way is 10 degrees the other.
    const separation = hueSeparation(
      { L: 0.6, a: 0.1, b: 0.0 },
      { L: 0.6, a: 0.0984, b: -0.0174 },
    );

    expect(separation).toBeLessThan(15);
  });
});

describe("simulateColourVision", () => {
  it("should pull red and green together for a deuteranope", () => {
    const red = "#dc2626";
    const green = "#15803d";

    const asSeen = deltaE(
      hexToOklab(simulateColourVision(red, "deuteranopia")),
      hexToOklab(simulateColourVision(green, "deuteranopia")),
    );

    expect(asSeen).toBeLessThan(deltaE(hexToOklab(red), hexToOklab(green)));
  });

  it("should leave a colour recognisable rather than blanking it", () => {
    expect(simulateColourVision("#3b82f6", "deuteranopia")).toMatch(
      /^#[0-9a-f]{6}$/,
    );
  });
});

describe("isColourVisible", () => {
  it("should reject colours that vanish into either board background", () => {
    for (const background of BOARD_BACKGROUNDS) {
      expect(isColourVisible(background).ok).toBe(false);
    }
    expect(isColourVisible("#fefefe").ok).toBe(false);
    expect(isColourVisible("#010101").ok).toBe(false);
  });

  it("should accept a mid toned colour", () => {
    expect(isColourVisible("#dc2626")).toEqual({ ok: true });
  });
});

describe("isColourPairAllowed", () => {
  it("should reject a player taking the colour the other player has", () => {
    const result = isColourPairAllowed("#dc2626", "#DC2626");

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/taken/i);
  });

  it("should reject two colours that are simply too close", () => {
    const result = isColourPairAllowed("#dc2626", "#e03030");

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/similar/i);
  });

  it("should reject red against green even though they sit far apart in OKLab", () => {
    const red = "#dc2626";
    const green = "#15803d";

    expect(deltaE(hexToOklab(red), hexToOklab(green))).toBeGreaterThan(
      MIN_DELTA_E,
    );

    const result = isColourPairAllowed(red, green);
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/colour blindness/i);
  });

  it("should reject a pair that is close in hue at a similar lightness", () => {
    const result = isColourPairAllowed(byName("Gold"), byName("Orange"));

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/hue/i);
  });

  it("should allow a close hue when lightness carries the difference", () => {
    const sky = hexToOklab(byName("Sky"));
    const navy = hexToOklab(byName("Navy"));

    expect(hueSeparation(sky, navy)).toBeLessThan(60);
    expect(Math.abs(sky.L - navy.L)).toBeGreaterThanOrEqual(
      LIGHTNESS_SEPARATION_WAIVING_HUE,
    );
    expect(isColourPairAllowed(byName("Sky"), byName("Navy"))).toEqual({
      ok: true,
    });
  });

  it("should allow a well separated pair", () => {
    expect(isColourPairAllowed(byName("Crimson"), byName("Sky"))).toEqual({
      ok: true,
    });
  });

  it("should reject a colour that is invisible even against a fine partner", () => {
    const result = isColourPairAllowed("#ffffff", byName("Navy"));

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/background/i);
  });

  it("should give the same verdict whichever player picked first", () => {
    for (const first of PALETTE) {
      for (const second of PALETTE) {
        expect(isColourPairAllowed(first.hex, second.hex).ok).toBe(
          isColourPairAllowed(second.hex, first.hex).ok,
        );
      }
    }
  });
});

describe("PALETTE", () => {
  it("should have unique names and colours", () => {
    expect(new Set(PALETTE.map((c) => c.name)).size).toBe(PALETTE.length);
    expect(new Set(PALETTE.map((c) => c.hex)).size).toBe(PALETTE.length);
  });

  it("should only offer colours visible against both board backgrounds", () => {
    for (const { name, hex } of PALETTE) {
      expect([name, isColourVisible(hex).ok]).toEqual([name, true]);
    }
  });

  it("should leave player two a real choice whatever player one picks", () => {
    for (const { name, hex } of PALETTE) {
      expect([name, allowedPartners(hex).length]).toEqual([
        name,
        expect.any(Number),
      ]);
      expect(allowedPartners(hex).length).toBeGreaterThanOrEqual(4);
    }
  });

  it("should never offer a partner that is hard to tell apart under colour blindness", () => {
    for (const { hex } of PALETTE) {
      for (const partner of allowedPartners(hex)) {
        for (const kind of [
          "protanopia",
          "deuteranopia",
          "tritanopia",
        ] as const) {
          const asSeen = deltaE(
            hexToOklab(simulateColourVision(hex, kind)),
            hexToOklab(simulateColourVision(partner.hex, kind)),
          );
          expect(asSeen).toBeGreaterThanOrEqual(MIN_DELTA_E_COLOUR_VISION);
        }
      }
    }
  });

  it("should never list a colour as its own partner", () => {
    for (const { hex } of PALETTE) {
      expect(allowedPartners(hex).map((c) => c.hex)).not.toContain(hex);
    }
  });
});

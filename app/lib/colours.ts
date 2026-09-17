/**
 * Colour utilities for choosing distinguishable player piece colours.
 *
 * Distance is measured in OKLab rather than sRGB: sRGB channels are not
 * perceptually weighted, so Euclidean distance there over-weights green and
 * bunches dark colours together. OKLab is perceptually uniform, so a plain
 * Euclidean distance in it tracks how different two colours actually look.
 */

export type Rgb = { r: number; g: number; b: number }; // 0-255
export type Oklab = { L: number; a: number; b: number };
export type ColourVision = "protanopia" | "deuteranopia" | "tritanopia";

export type PaletteColour = { name: string; hex: string };

export type ColourCheck = { ok: boolean; reason?: string };

/** Direct perceptual distance two player colours must keep between them. */
export const MIN_DELTA_E = 0.2;

/**
 * Distance the pair must still keep once simulated through each form of
 * colour blindness. Red and green sit far apart in OKLab but collapse onto
 * each other for a deuteranope, and telling the two players' pieces apart is
 * the whole game, so this gate matters more than the direct one.
 */
export const MIN_DELTA_E_COLOUR_VISION = 0.12;

/** Hue angle separation, in degrees. Carries discrimination at small sizes. */
export const MIN_HUE_SEPARATION_DEGREES = 60;

/**
 * Lightness gap that makes the hue gate unnecessary. Sky blue and navy share
 * a hue but are never confused, because one is far lighter than the other.
 */
export const LIGHTNESS_SEPARATION_WAIVING_HUE = 0.18;

/** Distance each colour must keep from the board behind it, in both themes. */
export const MIN_BACKGROUND_DELTA_E = 0.25;

/** Below this chroma a colour is effectively grey and its hue is meaningless. */
const MIN_MEANINGFUL_CHROMA = 0.04;

/** The board renders on white in light mode and black in dark mode. */
export const BOARD_BACKGROUNDS = ["#ffffff", "#000000"];

export const PALETTE: PaletteColour[] = [
  { name: "Gold", hex: "#eab308" },
  { name: "Mint", hex: "#4ade80" },
  { name: "Sky", hex: "#38bdf8" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Crimson", hex: "#dc2626" },
  { name: "Magenta", hex: "#db2777" },
  { name: "Violet", hex: "#7c3aed" },
  { name: "Navy", hex: "#1d4ed8" },
];

export function hexToRgb(hex: string): Rgb {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) {
    throw new Error(`Not a six digit hex colour: ${hex}`);
  }
  const value = parseInt(match[1], 16);
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (c: number) =>
    Math.round(Math.min(255, Math.max(0, c)))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(channel: number): number {
  const c = Math.min(1, Math.max(0, channel));
  return (
    255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)
  );
}

function linearRgbToOklab(r: number, g: number, b: number): Oklab {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

export function rgbToOklab({ r, g, b }: Rgb): Oklab {
  return linearRgbToOklab(srgbToLinear(r), srgbToLinear(g), srgbToLinear(b));
}

export function hexToOklab(hex: string): Oklab {
  return rgbToOklab(hexToRgb(hex));
}

export function deltaE(first: Oklab, second: Oklab): number {
  return Math.hypot(first.L - second.L, first.a - second.a, first.b - second.b);
}

export function chroma({ a, b }: Oklab): number {
  return Math.hypot(a, b);
}

/** Hue angle in degrees, 0-360. */
export function hueAngle({ a, b }: Oklab): number {
  return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
}

/** Smallest angle between two hues, 0-180. */
export function hueSeparation(first: Oklab, second: Oklab): number {
  const difference = Math.abs(hueAngle(first) - hueAngle(second));
  return Math.min(difference, 360 - difference);
}

/**
 * Viénot, Brettel and Mollon dichromat simulation matrices, applied in
 * linear RGB.
 */
const COLOUR_VISION_MATRICES: Record<ColourVision, number[][]> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

export const COLOUR_VISION_TYPES = Object.keys(
  COLOUR_VISION_MATRICES,
) as ColourVision[];

export function simulateColourVision(hex: string, kind: ColourVision): string {
  const { r, g, b } = hexToRgb(hex);
  const linear = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  const [x, y, z] = COLOUR_VISION_MATRICES[kind].map(
    (row) => row[0] * linear[0] + row[1] * linear[1] + row[2] * linear[2],
  );
  return rgbToHex({
    r: linearToSrgb(x),
    g: linearToSrgb(y),
    b: linearToSrgb(z),
  });
}

/** Whether a colour stands out from the board in both light and dark mode. */
export function isColourVisible(hex: string): ColourCheck {
  const colour = hexToOklab(hex);
  for (const background of BOARD_BACKGROUNDS) {
    if (deltaE(colour, hexToOklab(background)) < MIN_BACKGROUND_DELTA_E) {
      return {
        ok: false,
        reason: "Too close to the board background to see clearly",
      };
    }
  }
  return { ok: true };
}

/** Whether two players can safely use these colours at the same time. */
export function isColourPairAllowed(
  first: string,
  second: string,
): ColourCheck {
  const a = hexToOklab(first);
  const b = hexToOklab(second);

  if (first.toLowerCase() === second.toLowerCase()) {
    return { ok: false, reason: "Already taken by the other player" };
  }

  const firstVisible = isColourVisible(first);
  if (!firstVisible.ok) return firstVisible;
  const secondVisible = isColourVisible(second);
  if (!secondVisible.ok) return secondVisible;

  if (deltaE(a, b) < MIN_DELTA_E) {
    return { ok: false, reason: "Too similar to the other player's colour" };
  }

  const bothAreColourful =
    chroma(a) >= MIN_MEANINGFUL_CHROMA && chroma(b) >= MIN_MEANINGFUL_CHROMA;
  const lightnessCarriesTheDifference =
    Math.abs(a.L - b.L) >= LIGHTNESS_SEPARATION_WAIVING_HUE;
  if (
    bothAreColourful &&
    !lightnessCarriesTheDifference &&
    hueSeparation(a, b) < MIN_HUE_SEPARATION_DEGREES
  ) {
    return {
      ok: false,
      reason: "Too close in hue to the other player's colour",
    };
  }

  for (const kind of COLOUR_VISION_TYPES) {
    const simulated = deltaE(
      hexToOklab(simulateColourVision(first, kind)),
      hexToOklab(simulateColourVision(second, kind)),
    );
    if (simulated < MIN_DELTA_E_COLOUR_VISION) {
      return {
        ok: false,
        reason: "Hard to tell apart with colour blindness",
      };
    }
  }

  return { ok: true };
}

/** Palette entries the other player may still pick. */
export function allowedPartners(hex: string): PaletteColour[] {
  return PALETTE.filter(({ hex: other }) => isColourPairAllowed(hex, other).ok);
}

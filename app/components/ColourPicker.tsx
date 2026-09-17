"use client";

import { PALETTE, isColourPairAllowed } from "../lib/colours";

type ColourPickerProps = {
  label: string;
  selected: string | null;
  /** The other player's colour, once they have one. */
  opponentColour: string | null;
  disabled?: boolean;
  onSelect: (hex: string) => void;
};

export default function ColourPicker({
  label,
  selected,
  opponentColour,
  disabled = false,
  onSelect,
}: ColourPickerProps) {
  return (
    <fieldset disabled={disabled} className="disabled:opacity-40">
      <legend className="mb-2 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {PALETTE.map((colour) => {
          const { ok, reason } = opponentColour
            ? isColourPairAllowed(opponentColour, colour.hex)
            : { ok: true, reason: undefined };
          const isSelected = selected === colour.hex;

          return (
            <button
              key={colour.hex}
              type="button"
              disabled={!ok}
              aria-pressed={isSelected}
              aria-label={ok ? colour.name : `${colour.name}, ${reason}`}
              title={ok ? colour.name : `${colour.name} — ${reason}`}
              onClick={() => onSelect(colour.hex)}
              style={{ backgroundColor: colour.hex }}
              className={`h-10 w-10 rounded-full transition-all ${
                isSelected
                  ? "ring-2 ring-offset-2 ring-black dark:ring-white"
                  : "ring-1 ring-black/10 dark:ring-white/20"
              } ${ok ? "cursor-pointer hover:scale-110" : "cursor-not-allowed opacity-20"}`}
            />
          );
        })}
      </div>
    </fieldset>
  );
}

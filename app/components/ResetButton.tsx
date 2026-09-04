"use client";

type ResetButtonProps = {
  onReset: () => void;
  label?: string;
};

export default function ResetButton({
  onReset,
  label = "New game",
}: ResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
    >
      {label}
    </button>
  );
}

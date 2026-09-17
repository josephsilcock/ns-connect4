type GameOverProps = {
  gameState: "won" | "draw";
  winner: number | undefined;
  winnerName: string;
};

const WINNER_COLOURS: Record<number, string> = {
  1: "text-red-500",
  2: "text-yellow-500",
};

export default function GameOver({
  gameState,
  winner,
  winnerName,
}: GameOverProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="text-2xl font-bold">
        {gameState === "won" && winner !== undefined ? (
          <>
            <span className={WINNER_COLOURS[winner]}>{winnerName}</span> wins!
          </>
        ) : (
          "Draw!"
        )}
      </div>
    </div>
  );
}

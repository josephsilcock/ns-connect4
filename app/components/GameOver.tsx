type GameOverProps = {
  gameState: "won" | "draw";
  winner: number | undefined;
  onRestart: () => void;
};

export default function GameOver({
  gameState,
  winner,
  onRestart,
}: GameOverProps) {
  return (
    <div>
      {gameState}
      {winner}
      <button onClick={onRestart}>Play Again</button>
    </div>
  );
}

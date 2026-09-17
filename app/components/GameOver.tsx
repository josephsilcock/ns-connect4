import { Player } from "../lib/connect4Controller";

type GameOverProps = {
  gameState: "won" | "draw";
  winner: number | undefined;
  /** Piece colour per player. Index 0 is the empty cell. */
  colours: Record<Player, string>;
};

export default function GameOver({
  gameState,
  winner,
  colours,
}: GameOverProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="text-2xl font-bold">
        {gameState === "won" && winner !== undefined ? (
          <>
            Player{" "}
            <span style={{ color: colours[winner as Player] }}>{winner}</span>{" "}
            wins!
          </>
        ) : (
          "Draw!"
        )}
      </div>
    </div>
  );
}

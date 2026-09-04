import { GameSubmission } from "./database.types";

/**
 * Posts a finished game to the API. Fire-and-forget: a failed upload should
 * never stop the game being playable, so errors are logged rather than thrown.
 */
export async function submitGame(submission: GameSubmission): Promise<void> {
  try {
    const response = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Failed to save game:", response.status, body);
    }
  } catch (error) {
    console.error("Failed to save game:", error);
  }
}

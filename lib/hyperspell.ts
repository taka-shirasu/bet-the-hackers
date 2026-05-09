import Hyperspell from "hyperspell";

let _client: Hyperspell | null = null;

/** Singleton Hyperspell client */
export function createHyperspellClient(): Hyperspell {
  if (!_client) {
    _client = new Hyperspell({ apiKey: process.env.HYPERSPELL_API_KEY ?? "" });
  }
  return _client;
}

/** Store a bet action in Hyperspell memory */
export async function storeBetMemory(
  userId: string,
  teamId: string,
  teamName: string,
  amount: number,
  winProbability: number,
) {
  const client = createHyperspellClient();
  const text = [
    `User ${userId} bet ${amount} credits on "${teamName}" (team ${teamId})`,
    `Win probability at time of bet: ${Math.round(winProbability * 100)}%`,
    `Placed at ${new Date().toISOString()}`,
  ].join(". ");

  return client.memories.add({
    text,
    metadata: {
      type: "bet",
      team_id: teamId,
      team_name: teamName,
      amount: amount,
      win_probability: winProbability,
      user_id: userId,
    },
  });
}

/** Store a swipe action in Hyperspell memory */
export async function storeSwipeMemory(
  userId: string,
  teamId: string,
  teamName: string,
  direction: "left" | "right",
) {
  const client = createHyperspellClient();
  const text =
    direction === "right"
      ? `User ${userId} swiped right (advanced) on "${teamName}" (team ${teamId})`
      : `User ${userId} swiped left (eliminated) on "${teamName}" (team ${teamId})`;

  return client.memories.add({
    text,
    metadata: {
      type: "swipe",
      team_id: teamId,
      team_name: teamName,
      direction,
      user_id: userId,
    },
  });
}

/** Search user memory for relevant context */
export async function searchUserMemory(userId: string, query: string) {
  const client = createHyperspellClient();
  return client.memories.search({
    query,
    sources: ["vault"],
    answer: true,
    options: {
      filter: { user_id: userId },
    },
  });
}

/** Retrieve user preferences based on past bets and swipes */
export async function getUserPreferences(userId: string) {
  const client = createHyperspellClient();
  return client.memories.search({
    query:
      "What are this user's betting preferences, favorite teams, and patterns?",
    sources: ["vault"],
    answer: true,
    options: {
      filter: { user_id: userId },
    },
  });
}

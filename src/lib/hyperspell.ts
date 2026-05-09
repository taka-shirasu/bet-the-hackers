import Hyperspell from "hyperspell";

function getHyperspellApiKey(): string {
  const key = process.env.HYPERSPELL_API_KEY;
  if (!key) {
    throw new Error("HYPERSPELL_API_KEY environment variable is not set");
  }
  return key;
}

/**
 * Creates a Hyperspell client scoped to a specific user.
 */
export function createHyperspellClient(userId?: string) {
  return new Hyperspell({
    apiKey: getHyperspellApiKey(),
    ...(userId ? { userID: userId } : {}),
  });
}

/**
 * Stores a betting action in Hyperspell memory for future recall.
 */
export async function storeBetMemory(
  userId: string,
  bet: {
    projectId: string;
    projectName: string;
    direction: "win" | "skip";
    amount: number;
    techStack: string[];
  },
) {
  const client = createHyperspellClient(userId);
  const text = [
    `User bet ${bet.amount} on "${bet.projectName}" (${bet.direction}).`,
    `Tech stack: ${bet.techStack.join(", ")}.`,
    `Project ID: ${bet.projectId}.`,
  ].join(" ");

  return client.memories.add({
    text,
    title: `Bet: ${bet.projectName} — ${bet.direction}`,
    metadata: {
      collection: "bets",
      projectId: bet.projectId,
      direction: bet.direction,
      amount: String(bet.amount),
    },
  });
}

/**
 * Stores a swipe action (left = skip, right = interested) in memory.
 */
export async function storeSwipeMemory(
  userId: string,
  swipe: {
    projectId: string;
    projectName: string;
    direction: "left" | "right";
    techStack: string[];
  },
) {
  const client = createHyperspellClient(userId);
  const action = swipe.direction === "right" ? "interested in" : "skipped";
  const text = [
    `User ${action} "${swipe.projectName}".`,
    `Tech stack: ${swipe.techStack.join(", ")}.`,
    `Project ID: ${swipe.projectId}.`,
  ].join(" ");

  return client.memories.add({
    text,
    title: `Swipe: ${swipe.projectName} — ${swipe.direction}`,
    metadata: {
      collection: "swipes",
      projectId: swipe.projectId,
      direction: swipe.direction,
    },
  });
}

/**
 * Searches the user's betting and swipe history for relevant memories.
 */
export async function searchUserMemory(userId: string, query: string) {
  const client = createHyperspellClient(userId);
  return client.memories.search({
    query,
    sources: ["vault"],
    answer: true,
  });
}

/**
 * Retrieves the user's past preferences and patterns to inform recommendations.
 */
export async function getUserPreferences(userId: string) {
  const client = createHyperspellClient(userId);
  return client.memories.search({
    query:
      "What kind of hackathon projects does this user prefer? What tech stacks and project types do they tend to bet on?",
    sources: ["vault"],
    answer: true,
    options: {
      filter: {
        collection: "swipes",
      },
    },
  });
}

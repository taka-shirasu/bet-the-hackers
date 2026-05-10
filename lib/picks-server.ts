import { getMongoClient } from "@/lib/mongodb";

export type PickRecord = {
  participantId: string;
  fullName: string;
  winnerTeamId: string;
  winnerTeamName: string;
  winnerScore: number;
  createdAt: string;
  updatedAt: string;
};

export type PicksPayload = {
  recent: PickRecord[];
  leaderboard: { teamId: string; teamName: string; votes: number; share: number }[];
};

export async function loadPicks(): Promise<PicksPayload> {
  try {
    const client = await getMongoClient();
    const collection = client
      .db(getDbName())
      .collection(process.env.MONGODB_PICKS_COLLECTION ?? "winner_picks");
    const docs = await collection.find({}).sort({ updatedAt: -1 }).limit(200).toArray();

    const recent: PickRecord[] = docs.map((d) => ({
      participantId: String(d.participantId ?? ""),
      fullName: String(d.fullName ?? ""),
      winnerTeamId: String(d.winnerTeamId ?? ""),
      winnerTeamName: String(d.winnerTeamName ?? ""),
      winnerScore: Number(d.winnerScore ?? 0),
      createdAt: serializeDate(d.createdAt),
      updatedAt: serializeDate(d.updatedAt)
    }));

    const tally = new Map<string, { teamId: string; teamName: string; votes: number }>();
    for (const p of recent) {
      const existing = tally.get(p.winnerTeamId);
      if (existing) {
        existing.votes += 1;
      } else {
        tally.set(p.winnerTeamId, {
          teamId: p.winnerTeamId,
          teamName: p.winnerTeamName,
          votes: 1
        });
      }
    }

    const total = recent.length || 1;
    const leaderboard = Array.from(tally.values())
      .map((team) => ({ ...team, share: team.votes / total }))
      .sort((a, b) => b.votes - a.votes || a.teamName.localeCompare(b.teamName));

    return { recent, leaderboard };
  } catch (error) {
    console.error("Failed to load picks", error);
    return { recent: [], leaderboard: [] };
  }
}

function serializeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function getDbName(): string {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  const db = new URL(uri).pathname.slice(1);
  if (!db) throw new Error("Missing database in MONGODB_URI");
  return db;
}

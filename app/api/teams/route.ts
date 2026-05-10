import { NextResponse } from "next/server";

import { getMongoClient } from "@/lib/mongodb";
import { fallbackTeams, type TeamProfile } from "@/lib/teams";

export const dynamic = "force-dynamic";

const SUBMISSIONS_COLLECTION =
  process.env.MONGODB_SUBMISSIONS_COLLECTION ?? "submissions";
const SCORES_COLLECTION = process.env.MONGODB_SCORES_COLLECTION ?? "scores";

const COLOR_PALETTE = [
  "#ff4458",
  "#12b886",
  "#228be6",
  "#f59f00",
  "#7c3aed",
  "#e8590c",
  "#0ca678",
  "#d6336c",
  "#5f3dc4",
  "#1098ad"
];

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1100&q=80";

export async function GET() {
  try {
    const client = await getMongoClient();
    const db = client.db(getDbName());

    const [submissions, scores] = await Promise.all([
      db.collection(SUBMISSIONS_COLLECTION).find({}).sort({ createdAt: -1 }).toArray(),
      db.collection(SCORES_COLLECTION).find({}).toArray()
    ]);

    const scoresByTeam = new Map(scores.map((s) => [String(s.teamId), s]));

    const teams: TeamProfile[] = submissions.map((sub, idx) => {
      const id = String(sub.publicId ?? sub.id ?? sub._id);
      const score = scoresByTeam.get(id);
      const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];

      const competitiveness = clamp01to10(score?.competitiveness);
      const judgeFit = clamp01to10(score?.judgeFit);
      const marketability = clamp01to10(score?.marketability);
      const overall =
        score?.overall != null
          ? clampTo100(score.overall)
          : Math.round(((competitiveness + judgeFit + marketability) / 3) * 10);

      const members = Array.isArray(sub.members) ? sub.members : [];

      return {
        id,
        name: String(sub.teamName ?? "Unnamed team"),
        work: String(sub.projectDescription ?? ""),
        winScore: overall,
        likelihood: {
          field: Math.round(competitiveness * 10),
          judge: Math.round(judgeFit * 10),
          market: Math.round(marketability * 10)
        },
        image:
          (typeof score?.imageUrl === "string" && score.imageUrl) ||
          PLACEHOLDER_IMAGE,
        team: members.map((m: { name?: string; linkedin?: string }) => ({
          name: m.name ?? "Teammate",
          role: roleHint(sub),
          linkedin: m.linkedin ?? "https://linkedin.com"
        })),
        color
      };
    });

    teams.sort((a, b) => b.winScore - a.winScore);

    if (teams.length === 0) {
      return NextResponse.json({ source: "fallback", teams: fallbackTeams });
    }

    return NextResponse.json({ source: "mongodb", teams });
  } catch (error) {
    console.error("Failed to load teams from submissions+scores", error);
    return NextResponse.json({ source: "fallback", teams: fallbackTeams });
  }
}

function roleHint(sub: Record<string, unknown>): string {
  const track = typeof sub.track === "string" ? sub.track : "";
  const industry = typeof sub.industry === "string" ? sub.industry : "";
  return industry || track || "Builder";
}

function clamp01to10(n: unknown): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return 5;
  return Math.max(0, Math.min(10, x));
}

function clampTo100(n: unknown): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return 50;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function getDbName(): string {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  const db = new URL(uri).pathname.slice(1);
  if (!db) throw new Error("Missing database in MONGODB_URI");
  return db;
}

import "server-only";

import { llmJson } from "./integrations/openai";
import { storeEvidence } from "./integrations/hyperspell";
import { getMongoClient } from "@/lib/mongodb";
import type { EnrichedTeam } from "./profiler";

export type JudgeFitScore = {
  score_0_10: number;
  perJudge: { name: string; company: string; fit_0_10: number; reasoning: string }[];
  blurb: string;
};

export async function scoreJudgeFit(
  team: EnrichedTeam
): Promise<{ score: JudgeFitScore; llmMode: string; judgeCount: number }> {
  const judges = await loadJudges();
  if (judges.length === 0) {
    return {
      score: {
        score_0_10: 5,
        perJudge: [],
        blurb: "No judges submitted yet — neutral 5/10."
      },
      llmMode: "stub",
      judgeCount: 0
    };
  }

  const judgeBlock = judges
    .map(
      (j, i) =>
        `${i + 1}. ${j.name} (${j.company})\n   Looking for: ${j.competitionRequirements}`
    )
    .join("\n\n");

  const { value, mode: llmMode } = await llmJson<JudgeFitScore>(
    {
      system:
        "You score how well a hackathon team matches each judge's stated criteria. 0-10 per judge, then aggregate.",
      user: `Team: ${team.teamName}\nProject: ${team.projectDescription}\nTrack: ${team.track}\nIndustry: ${team.industry}\nWhy: ${team.insights}\n\nJudges:\n${judgeBlock}`,
      schemaHint: `{"score_0_10": number (avg of perJudge), "perJudge": [{"name": string, "company": string, "fit_0_10": number, "reasoning": string (max 120 chars)}], "blurb": string (max 200 chars)}`
    },
    () => stubScore(team, judges)
  );

  await storeEvidence([
    {
      namespace: `team:${team.teamId}`,
      key: "judge-fit",
      source: "manual",
      content: JSON.stringify(value, null, 2),
      storedAt: new Date().toISOString()
    }
  ]);

  return { score: clamp(value), llmMode, judgeCount: judges.length };
}

type JudgeDoc = {
  name: string;
  company: string;
  linkedin: string;
  competitionRequirements: string;
};

async function loadJudges(): Promise<JudgeDoc[]> {
  const client = await getMongoClient();
  const dbName = getDbName();
  const collectionName = process.env.MONGODB_JUDGES_COLLECTION ?? "judges";
  const docs = await client
    .db(dbName)
    .collection(collectionName)
    .find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  return docs.map((d) => ({
    name: String(d.name ?? ""),
    company: String(d.company ?? ""),
    linkedin: String(d.linkedin ?? ""),
    competitionRequirements: String(d.competitionRequirements ?? "")
  }));
}

function stubScore(team: EnrichedTeam, judges: JudgeDoc[]): JudgeFitScore {
  const perJudge = judges.map((j) => {
    const reqText = j.competitionRequirements.toLowerCase();
    const teamText = `${team.projectDescription} ${team.industry} ${team.track}`.toLowerCase();
    const overlapWords = reqText
      .split(/\W+/)
      .filter((w) => w.length > 4 && teamText.includes(w));
    const fit = Math.min(10, 4 + overlapWords.length);
    return {
      name: j.name,
      company: j.company,
      fit_0_10: fit,
      reasoning: `[stub] ${overlapWords.length} keyword overlaps with stated requirements.`
    };
  });
  const avg = perJudge.length
    ? perJudge.reduce((s, p) => s + p.fit_0_10, 0) / perJudge.length
    : 5;
  return {
    score_0_10: Math.round(avg),
    perJudge,
    blurb: `[stub] ${judges.length} judges keyword-matched. Set OPENAI_API_KEY for real scoring.`
  };
}

function clamp(score: JudgeFitScore): JudgeFitScore {
  return {
    ...score,
    score_0_10: Math.max(0, Math.min(10, Number(score.score_0_10) || 0)),
    perJudge: score.perJudge.map((p) => ({
      ...p,
      fit_0_10: Math.max(0, Math.min(10, Number(p.fit_0_10) || 0))
    }))
  };
}

function getDbName(): string {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  const db = new URL(uri).pathname.slice(1);
  if (!db) throw new Error("Missing database in MONGODB_URI");
  return db;
}

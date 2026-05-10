import "server-only";

import { profileTeam } from "./profiler";
import { scoreMarketability } from "./marketability";
import { scoreJudgeFit } from "./judge-fit";
import { scoreCompetitiveness } from "./competitiveness";
import { compositeScore } from "./ranker";
import { getMongoClient } from "@/lib/mongodb";
import type { Submission } from "@/lib/submissions";
import type { AgentStepResult, TeamScore } from "./types";

const SUBMISSIONS_COLLECTION =
  process.env.MONGODB_SUBMISSIONS_COLLECTION ?? "submissions";
const SCORES_COLLECTION = process.env.MONGODB_SCORES_COLLECTION ?? "scores";

export async function scoreOneTeam(teamId: string): Promise<TeamScore> {
  const submission = await loadSubmission(teamId);
  if (!submission) throw new Error(`Team ${teamId} not found`);
  const allSubmissions = await loadAllSubmissions();
  return runPipeline(submission, allSubmissions);
}

export async function scoreAllTeams(): Promise<TeamScore[]> {
  const allSubmissions = await loadAllSubmissions();
  const scores: TeamScore[] = [];
  for (const submission of allSubmissions) {
    try {
      scores.push(await runPipeline(submission, allSubmissions));
    } catch (error) {
      console.error(`Pipeline failed for ${submission.teamId}`, error);
    }
  }
  return scores;
}

async function runPipeline(
  focal: SubmissionWithId,
  allSubmissions: SubmissionWithId[]
): Promise<TeamScore> {
  const steps: AgentStepResult[] = [];

  const profilerStart = Date.now();
  const { enriched, mode: profilerMode, imageMode } = await profileTeam(focal);
  steps.push({
    agent: "profiler",
    status: "ok",
    durationMs: Date.now() - profilerStart,
    message: `Apify: ${profilerMode} · Image: ${imageMode} · ${enriched.members.length} members`
  });

  const allEnriched: typeof enriched[] = allSubmissions.map((s) => ({
    teamId: s.teamId,
    teamName: s.teamName,
    industry: s.industry,
    track: s.track,
    projectDescription: s.projectDescription,
    insights: s.insights,
    members: s.members.map((m) => ({ name: m.name, linkedin: m.linkedin }))
  }));

  const [marketResult, judgeResult] = await Promise.all([
    runStep("marketability", () => scoreMarketability(enriched), steps),
    runStep("judge-fit", () => scoreJudgeFit(enriched), steps)
  ]);

  const compResult = await runStep(
    "competitiveness",
    () => scoreCompetitiveness(enriched, allEnriched),
    steps
  );

  const market = marketResult?.score;
  const judge = judgeResult?.score;
  const comp = compResult?.score;

  const overall = compositeScore({
    competitiveness: comp?.score_0_10 ?? 5,
    judgeFit: judge?.score_0_10 ?? 5,
    marketability: market?.score_0_10 ?? 5
  });

  const teamScore: TeamScore = {
    teamId: focal.teamId,
    teamName: focal.teamName,
    imageUrl: enriched.imageUrl,
    competitiveness: comp?.score_0_10 ?? 5,
    judgeFit: judge?.score_0_10 ?? 5,
    marketability: market?.score_0_10 ?? 5,
    overall,
    blurbs: {
      competitiveness: comp?.blurb ?? "(skipped)",
      judgeFit: judge?.blurb ?? "(skipped)",
      marketability: market?.blurb ?? "(skipped)"
    },
    steps,
    scoredAt: new Date().toISOString()
  };

  await persistScore(teamScore);
  return teamScore;
}

async function runStep<T>(
  name: string,
  fn: () => Promise<T>,
  steps: AgentStepResult[]
): Promise<T | null> {
  const start = Date.now();
  try {
    const result = await fn();
    const meta =
      typeof result === "object" && result !== null
        ? Object.entries(result as Record<string, unknown>)
            .filter(([k]) => k.endsWith("Mode") || k === "judgeCount")
            .map(([k, v]) => `${k}=${String(v)}`)
            .join(" · ")
        : "";
    steps.push({
      agent: name,
      status: "ok",
      durationMs: Date.now() - start,
      message: meta || undefined,
      output: result
    });
    return result;
  } catch (error) {
    steps.push({
      agent: name,
      status: "error",
      durationMs: Date.now() - start,
      message: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

type SubmissionWithId = Submission & { teamId: string };

async function loadAllSubmissions(): Promise<SubmissionWithId[]> {
  const client = await getMongoClient();
  const docs = await client
    .db(getDbName())
    .collection(SUBMISSIONS_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(toSubmission);
}

async function loadSubmission(
  teamId: string
): Promise<SubmissionWithId | null> {
  const client = await getMongoClient();
  const doc = await client
    .db(getDbName())
    .collection(SUBMISSIONS_COLLECTION)
    .findOne({ publicId: teamId });
  return doc ? toSubmission(doc) : null;
}

function toSubmission(doc: Record<string, unknown>): SubmissionWithId {
  const members = Array.isArray(doc.members) ? (doc.members as { name?: string; linkedin: string }[]) : [];
  return {
    teamId: String(doc.publicId ?? doc.id ?? doc._id),
    id: String(doc.publicId ?? doc.id ?? doc._id),
    teamName: String(doc.teamName ?? ""),
    projectDescription: String(doc.projectDescription ?? ""),
    track: String(doc.track ?? ""),
    industry: String(doc.industry ?? ""),
    insights: String(doc.insights ?? ""),
    members,
    createdAt: String(doc.createdAt ?? new Date().toISOString())
  };
}

async function persistScore(score: TeamScore): Promise<void> {
  const client = await getMongoClient();
  await client
    .db(getDbName())
    .collection(SCORES_COLLECTION)
    .updateOne(
      { teamId: score.teamId },
      { $set: score },
      { upsert: true }
    );
}

function getDbName(): string {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  const db = new URL(uri).pathname.slice(1);
  if (!db) throw new Error("Missing database in MONGODB_URI");
  return db;
}

export async function loadAllScores(): Promise<TeamScore[]> {
  const client = await getMongoClient();
  const docs = await client
    .db(getDbName())
    .collection(SCORES_COLLECTION)
    .find({})
    .sort({ overall: -1 })
    .toArray();
  return docs.map((d) => ({
    teamId: String(d.teamId),
    teamName: String(d.teamName),
    imageUrl: d.imageUrl ? String(d.imageUrl) : undefined,
    competitiveness: Number(d.competitiveness ?? 0),
    judgeFit: Number(d.judgeFit ?? 0),
    marketability: Number(d.marketability ?? 0),
    overall: Number(d.overall ?? 0),
    blurbs: (d.blurbs ?? { competitiveness: "", judgeFit: "", marketability: "" }) as TeamScore["blurbs"],
    steps: (d.steps ?? []) as AgentStepResult[],
    scoredAt: String(d.scoredAt ?? "")
  }));
}

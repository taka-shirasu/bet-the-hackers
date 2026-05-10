import { NextResponse } from "next/server";

import { getMongoClient } from "@/lib/mongodb";
import { listEvidence } from "@/lib/agents/integrations/hyperspell";
import { loadAllScores } from "@/lib/agents/pipeline";
import { openaiMode } from "@/lib/agents/integrations/openai";
import { apifyMode } from "@/lib/agents/integrations/apify";
import { niaMode } from "@/lib/agents/integrations/nia";
import { hyperspellMode } from "@/lib/agents/integrations/hyperspell";
import type { IntegrationStatus } from "@/lib/agents/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [submissions, judges, scores, evidence] = await Promise.all([
    countCollection(process.env.MONGODB_SUBMISSIONS_COLLECTION ?? "submissions"),
    countCollection(process.env.MONGODB_JUDGES_COLLECTION ?? "judges"),
    loadAllScores(),
    listEvidence(20)
  ]);

  const integrations: IntegrationStatus[] = [
    { name: "apify", configured: apifyMode() === "live", mode: apifyMode(), envVar: "APIFY_TOKEN" },
    { name: "nia", configured: niaMode() === "live", mode: niaMode(), envVar: "NIA_API_KEY" },
    { name: "hyperspell", configured: hyperspellMode() === "live", mode: hyperspellMode(), envVar: "HYPERSPELL_API_KEY" },
    { name: "openai", configured: openaiMode() === "live", mode: openaiMode(), envVar: "OPENAI_API_KEY" }
  ];

  return NextResponse.json({
    counts: { submissions, judges, scores: scores.length, evidence: evidence.length },
    integrations,
    scores,
    evidence
  });
}

async function countCollection(name: string): Promise<number> {
  try {
    const client = await getMongoClient();
    return await client.db(getDbName()).collection(name).countDocuments({});
  } catch {
    return 0;
  }
}

function getDbName(): string {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  const db = new URL(uri).pathname.slice(1);
  if (!db) throw new Error("Missing database in MONGODB_URI");
  return db;
}

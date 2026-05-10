import { NextResponse } from "next/server";

import { loadAllScores, scoreAllTeams } from "@/lib/agents/pipeline";

export const dynamic = "force-dynamic";

export async function GET() {
  const scores = await loadAllScores();
  return NextResponse.json({ scores });
}

export async function POST() {
  try {
    const scores = await scoreAllTeams();
    return NextResponse.json({ ok: true, count: scores.length, scores });
  } catch (error) {
    console.error("scoreAllTeams failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scoring failed" },
      { status: 500 }
    );
  }
}

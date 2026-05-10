import { NextResponse } from "next/server";

import { scoreOneTeam } from "@/lib/agents/pipeline";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await context.params;
  try {
    const score = await scoreOneTeam(teamId);
    return NextResponse.json({ ok: true, score });
  } catch (error) {
    console.error("scoreOneTeam failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scoring failed" },
      { status: 500 }
    );
  }
}

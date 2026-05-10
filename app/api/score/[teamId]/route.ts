import { NextResponse } from "next/server";

import { scoreOneTeam } from "@/lib/agents/pipeline";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  let teamId = "";
  try {
    teamId = (await context.params).teamId;
    const score = await scoreOneTeam(teamId);
    return NextResponse.json({ ok: true, score });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error(`scoreOneTeam(${teamId}) failed:`, error);
    return new Response(
      JSON.stringify({ error: message, stack: stack?.split("\n").slice(0, 8) }),
      {
        status: 500,
        headers: { "content-type": "application/json" }
      }
    );
  }
}

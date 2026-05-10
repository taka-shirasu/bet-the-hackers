import { NextResponse } from "next/server";

import { loadPicks } from "@/lib/picks-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const picks = await loadPicks();
  return NextResponse.json({
    counts: {
      picks: picks.recent.length,
      teamsPicked: picks.leaderboard.length
    },
    picks
  });
}

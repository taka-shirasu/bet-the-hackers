import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { fallbackTeams, normalizeTeams } from "@/lib/teams";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const docs = await prisma.team.findMany({
      orderBy: [{ winScore: "desc" }, { name: "asc" }],
      take: 50
    });
    const teams = normalizeTeams(docs);

    return NextResponse.json({
      source: teams.length > 0 ? "mongodb" : "fallback",
      teams: teams.length > 0 ? teams : fallbackTeams
    });
  } catch (error) {
    console.error("Failed to load MongoDB teams", error);

    return NextResponse.json({
      source: "fallback",
      teams: fallbackTeams
    });
  }
}

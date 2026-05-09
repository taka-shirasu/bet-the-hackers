import { NextResponse } from "next/server";

import { validateJudgeForm } from "@/lib/judges";
import { createJudges } from "@/lib/judges-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateJudgeForm(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const result = await createJudges(parsed.value);
    return NextResponse.json({
      ok: true,
      source: result.source,
      count: result.judges.length,
      judges: result.judges
    });
  } catch (error) {
    console.error("Failed to persist judges", error);
    return NextResponse.json({ error: "Failed to save judges" }, { status: 500 });
  }
}

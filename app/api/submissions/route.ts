import { NextResponse } from "next/server";

import { validateSubmission } from "@/lib/submissions";
import { createSubmission } from "@/lib/submissions-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateSubmission(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const result = await createSubmission(parsed.value);
    return NextResponse.json({
      ok: true,
      source: result.source,
      submission: result.submission
    });
  } catch (error) {
    console.error("Failed to persist submission", error);
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }
}

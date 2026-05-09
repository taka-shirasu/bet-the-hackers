import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { type Track, TRACK_CRITERIA, buildRubricPrompt } from "@/lib/judging-criteria";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { teamName, teamDescription, strengths, track = "always-on-agents" } = body as {
    teamName: string;
    teamDescription: string;
    strengths?: string[];
    track?: Track;
  };

  if (!teamName || !teamDescription) {
    return Response.json(
      { error: "teamName and teamDescription are required" },
      { status: 400 },
    );
  }

  const criteria = TRACK_CRITERIA[track];
  const c = criteria[2];

  const { text } = await generateText({
    model: openai("gpt-4.1"),
    system: [
      `You are the ${c.name} Agent for a hackathon betting platform.`,
      `Your job is to evaluate criterion #3: ${c.name} (${c.weight}% of total score).`,
      "",
      buildRubricPrompt(track),
      "",
      `Focus ONLY on criterion #3: ${c.name}.`,
      "",
      "Return a JSON object with these fields:",
      `- "summary": 2-3 sentence assessment`,
      '- "criterion3Score": number 0-100 (map the 1-5 rubric to 0-100 scale)',
      '- "strongPoints": array of strengths',
      '- "weakPoints": array of weaknesses',
      '- "rubricLevel": number 1-5 matching the rubric level',
      "Return ONLY valid JSON, no markdown.",
    ].join("\n"),
    prompt: [
      `Team: ${teamName}`,
      `Project: ${teamDescription}`,
      strengths ? `Strengths: ${strengths.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  try {
    const analysis = JSON.parse(text);
    return Response.json({ teamName, agent: c.name, analysis });
  } catch {
    return Response.json({ teamName, agent: c.name, analysis: text });
  }
}

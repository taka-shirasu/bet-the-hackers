import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { type Track, TRACK_CRITERIA, buildRubricPrompt } from "@/lib/judging-criteria";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { teamName, teamDescription, allTeams, track = "always-on-agents" } = body as {
    teamName: string;
    teamDescription: string;
    allTeams?: { name: string; description: string }[];
    track?: Track;
  };

  if (!teamName || !teamDescription) {
    return Response.json(
      { error: "teamName and teamDescription are required" },
      { status: 400 },
    );
  }

  const criteria = TRACK_CRITERIA[track];
  const c = criteria[0];

  const { text } = await generateText({
    model: openai("gpt-4.1"),
    system: [
      `You are the ${c.name} Agent for a hackathon betting platform.`,
      `Your job is to evaluate criterion #1: ${c.name} (${c.weight}% of total score).`,
      "",
      buildRubricPrompt(track),
      "",
      `Focus ONLY on criterion #1: ${c.name}.`,
      "",
      "Return a JSON object with these fields:",
      `- "summary": 2-3 sentence assessment`,
      '- "criterion1Score": number 0-100 (map the 1-5 rubric to 0-100 scale)',
      '- "strongPoints": array of strengths',
      '- "weakPoints": array of weaknesses',
      '- "rubricLevel": number 1-5 matching the rubric level',
      "Return ONLY valid JSON, no markdown.",
    ].join("\n"),
    prompt: [
      `Team being evaluated: ${teamName}`,
      `Project: ${teamDescription}`,
      allTeams
        ? `Other teams in the field: ${allTeams.filter((t) => t.name !== teamName).map((t) => `${t.name} (${t.description})`).join("; ")}`
        : "",
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

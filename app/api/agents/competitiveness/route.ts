import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { JUDGING_RUBRIC } from "@/lib/judging-criteria";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { teamName, teamDescription, allTeams } = body as {
    teamName: string;
    teamDescription: string;
    allTeams?: { name: string; description: string }[];
  };

  if (!teamName || !teamDescription) {
    return Response.json(
      { error: "teamName and teamDescription are required" },
      { status: 400 },
    );
  }

  const { text } = await generateText({
    model: openai("gpt-4.1"),
    system: [
      "You are the Genuine Background Execution Agent for a hackathon betting platform.",
      "Your job is to evaluate criterion #1: Genuine Background Execution (30% of total score).",
      "",
      JUDGING_RUBRIC,
      "",
      "Focus ONLY on criterion #1. Evaluate whether the project runs autonomously in the background,",
      "handles failures gracefully, uses automated triggers, and can run reliably without user intervention.",
      "",
      "Return a JSON object with these fields:",
      '- "summary": 2-3 sentence assessment of background execution capability',
      '- "executionScore": number 0-100 (map the 1-5 rubric to 0-100 scale)',
      '- "strongPoints": array of strengths in autonomous execution',
      '- "weakPoints": array of weaknesses or gaps',
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
    return Response.json({ teamName, agent: "background-execution", analysis });
  } catch {
    return Response.json({ teamName, agent: "background-execution", analysis: text });
  }
}

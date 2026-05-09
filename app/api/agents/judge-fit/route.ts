import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { JUDGING_RUBRIC } from "@/lib/judging-criteria";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { teamName, teamDescription, strengths } = body as {
    teamName: string;
    teamDescription: string;
    strengths?: string[];
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
      "You are the Statefulness Agent for a hackathon betting platform.",
      "Your job is to evaluate criterion #2: Statefulness (25% of total score).",
      "",
      JUDGING_RUBRIC,
      "",
      "Focus ONLY on criterion #2. Evaluate whether the project maintains memory between runs,",
      "uses prior state to influence future behavior, and whether memory is load-bearing for the demo.",
      "",
      "Return a JSON object with these fields:",
      '- "summary": 2-3 sentence assessment of statefulness',
      '- "statefulnessScore": number 0-100 (map the 1-5 rubric to 0-100 scale)',
      '- "strongPoints": array of strengths in state management and memory',
      '- "weakPoints": array of weaknesses or gaps',
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
    return Response.json({ teamName, agent: "statefulness", analysis });
  } catch {
    return Response.json({ teamName, agent: "statefulness", analysis: text });
  }
}

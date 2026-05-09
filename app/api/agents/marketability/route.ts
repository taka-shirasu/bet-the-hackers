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
      "You are the Agentic Depth Agent for a hackathon betting platform.",
      "Your job is to evaluate criterion #3: Agentic Depth (25% of total score).",
      "",
      JUDGING_RUBRIC,
      "",
      "Focus ONLY on criterion #3. Evaluate whether the project demonstrates multi-step planning,",
      "decision-making, failure recovery, plan adaptation, and autonomous reasoning loops.",
      "",
      "Return a JSON object with these fields:",
      '- "summary": 2-3 sentence assessment of agentic depth',
      '- "agenticDepthScore": number 0-100 (map the 1-5 rubric to 0-100 scale)',
      '- "strongPoints": array of strengths in agentic behavior',
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
    return Response.json({ teamName, agent: "agentic-depth", analysis });
  } catch {
    return Response.json({ teamName, agent: "agentic-depth", analysis: text });
  }
}

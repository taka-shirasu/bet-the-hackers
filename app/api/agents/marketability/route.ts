import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

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
      "You are the Marketability Agent for a hackathon betting platform.",
      "Assess the commercial viability, go-to-market potential, and brand appeal of this project.",
      "Return a JSON object with these fields:",
      '- "summary": 2-3 sentence marketability assessment',
      '- "marketabilityScore": number 0-100',
      '- "goToMarket": 1 sentence on go-to-market strategy potential',
      '- "brandAppeal": "low" | "medium" | "high"',
      '- "scalability": 1 sentence on scaling potential',
      '- "monetization": array of possible revenue streams',
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
    return Response.json({ teamName, agent: "marketability", analysis });
  } catch {
    return Response.json({ teamName, agent: "marketability", analysis: text });
  }
}

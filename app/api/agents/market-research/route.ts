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
      "You are the Market Research Agent for a hackathon betting platform.",
      "Analyze the market opportunity, target audience, competitive landscape, and revenue potential for this project.",
      "Return a JSON object with these fields:",
      '- "summary": 2-3 sentence market analysis',
      '- "marketScore": number 0-100 rating market opportunity',
      '- "targetMarket": 1 sentence describing the target audience',
      '- "competitors": array of likely competitors or similar products',
      '- "moat": 1 sentence on what differentiates this project',
      '- "revenuePotential": "low" | "medium" | "high"',
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
    return Response.json({ teamName, agent: "market-research", analysis });
  } catch {
    return Response.json({ teamName, agent: "market-research", analysis: text });
  }
}

import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

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
      "You are the Competitiveness Agent for a hackathon betting platform.",
      "Evaluate how competitive this team is relative to the field.",
      "Consider: demo quality, technical depth, novelty, team strength, and execution risk.",
      "Return a JSON object with these fields:",
      '- "summary": 2-3 sentence competitive assessment',
      '- "competitivenessScore": number 0-100',
      '- "strongPoints": array of competitive advantages',
      '- "weakPoints": array of competitive disadvantages',
      '- "threatLevel": "low" | "medium" | "high" — how threatening this team is to others',
      '- "upsetPotential": 1 sentence on whether they could surprise judges',
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
    return Response.json({ teamName, agent: "competitiveness", analysis });
  } catch {
    return Response.json({ teamName, agent: "competitiveness", analysis: text });
  }
}

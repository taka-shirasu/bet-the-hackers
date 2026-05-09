import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { teams, agentResults } = body as {
    teams: {
      name: string;
      description: string;
      competitivenessScore?: number;
      judgeFitScore?: number;
      marketabilityScore?: number;
      codeScore?: number;
      teamScore?: number;
      marketScore?: number;
    }[];
    agentResults?: Record<string, unknown>;
  };

  if (!teams || teams.length === 0) {
    return Response.json(
      { error: "teams array is required" },
      { status: 400 },
    );
  }

  const { text } = await generateText({
    model: openai("gpt-4.1"),
    system: [
      "You are the Final Ranker Agent for a hackathon betting platform.",
      "Aggregate all agent scores and insights to produce a definitive ranking of teams.",
      "Weight factors: Competitiveness (25%), Judge Fit (25%), Marketability (20%), Code Quality (15%), Team Strength (15%).",
      "Return a JSON object with these fields:",
      '- "rankings": array of objects sorted best to worst, each with "rank" (number), "teamName" (string), "finalScore" (number 0-100), "verdict" (1 sentence)',
      '- "topPick": name of the #1 team',
      '- "darkhorse": name of a team that could upset rankings',
      '- "reasoning": 2-3 sentence explanation of rankings',
      "Return ONLY valid JSON, no markdown.",
    ].join("\n"),
    prompt: [
      "Teams and their agent scores:",
      ...teams.map(
        (t) =>
          `- ${t.name}: ${t.description}${
            t.competitivenessScore != null
              ? ` | Competitiveness: ${t.competitivenessScore}`
              : ""
          }${t.judgeFitScore != null ? ` | Judge Fit: ${t.judgeFitScore}` : ""}${
            t.marketabilityScore != null
              ? ` | Marketability: ${t.marketabilityScore}`
              : ""
          }${t.codeScore != null ? ` | Code: ${t.codeScore}` : ""}${
            t.teamScore != null ? ` | Team: ${t.teamScore}` : ""
          }${t.marketScore != null ? ` | Market: ${t.marketScore}` : ""}`,
      ),
      agentResults ? `\nAdditional agent context: ${JSON.stringify(agentResults)}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  try {
    const analysis = JSON.parse(text);
    return Response.json({ agent: "final-ranker", analysis });
  } catch {
    return Response.json({ agent: "final-ranker", analysis: text });
  }
}

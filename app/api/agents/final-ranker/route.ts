import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { JUDGING_RUBRIC } from "@/lib/judging-criteria";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { teams, agentResults } = body as {
    teams: {
      name: string;
      description: string;
      executionScore?: number;
      statefulnessScore?: number;
      agenticDepthScore?: number;
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
      "Aggregate all agent scores to produce a definitive ranking of teams.",
      "",
      JUDGING_RUBRIC,
      "",
      "Use the EXACT weights from the rubric:",
      "- Genuine Background Execution: 30%",
      "- Statefulness: 25%",
      "- Agentic Depth: 25%",
      "- Demo & Presentation: 10%",
      "- Judge's Personal Rating: 10%",
      "",
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
            t.executionScore != null
              ? ` | Background Execution: ${t.executionScore}`
              : ""
          }${
            t.statefulnessScore != null
              ? ` | Statefulness: ${t.statefulnessScore}`
              : ""
          }${
            t.agenticDepthScore != null
              ? ` | Agentic Depth: ${t.agenticDepthScore}`
              : ""
          }`,
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

import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { type Track, buildRubricPrompt, TRACK_CRITERIA } from "@/lib/judging-criteria";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { teams, agentResults, track = "always-on-agents" } = body as {
    teams: {
      name: string;
      description: string;
      criterion1Score?: number;
      criterion2Score?: number;
      criterion3Score?: number;
      track?: Track;
    }[];
    agentResults?: Record<string, unknown>;
    track?: Track;
  };

  if (!teams || teams.length === 0) {
    return Response.json(
      { error: "teams array is required" },
      { status: 400 },
    );
  }

  const criteria = TRACK_CRITERIA[track];

  const { text } = await generateText({
    model: openai("gpt-4.1"),
    system: [
      "You are the Final Ranker Agent for a hackathon betting platform.",
      "Aggregate all agent scores to produce a definitive ranking of teams.",
      "",
      buildRubricPrompt(track),
      "",
      `Use the EXACT weights: ${criteria.map((c) => `${c.name}: ${c.weight}%`).join(", ")}, Demo & Presentation: 10%, Judge's Personal Rating: 10%.`,
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
            t.criterion1Score != null
              ? ` | ${criteria[0].name}: ${t.criterion1Score}`
              : ""
          }${
            t.criterion2Score != null
              ? ` | ${criteria[1].name}: ${t.criterion2Score}`
              : ""
          }${
            t.criterion3Score != null
              ? ` | ${criteria[2].name}: ${t.criterion3Score}`
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

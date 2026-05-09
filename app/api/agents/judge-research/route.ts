import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { judges, hackathonContext } = body as {
    judges?: { name: string; background?: string }[];
    hackathonContext?: string;
  };

  const { text } = await generateText({
    model: openai("gpt-4.1"),
    system: [
      "You are the Judge Research Agent for a hackathon betting platform.",
      "Analyze the judging panel's backgrounds, expertise, and likely evaluation criteria.",
      "Return a JSON object with these fields:",
      '- "summary": 2-3 sentence overview of the judging panel',
      '- "judges": array of objects with "name", "expertise" (array), "likelyPriorities" (array)',
      '- "overallCriteria": array of what this panel will likely value most',
      '- "blindSpots": array of areas judges may undervalue',
      "Return ONLY valid JSON, no markdown.",
    ].join("\n"),
    prompt: [
      judges
        ? `Judges: ${judges.map((j) => `${j.name}${j.background ? ` — ${j.background}` : ""}`).join("; ")}`
        : "No specific judges provided — analyze typical hackathon judging criteria.",
      hackathonContext ? `Hackathon context: ${hackathonContext}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  try {
    const analysis = JSON.parse(text);
    return Response.json({ agent: "judge-research", analysis });
  } catch {
    return Response.json({ agent: "judge-research", analysis: text });
  }
}

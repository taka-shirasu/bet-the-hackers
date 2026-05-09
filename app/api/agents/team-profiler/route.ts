import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { teamName, teamDescription, members, strengths } = body as {
    teamName: string;
    teamDescription: string;
    members?: { name: string; role: string }[];
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
      "You are the Team Profiler Agent for a hackathon betting platform.",
      "Analyze the team's composition, skills, experience, and collaboration potential.",
      "Return a JSON object with these fields:",
      '- "summary": 2-3 sentence team profile overview',
      '- "teamScore": number 0-100 rating the overall team strength',
      '- "skillCoverage": array of key skill areas covered',
      '- "gaps": array of skill gaps or weaknesses',
      '- "collaboration": 1 sentence on how well-rounded the team is',
      "Return ONLY valid JSON, no markdown.",
    ].join("\n"),
    prompt: [
      `Team: ${teamName}`,
      `Project: ${teamDescription}`,
      members ? `Members: ${members.map((m) => `${m.name} (${m.role})`).join(", ")}` : "",
      strengths ? `Known strengths: ${strengths.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  try {
    const analysis = JSON.parse(text);
    return Response.json({ teamName, agent: "team-profiler", analysis });
  } catch {
    return Response.json({ teamName, agent: "team-profiler", analysis: text });
  }
}

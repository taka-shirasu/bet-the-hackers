import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { teamName, teamDescription, judges, strengths } = body as {
    teamName: string;
    teamDescription: string;
    judges?: { name: string; background?: string }[];
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
      "You are the Judge Fit Agent for a hackathon betting platform.",
      "Evaluate how well this team's project aligns with what judges typically look for.",
      "Consider: clarity of demo, problem-solution fit, technical ambition, market awareness, and presentation quality.",
      "Return a JSON object with these fields:",
      '- "summary": 2-3 sentence judge fit assessment',
      '- "judgeFitScore": number 0-100',
      '- "alignedWith": array of judge criteria this team meets well',
      '- "misalignedWith": array of judge criteria this team may struggle with',
      '- "presentationTips": array of 2-3 tips to improve judge impression',
      "Return ONLY valid JSON, no markdown.",
    ].join("\n"),
    prompt: [
      `Team: ${teamName}`,
      `Project: ${teamDescription}`,
      strengths ? `Strengths: ${strengths.join(", ")}` : "",
      judges
        ? `Judges: ${judges.map((j) => `${j.name}${j.background ? ` — ${j.background}` : ""}`).join("; ")}`
        : "No specific judges — evaluate against typical hackathon judging criteria.",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  try {
    const analysis = JSON.parse(text);
    return Response.json({ teamName, agent: "judge-fit", analysis });
  } catch {
    return Response.json({ teamName, agent: "judge-fit", analysis: text });
  }
}

import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createHackathonResearchTools } from "@/lib/nia";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { teamName, teamDescription, repoUrl, techStack = [] } = body as {
    teamName: string;
    teamDescription: string;
    repoUrl?: string;
    techStack?: string[];
  };

  if (!teamName || !teamDescription) {
    return Response.json(
      { error: "teamName and teamDescription are required" },
      { status: 400 },
    );
  }

  const repositories = repoUrl ? [repoUrl] : [];
  const tools = createHackathonResearchTools(repositories);

  const { text } = await generateText({
    model: openai("gpt-4.1"),
    tools,
    system: [
      "You are the Code Reality Agent for a hackathon betting platform.",
      "Evaluate the team's codebase quality, architecture decisions, and technical execution.",
      "If a repo URL is provided, use the research tools to analyze it.",
      "Return a JSON object with these fields:",
      '- "summary": 2-3 sentence technical assessment',
      '- "codeScore": number 0-100 rating overall code quality',
      '- "architecture": 1 sentence on architecture choices',
      '- "techStack": array of technologies identified',
      '- "risks": array of technical risks or red flags',
      '- "execution": 1 sentence on build readiness and demo potential',
      "Return ONLY valid JSON, no markdown.",
    ].join("\n"),
    prompt: [
      `Team: ${teamName}`,
      `Project: ${teamDescription}`,
      techStack.length > 0 ? `Tech stack: ${techStack.join(", ")}` : "",
      repoUrl ? `Repository: ${repoUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  try {
    const analysis = JSON.parse(text);
    return Response.json({ teamName, agent: "code-reality", analysis });
  } catch {
    return Response.json({ teamName, agent: "code-reality", analysis: text });
  }
}

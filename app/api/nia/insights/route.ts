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
      "You are a hackathon project analyst.",
      "Research the given team and provide a structured assessment including:",
      "- Overall strength summary",
      "- Key technical strengths",
      "- Potential risks or weaknesses",
      "- Win probability factors",
      "Be concise and data-driven.",
    ].join("\n"),
    prompt: [
      `Team: ${teamName}`,
      `Description: ${teamDescription}`,
      techStack.length > 0 ? `Tech stack: ${techStack.join(", ")}` : "",
      repoUrl ? `Repository: ${repoUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return Response.json({ teamName, analysis: text });
}

import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createHackathonResearchTools } from "@/lib/nia";

/**
 * POST /api/nia/insights
 * Generates AI-powered insights about a hackathon project using Nia tools.
 *
 * Body:
 *   projectName: string
 *   projectDescription: string
 *   repoUrl?: string
 *   techStack?: string[]
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectName, projectDescription, repoUrl, techStack = [] } = body as {
    projectName: string;
    projectDescription: string;
    repoUrl?: string;
    techStack?: string[];
  };

  if (!projectName || !projectDescription) {
    return Response.json(
      { error: "projectName and projectDescription are required" },
      { status: 400 },
    );
  }

  const repositories = repoUrl ? [repoUrl] : [];
  const tools = createHackathonResearchTools(repositories);

  try {
    const result = await generateText({
      model: openai("gpt-4.1"),
      tools,
      prompt: [
        `Analyze this hackathon project and provide betting insights:`,
        ``,
        `Project: ${projectName}`,
        `Description: ${projectDescription}`,
        techStack.length > 0 ? `Tech Stack: ${techStack.join(", ")}` : "",
        repoUrl ? `Repository: ${repoUrl}` : "",
        ``,
        `Research the project's tech stack and approach. Provide:`,
        `1. A brief summary of the project's potential`,
        `2. Key strengths that could help it win`,
        `3. Potential risks or weaknesses`,
        `4. Technical analysis of the stack choices`,
        `5. A confidence score from 0-100 on its chances of winning`,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return Response.json({ insights: result.text });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate insights";
    return Response.json({ error: message }, { status: 500 });
  }
}

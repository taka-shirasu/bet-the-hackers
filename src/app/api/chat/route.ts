import { NextRequest } from "next/server";
import { streamText, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { createHackathonResearchTools } from "@/lib/nia";
import { searchUserMemory } from "@/lib/hyperspell";

/**
 * POST /api/chat
 * AI chat endpoint that combines Nia research tools with Hyperspell memory.
 * Users can ask questions about hackathon projects and get context-aware answers.
 *
 * Body:
 *   messages: Array<{ role: string; content: string }>
 *   userId?: string — if provided, Hyperspell memory is used for context
 *   repositories?: string[] — GitHub repos to search via Nia
 *   dataSources?: string[] — indexed sources for Nia Oracle
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages, userId, repositories = [], dataSources = [] } = body as {
    messages: ModelMessage[];
    userId?: string;
    repositories?: string[];
    dataSources?: string[];
  };

  if (!messages || messages.length === 0) {
    return Response.json({ error: "messages are required" }, { status: 400 });
  }

  const tools = createHackathonResearchTools(repositories, dataSources);

  let memoryContext = "";
  if (userId) {
    try {
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === "user");
      if (lastUserMessage) {
        const content = typeof lastUserMessage.content === "string"
          ? lastUserMessage.content
          : lastUserMessage.content
              .filter((p): p is { type: "text"; text: string } => p.type === "text")
              .map((p) => p.text)
              .join(" ");
        const memory = await searchUserMemory(userId, content);
        if (memory.answer) {
          memoryContext = `\n\nUser's betting history context: ${memory.answer}`;
        }
      }
    } catch {
      // Memory lookup is best-effort; continue without it
    }
  }

  const systemPrompt = [
    "You are an AI assistant for a hackathon betting app.",
    "Users can swipe left or right on hackathon projects and place bets on who will win.",
    "Both participants and judges can place bets.",
    "",
    "You help users by:",
    "- Researching hackathon projects using Nia (tracer for public repos, oracle for indexed data)",
    "- Providing insights on project quality, tech stacks, and winning potential",
    "- Remembering user preferences and past bets via Hyperspell",
    "- Giving personalized betting recommendations",
    "",
    "Be concise, data-driven, and honest about uncertainty.",
    memoryContext,
  ].join("\n");

  const result = streamText({
    model: openai("gpt-4.1"),
    system: systemPrompt,
    messages,
    tools,
  });

  return result.toTextStreamResponse();
}

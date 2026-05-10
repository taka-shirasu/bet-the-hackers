import "server-only";

import type { AgentMode } from "../types";

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export function openaiMode(): AgentMode {
  return process.env.OPENAI_API_KEY ? "live" : "stub";
}

export type LlmJsonRequest = {
  system: string;
  user: string;
  schemaHint: string;
};

export async function llmJson<T>(
  req: LlmJsonRequest,
  stub: () => T
): Promise<{ value: T; mode: AgentMode }> {
  if (openaiMode() === "stub") {
    return { value: stub(), mode: "stub" };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${req.system}\n\nReturn ONLY valid JSON matching: ${req.schemaHint}\nNo prose, no markdown fences.`
        },
        { role: "user", content: req.user }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  try {
    return { value: JSON.parse(text) as T, mode: "live" };
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return { value: JSON.parse(match[0]) as T, mode: "live" };
    throw new Error(`OpenAI returned non-JSON: ${text.slice(0, 200)}`);
  }
}

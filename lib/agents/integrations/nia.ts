import "server-only";

import type { AgentMode } from "../types";

const NIA_BASE = process.env.NIA_API_BASE ?? "https://api.trynia.ai";

export function niaMode(): AgentMode {
  return process.env.NIA_API_KEY ? "live" : "stub";
}

export type ResearchResult = {
  query: string;
  summary: string;
  citations: { title?: string; url?: string }[];
};

export async function deepResearch(
  query: string
): Promise<{ result: ResearchResult; mode: AgentMode }> {
  if (niaMode() === "stub") {
    return {
      result: {
        query,
        summary:
          `[stub] Nia oracle research disabled — set NIA_API_KEY. ` +
          `Heuristic placeholder: query "${query.slice(0, 80)}..." would return TAM, ` +
          `competitor list, and risk factors.`,
        citations: []
      },
      mode: "stub"
    };
  }

  const response = await fetch(`${NIA_BASE}/research`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.NIA_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({ query, mode: "oracle" })
  });

  if (!response.ok) {
    throw new Error(`Nia ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    summary?: string;
    answer?: string;
    citations?: { title?: string; url?: string }[];
    sources?: { title?: string; url?: string }[];
  };

  return {
    result: {
      query,
      summary: data.summary ?? data.answer ?? "",
      citations: data.citations ?? data.sources ?? []
    },
    mode: "live"
  };
}

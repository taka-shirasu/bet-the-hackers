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
          `[stub] Nia research disabled — set NIA_API_KEY. ` +
          `Heuristic placeholder for "${query.slice(0, 80)}..."`,
        citations: []
      },
      mode: "stub"
    };
  }

  const response = await fetch(`${NIA_BASE}/web-search`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.NIA_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error(`Nia ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  type NiaItem = { url?: string; title?: string; summary?: string };
  const data = (await response.json()) as {
    other_content?: NiaItem[];
    documentation?: NiaItem[];
    github_repos?: NiaItem[];
  };

  const items: NiaItem[] = [
    ...(data.other_content ?? []),
    ...(data.documentation ?? []),
    ...(data.github_repos ?? [])
  ].slice(0, 8);

  const summary = items
    .map((i, idx) => `[${idx + 1}] ${i.title ?? "(untitled)"}\n${i.summary ?? ""}`)
    .join("\n\n");

  return {
    result: {
      query,
      summary: summary || "(no web results)",
      citations: items.map((i) => ({ title: i.title, url: i.url }))
    },
    mode: "live"
  };
}

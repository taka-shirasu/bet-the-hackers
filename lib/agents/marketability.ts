import "server-only";

import { llmJson } from "./integrations/openai";
import { deepResearch } from "./integrations/nia";
import { storeEvidence } from "./integrations/hyperspell";
import type { EnrichedTeam } from "./profiler";

export type MarketabilityScore = {
  score_0_10: number;
  comparables: string[];
  risks: string[];
  blurb: string;
};

export async function scoreMarketability(
  team: EnrichedTeam
): Promise<{ score: MarketabilityScore; researchMode: string; llmMode: string }> {
  const query = `Is "${team.projectDescription}" in the ${team.industry} industry a viable business? List 3-5 closest comparables and the top 3 risks. Estimate market scale potential.`;
  const { result, mode: researchMode } = await deepResearch(query);

  await storeEvidence([
    {
      namespace: `market:${slug(team.industry)}`,
      key: `team:${team.teamId}`,
      source: "nia",
      content: result.summary,
      metadata: { citations: result.citations, query },
      storedAt: new Date().toISOString()
    }
  ]);

  const { value, mode: llmMode } = await llmJson<MarketabilityScore>(
    {
      system:
        "You are a hackathon judge scoring marketability on a 0-10 scale. 0 = no market, 10 = obvious unicorn.",
      user: `Project: ${team.projectDescription}\nIndustry: ${team.industry}\n\nResearch:\n${result.summary}`,
      schemaHint: `{"score_0_10": number, "comparables": string[], "risks": string[], "blurb": string (max 200 chars)}`
    },
    () => stubScore(team)
  );

  return { score: clamp(value), researchMode, llmMode };
}

function stubScore(team: EnrichedTeam): MarketabilityScore {
  const heuristic = Math.min(
    10,
    Math.round(
      4 +
        team.projectDescription.length / 80 +
        (team.insights.length > 50 ? 1 : 0) +
        (team.industry.length > 0 ? 1 : 0)
    )
  );
  return {
    score_0_10: heuristic,
    comparables: ["[stub] enable NIA_API_KEY + OPENAI_API_KEY for real comparables"],
    risks: ["[stub] generic risk: differentiation"],
    blurb: `${team.industry} play. Heuristic score until live agents are wired.`
  };
}

function clamp(score: MarketabilityScore): MarketabilityScore {
  return {
    ...score,
    score_0_10: Math.max(0, Math.min(10, Number(score.score_0_10) || 0))
  };
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

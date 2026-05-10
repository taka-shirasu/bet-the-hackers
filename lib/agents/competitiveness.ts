import "server-only";

import { llmJson } from "./integrations/openai";
import { storeEvidence } from "./integrations/hyperspell";
import type { EnrichedTeam } from "./profiler";

export type CompetitivenessScore = {
  score_0_10: number;
  rank: number;
  totalTeams: number;
  blurb: string;
};

export async function scoreCompetitiveness(
  focal: EnrichedTeam,
  allTeams: EnrichedTeam[]
): Promise<{ score: CompetitivenessScore; llmMode: string }> {
  if (allTeams.length <= 1) {
    return {
      score: {
        score_0_10: 7,
        rank: 1,
        totalTeams: 1,
        blurb: "Only team in the field — auto-leader."
      },
      llmMode: "stub"
    };
  }

  const fieldBlock = allTeams
    .map((t, i) => `${i + 1}. ${t.teamName} (${t.track}, ${t.industry}): ${t.projectDescription}`)
    .join("\n");

  const { value, mode: llmMode } = await llmJson<CompetitivenessScore>(
    {
      system:
        "Score how competitive a focal team is against the rest of the field. 0=last, 10=clear winner.",
      user: `Focal team: ${focal.teamName}\nProject: ${focal.projectDescription}\nTrack: ${focal.track}\nIndustry: ${focal.industry}\n\nField:\n${fieldBlock}`,
      schemaHint: `{"score_0_10": number, "rank": number (1=best), "totalTeams": number, "blurb": string (max 200 chars explaining why they rank here)}`
    },
    () => stubScore(focal, allTeams)
  );

  await storeEvidence([
    {
      namespace: `team:${focal.teamId}`,
      key: "competitiveness",
      source: "manual",
      content: JSON.stringify(value, null, 2),
      storedAt: new Date().toISOString()
    }
  ]);

  return { score: clamp(value, allTeams.length), llmMode };
}

function stubScore(
  focal: EnrichedTeam,
  allTeams: EnrichedTeam[]
): CompetitivenessScore {
  const sortedByDescLength = [...allTeams].sort(
    (a, b) =>
      b.projectDescription.length + b.insights.length -
      (a.projectDescription.length + a.insights.length)
  );
  const rank = sortedByDescLength.findIndex((t) => t.teamId === focal.teamId) + 1;
  const score = Math.max(
    1,
    Math.round(10 - ((rank - 1) / Math.max(1, allTeams.length - 1)) * 8)
  );
  return {
    score_0_10: score,
    rank,
    totalTeams: allTeams.length,
    blurb: `[stub] Ranked #${rank}/${allTeams.length} by pitch detail. Set OPENAI_API_KEY for real comparison.`
  };
}

function clamp(
  score: CompetitivenessScore,
  totalTeams: number
): CompetitivenessScore {
  return {
    ...score,
    score_0_10: Math.max(0, Math.min(10, Number(score.score_0_10) || 0)),
    rank: Math.max(1, Math.min(totalTeams, Number(score.rank) || 1)),
    totalTeams
  };
}

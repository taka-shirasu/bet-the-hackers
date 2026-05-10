import type { TeamScore } from "./types";

export const WEIGHTS = {
  competitiveness: 0.35,
  judgeFit: 0.35,
  marketability: 0.3
} as const;

export function compositeScore(input: {
  competitiveness: number;
  judgeFit: number;
  marketability: number;
}): number {
  const overall =
    WEIGHTS.competitiveness * input.competitiveness +
    WEIGHTS.judgeFit * input.judgeFit +
    WEIGHTS.marketability * input.marketability;
  return Math.round(overall * 10);
}

export function rankTeams(scores: TeamScore[]): TeamScore[] {
  return [...scores].sort((a, b) => b.overall - a.overall);
}

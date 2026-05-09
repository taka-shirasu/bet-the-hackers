"use client";

import { useState, useCallback, useRef } from "react";

interface TeamInput {
  id: number;
  name: string;
  description: string;
  strengths?: string[];
  allTeams?: { name: string; description: string }[];
}

interface AgentScores {
  competitiveness: number;
  judgeFit: number;
  marketability: number;
}

interface AgentScoresState {
  scores: Record<number, AgentScores>;
  loading: Record<number, boolean>;
  fetchScores: (team: TeamInput) => Promise<void>;
  fetchAllScores: (teams: TeamInput[]) => Promise<void>;
}

async function fetchAgentScore(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<number> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return -1;
    const data = await res.json();
    const analysis = data.analysis;
    if (typeof analysis === "object" && analysis !== null) {
      return (
        analysis.competitivenessScore ??
        analysis.judgeFitScore ??
        analysis.marketabilityScore ??
        -1
      );
    }
    return -1;
  } catch {
    return -1;
  }
}

export function useAgentScores(): AgentScoresState {
  const [scores, setScores] = useState<Record<number, AgentScores>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const fetchedRef = useRef<Set<number>>(new Set());

  const fetchScores = useCallback(async (team: TeamInput) => {
    if (fetchedRef.current.has(team.id)) return;
    fetchedRef.current.add(team.id);

    setLoading((prev) => ({ ...prev, [team.id]: true }));

    const baseBody = {
      teamName: team.name,
      teamDescription: team.description,
      strengths: team.strengths,
    };

    const [comp, judgeFit, market] = await Promise.all([
      fetchAgentScore("/api/agents/competitiveness", {
        ...baseBody,
        allTeams: team.allTeams,
      }),
      fetchAgentScore("/api/agents/judge-fit", baseBody),
      fetchAgentScore("/api/agents/marketability", baseBody),
    ]);

    setScores((prev) => ({
      ...prev,
      [team.id]: {
        competitiveness: comp >= 0 ? comp : 0,
        judgeFit: judgeFit >= 0 ? judgeFit : 0,
        marketability: market >= 0 ? market : 0,
      },
    }));

    setLoading((prev) => ({ ...prev, [team.id]: false }));
  }, []);

  const fetchAllScores = useCallback(
    async (teams: TeamInput[]) => {
      const allTeamsSummary = teams.map((t) => ({
        name: t.name,
        description: t.description,
      }));

      await Promise.all(
        teams.map((t) =>
          fetchScores({ ...t, allTeams: allTeamsSummary }),
        ),
      );
    },
    [fetchScores],
  );

  return { scores, loading, fetchScores, fetchAllScores };
}

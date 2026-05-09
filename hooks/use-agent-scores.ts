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
  execution: number;
  statefulness: number;
  agenticDepth: number;
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
  scoreKey: string,
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
      return analysis[scoreKey] ?? -1;
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

    const [execution, statefulness, agenticDepth] = await Promise.all([
      fetchAgentScore(
        "/api/agents/competitiveness",
        { ...baseBody, allTeams: team.allTeams },
        "executionScore",
      ),
      fetchAgentScore("/api/agents/judge-fit", baseBody, "statefulnessScore"),
      fetchAgentScore("/api/agents/marketability", baseBody, "agenticDepthScore"),
    ]);

    setScores((prev) => ({
      ...prev,
      [team.id]: {
        execution: execution >= 0 ? execution : 0,
        statefulness: statefulness >= 0 ? statefulness : 0,
        agenticDepth: agenticDepth >= 0 ? agenticDepth : 0,
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

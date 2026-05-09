"use client";

import { useState, useCallback } from "react";

interface TeamInsightsInput {
  teamName: string;
  teamDescription: string;
  repoUrl?: string;
  techStack?: string[];
}

interface TeamInsightsResult {
  analysis: string | null;
  loading: boolean;
  error: string | null;
  fetchInsights: (input: TeamInsightsInput) => Promise<void>;
}

export function useTeamInsights(): TeamInsightsResult {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (input: TeamInsightsInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/nia/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch insights");
    } finally {
      setLoading(false);
    }
  }, []);

  return { analysis, loading, error, fetchInsights };
}

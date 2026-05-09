"use client";

import { useState, useCallback } from "react";
import type { ProjectInsight } from "@/types";

interface UseProjectInsightsOptions {
  projectName: string;
  projectDescription: string;
  repoUrl?: string;
  techStack?: string[];
}

interface UseProjectInsightsReturn {
  insights: ProjectInsight | null;
  loading: boolean;
  error: string | null;
  fetchInsights: () => Promise<void>;
}

export function useProjectInsights({
  projectName,
  projectDescription,
  repoUrl,
  techStack,
}: UseProjectInsightsOptions): UseProjectInsightsReturn {
  const [insights, setInsights] = useState<ProjectInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/nia/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          projectDescription,
          repoUrl,
          techStack,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch insights");
      }

      const data = await res.json();
      setInsights({
        projectId: "",
        summary: data.insights,
        strengths: [],
        risks: [],
        techAnalysis: "",
        confidence: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [projectName, projectDescription, repoUrl, techStack]);

  return { insights, loading, error, fetchInsights };
}

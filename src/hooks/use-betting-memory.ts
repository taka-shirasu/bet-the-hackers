"use client";

import { useState, useCallback } from "react";

interface UseBettingMemoryOptions {
  userId: string;
}

interface MemorySearchResult {
  answer: string | null;
  documents: unknown[];
}

interface UseBettingMemoryReturn {
  storeSwipe: (params: {
    projectId: string;
    projectName: string;
    direction: "left" | "right";
    techStack?: string[];
  }) => Promise<void>;
  storeBet: (params: {
    projectId: string;
    projectName: string;
    direction: "win" | "skip";
    amount: number;
    techStack?: string[];
  }) => Promise<void>;
  searchMemory: (query: string) => Promise<MemorySearchResult | null>;
  getPreferences: () => Promise<MemorySearchResult | null>;
  loading: boolean;
  error: string | null;
}

export function useBettingMemory({
  userId,
}: UseBettingMemoryOptions): UseBettingMemoryReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeSwipe = useCallback(
    async (params: {
      projectId: string;
      projectName: string;
      direction: "left" | "right";
      techStack?: string[];
    }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hyperspell/memory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, type: "swipe", ...params }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to store swipe");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const storeBet = useCallback(
    async (params: {
      projectId: string;
      projectName: string;
      direction: "win" | "skip";
      amount: number;
      techStack?: string[];
    }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hyperspell/memory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, type: "bet", ...params }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to store bet");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const searchMemory = useCallback(
    async (query: string): Promise<MemorySearchResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hyperspell/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, query, mode: "search" }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Search failed");
        }
        return await res.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const getPreferences = useCallback(async (): Promise<MemorySearchResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hyperspell/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, mode: "preferences" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to get preferences");
      }
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { storeSwipe, storeBet, searchMemory, getPreferences, loading, error };
}

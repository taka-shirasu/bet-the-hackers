"use client";

import { useState, useCallback } from "react";

interface UseBettingMemoryInput {
  userId: string;
}

interface UseBettingMemoryResult {
  storeSwipe: (
    teamId: string,
    teamName: string,
    direction: "left" | "right",
  ) => Promise<void>;
  storeBet: (
    teamId: string,
    teamName: string,
    amount: number,
    winProbability: number,
  ) => Promise<void>;
  searchMemory: (query: string) => Promise<{ answer?: string }>;
  getPreferences: () => Promise<{ answer?: string }>;
  loading: boolean;
  error: string | null;
}

export function useBettingMemory({
  userId,
}: UseBettingMemoryInput): UseBettingMemoryResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeSwipe = useCallback(
    async (teamId: string, teamName: string, direction: "left" | "right") => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hyperspell/memory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "swipe",
            userId,
            teamId,
            teamName,
            direction,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to store swipe");
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const storeBet = useCallback(
    async (
      teamId: string,
      teamName: string,
      amount: number,
      winProbability: number,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hyperspell/memory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "bet",
            userId,
            teamId,
            teamName,
            amount,
            winProbability,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to store bet");
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const searchMemory = useCallback(
    async (query: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hyperspell/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, query, mode: "search" }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to search memory",
        );
        return {};
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const getPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hyperspell/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, mode: "preferences" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get preferences",
      );
      return {};
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { storeSwipe, storeBet, searchMemory, getPreferences, loading, error };
}

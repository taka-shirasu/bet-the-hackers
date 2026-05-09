"use client";

import { useState, useEffect } from "react";
import { useBetting } from "@/context/betting-context";
import { MOCK_LEADERBOARD } from "@/lib/mock-data";

export function Leaderboard() {
  const { state, nextRound } = useBetting();
  const [revealed, setRevealed] = useState(false);
  const [revealIndex, setRevealIndex] = useState(-1);

  // Merge current user stats into leaderboard
  const leaderboard = MOCK_LEADERBOARD.map((entry) => {
    if (entry.userId === "user-current") {
      return {
        ...entry,
        totalBets: state.portfolio.bets.length,
        totalSpent: state.portfolio.totalSpent,
        potentialPayout: state.portfolio.potentialPayout,
        topPick:
          state.portfolio.bets.length > 0
            ? state.portfolio.bets.reduce((max, b) =>
                b.amount > max.amount ? b : max,
              ).projectName
            : "-",
      };
    }
    return entry;
  }).sort((a, b) => b.potentialPayout - a.potentialPayout);

  // Staggered reveal animation
  useEffect(() => {
    if (!state.showLeaderboard) return;

    const timer = setTimeout(() => setRevealed(true), 500);
    return () => clearTimeout(timer);
  }, [state.showLeaderboard]);

  useEffect(() => {
    if (!revealed) return;

    const interval = setInterval(() => {
      setRevealIndex((prev) => {
        if (prev >= leaderboard.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [revealed, leaderboard.length]);

  if (!state.showLeaderboard) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center">
          <p className="text-amber-100 text-sm font-medium">
            Round {state.currentRound} Complete
          </p>
          <h2 className="text-2xl font-bold text-white mt-1">Leaderboard</h2>
          <p className="text-amber-200 text-xs mt-2">
            {state.portfolio.bets.length} bets placed this round
          </p>
        </div>

        {/* Leaderboard entries */}
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {!revealed ? (
            <div className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-500 mt-3">
                Tallying results...
              </p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 rounded-xl p-4 transition-all duration-500 ${
                  index <= revealIndex
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                } ${
                  entry.userId === "user-current"
                    ? "bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800"
                    : "bg-zinc-50 dark:bg-zinc-800/50"
                }`}
              >
                {/* Rank */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? "bg-amber-400 text-amber-900"
                      : index === 1
                        ? "bg-zinc-300 text-zinc-700"
                        : index === 2
                          ? "bg-orange-300 text-orange-800"
                          : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {entry.displayName}
                    {entry.userId === "user-current" && (
                      <span className="ml-1.5 text-xs text-violet-600 dark:text-violet-400">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {entry.totalBets} bets &middot; Top pick: {entry.topPick}
                  </p>
                </div>

                {/* Payout */}
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    {entry.potentialPayout.toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-400">potential</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Next round button */}
        {revealIndex >= leaderboard.length - 1 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={nextRound}
              className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              Continue to Round {state.currentRound + 1}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

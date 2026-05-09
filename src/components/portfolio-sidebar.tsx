"use client";

import { useBetting } from "@/context/betting-context";

export function PortfolioSidebar() {
  const { state } = useBetting();
  const { portfolio } = state;

  return (
    <div className="w-full lg:w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4">
        <h3 className="text-base font-bold text-white">Your Portfolio</h3>
        <p className="text-violet-200 text-xs mt-0.5">
          Round {state.currentRound}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
        <div className="p-4 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Credits</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {portfolio.credits.toLocaleString()}
          </p>
        </div>
        <div className="p-4 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Spent</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {portfolio.totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="p-4 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Payout</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
            {portfolio.potentialPayout.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Bets list */}
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {portfolio.bets.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-6">
            No bets placed yet. Swipe right to get started!
          </p>
        ) : (
          portfolio.bets.map((bet) => (
            <div
              key={bet.id}
              className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {bet.projectName}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Bet {bet.amount} credits
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  +{bet.potentialPayout.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-400">potential</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

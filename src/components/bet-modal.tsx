"use client";

import { useState, useMemo } from "react";
import type { HackathonProject } from "@/types";
import { useBetting } from "@/context/betting-context";

interface BetModalProps {
  project: HackathonProject;
  onClose: () => void;
}

export function BetModal({ project, onClose }: BetModalProps) {
  const { state, placeBet, skipBet, calculatePayout } = useBetting();
  const { credits } = state.portfolio;

  const maxBet = Math.min(credits, 500);
  const [amount, setAmount] = useState(Math.min(50, maxBet));
  const payout = useMemo(
    () => calculatePayout(amount, project.winProbability),
    [amount, project.winProbability, calculatePayout],
  );

  const handleConfirm = () => {
    if (amount > 0 && amount <= credits) {
      placeBet(project.id, amount);
    }
  };

  const handleSkip = () => {
    skipBet();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal / Bottom sheet */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Place your bet
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {project.name} &mdash;{" "}
              {Math.round(project.winProbability * 100)}% win probability
            </p>
          </div>

          {/* Credits remaining */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Your credits
            </span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {credits.toLocaleString()}
            </span>
          </div>

          {/* Bet amount slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Bet amount
              </label>
              <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {amount}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={maxBet}
              step={10}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-violet-600"
            />
            <div className="flex justify-between text-xs text-zinc-400">
              <span>10</span>
              <span>{maxBet}</span>
            </div>
          </div>

          {/* Potential payout */}
          <div className="flex items-center justify-between rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-4">
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Potential payout
            </span>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">
              +{payout.toLocaleString()}
            </span>
          </div>

          {/* Social proof line */}
          {project.totalBettors > 0 && (
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              {project.totalBettors} other{project.totalBettors > 1 ? "s" : ""}{" "}
              bet on this team
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 py-3.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Skip bet
            </button>
            <button
              onClick={handleConfirm}
              disabled={amount <= 0 || amount > credits}
              className="flex-1 rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirm bet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useBetting } from "@/context/betting-context";
import { SwipeCard } from "./swipe-card";
import { BetModal } from "./bet-modal";
import { Leaderboard } from "./leaderboard";

export function CardStack() {
  const { state, swipe, closeBetModal } = useBetting();
  const { projects, currentIndex, showBetModal, pendingProject, showLeaderboard } = state;

  const currentProject = projects[currentIndex];
  const isRoundOver = currentIndex >= projects.length;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      {/* Progress indicator */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
          <span>Round {state.currentRound}</span>
          <span>
            {Math.min(currentIndex + 1, projects.length)} / {projects.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-600 rounded-full transition-all duration-300"
            style={{
              width: `${(Math.min(currentIndex + 1, projects.length) / projects.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Card or end-of-round message */}
      {isRoundOver && !showLeaderboard ? (
        <div className="text-center space-y-4">
          <div className="text-5xl">🏁</div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Round complete!
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Preparing the leaderboard...
          </p>
        </div>
      ) : currentProject ? (
        <SwipeCard project={currentProject} onSwipe={swipe} />
      ) : null}

      {/* Bet modal (bottom sheet) */}
      {showBetModal && pendingProject && (
        <BetModal project={pendingProject} onClose={closeBetModal} />
      )}

      {/* Leaderboard overlay */}
      <Leaderboard />
    </div>
  );
}

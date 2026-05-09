"use client";

import { BettingProvider } from "@/context/betting-context";
import { CardStack } from "@/components/card-stack";
import { PortfolioSidebar } from "@/components/portfolio-sidebar";

export default function Home() {
  return (
    <BettingProvider>
      <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-50 dark:bg-black">
        {/* Main swipe area */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              HackBet
            </h1>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Swipe &middot; Bet &middot; Win
            </span>
          </header>

          <CardStack />
        </div>

        {/* Portfolio sidebar (desktop) / bottom tab (mobile) */}
        <div className="lg:border-l border-t lg:border-t-0 border-zinc-200 dark:border-zinc-800">
          <div className="sticky top-0 p-4">
            <PortfolioSidebar />
          </div>
        </div>
      </div>
    </BettingProvider>
  );
}

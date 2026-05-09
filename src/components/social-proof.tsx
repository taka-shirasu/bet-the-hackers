"use client";

interface SocialProofProps {
  totalBettors: number;
  totalSwipesRight: number;
  totalSwipesLeft: number;
}

export function SocialProof({
  totalBettors,
  totalSwipesRight,
  totalSwipesLeft,
}: SocialProofProps) {
  const totalSwipes = totalSwipesRight + totalSwipesLeft;
  const popularity =
    totalSwipes > 0 ? Math.round((totalSwipesRight / totalSwipes) * 100) : 0;

  const label =
    totalBettors === 0
      ? "No bets yet — be the first!"
      : totalBettors === 1
        ? "1 other person bet on this team"
        : `${totalBettors} others bet on this team`;

  const popularityLabel =
    popularity >= 70
      ? "Most popular team this round"
      : popularity >= 50
        ? "Trending this round"
        : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
        <span>{label}</span>
      </div>

      {popularityLabel && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.683a1 1 0 01.633.633l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
          </svg>
          {popularityLabel}
        </div>
      )}

      {/* Popularity bar */}
      {totalSwipes > 0 && (
        <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${popularity}%` }}
          />
        </div>
      )}
    </div>
  );
}

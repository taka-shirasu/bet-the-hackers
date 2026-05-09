"use client";

import { useEffect, useState } from "react";
import {
  Crown,
  Star,
  Coins,
  TrendingUp,
  Trophy,
  ArrowLeft,
  Users,
  Target,
  BarChart3,
} from "lucide-react";
import type { Bet, UserPortfolio } from "@/types";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types (mirrored from main page for localStorage hydration)         */
/* ------------------------------------------------------------------ */

interface TeamProfile {
  id: number;
  name: string;
  tagline: string;
  building: string;
  winScore: number;
  image: string;
  color: string;
  competitiveness: number;
  alignment: number;
  marketability: number;
}

/* ------------------------------------------------------------------ */
/*  Ring meter (reused from main page)                                 */
/* ------------------------------------------------------------------ */

let ringIdCounter = 0;

function RingMeter({ label, value }: { label: string; value: number }) {
  const [gradId] = useState(() => `dash-ring-${ringIdCounter++}`);
  const size = 100;
  const strokeW = 10;
  const r = (size - strokeW) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * (value / 100);
  const gap = circumference - filled;

  return (
    <div className="ring-meter">
      <svg viewBox={`0 0 ${size} ${size}`} className="ring-svg">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60cfff" />
            <stop offset="100%" stopColor="#1a56db" />
          </linearGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={strokeW}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeW}
          strokeLinecap="round"
          className="ring-progress"
          style={{
            "--ring-filled": `${filled}`,
            "--ring-gap": `${gap}`,
            "--ring-circ": `${circumference}`,
          } as React.CSSProperties}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          className="ring-value-text"
          style={{ fill: "var(--ink)" }}
        >
          {value}%
        </text>
      </svg>
      <div className="ring-label" style={{ color: "var(--muted)" }}>
        {label}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard page                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [winner, setWinner] = useState<TeamProfile | null>(null);
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [teamTotals, setTeamTotals] = useState<
    Record<number, { total: number; count: number }>
  >({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const w = localStorage.getItem("hackbet_winner");
    const p = localStorage.getItem("hackbet_portfolio");
    const u = localStorage.getItem("hackbet_user");
    const t = localStorage.getItem("hackbet_team_totals");

    if (w) setWinner(JSON.parse(w));
    if (p) setPortfolio(JSON.parse(p));
    if (u) setUser(JSON.parse(u));
    if (t) setTeamTotals(JSON.parse(t));
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hasBets = portfolio && portfolio.bets.length > 0;
  const wonBet = winner && portfolio?.bets.find((b) => b.teamId === winner.id);

  return (
    <main className="dash">
      {/* Header */}
      <header className="dash-header">
        <Link href="/" className="dash-back">
          <ArrowLeft size={18} />
          Back to betting
        </Link>
        <h1>
          <BarChart3 size={28} />
          Dashboard
        </h1>
        {user && (
          <span className="dash-user">
            <Users size={14} />
            {user.name}
          </span>
        )}
      </header>

      {/* Winner Section (visible to everyone) */}
      <section className="dash-section">
        <h2 className="dash-section-title">
          <Trophy size={22} />
          Winner
        </h2>

        {winner ? (
          <div
            className="dash-winner"
            style={{ "--accent": winner.color } as React.CSSProperties}
          >
            <div className="dash-winner-top">
              <img
                src={winner.image}
                alt={winner.name}
                className="dash-winner-img"
              />
              <div className="dash-winner-info">
                <div className="dash-winner-crown">
                  <Crown size={28} />
                </div>
                <h3>{winner.name}</h3>
                <p>{winner.tagline}</p>
                <div className="dash-winner-score">
                  <Star size={16} />
                  {winner.winScore}% win likelihood
                </div>
              </div>
            </div>

            <div className="dash-winner-rings">
              <RingMeter
                label="Competitiveness"
                value={winner.competitiveness}
              />
              <RingMeter label="Alignment" value={winner.alignment} />
              <RingMeter label="Marketability" value={winner.marketability} />
            </div>
          </div>
        ) : (
          <div className="dash-empty">
            <Target size={32} />
            <p>No winner yet. Complete all rounds to see the winner here.</p>
          </div>
        )}
      </section>

      {/* My Bets Section (user-specific) */}
      <section className="dash-section">
        <h2 className="dash-section-title">
          <Coins size={22} />
          My Bets
        </h2>

        {hasBets ? (
          <>
            {/* Summary cards */}
            <div className="dash-stats">
              <div className="dash-stat">
                <span className="dash-stat-label">Credits remaining</span>
                <span className="dash-stat-value">{portfolio.credits}</span>
              </div>
              <div className="dash-stat">
                <span className="dash-stat-label">Total wagered</span>
                <span className="dash-stat-value spent">
                  {portfolio.totalSpent}
                </span>
              </div>
              <div className="dash-stat">
                <span className="dash-stat-label">Potential payout</span>
                <span className="dash-stat-value payout">
                  +{portfolio.potentialPayout}
                </span>
              </div>
              {wonBet && (
                <div className="dash-stat won">
                  <span className="dash-stat-label">Result</span>
                  <span className="dash-stat-value payout">
                    Won +{wonBet.potentialPayout}!
                  </span>
                </div>
              )}
            </div>

            {/* Bet list */}
            <div className="dash-bets">
              {portfolio.bets.map((bet) => {
                const isWinner = winner && bet.teamId === winner.id;
                return (
                  <div
                    key={bet.id}
                    className={`dash-bet ${isWinner ? "dash-bet-won" : ""}`}
                  >
                    <div className="dash-bet-team">
                      <strong>{bet.teamName}</strong>
                      {isWinner && (
                        <span className="dash-bet-badge">
                          <Crown size={12} /> Winner
                        </span>
                      )}
                    </div>
                    <div className="dash-bet-details">
                      <span>
                        <Coins size={13} />
                        {bet.amount} credits
                      </span>
                      <span>
                        <Target size={13} />
                        {Math.round(bet.winProbability * 100)}% odds
                      </span>
                      <span className={isWinner ? "payout-won" : ""}>
                        <TrendingUp size={13} />
                        {isWinner ? "Won" : "Potential"}: +{bet.potentialPayout}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="dash-empty">
            <Coins size={32} />
            <p>
              {user
                ? "You haven't placed any bets yet. Start swiping to place bets!"
                : "Create an account and place bets to see them here."}
            </p>
            <Link href="/" className="dash-cta">
              Start betting
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

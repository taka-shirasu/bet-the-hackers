"use client";

import { useId, useMemo, useState, useRef, useEffect } from "react";
import { useBettingMemory } from "@/hooks/use-betting-memory";
import { useTeamInsights } from "@/hooks/use-team-insights";
import { useAgentScores } from "@/hooks/use-agent-scores";
import { type Track, TRACK_CRITERIA } from "@/lib/judging-criteria";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  BriefcaseBusiness,
  Crown,
  Heart,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Users,
  X,
  Coins,
  TrendingUp,
  Award,
  Play,
  ChevronDown,
  UserPlus,
  LogIn,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import type { Bet, UserPortfolio, LeaderboardEntry } from "@/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Teammate = {
  name: string;
  role: string;
  linkedin: string;
};

type TeamProfile = {
  id: number;
  name: string;
  tagline: string;
  building: string;
  judgeFit: string;
  winScore: number;
  image: string;
  video: string;
  strengths: string[];
  team: Teammate[];
  color: string;
  totalBettors: number;
  totalSwipesRight: number;
  totalSwipesLeft: number;
  competitiveness: number;
  alignment: number;
  marketability: number;
  track: Track;
};

/* ------------------------------------------------------------------ */
/*  Seed data                                                          */
/* ------------------------------------------------------------------ */

const STARTING_CREDITS = 1000;

const teamsData: TeamProfile[] = [
  {
    id: 1,
    name: "Signal Syndicate",
    tagline: "AI co-pilot for live sports decisions",
    building:
      "A real-time command center that turns betting odds, social signals, and injury news into explainable picks.",
    judgeFit:
      "Very strong with product-minded judges who reward clarity, live demos, and measurable market pull.",
    winScore: 88,
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1100&q=80",
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    strengths: ["Live data", "Sharp demo", "Revenue story"],
    team: [
      { name: "Maya Chen", role: "ML systems", linkedin: "https://linkedin.com" },
      { name: "Jon Bell", role: "Product design", linkedin: "https://linkedin.com" },
      { name: "Ari Okafor", role: "Backend", linkedin: "https://linkedin.com" },
    ],
    color: "#ff4458",
    totalBettors: 12,
    totalSwipesRight: 45,
    totalSwipesLeft: 8,
    competitiveness: 92,
    alignment: 85,
    marketability: 90,
    track: "always-on-agents" as Track,
  },
  {
    id: 2,
    name: "Patch Party",
    tagline: "One-click security fixes for messy repos",
    building:
      "A GitHub agent that finds vulnerable dependencies, opens safe patches, and explains risk in founder-friendly language.",
    judgeFit:
      "Best with technical judges who like infrastructure depth, security posture, and credible engineering scope.",
    winScore: 82,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1100&q=80",
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    strengths: ["Security", "GitHub-native", "Trust"],
    team: [
      { name: "Nico Ramos", role: "Full-stack", linkedin: "https://linkedin.com" },
      { name: "Priya Shah", role: "Security", linkedin: "https://linkedin.com" },
      { name: "Leo Martins", role: "Growth", linkedin: "https://linkedin.com" },
    ],
    color: "#12b886",
    totalBettors: 8,
    totalSwipesRight: 31,
    totalSwipesLeft: 22,
    competitiveness: 78,
    alignment: 82,
    marketability: 74,
    track: "ship-it-full-stack" as Track,
  },
  {
    id: 3,
    name: "Room Tone",
    tagline: "Meeting memory that actually ships tasks",
    building:
      "A lightweight assistant that joins hackathon standups, extracts blockers, and turns decisions into Linear tickets.",
    judgeFit:
      "Strong with operator judges who care about workflow polish, team adoption, and low-friction integrations.",
    winScore: 76,
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1100&q=80",
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    strengths: ["Collaboration", "Workflow", "Integrations"],
    team: [
      { name: "Cam Lee", role: "Voice AI", linkedin: "https://linkedin.com" },
      { name: "Sam Rivera", role: "Frontend", linkedin: "https://linkedin.com" },
      { name: "Inez Ford", role: "PM", linkedin: "https://linkedin.com" },
    ],
    color: "#228be6",
    totalBettors: 5,
    totalSwipesRight: 22,
    totalSwipesLeft: 31,
    competitiveness: 70,
    alignment: 88,
    marketability: 68,
    track: "company-brain" as Track,
  },
  {
    id: 4,
    name: "Nudge Cart",
    tagline: "Personalized checkout recovery for small shops",
    building:
      "A storefront widget that predicts why shoppers hesitate and generates tailored offers before they abandon cart.",
    judgeFit:
      "High fit with business judges who favor obvious customers, fast monetization, and polished end-user UX.",
    winScore: 84,
    image:
      "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1100&q=80",
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    strengths: ["Commerce", "Clear ROI", "Polished UX"],
    team: [
      { name: "Elena Park", role: "Commerce", linkedin: "https://linkedin.com" },
      { name: "Drew Kim", role: "Data", linkedin: "https://linkedin.com" },
      { name: "Omar Diaz", role: "Design", linkedin: "https://linkedin.com" },
    ],
    color: "#f59f00",
    totalBettors: 10,
    totalSwipesRight: 38,
    totalSwipesLeft: 15,
    competitiveness: 85,
    alignment: 76,
    marketability: 91,
    track: "ai-native-growth" as Track,
  },
  {
    id: 5,
    name: "Proof Garden",
    tagline: "Verified climate claims for consumer brands",
    building:
      "A traceability layer that checks supplier evidence and turns sustainability claims into auditable product badges.",
    judgeFit:
      "Likely to land with mission-driven judges, especially if the team makes the compliance angle feel practical.",
    winScore: 71,
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1100&q=80",
    video:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    strengths: ["Impact", "Compliance", "B2B"],
    team: [
      { name: "Talia Moss", role: "Ops", linkedin: "https://linkedin.com" },
      { name: "Ben Yu", role: "Data", linkedin: "https://linkedin.com" },
      { name: "Noor Ali", role: "Frontend", linkedin: "https://linkedin.com" },
    ],
    color: "#7c3aed",
    totalBettors: 3,
    totalSwipesRight: 12,
    totalSwipesLeft: 41,
    competitiveness: 65,
    alignment: 72,
    marketability: 60,
    track: "always-on-agents" as Track,
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { userId: "u1", displayName: "CryptoKing99", totalBets: 5, totalSpent: 450, potentialPayout: 1280, topPick: "Signal Syndicate" },
  { userId: "u2", displayName: "HackQueen", totalBets: 3, totalSpent: 300, potentialPayout: 900, topPick: "Patch Party" },
  { userId: "u3", displayName: "BetaMaster", totalBets: 4, totalSpent: 380, potentialPayout: 760, topPick: "Signal Syndicate" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function calculatePayout(amount: number, winScore: number): number {
  const prob = Math.max(winScore / 100, 0.01);
  return Math.round(amount * (1 / prob) * 0.9);
}

function nudgeScore(team: TeamProfile, direction: "left" | "right"): TeamProfile {
  const newRight = team.totalSwipesRight + (direction === "right" ? 1 : 0);
  const newLeft = team.totalSwipesLeft + (direction === "left" ? 1 : 0);
  const total = newRight + newLeft;
  const rawRatio = total > 0 ? (newRight / total) * 100 : 50;
  const newScore = Math.round(team.winScore * 0.85 + rawRatio * 0.15);

  return {
    ...team,
    totalSwipesRight: newRight,
    totalSwipesLeft: newLeft,
    winScore: Math.min(Math.max(newScore, 1), 99),
    totalBettors: direction === "right" ? team.totalBettors + 1 : team.totalBettors,
  };
}

/* ------------------------------------------------------------------ */
/*  Gauge meter component                                              */
/* ------------------------------------------------------------------ */

function RingMeter({ label, value }: { label: string; value: number }) {
  const gradId = useId();
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
          stroke="rgba(255,255,255,0.3)"
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
        >
          {value}%
        </text>
      </svg>
      <div className="ring-label">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  // Hydrate state from localStorage on mount
  const [hydrated, setHydrated] = useState(false);

  const [round, setRound] = useState(1);
  const [roundTeams, setRoundTeams] = useState<TeamProfile[]>(teamsData);
  const [index, setIndex] = useState(0);
  const [survivors, setSurvivors] = useState<TeamProfile[]>([]);
  const [eliminated, setEliminated] = useState<TeamProfile[]>([]);
  const [winner, setWinner] = useState<TeamProfile | null>(null);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  // Betting state
  const [portfolio, setPortfolio] = useState<UserPortfolio>({
    credits: STARTING_CREDITS,
    totalSpent: 0,
    potentialPayout: 0,
    bets: [],
  });
  const [showBetScreen, setShowBetScreen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Account state
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Hyperspell memory integration
  const userId = user?.email ?? "anonymous";
  const { storeSwipe: storeSwipeMemory, storeBet: storeBetMemory } =
    useBettingMemory({ userId });

  // Nia insights integration
  const {
    analysis: niaInsight,
    loading: insightLoading,
    fetchInsights,
  } = useTeamInsights();

  // AI agent scores integration
  const {
    scores: agentScores,
    loading: agentLoading,
    fetchAllScores,
  } = useAgentScores();

  // Fetch agent scores for all teams on mount
  useEffect(() => {
    fetchAllScores(
      teamsData.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.building,
        strengths: t.strengths,
        track: t.track,
      })),
    );
  }, [fetchAllScores]);

  // Track all bets per team (teamId → total amount wagered + count)
  const [teamBetTotals, setTeamBetTotals] = useState<
    Record<number, { total: number; count: number }>
  >({});

  // Round 1 winner (stored so we can remove them from Round 2)
  const [round1Winner, setRound1Winner] = useState<TeamProfile | null>(null);

  // Restore all game state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hackbet_game_state");
      if (saved) {
        const s = JSON.parse(saved);
        if (s.round) setRound(s.round);
        if (s.roundTeams) setRoundTeams(s.roundTeams);
        if (typeof s.index === "number") setIndex(s.index);
        if (s.survivors) setSurvivors(s.survivors);
        if (s.eliminated) setEliminated(s.eliminated);
        if (s.winner) setWinner(s.winner);
        if (s.portfolio) setPortfolio(s.portfolio);
        if (s.showBetScreen) setShowBetScreen(s.showBetScreen);
        if (s.showLeaderboard) setShowLeaderboard(s.showLeaderboard);
        if (s.teamBetTotals) setTeamBetTotals(s.teamBetTotals);
        if (s.round1Winner) setRound1Winner(s.round1Winner);
      }
      const savedUser = localStorage.getItem("hackbet_user");
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch { /* ignore parse errors */ }
    setHydrated(true);
  }, []);

  // Persist all game state to localStorage whenever it changes
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      "hackbet_game_state",
      JSON.stringify({
        round,
        roundTeams,
        index,
        survivors,
        eliminated,
        winner,
        portfolio,
        showBetScreen,
        showLeaderboard,
        teamBetTotals,
        round1Winner,
      }),
    );
    // Also keep individual keys for dashboard
    if (winner) localStorage.setItem("hackbet_winner", JSON.stringify(winner));
    if (portfolio.bets.length > 0) localStorage.setItem("hackbet_portfolio", JSON.stringify(portfolio));
    if (Object.keys(teamBetTotals).length > 0) localStorage.setItem("hackbet_team_totals", JSON.stringify(teamBetTotals));
  }, [hydrated, round, roundTeams, index, survivors, eliminated, winner, portfolio, showBetScreen, showLeaderboard, teamBetTotals, round1Winner]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("hackbet_user", JSON.stringify(user));
    }
  }, [user]);

  const active = roundTeams[index];
  const next = roundTeams[index + 1];
  const totalRemaining = winner ? 1 : roundTeams.length - index;
  const leader = useMemo(
    () => [...roundTeams].sort((a, b) => b.winScore - a.winScore)[0],
    [roundTeams],
  );

  function finishPick(nextSurvivors: TeamProfile[], nextEliminated: TeamProfile[]) {
    if (nextSurvivors.length === 0) {
      // Nobody liked — fallback to best winScore
      const fallback = roundTeams
        .slice()
        .sort((a, b) => b.winScore - a.winScore)[0];
      setWinner(fallback);
      setEliminated(nextEliminated);
      return;
    }

    setSurvivors(nextSurvivors);
    setEliminated(nextEliminated);

    // Show bet screen in both rounds
    setShowBetScreen(true);
  }

  function advanceToNextRound() {
    setShowLeaderboard(false);

    if (round === 1) {
      // Round 1 winner stays in the pool for Round 2
      setRound(2);
      setRoundTeams(survivors);
      setIndex(0);
      setSurvivors([]);
      setEliminated([]);
    } else {
      // Round 2 done — winner is the top-scoring survivor
      const r2Winner = [...survivors].sort((a, b) => b.winScore - a.winScore)[0];
      if (r2Winner) {
        setWinner(r2Winner);
      }
    }
  }

  function swipe(choice: "left" | "right") {
    if (!active || direction) return;

    // Store swipe in Hyperspell memory
    storeSwipeMemory(String(active.id), active.name, choice).catch(() => {});

    // Nudge probability on every swipe
    const updatedTeams = roundTeams.map((t) =>
      t.id === active.id ? nudgeScore(t, choice) : t,
    );
    setRoundTeams(updatedTeams);

    setDirection(choice);
    window.setTimeout(() => {
      const updatedActive = updatedTeams.find((t) => t.id === active.id)!;
      const nextSurvivors = choice === "right" ? [...survivors, updatedActive] : survivors;
      const nextEliminated = choice === "left" ? [active, ...eliminated] : eliminated;
      const lastCard = index === roundTeams.length - 1;

      if (lastCard) {
        finishPick(nextSurvivors, nextEliminated);
      } else {
        if (choice === "right") setSurvivors(nextSurvivors);
        else setEliminated(nextEliminated);
        setIndex((current) => current + 1);
      }

      setDirection(null);
    }, 250);
  }

  function confirmBets(bets: Bet[]) {
    const totalSpent = bets.reduce((sum, b) => sum + b.amount, 0);
    const totalPayout = bets.reduce((sum, b) => sum + b.potentialPayout, 0);

    // Store each bet in Hyperspell memory
    for (const bet of bets) {
      storeBetMemory(
        String(bet.teamId),
        bet.teamName,
        bet.amount,
        bet.winProbability,
      ).catch(() => {});
    }

    setPortfolio((prev) => ({
      credits: prev.credits - totalSpent,
      totalSpent: prev.totalSpent + totalSpent,
      potentialPayout: prev.potentialPayout + totalPayout,
      bets: [...prev.bets, ...bets],
    }));

    // Track bets per team
    setTeamBetTotals((prev) => {
      const next = { ...prev };
      for (const bet of bets) {
        const existing = next[bet.teamId] ?? { total: 0, count: 0 };
        next[bet.teamId] = {
          total: existing.total + bet.amount,
          count: existing.count + 1,
        };
      }
      return next;
    });

    setShowBetScreen(false);
    setShowLeaderboard(true);
  }

  function skipAllBets() {
    setShowBetScreen(false);
    setShowLeaderboard(true);
  }

  function reset() {
    setRound(1);
    setRoundTeams(teamsData);
    setIndex(0);
    setSurvivors([]);
    setEliminated([]);
    setWinner(null);
    setDirection(null);
    setPortfolio({
      credits: STARTING_CREDITS,
      totalSpent: 0,
      potentialPayout: 0,
      bets: [],
    });
    setShowBetScreen(false);
    setShowLeaderboard(false);
    setTeamBetTotals({});
    setRound1Winner(null);

    // Clear all localStorage
    localStorage.removeItem("hackbet_winner");
    localStorage.removeItem("hackbet_portfolio");
    localStorage.removeItem("hackbet_team_totals");
    localStorage.removeItem("hackbet_game_state");
  }

  return (
    <main className="shell">
      <section className="topbar" aria-label="Hackathon team picker">
        <div>
          <div className="brand-mark" aria-label="nozomio">
            <img src="/nozomio-logo.png" alt="" />
            <span>nozomio</span>
          </div>
          <h1>Swipe for the team you think wins.</h1>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {user ? (
            <div className="bankroll">
              <LogIn size={16} />
              <span>{user.name}</span>
            </div>
          ) : (
            <button className="bankroll" onClick={() => setShowAccountModal(true)}>
              <UserPlus size={18} />
              <span>Create Account</span>
            </button>
          )}
          <Link href="/dashboard" className="bankroll">
            <BarChart3 size={18} />
            <span>Dashboard</span>
          </Link>
          <button className="bankroll" onClick={reset}>
            <RotateCcw size={18} />
            <span>Reset</span>
          </button>
        </div>
      </section>

      <section className="workspace workspace--with-portfolio">
        {/* Left panel — round status */}
        <aside className="panel left-panel" aria-label="Round status">
          <div className="metric">
            <span>Round</span>
            <strong>{round}</strong>
          </div>
          <div className="metric">
            <span>Teams left</span>
            <strong>{totalRemaining}</strong>
          </div>
          <div className="metric hot">
            <span>Advanced</span>
            <strong>{survivors.length}</strong>
          </div>
          <div className="trend">
            <Trophy size={18} />
            <div>
              <strong>Model favorite</strong>
              <span>
                {leader?.name ?? "TBD"} leads this round at {leader?.winScore ?? 0}%.
              </span>
            </div>
          </div>
        </aside>

        {/* Center — card deck */}
        <section className="deck-area" aria-label="Team swipe deck">
          <div className="deck">
            {winner ? (
              <WinnerCard team={winner} onReset={reset} portfolio={portfolio} />
            ) : (
              <>
                {next && <TeamCard team={next} isBehind round={round} key={`behind-${next.id}`} agentScores={agentScores[next.id]} agentLoading={!!agentLoading[next.id]} />}
                {active && (
                  <TeamCard
                    team={active}
                    direction={direction}
                    round={round}
                    key={`active-${active.id}`}
                    niaInsight={niaInsight}
                    insightLoading={insightLoading}
                    onRequestInsight={(t) =>
                      fetchInsights({
                        teamName: t.name,
                        teamDescription: t.building,
                      })
                    }
                    onSwipe={swipe}
                    agentScores={agentScores[active.id]}
                    agentLoading={!!agentLoading[active.id]}
                  />
                )}
              </>
            )}
          </div>

          {/* Swipe buttons are now inside the card */}
        </section>

        {/* Right panel — survivors */}
        <aside className="panel right-panel" aria-label="Advanced teams">
          <div className="panel-heading">
            <Sparkles size={18} />
            <h2>Next round</h2>
          </div>
          {survivors.length === 0 ? (
            <p className="muted">
              Swipe right on teams you believe can win. Survivors collect here.
            </p>
          ) : (
            <div className="ticket-list">
              {survivors.map((team) => (
                <article className="ticket" key={team.id}>
                  <span style={{ backgroundColor: team.color }} />
                  <div>
                    <strong>{team.name}</strong>
                    <small>{team.winScore}% win likelihood</small>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Portfolio section */}
          <PortfolioPanel portfolio={portfolio} round={round} />

          {/* Bets by team */}
          {Object.keys(teamBetTotals).length > 0 && (
            <div className="portfolio-section">
              <div className="panel-heading">
                <TrendingUp size={16} />
                <h2 style={{ fontSize: "0.95rem" }}>Bets by team</h2>
              </div>
              <div className="team-bets-list">
                {teamsData
                  .filter((t) => teamBetTotals[t.id])
                  .map((t) => (
                    <div className="team-bet-row" key={t.id}>
                      <span className="team-bet-dot" style={{ backgroundColor: t.color }} />
                      <div className="team-bet-info">
                        <strong>{t.name}</strong>
                        <small>
                          {teamBetTotals[t.id].count}{" "}
                          {teamBetTotals[t.id].count === 1 ? "bet" : "bets"} &middot;{" "}
                          {teamBetTotals[t.id].total} credits
                        </small>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </aside>
      </section>

      {/* Bet placement screen (after swiping all cards) */}
      {showBetScreen && (
        <BetScreen
          teams={survivors}
          credits={portfolio.credits}
          onConfirm={confirmBets}
          onSkip={skipAllBets}
        />
      )}

      {/* Leaderboard overlay */}
      {showLeaderboard && (
        <LeaderboardOverlay
          round={round}
          portfolio={portfolio}
          onNext={advanceToNextRound}
        />
      )}

      {/* Account creation modal */}
      {showAccountModal && (
        <AccountModal
          onClose={() => setShowAccountModal(false)}
          onCreateAccount={(name, email) => {
            setUser({ name, email });
            setShowAccountModal(false);
          }}
        />
      )}
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Team card (existing, with social proof added)                      */
/* ------------------------------------------------------------------ */

function TeamCard({
  team,
  isBehind = false,
  direction = null,
  round = 1,
  niaInsight = null,
  insightLoading = false,
  onRequestInsight,
  onSwipe,
  agentScores,
  agentLoading = false,
}: {
  team: TeamProfile;
  isBehind?: boolean;
  direction?: "left" | "right" | null;
  round?: number;
  niaInsight?: string | null;
  insightLoading?: boolean;
  onRequestInsight?: (team: TeamProfile) => void;
  onSwipe?: (choice: "left" | "right") => void;
  agentScores?: { criterion1: number; criterion2: number; criterion3: number };
  agentLoading?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const totalSwipes = team.totalSwipesRight + team.totalSwipesLeft;
  const popularity = totalSwipes > 0 ? Math.round((team.totalSwipesRight / totalSwipes) * 100) : 0;

  // Use live agent scores when available, fall back to hardcoded values
  const c1Score = agentScores?.criterion1 ?? team.competitiveness;
  const c2Score = agentScores?.criterion2 ?? team.alignment;
  const c3Score = agentScores?.criterion3 ?? team.marketability;

  // Get track-specific criterion labels
  const trackCriteria = TRACK_CRITERIA[team.track];
  const label1 = trackCriteria[0].name;
  const label2 = trackCriteria[1].name;
  const label3 = trackCriteria[2].name;

  // Round 2 = show details directly (no video)
  const showDetails = round >= 2;

  // Fetch Nia insight when card is shown in Round 2
  useEffect(() => {
    if (showDetails && !isBehind && onRequestInsight && !niaInsight && !insightLoading) {
      onRequestInsight(team);
    }
  }, [showDetails, isBehind, team.id]);

  return (
    <article
      className={[
        "bet-card",
        isBehind ? "is-behind" : "",
        direction ? `swipe-${direction}` : "",
        showDetails ? "card-expanded" : "",
      ].join(" ")}
      style={{ "--accent": team.color } as React.CSSProperties}
    >
      {!showDetails && (
        <>
          <div className="video-wrap video-wrap-compact">
            <video
              ref={videoRef}
              src={team.video}
              poster={team.image}
              autoPlay
              muted
              loop
              playsInline
            />
            {!agentLoading && (
              <div className="winnability-badge">
                <span className="winnability-value">{Math.round((c1Score + c2Score + c3Score) / 3)}%</span>
                <span className="winnability-label">Win</span>
              </div>
            )}
          </div>
          <div className="card-info-section">
            <h2 className="card-info-name">{team.name}</h2>
            <p className="card-info-desc">{team.tagline}</p>
            <div className="card-info-rings">
              {agentLoading ? (
                <p className="agent-loading">Agents analyzing...</p>
              ) : (
                <>
                  <RingMeter label={label1} value={c1Score} />
                  <RingMeter label={label2} value={c2Score} />
                  <RingMeter label={label3} value={c3Score} />
                </>
              )}
            </div>
            {onSwipe && !isBehind && (
              <div className="card-actions">
                <button
                  className="round-button pass"
                  onClick={() => onSwipe("left")}
                  aria-label="Pass on this team"
                >
                  <X size={28} />
                </button>
                <button
                  className="round-button like"
                  onClick={() => onSwipe("right")}
                  aria-label="Advance this team"
                >
                  <Heart size={28} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {showDetails && (
        <div className="card-body card-body-expandable">
          <div className="identity">
            <div>
              <h2>{team.name}</h2>
              <p>{team.tagline}</p>
            </div>
            <span>
              <BadgeCheck size={14} />
              judge fit
            </span>
          </div>

          <div className="profile-section">
            <Brain size={17} />
            <p>{team.building}</p>
          </div>

          <div className="skill-row">
            {team.strengths.map((strength) => (
              <span key={strength}>{strength}</span>
            ))}
          </div>

          <div className="social-proof">
            <div className="social-proof-row">
              <Users size={14} />
              <span>
                {team.totalBettors === 0
                  ? "No bets yet — be the first!"
                  : `${team.totalBettors} ${team.totalBettors === 1 ? "person" : "others"} bet on this team`}
              </span>
            </div>
            {popularity >= 60 && (
              <div className="popularity-badge">
                <TrendingUp size={12} />
                {popularity >= 70 ? "Most popular team this round" : "Trending this round"}
              </div>
            )}
            {totalSwipes > 0 && (
              <div className="popularity-bar">
                <div className="popularity-fill" style={{ width: `${popularity}%` }} />
              </div>
            )}
          </div>

          <div className="proof-row">
            <div>
              <span>Likelihood vs field</span>
              <strong>
                {team.winScore}% based on demo clarity, market pull, and execution risk.
              </strong>
            </div>
            <div>
              <span>Judges</span>
              <strong>{team.judgeFit}</strong>
            </div>
          </div>

          {(niaInsight || insightLoading) && (
            <div className="profile-section nia-insight">
              <Sparkles size={17} />
              {insightLoading ? (
                <p style={{ opacity: 0.6 }}>Analyzing project with Nia...</p>
              ) : (
                <p>{niaInsight}</p>
              )}
            </div>
          )}

          <div className="team-list">
            <div className="team-title">
              <Users size={16} />
              <strong>Team behind it</strong>
            </div>
            {team.team.map((member) => (
              <a href={member.linkedin} key={member.name} target="_blank" rel="noreferrer">
                <BriefcaseBusiness size={15} />
                <span>{member.name}</span>
                <small>{member.role}</small>
                <ArrowRight size={14} />
              </a>
            ))}
          </div>

          {onSwipe && !isBehind && (
            <div className="card-actions">
              <button
                className="round-button pass"
                onClick={() => onSwipe("left")}
                aria-label="Pass on this team"
              >
                <X size={28} />
              </button>
              <button
                className="round-button like"
                onClick={() => onSwipe("right")}
                aria-label="Advance this team"
              >
                <Heart size={28} />
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Winner card (updated with portfolio summary)                       */
/* ------------------------------------------------------------------ */

function WinnerCard({
  team,
  onReset,
  portfolio,
}: {
  team: TeamProfile;
  onReset: () => void;
  portfolio: UserPortfolio;
}) {
  const teamBet = portfolio.bets.find((b) => b.teamId === team.id);

  return (
    <article
      className="empty-state winner-card"
      style={{ "--accent": team.color } as React.CSSProperties}
    >
      <Crown size={42} />
      <p className="eyebrow">Winner pick</p>
      <h2>{team.name}</h2>
      <p>{team.tagline}</p>
      <div className="winner-score">
        <Star size={18} />
        {team.winScore}% projected win likelihood
      </div>
      {teamBet && (
        <div className="winner-bet-info">
          You bet <strong>{teamBet.amount}</strong> credits — potential payout:{" "}
          <strong style={{ color: "#12b886" }}>+{teamBet.potentialPayout}</strong>
        </div>
      )}
      <button className="primary-action" onClick={onReset}>
        <RotateCcw size={18} />
        Run bracket again
      </button>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Bet screen (full-screen after all swipes)                          */
/* ------------------------------------------------------------------ */

function BetScreen({
  teams,
  credits,
  onConfirm,
  onSkip,
}: {
  teams: TeamProfile[];
  credits: number;
  onConfirm: (bets: Bet[]) => void;
  onSkip: () => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [amount, setAmount] = useState(0);

  const selected = teams.find((t) => t.id === selectedId) ?? null;
  const payout = selected && amount > 0 ? calculatePayout(amount, selected.winScore) : 0;

  function handleConfirm() {
    if (!selected || amount === 0) return;
    const bet: Bet = {
      id: `bet-${Date.now()}-${selected.id}`,
      userId: "user-current",
      teamId: selected.id,
      teamName: selected.name,
      amount,
      potentialPayout: calculatePayout(amount, selected.winScore),
      winProbability: selected.winScore / 100,
      createdAt: new Date().toISOString(),
    };
    onConfirm([bet]);
  }

  return (
    <div className="modal-backdrop">
      <div className="bet-screen">
        <div className="bet-screen-header">
          <Crown size={24} />
          <h2>Pick your winner</h2>
          <p>Choose the team you think will win, then decide how much to bet.</p>
        </div>

        <div className="bet-screen-list">
          {teams.map((team) => {
            const isSelected = selectedId === team.id;
            return (
              <button
                className={`bet-screen-team bet-pick ${isSelected ? "bet-pick--active" : ""}`}
                key={team.id}
                onClick={() => {
                  setSelectedId(team.id);
                  if (amount === 0) setAmount(50);
                }}
                type="button"
              >
                <div className="bet-screen-team-info">
                  <span className="bet-screen-color" style={{ backgroundColor: team.color }} />
                  <div>
                    <strong>{team.name}</strong>
                    <small>{team.winScore}% win probability</small>
                  </div>
                  {team.totalBettors > 0 && (
                    <span className="bet-screen-social">
                      {team.totalBettors} bettor{team.totalBettors > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="bet-screen-wager">
            <div className="bet-screen-credits">
              <div>
                <span>Available</span>
                <strong>{(credits - amount).toLocaleString()}</strong>
              </div>
              <div>
                <span>Bet</span>
                <strong>{amount.toLocaleString()}</strong>
              </div>
              <div>
                <span>Payout</span>
                <strong style={{ color: "#12b886" }}>+{payout.toLocaleString()}</strong>
              </div>
            </div>
            <div className="bet-screen-slider-row">
              <input
                type="range"
                min={10}
                max={credits}
                step={10}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="bet-slider"
              />
              <div className="bet-screen-amounts">
                <strong className="bet-amount-value">{amount}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="bet-actions">
          <button className="bet-action-skip" onClick={onSkip}>
            Skip betting
          </button>
          <button
            className="bet-action-confirm"
            onClick={handleConfirm}
            disabled={!selected || amount === 0}
          >
            Bet on {selected?.name ?? "…"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Portfolio panel                                                    */
/* ------------------------------------------------------------------ */

function PortfolioPanel({
  portfolio,
  round,
}: {
  portfolio: UserPortfolio;
  round: number;
}) {
  return (
    <div className="portfolio-section">
      <div className="panel-heading">
        <Coins size={18} />
        <h2>Portfolio</h2>
      </div>

      <div className="portfolio-stats">
        <div className="portfolio-stat">
          <span>Credits</span>
          <strong>{portfolio.credits.toLocaleString()}</strong>
        </div>
        <div className="portfolio-stat">
          <span>Spent</span>
          <strong>{portfolio.totalSpent.toLocaleString()}</strong>
        </div>
        <div className="portfolio-stat portfolio-stat--payout">
          <span>Payout</span>
          <strong>{portfolio.potentialPayout.toLocaleString()}</strong>
        </div>
      </div>

      {portfolio.bets.length === 0 ? (
        <p className="muted" style={{ marginTop: 12 }}>
          Swipe right and place bets to build your portfolio.
        </p>
      ) : (
        <div className="portfolio-bets">
          {portfolio.bets.map((bet) => (
            <div className="portfolio-bet" key={bet.id}>
              <div>
                <strong>{bet.teamName}</strong>
                <small>{bet.amount} credits</small>
              </div>
              <div className="portfolio-bet-payout">
                <strong>+{bet.potentialPayout.toLocaleString()}</strong>
                <small>potential</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Leaderboard overlay                                                */
/* ------------------------------------------------------------------ */

function LeaderboardOverlay({
  round,
  portfolio,
  onNext,
}: {
  round: number;
  portfolio: UserPortfolio;
  onNext: () => void;
}) {
  const leaderboard: LeaderboardEntry[] = [
    ...MOCK_LEADERBOARD,
    {
      userId: "user-current",
      displayName: "You",
      totalBets: portfolio.bets.length,
      totalSpent: portfolio.totalSpent,
      potentialPayout: portfolio.potentialPayout,
      topPick:
        portfolio.bets.length > 0
          ? portfolio.bets.reduce((max, b) => (b.amount > max.amount ? b : max)).teamName
          : "-",
    },
  ].sort((a, b) => b.potentialPayout - a.potentialPayout);

  const rankColors = ["#f59f00", "#adb5bd", "#e8590c"];

  return (
    <div className="modal-backdrop">
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <Award size={24} />
          <p className="eyebrow" style={{ color: "#fff", marginBottom: 0 }}>
            Round {round} Complete
          </p>
          <h2>Leaderboard</h2>
          <p>{portfolio.bets.length} bet{portfolio.bets.length !== 1 ? "s" : ""} placed</p>
        </div>

        <div className="leaderboard-entries">
          {leaderboard.map((entry, i) => (
            <div
              className={`leaderboard-entry ${entry.userId === "user-current" ? "leaderboard-entry--you" : ""}`}
              key={entry.userId}
            >
              <div
                className="leaderboard-rank"
                style={{
                  backgroundColor: i < 3 ? rankColors[i] : "#e9ecef",
                  color: i < 3 ? "#fff" : "#495057",
                }}
              >
                {i + 1}
              </div>
              <div className="leaderboard-info">
                <strong>
                  {entry.displayName}
                  {entry.userId === "user-current" && (
                    <span className="leaderboard-you-tag">(you)</span>
                  )}
                </strong>
                <small>
                  {entry.totalBets} bets · Top pick: {entry.topPick}
                </small>
              </div>
              <div className="leaderboard-payout">
                <strong>{entry.potentialPayout.toLocaleString()}</strong>
                <small>potential</small>
              </div>
            </div>
          ))}
        </div>

        <button className="primary-action leaderboard-next" onClick={onNext}>
          <ArrowRight size={18} />
          {round === 1 ? "Continue to Round 2" : "See final results"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Account creation modal                                             */
/* ------------------------------------------------------------------ */

function AccountModal({
  onClose,
  onCreateAccount,
}: {
  onClose: () => void;
  onCreateAccount: (name: string, email: string) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="account-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create Account</h2>
        <p className="muted">Track your bets and appear on the leaderboard.</p>

        <label className="account-field">
          <span>First name</span>
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>

        <label className="account-field">
          <span>Last name</span>
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>

        <button
          className="primary-action"
          disabled={!firstName.trim() || !lastName.trim()}
          onClick={() =>
            onCreateAccount(
              `${firstName.trim()} ${lastName.trim()}`,
              `${firstName.trim().toLowerCase()}.${lastName.trim().toLowerCase()}`,
            )
          }
        >
          <UserPlus size={18} />
          Create Account
        </button>

        <button className="account-skip" onClick={onClose}>
          Skip for now
        </button>
      </div>
    </div>
  );
}

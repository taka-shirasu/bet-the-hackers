"use client";

import { useMemo, useState, useRef } from "react";
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
} from "lucide-react";
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
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
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

  const active = roundTeams[index];
  const next = roundTeams[index + 1];
  const totalRemaining = winner ? 1 : roundTeams.length - index;
  const leader = useMemo(
    () => [...roundTeams].sort((a, b) => b.winScore - a.winScore)[0],
    [roundTeams],
  );

  function finishPick(nextSurvivors: TeamProfile[], nextEliminated: TeamProfile[]) {
    if (nextSurvivors.length === 1) {
      setWinner(nextSurvivors[0]);
      setEliminated(nextEliminated);
      return;
    }

    if (nextSurvivors.length === 0) {
      const fallback = roundTeams
        .slice()
        .sort((a, b) => b.winScore - a.winScore)[0];
      setWinner(fallback);
      setEliminated(nextEliminated);
      return;
    }

    // Show bet screen with all liked teams before leaderboard
    setSurvivors(nextSurvivors);
    setEliminated(nextEliminated);
    setShowBetScreen(true);
  }

  function advanceToNextRound() {
    setShowLeaderboard(false);
    setRound((current) => current + 1);
    setRoundTeams(survivors);
    setIndex(0);
    setSurvivors([]);
  }

  function swipe(choice: "left" | "right") {
    if (!active || direction) return;

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

    setPortfolio((prev) => ({
      credits: prev.credits - totalSpent,
      totalSpent: prev.totalSpent + totalSpent,
      potentialPayout: prev.potentialPayout + totalPayout,
      bets: [...prev.bets, ...bets],
    }));

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
          <div className="bankroll">
            <Coins size={18} />
            <span>{portfolio.credits.toLocaleString()} credits</span>
          </div>
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
                {next && <TeamCard team={next} isBehind />}
                {active && <TeamCard team={active} direction={direction} />}
              </>
            )}
          </div>

          <div className="actions" aria-label="Swipe actions">
            <button
              className="round-button pass"
              onClick={() => swipe("left")}
              aria-label="Pass on this team"
              disabled={Boolean(winner) || showBetScreen}
            >
              <X size={30} />
            </button>
            <button
              className="round-button like"
              onClick={() => swipe("right")}
              aria-label="Advance this team"
              disabled={Boolean(winner) || showBetScreen}
            >
              <Heart size={30} />
            </button>
          </div>
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
}: {
  team: TeamProfile;
  isBehind?: boolean;
  direction?: "left" | "right" | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const totalSwipes = team.totalSwipesRight + team.totalSwipesLeft;
  const popularity = totalSwipes > 0 ? Math.round((team.totalSwipesRight / totalSwipes) * 100) : 0;

  const handleExpand = () => {
    if (videoRef.current) videoRef.current.pause();
    setExpanded(true);
  };

  const handleCollapse = () => {
    setExpanded(false);
    if (videoRef.current) videoRef.current.play();
  };

  return (
    <article
      className={[
        "bet-card",
        isBehind ? "is-behind" : "",
        direction ? `swipe-${direction}` : "",
        expanded ? "card-expanded" : "",
      ].join(" ")}
      style={{ "--accent": team.color } as React.CSSProperties}
    >
      <div className="video-wrap">
        <video
          ref={videoRef}
          src={team.video}
          poster={team.image}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="odds-pill">{team.winScore}%</div>
        <div className="video-overlay">
          <h2 className="video-team-name">{team.name}</h2>
          <p className="video-tagline">{team.tagline}</p>
        </div>
        {!expanded && (
          <button className="expand-trigger" onClick={handleExpand}>
            <ChevronDown size={18} />
            Tap for details
          </button>
        )}
      </div>

      {expanded && (
        <div className="card-body card-body-expandable">
          <button className="collapse-btn" onClick={handleCollapse}>
            <Play size={14} />
            Back to video
          </button>

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
  const [amounts, setAmounts] = useState<Record<number, number>>(
    () => Object.fromEntries(teams.map((t) => [t.id, 0])),
  );

  const totalAllocated = Object.values(amounts).reduce((s, v) => s + v, 0);
  const remaining = credits - totalAllocated;

  function updateAmount(teamId: number, value: number) {
    setAmounts((prev) => {
      const otherTotal = Object.entries(prev)
        .filter(([id]) => Number(id) !== teamId)
        .reduce((s, [, v]) => s + v, 0);
      const capped = Math.min(value, credits - otherTotal);
      return { ...prev, [teamId]: Math.max(0, capped) };
    });
  }

  function handleConfirm() {
    const bets: Bet[] = teams
      .filter((t) => amounts[t.id] > 0)
      .map((t) => ({
        id: `bet-${Date.now()}-${t.id}`,
        userId: "user-current",
        teamId: t.id,
        teamName: t.name,
        amount: amounts[t.id],
        potentialPayout: calculatePayout(amounts[t.id], t.winScore),
        winProbability: t.winScore / 100,
        createdAt: new Date().toISOString(),
      }));
    onConfirm(bets);
  }

  return (
    <div className="modal-backdrop">
      <div className="bet-screen">
        <div className="bet-screen-header">
          <Coins size={24} />
          <h2>Place your bets</h2>
          <p>You liked {teams.length} team{teams.length > 1 ? "s" : ""}. Allocate credits to bet on who will win.</p>
        </div>

        <div className="bet-screen-credits">
          <div>
            <span>Available</span>
            <strong>{remaining.toLocaleString()}</strong>
          </div>
          <div>
            <span>Allocated</span>
            <strong>{totalAllocated.toLocaleString()}</strong>
          </div>
          <div>
            <span>Total payout</span>
            <strong style={{ color: "#12b886" }}>
              +{teams
                .filter((t) => amounts[t.id] > 0)
                .reduce((s, t) => s + calculatePayout(amounts[t.id], t.winScore), 0)
                .toLocaleString()}
            </strong>
          </div>
        </div>

        <div className="bet-screen-list">
          {teams.map((team) => {
            const amt = amounts[team.id];
            const payout = amt > 0 ? calculatePayout(amt, team.winScore) : 0;
            const maxForTeam = Math.min(remaining + amt, 500);
            return (
              <div className="bet-screen-team" key={team.id}>
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
                <div className="bet-screen-slider-row">
                  <input
                    type="range"
                    min={0}
                    max={maxForTeam}
                    step={10}
                    value={amt}
                    onChange={(e) => updateAmount(team.id, Number(e.target.value))}
                    className="bet-slider"
                  />
                  <div className="bet-screen-amounts">
                    <strong className="bet-amount-value">{amt}</strong>
                    {payout > 0 && (
                      <small style={{ color: "#12b886" }}>+{payout.toLocaleString()}</small>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bet-actions">
          <button className="bet-action-skip" onClick={onSkip}>
            Skip betting
          </button>
          <button
            className="bet-action-confirm"
            onClick={handleConfirm}
            disabled={totalAllocated === 0}
          >
            Confirm {Object.values(amounts).filter((v) => v > 0).length} bet
            {Object.values(amounts).filter((v) => v > 0).length !== 1 ? "s" : ""}
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
          <p>{portfolio.bets.length} bets placed this round</p>
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
          Continue to Round {round + 1}
        </button>
      </div>
    </div>
  );
}

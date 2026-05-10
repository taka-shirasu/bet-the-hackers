"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  BarChart3,
  BadgeCheck,
  Brain,
  Coins,
  Crown,
  Heart,
  LogOut,
  RotateCcw,
  Scale,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Trophy,
  Users,
  X
} from "lucide-react";

import { safeJson } from "@/lib/http";
import { fallbackTeams, type TeamProfile } from "@/lib/teams";

type Participant = {
  id: string;
  fullName: string;
};

type PickStatus = "idle" | "saving" | "saved" | "error";

export default function Home() {
  const [allTeams, setAllTeams] = useState<TeamProfile[]>(fallbackTeams);
  const [round, setRound] = useState(1);
  const [roundTeams, setRoundTeams] = useState<TeamProfile[]>(fallbackTeams);
  const [index, setIndex] = useState(0);
  const [survivors, setSurvivors] = useState<TeamProfile[]>([]);
  const [eliminated, setEliminated] = useState<TeamProfile[]>([]);
  const [winner, setWinner] = useState<TeamProfile | null>(null);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [dataSource, setDataSource] = useState<"fallback" | "mongodb">("fallback");
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [fullName, setFullName] = useState("");
  const [loginStatus, setLoginStatus] = useState<"idle" | "saving">("idle");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pickStatus, setPickStatus] = useState<PickStatus>("idle");
  const [dragX, setDragX] = useState(0);
  const dragStartRef = useRef<number | null>(null);

  const active = roundTeams[index];
  const next = roundTeams[index + 1];
  const totalRemaining = winner ? 1 : roundTeams.length - index;
  const leader = useMemo(
    () => [...roundTeams].sort((a, b) => b.winScore - a.winScore)[0],
    [roundTeams]
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("nozomio_participant");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Participant;
        if (parsed.id && parsed.fullName) {
          setParticipant(parsed);
        }
      } catch {
        window.localStorage.removeItem("nozomio_participant");
      }
    }
    setHydrated(true);

    let cancelled = false;

    async function loadTeams() {
      try {
        const response = await fetch("/api/teams", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Could not load teams");
        }

        const data = await safeJson<{
          teams?: TeamProfile[];
          source?: "fallback" | "mongodb";
        }>(response);

        if (!cancelled && data?.teams?.length) {
          setDataSource(data.source === "mongodb" ? "mongodb" : "fallback");
          reset(data.teams);
        }
      } catch {
        setDataSource("fallback");
      }
    }

    loadTeams();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!winner || !participant || pickStatus === "saving" || pickStatus === "saved") {
      return;
    }

    let cancelled = false;
    const pickedBy = participant;
    const pickedWinner = winner;

    async function savePick() {
      setPickStatus("saving");
      try {
        const response = await fetch("/api/picks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            participantId: pickedBy.id,
            fullName: pickedBy.fullName,
            winnerTeamId: pickedWinner.id,
            winnerTeamName: pickedWinner.name,
            winnerScore: pickedWinner.winScore
          })
        });

        if (!response.ok) {
          throw new Error("Could not save pick");
        }

        if (!cancelled) {
          setPickStatus("saved");
        }
      } catch {
        if (!cancelled) {
          setPickStatus("error");
        }
      }
    }

    savePick();

    return () => {
      cancelled = true;
    };
  }, [participant, pickStatus, winner]);

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

    setRound((current) => current + 1);
    setRoundTeams(nextSurvivors);
    setIndex(0);
    setSurvivors([]);
    setEliminated(nextEliminated);
  }

  function swipe(choice: "left" | "right") {
    if (!participant || !active || direction) return;

    setDirection(choice);
    window.setTimeout(() => {
      const nextSurvivors = choice === "right" ? [...survivors, active] : survivors;
      const nextEliminated = choice === "left" ? [active, ...eliminated] : eliminated;
      const lastCard = index === roundTeams.length - 1;

      if (lastCard) {
        finishPick(nextSurvivors, nextEliminated);
      } else {
        setSurvivors(nextSurvivors);
        setEliminated(nextEliminated);
        setIndex((current) => current + 1);
      }

      setDirection(null);
    }, 250);
  }

  const SWIPE_THRESHOLD = 110;

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    if (!participant || !active || direction) return;
    if (event.target instanceof Element && event.target.closest("button, a")) {
      return;
    }

    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    dragStartRef.current = event.clientX;
    setDragX(0);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (dragStartRef.current === null || direction) return;
    setDragX(event.clientX - dragStartRef.current);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLElement>) {
    if (dragStartRef.current === null) return;
    const target = event.currentTarget;
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    const finalX = dragX;
    dragStartRef.current = null;
    setDragX(0);
    if (Math.abs(finalX) > SWIPE_THRESHOLD) {
      swipe(finalX > 0 ? "right" : "left");
    }
  }

  function reset(nextTeams = allTeams) {
    setAllTeams(nextTeams);
    setRound(1);
    setRoundTeams(nextTeams);
    setIndex(0);
    setSurvivors([]);
    setEliminated([]);
    setWinner(null);
    setDirection(null);
    setPickStatus("idle");
  }

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginStatus("saving");
    setLoginError(null);

    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName })
      });
      const data = await safeJson<{
        participant?: Participant;
        error?: string;
      }>(response);

      if (!response.ok || !data?.participant) {
        throw new Error(data?.error ?? "Could not create account");
      }

      setParticipant(data.participant);
      setFullName("");
      window.localStorage.setItem("nozomio_participant", JSON.stringify(data.participant));
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Could not create account");
    } finally {
      setLoginStatus("idle");
    }
  }

  function logout() {
    setParticipant(null);
    window.localStorage.removeItem("nozomio_participant");
  }

  if (!hydrated) {
    return <main className="shell" />;
  }

  if (!participant) {
    return (
      <main className="shell login-only-shell">
        <section className="login-gate-brand">
          <div className="brand-mark" aria-label="nozomio">
            <img src="/nozomio-logo.png" alt="" />
            <span>nozomio</span>
          </div>
        </section>
        <section
          aria-labelledby="login-title"
          aria-modal="true"
          className="login-panel login-modal"
          role="dialog"
        >
          <div>
            <p className="eyebrow">Create account</p>
            <h2 id="login-title">Enter your full name to pick the winner.</h2>
            <p className="login-copy">
              Your pick is saved to the winner dashboard after the final swipe.
            </p>
          </div>
          <form onSubmit={login}>
            <input
              autoFocus
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full name"
              minLength={2}
              required
            />
            <button className="primary-action" disabled={loginStatus === "saving"}>
              {loginStatus === "saving" ? "Saving..." : "Start picking"}
            </button>
          </form>
          {loginError && <p className="form-error">{loginError}</p>}
        </section>
      </main>
    );
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
        <div className="topbar-actions">
          {participant ? (
            <div className="participant-chip">
              <span>{participant.fullName}</span>
              <button onClick={logout} aria-label="Log out">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <span className="signin-hint">Sign in to pick</span>
          )}
          <a className="bankroll" href="/betting-dashboard">
            <Trophy size={18} />
            <span>Betting Dashboard</span>
          </a>
          <a className="bankroll secondary" href="/agent-dashboard">
            <Award size={18} />
            <span>How it works</span>
          </a>
        </div>
      </section>

      <section className="workspace">
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
            <span>Credits</span>
            <strong>1k</strong>
          </div>
          <div className="metric">
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
              <small>{dataSource === "mongodb" ? "MongoDB data" : "Mock fallback data"}</small>
              {participant && <small>Picking as {participant.fullName}</small>}
            </div>
          </div>
        </aside>

        <section className="deck-area" aria-label="Team swipe deck">
          <div className="deck-meta" aria-label="Bracket progress">
            <span>Card {winner ? roundTeams.length : Math.min(index + 1, roundTeams.length)} of {roundTeams.length}</span>
            <strong>{participant ? "Drag or tap to pick" : "Sign in to unlock"}</strong>
          </div>
          <div className="deck">
            {winner ? (
              <WinnerCard
                participant={participant}
                pickStatus={pickStatus}
                team={winner}
                onReset={reset}
              />
            ) : (
              <>
                {next && <TeamCard team={next} isBehind />}
                {active && (
                  <TeamCard
                    team={active}
                    direction={direction}
                    dragX={dragStartRef.current !== null ? dragX : 0}
                    isDragging={dragStartRef.current !== null}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  />
                )}
              </>
            )}
          </div>

          <div className="actions" aria-label="Swipe actions">
            <button
              className="round-button pass"
              onClick={() => swipe("left")}
              aria-label="Pass on this team"
              disabled={Boolean(winner) || !participant}
            >
              <X size={30} />
            </button>
            <button
              className="round-button like"
              onClick={() => swipe("right")}
              aria-label="Advance this team"
              disabled={Boolean(winner) || !participant}
            >
              <Heart size={30} />
            </button>
          </div>
          {!participant && (
            <p className="deck-note">Create an account above to unlock swiping.</p>
          )}
        </section>

        <aside className="panel right-panel" aria-label="Advanced teams">
          <div className="panel-heading">
            <Sparkles size={18} />
            <h2>Portfolio</h2>
          </div>
          {survivors.length === 0 ? (
            <p className="muted">Swipe right on teams you believe can win. Your 1,000 credits lock on the final winner pick.</p>
          ) : (
            <div className="ticket-list">
              {survivors.map((team) => (
                <article className="ticket" key={team.id}>
                  <span style={{ backgroundColor: team.color }} />
                  <div>
                    <strong>{team.name}</strong>
                    <small>Potential finalist · {team.winScore}% win likelihood</small>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>
      </section>

    </main>
  );
}

function TeamCard({
  team,
  isBehind = false,
  direction = null,
  dragX = 0,
  isDragging = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel
}: {
  team: TeamProfile;
  isBehind?: boolean;
  direction?: "left" | "right" | null;
  dragX?: number;
  isDragging?: boolean;
  onPointerDown?: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerMove?: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel?: (e: React.PointerEvent<HTMLElement>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const tags = inferTags(team);
  const metrics = [
    { id: "comp", label: "Competitiveness", value: team.likelihood.field },
    { id: "judge", label: "Judge Likelihood", value: team.likelihood.judge },
    { id: "market", label: "Marketability", value: team.likelihood.market }
  ];
  const dragStyle: React.CSSProperties = isDragging
    ? {
        transform: `translateX(${dragX}px) rotate(${dragX / 24}deg)`,
        transition: "none",
        cursor: "grabbing"
      }
    : {};

  return (
    <article
      className={[
        "bet-card",
        expanded ? "is-expanded" : "",
        isBehind ? "is-behind" : "",
        direction ? `swipe-${direction}` : "",
        onPointerDown ? "is-draggable" : ""
      ].join(" ")}
      style={{ "--accent": team.color, ...dragStyle } as React.CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div className="photo-wrap">
        <img src={team.image} alt={`${team.name} team`} />
        {!isBehind && (
          <>
            <div className="swipe-cue swipe-cue-pass" style={{ opacity: dragX < -20 ? Math.min(Math.abs(dragX) / 120, 1) : 0 }}>
              Pass
            </div>
            <div className="swipe-cue swipe-cue-like" style={{ opacity: dragX > 20 ? Math.min(dragX / 120, 1) : 0 }}>
              Advance
            </div>
          </>
        )}
        <div className="odds-pill">
          <strong>{team.winScore}%</strong>
          <span>Win</span>
        </div>
      </div>
      <div className="card-body">
        <div className="identity compact">
          <h2>{team.name}</h2>
          <p>{team.work}</p>
        </div>

        <div className="ring-row" aria-label={`${team.name} AI score breakdown`}>
          {metrics.map((metric) => (
            <ScoreRing
              id={`${team.id}-${metric.id}`}
              key={metric.id}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </div>

        {!isBehind && (
          <button className="detail-toggle" onClick={() => setExpanded((current) => !current)}>
            {expanded ? (
              <>
                <X size={15} />
                Back
              </>
            ) : (
              "View details"
            )}
          </button>
        )}

        {expanded && !isBehind && (
          <div className="expanded-details">
            <div className="judge-fit-pill">
              <BadgeCheck size={16} />
              {team.likelihood.judge}% judge fit
            </div>

            <section className="detail-block">
              <div className="detail-title">
                <Brain size={16} />
                <span>What they work on</span>
              </div>
              <p>{team.work}</p>
            </section>

            <div className="tag-row">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="proof-grid">
              <div className="proof-card">
                <Coins size={16} />
                <strong>{Math.round(team.winScore * 11.7)}</strong>
                <span>credits backing</span>
              </div>
              <div className="proof-card">
                <TrendingUp size={16} />
                <strong>Top {rankBand(team.winScore)}</strong>
                <span>field signal</span>
              </div>
            </div>

            <div className="nia-insight">
              <Sparkles size={16} />
              <p>
                Nia signal: strongest path is judge alignment plus a market story that can
                scale beyond demo day.
              </p>
            </div>

            <div className="team-list">
              <div className="team-title">
                <Users size={16} />
                <strong>Who's behind it</strong>
              </div>
              {team.team.map((member) => (
                <a href={member.linkedin} key={member.name} target="_blank" rel="noreferrer">
                  <span>{member.name}</span>
                  <small>{member.role}</small>
                  <ArrowRight size={14} />
                </a>
              ))}
            </div>

            <div className="likelihood-panel">
              <div className="likelihood-head">
                <span>Likelihood of winning</span>
                <strong>{team.winScore}%</strong>
              </div>
              <ScoreBar
                icon={<BarChart3 size={15} />}
                label="Compared with other teams"
                reason={team.likelihoodReasons?.field}
                value={team.likelihood.field}
              />
              <ScoreBar
                icon={<Scale size={15} />}
                label="Aligned with judge needs"
                reason={team.likelihoodReasons?.judge}
                value={team.likelihood.judge}
              />
              <ScoreBar
                icon={<Store size={15} />}
                label="Real-world marketability"
                reason={team.likelihoodReasons?.market}
                value={team.likelihood.market}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function ScoreRing({ id, label, value }: { id: string; label: string; value: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * value) / 100;
  const gradientId = `ring-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  return (
    <div className="score-ring">
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="52%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <circle className="ring-track" cx="40" cy="40" r={radius} />
        <circle
          className="ring-fill"
          cx="40"
          cy="40"
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <strong>{value}%</strong>
      <span>{label}</span>
    </div>
  );
}

function ScoreBar({
  icon,
  label,
  reason,
  value
}: {
  icon: React.ReactNode;
  label: string;
  reason?: string;
  value: number;
}) {
  return (
    <div className="score-row">
      <div className="score-copy">
        <div className="score-label">
          {icon}
          <span>{label}</span>
        </div>
        <p>{reason || fallbackReason(label, value)}</p>
      </div>
      <div className="score-track" aria-label={`${label}: ${value}%`}>
        <span style={{ width: `${value}%` }} />
      </div>
      <strong>{value}%</strong>
    </div>
  );
}

function fallbackReason(label: string, value: number) {
  const band =
    value >= 85 ? "strong" : value >= 70 ? "solid" : value >= 55 ? "emerging" : "early";

  if (label.includes("other teams")) {
    return `A ${band} relative score based on pitch clarity, traction signals, and field comparison.`;
  }
  if (label.includes("judge")) {
    return `A ${band} judge-fit score based on alignment with stated judging priorities.`;
  }
  return `A ${band} market score based on demand, scale, differentiation, and deployment risk.`;
}

function WinnerCard({
  participant,
  pickStatus,
  team,
  onReset
}: {
  participant: Participant | null;
  pickStatus: PickStatus;
  team: TeamProfile;
  onReset: () => void;
}) {
  return (
    <article className="empty-state winner-card" style={{ "--accent": team.color } as React.CSSProperties}>
      <Crown size={42} />
      <p className="eyebrow">Winner pick</p>
      <h2>{team.name}</h2>
      <p>{team.work}</p>
      <div className="winner-score">
        <Star size={18} />
        {team.winScore}% projected win likelihood
      </div>
      <div className="payout-card">
        <Coins size={18} />
        <div>
          <strong>1,000 credits locked</strong>
          <span>Voting complete. Pick saved as your winner bet.</span>
        </div>
      </div>
      {participant && (
        <p className={`pick-status pick-${pickStatus}`}>
          {pickStatus === "saving" && `Saving ${participant.fullName}'s pick...`}
          {pickStatus === "saved" && `${participant.fullName}'s pick is saved.`}
          {pickStatus === "error" && "Could not save this pick. Try again in a moment."}
          {pickStatus === "idle" && "Preparing to save pick..."}
        </p>
      )}
      <button className="primary-action" onClick={onReset}>
        <RotateCcw size={18} />
        Run bracket again
      </button>
      <a className="primary-action secondary-link" href="/betting-dashboard">
        <Trophy size={18} />
        View betting dashboard
      </a>
    </article>
  );
}

function inferTags(team: TeamProfile) {
  const text = `${team.name} ${team.work}`.toLowerCase();
  const tags = [
    text.includes("agent") || text.includes("assistant") ? "AI agents" : "AI product",
    text.includes("market") || text.includes("store") || text.includes("cart") ? "Commerce" : "Workflow",
    team.likelihood.market >= 85 ? "High-market" : "Demo-ready"
  ];

  return Array.from(new Set(tags));
}

function rankBand(score: number) {
  if (score >= 86) return "10%";
  if (score >= 78) return "25%";
  return "50%";
}

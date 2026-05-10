"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Crown,
  Heart,
  RotateCcw,
  Scale,
  Sparkles,
  Star,
  Store,
  Trophy,
  Users,
  X
} from "lucide-react";

import { fallbackTeams, type TeamProfile } from "@/lib/teams";

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

  const active = roundTeams[index];
  const next = roundTeams[index + 1];
  const totalRemaining = winner ? 1 : roundTeams.length - index;
  const leader = useMemo(
    () => [...roundTeams].sort((a, b) => b.winScore - a.winScore)[0],
    [roundTeams]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadTeams() {
      try {
        const response = await fetch("/api/teams", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Could not load teams");
        }

        const data = (await response.json()) as {
          teams?: TeamProfile[];
          source?: "fallback" | "mongodb";
        };

        if (!cancelled && data.teams?.length) {
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
    if (!active || direction) return;

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

  function reset(nextTeams = allTeams) {
    setAllTeams(nextTeams);
    setRound(1);
    setRoundTeams(nextTeams);
    setIndex(0);
    setSurvivors([]);
    setEliminated([]);
    setWinner(null);
    setDirection(null);
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
        <button className="bankroll" onClick={() => reset()}>
          <RotateCcw size={18} />
          <span>Reset bracket</span>
        </button>
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
            </div>
          </div>
        </aside>

        <section className="deck-area" aria-label="Team swipe deck">
          <div className="deck">
            {winner ? (
              <WinnerCard team={winner} onReset={reset} />
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
              disabled={Boolean(winner)}
            >
              <X size={30} />
            </button>
            <button
              className="round-button like"
              onClick={() => swipe("right")}
              aria-label="Advance this team"
              disabled={Boolean(winner)}
            >
              <Heart size={30} />
            </button>
          </div>
        </section>

        <aside className="panel right-panel" aria-label="Advanced teams">
          <div className="panel-heading">
            <Sparkles size={18} />
            <h2>Next round</h2>
          </div>
          {survivors.length === 0 ? (
            <p className="muted">Swipe right on teams you believe can win. Survivors collect here.</p>
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
        </aside>
      </section>
    </main>
  );
}

function TeamCard({
  team,
  isBehind = false,
  direction = null
}: {
  team: TeamProfile;
  isBehind?: boolean;
  direction?: "left" | "right" | null;
}) {
  return (
    <article
      className={[
        "bet-card",
        isBehind ? "is-behind" : "",
        direction ? `swipe-${direction}` : ""
      ].join(" ")}
      style={{ "--accent": team.color } as React.CSSProperties}
    >
      <div className="photo-wrap">
        <img src={team.image} alt={`${team.name} team`} />
        <div className="odds-pill">{team.winScore}%</div>
      </div>
      <div className="card-body">
        <div className="identity">
          <div>
            <h2>{team.name}</h2>
            <p>Hackathon team</p>
          </div>
          <span>{team.winScore}%</span>
        </div>

        <div className="profile-section">
          <span>What they work on</span>
          <p>{team.work}</p>
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
            value={team.likelihood.field}
          />
          <ScoreBar
            icon={<Scale size={15} />}
            label="Aligned with judge needs"
            value={team.likelihood.judge}
          />
          <ScoreBar
            icon={<Store size={15} />}
            label="Real-world marketability"
            value={team.likelihood.market}
          />
        </div>
      </div>
    </article>
  );
}

function ScoreBar({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="score-row">
      <div className="score-label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="score-track" aria-label={`${label}: ${value}%`}>
        <span style={{ width: `${value}%` }} />
      </div>
      <strong>{value}%</strong>
    </div>
  );
}

function WinnerCard({ team, onReset }: { team: TeamProfile; onReset: () => void }) {
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
      <button className="primary-action" onClick={onReset}>
        <RotateCcw size={18} />
        Run bracket again
      </button>
    </article>
  );
}

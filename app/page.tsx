"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Crown,
  Heart,
  LogOut,
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
  const [fullName, setFullName] = useState("");
  const [loginStatus, setLoginStatus] = useState<"idle" | "saving">("idle");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pickStatus, setPickStatus] = useState<PickStatus>("idle");

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
      const data = (await response.json()) as {
        participant?: Participant;
        error?: string;
      };

      if (!response.ok || !data.participant) {
        throw new Error(data.error ?? "Could not create account");
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
          <button className="bankroll" onClick={() => reset()}>
            <RotateCcw size={18} />
            <span>Reset bracket</span>
          </button>
        </div>
      </section>

      {!participant && (
        <section className="login-panel" aria-label="Create account">
          <div>
            <p className="eyebrow">Create account</p>
            <h2>Enter your full name to pick the winner.</h2>
          </div>
          <form onSubmit={login}>
            <input
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
      )}

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
              {participant && <small>Picking as {participant.fullName}</small>}
            </div>
          </div>
        </aside>

        <section className="deck-area" aria-label="Team swipe deck">
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
                {active && <TeamCard team={active} direction={direction} />}
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
    </article>
  );
}

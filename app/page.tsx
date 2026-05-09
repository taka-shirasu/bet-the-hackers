"use client";

import { useMemo, useState } from "react";
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
  X
} from "lucide-react";

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
  strengths: string[];
  team: Teammate[];
  color: string;
};

const teams: TeamProfile[] = [
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
    strengths: ["Live data", "Sharp demo", "Revenue story"],
    team: [
      { name: "Maya Chen", role: "ML systems", linkedin: "https://linkedin.com" },
      { name: "Jon Bell", role: "Product design", linkedin: "https://linkedin.com" },
      { name: "Ari Okafor", role: "Backend", linkedin: "https://linkedin.com" }
    ],
    color: "#ff4458"
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
    strengths: ["Security", "GitHub-native", "Trust"],
    team: [
      { name: "Nico Ramos", role: "Full-stack", linkedin: "https://linkedin.com" },
      { name: "Priya Shah", role: "Security", linkedin: "https://linkedin.com" },
      { name: "Leo Martins", role: "Growth", linkedin: "https://linkedin.com" }
    ],
    color: "#12b886"
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
    strengths: ["Collaboration", "Workflow", "Integrations"],
    team: [
      { name: "Cam Lee", role: "Voice AI", linkedin: "https://linkedin.com" },
      { name: "Sam Rivera", role: "Frontend", linkedin: "https://linkedin.com" },
      { name: "Inez Ford", role: "PM", linkedin: "https://linkedin.com" }
    ],
    color: "#228be6"
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
    strengths: ["Commerce", "Clear ROI", "Polished UX"],
    team: [
      { name: "Elena Park", role: "Commerce", linkedin: "https://linkedin.com" },
      { name: "Drew Kim", role: "Data", linkedin: "https://linkedin.com" },
      { name: "Omar Diaz", role: "Design", linkedin: "https://linkedin.com" }
    ],
    color: "#f59f00"
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
    strengths: ["Impact", "Compliance", "B2B"],
    team: [
      { name: "Talia Moss", role: "Ops", linkedin: "https://linkedin.com" },
      { name: "Ben Yu", role: "Data", linkedin: "https://linkedin.com" },
      { name: "Noor Ali", role: "Frontend", linkedin: "https://linkedin.com" }
    ],
    color: "#7c3aed"
  }
];

export default function Home() {
  const [round, setRound] = useState(1);
  const [roundTeams, setRoundTeams] = useState<TeamProfile[]>(teams);
  const [index, setIndex] = useState(0);
  const [survivors, setSurvivors] = useState<TeamProfile[]>([]);
  const [eliminated, setEliminated] = useState<TeamProfile[]>([]);
  const [winner, setWinner] = useState<TeamProfile | null>(null);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const active = roundTeams[index];
  const next = roundTeams[index + 1];
  const totalRemaining = winner ? 1 : roundTeams.length - index;
  const leader = useMemo(
    () => [...roundTeams].sort((a, b) => b.winScore - a.winScore)[0],
    [roundTeams]
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

  function reset() {
    setRound(1);
    setRoundTeams(teams);
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
        <button className="bankroll" onClick={reset}>
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

        <div className="proof-row">
          <div>
            <span>Likelihood vs field</span>
            <strong>{team.winScore}% based on demo clarity, market pull, and execution risk.</strong>
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
    </article>
  );
}

function WinnerCard({ team, onReset }: { team: TeamProfile; onReset: () => void }) {
  return (
    <article className="empty-state winner-card" style={{ "--accent": team.color } as React.CSSProperties}>
      <Crown size={42} />
      <p className="eyebrow">Winner pick</p>
      <h2>{team.name}</h2>
      <p>{team.tagline}</p>
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

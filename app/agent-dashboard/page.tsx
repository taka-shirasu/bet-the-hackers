"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BadgeCheck,
  Brain,
  CheckCircle2,
  ClipboardList,
  Database,
  FileSearch,
  Globe,
  Network,
  Play,
  Search,
  Sparkles,
  Target,
  Users
} from "lucide-react";

import type {
  AgentStepResult,
  EvidenceRecord,
  IntegrationStatus,
  TeamScore
} from "@/lib/agents/types";
import { safeJson } from "@/lib/http";

type DashboardData = {
  counts: { submissions: number; judges: number; scores: number; evidence: number };
  integrations: IntegrationStatus[];
  scores: TeamScore[];
  evidence: EvidenceRecord[];
};

type GraphNode = {
  id: string;
  title: string;
  eyebrow: string;
  detail: string;
  lane: "data" | "tool" | "memory" | "agent" | "output";
  icon: React.ReactNode;
  x: number;
  y: number;
};

const edges = [
  ["teams", "mongodb"],
  ["judges", "mongodb"],
  ["market", "mongodb"],
  ["teams", "apify"],
  ["judges", "apify"],
  ["market", "apify"],
  ["judges", "nia"],
  ["market", "nia"],
  ["apify", "hyperspell"],
  ["nia", "hyperspell"],
  ["mongodb", "hyperspell"],
  ["hyperspell", "teamAgent"],
  ["hyperspell", "judgeAgent"],
  ["hyperspell", "marketAgent"],
  ["teamAgent", "ranker"],
  ["judgeAgent", "ranker"],
  ["marketAgent", "ranker"],
  ["ranker", "scores"],
  ["scores", "swipe"]
] as const;

export default function AgentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/agent-dashboard", { cache: "no-store" });
      const json = await safeJson<DashboardData>(r);
      if (!json) throw new Error("Agent dashboard returned no data");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 8000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const nodes = useMemo<GraphNode[]>(
    () => [
      {
        id: "teams",
        title: "Team data",
        eyebrow: "pillar 01",
        detail: "submission, pitch, industry, members, LinkedIn URLs",
        lane: "data",
        icon: <Users size={18} />,
        x: 9,
        y: 14
      },
      {
        id: "judges",
        title: "Judge data",
        eyebrow: "pillar 02",
        detail: "judge bios, interests, criteria, preference signals",
        lane: "data",
        icon: <BadgeCheck size={18} />,
        x: 9,
        y: 42
      },
      {
        id: "market",
        title: "Marketability data",
        eyebrow: "pillar 03",
        detail: "competitors, buyers, category demand, scale risk",
        lane: "data",
        icon: <Globe size={18} />,
        x: 9,
        y: 70
      },
      {
        id: "mongodb",
        title: "MongoDB / Prisma",
        eyebrow: "app database",
        detail: `${data?.counts.submissions ?? 0} submissions, ${data?.counts.judges ?? 0} judges, ${data?.counts.scores ?? 0} scores`,
        lane: "output",
        icon: <Database size={18} />,
        x: 25,
        y: 26
      },
      {
        id: "apify",
        title: "Apify",
        eyebrow: "scraper",
        detail: "scrapes LinkedIn-style profiles, judge pages, competitor pages",
        lane: "tool",
        icon: <FileSearch size={18} />,
        x: 25,
        y: 60
      },
      {
        id: "nia",
        title: "Nia",
        eyebrow: "research",
        detail: "deep research over judges, markets, competitors, optional GitHub",
        lane: "tool",
        icon: <Search size={18} />,
        x: 42,
        y: 60
      },
      {
        id: "hyperspell",
        title: "Hyperspell",
        eyebrow: "memory",
        detail: `${data?.counts.evidence ?? 0} evidence memories for agents to read`,
        lane: "memory",
        icon: <Network size={18} />,
        x: 42,
        y: 26
      },
      {
        id: "teamAgent",
        title: "Competitiveness agent",
        eyebrow: "score",
        detail: "compares teams against the participant field",
        lane: "agent",
        icon: <Users size={18} />,
        x: 60,
        y: 14
      },
      {
        id: "judgeAgent",
        title: "Judge-fit agent",
        eyebrow: "score",
        detail: "predicts which teams judges are likely to favor",
        lane: "agent",
        icon: <Target size={18} />,
        x: 60,
        y: 42
      },
      {
        id: "marketAgent",
        title: "Marketability agent",
        eyebrow: "score",
        detail: "scores demand, scale, differentiation, and risk",
        lane: "agent",
        icon: <Globe size={18} />,
        x: 60,
        y: 70
      },
      {
        id: "ranker",
        title: "Final ranker",
        eyebrow: "orchestrator",
        detail: "combines three scores into one overall likelihood",
        lane: "agent",
        icon: <Brain size={18} />,
        x: 76,
        y: 42
      },
      {
        id: "scores",
        title: "Cached team cards",
        eyebrow: "MongoDB",
        detail: "overall, field, judge, market scores + reasons",
        lane: "output",
        icon: <ClipboardList size={18} />,
        x: 90,
        y: 30
      },
      {
        id: "swipe",
        title: "Swipe UI",
        eyebrow: "product",
        detail: "fast reads only; no live research on swipe",
        lane: "output",
        icon: <Sparkles size={18} />,
        x: 90,
        y: 62
      }
    ],
    [data]
  );

  async function runScoreAll() {
    setScoring(true);
    setError(null);
    try {
      const r = await fetch("/api/score/all", { method: "POST" });
      if (!r.ok) {
        const e = await safeJson<{ error?: string }>(r);
        throw new Error(e?.error ?? "Scoring failed");
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scoring failed");
    } finally {
      setScoring(false);
    }
  }

  const safeData: DashboardData = data ?? {
    counts: { submissions: 0, judges: 0, scores: 0, evidence: 0 },
    integrations: [
      { name: "apify", configured: false, mode: "stub", envVar: "APIFY_TOKEN" },
      { name: "nia", configured: false, mode: "stub", envVar: "NIA_API_KEY" },
      { name: "hyperspell", configured: false, mode: "stub", envVar: "HYPERSPELL_API_KEY" },
      { name: "openai", configured: false, mode: "stub", envVar: "OPENAI_API_KEY" }
    ],
    scores: [],
    evidence: []
  };
  const dataReady = data !== null;

  return (
    <main className="shell">
      <section className="agent-shell">
        <header className="agent-hero">
          <div>
            <div className="brand-mark" aria-label="nozomio">
              <img src="/nozomio-logo.png" alt="" />
              <span>nozomio</span>
            </div>
            <p className="eyebrow">Agent knowledge graph</p>
            <h1>How evidence becomes a winner prediction.</h1>
          </div>
          {process.env.NODE_ENV !== "production" && (
            <button className="primary-action" onClick={runScoreAll} disabled={scoring}>
              <Play size={18} />
              {scoring ? "Scoring..." : "Score all teams"}
            </button>
          )}
        </header>

        {error && <p className="form-error">{error}</p>}

        <section className="agent-map" aria-label="Agent knowledge graph">
          <GraphCanvas nodes={nodes} />
        </section>

        <section className="agent-legend" aria-label="Integration status">
          <IntegrationTile i={find(safeData.integrations, "apify")} label="Apify scrapes LinkedIn/profile and market pages." />
          <IntegrationTile i={find(safeData.integrations, "nia")} label="Nia researches judges, markets, competitors, and optional repos." />
          <IntegrationTile i={find(safeData.integrations, "hyperspell")} label="Hyperspell stores the evidence agents read and write." />
          <IntegrationTile i={find(safeData.integrations, "openai")} label="OpenAI turns evidence into structured scoring outputs." />
        </section>

        <section className="agent-grid">
          <article className="agent-panel">
            <h2>Data pillars</h2>
            <PillarLine icon={<Users size={18} />} title="Team" detail="Raw submission, pitch, industry, members, public links." />
            <PillarLine icon={<BadgeCheck size={18} />} title="Judge" detail="Judge bios, interests, criteria, rubric, decision patterns." />
            <PillarLine icon={<Globe size={18} />} title="Market" detail="Competitors, buyer pain, market size, scale potential." />
          </article>

          <article className="agent-panel">
            <h2>Scoring outputs</h2>
            <PillarLine icon={<Sparkles size={18} />} title="Overall" detail="0-100 projected likelihood of winning." />
            <PillarLine icon={<Users size={18} />} title="Competitiveness" detail="Why this team can beat the other participants." />
            <PillarLine icon={<Target size={18} />} title="Judge fit" detail="Which judges are likely to pick it and why." />
            <PillarLine icon={<Globe size={18} />} title="Marketability" detail="Whether the idea can become a real scalable product." />
          </article>
        </section>

        <section className="agent-grid">
          <article className="agent-panel">
            <h2>Latest scores</h2>
            {!dataReady ? (
              <p className="muted">Loading…</p>
            ) : safeData.scores.length === 0 ? (
              <p className="muted">No scored teams yet.</p>
            ) : (
              <div className="mini-score-list">
                {safeData.scores.slice(0, 5).map((score) => (
                  <div className="mini-score" key={score.teamId}>
                    <strong>{score.teamName}</strong>
                    <span>{score.overall}/100</span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="agent-panel">
            <h2>Recent evidence</h2>
            {!dataReady ? (
              <p className="muted">Loading…</p>
            ) : safeData.evidence.length === 0 ? (
              <p className="muted">No evidence stored yet. Run scoring after submissions arrive.</p>
            ) : (
              <div className="mini-evidence-list">
                {safeData.evidence.slice(0, 4).map((e, index) => (
                  <div className="mini-evidence" key={`${e.namespace}-${index}`}>
                    <strong>{e.namespace}</strong>
                    <span>{e.source}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

      </section>
    </main>
  );
}

function GraphCanvas({ nodes }: { nodes: GraphNode[] }) {
  const byId = new Map(nodes.map((node) => [node.id, node]));

  return (
    <div className="graph-canvas">
      <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <marker id="arrowhead" markerHeight="5" markerWidth="5" orient="auto" refX="4" refY="2.5">
            <path d="M0,0 L5,2.5 L0,5 Z" />
          </marker>
        </defs>
        {edges.map(([from, to]) => {
          const a = byId.get(from);
          const b = byId.get(to);
          if (!a || !b) return null;
          return (
            <path
              d={curve(a.x, a.y, b.x, b.y)}
              key={`${from}-${to}`}
              markerEnd="url(#arrowhead)"
            />
          );
        })}
      </svg>

      {nodes.map((node) => (
        <article
          className={`graph-node graph-${node.lane}`}
          key={node.id}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <div className="graph-node-head">
            {node.icon}
            <span>{node.eyebrow}</span>
          </div>
          <strong>{node.title}</strong>
          <p>{node.detail}</p>
        </article>
      ))}
    </div>
  );
}

function curve(x1: number, y1: number, x2: number, y2: number) {
  const mid = Math.max(8, Math.abs(x2 - x1) * 0.45);
  return `M ${x1} ${y1} C ${x1 + mid} ${y1}, ${x2 - mid} ${y2}, ${x2} ${y2}`;
}

function find(list: IntegrationStatus[], name: IntegrationStatus["name"]) {
  return list.find((i) => i.name === name) ?? {
    name,
    configured: false,
    mode: "stub",
    envVar: `${name.toUpperCase()}_API_KEY`
  };
}

function IntegrationTile({ i, label }: { i: IntegrationStatus; label: string }) {
  return (
    <article className={`integration-tile integration-${i.mode}`}>
      <div>
        {i.mode === "live" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        <strong>{displayName(i.name)}</strong>
      </div>
      <p>{label}</p>
      <span>{i.mode === "live" ? "Live" : `Set ${i.envVar}`}</span>
    </article>
  );
}

function PillarLine({
  icon,
  title,
  detail
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="pillar-line">
      {icon}
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
}

function displayName(name: IntegrationStatus["name"]) {
  if (name === "nia") return "Nia";
  if (name === "apify") return "Apify";
  if (name === "hyperspell") return "Hyperspell";
  return "OpenAI";
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  Brain,
  CheckCircle2,
  Database,
  Globe,
  Network,
  Play,
  Sparkles,
  Users
} from "lucide-react";

import type {
  AgentStepResult,
  EvidenceRecord,
  IntegrationStatus,
  TeamScore
} from "@/lib/agents/types";

type DashboardData = {
  counts: { submissions: number; judges: number; scores: number; evidence: number };
  integrations: IntegrationStatus[];
  scores: TeamScore[];
  evidence: EvidenceRecord[];
};

export default function AgentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/agent-dashboard", { cache: "no-store" });
      const json = (await r.json()) as DashboardData;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
  }, [refresh]);

  async function runScoreAll() {
    setScoring(true);
    setError(null);
    try {
      const r = await fetch("/api/score/all", { method: "POST" });
      if (!r.ok) {
        const e = (await r.json()) as { error?: string };
        throw new Error(e.error ?? "Scoring failed");
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scoring failed");
    } finally {
      setScoring(false);
    }
  }

  if (!data) {
    return (
      <main className="shell">
        <p className="muted">Loading agent dashboard...</p>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="dash-shell">
        <header className="form-header">
          <p className="eyebrow">Agent dashboard</p>
          <h1>Knowledge graph, live.</h1>
          <p className="muted">
            Three data pillars feed a memory layer. Four agents score every team.
            Final scores cache in MongoDB for the swipe deck.
          </p>
        </header>

        <div className="dash-actions">
          <button
            className="primary-action"
            onClick={runScoreAll}
            disabled={scoring}
          >
            <Play size={18} />
            {scoring ? "Scoring all teams..." : "Score all teams"}
          </button>
          <span className="muted">Auto-refreshes every 8s</span>
        </div>

        {error && <p className="form-error">{error}</p>}

        <h2 className="dash-h2">Data pillars</h2>
        <div className="pillar-grid">
          <PillarCard icon={<Database size={20} />} label="MongoDB" tone="store">
            <PillarStat label="Submissions" value={data.counts.submissions} />
            <PillarStat label="Judges" value={data.counts.judges} />
            <PillarStat label="Cached scores" value={data.counts.scores} />
          </PillarCard>
          <PillarCard
            icon={<Users size={20} />}
            label="Apify · LinkedIn"
            tone="ingest"
          >
            <IntegrationBadge i={find(data.integrations, "apify")} />
          </PillarCard>
          <PillarCard
            icon={<Globe size={20} />}
            label="Nia · Oracle research"
            tone="ingest"
          >
            <IntegrationBadge i={find(data.integrations, "nia")} />
          </PillarCard>
          <PillarCard
            icon={<Network size={20} />}
            label="Hyperspell · Memory"
            tone="memory"
          >
            <IntegrationBadge i={find(data.integrations, "hyperspell")} />
            <PillarStat label="Evidence records" value={data.counts.evidence} />
          </PillarCard>
          <PillarCard
            icon={<Brain size={20} />}
            label="OpenAI · Orchestration"
            tone="agent"
          >
            <IntegrationBadge i={find(data.integrations, "openai")} />
          </PillarCard>
        </div>

        <h2 className="dash-h2">Knowledge flow</h2>
        <div className="flow">
          <FlowNode tone="store" label="MongoDB" detail="raw" />
          <FlowArrow />
          <FlowNode tone="ingest" label="Apify + Nia" detail="enrich" />
          <FlowArrow />
          <FlowNode tone="memory" label="Hyperspell" detail="evidence" />
          <FlowArrow />
          <FlowNode tone="agent" label="Agents" detail="score" />
          <FlowArrow />
          <FlowNode tone="store" label="MongoDB" detail="scores" />
        </div>

        <h2 className="dash-h2">Latest scores</h2>
        {data.scores.length === 0 ? (
          <p className="muted">
            No scores yet — collect at least one submission and click
            "Score all teams".
          </p>
        ) : (
          <div className="score-grid">
            {data.scores.map((s) => (
              <ScoreCard key={s.teamId} score={s} />
            ))}
          </div>
        )}

        <h2 className="dash-h2">Recent evidence</h2>
        {data.evidence.length === 0 ? (
          <p className="muted">
            No evidence stored yet. Scoring populates the memory layer.
          </p>
        ) : (
          <div className="evidence-list">
            {data.evidence.map((e, i) => (
              <article key={i} className="evidence-row">
                <header>
                  <strong>{e.namespace}</strong>
                  <span className="evidence-source">{e.source}</span>
                  <small>{new Date(e.storedAt).toLocaleString()}</small>
                </header>
                <pre>{e.content.slice(0, 300)}{e.content.length > 300 ? "..." : ""}</pre>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function find(list: IntegrationStatus[], name: IntegrationStatus["name"]) {
  return list.find((i) => i.name === name)!;
}

function PillarCard({
  icon,
  label,
  tone,
  children
}: {
  icon: React.ReactNode;
  label: string;
  tone: "store" | "ingest" | "memory" | "agent";
  children: React.ReactNode;
}) {
  return (
    <article className={`pillar-card pillar-${tone}`}>
      <header>
        {icon}
        <strong>{label}</strong>
      </header>
      <div className="pillar-body">{children}</div>
    </article>
  );
}

function PillarStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="pillar-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function IntegrationBadge({ i }: { i: IntegrationStatus }) {
  return (
    <div className={`int-badge int-${i.mode}`}>
      {i.mode === "live" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
      <span>{i.mode === "live" ? "Live" : `Stub — set ${i.envVar}`}</span>
    </div>
  );
}

function FlowNode({
  label,
  detail,
  tone
}: {
  label: string;
  detail: string;
  tone: "store" | "ingest" | "memory" | "agent";
}) {
  return (
    <div className={`flow-node flow-${tone}`}>
      <strong>{label}</strong>
      <small>{detail}</small>
    </div>
  );
}

function FlowArrow() {
  return <span className="flow-arrow" aria-hidden>→</span>;
}

function ScoreCard({ score }: { score: TeamScore }) {
  return (
    <article className="score-card">
      {score.imageUrl && (
        <img className="score-card-image" src={score.imageUrl} alt={`${score.teamName} cover`} />
      )}
      <header>
        <h3>{score.teamName}</h3>
        <div className="score-overall">
          <Sparkles size={16} />
          <strong>{score.overall}</strong>
          <span>/100</span>
        </div>
      </header>
      <div className="score-bars">
        <ScoreBar label="Competitiveness" value={score.competitiveness} blurb={score.blurbs.competitiveness} />
        <ScoreBar label="Judge fit" value={score.judgeFit} blurb={score.blurbs.judgeFit} />
        <ScoreBar label="Marketability" value={score.marketability} blurb={score.blurbs.marketability} />
      </div>
      <div className="step-list">
        {score.steps.map((s) => (
          <StepRow key={s.agent} step={s} />
        ))}
      </div>
    </article>
  );
}

function ScoreBar({
  label,
  value,
  blurb
}: {
  label: string;
  value: number;
  blurb: string;
}) {
  return (
    <div className="score-bar">
      <div className="score-bar-head">
        <span>{label}</span>
        <strong>{value}/10</strong>
      </div>
      <div className="score-bar-track">
        <span style={{ width: `${value * 10}%` }} />
      </div>
      <p className="muted">{blurb}</p>
    </div>
  );
}

function StepRow({ step }: { step: AgentStepResult }) {
  const Icon =
    step.status === "ok" ? CheckCircle2 :
    step.status === "error" ? AlertCircle : Activity;
  return (
    <div className={`step-row step-${step.status}`}>
      <Icon size={14} />
      <span>{step.agent}</span>
      {step.durationMs !== undefined && <small>{step.durationMs}ms</small>}
      {step.message && <small className="step-msg">{step.message}</small>}
    </div>
  );
}

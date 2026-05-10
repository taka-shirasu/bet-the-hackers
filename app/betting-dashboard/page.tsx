"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Crown, Trophy, Users } from "lucide-react";

import { safeJson } from "@/lib/http";
import type { PickRecord, PicksPayload } from "@/lib/picks-server";

type BettingDashboardData = {
  counts: { picks: number; teamsPicked: number };
  picks: PicksPayload;
};

type StoredParticipant = { id: string; fullName: string };

export default function BettingDashboardPage() {
  const [data, setData] = useState<BettingDashboardData | null>(null);
  const [participant, setParticipant] = useState<StoredParticipant | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("nozomio_participant");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as StoredParticipant;
      if (parsed.id && parsed.fullName) {
        setParticipant(parsed);
      }
    } catch {
      window.localStorage.removeItem("nozomio_participant");
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/betting-dashboard", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load betting dashboard");
      const json = await safeJson<BettingDashboardData>(response);
      if (!json) throw new Error("Betting dashboard returned no data");
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load betting dashboard");
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 8000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const picks = data?.picks ?? { recent: [], leaderboard: [] };
  const myPick = participant
    ? picks?.recent.find((pick) => pick.participantId === participant.id)
    : undefined;

  return (
    <main className="shell">
      <section className="agent-shell">
        <header className="agent-hero betting-hero">
          <div>
            <div className="brand-mark" aria-label="nozomio">
              <img src="/nozomio-logo.png" alt="" />
              <span>nozomio</span>
            </div>
            <p className="eyebrow">Betting dashboard</p>
            <h1>Who picked who to win.</h1>
          </div>
          <a className="primary-action secondary-link" href="/">
            <ArrowLeft size={18} />
            Back to swiping
          </a>
        </header>

        {error && <p className="form-error">{error}</p>}

        {!data ? (
          <p className="muted">Loading betting dashboard...</p>
        ) : (
          <>
            <section className="betting-summary">
              <SummaryTile icon={<Crown size={18} />} label="Total picks" value={data.counts.picks} />
              <SummaryTile icon={<Trophy size={18} />} label="Teams picked" value={data.counts.teamsPicked} />
              <SummaryTile
                icon={<Users size={18} />}
                label="Your account"
                value={participant?.fullName ?? "Not signed in"}
              />
            </section>

            <section className="agent-grid picks-grid">
              <article className="agent-panel pick-mine">
                <h2>Your winner pick</h2>
                {!participant ? (
                  <p className="muted">Create an account on the swipe page first. Your pick will show here after you finish a bracket.</p>
                ) : !myPick ? (
                  <p className="muted">You are signed in as {participant.fullName}, but you have not picked a winner yet.</p>
                ) : (
                  <PickCard pick={myPick} />
                )}
              </article>

              <article className="agent-panel pick-leaderboard">
                <header className="pick-header">
                  <h2>Who others picked</h2>
                  <span className="muted">{data.counts.picks} total</span>
                </header>
                {picks.leaderboard.length === 0 ? (
                  <p className="muted">No picks yet. Be the first to finish a bracket.</p>
                ) : (
                  <div className="leaderboard-list">
                    {picks.leaderboard.map((entry, idx) => (
                      <div className="leaderboard-row" key={entry.teamId}>
                        <span className="leaderboard-rank">#{idx + 1}</span>
                        <div className="leaderboard-body">
                          <div className="leaderboard-head">
                            <strong>{entry.teamName}</strong>
                            <span>{entry.votes} vote{entry.votes === 1 ? "" : "s"} · {Math.round(entry.share * 100)}%</span>
                          </div>
                          <div className="leaderboard-track">
                            <span style={{ width: `${Math.max(4, entry.share * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="agent-panel pick-feed">
                <h2>Recent picks</h2>
                {picks.recent.length === 0 ? (
                  <p className="muted">Participant picks appear here as they finish.</p>
                ) : (
                  <ul className="pick-feed-list">
                    {picks.recent.map((pick) => (
                      <li
                        className={pick.participantId === participant?.id ? "is-you" : ""}
                        key={pick.participantId}
                      >
                        <strong>{pick.fullName}{pick.participantId === participant?.id ? " (you)" : ""}</strong>
                        <span>→ {pick.winnerTeamName}</span>
                        <small className="muted">
                          {new Date(pick.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </small>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function PickCard({ pick }: { pick: PickRecord }) {
  return (
    <div className="my-pick-card">
      <p className="muted small">Picked by {pick.fullName}</p>
      <strong className="my-pick-team">{pick.winnerTeamName}</strong>
      <span className="my-pick-score">{pick.winnerScore}% projected win</span>
      <small className="muted">{new Date(pick.updatedAt).toLocaleString()}</small>
    </div>
  );
}

function SummaryTile({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <article className="summary-tile">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

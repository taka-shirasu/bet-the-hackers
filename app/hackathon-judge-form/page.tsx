"use client";

import { useState } from "react";
import { CheckCircle2, Plus, Send, Trash2 } from "lucide-react";

type JudgeRow = { name: string; company: string; linkedin: string };

const blankJudge = (): JudgeRow => ({ name: "", company: "", linkedin: "" });

export default function HackathonJudgeForm() {
  const [competitionRequirements, setCompetitionRequirements] = useState("");
  const [judges, setJudges] = useState<JudgeRow[]>([blankJudge()]);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  function updateJudge(idx: number, key: keyof JudgeRow, value: string) {
    setJudges((current) =>
      current.map((j, i) => (i === idx ? { ...j, [key]: value } : j))
    );
  }

  function addJudge() {
    setJudges((current) => [...current, blankJudge()]);
  }

  function removeJudge(idx: number) {
    setJudges((current) =>
      current.length === 1 ? current : current.filter((_, i) => i !== idx)
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("submitting");

    const cleanJudges = judges
      .map((j) => ({
        name: j.name.trim(),
        company: j.company.trim(),
        linkedin: j.linkedin.trim()
      }))
      .filter((j) => j.name || j.company || j.linkedin);

    try {
      const response = await fetch("/api/judges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionRequirements: competitionRequirements.trim(),
          judges: cleanJudges
        })
      });

      const data = (await response.json()) as {
        error?: string;
        ok?: boolean;
        count?: number;
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Submission failed");
      }
      setSavedCount(data.count ?? cleanJudges.length);
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  }

  function resetForm() {
    setCompetitionRequirements("");
    setJudges([blankJudge()]);
    setStatus("idle");
    setError(null);
    setSavedCount(0);
  }

  if (status === "done") {
    return (
      <main className="shell">
        <section className="form-shell">
          <article className="form-card success-card">
            <CheckCircle2 size={42} />
            <p className="eyebrow">Judges saved</p>
            <h2>{savedCount} judge{savedCount === 1 ? "" : "s"} on file.</h2>
            <p className="muted">
              We'll factor your competition requirements into team scoring.
            </p>
            <button className="primary-action" onClick={resetForm}>
              Add more judges
            </button>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="form-shell">
        <header className="form-header">
          <p className="eyebrow">Judge profiles</p>
          <h1>Set up the judging panel.</h1>
          <p className="muted">
            Describe what a winning team looks like, then add every judge on the panel.
          </p>
        </header>

        <form className="form-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>Competition requirements</span>
            <textarea
              value={competitionRequirements}
              onChange={(e) => setCompetitionRequirements(e.target.value)}
              placeholder="What teams are being judged on — technical depth, marketability, team fit, demo polish, etc."
              rows={6}
              required
              maxLength={2000}
            />
          </label>

          <div className="field">
            <span>Judges</span>
            <div className="member-list">
              {judges.map((judge, idx) => (
                <div className="judge-row" key={idx}>
                  <input
                    type="text"
                    value={judge.name}
                    onChange={(e) => updateJudge(idx, "name", e.target.value)}
                    placeholder="Judge name"
                    required={idx === 0}
                    maxLength={120}
                  />
                  <input
                    type="text"
                    value={judge.company}
                    onChange={(e) => updateJudge(idx, "company", e.target.value)}
                    placeholder="Company"
                    required={idx === 0}
                    maxLength={120}
                  />
                  <input
                    type="url"
                    value={judge.linkedin}
                    onChange={(e) => updateJudge(idx, "linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    required={idx === 0}
                    pattern="https?://.*"
                    maxLength={300}
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Remove judge"
                    onClick={() => removeJudge(idx)}
                    disabled={judges.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className="add-button" onClick={addJudge}>
                <Plus size={16} />
                Add judge
              </button>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="primary-action"
            disabled={status === "submitting"}
          >
            <Send size={18} />
            {status === "submitting" ? "Saving..." : "Save judging panel"}
          </button>
        </form>
      </section>
    </main>
  );
}

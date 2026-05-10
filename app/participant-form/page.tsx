"use client";

import { useState } from "react";
import { CheckCircle2, Plus, Send, Trash2 } from "lucide-react";

import { safeJson } from "@/lib/http";
import { TRACKS } from "@/lib/submissions";

type Member = { name: string; linkedin: string };

export default function SubmitPage() {
  const [teamName, setTeamName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [track, setTrack] = useState<string>(TRACKS[0]);
  const [industry, setIndustry] = useState("");
  const [insights, setInsights] = useState("");
  const [members, setMembers] = useState<Member[]>([{ name: "", linkedin: "" }]);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  function updateMember(idx: number, key: keyof Member, value: string) {
    setMembers((current) =>
      current.map((m, i) => (i === idx ? { ...m, [key]: value } : m))
    );
  }

  function addMember() {
    setMembers((current) => [...current, { name: "", linkedin: "" }]);
  }

  function removeMember(idx: number) {
    setMembers((current) =>
      current.length === 1 ? current : current.filter((_, i) => i !== idx)
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("submitting");

    const cleanMembers = members
      .map((m) => ({ name: m.name.trim(), linkedin: m.linkedin.trim() }))
      .filter((m) => m.linkedin);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          projectDescription: projectDescription.trim(),
          track,
          industry: industry.trim(),
          insights: insights.trim(),
          members: cleanMembers
        })
      });

      const data = await safeJson<{ error?: string; ok?: boolean }>(response);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? "Submission failed");
      }
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  }

  function resetForm() {
    setTeamName("");
    setProjectDescription("");
    setTrack(TRACKS[0]);
    setIndustry("");
    setInsights("");
    setMembers([{ name: "", linkedin: "" }]);
    setStatus("idle");
    setError(null);
  }

  if (status === "done") {
    return (
      <main className="shell">
        <section className="form-shell">
          <article className="form-card success-card">
            <CheckCircle2 size={42} />
            <p className="eyebrow">Submission received</p>
            <h2>You're in the bracket.</h2>
            <p className="muted">
              We'll analyze your project, your team, and how you stack up against the
              other teams. Good luck.
            </p>
            <button className="primary-action" onClick={resetForm}>
              Submit another team
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
          <p className="eyebrow">Hackathon submission</p>
          <h1>Tell us about your team.</h1>
          <p className="muted">
            We'll use this to analyze your project, score your judge fit, and put your
            team on the swipe deck.
          </p>
        </header>

        <form className="form-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>Team name</span>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Signal Syndicate"
              required
              maxLength={120}
            />
          </label>

          <label className="field">
            <span>Project description</span>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="A real-time command center that turns betting odds, social signals, and injury news into explainable picks."
              rows={4}
              required
              maxLength={1000}
            />
          </label>

          <label className="field">
            <span>Track</span>
            <select value={track} onChange={(e) => setTrack(e.target.value)} required>
              {TRACKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Industry</span>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Fintech, healthcare, logistics..."
              required
              maxLength={120}
            />
          </label>

          <label className="field">
            <span>Why are you working on this?</span>
            <textarea
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              placeholder="The moment we realized..."
              rows={4}
              required
              maxLength={1000}
            />
          </label>

          <div className="field">
            <span>Team LinkedIn profiles</span>
            <div className="member-list">
              {members.map((member, idx) => (
                <div className="member-row" key={idx}>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMember(idx, "name", e.target.value)}
                    placeholder="Name (optional)"
                    maxLength={120}
                  />
                  <input
                    type="url"
                    value={member.linkedin}
                    onChange={(e) => updateMember(idx, "linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    required={idx === 0}
                    pattern="https?://.*"
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Remove member"
                    onClick={() => removeMember(idx)}
                    disabled={members.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className="add-button" onClick={addMember}>
                <Plus size={16} />
                Add teammate
              </button>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-action" disabled={status === "submitting"}>
            <Send size={18} />
            {status === "submitting" ? "Submitting..." : "Submit team"}
          </button>
        </form>
      </section>
    </main>
  );
}

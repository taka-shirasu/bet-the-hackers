export type SubmissionMember = {
  name?: string;
  linkedin: string;
};

export type SubmissionInput = {
  teamName: string;
  projectDescription: string;
  track: string;
  industry: string;
  insights: string;
  members: SubmissionMember[];
};

export type Submission = SubmissionInput & {
  id: string;
  createdAt: string;
};

export const TRACKS = [
  "Always-On Agents",
  "Ship It - Full-Stack Agents",
  "AI-Native Growth Tools",
  "The Company Brain"
] as const;

export function validateSubmission(
  body: unknown
): { ok: true; value: SubmissionInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Body required" };
  }
  const b = body as Record<string, unknown>;

  const teamName = typeof b.teamName === "string" ? b.teamName.trim() : "";
  const projectDescription =
    typeof b.projectDescription === "string" ? b.projectDescription.trim() : "";
  const track = typeof b.track === "string" ? b.track.trim() : "";
  const industry = typeof b.industry === "string" ? b.industry.trim() : "";
  const insights = typeof b.insights === "string" ? b.insights.trim() : "";
  const rawMembers = Array.isArray(b.members) ? b.members : [];

  if (!teamName) return { ok: false, error: "Team name is required" };
  if (!projectDescription) return { ok: false, error: "Project description is required" };
  if (!track) return { ok: false, error: "Track is required" };
  if (!industry) return { ok: false, error: "Industry is required" };
  if (!insights) return { ok: false, error: "Insights are required" };

  const members: SubmissionMember[] = rawMembers
    .map((m): SubmissionMember | null => {
      if (!m || typeof m !== "object") return null;
      const r = m as Record<string, unknown>;
      const linkedin = typeof r.linkedin === "string" ? r.linkedin.trim() : "";
      const name = typeof r.name === "string" ? r.name.trim() : "";
      if (!linkedin) return null;
      return name ? { name, linkedin } : { linkedin };
    })
    .filter((m): m is SubmissionMember => m !== null);

  if (members.length === 0) {
    return { ok: false, error: "At least one LinkedIn URL is required" };
  }

  return {
    ok: true,
    value: { teamName, projectDescription, track, industry, insights, members }
  };
}

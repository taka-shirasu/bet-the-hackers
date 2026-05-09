export type JudgeProfile = {
  name: string;
  company: string;
  linkedin: string;
};

export type JudgeFormInput = {
  competitionRequirements: string;
  judges: JudgeProfile[];
};

export type Judge = JudgeProfile & {
  id: string;
  competitionRequirements: string;
  createdAt: string;
};

export function validateJudgeForm(
  body: unknown
): { ok: true; value: JudgeFormInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Body required" };
  }
  const b = body as Record<string, unknown>;

  const competitionRequirements =
    typeof b.competitionRequirements === "string"
      ? b.competitionRequirements.trim()
      : "";
  if (!competitionRequirements) {
    return { ok: false, error: "Competition requirements are required" };
  }

  const rawJudges = Array.isArray(b.judges) ? b.judges : [];
  const judges: JudgeProfile[] = [];
  for (const [idx, raw] of rawJudges.entries()) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const name = typeof r.name === "string" ? r.name.trim() : "";
    const company = typeof r.company === "string" ? r.company.trim() : "";
    const linkedin = typeof r.linkedin === "string" ? r.linkedin.trim() : "";

    if (!name && !company && !linkedin) continue;

    if (!name) return { ok: false, error: `Judge ${idx + 1}: name is required` };
    if (!company) return { ok: false, error: `Judge ${idx + 1}: company is required` };
    if (!linkedin) return { ok: false, error: `Judge ${idx + 1}: LinkedIn URL is required` };

    judges.push({ name, company, linkedin });
  }

  if (judges.length === 0) {
    return { ok: false, error: "At least one judge is required" };
  }

  return { ok: true, value: { competitionRequirements, judges } };
}

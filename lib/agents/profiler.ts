import "server-only";

import { scrapeLinkedInProfiles } from "./integrations/apify";
import { storeEvidence } from "./integrations/hyperspell";
import { generateTeamImage } from "./integrations/openai-image";
import type { Submission } from "@/lib/submissions";

export type EnrichedTeam = {
  teamId: string;
  teamName: string;
  industry: string;
  track: string;
  projectDescription: string;
  insights: string;
  members: { name?: string; linkedin: string; headline?: string; about?: string }[];
  imageUrl?: string;
};

export async function profileTeam(
  submission: Submission & { teamId: string }
): Promise<{ enriched: EnrichedTeam; mode: "live" | "stub"; imageMode: "live" | "stub" }> {
  const linkedinUrls = submission.members.map((m) => m.linkedin).filter(Boolean);
  let profiles: Awaited<ReturnType<typeof scrapeLinkedInProfiles>>["profiles"] = [];
  let mode: "live" | "stub" = "stub";
  try {
    const result = await scrapeLinkedInProfiles(linkedinUrls);
    profiles = result.profiles;
    mode = result.mode;
  } catch (error) {
    console.error("Apify enrichment failed; continuing without it.", error);
    profiles = linkedinUrls.map((url) => ({ url }));
    mode = "stub";
  }

  const merged = submission.members.map((m) => {
    const profile = profiles.find((p) => p.url === m.linkedin);
    return {
      name: m.name ?? profile?.name,
      linkedin: m.linkedin,
      headline: profile?.headline,
      about: profile?.about
    };
  });

  const image = await generateTeamImage({
    teamId: submission.teamId,
    teamName: submission.teamName,
    projectDescription: submission.projectDescription,
    industry: submission.industry
  });

  const enriched: EnrichedTeam = {
    teamId: submission.teamId,
    teamName: submission.teamName,
    industry: submission.industry,
    track: submission.track,
    projectDescription: submission.projectDescription,
    insights: submission.insights,
    members: merged,
    imageUrl: image.relativePath
  };

  await storeEvidence([
    {
      namespace: `team:${submission.teamId}`,
      key: "profile",
      source: "manual",
      content: JSON.stringify(enriched, null, 2),
      metadata: { teamName: submission.teamName, industry: submission.industry },
      storedAt: new Date().toISOString()
    },
    ...merged
      .filter((m) => m.headline || m.about)
      .map((m, i) => ({
        namespace: `team:${submission.teamId}`,
        key: `member:${i}`,
        source: "apify" as const,
        content: `${m.name ?? m.linkedin}\nHeadline: ${m.headline ?? ""}\nAbout: ${
          m.about ?? ""
        }`,
        metadata: { linkedin: m.linkedin },
        storedAt: new Date().toISOString()
      }))
  ]);

  return { enriched, mode, imageMode: image.mode };
}

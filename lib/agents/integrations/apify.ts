import "server-only";

import type { AgentMode } from "../types";

const DEFAULT_LINKEDIN_ACTOR =
  process.env.APIFY_LINKEDIN_ACTOR ?? "dev_fusion~linkedin-profile-scraper";

export function apifyMode(): AgentMode {
  return process.env.APIFY_TOKEN ? "live" : "stub";
}

export type LinkedInProfile = {
  url: string;
  name?: string;
  headline?: string;
  about?: string;
  experience?: { company?: string; title?: string; description?: string }[];
  raw?: unknown;
};

export async function scrapeLinkedInProfiles(
  urls: string[]
): Promise<{ profiles: LinkedInProfile[]; mode: AgentMode }> {
  if (apifyMode() === "stub") {
    return {
      profiles: urls.map((url) => ({
        url,
        name: extractHandle(url),
        headline: "[stub] LinkedIn enrichment unavailable — set APIFY_TOKEN",
        about: ""
      })),
      mode: "stub"
    };
  }

  const token = process.env.APIFY_TOKEN!;
  const actor = DEFAULT_LINKEDIN_ACTOR;
  const url = `https://api.apify.com/v2/acts/${encodeURIComponent(
    actor
  )}/run-sync-get-dataset-items?token=${token}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ profileUrls: urls })
  });

  if (!response.ok) {
    throw new Error(`Apify ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  const items = (await response.json()) as Record<string, unknown>[];
  const profiles: LinkedInProfile[] = items.map((item) => ({
    url: String(item.url ?? item.profileUrl ?? ""),
    name: (item.fullName ?? item.name) as string | undefined,
    headline: item.headline as string | undefined,
    about: item.about as string | undefined,
    experience: (item.experiences ?? item.experience) as LinkedInProfile["experience"],
    raw: item
  }));
  return { profiles, mode: "live" };
}

function extractHandle(url: string): string {
  const match = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return match ? match[1].replace(/-/g, " ") : "Unknown";
}

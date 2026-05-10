import "server-only";

import { promises as fs } from "fs";
import path from "path";

import type { AgentMode } from "../types";
import { openaiMode } from "./openai";

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "dall-e-3";
const IMAGE_DIR = path.join(process.cwd(), "public", "team-images");

export type ImageRequest = {
  teamId: string;
  teamName: string;
  projectDescription: string;
  industry: string;
};

export async function generateTeamImage(
  req: ImageRequest
): Promise<{ relativePath: string; mode: AgentMode; cached: boolean }> {
  await fs.mkdir(IMAGE_DIR, { recursive: true });

  const pngPath = path.join(IMAGE_DIR, `${req.teamId}.png`);
  const svgPath = path.join(IMAGE_DIR, `${req.teamId}.svg`);

  if (await fileExists(pngPath)) {
    return { relativePath: `/team-images/${req.teamId}.png`, mode: "live", cached: true };
  }
  if (await fileExists(svgPath)) {
    return { relativePath: `/team-images/${req.teamId}.svg`, mode: "stub", cached: true };
  }

  if (openaiMode() === "stub") {
    const svg = avatarSvg(req.teamName);
    await fs.writeFile(svgPath, svg, "utf-8");
    return { relativePath: `/team-images/${req.teamId}.svg`, mode: "stub", cached: false };
  }

  const prompt = buildPrompt(req);
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json"
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI image ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    data?: { b64_json?: string }[];
  };
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI image: missing b64_json in response");

  await fs.writeFile(pngPath, Buffer.from(b64, "base64"));
  return { relativePath: `/team-images/${req.teamId}.png`, mode: "live", cached: false };
}

function buildPrompt(req: ImageRequest): string {
  return [
    `Minimal flat-color vector illustration representing a hackathon team building "${req.projectDescription.slice(0, 240)}".`,
    `Industry: ${req.industry}.`,
    `Modern startup aesthetic, cohesive bold colors, soft gradients, clean shapes.`,
    `No text, no letters, no logos, no watermarks.`,
    `Centered composition, suitable as a product card hero image.`
  ].join(" ");
}

function avatarSvg(teamName: string): string {
  const hue = hash(teamName) % 360;
  const hue2 = (hue + 60) % 360;
  const initials = teamName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue}, 72%, 56%)"/>
      <stop offset="100%" stop-color="hsl(${hue2}, 64%, 38%)"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#g)"/>
  <text x="512" y="512" text-anchor="middle" dominant-baseline="central" font-family="Inter, system-ui, sans-serif" font-size="320" font-weight="800" fill="rgba(255,255,255,0.92)">${escapeXml(initials || "?")}</text>
</svg>`;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]!));
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

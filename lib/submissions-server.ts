import "server-only";

import { promises as fs } from "fs";
import path from "path";

import { prisma } from "./prisma";
import type { Submission, SubmissionInput } from "./submissions";

const FALLBACK_FILE = path.join(process.cwd(), "data", "submissions.json");

export async function createSubmission(
  input: SubmissionInput
): Promise<{ source: "mongodb" | "file"; submission: Submission }> {
  const submission: Submission = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  if (process.env.MONGODB_URI) {
    try {
      await prisma.submission.create({
        data: {
          publicId: submission.id,
          teamName: submission.teamName,
          projectDescription: submission.projectDescription,
          track: submission.track,
          industry: submission.industry,
          insights: submission.insights,
          members: submission.members,
          createdAt: new Date(submission.createdAt)
        }
      });
      return { source: "mongodb", submission };
    } catch (error) {
      console.error("Prisma submission failed, falling back to file", error);
    }
  }

  await fs.mkdir(path.dirname(FALLBACK_FILE), { recursive: true });
  let existing: Submission[] = [];
  try {
    const raw = await fs.readFile(FALLBACK_FILE, "utf-8");
    existing = JSON.parse(raw);
  } catch {
    existing = [];
  }
  existing.push(submission);
  await fs.writeFile(FALLBACK_FILE, JSON.stringify(existing, null, 2));
  return { source: "file", submission };
}

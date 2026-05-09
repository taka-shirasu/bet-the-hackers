import "server-only";

import { getMongoClient } from "./mongodb";
import type { Submission, SubmissionInput } from "./submissions";

export async function createSubmission(
  input: SubmissionInput
): Promise<{ source: "mongodb"; submission: Submission }> {
  const submission: Submission = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  const client = await getMongoClient();
  const dbName = getDatabaseName();
  const collectionName = process.env.MONGODB_SUBMISSIONS_COLLECTION ?? "submissions";

  await client
    .db(dbName)
    .collection(collectionName)
    .insertOne({
      publicId: submission.id,
      teamName: submission.teamName,
      projectDescription: submission.projectDescription,
      track: submission.track,
      industry: submission.industry,
      insights: submission.insights,
      members: submission.members,
      createdAt: new Date(submission.createdAt)
    });

  return { source: "mongodb", submission };
}

function getDatabaseName() {
  if (process.env.MONGODB_DB) {
    return process.env.MONGODB_DB;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_DB or MONGODB_URI.");
  }

  const database = new URL(uri).pathname.slice(1);
  if (!database) {
    throw new Error("Missing database name in MONGODB_URI.");
  }

  return database;
}

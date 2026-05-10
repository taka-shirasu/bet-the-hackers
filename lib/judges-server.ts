import "server-only";

import { getMongoClient } from "./mongodb";
import type { Judge, JudgeFormInput } from "./judges";

export async function createJudges(
  input: JudgeFormInput
): Promise<{ source: "mongodb"; judges: Judge[] }> {
  const createdAt = new Date();
  const judges: Judge[] = input.judges.map((profile) => ({
    ...profile,
    id: crypto.randomUUID(),
    competitionRequirements: input.competitionRequirements,
    createdAt: createdAt.toISOString()
  }));

  const client = await getMongoClient();
  const dbName = getDatabaseName();
  const collectionName = process.env.MONGODB_JUDGES_COLLECTION ?? "judges";

  const docs = judges.map((judge) => ({
    publicId: judge.id,
    name: judge.name,
    company: judge.company,
    linkedin: judge.linkedin,
    competitionRequirements: judge.competitionRequirements,
    createdAt
  }));

  await client.db(dbName).collection(collectionName).insertMany(docs);

  return { source: "mongodb", judges };
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

import { NextResponse } from "next/server";

import { getMongoClient } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type ParticipantRecord = {
  publicId: string;
  fullName: string;
  normalizedFullName: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fullName =
    body && typeof body === "object" && "fullName" in body
      ? String(body.fullName).trim()
      : "";

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }

  const normalizedFullName = fullName.toLowerCase().replace(/\s+/g, " ");
  const client = await getMongoClient();
  const collection = client
    .db(getDbName())
    .collection<ParticipantRecord>(
      process.env.MONGODB_PARTICIPANTS_COLLECTION ?? "participants"
    );

  const now = new Date();
  const existing = await collection.findOne({ normalizedFullName });

  if (existing) {
    await collection.updateOne(
      { publicId: existing.publicId },
      { $set: { fullName, updatedAt: now } }
    );

    return NextResponse.json({
      participant: {
        id: existing.publicId,
        fullName
      }
    });
  }

  const participant: ParticipantRecord = {
    publicId: crypto.randomUUID(),
    fullName,
    normalizedFullName,
    createdAt: now,
    updatedAt: now
  };

  await collection.insertOne(participant);

  return NextResponse.json({
    participant: {
      id: participant.publicId,
      fullName: participant.fullName
    }
  });
}

function getDbName() {
  if (process.env.MONGODB_DB) {
    return process.env.MONGODB_DB;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  const db = new URL(uri).pathname.slice(1);
  if (!db) {
    throw new Error("Missing database in MONGODB_URI");
  }

  return db;
}

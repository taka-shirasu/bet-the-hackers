import { NextResponse } from "next/server";

import { getMongoClient } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type PickRecord = {
  participantId: string;
  fullName: string;
  winnerTeamId: string;
  winnerTeamName: string;
  winnerScore: number;
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

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body required" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const participantId = readString(data.participantId);
  const fullName = readString(data.fullName);
  const winnerTeamId = readString(data.winnerTeamId);
  const winnerTeamName = readString(data.winnerTeamName);
  const winnerScore = Number(data.winnerScore ?? 0);

  if (!participantId || !fullName || !winnerTeamId || !winnerTeamName) {
    return NextResponse.json({ error: "Missing pick fields" }, { status: 400 });
  }

  const client = await getMongoClient();
  const collection = client
    .db(getDbName())
    .collection<PickRecord>(process.env.MONGODB_PICKS_COLLECTION ?? "winner_picks");

  const now = new Date();
  await collection.updateOne(
    { participantId },
    {
      $set: {
        participantId,
        fullName,
        winnerTeamId,
        winnerTeamName,
        winnerScore,
        updatedAt: now
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  );

  return NextResponse.json({
    ok: true,
    pick: {
      participantId,
      fullName,
      winnerTeamId,
      winnerTeamName,
      winnerScore
    }
  });
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

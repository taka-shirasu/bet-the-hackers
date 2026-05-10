import "server-only";

import { getMongoClient } from "@/lib/mongodb";
import type { AgentMode, EvidenceRecord } from "../types";

const HYPERSPELL_BASE =
  process.env.HYPERSPELL_API_BASE ?? "https://api.hyperspell.com";
const EVIDENCE_COLLECTION =
  process.env.MONGODB_EVIDENCE_COLLECTION ?? "evidence";

export function hyperspellMode(): AgentMode {
  return process.env.HYPERSPELL_API_KEY ? "live" : "stub";
}

export async function storeEvidence(records: EvidenceRecord[]): Promise<void> {
  if (records.length === 0) return;

  if (hyperspellMode() === "live") {
    try {
      const response = await fetch(`${HYPERSPELL_BASE}/v1/memories/bulk`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${process.env.HYPERSPELL_API_KEY}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          memories: records.map((r) => ({
            content: r.content,
            user_id: r.namespace,
            metadata: { ...r.metadata, source: r.source, key: r.key }
          }))
        })
      });
      if (!response.ok) {
        throw new Error(
          `Hyperspell ${response.status}: ${(await response.text()).slice(0, 200)}`
        );
      }
      return;
    } catch (error) {
      console.error("Hyperspell write failed, falling back to Mongo evidence", error);
    }
  }

  const client = await getMongoClient();
  const dbName = getDbName();
  await client
    .db(dbName)
    .collection(EVIDENCE_COLLECTION)
    .insertMany(records.map((r) => ({ ...r })));
}

export async function searchEvidence(
  namespace: string,
  query: string
): Promise<{ chunks: { content: string; score?: number }[]; mode: AgentMode }> {
  if (hyperspellMode() === "live") {
    try {
      const response = await fetch(`${HYPERSPELL_BASE}/v1/memories/search`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${process.env.HYPERSPELL_API_KEY}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({ query, user_id: namespace, sources: ["vault"] })
      });
      if (response.ok) {
        const data = (await response.json()) as {
          results?: { content: string; score?: number }[];
        };
        return { chunks: data.results ?? [], mode: "live" };
      }
    } catch (error) {
      console.error("Hyperspell search failed, falling back to Mongo evidence", error);
    }
  }

  const client = await getMongoClient();
  const docs = await client
    .db(getDbName())
    .collection(EVIDENCE_COLLECTION)
    .find({ namespace })
    .sort({ storedAt: -1 })
    .limit(20)
    .toArray();
  return {
    chunks: docs.map((d) => ({ content: String(d.content ?? "") })),
    mode: "stub"
  };
}

export async function listEvidence(limit = 50): Promise<EvidenceRecord[]> {
  const client = await getMongoClient();
  const docs = await client
    .db(getDbName())
    .collection(EVIDENCE_COLLECTION)
    .find({})
    .sort({ storedAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => ({
    namespace: String(d.namespace),
    key: String(d.key),
    source: d.source as EvidenceRecord["source"],
    content: String(d.content),
    metadata: (d.metadata ?? undefined) as Record<string, unknown> | undefined,
    storedAt: String(d.storedAt)
  }));
}

function getDbName(): string {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  const db = new URL(uri).pathname.slice(1);
  if (!db) throw new Error("Missing database in MONGODB_URI");
  return db;
}

import { NextRequest } from "next/server";
import { searchUserMemory, getUserPreferences } from "@/lib/hyperspell";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, query, mode = "search" } = body as {
    userId: string;
    query?: string;
    mode?: "search" | "preferences";
  };

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  if (mode === "preferences") {
    const result = await getUserPreferences(userId);
    return Response.json(result);
  }

  if (!query) {
    return Response.json(
      { error: "query is required for search mode" },
      { status: 400 },
    );
  }

  const result = await searchUserMemory(userId, query);
  return Response.json(result);
}

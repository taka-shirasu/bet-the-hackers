import { NextRequest } from "next/server";
import { searchUserMemory, getUserPreferences } from "@/lib/hyperspell";

/**
 * POST /api/hyperspell/search
 * Searches a user's betting/swipe memory or retrieves their preferences.
 *
 * Body:
 *   userId: string
 *   query?: string — free-text search (uses searchUserMemory)
 *   mode?: "search" | "preferences" — defaults to "search"
 */
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

  try {
    if (mode === "preferences") {
      const result = await getUserPreferences(userId);
      return Response.json({
        answer: result.answer,
        documents: result.documents,
      });
    }

    if (!query) {
      return Response.json(
        { error: "query is required for search mode" },
        { status: 400 },
      );
    }

    const result = await searchUserMemory(userId, query);
    return Response.json({
      answer: result.answer,
      documents: result.documents,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

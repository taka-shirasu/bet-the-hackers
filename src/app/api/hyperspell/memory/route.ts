import { NextRequest } from "next/server";
import { storeBetMemory, storeSwipeMemory } from "@/lib/hyperspell";

/**
 * POST /api/hyperspell/memory
 * Stores a user action (bet or swipe) in Hyperspell memory.
 *
 * Body:
 *   userId: string
 *   type: "bet" | "swipe"
 *   projectId: string
 *   projectName: string
 *   techStack?: string[]
 *
 *   For bets:
 *     direction: "win" | "skip"
 *     amount: number
 *
 *   For swipes:
 *     direction: "left" | "right"
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, type, projectId, projectName, techStack = [] } = body as {
    userId: string;
    type: "bet" | "swipe";
    projectId: string;
    projectName: string;
    techStack?: string[];
  };

  if (!userId || !type || !projectId || !projectName) {
    return Response.json(
      { error: "userId, type, projectId, and projectName are required" },
      { status: 400 },
    );
  }

  try {
    if (type === "bet") {
      const { direction, amount } = body as {
        direction: "win" | "skip";
        amount: number;
      };
      if (!direction || amount == null) {
        return Response.json(
          { error: "direction and amount are required for bets" },
          { status: 400 },
        );
      }
      const result = await storeBetMemory(userId, {
        projectId,
        projectName,
        direction,
        amount,
        techStack,
      });
      return Response.json({ success: true, resourceId: result.resource_id });
    }

    if (type === "swipe") {
      const { direction } = body as { direction: "left" | "right" };
      if (!direction) {
        return Response.json(
          { error: "direction is required for swipes" },
          { status: 400 },
        );
      }
      const result = await storeSwipeMemory(userId, {
        projectId,
        projectName,
        direction,
        techStack,
      });
      return Response.json({ success: true, resourceId: result.resource_id });
    }

    return Response.json(
      { error: 'type must be "bet" or "swipe"' },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to store memory";
    return Response.json({ error: message }, { status: 500 });
  }
}

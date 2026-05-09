import { NextRequest } from "next/server";
import { storeBetMemory, storeSwipeMemory } from "@/lib/hyperspell";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, userId, teamId, teamName } = body as {
    type: "bet" | "swipe";
    userId: string;
    teamId: string;
    teamName: string;
    amount?: number;
    winProbability?: number;
    direction?: "left" | "right";
  };

  if (!type || !userId || !teamId || !teamName) {
    return Response.json(
      { error: "type, userId, teamId, and teamName are required" },
      { status: 400 },
    );
  }

  if (type === "bet") {
    const { amount, winProbability } = body as {
      amount: number;
      winProbability: number;
    };
    if (amount == null || winProbability == null) {
      return Response.json(
        { error: "amount and winProbability are required for bets" },
        { status: 400 },
      );
    }
    const result = await storeBetMemory(
      userId,
      teamId,
      teamName,
      amount,
      winProbability,
    );
    return Response.json({ success: true, resourceId: result });
  }

  if (type === "swipe") {
    const { direction } = body as { direction: "left" | "right" };
    if (!direction) {
      return Response.json(
        { error: "direction is required for swipes" },
        { status: 400 },
      );
    }
    const result = await storeSwipeMemory(userId, teamId, teamName, direction);
    return Response.json({ success: true, resourceId: result });
  }

  return Response.json({ error: "invalid type" }, { status: 400 });
}

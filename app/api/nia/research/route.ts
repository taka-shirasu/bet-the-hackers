import { NextRequest } from "next/server";
import { streamProjectResearch, streamOracleResearch } from "@/lib/nia";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    query,
    repositories = [],
    dataSources = [],
    mode = "tracer",
  } = body as {
    query: string;
    repositories?: string[];
    dataSources?: string[];
    mode?: "tracer" | "oracle";
  };

  if (!query) {
    return Response.json({ error: "query is required" }, { status: 400 });
  }

  const eventsPromise =
    mode === "oracle"
      ? streamOracleResearch(query, dataSources)
      : streamProjectResearch(query, repositories);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const generator = await eventsPromise;
        for await (const event of generator) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: String(err) })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

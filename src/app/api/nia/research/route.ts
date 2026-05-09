import { NextRequest } from "next/server";
import { streamProjectResearch, streamOracleResearch } from "@/lib/nia";

/**
 * POST /api/nia/research
 * Streams Nia Tracer or Oracle research for a hackathon project.
 *
 * Body:
 *   query: string — the research question
 *   repositories?: string[] — GitHub repos to search
 *   dataSources?: string[] — indexed data sources for Oracle
 *   mode?: "tracer" | "oracle" — defaults to "tracer"
 */
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

  try {
    const session =
      mode === "oracle"
        ? await streamOracleResearch(query, repositories, dataSources)
        : await streamProjectResearch(query, repositories);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of session.events) {
            const chunk = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(chunk));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Research request failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

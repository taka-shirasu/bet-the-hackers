import {
  createNiaResearchTools as _createNiaResearchTools,
  streamTracer,
  streamOracle,
} from "@nozomioai/nia-ai-sdk";

const transport = {
  apiKey: process.env.NIA_API_KEY ?? "",
};

/** Vercel AI SDK tools for hackathon project research */
export function createHackathonResearchTools(
  repositories: string[] = [],
  dataSources: string[] = [],
) {
  return _createNiaResearchTools({
    ...transport,
    tracer: {
      defaultRequest: { repositories },
    },
    oracle: {
      defaultRequest: { dataSources },
    },
  });
}

/** Stream research events from Nia Tracer */
export async function streamProjectResearch(
  query: string,
  repositories: string[] = [],
) {
  const session = await streamTracer(transport, { query, repositories });
  return session.events;
}

/** Stream research from Nia Oracle */
export async function streamOracleResearch(
  query: string,
  dataSources: string[] = [],
) {
  const session = await streamOracle(transport, { query, dataSources });
  return session.events;
}

import { createNiaResearchTools } from "@nozomioai/nia-ai-sdk";
import {
  withOracleContext,
  withTracerContext,
  streamTracer,
  streamOracle,
} from "@nozomioai/nia-ai-sdk";

function getNiaApiKey(): string {
  const key = process.env.NIA_API_KEY;
  if (!key) {
    throw new Error("NIA_API_KEY environment variable is not set");
  }
  return key;
}

/**
 * Creates AI SDK tools for researching hackathon projects via Nia.
 * - Tracer: searches public GitHub repos for project context
 * - Oracle: searches indexed hackathon data sources
 */
export function createHackathonResearchTools(
  repositories?: string[],
  dataSources?: string[],
) {
  const apiKey = getNiaApiKey();

  return createNiaResearchTools({
    tracer: {
      apiKey,
      defaultRequest: {
        mode: "tracer-deep",
      },
    },
    oracle: {
      apiKey,
      defaultRequest: {
        repositories: repositories ?? [],
        dataSources: dataSources ?? [],
      },
    },
  });
}

/**
 * Wraps an AI SDK model with Oracle context for grounded hackathon project research.
 */
export function withHackathonOracleContext(
  model: Parameters<typeof withOracleContext>[0],
  repositories: string[],
  dataSources: string[],
) {
  return withOracleContext(model, {
    apiKey: getNiaApiKey(),
    defaultRequest: {
      repositories,
      dataSources,
    },
  });
}

/**
 * Wraps an AI SDK model with Tracer context for public GitHub research.
 */
export function withHackathonTracerContext(
  model: Parameters<typeof withTracerContext>[0],
) {
  return withTracerContext(model, {
    apiKey: getNiaApiKey(),
  });
}

/**
 * Streams a Tracer research job for a given hackathon project query.
 */
export async function streamProjectResearch(
  query: string,
  repositories: string[],
) {
  return streamTracer(
    { apiKey: getNiaApiKey() },
    {
      query,
      repositories,
      mode: "tracer-deep",
    },
  );
}

/**
 * Streams an Oracle research job over indexed hackathon data.
 */
export async function streamOracleResearch(
  query: string,
  repositories: string[],
  dataSources: string[],
) {
  return streamOracle(
    { apiKey: getNiaApiKey() },
    {
      query,
      repositories,
      dataSources,
    },
  );
}

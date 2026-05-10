export type AgentMode = "live" | "stub";

export type IntegrationStatus = {
  name: "apify" | "nia" | "hyperspell" | "openai";
  configured: boolean;
  mode: AgentMode;
  envVar: string;
};

export type EvidenceRecord = {
  namespace: string;
  key: string;
  source: "apify" | "nia" | "manual";
  content: string;
  metadata?: Record<string, unknown>;
  storedAt: string;
};

export type AgentRunStatus = "pending" | "running" | "ok" | "error" | "skipped";

export type AgentStepResult = {
  agent: string;
  status: AgentRunStatus;
  durationMs?: number;
  message?: string;
  output?: unknown;
};

export type TeamScore = {
  teamId: string;
  teamName: string;
  imageUrl?: string;
  competitiveness: number;
  judgeFit: number;
  marketability: number;
  overall: number;
  blurbs: {
    competitiveness: string;
    judgeFit: string;
    marketability: string;
  };
  steps: AgentStepResult[];
  scoredAt: string;
};

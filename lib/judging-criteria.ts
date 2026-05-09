export type Track =
  | "always-on-agents"
  | "ship-it-full-stack"
  | "ai-native-growth"
  | "company-brain";

export const TRACK_LABELS: Record<Track, string> = {
  "always-on-agents": "Always-On Agents",
  "ship-it-full-stack": "Ship It - Full-Stack Agents",
  "ai-native-growth": "AI-Native Growth Tools",
  "company-brain": "The Company Brain",
};

export interface CriterionDef {
  name: string;
  weight: number;
  scoreKey: string;
  levels: [string, string, string, string, string];
}

export const TRACK_CRITERIA: Record<Track, [CriterionDef, CriterionDef, CriterionDef]> = {
  "always-on-agents": [
    {
      name: "Genuine Background Execution",
      weight: 30,
      scoreKey: "criterion1Score",
      levels: [
        "Triggered manually or by user input only",
        "Automated trigger exists but relies on human setup each time",
        "Runs on a schedule or event without user involvement",
        "Fully autonomous triggers; handles failures and retries without human intervention",
        "Deeply autonomous; multi-source triggers, graceful recovery, runs reliably over hours",
      ],
    },
    {
      name: "Statefulness",
      weight: 25,
      scoreKey: "criterion2Score",
      levels: [
        "No memory between runs; starts fresh every time",
        "Saves some output but doesn't use it to change future behaviour",
        "Prior state influences current run in a meaningful way",
        "Rich durable memory; agent demonstrably improves or adapts based on history",
        "Memory is load-bearing; removing it would break the demo entirely",
      ],
    },
    {
      name: "Agentic Depth",
      weight: 25,
      scoreKey: "criterion3Score",
      levels: [
        "Single-step, no decision-making",
        "Basic branching but no real planning or recovery",
        "Plans multi-step flows; handles some edge cases",
        "Retries on failure; adapts plan mid-run; reasons about what to do next",
        "Full agentic loop: plans, executes, reflects, recovers, and improves autonomously",
      ],
    },
  ],
  "ship-it-full-stack": [
    {
      name: "Production Readiness",
      weight: 35,
      scoreKey: "criterion1Score",
      levels: [
        "localhost only; nothing deployed",
        "Deployed but missing auth or database; not usable by others",
        "Live URL, auth, and database all working; usable by someone outside the team",
        "Polished and reliable; handles edge cases and real user flows without breaking",
        "Could be handed to a real user today; impressively complete for 24 hours",
      ],
    },
    {
      name: "Agent Reliability",
      weight: 30,
      scoreKey: "criterion2Score",
      levels: [
        "Agent breaks on anything outside the happy path",
        "Works on happy path; falls over on edge cases",
        "Handles a few off-script scenarios; recovers from some errors",
        "Robust across multiple flows; fails gracefully and explains errors well",
        "Agent holds up under adversarial or unexpected input; feels production-grade",
      ],
    },
    {
      name: "Full-Stack Depth",
      weight: 25,
      scoreKey: "criterion3Score",
      levels: [
        "UI only; no real backend or AI logic",
        "Frontend + some backend, but AI is a thin wrapper",
        "Frontend, backend, and AI logic all present and connected",
        "All layers well-integrated; AI drives real functionality, not just surface features",
        "Seamless full stack; each layer non-trivially implemented and AI is core",
      ],
    },
  ],
  "ai-native-growth": [
    {
      name: "Depth of Social Intelligence Usage",
      weight: 30,
      scoreKey: "criterion1Score",
      levels: [
        "Doesn't use Reacher data meaningfully; surface-level or none",
        "Uses one or two tools but misses the richness of the data available",
        "Draws on multiple data types (creators, GMV, videos) in a coherent way",
        "Social Intelligence is central to how the agent reasons and makes decisions",
        "Couldn't exist without Reacher; extracts genuine insight a human would miss",
      ],
    },
    {
      name: "Agentic Complexity",
      weight: 30,
      scoreKey: "criterion2Score",
      levels: [
        "Single API call wrapped in a UI; no real agent logic",
        "Some chaining but no real decision-making or recovery",
        "Multi-step flow with basic branching and error handling",
        "Plans, retries, and adapts; handles off-script prompts without breaking",
        "Full agentic loop with autonomous decision-making across the entire flow",
      ],
    },
    {
      name: "End-to-End Flow",
      weight: 20,
      scoreKey: "criterion3Score",
      levels: [
        "Produces a chart or report; agent does no real work",
        "Agent does some work but flow is incomplete or requires manual steps",
        "Full flow works end-to-end in the sandbox; campaigns or outreach drafts created",
        "Seamless flow from discovery to output; sandboxed writes demonstrate real capability",
        "Agent ships a complete campaign autonomously; demo feels like a real product",
      ],
    },
  ],
  "company-brain": [
    {
      name: "Cross-Source Synthesis",
      weight: 30,
      scoreKey: "criterion1Score",
      levels: [
        "Single source or surface-level use; no real synthesis",
        "Two sources but stitched, not synthesised",
        "Combines 3+ sources to produce coherent context",
        "Synthesis is central; agent reasons across sources fluidly",
        "Produces context no single source could; the brain is the product",
      ],
    },
    {
      name: "Real Work, Not Just Answers",
      weight: 25,
      scoreKey: "criterion2Score",
      levels: [
        "Q&A bot or chatbot wrapper",
        "Surfaces info but a human still does the work",
        "Agent does part of the work end-to-end",
        "Agent ships work a human would actually use",
        "Agent delivers output that replaces hours of human work",
      ],
    },
    {
      name: "Hyperspell Integration Depth",
      weight: 25,
      scoreKey: "criterion3Score",
      levels: [
        "Hyperspell used as a thin wrapper or not at all",
        "Surface-level use of ingestion or search",
        "Hyperspell is meaningfully load-bearing",
        "Synthesis through Hyperspell is core to how the agent works",
        "Removing Hyperspell would break the demo entirely",
      ],
    },
  ],
};

export function buildRubricPrompt(track: Track): string {
  const criteria = TRACK_CRITERIA[track];
  const sharedSuffix = `
4. Demo & Presentation (10% weight)
   - 1 (Poor): Hard to follow what the agent/product does
   - 2 (Weak): Shows it works but misses the compelling case
   - 3 (Solid): Clear demo; explains the value well
   - 4 (Strong): Live demo lands; judges want to try it themselves
   - 5 (Exceptional): Story + demo make the case unforgettably

5. Judge's Personal Rating (10% weight)
   - 1 (Poor): Not interesting or compelling
   - 2 (Weak): Somewhat interesting but forgettable
   - 3 (Solid): Solid idea; I can see the appeal
   - 4 (Strong): I'd tell a colleague about this
   - 5 (Exceptional): This genuinely excites me; I want to see it succeed`;

  const lines = [
    `Track: ${TRACK_LABELS[track]}`,
    `Judging Criteria (use these exact criteria and weights to score projects 0-100):`,
    "",
  ];

  criteria.forEach((c, i) => {
    lines.push(`${i + 1}. ${c.name} (${c.weight}% weight)`);
    c.levels.forEach((lvl, j) => {
      const label = ["Poor", "Weak", "Solid", "Strong", "Exceptional"][j];
      lines.push(`   - ${j + 1} (${label}): ${lvl}`);
    });
    lines.push("");
  });

  lines.push(sharedSuffix);
  return lines.join("\n");
}

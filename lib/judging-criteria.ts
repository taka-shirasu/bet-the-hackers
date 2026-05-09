export const JUDGING_RUBRIC = `
Judging Criteria (use these exact criteria and weights to score projects 0-100):

1. Genuine Background Execution (30% weight)
   - 1 (Poor): Triggered manually or by user input only
   - 2 (Weak): Automated trigger exists but relies on human setup each time
   - 3 (Solid): Runs on a schedule or event without user involvement
   - 4 (Strong): Fully autonomous triggers; handles failures and retries without human intervention
   - 5 (Exceptional): Deeply autonomous; multi-source triggers, graceful recovery, runs reliably over hours

2. Statefulness (25% weight)
   - 1 (Poor): No memory between runs; starts fresh every time
   - 2 (Weak): Saves some output but doesn't use it to change future behaviour
   - 3 (Solid): Prior state influences current run in a meaningful way
   - 4 (Strong): Rich durable memory; agent demonstrably improves or adapts based on history
   - 5 (Exceptional): Memory is load-bearing; removing it would break the demo entirely

3. Agentic Depth (25% weight)
   - 1 (Poor): Single-step, no decision-making
   - 2 (Weak): Basic branching but no real planning or recovery
   - 3 (Solid): Plans multi-step flows; handles some edge cases
   - 4 (Strong): Retries on failure; adapts plan mid-run; reasons about what to do next
   - 5 (Exceptional): Full agentic loop: plans, executes, reflects, recovers, and improves autonomously

4. Demo & Presentation (10% weight)
   - 1 (Poor): Hard to follow what the agent does
   - 2 (Weak): Shows it works but misses the compelling case
   - 3 (Solid): Clear demo; explains the value well
   - 4 (Strong): Live demo lands; judges want to try it themselves
   - 5 (Exceptional): Story + demo make the case unforgettably

5. Judge's Personal Rating (10% weight)
   - 1 (Poor): Not interesting or compelling
   - 2 (Weak): Somewhat interesting but forgettable
   - 3 (Solid): Solid idea; I can see the appeal
   - 4 (Strong): I'd tell a colleague about this
   - 5 (Exceptional): This genuinely excites me; I want to see it succeed
`;

export const CRITERIA_NAMES = [
  "Genuine Background Execution",
  "Statefulness",
  "Agentic Depth",
] as const;

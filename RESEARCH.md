# Hackathon Research: Nia + Hyperspell for "Bet the Hackers"

> Tinder-style swipe app where each card is a hackathon team, ranked by likelihood of winning across three metrics: peer comparison, judge fit, and marketability.

---

## TL;DR

Use **MongoDB/Prisma** as the operational app database for raw team submissions, hackathon judges, judging criteria, and cached scores. Use **Hyperspell** as the agent memory/evidence layer (per-team namespace, holds all signals + judge/market knowledge). Use **Nia** as the deep-research tool whose findings get written *into* Hyperspell. Use **Apify** to scrape public web and LinkedIn-style profile sources, then write cleaned summaries into Hyperspell. MongoDB serves the product quickly; Hyperspell explains the scores.

---

## 1. Nia (trynia.ai)

**Company:** Nozomio Labs · YC S25 · backers include CRV, BoxGroup, Paul Graham
**Positioning:** "10× the context of your coding agent"
**Form factor:** REST API + MCP server

### What it indexes
- GitHub repositories
- Documentation sites
- arXiv papers
- PDFs, datasets, spreadsheets
- Slack messages
- Google Drive files

### Tool surface (MCP)

| Tool | Purpose |
|---|---|
| `nia.index` | Index a repo / docs site / arXiv paper |
| `nia.search` | Semantic search across indexed sources |
| `nia.nia_grep` | Regex search across codebases |
| `nia.nia_read` | Read files from indexed sources |
| `nia.nia_explore` | Browse file trees |
| `nia.nia_research` | Web search (quick) or deep "oracle" research |
| `nia.manage_resource` | List / manage indexed sources |
| `nia.context` | **Save / load cross-agent context** |

### Setup
```bash
npx nia-wizard@latest
```

### Key OSS references
- [nozomio-labs/nia-wizard](https://github.com/nozomio-labs/nia-wizard) — install pattern
- [nozomio-labs/nia-opencode](https://github.com/nozomio-labs/nia-opencode) — full tool surface example
- [nozomio-labs/nia-plugin](https://github.com/nozomio-labs/nia-plugin) — Claude Code plugin
- [nozomio-labs/nia-rules-for-agents](https://github.com/nozomio-labs/nia-rules-for-agents) — prompt patterns telling an agent when to call which tool
- [Show HN discussion](https://news.ycombinator.com/item?id=44671601)

---

## 2. Hyperspell (hyperspell.com)

**Company:** YC-backed, "memory & context layer for AI agents"
**Positioning:** Persistent memory + RAG store for agents — ingest data, get a queryable knowledge graph, agents read it as if it were a filesystem.
**Form factor:** Managed API + SDKs (Python, Node, Go) + CLI

### Connectors
- `vault` (manually-added documents — your escape hatch for scraped LinkedIn / market data)
- `slack`
- `gmail`
- `google_calendar`
- Hyperspell Connect (OAuth flow letting end-users link their own accounts)

### SDK shape

```python
from hyperspell import Hyperspell

client = Hyperspell(api_key="API_KEY", user_id="team_42")

# Ingest
client.memories.add_bulk([
    {"content": "...", "metadata": {"type": "linkedin", "team_id": "42"}},
])

# Query — returns chunks
results = client.memories.search(query="...", sources=["vault"])

# Query — returns LLM-synthesized answer (RAG)
answer = client.memories.search(
    query="How would judge X react to fintech idea Y?",
    sources=["vault"],
    answer=True,
)
```

### Key OSS references
- [hyperspell/python-sdk](https://github.com/hyperspell) · [node-sdk](https://github.com/hyperspell) · [hyperspell-go](https://github.com/hyperspell)
- [hyperspell/claude](https://github.com/hyperspell/claude) — Claude Code plugin marketplace; install via `/plugin marketplace add hyperspell/claude`
- [hyperspell/hyperspell-openclaw](https://github.com/hyperspell) — 96★ agent integration plugin (good wiring reference)
- [hyperspell/airweave](https://github.com/hyperspell) — open-source context retrieval layer (forked)

### Compliance
GDPR, SOC 2 · stores summaries not raw data · doesn't train on user data.

---

## 3. Apify

**Positioning:** External data collection layer for public web, LinkedIn-style profiles, company pages, directories, and market pages.

### What it scrapes
- Team member LinkedIn/public profiles
- Company/personal websites
- Judge bios and profile pages
- Competitor/product pages
- Product Hunt, directories, app marketplaces, review sites, and search result pages

### Role in this system

Apify does not own state. It produces raw scrape results that are normalized by an ingestion worker, saved as raw/source metadata in MongoDB when useful, and summarized into Hyperspell as evidence.

```txt
Apify actor run
→ raw dataset
→ normalizer
→ MongoDB scrape_runs / optional raw refs
→ Hyperspell memories.add_bulk(...)
```

### LinkedIn handling

Use Apify for public profile/company-page enrichment where permitted. Store only the fields we need for scoring:
- name
- headline/current role
- company/school
- relevant experience
- founder/domain signals
- public URL
- scrape timestamp/source

Do not make LinkedIn raw HTML the product source of truth. Hyperspell should receive concise summaries and attribution metadata.

---

## 4. MongoDB / Prisma operational database

MongoDB is the app database, not the long-term reasoning memory. It stores the data the product needs to load fast and the durable records the user expects to see in Atlas.

### Collections

| Collection | Purpose |
|---|---|
| `submissions` | Raw team form submissions |
| `teams` | Display-ready team cards and cached scoring outputs |
| `judges` | Hackathon judges, bios, links, preference summaries |
| `criteria` | Hackathon scoring rubric / event-specific judging criteria |
| `scrape_runs` | Optional Apify/Nia run metadata, source URLs, status, timestamps |
| `score_runs` | Optional agent run outputs and versioned scoring snapshots |

### App flow

```txt
participant-form submit
→ MongoDB saves raw team submission
→ MongoDB stores hackathon judges + criteria
→ Team Profiler writes team memory to Hyperspell
→ Apify scrapes LinkedIn/public profile + market pages
→ Nia researches judges/markets/competitors
→ cleaned findings are written into Hyperspell
→ scoring agents read Hyperspell
→ final scores are cached back into MongoDB teams
→ swipe UI reads MongoDB only
```

---

## 5. Mapping to "Bet the Hackers"

### Product → Tool mapping

| Product feature | Tool / call |
|---|---|
| Save team submission | MongoDB `submissions` |
| Save judges + criteria | MongoDB `judges`, `criteria` |
| Fast swipe UI reads | MongoDB `teams` |
| Scrape LinkedIn/public team signals | Apify actor → normalized summary → Hyperspell |
| Scrape judge/public market pages | Apify actor → normalized summary → Hyperspell |
| Index team's GitHub if provided | `nia.index(repo_url)` |
| "Did they actually build this?" signal if repo exists | `nia.nia_grep` + `nia.nia_explore` |
| Market analysis (deep research) | `nia.nia_research` in `oracle` mode |
| Judge bios + past winners + scraped LinkedIn + market reports | Hyperspell `vault` (`memories.add_bulk`) |
| Judge-fit scoring | `memories.search(query, answer=True, sources=["vault"])` |
| Peer comparison ranking | Hyperspell query across all teams' profile memories |
| Visual cue / card copy | Generated by Ranker agent reading from Hyperspell, cached to MongoDB |
| Cross-agent evidence state | Hyperspell per-team namespace |

### Multi-agent topology

```
┌───────────────────────┐
│ MongoDB / Prisma      │
│ submissions, teams,   │
│ judges, criteria,     │
│ cached final scores   │
└───────────┬───────────┘
            │ raw records + fast app reads
            ▼
┌───────────────────────┐
│ Hyperspell            │
│ per-team memories,    │
│ judge KB, market KB,  │
│ scraped evidence,     │
│ scoring reasoning     │
└─────┬───────────┬─────┘
      │           │
      │           ├──────────────┐
      ▼           ▼              ▼
┌──────────┐ ┌──────────┐ ┌────────────┐
│ Agents   │ │ Nia      │ │ Apify      │
│ score +  │ │ market / │ │ LinkedIn + │
│ rank     │ │ judge    │ │ web scrape │
└────┬─────┘ │ research │ └─────┬──────┘
     │       └────┬─────┘       │
     │ findings   │ findings    │ cleaned findings
     └────────────┴─────────────┘
                  │
                  ▼
          Hyperspell evidence
                  │
                  ▼
          MongoDB cached scores
```

### Agent contracts (suggested)

```ts
type TeamProfile = {
  team_id: string;
  idea: string;
  members: { name: string; linkedin_url: string; }[];
  github_repo?: string;
  industry: string;
  track: string;
};

type JudgeProfile = {
  judge_id: string;
  name: string;
  bio: string;
  public_urls: string[];
  preference_signals: string[];
};

type CriteriaProfile = {
  event_id: string;
  criteria: { name: string; weight_0_1: number; description: string; }[];
};

type TeamSignal = {
  team_id: string;
  source: "form" | "apify" | "nia" | "manual";
  signal_type: "team" | "judge" | "market" | "linkedin" | "competitor";
  summary: string;
  url?: string;
  confidence_0_1: number;
};

type CodeRealityScore = {
  team_id: string;
  maturity_0_10: number;       // commit count, test coverage, README depth
  pitch_alignment_0_10: number; // does code match the pitch?
  tech_stack: string[];
  notable_findings: string[];
};

type JudgeFitScore = {
  team_id: string;
  per_judge: { judge_id: string; fit_0_10: number; reasoning: string; }[];
  aggregate_0_10: number;
};

type MarketScore = {
  team_id: string;
  marketability_0_10: number;
  comparable_products: string[];
  risks: string[];
};

type FinalRanking = {
  team_id: string;
  rank: number;
  composite_0_10: number;
  competitiveness_0_10: number;
  judge_fit_0_10: number;
  marketability_0_10: number;
  card_blurb: string;          // shown on swipe card
  visual_cues: string[];       // tags / badges
};
```

### Scoring philosophy

LLM-only ranking will feel arbitrary on a swipe UI where users compare cards side-by-side. Use a **hybrid**:
1. Each agent emits a structured 0–10 score + reasoning.
2. A deterministic weighted sum produces the rank: e.g., `0.4·judge_fit + 0.35·marketability + 0.25·competitiveness`. If GitHub exists, fold code-reality into competitiveness.
3. Reasoning strings populate the card so the score is defensible.

---

## 4. Gaps & Risks

| Gap | Mitigation |
|---|---|
| LinkedIn scraping can be brittle / restricted | Use Apify for public profile enrichment, store summaries + source URLs, keep manual fallback |
| Hyperspell pricing is invite-only (`hello@hyperspell.com`) | Email today citing the hackathon; YC companies routinely grant credits |
| Nia free tier not specified | `npx nia-wizard@latest` works out of the box; check rate limits early |
| Judge data may be sparse | Pad with public talks, podcast transcripts, Twitter, past judge comments — all goes into `vault` |
| Many teams may not submit code | Treat Nia repo indexing as optional; use Nia for judge/market research by default |
| Apify run latency | Trigger scrape asynchronously after submission; show pending score until complete |

---

## 5. Build order (suggested for a hackathon weekend)

1. **MongoDB/Prisma baseline** — save raw team submissions, judges, criteria, and cached card scores.
2. **Apify account + actors** — scrape public LinkedIn/profile pages and market pages; normalize outputs.
3. **Hyperspell account** — write form data, judge data, criteria, and Apify summaries into memory.
4. **Nia account** — use deep research for judge and market context; use repo indexing only when a GitHub URL exists.
5. **Profiler agent** — reads MongoDB submission, writes structured team memory to Hyperspell.
6. **Judge KB ingestion** — Apify + Nia gather judge bios/preferences → Hyperspell.
7. **Market agent** — Apify + Nia gather competitors, category, scale signals → Hyperspell.
8. **Competitiveness + Judge-fit + Marketability agents** — read Hyperspell, emit 0–100 scores + reasons.
9. **Ranker** — deterministic weighted sum, writes final score/card copy to MongoDB `teams`.
10. **Tinder UI** — reads MongoDB only for fast cards.

---

## 6. Sources

- [Nia – Context for AI Agents](https://www.trynia.ai/)
- [Nia MCP install docs](https://docs.trynia.ai/integrations/nia-mcp)
- [nozomio-labs/nia-wizard](https://github.com/nozomio-labs/nia-wizard)
- [nozomio-labs/nia-opencode](https://github.com/nozomio-labs/nia-opencode)
- [nozomio-labs/nia-plugin](https://github.com/nozomio-labs/nia-plugin)
- [nozomio-labs/nia-rules-for-agents](https://github.com/nozomio-labs/nia-rules-for-agents)
- [Show HN: Nia MCP server](https://news.ycombinator.com/item?id=44671601)
- [Hyperspell home](https://www.hyperspell.com/)
- [Hyperspell GitHub org](https://github.com/hyperspell)
- [Hyperspell integration docs](https://docs.hyperspell.com/core/integration)
- [Hyperspell on YC](https://www.ycombinator.com/companies/hyperspell)

# Bet the Hackers

A Tinder-style swipe app where each card is a hackathon team. Swipe right on who you think will win until one team remains. Behind the swipe deck is a multi-agent pipeline that scores every team on three pillars — **competitiveness**, **judge fit**, and **marketability** — and rolls them up into a single 0–100 likelihood-of-winning number.

> Built at the Nozomio + Hyperspell hackathon. Stack: Next.js 16 · MongoDB · OpenAI · Apify · Nia · Hyperspell.

---

## What it does

1. **Participants submit** their team via QR-code form: pitch, track, industry, "why we're working on this", and LinkedIn URLs for each member.
2. **Judges submit** their profile separately — name, company, LinkedIn, and what they're looking for in a winner.
3. **Agent pipeline** enriches each team with public LinkedIn data (Apify) + market research (Nia), stores the evidence in a memory layer (Hyperspell), then runs three LLM-graded scoring agents (OpenAI) and a deterministic ranker.
4. **Swipe deck** at `/` shows team cards with the cached scores and visual cues.
5. **Agent dashboard** at `/agent-dashboard` visualizes the knowledge graph, integration health, recent evidence, and per-team score breakdowns.

---

## Architecture

```
   ┌────────── Three data pillars ──────────┐
   │  Team data      Judge data    Market   │
   │  (form)         (form)        (web)    │
   └──────┬─────────────┬─────────────┬─────┘
          ▼             ▼             ▼
   ┌─────────────────────────────────────────┐
   │  MongoDB                                │
   │   submissions · judges · scores         │
   └──────┬──────────────────────────────────┘
          │
          ▼ enrichment
   ┌─────────────┐    ┌────────────┐
   │   Apify     │    │    Nia     │
   │  LinkedIn   │    │  web/oracle│
   └──────┬──────┘    └──────┬─────┘
          │                  │
          └────────┬─────────┘
                   ▼
            ┌──────────────┐
            │  Hyperspell  │  evidence layer (with Mongo `evidence` fallback)
            └──────┬───────┘
                   │ read
       ┌───────────┼───────────┐
       ▼           ▼           ▼
   Profiler   Marketability  Judge-fit
                 (OpenAI)     (OpenAI)
                   │           │
                   └─────┬─────┘
                         ▼
               Competitiveness (OpenAI, reads field)
                         │
                         ▼
                  Ranker (deterministic)
                         │
                         ▼
                  MongoDB `scores`  →  Swipe UI
```

**Why this shape:**
- MongoDB is the structured source of truth (forms, scores, dashboard counts).
- Hyperspell holds free-text evidence so agents do RAG instead of every-call scraping.
- Nia handles market/research; Apify handles LinkedIn (Nia can't scrape that).
- Ranker is deterministic so the swipe ranking is defensible and tunable.
- Each external integration has a stub fallback — the dashboard works end-to-end with zero API keys.

---

## Routes

### Pages
| Path | What it does |
|---|---|
| `/` | Tinder-style swipe deck |
| `/participant-form` | Team submission (text inputs + dynamic LinkedIn rows) |
| `/hackathon-judge-form` | Judge panel submission (shared "competition requirements" + N judges) |
| `/qr` | Fullscreen QR code pointing to `/participant-form`, projector-friendly |
| `/agent-dashboard` | Live knowledge graph, integration status, scores, evidence |

### API
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/submissions` | Save a participant team |
| `POST` | `/api/judges` | Save the judging panel (one shared `competitionRequirements` + many judges) |
| `GET` | `/api/teams` | Read teams for the swipe deck |
| `POST` | `/api/score/[teamId]` | Score one team end-to-end |
| `POST` | `/api/score/all` | Score every submission (idempotent) |
| `GET` | `/api/score/all` | Read cached scores |
| `GET` | `/api/agent-dashboard` | Counts, integration modes, scores, recent evidence |

---

## Data model (MongoDB)

| Collection | Written by | Shape (fields that matter) |
|---|---|---|
| `submissions` | participant form | `publicId, teamName, projectDescription, track, industry, insights, members[{name,linkedin}], createdAt` |
| `judges` | judge form | `publicId, name, company, linkedin, competitionRequirements, createdAt` |
| `scores` | scoring pipeline | `teamId, teamName, imageUrl, competitiveness, judgeFit, marketability, overall, blurbs{...}, steps[], scoredAt` |
| `evidence` | Hyperspell fallback | `namespace, key, source, content, metadata, storedAt` |
| `teams` | legacy / fallback seed | full `TeamProfile` shape used by the swipe deck (image, color, etc.) |

The Prisma schema in `prisma/schema.prisma` mirrors `submissions` and `teams` for typed access if you want it. Submissions and judges currently use the raw MongoDB driver via `lib/mongodb.ts` (`getMongoClient()`).

---

## Agents

Code lives under `lib/agents/`.

| Agent | File | Inputs | Output |
|---|---|---|---|
| **Profiler** | `profiler.ts` | submission, Apify | `EnrichedTeam` (members + headlines) + writes evidence + calls image generation |
| **Marketability** | `marketability.ts` | enriched team, Nia, OpenAI | `{score_0_10, comparables[], risks[], blurb}` |
| **Judge-Fit** | `judge-fit.ts` | enriched team, judges from Mongo, OpenAI | `{score_0_10, perJudge[], blurb}` |
| **Competitiveness** | `competitiveness.ts` | focal team + all teams, OpenAI | `{score_0_10, rank, blurb}` |
| **Ranker** | `ranker.ts` | the three scores | `overall = round(35·comp + 35·judge + 30·market) / 10` |
| **Pipeline** | `pipeline.ts` | teamId | orchestrates the above, persists to `scores` |

**Stub fallback:** every integration has a heuristic mode that runs when its env var is missing. So you can demo the whole flow with zero keys — scores come from string-length / keyword-overlap heuristics, images become deterministic gradient SVGs.

**Image generation:** Profiler calls DALL-E 3 (`OPENAI_IMAGE_MODEL=dall-e-3`) to generate a 1024×1024 cover for each team. Idempotent — saved to `public/team-images/{teamId}.png` and reused on re-scoring. Stub mode produces a colored SVG with team initials.

---

## Setup

### 1. Prereqs
- Node ≥ 20.19 (Prisma 7 needs it; pin via `.nvmrc`)
- bun (the repo uses `bun.lock`)
- A MongoDB Atlas cluster (free tier is fine)

### 2. Install
```bash
nvm use            # picks up .nvmrc → node 22
bun install
bunx prisma generate    # only if you use the Prisma client paths
```

### 3. Environment
Copy `.env.example` → `.env.local` and fill in keys. Minimum to run:
```bash
MONGODB_URI="mongodb+srv://USER:PASS@CLUSTER.mongodb.net/bet-the-hack"
```
Without anything else, every integration runs in **stub mode** and the dashboard still works end-to-end.

To unlock live agents, add any of:
| Env var | What flips on | Cost note |
|---|---|---|
| `OPENAI_API_KEY` | All three scoring agents (heuristic → real LLM) | ~$0.01–0.05 / team with `gpt-4o-mini` |
| `OPENAI_IMAGE_MODEL` (default `dall-e-3`) | Real DALL-E covers instead of SVG avatars | ~$0.04 / team, cached |
| `APIFY_TOKEN` + `APIFY_LINKEDIN_ACTOR` | Real LinkedIn enrichment in Profiler | per-actor pricing; first run requires approving actor permissions in the Apify console |
| `NIA_API_KEY` | Real market research (`/web-search`) instead of placeholder | tier-based |
| `HYPERSPELL_API_KEY` | Real RAG memory; Mongo `evidence` fallback otherwise | invite-only beta |

### 4. Run
```bash
bun run dev
```
Open http://localhost:3000.

---

## Demo flow

1. Project the QR page on a screen: http://localhost:3000/qr
2. Participants scan → submit teams via `/participant-form`
3. Open `/hackathon-judge-form` once and add the judging panel
4. Open `/agent-dashboard` → click **Score all teams** (~30s × N teams in fully-live mode, ~2s each in stub)
5. Open `/` → swipe through the cards until one team remains

Re-running the scorer is cheap: image generation is idempotent, MongoDB does an upsert by `teamId`, only the LLM calls re-spend tokens.

---

## Project layout

```
bet-the-hackers/
├── app/
│   ├── page.tsx                          # swipe deck
│   ├── participant-form/page.tsx
│   ├── hackathon-judge-form/page.tsx
│   ├── qr/page.tsx
│   ├── agent-dashboard/page.tsx          # knowledge graph viz
│   ├── globals.css
│   └── api/
│       ├── submissions/route.ts
│       ├── judges/route.ts
│       ├── teams/route.ts
│       ├── score/[teamId]/route.ts
│       ├── score/all/route.ts
│       └── agent-dashboard/route.ts
├── lib/
│   ├── mongodb.ts                        # getMongoClient()
│   ├── prisma.ts                         # singleton Prisma client
│   ├── submissions.ts                    # client-safe types + validator
│   ├── submissions-server.ts             # createSubmission()
│   ├── judges.ts                         # types + validator
│   ├── judges-server.ts                  # createJudges()
│   ├── teams.ts                          # TeamProfile + fallback seed
│   └── agents/
│       ├── types.ts
│       ├── pipeline.ts                   # orchestrator
│       ├── profiler.ts
│       ├── marketability.ts
│       ├── judge-fit.ts
│       ├── competitiveness.ts
│       ├── ranker.ts
│       └── integrations/
│           ├── openai.ts                 # llmJson (chat completions, JSON mode)
│           ├── openai-image.ts           # DALL-E 3 / SVG fallback
│           ├── apify.ts                  # LinkedIn scraper
│           ├── nia.ts                    # /web-search
│           └── hyperspell.ts             # /memories/add + /memories/query
├── prisma/
│   └── schema.prisma                     # Team + Submission models
├── public/
│   ├── nozomio-logo.png
│   └── team-images/                      # generated (gitignored)
├── .env.example
├── .env.local                            # not committed
├── .nvmrc                                # pins to node 22
├── next.config.mjs
└── package.json
```

---

## Scripts

```bash
bun run dev              # Next dev server (webpack mode)
bun run build            # production build
bun run start            # production server
bun run typecheck        # tsc --noEmit
bun run prisma:generate  # regenerate Prisma client after schema edits
bun run prisma:push      # sync schema to MongoDB (creates indexes)
bun run prisma:seed      # seed the teams collection
bun run prisma:studio    # Prisma Studio data browser
```

---

## Operational notes

- **Auto-refresh:** the agent dashboard polls `/api/agent-dashboard` every 8s. That endpoint reads MongoDB only — no external API calls — so the polling is free.
- **Cost per scoring run:** ~$0.10–0.15 / team end-to-end (LLM + DALL-E first generation). Re-runs skip DALL-E.
- **Idempotency:** images are cached on disk, scores upsert by `teamId`. Click **Score all teams** as many times as you want.
- **Failure isolation:** if Apify (or any integration) errors, the pipeline logs and continues with a degraded value rather than crashing the whole run.
- **Image storage:** local disk (`public/team-images/`). For Vercel/serverless deploys, swap to S3 / Vercel Blob / R2 since `public/` is read-only at runtime there.

---

## Security checklist before sharing or deploying

- Rotate every API key that has appeared in any chat / commit / log.
- Confirm `.env.local` is gitignored (it is).
- Confirm `public/team-images/` is gitignored (it is).
- Switch image storage off local disk before deploying to a serverless host.
- Lock down MongoDB Atlas IP allowlist; the dev tier defaults to `0.0.0.0/0`.

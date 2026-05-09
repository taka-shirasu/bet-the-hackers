# Bet the Hackers — Full Integration

A Tinder-style hackathon betting app. Swipe right on teams you think will win, place bets with credits, and compete on the leaderboard.

Built on the **bet-the-hackers** frontend with **Nia** (AI research) + **Hyperspell** (memory layer) backend + 5 betting features.

## Features

1. **Bet Modal** — swiping right opens a bottom-sheet with a bet slider, credits display, and payout calculator
2. **Dynamic Probability** — each swipe nudges win odds via dampened blending (85% old + 15% new ratio)
3. **Portfolio Sidebar** — persistent view of your credits, running bets, and total potential payout
4. **Leaderboard Reveal** — between rounds, see who bet what and current standings
5. **Social Proof** — "8 others bet on this team", popularity bars, and trending badges on cards

## What's Integrated

### Nia (Research & Context)

- **Tracer** — searches public GitHub repos to analyze hackathon project code
- **Oracle** — queries indexed documentation and data sources for grounded research
- **AI SDK Tools** — Nia runs as tools inside `generateText()` / `streamText()` calls

### Hyperspell (Memory & Preferences)

- **Bet Memory** — stores every bet a user places with project details and tech stack
- **Swipe Memory** — tracks swipe history (left = skip, right = interested)
- **Preference Search** — retrieves user patterns to power personalized recommendations
- **RAG Answers** — asks questions about a user's history and gets AI-generated answers

## Project Structure

```
app/
├── api/
│   ├── chat/route.ts              # Combined AI chat (Nia + Hyperspell)
│   ├── nia/
│   │   ├── research/route.ts      # Stream Nia Tracer/Oracle research
│   │   └── insights/route.ts      # Generate project insights via Nia tools
│   └── hyperspell/
│       ├── memory/route.ts        # Store bets and swipes in memory
│       └── search/route.ts        # Search user memory / get preferences
├── globals.css                    # All styling (vanilla CSS)
├── layout.tsx
└── page.tsx                       # Main app — swipe cards + betting UI
hooks/
├── use-team-insights.ts           # React hook for Nia project insights
└── use-betting-memory.ts          # React hook for Hyperspell memory
lib/
├── nia.ts                         # Nia SDK wrapper (tools, streaming)
└── hyperspell.ts                  # Hyperspell SDK wrapper (memory, search)
types/
└── index.ts                       # Shared TypeScript types (Bet, Portfolio, Leaderboard)
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:

- **NIA_API_KEY** — sign up at [trynia.ai](https://www.trynia.ai/)
- **HYPERSPELL_API_KEY** — sign up at [app.hyperspell.com](https://app.hyperspell.com/)
- **OPENAI_API_KEY** — for the AI SDK chat model

### 3. Run the dev server

```bash
npm run dev
```

## API Reference

### `POST /api/nia/research`

Streams Nia research events for a hackathon project.

```json
{
  "query": "How does this project handle real-time updates?",
  "repositories": ["user/repo"],
  "mode": "tracer"
}
```

### `POST /api/nia/insights`

Generates AI-powered insights about a project.

```json
{
  "projectName": "RealtimeVote",
  "projectDescription": "A live voting app for hackathon demos",
  "repoUrl": "user/realtimevote",
  "techStack": ["Next.js", "Socket.io", "PostgreSQL"]
}
```

### `POST /api/hyperspell/memory`

Stores a bet or swipe action in Hyperspell memory.

```json
{
  "userId": "user-123",
  "type": "bet",
  "projectId": "proj-456",
  "projectName": "RealtimeVote",
  "direction": "win",
  "amount": 50,
  "techStack": ["Next.js", "Socket.io"]
}
```

### `POST /api/hyperspell/search`

Searches user memory or retrieves preferences.

```json
{
  "userId": "user-123",
  "query": "What projects did I bet on with React?",
  "mode": "search"
}
```

### `POST /api/chat`

AI chat combining Nia research + Hyperspell memory context.

```json
{
  "messages": [{ "role": "user", "content": "Should I bet on this React Native project?" }],
  "userId": "user-123",
  "repositories": ["user/repo"]
}
```

## React Hooks

### `useProjectInsights`

```tsx
const { insights, loading, error, fetchInsights } = useProjectInsights({
  projectName: "RealtimeVote",
  projectDescription: "A live voting app",
  repoUrl: "user/realtimevote",
  techStack: ["Next.js", "Socket.io"],
});
```

### `useBettingMemory`

```tsx
const { storeSwipe, storeBet, searchMemory, getPreferences, loading, error } =
  useBettingMemory({ userId: "user-123" });

// Store a right swipe
await storeSwipe({
  projectId: "proj-456",
  projectName: "RealtimeVote",
  direction: "right",
  techStack: ["Next.js"],
});

// Get user preferences
const prefs = await getPreferences();
```

## Credits

- **Frontend**: [taka-shirasu/bet-the-hackers](https://github.com/taka-shirasu/bet-the-hackers)
- **Nia integration**: [trynia.ai](https://www.trynia.ai/)
- **Hyperspell integration**: [hyperspell.com](https://hyperspell.com/)
- **Betting UI skeleton**: 5 features (bet modal, dynamic odds, portfolio, leaderboard, social proof)

# Hackathon Bet AI — Nia & Hyperspell Integration

A Next.js integration layer for a Tinder-like hackathon betting app. Users swipe left/right on hackathon projects and bet on who they think will win first prize.

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
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts              # Combined AI chat (Nia + Hyperspell)
│   │   ├── nia/
│   │   │   ├── research/route.ts      # Stream Nia Tracer/Oracle research
│   │   │   └── insights/route.ts      # Generate project insights via Nia tools
│   │   └── hyperspell/
│   │       ├── memory/route.ts        # Store bets and swipes in memory
│   │       └── search/route.ts        # Search user memory / get preferences
│   ├── layout.tsx
│   └── page.tsx
├── hooks/
│   ├── use-project-insights.ts        # React hook for Nia project insights
│   └── use-betting-memory.ts          # React hook for Hyperspell memory
├── lib/
│   ├── nia.ts                         # Nia SDK wrapper (tools, middleware, streaming)
│   └── hyperspell.ts                  # Hyperspell SDK wrapper (memory, search)
└── types/
    └── index.ts                       # Shared TypeScript types
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

## Merging Into Your Existing Project

To add these integrations to an existing Next.js app:

1. Copy `src/lib/nia.ts` and `src/lib/hyperspell.ts` into your `lib/` folder
2. Copy the API routes from `src/app/api/` into your `app/api/` folder
3. Copy the hooks from `src/hooks/` into your hooks folder
4. Copy the types from `src/types/` into your types folder
5. Install the dependencies:
   ```bash
   npm install @nozomioai/nia-ai-sdk ai @ai-sdk/openai zod hyperspell@0.35.0
   ```
6. Add the environment variables from `.env.example` to your `.env.local`

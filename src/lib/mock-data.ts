import type { HackathonProject, LeaderboardEntry } from "@/types";

export const STARTING_CREDITS = 1000;

export const MOCK_PROJECTS: HackathonProject[] = [
  {
    id: "proj-1",
    name: "RealtimeVote",
    description:
      "A live polling app for hackathon demos. Audience members vote in real-time and results animate on screen.",
    repoUrl: "https://github.com/team-alpha/realtimevote",
    teamMembers: ["Alice", "Bob", "Charlie"],
    techStack: ["Next.js", "Socket.io", "PostgreSQL"],
    submittedAt: "2026-05-09T10:00:00Z",
    winProbability: 0.35,
    totalSwipesRight: 42,
    totalSwipesLeft: 18,
    totalBettors: 8,
    round: 1,
  },
  {
    id: "proj-2",
    name: "SnapRecap",
    description:
      "AI-powered meeting summarizer that generates action items from uploaded recordings in seconds.",
    repoUrl: "https://github.com/team-beta/snaprecap",
    teamMembers: ["Dana", "Eli"],
    techStack: ["React", "Whisper API", "FastAPI", "Redis"],
    submittedAt: "2026-05-09T10:15:00Z",
    winProbability: 0.25,
    totalSwipesRight: 31,
    totalSwipesLeft: 29,
    totalBettors: 5,
    round: 1,
  },
  {
    id: "proj-3",
    name: "GreenRoute",
    description:
      "Carbon-aware route planner that optimizes deliveries for lowest emissions using real-time traffic and weather data.",
    teamMembers: ["Faye", "George", "Hana", "Ivan"],
    techStack: ["Next.js", "Mapbox", "Python", "TensorFlow"],
    submittedAt: "2026-05-09T10:30:00Z",
    winProbability: 0.2,
    totalSwipesRight: 22,
    totalSwipesLeft: 38,
    totalBettors: 3,
    round: 1,
  },
  {
    id: "proj-4",
    name: "CodeBuddy",
    description:
      "Pair programming AI that watches your editor in real-time, catches bugs before you run the code, and suggests refactors.",
    repoUrl: "https://github.com/team-delta/codebuddy",
    teamMembers: ["Jack", "Kim"],
    techStack: ["TypeScript", "VS Code Extension API", "GPT-4.1"],
    submittedAt: "2026-05-09T11:00:00Z",
    winProbability: 0.15,
    totalSwipesRight: 15,
    totalSwipesLeft: 25,
    totalBettors: 2,
    round: 1,
  },
  {
    id: "proj-5",
    name: "MoodBoard",
    description:
      "Collaborative design tool that generates UI mockups from text descriptions and mood keywords.",
    teamMembers: ["Luna", "Max", "Nora"],
    techStack: ["Svelte", "Stable Diffusion", "Supabase"],
    submittedAt: "2026-05-09T11:15:00Z",
    winProbability: 0.05,
    totalSwipesRight: 8,
    totalSwipesLeft: 42,
    totalBettors: 1,
    round: 1,
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    userId: "user-1",
    displayName: "CryptoKing99",
    totalBets: 5,
    totalSpent: 450,
    potentialPayout: 1280,
    topPick: "RealtimeVote",
  },
  {
    userId: "user-2",
    displayName: "HackQueen",
    totalBets: 3,
    totalSpent: 300,
    potentialPayout: 900,
    topPick: "SnapRecap",
  },
  {
    userId: "user-3",
    displayName: "BetaMaster",
    totalBets: 4,
    totalSpent: 380,
    potentialPayout: 760,
    topPick: "RealtimeVote",
  },
  {
    userId: "user-current",
    displayName: "You",
    totalBets: 0,
    totalSpent: 0,
    potentialPayout: 0,
    topPick: "-",
  },
];

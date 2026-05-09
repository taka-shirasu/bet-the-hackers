export interface HackathonProject {
  id: string;
  name: string;
  description: string;
  repoUrl?: string;
  teamMembers: string[];
  techStack: string[];
  submittedAt: string;
  winProbability: number;
  totalSwipesRight: number;
  totalSwipesLeft: number;
  totalBettors: number;
  round: number;
}

export interface Bet {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  amount: number;
  direction: "win" | "skip";
  potentialPayout: number;
  createdAt: string;
}

export interface ProjectInsight {
  projectId: string;
  summary: string;
  strengths: string[];
  risks: string[];
  techAnalysis: string;
  confidence: number;
}

export interface UserBettingMemory {
  userId: string;
  totalBets: number;
  winRate: number;
  preferredTechStacks: string[];
  recentBets: Bet[];
}

export interface UserPortfolio {
  credits: number;
  totalSpent: number;
  potentialPayout: number;
  bets: Bet[];
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  totalBets: number;
  totalSpent: number;
  potentialPayout: number;
  topPick: string;
}

export interface RoundResult {
  round: number;
  leaderboard: LeaderboardEntry[];
  topProject: HackathonProject;
  totalBetsPlaced: number;
  isRevealed: boolean;
}

export type SwipeDirection = "left" | "right";

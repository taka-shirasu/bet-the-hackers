export interface HackathonProject {
  id: string;
  name: string;
  description: string;
  repoUrl?: string;
  teamMembers: string[];
  techStack: string[];
  submittedAt: string;
}

export interface Bet {
  id: string;
  userId: string;
  projectId: string;
  amount: number;
  direction: "win" | "skip";
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

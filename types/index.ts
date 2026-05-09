export interface Bet {
  id: string;
  userId: string;
  teamId: number;
  teamName: string;
  amount: number;
  potentialPayout: number;
  winProbability: number;
  createdAt: string;
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

"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type {
  Bet,
  HackathonProject,
  UserPortfolio,
  SwipeDirection,
} from "@/types";
import { MOCK_PROJECTS, STARTING_CREDITS } from "@/lib/mock-data";

// --- State ---

interface BettingState {
  projects: HackathonProject[];
  currentIndex: number;
  portfolio: UserPortfolio;
  currentRound: number;
  showBetModal: boolean;
  showLeaderboard: boolean;
  pendingProject: HackathonProject | null;
}

const initialState: BettingState = {
  projects: MOCK_PROJECTS,
  currentIndex: 0,
  portfolio: {
    credits: STARTING_CREDITS,
    totalSpent: 0,
    potentialPayout: 0,
    bets: [],
  },
  currentRound: 1,
  showBetModal: false,
  showLeaderboard: false,
  pendingProject: null,
};

// --- Actions ---

type BettingAction =
  | { type: "SWIPE"; direction: SwipeDirection }
  | { type: "OPEN_BET_MODAL"; project: HackathonProject }
  | { type: "CLOSE_BET_MODAL" }
  | { type: "PLACE_BET"; projectId: string; amount: number }
  | { type: "SKIP_BET" }
  | { type: "SHOW_LEADERBOARD" }
  | { type: "HIDE_LEADERBOARD" }
  | { type: "NEXT_ROUND" };

// --- Probability helpers ---

function calculatePayout(amount: number, winProbability: number): number {
  const odds = 1 / Math.max(winProbability, 0.01);
  return Math.round(amount * odds * 0.9);
}

function nudgeProbability(
  projects: HackathonProject[],
  projectId: string,
  direction: SwipeDirection,
): HackathonProject[] {
  return projects.map((p) => {
    if (p.id !== projectId) return p;

    const newRight =
      p.totalSwipesRight + (direction === "right" ? 1 : 0);
    const newLeft =
      p.totalSwipesLeft + (direction === "left" ? 1 : 0);
    const total = newRight + newLeft;
    const rawProb = total > 0 ? newRight / total : 0.5;

    // Blend toward the raw ratio but dampen large swings
    const newProb = p.winProbability * 0.85 + rawProb * 0.15;

    return {
      ...p,
      totalSwipesRight: newRight,
      totalSwipesLeft: newLeft,
      winProbability: Math.min(Math.max(newProb, 0.01), 0.99),
      totalBettors:
        direction === "right" ? p.totalBettors + 1 : p.totalBettors,
    };
  });
}

// --- Reducer ---

function bettingReducer(
  state: BettingState,
  action: BettingAction,
): BettingState {
  switch (action.type) {
    case "SWIPE": {
      const project = state.projects[state.currentIndex];
      if (!project) return state;

      const updatedProjects = nudgeProbability(
        state.projects,
        project.id,
        action.direction,
      );

      if (action.direction === "right") {
        return {
          ...state,
          projects: updatedProjects,
          showBetModal: true,
          pendingProject: updatedProjects.find((p) => p.id === project.id)!,
        };
      }

      const nextIndex = state.currentIndex + 1;
      const roundOver = nextIndex >= state.projects.length;

      return {
        ...state,
        projects: updatedProjects,
        currentIndex: nextIndex,
        showLeaderboard: roundOver,
      };
    }

    case "OPEN_BET_MODAL":
      return {
        ...state,
        showBetModal: true,
        pendingProject: action.project,
      };

    case "CLOSE_BET_MODAL":
      return { ...state, showBetModal: false, pendingProject: null };

    case "PLACE_BET": {
      if (!state.pendingProject) return state;

      const project = state.projects.find(
        (p) => p.id === action.projectId,
      );
      if (!project) return state;
      if (action.amount > state.portfolio.credits) return state;

      const payout = calculatePayout(action.amount, project.winProbability);
      const bet: Bet = {
        id: `bet-${Date.now()}`,
        userId: "user-current",
        projectId: action.projectId,
        projectName: project.name,
        amount: action.amount,
        direction: "win",
        potentialPayout: payout,
        createdAt: new Date().toISOString(),
      };

      const nextIndex = state.currentIndex + 1;
      const roundOver = nextIndex >= state.projects.length;

      return {
        ...state,
        portfolio: {
          ...state.portfolio,
          credits: state.portfolio.credits - action.amount,
          totalSpent: state.portfolio.totalSpent + action.amount,
          potentialPayout: state.portfolio.potentialPayout + payout,
          bets: [...state.portfolio.bets, bet],
        },
        currentIndex: nextIndex,
        showBetModal: false,
        pendingProject: null,
        showLeaderboard: roundOver,
      };
    }

    case "SKIP_BET": {
      const nextIndex = state.currentIndex + 1;
      const roundOver = nextIndex >= state.projects.length;

      return {
        ...state,
        currentIndex: nextIndex,
        showBetModal: false,
        pendingProject: null,
        showLeaderboard: roundOver,
      };
    }

    case "SHOW_LEADERBOARD":
      return { ...state, showLeaderboard: true };

    case "HIDE_LEADERBOARD":
      return { ...state, showLeaderboard: false };

    case "NEXT_ROUND":
      return {
        ...state,
        currentRound: state.currentRound + 1,
        currentIndex: 0,
        showLeaderboard: false,
      };

    default:
      return state;
  }
}

// --- Context ---

interface BettingContextValue {
  state: BettingState;
  swipe: (direction: SwipeDirection) => void;
  placeBet: (projectId: string, amount: number) => void;
  skipBet: () => void;
  closeBetModal: () => void;
  showLeaderboard: () => void;
  hideLeaderboard: () => void;
  nextRound: () => void;
  calculatePayout: (amount: number, winProbability: number) => number;
}

const BettingContext = createContext<BettingContextValue | null>(null);

export function BettingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bettingReducer, initialState);

  const swipe = useCallback(
    (direction: SwipeDirection) => dispatch({ type: "SWIPE", direction }),
    [],
  );
  const placeBet = useCallback(
    (projectId: string, amount: number) =>
      dispatch({ type: "PLACE_BET", projectId, amount }),
    [],
  );
  const skipBet = useCallback(() => dispatch({ type: "SKIP_BET" }), []);
  const closeBetModal = useCallback(
    () => dispatch({ type: "CLOSE_BET_MODAL" }),
    [],
  );
  const showLeaderboard = useCallback(
    () => dispatch({ type: "SHOW_LEADERBOARD" }),
    [],
  );
  const hideLeaderboard = useCallback(
    () => dispatch({ type: "HIDE_LEADERBOARD" }),
    [],
  );
  const nextRound = useCallback(
    () => dispatch({ type: "NEXT_ROUND" }),
    [],
  );

  return (
    <BettingContext.Provider
      value={{
        state,
        swipe,
        placeBet,
        skipBet,
        closeBetModal,
        showLeaderboard,
        hideLeaderboard,
        nextRound,
        calculatePayout,
      }}
    >
      {children}
    </BettingContext.Provider>
  );
}

export function useBetting(): BettingContextValue {
  const ctx = useContext(BettingContext);
  if (!ctx) {
    throw new Error("useBetting must be used within a BettingProvider");
  }
  return ctx;
}

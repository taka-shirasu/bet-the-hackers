"use client";

import { useState } from "react";
import type { HackathonProject } from "@/types";
import { SocialProof } from "./social-proof";

interface SwipeCardProps {
  project: HackathonProject;
  onSwipe: (direction: "left" | "right") => void;
}

export function SwipeCard({ project, onSwipe }: SwipeCardProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - startX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    if (dragX > 100) {
      onSwipe("right");
    } else if (dragX < -100) {
      onSwipe("left");
    }
    setDragX(0);
  };

  const rotation = dragX * 0.1;
  const opacity = Math.max(1 - Math.abs(dragX) / 400, 0.5);

  return (
    <div
      className="relative w-full max-w-sm mx-auto cursor-grab active:cursor-grabbing select-none touch-none"
      style={{
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        opacity,
        transition: isDragging ? "none" : "transform 0.3s ease, opacity 0.3s ease",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Swipe direction indicators */}
      {dragX > 50 && (
        <div className="absolute top-6 right-6 z-10 rounded-lg border-4 border-green-500 px-4 py-2 text-green-500 font-bold text-2xl -rotate-12">
          BET
        </div>
      )}
      {dragX < -50 && (
        <div className="absolute top-6 left-6 z-10 rounded-lg border-4 border-red-500 px-4 py-2 text-red-500 font-bold text-2xl rotate-12">
          SKIP
        </div>
      )}

      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
        {/* Header with probability badge */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{project.name}</h2>
              <p className="text-violet-200 text-sm mt-1">
                Round {project.round}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-full px-3 py-1.5 text-sm font-semibold">
              {Math.round(project.winProbability * 100)}% odds
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
            {project.description}
          </p>

          {/* Tech stack tags */}
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Team */}
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            Team: {project.teamMembers.join(", ")}
          </div>

          {/* Social proof */}
          <SocialProof
            totalBettors={project.totalBettors}
            totalSwipesRight={project.totalSwipesRight}
            totalSwipesLeft={project.totalSwipesLeft}
          />
        </div>

        {/* Action buttons */}
        <div className="flex border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => onSwipe("left")}
            className="flex-1 py-4 text-center text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            Skip
          </button>
          <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
          <button
            onClick={() => onSwipe("right")}
            className="flex-1 py-4 text-center text-green-500 font-semibold hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
          >
            Bet
          </button>
        </div>
      </div>
    </div>
  );
}

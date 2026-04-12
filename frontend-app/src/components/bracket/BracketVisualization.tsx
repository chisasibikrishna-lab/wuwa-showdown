"use client";
import React from "react";
import { BracketData } from "@/context/BracketContext";
import SingleEliminationBracket from "./SingleEliminationBracket";
import DoubleEliminationBracket from "./DoubleEliminationBracket";

interface BracketVisualizationProps {
  bracket: BracketData;
  isAdmin: boolean;
  onSelectWinner: (matchId: string, winnerSeed: number, score1?: number, score2?: number) => void;
  onUndoWinner: (matchId: string) => void;
  compact?: boolean;
}

export default function BracketVisualization({
  bracket, isAdmin, onSelectWinner, onUndoWinner, compact,
}: BracketVisualizationProps) {
  if (bracket.matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-zinc-600 text-lg mb-2">No matches generated yet</div>
        <p className="text-zinc-700 text-sm">Generate the bracket to see the tournament tree</p>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "overflow-x-auto overflow-y-visible pb-6"}>
      {bracket.type === "single" ? (
        <SingleEliminationBracket
          matches={bracket.matches}
          participants={bracket.participants}
          isAdmin={isAdmin}
          onSelectWinner={onSelectWinner}
          onUndoWinner={onUndoWinner}
        />
      ) : (
        <DoubleEliminationBracket
          matches={bracket.matches}
          participants={bracket.participants}
          isAdmin={isAdmin}
          onSelectWinner={onSelectWinner}
          onUndoWinner={onUndoWinner}
        />
      )}
    </div>
  );
}

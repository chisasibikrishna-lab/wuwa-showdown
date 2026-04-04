"use client";
import React from "react";
import { BracketMatch as MatchType, BracketParticipant } from "@/context/BracketContext";
import BracketMatch from "./BracketMatch";

interface BracketRoundProps {
  roundIndex: number;
  matches: MatchType[];
  participants: BracketParticipant[];
  totalRounds: number;
  isAdmin: boolean;
  onSelectWinner: (matchId: string, winnerSeed: number, score1?: number, score2?: number) => void;
  onUndoWinner: (matchId: string) => void;
  label?: string;
}

function getRoundLabel(roundIndex: number, totalRounds: number): string {
  const remaining = totalRounds - roundIndex;
  if (remaining === 1) return "Final";
  if (remaining === 2) return "Semifinals";
  if (remaining === 3) return "Quarterfinals";
  return `Round ${roundIndex + 1}`;
}

export default function BracketRound({
  roundIndex, matches, participants, totalRounds, isAdmin,
  onSelectWinner, onUndoWinner, label,
}: BracketRoundProps) {
  const sorted = [...matches].sort((a, b) => a.position - b.position);
  const roundLabel = label || getRoundLabel(roundIndex, totalRounds);

  return (
    <div className="flex flex-col items-center shrink-0">
      {/* Round header */}
      <div className="mb-4 text-center">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {roundLabel}
        </div>
        <div className="text-[10px] text-zinc-600 mt-0.5">
          {sorted.length} {sorted.length === 1 ? "match" : "matches"}
        </div>
      </div>

      {/* Matches */}
      <div className="flex flex-col justify-around flex-1 gap-4" style={{ minHeight: 0 }}>
        {sorted.map(match => (
          <div key={match.matchId} className="flex items-center">
            <BracketMatch
              match={match}
              participants={participants}
              isAdmin={isAdmin}
              onSelectWinner={onSelectWinner}
              onUndoWinner={onUndoWinner}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

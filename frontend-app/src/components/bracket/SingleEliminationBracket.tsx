"use client";
import React, { useRef } from "react";
import { BracketMatch, BracketParticipant } from "@/context/BracketContext";
import BracketRound from "./BracketRound";
import BracketConnectors from "./BracketConnectors";

interface SingleEliminationBracketProps {
  matches: BracketMatch[];
  participants: BracketParticipant[];
  isAdmin: boolean;
  onSelectWinner: (matchId: string, winnerSeed: number, score1?: number, score2?: number) => void;
  onUndoWinner: (matchId: string) => void;
}

export default function SingleEliminationBracket({
  matches, participants, isAdmin, onSelectWinner, onUndoWinner,
}: SingleEliminationBracketProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const winnersMatches = matches.filter(m => m.bracket === "winners");
  const rounds = new Map<number, BracketMatch[]>();
  for (const m of winnersMatches) {
    if (!rounds.has(m.round)) rounds.set(m.round, []);
    rounds.get(m.round)!.push(m);
  }

  const roundNums = [...rounds.keys()].sort((a, b) => a - b);
  const totalRounds = roundNums.length;

  return (
    <div ref={containerRef} className="relative inline-flex gap-12 items-stretch py-4">
      <BracketConnectors
        matches={winnersMatches}
        containerRef={containerRef}
        bracketFilter="winners"
      />

      {roundNums.map(roundIdx => (
        <BracketRound
          key={roundIdx}
          roundIndex={roundIdx}
          matches={rounds.get(roundIdx)!}
          participants={participants}
          totalRounds={totalRounds}
          isAdmin={isAdmin}
          onSelectWinner={onSelectWinner}
          onUndoWinner={onUndoWinner}
        />
      ))}
    </div>
  );
}

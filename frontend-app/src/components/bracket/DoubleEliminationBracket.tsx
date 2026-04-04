"use client";
import React, { useRef } from "react";
import { BracketMatch, BracketParticipant } from "@/context/BracketContext";
import BracketRound from "./BracketRound";
import BracketConnectors from "./BracketConnectors";
import BracketMatchComponent from "./BracketMatch";

interface DoubleEliminationBracketProps {
  matches: BracketMatch[];
  participants: BracketParticipant[];
  isAdmin: boolean;
  onSelectWinner: (matchId: string, winnerSeed: number, score1?: number, score2?: number) => void;
  onUndoWinner: (matchId: string) => void;
}

export default function DoubleEliminationBracket({
  matches, participants, isAdmin, onSelectWinner, onUndoWinner,
}: DoubleEliminationBracketProps) {
  const winnersRef = useRef<HTMLDivElement>(null);
  const losersRef = useRef<HTMLDivElement>(null);

  const winnersMatches = matches.filter(m => m.bracket === "winners");
  const losersMatches = matches.filter(m => m.bracket === "losers");
  const grandMatches = matches.filter(m => m.bracket === "grand");

  // Group winners by round
  const winnersRounds = new Map<number, BracketMatch[]>();
  for (const m of winnersMatches) {
    if (!winnersRounds.has(m.round)) winnersRounds.set(m.round, []);
    winnersRounds.get(m.round)!.push(m);
  }
  const winnersRoundNums = [...winnersRounds.keys()].sort((a, b) => a - b);

  // Group losers by round
  const losersRounds = new Map<number, BracketMatch[]>();
  for (const m of losersMatches) {
    if (!losersRounds.has(m.round)) losersRounds.set(m.round, []);
    losersRounds.get(m.round)!.push(m);
  }
  const losersRoundNums = [...losersRounds.keys()].sort((a, b) => a - b);
  const totalLosersRounds = losersRoundNums.length;

  return (
    <div className="space-y-10">
      {/* Winners Bracket */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Winners Bracket</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        </div>
        <div className="overflow-x-auto pb-4">
          <div ref={winnersRef} className="relative inline-flex gap-12 items-stretch py-4">
            <BracketConnectors matches={winnersMatches} containerRef={winnersRef} bracketFilter="winners" />
            {winnersRoundNums.map(roundIdx => (
              <BracketRound
                key={`w-${roundIdx}`}
                roundIndex={roundIdx}
                matches={winnersRounds.get(roundIdx)!}
                participants={participants}
                totalRounds={winnersRoundNums.length}
                isAdmin={isAdmin}
                onSelectWinner={onSelectWinner}
                onUndoWinner={onUndoWinner}
                label={`WB Round ${roundIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Losers Bracket */}
      {losersMatches.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-red-400">Losers Bracket</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
          </div>
          <div className="overflow-x-auto pb-4">
            <div ref={losersRef} className="relative inline-flex gap-12 items-stretch py-4">
              <BracketConnectors matches={losersMatches} containerRef={losersRef} bracketFilter="losers" />
              {losersRoundNums.map(roundIdx => (
                <BracketRound
                  key={`l-${roundIdx}`}
                  roundIndex={roundIdx}
                  matches={losersRounds.get(roundIdx)!}
                  participants={participants}
                  totalRounds={totalLosersRounds}
                  isAdmin={isAdmin}
                  onSelectWinner={onSelectWinner}
                  onUndoWinner={onUndoWinner}
                  label={`LB Round ${roundIdx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grand Final */}
      {grandMatches.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Grand Final</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
          <div className="flex gap-12 justify-center py-4">
            {grandMatches
              .sort((a, b) => a.matchId.localeCompare(b.matchId))
              .map((match, idx) => (
                <div key={match.matchId} className="flex flex-col items-center gap-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {idx === 0 ? "Grand Final" : "Reset Match"}
                  </div>
                  <BracketMatchComponent
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
      )}
    </div>
  );
}

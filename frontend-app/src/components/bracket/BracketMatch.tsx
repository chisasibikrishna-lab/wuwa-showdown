"use client";
import React, { useState, useRef, useEffect } from "react";
import { BracketMatch as MatchType, BracketParticipant } from "@/context/BracketContext";
import ParticipantSlot from "./ParticipantSlot";

interface BracketMatchProps {
  match: MatchType;
  participants: BracketParticipant[];
  isAdmin: boolean;
  onSelectWinner: (matchId: string, winnerSeed: number, score1?: number, score2?: number) => void;
  onUndoWinner: (matchId: string) => void;
}

export default function BracketMatch({
  match, participants, isAdmin, onSelectWinner, onUndoWinner,
}: BracketMatchProps) {
  const p1 = participants.find(p => p.seed === match.participant1Seed) || null;
  const p2 = participants.find(p => p.seed === match.participant2Seed) || null;

  const isReady = match.participant1Seed !== null && match.participant2Seed !== null;
  const isCompleted = match.status === "completed" || match.status === "bye";
  const canSelect = isAdmin && isReady && match.status !== "bye";

  const isBye1 = match.status === "bye" && match.participant1Seed === null;
  const isBye2 = match.status === "bye" && match.participant2Seed === null;

  // Score popover state
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [pendingWinnerSeed, setPendingWinnerSeed] = useState<number | null>(null);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!showScoreInput) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowScoreInput(false);
        setPendingWinnerSeed(null);
        setScore1("");
        setScore2("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showScoreInput]);

  const handleSlotClick = (clickedSeed: number | null) => {
    if (!clickedSeed) return;
    if (!canSelect) return;
    // Open score popover to edit winner/score
    setPendingWinnerSeed(clickedSeed);
    setScore1(match.score1?.toString() || "");
    setScore2(match.score2?.toString() || "");
    setShowScoreInput(true);
  };

  const handleConfirmWinner = () => {
    if (pendingWinnerSeed === null) return;
    const s1 = parseFloat(score1);
    const s2 = parseFloat(score2);
    onSelectWinner(
      match.matchId,
      pendingWinnerSeed,
      isNaN(s1) ? undefined : s1,
      isNaN(s2) ? undefined : s2
    );
    setShowScoreInput(false);
    setPendingWinnerSeed(null);
    setScore1("");
    setScore2("");
  };

  const pendingName = pendingWinnerSeed === match.participant1Seed ? p1?.name : p2?.name;
  const p1IsWinner = match.winnerSeed !== null && match.winnerSeed === match.participant1Seed;
  const p2IsWinner = match.winnerSeed !== null && match.winnerSeed === match.participant2Seed;

  return (
    <div
      data-match-id={match.matchId}
      className={`
        relative w-52 rounded-xl overflow-visible border transition-all duration-300
        ${showScoreInput ? "z-[100]" : "z-10"}
        ${isCompleted
          ? "bg-[#0a0a0c]/60 backdrop-blur-xl border-white/[0.08]"
          : isReady
            ? "bg-[#0a0a0c]/80 backdrop-blur-xl border-[#ffcc00]/40 shadow-[0_0_15px_rgba(255,204,0,0.15)]"
            : "bg-[#0a0a0c]/40 backdrop-blur-lg border-white/[0.05]"
        }
      `}
    >
      {/* Match header glow for ready matches */}
      {isReady && !isCompleted && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffcc00] to-transparent" />
      )}

      {/* Match slots container strictly for corner rounding */}
      <div className="rounded-xl overflow-hidden flex flex-col relative z-20">
        {/* Player 1 */}
        <div className="border-b border-white/[0.06]">
          <ParticipantSlot
            participant={p1}
            seed={match.participant1Seed}
            isWinner={p1IsWinner}
            isLoser={match.winnerSeed !== null && !p1IsWinner && match.participant1Seed !== null}
            isBye={isBye1}
            isClickable={canSelect || (isAdmin && p1IsWinner)}
            score={isCompleted && !isBye1 && !isBye2 ? match.score1 : undefined}
            onClick={() => handleSlotClick(match.participant1Seed)}
          />
        </div>

        {/* Player 2 */}
        <div>
          <ParticipantSlot
            participant={p2}
            seed={match.participant2Seed}
            isWinner={p2IsWinner}
            isLoser={match.winnerSeed !== null && !p2IsWinner && match.participant2Seed !== null}
            isBye={isBye2}
            isClickable={canSelect || (isAdmin && p2IsWinner)}
            score={isCompleted && !isBye1 && !isBye2 ? match.score2 : undefined}
            onClick={() => handleSlotClick(match.participant2Seed)}
          />
        </div>
      </div>

      {/* Score Input Popover */}
      {showScoreInput && (
        <div
          ref={popoverRef}
          className="absolute z-50 left-full top-1/2 -translate-y-1/2 ml-3 w-56
                     bg-[#111116] border border-white/[0.1] rounded-2xl
                     shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-4 "
        >
          <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-3">
            Set Score & Winner
          </div>
          <p className="text-white font-semibold text-sm mb-4 leading-tight">
            <span className="text-[#ffcc00]">{pendingName}</span> wins
          </p>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1">
              <label className="text-[10px] text-zinc-500 mb-1 block">
                {p1?.name || "P1"} score
              </label>
              <input
                type="number"
                min={0}
                value={score1}
                onChange={e => setScore1(e.target.value)}
                placeholder="—"
                className="w-full bg-white/[0.05] border border-white/[0.06] rounded-lg px-2 py-1.5
                           text-white text-sm text-center focus:outline-none focus:border-[#ffcc00]/40"
              />
            </div>
            <span className="text-zinc-500 text-sm mt-4">:</span>
            <div className="flex-1">
              <label className="text-[10px] text-zinc-500 mb-1 block">
                {p2?.name || "P2"} score
              </label>
              <input
                type="number"
                min={0}
                value={score2}
                onChange={e => setScore2(e.target.value)}
                placeholder="—"
                className="w-full bg-white/[0.05] border border-white/[0.06] rounded-lg px-2 py-1.5
                           text-white text-sm text-center focus:outline-none focus:border-[#ffcc00]/40"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowScoreInput(false);
                setPendingWinnerSeed(null);
              }}
              className="flex-1 py-1.5 rounded-lg text-xs text-zinc-400 bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmWinner}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-black bg-[#ffcc00] hover:bg-[#ffd633] transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

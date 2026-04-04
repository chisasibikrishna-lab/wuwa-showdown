"use client";
import React, { useMemo } from "react";
import { BracketMatch, BracketParticipant } from "@/context/BracketContext";
import { Trophy, Medal, TrendingUp, Swords, Target } from "lucide-react";

interface BracketPointsTableProps {
  matches: BracketMatch[];
  participants: BracketParticipant[];
  bracketType: "single" | "double";
}

interface ParticipantStats {
  seed: number;
  name: string;
  wins: number;
  losses: number;
  totalScore: number;
  matchesPlayed: number;
  points: number;
}

export default function BracketPointsTable({ matches, participants, bracketType }: BracketPointsTableProps) {
  const stats = useMemo(() => {
    const map = new Map<number, ParticipantStats>();

    // Initialize all participants
    for (const p of participants) {
      map.set(p.seed, {
        seed: p.seed,
        name: p.name,
        wins: 0,
        losses: 0,
        totalScore: 0,
        matchesPlayed: 0,
        points: 0,
      });
    }

    // Tally from completed matches
    for (const m of matches) {
      if (m.status !== "completed" || m.winnerSeed === null) continue;
      if (m.participant1Seed === null || m.participant2Seed === null) continue;

      const s1 = map.get(m.participant1Seed);
      const s2 = map.get(m.participant2Seed);

      if (s1) {
        s1.matchesPlayed++;
        s1.totalScore += m.score1;
        if (m.winnerSeed === m.participant1Seed) {
          s1.wins++;
        } else {
          s1.losses++;
        }
      }

      if (s2) {
        s2.matchesPlayed++;
        s2.totalScore += m.score2;
        if (m.winnerSeed === m.participant2Seed) {
          s2.wins++;
        } else {
          s2.losses++;
        }
      }
    }

    // Calculate points: 3 per win, 1 bonus per score point
    for (const s of map.values()) {
      s.points = s.wins * 3 + s.totalScore;
    }

    return [...map.values()].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.totalScore - a.totalScore;
    });
  }, [matches, participants]);

  if (participants.length === 0) return null;

  const getRankBadge = (idx: number) => {
    if (idx === 0) return (
      <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
        <Trophy size={14} className="text-primary" />
      </div>
    );
    if (idx === 1) return (
      <div className="w-7 h-7 rounded-lg bg-slate-300/10 flex items-center justify-center">
        <Medal size={14} className="text-slate-300" />
      </div>
    );
    if (idx === 2) return (
      <div className="w-7 h-7 rounded-lg bg-orange-400/10 flex items-center justify-center">
        <Medal size={14} className="text-orange-400" />
      </div>
    );
    return (
      <div className="w-7 h-7 rounded-lg bg-white/[0.03] flex items-center justify-center">
        <span className="text-xs font-mono text-zinc-500">{idx + 1}</span>
      </div>
    );
  };

  return (
    <div className="bg-[#0a0a0c]/40 backdrop-blur border border-white/[0.05] rounded-2xl p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={16} className="text-primary" />
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Points Table</h3>
        <span className="ml-auto text-[10px] text-zinc-500 uppercase tracking-wide font-medium">
          {bracketType === "double" ? "Double Elim" : "Single Elim"}
        </span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[2.5rem_1fr_4rem_4rem_4.5rem_4rem_5rem] gap-2 px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-semibold border-b border-white/[0.04]">
        <div>#</div>
        <div>Player</div>
        <div className="text-center">
          <Swords size={10} className="inline-block mr-1" />W
        </div>
        <div className="text-center">L</div>
        <div className="text-center">
          <Target size={10} className="inline-block mr-1" />Score
        </div>
        <div className="text-center">MP</div>
        <div className="text-right">Pts</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.03]">
        {stats.map((s, idx) => (
          <div
            key={s.seed}
            className={`grid grid-cols-[2.5rem_1fr_4rem_4rem_4.5rem_4rem_5rem] gap-2 px-3 py-2.5 items-center transition-colors hover:bg-white/[0.02] group
              ${idx === 0 && s.wins > 0 ? "bg-primary/[0.03]" : ""}
            `}
          >
            {/* Rank */}
            <div>{getRankBadge(idx)}</div>

            {/* Player Name */}
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-sm font-medium truncate ${idx === 0 && s.wins > 0 ? "text-primary" : "text-zinc-300"}`}>
                {s.name}
              </span>
            </div>

            {/* Wins */}
            <div className={`text-center text-sm font-semibold ${s.wins > 0 ? "text-emerald-400" : "text-zinc-600"}`}>
              {s.wins}
            </div>

            {/* Losses */}
            <div className={`text-center text-sm font-semibold ${s.losses > 0 ? "text-red-400" : "text-zinc-600"}`}>
              {s.losses}
            </div>

            {/* Total Score */}
            <div className="text-center text-sm text-zinc-400 font-mono">
              {s.totalScore}
            </div>

            {/* Matches Played */}
            <div className="text-center text-sm text-zinc-500 font-mono">
              {s.matchesPlayed}
            </div>

            {/* Points */}
            <div className={`text-right text-sm font-bold ${idx === 0 && s.wins > 0 ? "text-primary" : "text-white"}`}>
              {s.points}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-4 text-[10px] text-zinc-600">
        <span>W = Wins</span>
        <span>L = Losses</span>
        <span>Score = Total match scores</span>
        <span>MP = Matches Played</span>
        <span className="ml-auto text-zinc-500 font-medium">Pts = (Wins × 3) + Score</span>
      </div>
    </div>
  );
}

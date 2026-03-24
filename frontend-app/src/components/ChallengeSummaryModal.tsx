"use client";
import React, { useState, useEffect } from "react";
import { RoomPlayer, ChallengeResult } from "@/context/TournamentContext";
import { X, ArrowUp, ArrowDown, Minus, Trophy, TrendingUp } from "lucide-react";

interface SummaryRow {
  id: number | string;
  name: string;
  beforeRank: number;
  afterRank: number;
  movement: number;
  deltaPoints: number;
  totalPoints: number;
  avatar: string;
  prevPoints: number;
}

interface Props {
  players: RoomPlayer[];
  challengeResults: ChallengeResult[];
  previousRanking: RoomPlayer[];
  onClose: () => void;
}

const TrendBadge = ({ trend }: { trend: number }) => {
  if (trend > 0) {
    return (
      <div className="flex items-center gap-1.5 bg-emerald-500/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm">
        <ArrowUp className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.2} />
        <span className="text-emerald-400 font-semibold text-xs tracking-wide">+{trend}</span>
      </div>
    );
  }
  if (trend < 0) {
    return (
      <div className="flex items-center gap-1.5 bg-rose-500/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-rose-500/20 shadow-sm">
        <ArrowDown className="w-3.5 h-3.5 text-rose-400" strokeWidth={2.2} />
        <span className="text-rose-400 font-semibold text-xs tracking-wide">{trend}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
      <Minus className="w-3.5 h-3.5 text-neutral-500" strokeWidth={2} />
      <span className="text-neutral-400 text-xs font-medium">0</span>
    </div>
  );
};

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return <div className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">1</div>;
  }
  if (rank === 2) {
    return <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-400/20 text-slate-300 text-xs font-bold border border-slate-400/30">2</div>;
  }
  if (rank === 3) {
    return <div className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30">3</div>;
  }
  return <span className="text-neutral-500 text-sm font-medium tabular-nums">{rank}</span>;
};

export default function ChallengeSummaryModal({ players, challengeResults, previousRanking, onClose }: Props) {
  const [visibleRows, setVisibleRows] = useState<number[]>([]);

  const beforeMap = new Map(previousRanking.map((p, idx) => [String(p.id), idx + 1]));
  const afterSorted = [...players].sort((a, b) => b.roomScore - a.roomScore);

  const rows: SummaryRow[] = afterSorted.map((p, index) => {
    const afterRank = index + 1;
    const beforeRank = beforeMap.get(String(p.id)) || previousRanking.length + 1;
    const movement = beforeRank - afterRank;
    const result = challengeResults.find(r => String(r.playerId) === String(p.id));
    const deltaPoints = result ? result.points : 0;
    const totalPoints = p.roomScore;

    const prevPlayer = previousRanking.find(prev => String(prev.id) === String(p.id));
    const previousPoints = prevPlayer ? prevPlayer.roomScore : 0;

    return {
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      beforeRank,
      afterRank,
      movement,
      deltaPoints,
      totalPoints,
      prevPoints: previousPoints,
    };
  });

  useEffect(() => {
    let active = true;
    const timeouts = rows.map((_, idx) => {
      return setTimeout(() => {
        if (active) {
          setVisibleRows(prev => [...prev, idx]);
        }
      }, idx * 40);
    });
    return () => {
      active = false;
      timeouts.forEach(clearTimeout);
    };
  }, [rows.length]);

  return (
    <>
      <style>{`
          /* Custom scrollbar */
          ::-webkit-scrollbar {
              width: 5px;
              height: 5px;
          }
          ::-webkit-scrollbar-track {
              background: #121212;
              border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
              background: #2c2c2c;
              border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
              background: #3e3e3e;
          }

          /* Subtle animation for row entry */
          @keyframes fadeSlideUp {
              0% { opacity: 0; transform: translateY(12px); }
              100% { opacity: 1; transform: translateY(0); }
          }
          .animate-row {
              animation: fadeSlideUp 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
          }

          /* Modal entrance animation */
          @keyframes modalEnter {
              0% { opacity: 0; transform: scale(0.95) translateY(10px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-modal {
              animation: modalEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
        <div className="absolute inset-0" onClick={onClose}></div>

        <div className="w-full max-w-5xl relative z-10 text-white animate-modal max-h-[90vh] overflow-y-auto pb-4 pr-1 sm:pr-2">
          {/* header section with modern glassmorphism */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 relative">
            <button
              onClick={onClose}
              className="absolute top-0 right-0 md:top-auto md:bottom-0 p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-neutral-400 hover:text-white transition-all hover:scale-105 z-20"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pr-12 md:pr-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-7 h-7 text-amber-400 drop-shadow-sm" strokeWidth={1.8} />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                  Challenge Results
                </h1>
              </div>
              <p className="text-neutral-400 text-sm tracking-wide font-medium ml-1 border-l-2 border-emerald-500/50 pl-3">
                Live points & movement · Final standings
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-500 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 mr-0 md:mr-14">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span><span>Points gained</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400"></span><span>Points lost</span></div>
              <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-400" /><span>Rank trend</span></div>
            </div>
          </div>

          {/* Leaderboard Card - premium dark glass */}
          <div className="bg-[#0A0A0F]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header Row - minimal and clean */}
            <div className="grid grid-cols-[56px_100px_1fr_110px_140px] items-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500 bg-[#030305]/60 px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-1"># Rank</div>
              <div>Trend</div>
              <div>Contender</div>
              <div className="text-right">Previous</div>
              <div className="text-right pr-3">Current · Δ</div>
            </div>

            {/* Rows container */}
            <div className="divide-y divide-white/5">
              {rows.map((player, idx) => {
                const pointsDiff = player.deltaPoints;
                const hasPositiveDiff = pointsDiff > 0;
                const hasNegativeDiff = pointsDiff < 0;
                const diffAbs = Math.abs(pointsDiff);

                // dynamic colors for current points
                const currentPointsColor = hasPositiveDiff ? "text-emerald-400" : (hasNegativeDiff ? "text-rose-400" : "text-neutral-200");

                const isVisible = visibleRows.includes(idx);

                return (
                  <div
                    key={player.id}
                    className={`grid grid-cols-[56px_100px_1fr_110px_140px] items-center px-6 py-3.5 transition-all duration-300 hover:bg-white/[0.03] group ${isVisible ? 'animate-row' : 'opacity-0'}`}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* Rank Column with medal flair for top 3 */}
                    <div className="flex items-center">
                      <RankIcon rank={player.afterRank} />
                    </div>

                    {/* Trend Column - Modern pill style */}
                    <div className="flex items-center">
                      <TrendBadge trend={player.movement} />
                    </div>

                    {/* Player Info - Clean & Elegant */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={player.avatar}
                          alt={player.name}
                          className="w-9 h-9 rounded-full object-cover bg-neutral-800 border border-white/10 shadow-md transition-all duration-200 group-hover:scale-105 group-hover:border-white/30"
                        />
                        {/* subtle glow dot for online effect */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-1 ring-black/40"></div>
                      </div>
                      <span className="text-[15px] font-medium tracking-tight text-neutral-100 group-hover:text-white transition">
                        {player.name}
                      </span>
                    </div>

                    {/* Previous Points - muted but readable */}
                    <div className="flex items-center justify-end">
                      <span className="text-neutral-500 text-sm font-mono tabular-nums bg-white/5 px-2 py-0.5 rounded-md">
                        {player.prevPoints}
                      </span>
                    </div>

                    {/* Current Points + Delta badge (modern) */}
                    <div className="flex items-center justify-end gap-2 pr-3">
                      <span className={`text-base font-semibold tabular-nums tracking-tight ${currentPointsColor}`}>
                        {player.totalPoints}
                      </span>
                      {pointsDiff !== 0 && (
                        <div className={`flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full ${hasPositiveDiff ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                          {hasPositiveDiff && <ArrowUp className="w-2.5 h-2.5" strokeWidth={2.5} />}
                          {hasNegativeDiff && <ArrowDown className="w-2.5 h-2.5" strokeWidth={2.5} />}
                          <span>{diffAbs}</span>
                        </div>
                      )}
                      {pointsDiff === 0 && (
                        <div className="text-[11px] text-neutral-600 font-mono">—</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* subtle footer note */}
            <div className="bg-black/30 border-t border-white/5 px-6 py-3 flex justify-between items-center text-[11px] text-neutral-500">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span>Points based on accuracy &amp; speed</span>
              </div>
              <div className="font-mono tracking-wide">
                {rows.length} explorers
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
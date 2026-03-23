"use client";
import React from "react";
import { RoomPlayer, ChallengeResult } from "@/context/TournamentContext";

interface SummaryRow {
  id: number | string;
  name: string;
  beforeRank: number;
  afterRank: number;
  movement: number;
  deltaPoints: number;
  positionBonus: number;
  totalPoints: number;
}

interface Props {
  players: RoomPlayer[];
  challengeResults: ChallengeResult[];
  previousRanking: RoomPlayer[];
  onClose: () => void;
}

export default function ChallengeSummaryModal({ players, challengeResults, previousRanking, onClose }: Props) {
  const positionBonusMap = (rank: number) => {
    const mapping = [25, 18, 12, 9, 6, 4, 2, 1];
    return mapping[rank - 1] ?? 0;
  };

  const beforeMap = new Map(previousRanking.map((p, idx) => [String(p.id), idx + 1]));
  const afterSorted = [...players].sort((a, b) => b.roomScore - a.roomScore);

  const rows: SummaryRow[] = afterSorted.map((p, index) => {
    const afterRank = index + 1;
    const beforeRank = beforeMap.get(String(p.id)) || previousRanking.length + 1;
    const movement = beforeRank - afterRank;
    const result = challengeResults.find(r => String(r.playerId) === String(p.id));
    const deltaPoints = result ? result.points : 0;
    const positionBonus = positionBonusMap(afterRank);
    const totalPoints = p.roomScore + positionBonus; // Not modifying actual score, display only

    return {
      id: p.id,
      name: p.name,
      beforeRank,
      afterRank,
      movement,
      deltaPoints,
      positionBonus,
      totalPoints,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-3xl bg-[#0b1220] border border-[#2b3650] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2c44]">
          <h3 className="text-white text-xl font-bold">Match Leaderboard Summary</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white font-bold text-sm">Close</button>
        </div>

        <div className="p-4 text-sm text-white/70">Positions are updated based on final scores after the challenge; bonus points by position are shown. Movement indicates places climbed (+) or dropped (-).</div>

        <div className="max-h-[460px] overflow-y-auto text-white">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold uppercase border-b border-[#1f2c44]">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Player</div>
            <div className="col-span-2 text-right">Δ pts</div>
            <div className="col-span-2 text-right">Bonus</div>
            <div className="col-span-2 text-right">Before</div>
            <div className="col-span-2 text-right">After</div>
            <div className="col-span-1 text-right">Δpos</div>
          </div>

          {rows.map((r, idx) => (
            <div key={String(r.id)} className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-[#1f2c44] text-sm items-center">
              <div className="col-span-1">{idx + 1}</div>
              <div className="col-span-3 truncate" title={r.name}>{r.name}</div>
              <div className="col-span-2 text-right font-bold text-indigo-300">{r.deltaPoints >= 0 ? `+${r.deltaPoints}` : r.deltaPoints}</div>
              <div className="col-span-2 text-right font-bold text-emerald-300">+{r.positionBonus}</div>
              <div className="col-span-2 text-right">{r.beforeRank}</div>
              <div className="col-span-2 text-right">{r.afterRank}</div>
              <div className={`col-span-1 text-right font-semibold ${r.movement > 0 ? "text-emerald-400" : r.movement < 0 ? "text-rose-400" : "text-slate-300"}`}>
                {r.movement > 0 ? `+${r.movement}` : r.movement}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 text-xs text-white/60 border-t border-[#1f2c44]">
          Total points display includes current score plus position bonus in this view only.
        </div>
      </div>
    </div>
  );
}

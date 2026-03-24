"use client";
import React from "react";
import { PlayerSnapshot } from "@/context/HistoryContext";
import { Trophy, Medal } from "lucide-react";

interface Props {
  snapshots: PlayerSnapshot[]; // the "after" array of the last challenge
}

export default function FinalLeaderboard({ snapshots }: Props) {
  const sorted = [...snapshots].sort((a, b) => b.roomScore - a.roomScore);

  return (
    <div className="bg-black/40 border border-[#ffcc00]/15 rounded-2xl backdrop-blur-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
        <Trophy size={16} className="text-[#ffcc00]" />
        <h3 className="text-white font-semibold text-sm tracking-wide uppercase">Final Room Standings</h3>
        <span className="ml-auto text-white/30 text-xs">after all challenges</span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
              i === 0 ? "bg-[#ffcc00] text-black shadow-[0_0_12px_rgba(255,204,0,0.3)]"
              : i === 1 ? "bg-slate-300 text-black"
              : i === 2 ? "bg-orange-400 text-black"
              : "bg-white/[0.04] text-white/30 border border-white/[0.08]"
            }`}>
              {i === 0 ? <Medal size={14} /> : i + 1}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
            <span className="text-white font-medium text-sm flex-1 truncate">{p.name}</span>
            <span className="text-[#ffcc00] font-bold text-lg">{p.roomScore} <span className="text-xs font-normal text-[#ffcc00]/50">PTS</span></span>
          </div>
        ))}
        {sorted.length === 0 && (
          <div className="py-10 text-center text-white/25 text-sm">No player data recorded for this room.</div>
        )}
      </div>
    </div>
  );
}

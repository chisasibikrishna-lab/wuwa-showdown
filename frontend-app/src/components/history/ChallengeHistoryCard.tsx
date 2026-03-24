"use client";
import React, { useState } from "react";
import { ChallengeRecord } from "@/context/HistoryContext";
import { Trophy, MapPin, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  challenge: ChallengeRecord;
  index: number;
}

export default function ChallengeHistoryCard({ challenge, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const sortedResults = [...challenge.results].sort((a, b) => b.points - a.points);
  const winner = sortedResults[0];

  return (
    <div className="bg-black/40 border border-white/[0.07] hover:border-white/[0.14] backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-200">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-[#ffcc00]/10 border border-[#ffcc00]/20 flex items-center justify-center">
            <span className="text-[#ffcc00] font-bold text-sm">#{index + 1}</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm tracking-tight">
              Challenge {index + 1}
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-white/35 text-xs">
              <span className="flex items-center gap-1"><Clock size={10} />{challenge.timeLimitSeconds}s limit</span>
              <span className="flex items-center gap-1"><MapPin size={10} />{challenge.results.length} submitted</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {winner && (
            <div className="hidden sm:flex items-center gap-2">
              <Trophy size={13} className="text-[#ffcc00]/60" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={winner.playerAvatar} alt="" className="w-5 h-5 rounded-full" />
              <span className="text-white/60 text-xs font-medium">{winner.playerName}</span>
              <span className="text-[#ffcc00] font-bold text-xs">+{winner.points}</span>
            </div>
          )}
          <div className="text-white/30">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Expanded Result Table */}
      {expanded && (
        <div className="border-t border-white/[0.06] px-5 pb-4 pt-3">
          <div className="flex flex-col gap-2">
            {sortedResults.map((r, i) => (
              <div key={r.playerId} className="flex items-center justify-between py-2.5 px-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-[#ffcc00] text-black" : i === 1 ? "bg-slate-300 text-black" : i === 2 ? "bg-orange-400 text-black" : "bg-white/5 text-white/30"}`}>
                    {i + 1}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.playerAvatar} alt="" className="w-7 h-7 rounded-full" />
                  <span className="text-white text-sm font-medium">{r.playerName}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span className="hidden sm:block">Drift <span className="text-white/60">{Math.round(r.distance)}u</span></span>
                  <span className="hidden sm:block">Time <span className="text-white/60">{r.timeTaken}s</span></span>
                  <span className="text-[#ffcc00] font-bold text-base">+{r.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

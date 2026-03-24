"use client";
import React from "react";
import { Challenge } from "@/context/TournamentContext";
import { useTournament } from "@/context/TournamentContext";

interface Props {
  roomId: string;
  challenges: Challenge[];
}

export default function MissionHistoryList({ roomId, challenges }: Props) {
  const { startChallengeLobby } = useTournament();

  return (
    <div className="mt-2">
      <h2 className="text-white/30 font-medium text-xs tracking-wide uppercase mb-4">Operation Database</h2>
      <div className="grid grid-cols-1 gap-2.5">
        {challenges.map(c => (
          <div key={c.id} className="flex flex-col sm:flex-row items-center justify-between p-5 bg-[#111318] hover:bg-[#13161c] border border-white/[0.06] rounded-2xl gap-4 transition-all duration-200">
            <div className="flex items-center gap-5 w-full">
              <div className="relative shrink-0">
                {c.image
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={c.image} alt="C" className="w-20 h-14 object-cover rounded-xl shadow-md border border-white/[0.06]" />
                  : <div className="w-20 h-14 bg-white/[0.02] rounded-xl shadow-md border border-white/[0.04]" />}
                <div className="absolute -bottom-1.5 -right-1.5 bg-[#111318] px-1.5 py-0.5 rounded-md text-[10px] font-mono border border-white/[0.06] text-white/40">{c.timeLimitSeconds}s</div>
              </div>
              <div>
                <div className="text-white font-medium tracking-tight text-[15px]">Op. Delta-{c.id.substring(c.id.length - 4)}</div>
                <div className="text-white/30 text-xs mt-1">{c.results.length} Agents Executed</div>
              </div>
            </div>
            <div className="flex items-center w-full sm:w-auto justify-end gap-3 border-t sm:border-t-0 border-white/[0.04] pt-3 sm:pt-0">
              <div className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide ${c.status === 'pending' ? 'bg-white/[0.03] text-white/40 border border-white/[0.06]' : c.status === 'completed' ? 'bg-emerald-500/8 text-emerald-400 border border-emerald-500/15' : 'bg-[#ffcc00]/8 text-[#ffcc00] border border-[#ffcc00]/15'}`}>
                {c.status}
              </div>
              {c.status === 'pending' && (
                <button
                  onClick={() => startChallengeLobby(roomId, c.id)}
                  className="bg-white/[0.04] hover:bg-white hover:text-black text-white border border-white/[0.08] hover:border-white px-5 py-2 rounded-xl font-medium text-xs tracking-wide transition-all duration-200 min-w-[100px]"
                >
                  Commence
                </button>
              )}
            </div>
          </div>
        ))}
        {challenges.length === 0 && (
          <div className="text-white/20 text-sm py-14 bg-white/[0.01] border border-white/[0.04] border-dashed rounded-2xl text-center font-medium tracking-wide">No missions logged in database.</div>
        )}
      </div>
    </div>
  );
}

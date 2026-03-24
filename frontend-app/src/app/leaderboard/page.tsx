"use client";
import React from "react";
import { useTournament } from "@/context/TournamentContext";
import type { Player } from "@/context/TournamentContext";

interface PodiumAvatarProps {
  player: Player | undefined;
  rank: number;
  color: string;
  delay: string;
}

const PodiumAvatar: React.FC<PodiumAvatarProps> = ({ player, rank, color, delay }) => {
  if (!player) return <div className="w-24" />;
  return (
    <div className={`flex flex-col items-center justify-end animate-in slide-in-from-bottom fade-in duration-1000 ${delay}`}>
      <div className="flex flex-col items-center z-10 transition-transform duration-500">
        <div className={`relative p-[3px] rounded-full bg-gradient-to-b ${color} shadow-[0_0_20px_rgba(255,255,255,0.1)] group`}>
          {/* Crown for Rank 1 */}
          {rank === 1 && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[#ffcc00] drop-shadow-[0_0_15px_rgba(255,204,0,0.8)] z-20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
              </svg>
            </div>
          )}
          <img src={player.avatar} alt={player.name} className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#161922] object-cover" />
        </div>
      </div>
    </div>
  );
};

import { RefreshCw } from "lucide-react";

export default function LeaderboardPage() {
  const { players } = useTournament();
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const top1 = sortedPlayers[0];
  const top2 = sortedPlayers[1];
  const top3 = sortedPlayers[2];
  const others = sortedPlayers.slice(3);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center pt-[100px] sm:pt-[120px] pb-4 px-4 overflow-hidden pointer-events-none">
      <div className="w-full max-w-[1000px] flex flex-col items-center h-full pointer-events-auto relative">
        <button 
          onClick={handleRefresh}
          className="absolute top-0 right-0 z-50 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white px-4 py-2 rounded-lg transition-colors font-medium tracking-wide text-xs uppercase"
        >
          <RefreshCw size={14} /> Refresh
        </button>

        {/* Fixed Header Content */}
        <div className="w-full flex flex-col items-center shrink-0">
          {/* Title */}
          <h1
            className="text-[40px] md:text-[50px] italic uppercase text-center leading-none text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.5)] mb-2 md:mb-4 animate-in fade-in zoom-in duration-700 font-bold"
          >
            Tournament{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffcc00] to-[#b38f00]">Leaderboard</span>
          </h1>

          {/* Podium Section */}
          <div className="relative w-full mx-auto mb-2 md:mb-4 mt-0 shrink-0" style={{ maxWidth: "min(550px, 45vh)" }}>
            <img
              src="/podiums.png"
              alt="Podiums"
              className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-1000"
            />

            {/* Rank 2 */}
            <div className="absolute left-[16%] md:left-[20%] bottom-[10%] md:bottom-[40%] -translate-x-1/2 w-[150px] flex justify-center">
              <PodiumAvatar player={top2} rank={2} color="from-[#a8b2c1] to-[#717b8f]" delay="delay-150" />
            </div>

            {/* Rank 1 */}
            <div className="absolute left-[50%] bottom-[22%] md:bottom-[53.2%] -translate-x-1/2 w-[150px] flex justify-center">
              <PodiumAvatar player={top1} rank={1} color="from-[#ffcc00] to-[#d4af37]" delay="delay-0" />
            </div>

            {/* Rank 3 */}
            <div className="absolute left-[84%] md:left-[80%] bottom-[6%] md:bottom-[40%] -translate-x-1/2 w-[150px] flex justify-center">
              <PodiumAvatar player={top3} rank={3} color="from-[#cd7f32] to-[#8b5a2b]" delay="delay-300" />
            </div>
          </div>
        </div>

        {/* Rest of the Leaderboard */}
        {others.length > 0 && (
          <div
            className="w-full max-w-[700px] flex flex-col gap-2 flex-1 overflow-y-auto pb-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style dangerouslySetInnerHTML={{ __html: `.overflow-y-auto::-webkit-scrollbar { display: none; }` }} />
            <h3
              className="text-[#8b92a5] font-semibold tracking-[0.2em] uppercase text-center mb-2 text-xs shrink-0"
            >
              Contenders
            </h3>
            {others.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center shrink-0 justify-between px-4 py-2 bg-[#161922]/80 border border-white/5 rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white/40 w-6 text-lg">
                    #{index + 4}
                  </span>
                  <img src={player.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
                  <span
                    className="font-semibold tracking-wide uppercase text-white/90 text-sm"
                  >
                    {player.name}
                  </span>
                </div>
                <span className="font-bold text-[#ffcc00] text-lg">
                  {player.score} PTS
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { Lock, Target, CheckCircle2 } from "lucide-react";
import { RoomPlayer } from "@/context/TournamentContext";

interface Props {
  roomId: string;
  myPlayer: RoomPlayer;
  onReady: () => void;
}

export default function MissionPrecheck({ myPlayer, onReady }: Props) {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-14 border border-[#ffcc00]/20 bg-black/40 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl relative overflow-hidden">

      {/* top glow line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ffcc00] to-transparent opacity-60" />

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <Lock size={52} className="text-[#ffcc00]/70 mb-4" />
        <h2 className="text-3xl text-white font-semibold mb-2">Mission Pre-check</h2>
        <p className="text-white/50 text-sm max-w-lg leading-relaxed">
          Intelligence packets have been dispatched. Confirm your readiness to launch.
        </p>
      </div>

      {/* Action Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.03] border border-white/[0.05] rounded-xl p-6">

        {/* Left Info */}
        <div className="text-white/60 text-sm max-w-md">
          <p className="mb-2">
            Make sure you're ready before starting the mission.
          </p>
          <p className="text-white/40 text-xs">
            Once confirmed, your status will be locked in.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onReady}
          disabled={myPlayer.isReady}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
            myPlayer.isReady
              ? "bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/20"
              : "bg-[#ffcc00] hover:bg-[#ffe066] text-black"
          }`}
        >
          {myPlayer.isReady ? (
            <>
              <CheckCircle2 size={18} /> Ready for Launch
            </>
          ) : (
            <>
              <Target size={18} /> Confirm Ready
            </>
          )}
        </button>

      </div>
    </div>
  );
}
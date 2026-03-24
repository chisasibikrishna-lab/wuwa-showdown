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
    <div className="flex flex-col items-center justify-center py-16 border border-[#ffcc00]/15 bg-[#ffcc00]/[0.02] rounded-2xl w-full max-w-3xl shadow-xl backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ffcc00] to-transparent opacity-60" />
      <Lock size={52} className="text-[#ffcc00]/70 mb-6" />
      <h2 className="text-3xl text-white font-semibold tracking-tight mb-3">Mission Pre-check</h2>
      <p className="text-white/45 text-sm text-center max-w-md mb-10 leading-relaxed">
        Intelligence packets have been dispatched. Confirm your readiness to launch.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={onReady}
          disabled={myPlayer.isReady}
          className={`flex items-center justify-center gap-3 w-full py-4 rounded-xl font-medium tracking-wide text-sm transition-all duration-200 ${myPlayer.isReady ? 'bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/20' : 'bg-[#ffcc00] hover:bg-[#ffe066] text-black'}`}
        >
          {myPlayer.isReady ? <><CheckCircle2 size={18} /> Ready for Launch</> : <><Target size={18} /> Confirm Ready</>}
        </button>
      </div>
    </div>
  );
}

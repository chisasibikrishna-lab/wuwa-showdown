"use client";
import React, { useState } from "react";
import { Plus, Minus, Trash2, AlertTriangle, X } from "lucide-react";
import { Room } from "@/context/TournamentContext";
import { useTournament } from "@/context/TournamentContext";

interface Props {
  room: Room;
}

export default function PointsLeaderboardTab({ room }: Props) {
  const { addRoomPoints, removeRoomPoints, resetRoomLeaderboard } = useTournament();
  const [pointsInput, setPointsInput] = useState<Record<number, string>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handlePointsChange = (id: number, points: string) =>
    setPointsInput({ ...pointsInput, [id]: points });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end mb-1">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500/8 hover:bg-red-500/15 text-red-400 rounded-xl border border-red-500/15 transition-all duration-200 font-medium tracking-wide text-xs"
        >
          <Trash2 size={14} /> Reset All Scores
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {room.players.length === 0 ? (
          <div className="text-center text-white/25 py-20 border border-white/[0.04] border-dashed rounded-2xl font-medium tracking-wide text-sm">
            No players have joined this room yet. Share the code: <span className="text-[#ffcc00] ml-1">{room.code}</span>
          </div>
        ) : (
          [...room.players].sort((a, b) => b.roomScore - a.roomScore).map((player, idx) => (
            <div key={player.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#111318] border border-white/[0.06] rounded-2xl hover:border-white/[0.1] transition-all duration-200 group">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${idx === 0 ? "bg-[#ffcc00] text-black shadow-[0_0_12px_rgba(255,204,0,0.3)]" : idx === 1 ? "bg-slate-300 text-black" : idx === 2 ? "bg-orange-400 text-black" : "bg-white/[0.04] text-white/30 border border-white/[0.08]"}`}>
                  {idx + 1}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={player.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-white/[0.08] bg-black" />
                <div>
                  <div className="text-white font-semibold tracking-tight text-[15px]">{player.name}</div>
                  <div className="text-[#ffcc00] font-bold text-lg mt-0.5">{player.roomScore} <span className="text-xs font-medium text-[#ffcc00]/60">PTS</span></div>
                </div>
              </div>

              <div className="flex gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.06] w-full sm:w-auto mt-2 sm:mt-0 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity duration-200">
                <button onClick={() => removeRoomPoints(room.id, player.id, Number(pointsInput[player.id]) || 1)} className="flex-1 sm:w-11 h-11 flex items-center justify-center text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Minus size={18} /></button>
                <input type="number" min="1" placeholder="1" value={pointsInput[player.id] || ""} onChange={(e) => handlePointsChange(player.id, e.target.value)} className="w-16 bg-transparent text-center text-white font-mono text-base outline-none border-x border-white/[0.06] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]" />
                <button onClick={() => addRoomPoints(room.id, player.id, Number(pointsInput[player.id]) || 1)} className="flex-1 sm:w-11 h-11 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"><Plus size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111318] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setShowResetConfirm(false)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
              <X size={18} />
            </button>
            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Reset All Scores?</h3>
              <p className="text-white/50 text-sm mb-6">
                This will permanently reset all players' scores in this room to zero. This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium tracking-wide">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetRoomLeaderboard(room.id);
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)] text-sm font-medium tracking-wide"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

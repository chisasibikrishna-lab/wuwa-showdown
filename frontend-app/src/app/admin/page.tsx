"use client";
import React, { useState } from "react";
import { useTournament } from "@/context/TournamentContext";
import { Plus, Minus, UserMinus, UserPlus, Trash2 } from "lucide-react";

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function AdminPage() {
  const { players, addPoints, removePoints, kickPlayer, addPlayer, resetLeaderboard } = useTournament();

  const [newPlayerName, setNewPlayerName] = useState("");
  const [pointsInput, setPointsInput] = useState<Record<number, string>>({});

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    addPlayer(newPlayerName.trim());
    setNewPlayerName("");
  };

  const handlePointsChange = (id: number, points: string) => {
    setPointsInput({ ...pointsInput, [id]: points });
  };

  return (
    <div className="w-full max-w-[800px] flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-4">
        <div>
          <h1
            className="text-4xl text-white font-bold tracking-widest uppercase flex items-center gap-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <SettingsIcon className="text-[#ffcc00] animate-[spin_4s_linear_infinite]" />
            Tournament Admin
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.2em] mt-1 text-sm font-mono">Control Panel</p>
        </div>
        <button
          onClick={resetLeaderboard}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/20 transition-all font-bold tracking-widest text-sm uppercase"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          <Trash2 size={16} /> Reset Scores
        </button>
      </div>

      {/* Add New Player */}
      <div className="bg-[#161922]/80 border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <h2
          className="text-[#ffcc00] font-bold uppercase tracking-widest text-lg mb-4 flex items-center gap-2"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          <UserPlus size={18} /> Add Competitor
        </h2>
        <form onSubmit={handleAddPlayer} className="flex gap-4">
          <input
            type="text"
            placeholder="Enter player name..."
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#ffcc00]/50 transition-colors font-mono"
          />
          <button
            type="submit"
            className="bg-[#ffcc00] hover:bg-[#ffdf4d] text-black px-6 py-3 rounded-lg font-bold tracking-widest uppercase transition-colors"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            Add
          </button>
        </form>
      </div>

      {/* Player Management List */}
      <div className="flex flex-col gap-3">
        <h2
          className="text-white/50 font-bold uppercase tracking-widest text-sm mb-2 px-2 flex justify-between"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          <span>Manage Active Players</span>
          <span>{players.length} Total</span>
        </h2>

        {players.map((player) => (
          <div
            key={player.id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#161922]/60 border border-white/5 rounded-xl hover:bg-[#161922] hover:border-white/10 transition-all"
          >
            {/* Player Info */}
            <div className="flex items-center gap-4">
              <img src={player.avatar} alt="avatar" className="w-12 h-12 rounded-full border border-white/10" />
              <div>
                <div
                  className="text-white font-bold tracking-widest text-lg uppercase"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  {player.name}
                </div>
                <div
                  className="text-[#ffcc00] font-bold text-xl drop-shadow-[0_0_5px_rgba(255,204,0,0.3)]"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {player.score} PTS
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 flex-wrap md:flex-nowrap">
              <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => removePoints(player.id, Number(pointsInput[player.id]) || 1)}
                  className="w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={pointsInput[player.id] || 1}
                  onChange={(e) => handlePointsChange(player.id, e.target.value)}
                  className="w-16 bg-transparent text-center text-white font-mono outline-none border-x border-white/5"
                />
                <button
                  onClick={() => addPoints(player.id, Number(pointsInput[player.id]) || 1)}
                  className="w-10 h-10 flex items-center justify-center text-green-400 hover:bg-green-400/10 rounded-md transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={() => kickPlayer(player.id)}
                className="w-12 h-12 flex items-center justify-center text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                title="Kick Player"
              >
                <UserMinus size={20} />
              </button>
            </div>
          </div>
        ))}

        {players.length === 0 && (
          <div
            className="text-center text-white/40 py-12 border border-white/5 border-dashed rounded-xl uppercase font-bold tracking-widest"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            No active players. Add someone above.
          </div>
        )}
      </div>
    </div>
  );
}

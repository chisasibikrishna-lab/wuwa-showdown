"use client";
import React, { useState, useRef } from "react";
import { useTournament } from "@/context/TournamentContext";
import { Plus, Minus, UserMinus, UserPlus, Trash2, MapPin, Upload, X, Play, Square } from "lucide-react";
import dynamic from "next/dynamic";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
});

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
  const { 
    players, addPoints, removePoints, kickPlayer, addPlayer, resetLeaderboard,
    geoguessEvent, startGeoguessEvent, endGeoguessEvent
  } = useTournament();

  const [activeTab, setActiveTab] = useState<"points" | "geoguess">("points");

  // Points handling
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

  // Geoguess handling
  const [geoImage, setGeoImage] = useState<string | null>(null);
  const [geoCoords, setGeoCoords] = useState<[number, number] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setGeoImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleStartGeoguess = () => {
    if (geoImage && geoCoords) {
      startGeoguessEvent(geoImage, geoCoords);
    }
  };

  return (
    <div className="w-full max-w-[900px] flex flex-col gap-6 sm:gap-8 animate-in fade-in zoom-in-95 duration-500 pb-20 px-4 sm:px-6 md:px-0 mt-8 mb-12 mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 mb-2 gap-4">
        <div>
          <h1
            className="text-3xl sm:text-4xl text-white font-bold tracking-widest uppercase flex items-center gap-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <SettingsIcon className="text-[#ffcc00] animate-[spin_4s_linear_infinite] w-8 h-8 sm:w-10 sm:h-10" />
            Tournament Admin
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.2em] mt-1 text-xs sm:text-sm font-mono">Control Panel</p>
        </div>
        <button
          onClick={resetLeaderboard}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/20 transition-all font-bold tracking-widest text-xs sm:text-sm uppercase w-full sm:w-auto justify-center"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          <Trash2 size={16} /> Reset Scores
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-0">
        <button
          onClick={() => setActiveTab("points")}
          className={`px-6 py-3 rounded-t-lg font-bold tracking-widest text-sm uppercase transition-colors ${activeTab === "points" ? "bg-white/10 text-[#ffcc00] border-b-2 border-[#ffcc00]" : "text-white/40 hover:text-white/80"}`}
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          Points Management
        </button>
        <button
          onClick={() => setActiveTab("geoguess")}
          className={`px-6 py-3 rounded-t-lg font-bold tracking-widest text-sm uppercase transition-colors ${activeTab === "geoguess" ? "bg-white/10 text-[#ffcc00] border-b-2 border-[#ffcc00]" : "text-white/40 hover:text-white/80"}`}
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          Geoguess Event {geoguessEvent?.active ? "(ACTIVE)" : ""}
        </button>
      </div>

      {activeTab === "points" && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
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
                <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 flex-wrap md:flex-nowrap mt-4 md:mt-0 w-full md:w-auto">
                  <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/10 w-full md:w-auto">
                    <button
                      onClick={() => removePoints(player.id, Number(pointsInput[player.id]) || 1)}
                      className="flex-1 md:w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={pointsInput[player.id] || 1}
                      onChange={(e) => handlePointsChange(player.id, e.target.value)}
                      className="w-16 sm:w-20 bg-transparent text-center text-white font-mono outline-none border-x border-white/5"
                    />
                    <button
                      onClick={() => addPoints(player.id, Number(pointsInput[player.id]) || 1)}
                      className="flex-1 md:w-10 h-10 flex items-center justify-center text-green-400 hover:bg-green-400/10 rounded-md transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <button
                    onClick={() => kickPlayer(player.id)}
                    className="w-full md:w-12 h-10 md:h-12 flex items-center justify-center text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors md:ml-2 border border-white/5 md:border-transparent"
                    title="Kick Player"
                  >
                    <UserMinus size={18} className="md:w-5 md:h-5" />
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
      )}

      {activeTab === "geoguess" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="bg-[#161922]/80 border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-[#ffcc00] font-bold uppercase tracking-widest text-lg mb-6 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              <MapPin size={18} /> Configure Next Geoguess Event
            </h2>
            
            {geoguessEvent?.active ? (
              <div className="flex flex-col items-center justify-center p-8 border border-green-500/30 bg-green-500/10 rounded-xl gap-4">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
                <h3 className="text-2xl text-white font-bold tracking-widest uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Event is Currently Active!</h3>
                <p className="text-white/60 text-center max-w-md text-sm font-mono">Players can currently join the Arena map and submit their guesses. When everyone is done, end the event here.</p>
                <div className="text-[#ffcc00] font-bold uppercase tracking-widest text-sm mt-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  {geoguessEvent.submittedPlayers.length} Guesses Submitted
                </div>
                <button
                  onClick={endGeoguessEvent}
                  className="mt-4 flex items-center gap-2 bg-red-500/20 hover:bg-red-500 text-white border border-red-500 px-8 py-3 rounded-lg font-bold tracking-widest uppercase transition-all"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  <Square size={18} /> End Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Image Upload Area */}
                <div className="flex flex-col gap-3">
                  <label className="text-white/60 font-bold uppercase tracking-widest text-sm flex justify-between" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    <span>1. Upload Target Image</span>
                  </label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  
                  {geoImage ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 group bg-black/40">
                      <img src={geoImage} alt="Uploaded" className="object-contain w-full h-full" />
                      <button 
                        onClick={() => { setGeoImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove Image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-video border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-3 text-white/40 hover:border-[#ffcc00]/50 hover:text-[#ffcc00] hover:bg-[#ffcc00]/5 transition-all"
                    >
                      <Upload size={32} />
                      <span className="font-bold tracking-widest text-sm uppercase" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Click to Browse Image</span>
                    </button>
                  )}
                </div>

                {/* Map Target Selection Area */}
                <div className="flex flex-col gap-3">
                  <label className="text-white/60 font-bold uppercase tracking-widest text-sm flex justify-between" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    <span>2. Mark Target Location</span>
                    {geoCoords && <span className="text-[#ffcc00]">{Math.round(geoCoords[0])}, {Math.round(geoCoords[1])}</span>}
                  </label>
                  <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/10 relative bg-black/40">
                    <InteractiveMap selectedLocation={geoCoords} onLocationSelect={setGeoCoords} />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="col-span-1 md:col-span-2 pt-4 border-t border-white/10 flex justify-end">
                  <button
                    onClick={handleStartGeoguess}
                    disabled={!geoImage || !geoCoords}
                    className="flex items-center gap-2 bg-[#ffcc00] hover:bg-[#ffdf4d] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-black px-8 py-3 rounded-lg font-bold tracking-widest uppercase transition-colors"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}
                  >
                    <Play size={18} fill="currentColor" /> Broadcast Event
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

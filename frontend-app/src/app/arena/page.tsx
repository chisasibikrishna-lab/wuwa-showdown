"use client";
import React, { useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import { useTournament } from "@/context/TournamentContext";
import dynamic from "next/dynamic";
import { MapPin, Target, CheckCircle2 } from "lucide-react";

// Dynamically import InteractiveMap since it uses window/Leaflet
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), { ssr: false });

export default function ArenaPage() {
  const { players, geoguessEvent, submitGeoguess } = useTournament();
  
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [guessCoords, setGuessCoords] = useState<[number, number] | null>(null);
  const [result, setResult] = useState<{ points: number; distance: number } | null>(null);

  // Eligible players have NOT submitted a guess for the current event
  const eligiblePlayers = players.filter(p => !geoguessEvent?.submittedPlayers.includes(p.id));

  const handleSubmit = () => {
    const currentPlayerId = selectedPlayerId || (eligiblePlayers.length > 0 ? eligiblePlayers[0].id : null);
    if (currentPlayerId && guessCoords && geoguessEvent) {
      const res = submitGeoguess(currentPlayerId, guessCoords);
      if (res) setResult(res);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] relative flex flex-col font-sans selection:bg-white/20  overflow-x-hidden">
      {/* Background Dots */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />
      
      {/* Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#ffcc00]/5 rounded-full blur-[150px] pointer-events-none" />

      <TopNavbar />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto  px-4 flex flex-col items-center">
        {/* Header */}
        <h1 className="text-5xl text-white font-bold tracking-widest uppercase mb-12 flex items-center gap-4 text-center drop-shadow-[0_0_15px_rgba(255,204,0,0.2)]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          <Target className="text-[#ffcc00] animate-[spin_6s_linear_infinite]" size={40} />
          Geoguess Arena
          <Target className="text-[#ffcc00] animate-[spin_6s_linear_infinite_reverse]" size={40} />
        </h1>

        {!geoguessEvent?.active ? (
          <div className="flex flex-col items-center justify-center py-20 border border-white/10 bg-[#161922]/80 backdrop-blur-md rounded-2xl w-full max-w-3xl shadow-xl animate-in zoom-in-95 duration-500">
            <Target size={64} className="text-white/20 mb-6" />
            <h2 className="text-2xl text-white font-bold tracking-widest uppercase" style={{ fontFamily: "'Rajdhani', sans-serif" }}>No Active Event</h2>
            <p className="text-white/40 mt-2 font-mono text-center">Waiting for the Game Master to broadcast the next target location...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Left Panel: Inputs & Target Image OR Results */}
            <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
              
              {result ? (
                <div className="bg-[#161922]/90 border border-[#ffcc00]/30 rounded-2xl p-8 shadow-xl backdrop-blur-md flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(255,204,0,0.1)] h-full overflow-hidden">
                  <CheckCircle2 size={64} className="text-[#ffcc00] mb-4" />
                  <h2 className="text-3xl lg:text-4xl text-white font-bold tracking-widest uppercase mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    Submission Locked!
                  </h2>
                  <div className="flex flex-col gap-2 mt-4 text-white/80 font-mono text-lg bg-black/40 border border-white/10 p-4 rounded-xl w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-center py-2 border-b border-white/10">
                      <span className="text-white/50 text-sm">Target Drift:</span>
                      <span className="text-white font-bold">{Math.round(result.distance)} Units</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center py-2">
                      <span className="text-white/50 text-sm">Reward:</span>
                      <span className="text-[#ffcc00] text-3xl lg:text-4xl font-bold">+{result.points} PTS</span>
                    </div>
                  </div>
                  <p className="text-[#ffcc00]/60 text-sm mt-8 pt-4 w-full font-bold tracking-widest uppercase" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    Standby for next broadcast
                  </p>
                </div>
              ) : (
                <>
                  {/* Image Target */}
                  <div className="bg-[#161922]/90 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-4 relative overflow-hidden h-fit inline-block">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ffcc00]/50 to-transparent" />
                    
                    <h3 className="text-white font-bold uppercase tracking-widest text-lg flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                      <span className="w-5 h-5 rounded-full border border-white/40 text-white flex items-center justify-center text-xs">1</span> 
                      Analyze Intel
                    </h3>
                    
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-white/10 bg-black/60 flex items-center justify-center">
                      {geoguessEvent.image ? (
                        <img src={geoguessEvent.image} alt="Target Intel" className="object-contain w-full h-full transition-transform duration-700 hover:scale-110" />
                      ) : (
                        <div className="text-white/20 flex flex-col items-center gap-2">
                           <Target size={48} />
                           <span className="font-mono text-sm">NO VISUAL INTEL</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-white/40 text-sm font-mono mt-2 leading-relaxed tracking-tight">
                       Analyze the visual intelligence. Identify landmarks, topography, and structures. Once identified, mark the location on the tac-map.
                    </p>

                    {/* Rules block */}
                    <div className="bg-black/40 border border-[#ffcc00]/20 rounded-lg p-4 mt-2">
                      <h4 className="text-[#ffcc00] font-bold uppercase tracking-widest text-sm mb-3 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                        <Target size={16} /> Scoring Protocol
                      </h4>
                      <ul className="text-white/70 text-xs font-mono flex flex-col gap-2">
                        <li className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" /> Bullseye Drift &lt; 50 Units</span>
                          <span className="text-green-400 font-bold text-sm">+15 PTS</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ffcc00] shadow-[0_0_8px_#ffcc00]" /> Close Range Drift &lt; 150 Units</span>
                          <span className="text-[#ffcc00] font-bold text-sm">+10 PTS</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" /> Medium Range Drift &lt; 300 Units</span>
                          <span className="text-orange-400 font-bold text-sm">+5 PTS</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-500" /> Outside Range (Participation)</span>
                          <span className="text-white/40 font-bold text-sm">+1 PTS</span>
                        </li>
                      </ul>
                      <p className="text-[10px] text-red-400/80 mt-3 font-mono border-t border-red-500/20 pt-2 leading-tight uppercase tracking-wide">
                        Warning: Only one guess locked per active event! No redos!
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <button
                        onClick={handleSubmit}
                        disabled={!guessCoords || eligiblePlayers.length === 0}
                        className="w-full flex justify-center items-center gap-3 bg-[#ffcc00] hover:bg-[#ffdf4d] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-black px-4 sm:px-8 py-4 rounded-xl font-bold tracking-widest uppercase transition-all text-lg sm:text-lg shadow-[0_0_20px_rgba(255,204,0,0.2)] disabled:shadow-none hover:shadow-[0_0_30px_rgba(255,204,0,0.5)] hover:scale-[1.02] disabled:hover:scale-100"
                        style={{ fontFamily: "'Rajdhani', sans-serif" }}
                      >
                        <MapPin size={24} fill="currentColor" /> Lock In Coordinates
                      </button>
                      {(!guessCoords || eligiblePlayers.length === 0) && (
                         <div className="flex flex-wrap justify-center mt-4 gap-2">
                            {eligiblePlayers.length === 0 && <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30 uppercase font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>No Eligible Players Left</span>}
                            {!guessCoords && eligiblePlayers.length > 0 && <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30 uppercase font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Pending Tac-Map Pin</span>}
                         </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Panel: Tac-Map */}
            <div className="lg:col-span-8 flex flex-col h-[60vh] lg:h-auto lg:min-h-[700px] bg-[#161922]/90 border border-white/10 rounded-2xl p-3 shadow-2xl backdrop-blur-md relative order-1 lg:order-2">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none bg-black/80 backdrop-blur-lg border border-[#ffcc00]/30 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                <span className="text-white font-bold tracking-widest text-sm sm:text-base uppercase flex items-center gap-2 whitespace-nowrap" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  <MapPin size={18} className="text-[#ffcc00]" /> 
                  <span className="text-[#ffcc00]">2.</span> {result ? "Recon Results" : "Drop Tac-Pin"}
                </span>
              </div>
              
              <div className="w-full h-full rounded-xl overflow-hidden border border-white/5 bg-[#053446ff] relative">
                <InteractiveMap 
                  selectedLocation={guessCoords} 
                  onLocationSelect={setGuessCoords} 
                  correctLocation={result ? geoguessEvent.targetCoords : null}
                  readOnly={!!result}
                />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

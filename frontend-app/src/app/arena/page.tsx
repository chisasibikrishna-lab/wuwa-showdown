"use client";
import React, { useState, useEffect } from "react";
import TopNavbar from "@/components/TopNavbar";
import ChallengeSummaryModal from "@/components/ChallengeSummaryModal";
import { useTournament, Player, RoomPlayer, ChallengeResult } from "@/context/TournamentContext";
import dynamic from "next/dynamic";
import { LogIn, Timer, AlertTriangle, User as UserIcon, MapPin, Target, CheckCircle2, Lock, Download, MonitorPlay } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Dynamically import InteractiveMap since it uses window/Leaflet
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), { ssr: false });

function calculateElapsedSeconds(startedAt: number): number {
  return Math.floor((Date.now() - startedAt) / 1000);
}

export default function ArenaPage() {
  const { user, isLoading } = useAuth();
  const { rooms, joinRoom, setPlayerLoadedAssets, setPlayerReady, submitChallengeGeoguess } = useTournament();
  
  // Connection State
  const [roomCode, setRoomCode] = useState("");
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState("");
  const router = useRouter();
  // Store the coords the player submitted so we can show them on the post-result map
  const [submittedCoords, setSubmittedCoords] = useState<[number, number] | null>(null);

  // Route Protection
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Gameplay State
  const [guessCoords, setGuessCoords] = useState<[number, number] | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [previousRanking, setPreviousRanking] = useState<RoomPlayer[]>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryChallengeId, setSummaryChallengeId] = useState<string | null>(null);
  const [summaryChallengeResults, setSummaryChallengeResults] = useState<ChallengeResult[]>([]);

  // Connect Handler
  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus("");
    const upCode = roomCode.toUpperCase().trim();
    if (user && upCode) {
      const foundRoom = rooms.find(r => r.code === upCode);
      if (foundRoom) {
        joinRoom(upCode, user as any); // Cast slightly ok since ids changed from num to str, handled by backend
        setActiveRoomId(foundRoom.id);
        setGuessCoords(null);
      } else {
        setErrorStatus("INVALID ACCESS CODE");
      }
    }
  };

  // Connected to Room UI Derived State
  const room = rooms.find(r => r.id === activeRoomId);
  const myPlayer = room?.players.find(p => String(p.id) === String(user?.id));
  const activeChallenge = room?.activeChallengeId ? room.challenges.find(c => c.id === room.activeChallengeId) : null;
  const myResult = activeChallenge?.results.find(r => r.playerId != null && String(r.playerId) === String(user?.id));

  // Reset guess + submitted coords when a new challenge starts
  useEffect(() => {
    setGuessCoords(null);
    setSubmittedCoords(null);
    setTimeLeft(0);
    setHasSubmitted(false);
    setShowSummaryModal(false);

    if (room) {
      setPreviousRanking([...room.players].sort((a, b) => b.roomScore - a.roomScore));
    }
  }, [activeChallenge?.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeChallenge?.status === 'active' && activeChallenge.startedAt && !myResult) {
      interval = setInterval(() => {
         const elapsed = Math.floor((Date.now() - activeChallenge.startedAt!) / 1000);
         const remaining = Math.max(0, activeChallenge.timeLimitSeconds - elapsed);
         setTimeLeft(remaining);
      }, 500);
    } else {
      setTimeLeft(0);
    }
    return () => clearInterval(interval);
  }, [activeChallenge?.status, activeChallenge?.startedAt, myResult, activeChallenge?.timeLimitSeconds]);

  useEffect(() => {
    if (activeChallenge?.status === 'active' && room) {
      setPreviousRanking([...room.players].sort((a, b) => b.roomScore - a.roomScore));
      setSummaryChallengeId(null);
      setShowSummaryModal(false);
      setSummaryChallengeResults([]);
    }
  }, [activeChallenge?.status, room]);

  useEffect(() => {
    if (!room) return;

    const completedChallenges = room.challenges.filter(c => c.status === 'completed');
    if (completedChallenges.length === 0) return;

    const latestCompleted = completedChallenges[completedChallenges.length - 1];
    if (summaryChallengeId === latestCompleted.id) return;

    setSummaryChallengeId(latestCompleted.id);
    setSummaryChallengeResults(latestCompleted.results);
    setShowSummaryModal(true);
  }, [room, summaryChallengeId]);

  // Reset my guesses when challenge changes or resets
  useEffect(() => {
    if (activeChallenge?.status === 'waiting') {
       setGuessCoords(null);
    }
  }, [activeChallenge?.status, activeChallenge?.id]);

  const handleSubmit = () => {
    if (activeRoomId && activeChallenge && guessCoords && user && activeChallenge.startedAt && !myResult && !hasSubmitted) {
        const elapsed = calculateElapsedSeconds(activeChallenge.startedAt);
        submitChallengeGeoguess(activeRoomId, activeChallenge.id, user.id, guessCoords, elapsed);
        setSubmittedCoords(guessCoords); // Lock-in the submitted coords for post-result map
        setHasSubmitted(true);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] relative flex flex-col font-sans selection:bg-white/20 overflow-x-hidden">
        <TopNavbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-white p-20 text-center font-bold uppercase font-mono animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!activeRoomId) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] relative flex flex-col font-sans selection:bg-white/20 overflow-x-hidden">
        <TopNavbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-[#161922]/90 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-[#ffcc00]" />
             
             <h1 className="text-4xl text-white font-bold tracking-widest uppercase mb-2 flex items-center gap-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
               <LogIn size={28} className="text-[#ffcc00]" /> Join Room
             </h1>
             <p className="text-white/40 font-mono text-sm mb-8 leading-relaxed">Enter the room code provided by the Admin.</p>

             {errorStatus && (
               <div className="bg-red-500/10 border border-red-500/50 text-red-500 font-bold font-mono text-sm p-3 mb-6 rounded flex items-center gap-2">
                 <AlertTriangle size={16} /> {errorStatus}
               </div>
             )}

             <form onSubmit={handleConnect} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                   <label className="text-white/60 font-bold uppercase tracking-widest text-sm" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Logged In As</label>
                   <div className="flex items-center gap-3 p-3 rounded border bg-[#ffcc00]/10 border-[#ffcc00]/50 text-[#ffcc00]">
                      <img src={user.avatar} className="w-8 h-8 rounded-full border border-[#ffcc00]" />
                      <span className="font-bold tracking-widest uppercase font-mono">{user.name}</span>
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                   <label className="text-white/60 font-bold uppercase tracking-widest text-sm" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Enter Access Code</label>
                   <input
                     type="text"
                     placeholder="e.g. A1B2C3"
                     maxLength={6}
                     value={roomCode}
                     onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                     className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-xl tracking-[0.2em] outline-none focus:border-[#ffcc00]/50 text-center uppercase shadow-inner"
                   />
                </div>

                <button
                  type="submit"
                  disabled={roomCode.length < 3}
                  className="w-full bg-[#ffcc00] hover:bg-[#ffdf4d] text-black px-8 py-4 rounded-xl font-bold tracking-widest uppercase text-lg transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,204,0,0.2)] hover:shadow-[0_0_30px_rgba(255,204,0,0.4)] mt-2"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  Join Game
                </button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  // Connected to Room UI checks
  if (!room) return <div className="text-white p-20 text-center font-bold tracking-widest uppercase font-mono animate-pulse">Connecting to Server...</div>;
  if (!myPlayer) return <div className="text-white p-20 text-center font-bold tracking-widest uppercase font-mono animate-pulse">Waiting for Admin...</div>;

  return (
    <div className="min-h-screen mt-4 bg-[#0a0a0c] relative flex flex-col font-sans selection:bg-white/20 overflow-x-hidden">
      <div className="fixed inset-0 z-0 opacity-[0.1] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <TopNavbar />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 flex flex-col items-center">
        {/* Header HUD */}
        <div className="w-full flex justify-between items-center bg-[#161922] border border-white/5 px-6 py-4 rounded-xl shadow-lg mb-8">
           <div className="flex items-center gap-4">
              <img src={myPlayer.avatar} alt="Profile" className="w-12 h-12 rounded-full border border-[#ffcc00]/50 shadow-[0_0_10px_rgba(255,204,0,0.3)]" />
              <div>
                 <div className="text-white font-bold tracking-widest uppercase text-xl" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{myPlayer.name}</div>
                 <div className="text-[#ffcc00] font-mono text-sm uppercase">Total PTS: <span className="font-bold">{myPlayer.roomScore}</span></div>
              </div>
           </div>
           <div className="text-right">
              <div className="text-white/40 font-bold tracking-widest text-xs uppercase font-mono mb-1">Network: {room.name}</div>
              <div className="bg-black/60 border border-white/10 px-3 py-1 rounded font-mono text-[#ffcc00] font-bold tracking-widest shadow-inner text-sm">{room.code}</div>
           </div>
        </div>

        {/* Dynamic States */}
        {!activeChallenge ? (
          <div className="flex flex-col items-center justify-center py-20 border border-white/5 bg-[#161922]/50 rounded-2xl w-full max-w-3xl shadow-xl animate-in zoom-in-95 duration-500 backdrop-blur-md">
            <MonitorPlay size={64} className="text-white/10 mb-6" />
            <h2 className="text-3xl text-white font-bold tracking-widest uppercase mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Standby Mode</h2>
            <p className="text-white/40 font-mono text-center max-w-sm">No operation is currently active. Await instruction from the Game Master.</p>
          </div>
        ) : activeChallenge.status === 'waiting' ? (
          <div className="flex flex-col items-center justify-center py-16 border border-[#ffcc00]/20 bg-[#ffcc00]/5 rounded-2xl w-full max-w-3xl shadow-[0_0_40px_rgba(255,204,0,0.05)] animate-in slide-in-from-bottom-8 duration-500 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#ffcc00] opacity-50 shadow-[0_0_15px_#ffcc00]" />
            <Lock size={64} className="text-[#ffcc00] mb-6 opacity-80" />
            <h2 className="text-4xl text-white font-bold tracking-widest uppercase mb-4 drop-shadow-[0_0_10px_rgba(255,204,0,0.3)]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Mission Pre-check</h2>
            <p className="text-white/60 font-mono text-center max-w-md mb-8">Intelligence packets have been dispatched. Complete pre-flight checks to clear launch status.</p>
            
            <div className="flex flex-col gap-4 w-full max-w-sm">
               <button
                 onClick={() => setPlayerLoadedAssets(room.id, myPlayer.id, true)}
                 disabled={myPlayer.hasLoadedAssets}
                 className={`flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all ${myPlayer.hasLoadedAssets ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}
                 style={{ fontFamily: "'Rajdhani', sans-serif" }}
               >
                 {myPlayer.hasLoadedAssets ? <><CheckCircle2 size={20} /> Assets Loaded</> : <><Download size={20} /> Compile Intelligence</>}
               </button>

               <button
                 onClick={() => setPlayerReady(room.id, myPlayer.id, true)}
                 disabled={!myPlayer.hasLoadedAssets || myPlayer.isReady}
                 className={`flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] ${myPlayer.isReady ? 'bg-[#ffcc00]/20 text-[#ffcc00] border border-[#ffcc00]/50' : myPlayer.hasLoadedAssets ? 'bg-[#ffcc00] hover:bg-[#ffdf4d] text- কালো' : 'bg-black/40 text-white/20 border border-white/5'}`}
                 style={{ fontFamily: "'Rajdhani', sans-serif" }}
               >
                 {myPlayer.isReady ? <><CheckCircle2 size={20} /> Ready for Launch</> : <><Target size={20} /> Confirm Ready</>}
               </button>
            </div>
          </div>
        ) : activeChallenge.status === 'active' || activeChallenge.status === 'completed' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Left Panel: Inputs & Target Image OR Results */}
            <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1 h-full">
              {myResult || activeChallenge.status === 'completed' ? (
                 <div className="bg-[#161922]/90 border border-[#ffcc00]/30 rounded-2xl p-8 shadow-xl backdrop-blur-md flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(255,204,0,0.1)] h-full overflow-hidden min-h-[500px]">
                  <CheckCircle2 size={64} className="text-[#ffcc00] mb-4" />
                  <h2 className="text-3xl lg:text-4xl text-white font-bold tracking-widest uppercase mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    Submission Locked!
                  </h2>
                  
                  {myResult ? (
                    <div className="flex flex-col gap-3 mt-4 text-white/80 font-mono text-lg bg-black/40 border border-white/10 p-5 rounded-xl w-full">
                      <div className="flex flex-col sm:flex-row justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/50 text-sm">Target Drift:</span>
                        <span className="text-white font-bold">{Math.round(myResult.distance)} Units</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/50 text-sm">Action Time:</span>
                        <span className="text-white font-bold">{myResult.timeTaken}s</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-center py-2 pt-4">
                        <span className="text-white/50 text-sm">Reward:</span>
                        <span className="text-[#ffcc00] text-4xl lg:text-5xl font-bold drop-shadow-[0_0_10px_rgba(255,204,0,0.5)] bg-[#ffcc00]/10 px-4 py-1 rounded">+{myResult.points}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-red-400 font-mono bg-red-500/10 p-4 border border-red-500/20 rounded-xl">
                       You timed out and gained 0 points for this operation.
                    </div>
                  )}

                  <p className="text-[#ffcc00]/60 text-sm mt-8 pt-4 w-full font-bold tracking-widest uppercase border-t border-white/10" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    Standby for next broadcast
                  </p>
                </div>
              ) : (
                <div className="bg-[#161922]/90 border border-red-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-4 relative overflow-hidden h-fit">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500 opacity-60 shadow-[0_0_15px_#ef4444]" />
                    
                    <div className="flex justify-between items-center mb-2">
                       <h3 className="text-white font-bold uppercase tracking-widest text-lg flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                         <MonitorPlay size={18} className="text-red-400" /> OPERATION ACTIVE
                       </h3>
                       <div className={`font-mono font-bold text-xl px-3 py-1 bg-black/50 border rounded flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-500 border-red-500/50 animate-pulse' : 'text-[#ffcc00] border-[#ffcc00]/30'}`}>
                          <Timer size={18} /> 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                       </div>
                    </div>
                    
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-white/10 bg-black/60 flex items-center justify-center shadow-lg">
                      {activeChallenge.image ? (
                        <img src={activeChallenge.image} alt="Target Intel" className="object-cover w-full h-full" />
                      ) : (
                        <div className="text-white/20 flex flex-col items-center gap-2"><Target size={48} /><span className="font-mono text-sm">NO VISUAL</span></div>
                      )}
                    </div>
                    
                    <p className="text-white/40 text-sm font-mono mt-2 leading-relaxed tracking-tight">
                       Analyze the intelligence and mark the location. Speed matters - bonus points awarded for rapid securement.
                    </p>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <button
                        onClick={handleSubmit}
                        disabled={!guessCoords || !!myResult || hasSubmitted}
                        className="w-full flex justify-center items-center gap-3 bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-white px-4 sm:px-8 py-4 rounded-xl font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] disabled:shadow-none hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        <MapPin size={24} /> Submit Target Lock
                      </button>
                      {!guessCoords && (
                         <div className="flex flex-wrap justify-center mt-4">
                            <span className="px-2 py-1 bg-white/5 text-white/50 text-xs rounded border border-white/10 uppercase font-bold tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Pending Tac-Map Pin</span>
                         </div>
                      )}
                    </div>
                </div>
              )}
            </div>

            {/* Right Panel: Tac-Map */}
            <div className="lg:col-span-8 flex flex-col h-[60vh] lg:h-auto lg:min-h-[700px] bg-[#161922]/90 border border-white/10 rounded-2xl p-3 shadow-2xl backdrop-blur-md relative order-1 lg:order-2">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none bg-black/80 backdrop-blur-lg border border-[#ffcc00]/30 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                <span className="text-white font-bold tracking-widest text-sm sm:text-base uppercase flex items-center gap-2 whitespace-nowrap" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  <MapPin size={18} className="text-[#ffcc00]" /> 
                  <span className="text-[#ffcc00]">Target Area</span> {myResult ? "- Locked" : "- Engage"}
                </span>
              </div>
              
              <div className="w-full h-full rounded-xl overflow-hidden border border-white/5 bg-[#053446ff] relative shadow-inner">
                <InteractiveMap 
                  selectedLocation={submittedCoords || guessCoords} 
                  onLocationSelect={myResult ? () => {} : setGuessCoords} 
                  correctLocation={myResult ? activeChallenge.targetCoords : null}
                  readOnly={!!myResult || activeChallenge.status === 'completed'}
                />
              </div>
            </div>
          </div>
        ) : null}

      </div>


      {showSummaryModal && room && (
        <ChallengeSummaryModal
          players={room.players}
          challengeResults={summaryChallengeResults}
          previousRanking={previousRanking}
          onClose={() => setShowSummaryModal(false)}
        />
      )}
    </div>
  );
}

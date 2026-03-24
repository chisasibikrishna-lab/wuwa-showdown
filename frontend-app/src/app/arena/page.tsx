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
        joinRoom(upCode, user as any);
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
        setSubmittedCoords(guessCoords);
        setHasSubmitted(true);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen  relative flex flex-col selection:bg-white/20 overflow-x-hidden">
        <TopNavbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-white/60 p-20 text-center font-medium text-sm tracking-wide animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!activeRoomId) {
    return (
      <div className="min-h-screen  relative flex flex-col selection:bg-white/20 overflow-x-hidden">
        <TopNavbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-white/[0.06] rounded-2xl p-10 max-w-[420px] w-full shadow-2xl shadow-black/50 relative overflow-hidden">
             {/* Top accent line */}
             <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#ffcc00] via-[#ffcc00] to-[#ffcc00]/40" />
             
             {/* Header */}
             <div className="flex items-center gap-3 mb-2 mt-2">
               <div className="w-10 h-10 rounded-xl bg-[#ffcc00]/10 border border-[#ffcc00]/20 flex items-center justify-center">
                 <LogIn size={20} className="text-[#ffcc00]" />
               </div>
               <h1 className="text-2xl text-white font-semibold tracking-tight">
                 Join Room
               </h1>
             </div>
             <p className="text-white/40 text-sm mb-8 leading-relaxed">
               Enter the room code provided by the Admin.
             </p>

             {errorStatus && (
               <div className="bg-red-500/8 border border-red-500/20 text-red-400 font-medium text-sm p-3.5 mb-6 rounded-xl flex items-center gap-2.5">
                 <AlertTriangle size={16} className="shrink-0" /> {errorStatus}
               </div>
             )}

             <form onSubmit={handleConnect} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                   <label className="text-white/50 font-medium text-xs tracking-wide uppercase">Logged In As</label>
                   <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-[#ffcc00]/5 border-[#ffcc00]/15 text-[#ffcc00]">
                      <img src={user.avatar} className="w-8 h-8 rounded-full border border-[#ffcc00]/30" />
                      <span className="font-semibold tracking-wide text-sm">{user.name}</span>
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                   <label className="text-white/50 font-medium text-xs tracking-wide uppercase">Enter Access Code</label>
                   <input
                     type="text"
                     placeholder="e.g. A1B2C3"
                     maxLength={6}
                     value={roomCode}
                     onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                     className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white font-mono text-lg tracking-[0.25em] outline-none focus:border-[#ffcc00]/40 focus:bg-white/[0.05] text-center uppercase transition-all duration-200 placeholder:text-white/20"
                   />
                </div>

                <button
                  type="submit"
                  disabled={roomCode.length < 3}
                  className="w-full bg-[#ffcc00] hover:bg-[#ffe066] text-black px-8 py-3.5 rounded-xl font-semibold tracking-wide text-[15px] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(255,204,0,0.15)] hover:shadow-[0_0_32px_rgba(255,204,0,0.25)] mt-1"
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
  if (!room) return <div className="text-white/50 p-20 text-center font-medium text-sm tracking-wide animate-pulse">Connecting to Server...</div>;
  if (!myPlayer) return <div className="text-white/50 p-20 text-center font-medium text-sm tracking-wide animate-pulse">Waiting for Admin...</div>;

  return (
    <div className=" relative flex flex-col justify-center selection:bg-white/20 overflow-x-hidden">
      <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <TopNavbar />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col items-center">
        {/* Header HUD */}
        <div className="w-full mt-[10vh] flex justify-between items-center bg-[#111318] border border-white/[0.06] px-6 py-5 rounded-2xl shadow-xl shadow-black/30 mb-8">
           <div className="flex items-center gap-4">
              <img src={myPlayer.avatar} alt="Profile" className="w-11 h-11 rounded-full border border-[#ffcc00]/30 shadow-[0_0_12px_rgba(255,204,0,0.15)]" />
              <div>
                 <div className="text-white font-semibold tracking-tight text-lg">{myPlayer.name}</div>
                 <div className="text-[#ffcc00] font-mono text-xs tracking-wide mt-0.5">TOTAL PTS: <span className="font-bold">{myPlayer.roomScore}</span></div>
              </div>
           </div>
           <div className="text-right">
              <div className="text-white/30 font-medium tracking-wide text-xs uppercase mb-1.5">{room.name}</div>
              <div className="bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-lg font-mono text-[#ffcc00] font-semibold tracking-[0.15em] text-sm">{room.code}</div>
           </div>
        </div>

        {/* Dynamic States */}
        {!activeChallenge ? (
          <div className="flex flex-col items-center justify-center py-24 border border-white/[0.04] bg-[#111318]/60 rounded-2xl w-full max-w-3xl shadow-xl backdrop-blur-sm">
            <MonitorPlay size={56} className="text-white/[0.06] mb-6" />
            <h2 className="text-2xl text-white font-semibold tracking-tight mb-2">Standby Mode</h2>
            <p className="text-white/35 text-sm text-center max-w-sm leading-relaxed">No operation is currently active. Await instruction from the Game Master.</p>
          </div>
        ) : activeChallenge.status === 'waiting' ? (
          <div className="flex flex-col items-center justify-center py-16 border border-[#ffcc00]/15 bg-[#ffcc00]/[0.02] rounded-2xl w-full max-w-3xl shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ffcc00] to-transparent opacity-60" />
            <Lock size={52} className="text-[#ffcc00]/70 mb-6" />
            <h2 className="text-3xl text-white font-semibold tracking-tight mb-3">Mission Pre-check</h2>
            <p className="text-white/45 text-sm text-center max-w-md mb-10 leading-relaxed">Intelligence packets have been dispatched. Complete pre-flight checks to clear launch status.</p>
            
            <div className="flex flex-col  gap-3 w-full max-w-sm">
               <button
                 onClick={() => setPlayerLoadedAssets(room.id, myPlayer.id, true)}
                 disabled={myPlayer.hasLoadedAssets}
                 className={`flex items-center justify-center gap-3 w-full py-4 rounded-xl font-medium tracking-wide text-sm transition-all duration-200 ${myPlayer.hasLoadedAssets ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08]'}`}
               >
                 {myPlayer.hasLoadedAssets ? <><CheckCircle2 size={18} /> Assets Loaded</> : <><Download size={18} /> Compile Intelligence</>}
               </button>

               <button
                 onClick={() => setPlayerReady(room.id, myPlayer.id, true)}
                 disabled={!myPlayer.hasLoadedAssets || myPlayer.isReady}
                 className={`flex items-center justify-center gap-3 w-full py-4 rounded-xl font-medium tracking-wide text-sm transition-all duration-200 ${myPlayer.isReady ? 'bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/20' : myPlayer.hasLoadedAssets ? 'bg-[#ffcc00] hover:bg-[#ffe066] text-black' : 'bg-white/[0.02] text-white/20 border border-white/[0.04]'}`}
               >
                 {myPlayer.isReady ? <><CheckCircle2 size={18} /> Ready for Launch</> : <><Target size={18} /> Confirm Ready</>}
               </button>
            </div>
          </div>
        ) : activeChallenge.status === 'active' || activeChallenge.status === 'completed' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full ">
            {/* Left Panel: Inputs & Target Image OR Results */}
            <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1 h-full">
              {myResult || activeChallenge.status === 'completed' ? (
                 <div className="bg-[#111318] border border-[#ffcc00]/15 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center h-full overflow-hidden min-h-[500px]">
                  <CheckCircle2 size={52} className="text-[#ffcc00]/80 mb-5" />
                  <h2 className="text-2xl lg:text-3xl text-white font-semibold tracking-tight mb-4">
                    Submission Locked
                  </h2>
                  
                  {myResult ? (
                    <div className="flex flex-col gap-0 mt-2 w-full bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                      <div className="flex justify-between items-center px-5 py-4 border-b border-white/[0.05]">
                        <span className="text-white/40 text-sm">Target Drift</span>
                        <span className="text-white font-semibold text-sm">{Math.round(myResult.distance)} Units</span>
                      </div>
                      <div className="flex justify-between items-center px-5 py-4 border-b border-white/[0.05]">
                        <span className="text-white/40 text-sm">Action Time</span>
                        <span className="text-white font-semibold text-sm">{myResult.timeTaken}s</span>
                      </div>
                      <div className="flex justify-between items-center px-5 py-5">
                        <span className="text-white/40 text-sm">Reward</span>
                        <span className="text-[#ffcc00] text-3xl font-bold">+{myResult.points}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-red-400/80 text-sm bg-red-500/5 p-4 border border-red-500/10 rounded-xl leading-relaxed">
                       You timed out and gained 0 points for this operation.
                    </div>
                  )}

                  <p className="text-white/25 text-xs mt-8 pt-4 w-full font-medium tracking-wide uppercase border-t border-white/[0.05]">
                    Standby for next broadcast
                  </p>
                </div>
              ) : (
                <div className="bg-[#111318] border border-red-500/15 rounded-2xl p-6 shadow-xl flex flex-col gap-4 relative overflow-hidden h-fit">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
                    
                    <div className="flex justify-between items-center mb-1">
                       <h3 className="text-white font-semibold text-sm tracking-wide flex items-center gap-2 uppercase">
                         <MonitorPlay size={16} className="text-red-400" /> Operation Active
                       </h3>
                       <div className={`font-mono font-semibold text-lg px-3 py-1.5 bg-black/40 border rounded-lg flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-400 border-red-500/30 animate-pulse' : 'text-[#ffcc00] border-[#ffcc00]/20'}`}>
                          <Timer size={16} /> 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                       </div>
                    </div>
                    
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/[0.06] bg-black/40 flex items-center justify-center shadow-lg">
                      {activeChallenge.image ? (
                        <img src={activeChallenge.image} alt="Target Intel" className="object-cover w-full h-full" />
                      ) : (
                        <div className="text-white/15 flex flex-col items-center gap-2"><Target size={40} /><span className="text-xs font-medium">NO VISUAL</span></div>
                      )}
                    </div>
                    
                    <p className="text-white/30 text-sm leading-relaxed">
                       Analyze the intelligence and mark the location. Speed matters — bonus points awarded for rapid confirmation.
                    </p>

                    <div className="mt-3 pt-4 border-t border-white/[0.05]">
                      <button
                        onClick={handleSubmit}
                        disabled={!guessCoords || !!myResult || hasSubmitted}
                        className="w-full flex justify-center items-center gap-3 bg-red-500 hover:bg-red-600 disabled:opacity-25 disabled:cursor-not-allowed text-white px-4 sm:px-8 py-4 rounded-xl font-semibold tracking-wide text-sm transition-all duration-200 shadow-[0_0_20px_rgba(239,68,68,0.15)] disabled:shadow-none hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                      >
                        <MapPin size={20} /> Submit Target Lock
                      </button>
                      {!guessCoords && (
                         <div className="flex flex-wrap justify-center mt-4">
                            <span className="px-3 py-1.5 bg-white/[0.03] text-white/35 text-xs rounded-lg border border-white/[0.06] font-medium tracking-wide">Pending Tac-Map Pin</span>
                         </div>
                      )}
                    </div>
                </div>
              )}
            </div>

            {/* Right Panel: Tac-Map */}
            <div className="lg:col-span-8 flex flex-col h-[60vh] lg:h-auto lg:min-h-[700px] bg-[#111318] border border-white/[0.06] rounded-2xl p-3 shadow-2xl shadow-black/30 relative order-1 lg:order-2">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none bg-black/80 backdrop-blur-xl border border-[#ffcc00]/20 px-5 py-2 rounded-full shadow-xl">
                <span className="text-white font-medium tracking-wide text-sm flex items-center gap-2 whitespace-nowrap">
                  <MapPin size={16} className="text-[#ffcc00]" /> 
                  <span className="text-[#ffcc00]">Target Area</span> {myResult ? "— Locked" : "— Engage"}
                </span>
              </div>
              
              <div className="w-full h-full rounded-xl overflow-hidden border border-white/[0.04] bg-[#053446ff] relative shadow-inner">
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

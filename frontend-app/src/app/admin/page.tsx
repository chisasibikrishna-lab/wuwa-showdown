"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTournament, Room, Challenge, RoomPlayer, ChallengeResult } from "@/context/TournamentContext";
import ChallengeSummaryModal from "@/components/ChallengeSummaryModal";
import { Plus, Minus, Trash2, MapPin, Upload, X, ArrowLeft, Users, CheckCircle, Timer } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
});

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function AdminPage() {
  const { rooms, createRoom, deleteRoom } = useTournament();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      createRoom(newRoomName.trim(), user?.name || "Game Master");
      setNewRoomName("");
    }
  };

  if (isLoading || !user || user.role !== "admin") {
    return <div className="p-20 text-white font-mono uppercase tracking-widest animate-pulse text-center w-full min-h-screen flex items-center justify-center">Checking Permissions...</div>;
  }

  if (!selectedRoomId) {
    return (
      <div className="w-full max-w-[1000px] mx-auto px-4 py-8 animate-in fade-in zoom-in-95 duration-500 min-h-screen">
        <h1 className="text-3xl sm:text-4xl text-white font-bold tracking-widest uppercase mb-8 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(255,204,0,0.2)]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          <SettingsIcon className="text-[#ffcc00] animate-[spin_4s_linear_infinite]" />
          Tournament Admin Panel
        </h1>

        <div className="bg-[#161922]/80 border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-md mb-8">
          <h2 className="text-[#ffcc00] font-bold uppercase tracking-widest text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
             <Users size={18} /> Create New Room
          </h2>
          <form onSubmit={handleCreateRoom} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter Room Name..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#ffcc00]/50 transition-colors font-mono"
            />
            <button type="submit" className="bg-[#ffcc00] hover:bg-[#ffdf4d] text-black px-8 py-3 rounded-lg font-bold tracking-widest uppercase transition-colors" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              Create Room
            </button>
          </form>
        </div>

        <h2 className="text-white/50 font-bold uppercase tracking-widest text-sm mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Active Rooms ({rooms.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map(room => (
            <div key={room.id} className="bg-[#161922]/60 border border-white/5 rounded-xl p-5 hover:bg-[#161922] hover:border-white/20 transition-all group flex flex-col justify-between h-44 shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-bold text-2xl tracking-wider uppercase truncate" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{room.name}</h3>
                  <button onClick={() => deleteRoom(room.id)} className="text-white/20 hover:text-red-500 transition-colors p-1" title="Delete Room"><Trash2 size={16} /></button>
                </div>
                <div className="text-white/40 text-xs font-mono mb-1">Created by: <span className="text-white/60">{room.creator}</span></div>
                <div className="text-white/40 text-xs font-mono">Date: {new Date(room.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="bg-black/50 px-3 py-1 rounded border border-[#ffcc00]/30 font-mono text-[#ffcc00] font-bold text-sm tracking-widest">CODE: {room.code}</div>
                <button
                  onClick={() => setSelectedRoomId(room.id)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-2 rounded-lg text-white font-bold tracking-widest uppercase text-sm transition-all group-hover:bg-[#ffcc00] group-hover:text-black group-hover:border-[#ffcc00]"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  GO &rarr;
                </button>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="col-span-full py-16 text-center border border-white/5 border-dashed rounded-xl text-white/40 font-bold tracking-widest uppercase text-sm" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              No Active Rooms. Create one above to manage games.
            </div>
          )}
        </div>
      </div>
    );
  }

  const room = rooms.find(r => r.id === selectedRoomId);
  if (!room) {
    setSelectedRoomId(null);
    return null;
  }

  return <AdminRoomDashboard room={room} onBack={() => setSelectedRoomId(null)} />;
}

function AdminRoomDashboard({ room, onBack }: { room: Room, onBack: () => void }) {
  const { addRoomPoints, removeRoomPoints, resetRoomLeaderboard, createChallenge, startChallengeLobby, launchChallenge, endChallenge } = useTournament();
  const [activeTab, setActiveTab] = useState<"points" | "challenges">("challenges");
  
  const [pointsInput, setPointsInput] = useState<Record<number, string>>({});
  const [previousRanking, setPreviousRanking] = useState<RoomPlayer[]>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryChallengeId, setSummaryChallengeId] = useState<string | null>(null);
  const [summaryChallengeResults, setSummaryChallengeResults] = useState<ChallengeResult[]>([]);

  const handlePointsChange = (id: number, points: string) => setPointsInput({ ...pointsInput, [id]: points });

  const [geoImage, setGeoImage] = useState<string | null>(null);
  const [geoCoords, setGeoCoords] = useState<[number, number] | null>(null);
  const [timeLimit, setTimeLimit] = useState(60);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setGeoImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateChallenge = () => {
    if (geoImage && geoCoords) {
      createChallenge(room.id, geoImage, geoCoords, timeLimit);
      setGeoImage(null);
      setGeoCoords(null);
      setTimeLimit(60);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const activeChallenge = room.activeChallengeId ? room.challenges.find(c => c.id === room.activeChallengeId) : null;
  // Make sure ALL players in the room are both loaded and ready
  const allReady = room.players.length > 0 && room.players.every(p => p.hasLoadedAssets && p.isReady);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (activeChallenge?.status === 'active') {
      setPreviousRanking([...room.players].sort((a,b)=>b.roomScore-a.roomScore));
      setSummaryChallengeId(null);
      setSummaryChallengeResults([]);
      setShowSummaryModal(false);
    }
  }, [activeChallenge?.status, room.players]);

  useEffect(() => {
    const completed = room.challenges.filter(c => c.status === 'completed');
    if (completed.length === 0) return;

    const latestCompleted = completed[completed.length - 1];
    if (latestCompleted.id === summaryChallengeId) return;

    setSummaryChallengeId(latestCompleted.id);
    setSummaryChallengeResults(latestCompleted.results);
    setShowSummaryModal(true);
  }, [room.challenges, summaryChallengeId]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (activeChallenge?.status === 'active' && activeChallenge.startedAt) {
       const elapsed = Math.floor((Date.now() - activeChallenge.startedAt) / 1000);
       const remaining = Math.max(0, activeChallenge.timeLimitSeconds - elapsed);
       if (remaining === 0) {
          endChallenge(room.id, activeChallenge.id);
       } else {
          timeout = setTimeout(() => {
             endChallenge(room.id, activeChallenge.id);
          }, remaining * 1000);
       }
    }
    return () => clearTimeout(timeout);
  }, [activeChallenge?.status, activeChallenge?.startedAt, activeChallenge?.timeLimitSeconds, room.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeChallenge?.status === 'active' && activeChallenge.startedAt) {
      const update = () => {
        const elapsed = Math.floor((Date.now() - activeChallenge.startedAt!) / 1000);
        setChallengeTimeLeft(Math.max(0, activeChallenge.timeLimitSeconds - elapsed));
      };
      update();
      interval = setInterval(update, 500);
    } else {
      setChallengeTimeLeft(null);
    }
    return () => clearInterval(interval);
  }, [activeChallenge?.status, activeChallenge?.startedAt, activeChallenge?.timeLimitSeconds]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all uppercase font-bold tracking-widest text-xs mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
        <ArrowLeft size={16} /> Back to Rooms
      </button>

      {/* Room Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 bg-[#161922]/80 border border-white/10 p-6 rounded-2xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#ffcc00] shadow-[0_0_15px_#ffcc00]" />
        <div>
          <h2 className="text-white/50 text-xs font-bold tracking-widest uppercase mb-1 font-mono">Room Control Panel</h2>
          <h1 className="text-4xl sm:text-5xl text-white font-bold tracking-widest uppercase mb-2 drop-shadow-[0_0_10px_rgba(255,204,0,0.3)]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {room.name}
          </h1>
          <div className="flex items-center gap-4 mt-2">
             <div className="bg-black/80 px-4 py-1.5 rounded-lg border border-[#ffcc00]/50 font-mono text-[#ffcc00] font-bold text-sm shadow-[0_0_10px_rgba(255,204,0,0.2)] tracking-widest">CODE: {room.code}</div>
             <div className="text-white/40 text-xs font-mono uppercase bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <Users size={14} /> {room.players.length} Players Connected
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("challenges")}
          className={`whitespace-nowrap px-8 py-3 font-bold tracking-widest text-sm uppercase transition-all relative rounded-t-lg ${activeTab === "challenges" ? "text-black bg-[#ffcc00]" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          Mission Control
        </button>
        <button
          onClick={() => setActiveTab("points")}
          className={`whitespace-nowrap px-8 py-3 font-bold tracking-widest text-sm uppercase transition-all relative rounded-t-lg ${activeTab === "points" ? "text-black bg-[#ffcc00]" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          Room Leaderboard
        </button>
      </div>

      {/* Points Tab */}
      {activeTab === "points" && (
        <div className="animate-in fade-in duration-300 flex flex-col gap-4">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => resetRoomLeaderboard(room.id)}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/30 transition-all font-bold tracking-widest text-sm uppercase"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              <Trash2 size={16} /> Data Wipe Scores
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {room.players.length === 0 ? (
              <div className="text-center text-white/40 py-16 border border-white/5 border-dashed rounded-xl uppercase font-bold tracking-widest shadow-inner bg-black/20" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                No players have joined this room yet. Share the code: <span className="text-[#ffcc00] ml-2">{room.code}</span>
              </div>
            ) : (
                [...room.players].sort((a,b) => b.roomScore - a.roomScore).map((player, idx) => (
                  <div key={player.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#161922]/60 border border-white/5 rounded-xl hover:bg-[#161922] hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg font-mono ${idx === 0 ? "bg-[#ffcc00] text-black shadow-[0_0_15px_#ffcc00]" : idx === 1 ? "bg-slate-300 text-black shadow-[0_0_10px_#cbd5e1]" : idx === 2 ? "bg-orange-400 text-black shadow-[0_0_10px_#fb923c]" : "bg-white/5 text-white/30 border border-white/10"}`}>
                        #{idx + 1}
                      </div>
                      <img src={player.avatar} alt="avatar" className="w-12 h-12 rounded-full border border-white/10 bg-black" />
                      <div>
                        <div className="text-white font-bold tracking-widest uppercase text-lg hidden sm:block" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{player.name}</div>
                        <div className="text-white font-bold tracking-widest uppercase text-base sm:hidden" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{player.name.substring(0, 15)}</div>
                        <div className="text-[#ffcc00] font-bold text-2xl leading-none mt-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{player.roomScore} PTS</div>
                      </div>
                    </div>

                    <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/10 w-full sm:w-auto mt-2 sm:mt-0 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => removeRoomPoints(room.id, player.id, Number(pointsInput[player.id]) || 1)} className="flex-1 sm:w-12 h-12 flex items-center justify-center text-red-400 hover:bg-red-400/20 rounded-md transition-colors"><Minus size={20} /></button>
                      <input type="number" min="1" placeholder="1" value={pointsInput[player.id] || ""} onChange={(e) => handlePointsChange(player.id, e.target.value)} className="w-20 bg-transparent text-center text-white font-mono text-lg outline-none border-x border-white/10" />
                      <button onClick={() => addRoomPoints(room.id, player.id, Number(pointsInput[player.id]) || 1)} className="flex-1 sm:w-12 h-12 flex items-center justify-center text-green-400 hover:bg-green-400/20 rounded-md transition-colors"><Plus size={20} /></button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === "challenges" && (
        <div className="animate-in fade-in duration-300 flex flex-col gap-10">
          
          {/* Active / Waiting Challenge UI */}
          {activeChallenge ? (
            <div className={`border rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-700 ${activeChallenge.status === 'waiting' ? 'bg-[#ffcc00]/5 border-[#ffcc00]/30' : 'bg-red-500/10 border-red-500/40'}`}>
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 ${activeChallenge.status === 'waiting' ? 'text-[#ffcc00]' : 'text-red-500'}`} />
              
              <div className="flex flex-col items-center text-center w-full">
                {activeChallenge.status === 'waiting' ? (
                  <>
                    <h2 className="text-4xl text-white font-bold tracking-widest uppercase mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Watcher System: Pre-check</h2>
                    <p className="text-[#ffcc00]/80 font-mono text-sm mb-8">Waiting for all competitors to finish compiling map assets and mark ready status.</p>
                    
                    <div className="w-full max-w-2xl bg-black/60 border border-white/10 rounded-xl p-6 mb-10 h-fit max-h-[300px] overflow-y-auto custom-scrollbar text-left">
                       <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 sticky top-0 bg-black/80 backdrop-blur z-10 pt-2 -mt-2">
                          <span className="text-white/60 font-bold uppercase tracking-widest text-sm font-mono flex items-center gap-2"><Users size={16} /> Roster Readiness</span>
                          <span className={`font-bold font-mono px-3 py-1 rounded text-sm ${allReady ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/20'}`}>
                            {room.players.filter(p => p.hasLoadedAssets && p.isReady).length} / {room.players.length} READY
                          </span>
                       </div>
                       
                       <div className="flex flex-col gap-2">
                         {room.players.map(p => (
                            <div key={p.id} className="flex flex-col sm:flex-row items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                               <div className="flex items-center gap-3 w-full sm:w-auto mb-3 sm:mb-0">
                                 <img src={p.avatar} alt="av" className="w-8 h-8 rounded-full" />
                                 <span className="text-white font-bold tracking-widest uppercase text-sm" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{p.name}</span>
                               </div>
                               <div className="flex gap-4 sm:gap-6">
                                 <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-white/5">
                                    <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Assets</span>
                                    {p.hasLoadedAssets ? <CheckCircle size={16} className="text-green-500" /> : <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />}
                                 </div>
                                 <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-white/5">
                                    <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Ready</span>
                                    {p.isReady ? <CheckCircle size={16} className="text-[#ffcc00]" /> : <div className="w-4 h-4 border-2 border-white/20 rounded-full" />}
                                 </div>
                               </div>
                            </div>
                         ))}
                         {room.players.length === 0 && <span className="text-white/40 text-sm py-8 text-center uppercase tracking-widest font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Empty Room. Nobody to launch...</span>}
                       </div>
                    </div>

                    <button
                      onClick={() => launchChallenge(room.id, activeChallenge.id)}
                      disabled={!allReady || room.players.length === 0}
                      className="bg-[#ffcc00] hover:bg-[#ffdf4d] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-black px-12 py-5 rounded-xl font-bold tracking-[0.2em] uppercase text-2xl transition-all shadow-[0_0_40px_rgba(255,204,0,0.3)] disabled:shadow-none hover:scale-105"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {allReady && room.players.length > 0 ? "LAUNCH MISSION" : "WAITING FOR AGENTS..."}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 border border-red-500/50 px-4 py-1.5 rounded-full text-red-500 font-bold font-mono text-sm animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-red-500" /> LIVE
                      <span className="ml-2 bg-black/40 rounded px-2 py-0.5 text-xs tracking-widest">{formatTime(challengeTimeLeft)}</span>
                    </div>
                    
                    <h2 className="text-5xl text-white font-bold tracking-widest uppercase mb-2 text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>EVENT IN PROGRESS</h2>
                    <p className="text-red-400/80 font-mono text-sm mb-10">Agents are actively tracking the coordinate. Standby for intel reception.</p>
                    
                    <div className="w-full max-w-2xl bg-[#161922] border border-white/10 rounded-xl p-6 mb-10 text-left shadow-inner">
                       <h3 className="text-white/60 font-bold uppercase tracking-widest text-sm font-mono border-b border-white/10 pb-4 mb-4 flex justify-between">
                         <span><MapPin size={16} className="inline mr-2 text-red-400"/> Live Intel Feed</span>
                         <span className="text-red-400">{activeChallenge.results.length} / {room.players.length} Received</span>
                       </h3>
                       
                       <div className="flex flex-col gap-3">
                         {activeChallenge.results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                               <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-red-500 animate-spin" />
                               <span className="text-white/40 text-sm font-mono animate-pulse uppercase tracking-[0.1em]">Awaiting radar blips...</span>
                            </div>
                         ) : (
                           [...activeChallenge.results].sort((a,b) => b.points - a.points).map((r, idx) => {
                             const p = room.players.find(x => String(x.id) === String(r.playerId));
                             return (
                               <div key={r.playerId != null ? String(r.playerId) : `result-${idx}`} className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-xl animate-in fade-in zoom-in-95 duration-500">
                                 <div className="flex items-center gap-4">
                                   <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e] animate-pulse" />
                                   <span className="text-white font-bold uppercase tracking-widest text-lg" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{p?.name}</span>
                                 </div>
                                 <div className="flex items-center gap-6">
                                   <span className="text-white/40 font-mono text-xs text-right uppercase tracking-wider hidden sm:block">
                                     Drift <span className="text-white">{Math.round(r.distance)}</span><br/>
                                     Time <span className="text-white">{r.timeTaken}s</span>
                                   </span>
                                   <div className="bg-black/40 px-4 py-2 rounded-lg border border-white/5 min-w-[80px] text-center">
                                      <span className="text-[#ffcc00] font-bold text-2xl drop-shadow-[0_0_5px_rgba(255,204,0,0.5)]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>+{r.points}</span>
                                   </div>
                                 </div>
                               </div>
                             );
                           })
                         )}
                       </div>
                    </div>

                    <button
                      onClick={() => endChallenge(room.id, activeChallenge.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-12 py-4 rounded-xl font-bold tracking-[0.2em] uppercase text-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] min-w-[300px]"
                      style={{ fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      TERMINATE EVENT
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Creator Form */}
              <div className="bg-[#161922]/80 border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md">
                <h2 className="text-[#ffcc00] font-bold uppercase tracking-widest text-xl mb-6 flex items-center gap-3" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  <MapPin size={24} /> Create New Geoguess Operation
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-4">
                    <label className="text-white/60 font-bold uppercase tracking-widest text-sm" style={{ fontFamily: "'Rajdhani', sans-serif" }}>1. Intelligence Image Payload</label>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                    {geoImage ? (
                      <div className="relative w-full aspect-video rounded-xl border border-white/20 bg-black overflow-hidden group shadow-lg">
                        <img src={geoImage} alt="Uploaded" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                        <button onClick={() => { setGeoImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"><X size={18}/></button>
                      </div>
                    ) : (
                      <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-video border-2 border-dashed border-white/10 bg-black/40 rounded-xl flex flex-col items-center justify-center gap-4 text-white/30 hover:border-[#ffcc00]/50 hover:text-[#ffcc00] hover:bg-[#ffcc00]/5 transition-all">
                         <Upload size={40} /> 
                         <span className="font-bold tracking-[0.2em] uppercase text-sm font-mono">Upload Local File</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <label className="text-white/60 font-bold uppercase tracking-widest text-sm flex justify-between" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                       <span>2. Set Tactical Coordinate</span>
                       {geoCoords && <span className="text-[#ffcc00] font-mono bg-[#ffcc00]/10 px-2 py-0.5 rounded border border-[#ffcc00]/30">{Math.round(geoCoords[0])}, {Math.round(geoCoords[1])}</span>}
                    </label>
                    <div className="w-full aspect-video rounded-xl border border-white/20 overflow-hidden bg-[#053446ff] shadow-lg">
                      <InteractiveMap selectedLocation={geoCoords} onLocationSelect={setGeoCoords} />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row items-end gap-6 bg-black/40 p-6 rounded-xl border border-white/5 mt-4">
                    <div className="flex-1 w-full relative">
                      <label className="text-white/60 font-bold uppercase tracking-widest text-sm mb-2 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                        <Timer size={16} /> Operation Time Limit (Seconds)
                      </label>
                      <input 
                        type="number" min="10" step="5" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))}
                        className="w-full bg-[#161922] border border-white/10 rounded-lg pl-4 pr-12 py-4 text-white font-mono text-xl outline-none focus:border-[#ffcc00]/50 transition-colors shadow-inner" 
                      />
                      <div className="absolute right-4 bottom-4 text-white/30 font-bold font-mono">SEC</div>
                    </div>
                    <button
                      onClick={handleCreateChallenge}
                      disabled={!geoImage || !geoCoords}
                      className="w-full md:w-auto bg-[#ffcc00] hover:bg-[#ffdf4d] text-black px-12 py-4 rounded-lg font-bold tracking-widest text-lg uppercase transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,204,0,0.15)] disabled:shadow-none min-w-[250px]"
                      style={{ fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      Register Mission
                    </button>
                  </div>
                </div>
              </div>

              {/* Mission History */}
              <div className="mt-8">
                 <h2 className="text-white/40 font-bold uppercase tracking-widest text-sm mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Operation Database</h2>
                 <div className="grid grid-cols-1 gap-3">
                    {room.challenges.map(c => (
                       <div key={c.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#161922]/50 hover:bg-[#161922] border border-white/5 rounded-xl gap-4 transition-colors">
                          <div className="flex items-center gap-6 w-full">
                            <div className="relative">
                               {c.image ? <img src={c.image} alt="C" className="w-20 h-14 object-cover rounded shadow-md border border-white/10" /> : <div className="w-20 h-14 bg-black rounded shadow-md border border-white/5" />}
                               <div className="absolute -bottom-2 -right-2 bg-black px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10 text-white/60">{c.timeLimitSeconds}s</div>
                            </div>
                            <div>
                               <div className="text-white font-bold uppercase tracking-[0.1em] text-lg" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Op. Delta-{c.id.substring(c.id.length-4)}</div>
                               <div className="text-white/40 text-xs font-mono mt-1">{c.results.length} Agents Successfully Executed</div>
                            </div>
                          </div>
                          <div className="flex items-center w-full sm:w-auto justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                             <div className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase font-mono tracking-widest ${c.status === 'pending' ? 'bg-white/5 text-white/50 border border-white/10' : c.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/20'}`}>
                               {c.status}
                             </div>
                             {c.status === 'pending' && (
                               <button 
                                 onClick={() => startChallengeLobby(room.id, c.id)}
                                 className="bg-white/5 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white px-6 py-2 rounded-md font-bold uppercase text-xs tracking-[0.1em] transition-all min-w-[120px]"
                                 style={{ fontFamily: "'Rajdhani', sans-serif" }}
                               >
                                 Commence
                               </button>
                             )}
                          </div>
                       </div>
                    ))}
                    {room.challenges.length === 0 && (
                      <div className="text-white/20 text-sm py-10 bg-black/20 border border-white/5 border-dashed rounded-xl text-center uppercase tracking-widest font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>No missions logged in database.</div>
                    )}
                 </div>
              </div>
            </>
          )}
          
        </div>
      )}

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

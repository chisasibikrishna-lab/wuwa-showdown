"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTournament, Room, Challenge, RoomPlayer, ChallengeResult } from "@/context/TournamentContext";
import ChallengeSummaryModal from "@/components/ChallengeSummaryModal";
import { Plus, Minus, Trash2, MapPin, Upload, X, ArrowLeft, Users, CheckCircle, Timer, Settings, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
});

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
    return <div className="p-20 text-white/50 text-sm font-medium tracking-wide animate-pulse text-center w-full min-h-screen flex items-center justify-center">Checking Permissions...</div>;
  }

  if (!selectedRoomId) {
    return (
      <div className="w-full max-w-[960px] mt-12 mx-auto px-4 sm:px-6 py-10">
        {/* Page Header */}
        <div className="flex items-center gap-3.5 mb-10">
          <div className="w-11 h-11 rounded-xl bg-[#ffcc00]/10 border border-[#ffcc00]/20 flex items-center justify-center">
            <Settings size={22} className="text-[#ffcc00]" />
          </div>
          <div>
            <h1 className="text-2xl text-white font-semibold tracking-tight">Tournament Admin Panel</h1>
            <p className="text-white/30 text-sm mt-0.5">Manage rooms, challenges, and player scores</p>
          </div>
        </div>

        {/* Create Room Card */}
        <div className="bg-[#111318] border border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/20 mb-10">
          <h2 className="text-white font-semibold text-sm tracking-wide uppercase flex items-center gap-2.5 mb-5">
            <Users size={16} className="text-[#ffcc00]" /> Create New Room
          </h2>
          <form onSubmit={handleCreateRoom} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter Room Name..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#ffcc00]/30 focus:bg-white/[0.05] transition-all duration-200 placeholder:text-white/20"
            />
            <button type="submit" className="bg-[#ffcc00] hover:bg-[#ffe066] text-black px-8 py-3.5 rounded-xl font-semibold tracking-wide text-sm transition-all duration-200 whitespace-nowrap shadow-[0_0_20px_rgba(255,204,0,0.1)]">
              Create Room
            </button>
          </form>
        </div>

        {/* Active Rooms */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-white/40 font-medium text-xs tracking-wide uppercase">Active Rooms ({rooms.length})</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map(room => (
            <div key={room.id} className="bg-[#111318] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-200 group flex flex-col justify-between h-48 shadow-lg shadow-black/20">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-semibold text-xl tracking-tight truncate pr-4">{room.name}</h3>
                  <button onClick={() => deleteRoom(room.id)} className="text-white/15 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 shrink-0" title="Delete Room"><Trash2 size={15} /></button>
                </div>
                <div className="text-white/30 text-xs mb-0.5">Created by: <span className="text-white/50">{room.creator}</span></div>
                <div className="text-white/30 text-xs">{new Date(room.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.04]">
                <div className="bg-white/[0.03] px-3 py-1.5 rounded-lg border border-[#ffcc00]/15 font-mono text-[#ffcc00] font-semibold text-xs tracking-[0.15em]">CODE: {room.code}</div>
                <button
                  onClick={() => setSelectedRoomId(room.id)}
                  className="bg-white/[0.04] hover:bg-[#ffcc00] border border-white/[0.08] hover:border-[#ffcc00] px-6 py-2 rounded-xl text-white hover:text-black font-semibold tracking-wide text-xs transition-all duration-200 flex items-center gap-2"
                >
                  GO <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="col-span-full py-20 text-center border border-white/[0.04] border-dashed rounded-2xl text-white/25 font-medium tracking-wide text-sm">
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
  const { addRoomPoints, removeRoomPoints, resetRoomLeaderboard, createChallenge, startChallengeLobby, launchChallenge, endChallenge, clearActiveChallenge } = useTournament();
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
  const allReady = room.players.length > 0 && room.players.every(p => p.hasLoadedAssets && p.isReady);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (activeChallenge?.status === 'active') {
      setPreviousRanking([...room.players].sort((a, b) => b.roomScore - a.roomScore));
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
    <div className="w-full mt-[5vh]  max-w-[1200px] mx-auto px-4 sm:px-6 py-10 ">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white hover:bg-white/[0.04] px-3.5 py-2 rounded-xl transition-all duration-200 font-medium text-xs tracking-wide mb-6">
        <ArrowLeft size={15} /> Back to Rooms
      </button>

      {/* Room Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 bg-[#111318] border border-white/[0.06] p-7 rounded-2xl relative overflow-hidden shadow-xl shadow-black/20">
        <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#ffcc00] to-[#ffcc00]/20" />
        <div className="ml-3">
          <span className="text-white/30 text-xs font-medium tracking-wide uppercase">Room Control Panel</span>
          <h1 className="text-3xl sm:text-4xl text-white font-semibold tracking-tight mt-1">
            {room.name}
          </h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="bg-white/[0.03] px-3.5 py-1.5 rounded-lg border border-[#ffcc00]/20 font-mono text-[#ffcc00] font-semibold text-xs tracking-[0.15em]">CODE: {room.code}</div>
            <div className="text-white/35 text-xs bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.06] flex items-center gap-2">
              <Users size={13} /> {room.players.length} Players Connected
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06] mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("challenges")}
          className={`whitespace-nowrap px-6 py-3 font-semibold tracking-wide text-sm transition-all duration-200 relative rounded-t-xl ${activeTab === "challenges" ? "text-black bg-[#ffcc00]" : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"}`}
        >
          Mission Control
        </button>
        <button
          onClick={() => setActiveTab("points")}
          className={`whitespace-nowrap px-6 py-3 font-semibold tracking-wide text-sm transition-all duration-200 relative rounded-t-xl ${activeTab === "points" ? "text-black bg-[#ffcc00]" : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"}`}
        >
          Room Leaderboard
        </button>
      </div>

      {/* Points Tab */}
      {activeTab === "points" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end mb-1">
            <button
              onClick={() => resetRoomLeaderboard(room.id)}
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
                    <img src={player.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-white/[0.08] bg-black" />
                    <div>
                      <div className="text-white font-semibold tracking-tight text-[15px]">{player.name}</div>
                      <div className="text-[#ffcc00] font-bold text-lg mt-0.5">{player.roomScore} <span className="text-xs font-medium text-[#ffcc00]/60">PTS</span></div>
                    </div>
                  </div>

                  <div className="flex gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.06] w-full sm:w-auto mt-2 sm:mt-0 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => removeRoomPoints(room.id, player.id, Number(pointsInput[player.id]) || 1)} className="flex-1 sm:w-11 h-11 flex items-center justify-center text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Minus size={18} /></button>
                    <input type="number" min="1" placeholder="1" value={pointsInput[player.id] || ""} onChange={(e) => handlePointsChange(player.id, e.target.value)} className="w-16 bg-transparent text-center text-white font-mono text-base outline-none border-x border-white/[0.06]" />
                    <button onClick={() => addRoomPoints(room.id, player.id, Number(pointsInput[player.id]) || 1)} className="flex-1 sm:w-11 h-11 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"><Plus size={18} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === "challenges" && (
        <div className="flex flex-col gap-10">

          {/* Active / Waiting Challenge UI */}
          {activeChallenge ? (
            <div className={`border rounded-2xl p-8 md:p-10 shadow-xl relative overflow-hidden transition-all duration-500 ${activeChallenge.status === 'waiting' ? 'bg-[#ffcc00]/[0.02] border-[#ffcc00]/15' : 'bg-red-500/[0.03] border-red-500/20'}`}>
              <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-40 ${activeChallenge.status === 'waiting' ? 'text-[#ffcc00]' : 'text-red-500'}`} />

              <div className="flex flex-col items-center text-center w-full">
                {activeChallenge.status === 'waiting' ? (
                  <>
                    <h2 className="text-2xl sm:text-3xl text-white font-semibold tracking-tight mb-2">Watcher System: Pre-check</h2>
                    <p className="text-white/40 text-sm mb-8 max-w-md leading-relaxed">Waiting for all competitors to finish compiling map assets and mark ready status.</p>

                    <div className="w-full max-w-2xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 mb-10 max-h-[300px] overflow-y-auto text-left">
                      <div className="flex justify-between items-center border-b border-white/[0.06] pb-4 mb-4 sticky top-0 bg-[#0a0a0c]/90 backdrop-blur-md z-10 pt-1 -mt-1">
                        <span className="text-white/40 font-medium text-xs tracking-wide uppercase flex items-center gap-2"><Users size={14} /> Roster Readiness</span>
                        <span className={`font-semibold font-mono px-3 py-1 rounded-lg text-xs ${allReady ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/15'}`}>
                          {room.players.filter(p => p.hasLoadedAssets && p.isReady).length} / {room.players.length} READY
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {room.players.map(p => (
                          <div key={p.id} className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                            <div className="flex items-center gap-3 w-full sm:w-auto mb-3 sm:mb-0">
                              <img src={p.avatar} alt="av" className="w-8 h-8 rounded-full" />
                              <span className="text-white font-medium tracking-tight text-sm">{p.name}</span>
                            </div>
                            <div className="flex gap-4">
                              <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/[0.04]">
                                <span className="text-xs text-white/30 tracking-wide">Assets</span>
                                {p.hasLoadedAssets ? <CheckCircle size={15} className="text-emerald-400" /> : <div className="w-4 h-4 border-2 border-white/15 border-t-white/60 rounded-full animate-spin" />}
                              </div>
                              <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/[0.04]">
                                <span className="text-xs text-white/30 tracking-wide">Ready</span>
                                {p.isReady ? <CheckCircle size={15} className="text-[#ffcc00]" /> : <div className="w-4 h-4 border-2 border-white/15 rounded-full" />}
                              </div>
                            </div>
                          </div>
                        ))}
                        {room.players.length === 0 && <span className="text-white/25 text-sm py-10 text-center font-medium">Empty Room. Nobody to launch...</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => launchChallenge(room.id, activeChallenge.id)}
                      disabled={!allReady || room.players.length === 0}
                      className="bg-[#ffcc00] hover:bg-[#ffe066] disabled:opacity-40 disabled:cursor-not-allowed text-black px-12 py-4 rounded-xl font-semibold tracking-wide text-base transition-all duration-200 shadow-[0_0_30px_rgba(255,204,0,0.15)] disabled:shadow-none hover:scale-[1.02]"
                    >
                      {allReady && room.players.length > 0 ? "Launch Mission" : "Waiting for Agents..."}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3.5 py-1.5 rounded-full text-red-400 font-semibold text-xs animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-red-500" /> LIVE
                      <span className="ml-1.5 bg-black/40 rounded-lg px-2.5 py-0.5 text-xs font-mono tracking-wide">{formatTime(challengeTimeLeft)}</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl text-red-400 font-semibold tracking-tight mb-2">Event in Progress</h2>
                    <p className="text-red-400/50 text-sm mb-10 max-w-md leading-relaxed">Agents are actively tracking the coordinate. Standby for intel reception.</p>

                    <div className="w-full max-w-2xl bg-[#111318] border border-white/[0.06] rounded-2xl p-6 mb-10 text-left">
                      <h3 className="text-white/40 font-medium text-xs tracking-wide uppercase border-b border-white/[0.06] pb-4 mb-4 flex justify-between items-center">
                        <span className="flex items-center gap-2"><MapPin size={14} className="text-red-400" /> Live Intel Feed</span>
                        <span className="text-red-400 font-mono">{activeChallenge.results.length} / {room.players.length} Received</span>
                      </h3>

                      <div className="flex flex-col gap-2.5">
                        {activeChallenge.results.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-14 gap-4">
                            <div className="w-7 h-7 rounded-full border-t-2 border-r-2 border-red-500 animate-spin" />
                            <span className="text-white/30 text-xs font-medium animate-pulse tracking-wide">Awaiting radar blips...</span>
                          </div>
                        ) : (
                          [...activeChallenge.results].sort((a, b) => b.points - a.points).map((r, idx) => {
                            const p = room.players.find(x => String(x.id) === String(r.playerId));
                            return (
                              <div key={r.playerId != null ? String(r.playerId) : `result-${idx}`} className="flex items-center justify-between p-4 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.5)] animate-pulse" />
                                  <span className="text-white font-medium tracking-tight text-sm">{p?.name}</span>
                                </div>
                                <div className="flex items-center gap-5">
                                  <span className="text-white/30 text-xs text-right hidden sm:block leading-relaxed">
                                    Drift <span className="text-white/60">{Math.round(r.distance)}</span><br />
                                    Time <span className="text-white/60">{r.timeTaken}s</span>
                                  </span>
                                  <div className="bg-black/30 px-4 py-2 rounded-lg border border-white/[0.04] min-w-[70px] text-center">
                                    <span className="text-[#ffcc00] font-bold text-lg">+{r.points}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {activeChallenge.status === 'completed' ? (
                      <button
                        onClick={() => clearActiveChallenge(room.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-4 rounded-xl font-semibold tracking-wide text-sm transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] min-w-[280px]"
                      >
                        Finish & Return
                      </button>
                    ) : (
                      <button
                        onClick={() => endChallenge(room.id, activeChallenge.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-12 py-4 rounded-xl font-semibold tracking-wide text-sm transition-all duration-200 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] min-w-[280px]"
                      >
                        Terminate Event
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Creator Form */}
              <div className="bg-[#111318] border border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/20">
                <h2 className="text-white font-semibold text-sm tracking-wide uppercase flex items-center gap-2.5 mb-6">
                  <MapPin size={16} className="text-[#ffcc00]" /> Create New Geoguess Operation
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-white/40 font-medium text-xs tracking-wide uppercase">1. Intelligence Image Payload</label>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                    {geoImage ? (
                      <div className="relative w-full aspect-video rounded-xl border border-white/[0.08] bg-black overflow-hidden group shadow-lg">
                        <img src={geoImage} alt="Uploaded" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
                        <button onClick={() => { setGeoImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"><X size={16} /></button>
                      </div>
                    ) : (
                      <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-video border-2 border-dashed border-white/[0.06] bg-white/[0.01] rounded-xl flex flex-col items-center justify-center gap-3 text-white/20 hover:border-[#ffcc00]/30 hover:text-[#ffcc00]/70 hover:bg-[#ffcc00]/[0.02] transition-all duration-200">
                        <Upload size={36} />
                        <span className="font-medium tracking-wide text-xs">Upload Local File</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-white/40 font-medium text-xs tracking-wide uppercase flex justify-between">
                      <span>2. Set Tactical Coordinate</span>
                      {geoCoords && <span className="text-[#ffcc00] font-mono bg-[#ffcc00]/5 px-2 py-0.5 rounded-lg border border-[#ffcc00]/15 text-[11px]">{Math.round(geoCoords[0])}, {Math.round(geoCoords[1])}</span>}
                    </label>
                    <div className="w-full aspect-video rounded-xl border border-white/[0.08] overflow-hidden bg-[#053446ff] shadow-lg">
                      <InteractiveMap selectedLocation={geoCoords} onLocationSelect={setGeoCoords} />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row items-end gap-5 bg-white/[0.02] p-6 rounded-xl border border-white/[0.04] mt-2">
                    <div className="flex-1 w-full relative">
                      <label className="text-white/40 font-medium text-xs tracking-wide uppercase mb-2 flex items-center gap-2">
                        <Timer size={14} /> Operation Time Limit (Seconds)
                      </label>
                      <input
                        type="number" min="10" step="5" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))}
                        className="w-full bg-[#111318] border border-white/[0.08] rounded-xl pl-4 pr-14 py-3.5 text-white font-mono text-lg outline-none focus:border-[#ffcc00]/30 transition-all duration-200"
                      />
                      <div className="absolute right-4 bottom-3.5 text-white/20 font-medium text-sm">SEC</div>
                    </div>
                    <button
                      onClick={handleCreateChallenge}
                      disabled={!geoImage || !geoCoords}
                      className="w-full md:w-auto bg-[#ffcc00] hover:bg-[#ffe066] text-black px-10 py-3.5 rounded-xl font-semibold tracking-wide text-sm transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,204,0,0.1)] disabled:shadow-none min-w-[220px]"
                    >
                      Register Mission
                    </button>
                  </div>
                </div>
              </div>

              {/* Mission History */}
              <div className="mt-2">
                <h2 className="text-white/30 font-medium text-xs tracking-wide uppercase mb-4">Operation Database</h2>
                <div className="grid grid-cols-1 gap-2.5">
                  {room.challenges.map(c => (
                    <div key={c.id} className="flex flex-col sm:flex-row items-center justify-between p-5 bg-[#111318] hover:bg-[#13161c] border border-white/[0.06] rounded-2xl gap-4 transition-all duration-200">
                      <div className="flex items-center gap-5 w-full">
                        <div className="relative shrink-0">
                          {c.image ? <img src={c.image} alt="C" className="w-20 h-14 object-cover rounded-xl shadow-md border border-white/[0.06]" /> : <div className="w-20 h-14 bg-white/[0.02] rounded-xl shadow-md border border-white/[0.04]" />}
                          <div className="absolute -bottom-1.5 -right-1.5 bg-[#111318] px-1.5 py-0.5 rounded-md text-[10px] font-mono border border-white/[0.06] text-white/40">{c.timeLimitSeconds}s</div>
                        </div>
                        <div>
                          <div className="text-white font-medium tracking-tight text-[15px]">Op. Delta-{c.id.substring(c.id.length - 4)}</div>
                          <div className="text-white/30 text-xs mt-1">{c.results.length} Agents Executed</div>
                        </div>
                      </div>
                      <div className="flex items-center w-full sm:w-auto justify-end gap-3 border-t sm:border-t-0 border-white/[0.04] pt-3 sm:pt-0">
                        <div className={`px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide ${c.status === 'pending' ? 'bg-white/[0.03] text-white/40 border border-white/[0.06]' : c.status === 'completed' ? 'bg-emerald-500/8 text-emerald-400 border border-emerald-500/15' : 'bg-[#ffcc00]/8 text-[#ffcc00] border border-[#ffcc00]/15'}`}>
                          {c.status}
                        </div>
                        {c.status === 'pending' && (
                          <button
                            onClick={() => startChallengeLobby(room.id, c.id)}
                            className="bg-white/[0.04] hover:bg-white hover:text-black text-white border border-white/[0.08] hover:border-white px-5 py-2 rounded-xl font-medium text-xs tracking-wide transition-all duration-200 min-w-[100px]"
                          >
                            Commence
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {room.challenges.length === 0 && (
                    <div className="text-white/20 text-sm py-14 bg-white/[0.01] border border-white/[0.04] border-dashed rounded-2xl text-center font-medium tracking-wide">No missions logged in database.</div>
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

"use client";
import React, { useState, useEffect } from "react";
import { useTournament, Room, RoomPlayer, ChallengeResult } from "@/context/TournamentContext";
import ChallengeSummaryModal from "@/components/ChallengeSummaryModal";
import PointsLeaderboardTab from "@/components/admin/PointsLeaderboardTab";
import CreateMissionForm from "@/components/admin/CreateMissionForm";
import MissionHistoryList from "@/components/admin/MissionHistoryList";
import LiveMissionFeed from "@/components/admin/LiveMissionFeed";
import { Trash2, ArrowLeft, Users, Settings, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { rooms, createRoom, finalizeRoom } = useTournament();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/login");
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
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Settings size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl text-white font-semibold tracking-tight">Tournament Admin Panel</h1>
            <p className="text-white/30 text-sm mt-0.5">Manage rooms, challenges, and player scores</p>
          </div>
        </div>

        {/* Create Room Card */}
        <div className="bg-[#111318] border border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/20 mb-10">
          <h2 className="text-white font-semibold text-sm tracking-wide uppercase flex items-center gap-2.5 mb-5">
            <Users size={16} className="text-primary" /> Create New Room
          </h2>
          <form onSubmit={handleCreateRoom} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text" placeholder="Enter Room Name..." value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-primary/30 focus:bg-white/[0.05] transition-all duration-200 placeholder:text-white/20"
            />
            <button type="submit" className="bg-primary hover:bg-primary-light text-black px-8 py-3.5 rounded-xl font-semibold tracking-wide text-sm transition-all duration-200 whitespace-nowrap shadow-primary-md">
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
                  <button onClick={() => finalizeRoom(room.id)} className="bg-white/[0.04] hover:bg-primary border border-white/[0.08] hover:border-primary px-3 py-1.5 rounded-lg text-white/50 hover:text-black font-semibold tracking-wide text-[10px] sm:text-xs transition-all duration-200 shrink-0 uppercase" title="End and Save Room">Finalize Room</button>
                </div>
                <div className="text-white/30 text-xs mb-0.5">Created by: <span className="text-white/50">{room.creator}</span></div>
                <div className="text-white/30 text-xs">{new Date(room.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.04]">
                <div className="bg-white/[0.03] px-3 py-1.5 rounded-lg border border-primary/15 font-mono text-primary font-semibold text-xs tracking-[0.15em]">CODE: {room.code}</div>
                <button onClick={() => setSelectedRoomId(room.id)} className="bg-white/[0.04] hover:bg-primary border border-white/[0.08] hover:border-primary px-6 py-2 rounded-xl text-white hover:text-black font-semibold tracking-wide text-xs transition-all duration-200 flex items-center gap-2">
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
  if (!room) { setSelectedRoomId(null); return null; }

  return <AdminRoomDashboard room={room} onBack={() => setSelectedRoomId(null)} />;
}

function AdminRoomDashboard({ room, onBack }: { room: Room; onBack: () => void }) {
  const { finalizeRoom, launchChallenge, endChallenge, clearActiveChallenge, kickPlayerFromRoom, admitPlayer, admitAllPlayers } = useTournament();
  const [activeTab, setActiveTab] = useState<"points" | "challenges">("challenges");
  const [previousRanking, setPreviousRanking] = useState<RoomPlayer[]>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryChallengeId, setSummaryChallengeId] = useState<string | null>(null);
  const [summaryChallengeResults, setSummaryChallengeResults] = useState<ChallengeResult[]>([]);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState<number | null>(null);

  const activeChallenge = room.activeChallengeId
    ? room.challenges.find(c => c.id === room.activeChallengeId)
    : null;
  const allReady = room.players.length > 0 && room.players.every(p => p.isReady);

  useEffect(() => {
    if (activeChallenge?.status === "active") {
      setPreviousRanking([...room.players].sort((a, b) => b.roomScore - a.roomScore));
      setSummaryChallengeId(null);
      setSummaryChallengeResults([]);
      setShowSummaryModal(false);
    }
  }, [activeChallenge?.status, room.players]);

  useEffect(() => {
    const completed = room.challenges.filter(c => c.status === "completed");
    if (completed.length === 0) return;
    const latestCompleted = completed[completed.length - 1];
    if (latestCompleted.id === summaryChallengeId) return;
    setSummaryChallengeId(latestCompleted.id);
    setSummaryChallengeResults(latestCompleted.results);
    // setShowSummaryModal(true); // Removed automatic popup per user request
  }, [room.challenges, summaryChallengeId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeChallenge?.status === "active" && activeChallenge.startedAt) {
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

  return (
    <div className="w-full mt-[5vh] max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
      <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white hover:bg-white/[0.04] px-3.5 py-2 rounded-xl transition-all duration-200 font-medium text-xs tracking-wide mb-6">
        <ArrowLeft size={15} /> Back to Rooms
      </button>

      {/* Room Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 bg-[#111318] border border-white/[0.06] p-7 rounded-2xl relative overflow-hidden shadow-xl shadow-black/20">
        <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-primary to-primary/20" />
        <div className="ml-3">
          <span className="text-white/30 text-xs font-medium tracking-wide uppercase">Room Control Panel</span>
          <h1 className="text-3xl sm:text-4xl text-white font-semibold tracking-tight mt-1">{room.name}</h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="bg-white/[0.03] px-3.5 py-1.5 rounded-lg border border-primary/20 font-mono text-primary font-semibold text-xs tracking-[0.15em]">CODE: {room.code}</div>
            <div className="text-white/35 text-xs bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.06] flex items-center gap-2">
              <Users size={13} /> {room.players.length} Players Connected
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => { finalizeRoom(room.id); onBack(); }}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-primary/10 hover:bg-primary border border-primary/30 hover:border-primary px-5 py-2.5 rounded-xl text-primary hover:text-black font-semibold tracking-wide text-xs transition-all duration-300 uppercase shadow-primary-sm hover:shadow-primary-md shrink-0"
        >
          Finalize Room
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06] mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab("challenges")} className={`whitespace-nowrap px-6 py-3 font-semibold tracking-wide text-sm transition-all duration-200 relative rounded-t-xl ${activeTab === "challenges" ? "text-black bg-primary" : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"}`}>
          Mission Control
        </button>
        <button onClick={() => setActiveTab("points")} className={`whitespace-nowrap px-6 py-3 font-semibold tracking-wide text-sm transition-all duration-200 relative rounded-t-xl ${activeTab === "points" ? "text-black bg-primary" : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"}`}>
          Room Leaderboard
        </button>
      </div>

      {activeTab === "points" && <PointsLeaderboardTab room={room} />}

      {activeTab === "challenges" && (
        <div className="flex flex-col gap-10">
          {activeChallenge ? (
            <LiveMissionFeed
              room={room}
              activeChallenge={activeChallenge}
              challengeTimeLeft={challengeTimeLeft}
              allReady={allReady}
              onLaunch={() => launchChallenge(room.id, activeChallenge.id)}
              onEnd={() => endChallenge(room.id, activeChallenge.id)}
              onFinish={() => clearActiveChallenge(room.id)}
              onKickPlayer={(playerId) => kickPlayerFromRoom(room.id, playerId)}
              onAdmitPlayer={(playerId) => admitPlayer(room.id, playerId)}
              onAdmitAll={() => admitAllPlayers(room.id)}
            />
          ) : (
            <>
              <CreateMissionForm roomId={room.id} />
              <MissionHistoryList 
                roomId={room.id} 
                challenges={room.challenges} 
                onViewResults={(id) => {
                  const challenge = room.challenges.find(c => c.id === id);
                  if (challenge) {
                    setSummaryChallengeId(challenge.id);
                    setSummaryChallengeResults(challenge.results);
                    setShowSummaryModal(true);
                  }
                }}
              />
            </>
          )}
        </div>
      )}

      {showSummaryModal && room && (() => {
        const summaryChallenge = summaryChallengeId ? room.challenges.find(c => c.id === summaryChallengeId) : null;
        const histAfter = summaryChallenge?.historicalRankings?.after;
        const histBefore = summaryChallenge?.historicalRankings?.before;
        const playersForSummary = histAfter && histAfter.length > 0 ? histAfter : room.players;
        const previousRankingForSummary = histBefore && histBefore.length > 0 ? histBefore : previousRanking;
        return (
          <ChallengeSummaryModal
            players={playersForSummary}
            challengeResults={summaryChallengeResults}
            previousRanking={previousRankingForSummary}
            onClose={() => setShowSummaryModal(false)}
          />
        );
      })()}
    </div>
  );
}

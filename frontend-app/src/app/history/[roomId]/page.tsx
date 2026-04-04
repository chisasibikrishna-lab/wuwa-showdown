"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopNavbar from "@/components/TopNavbar";
import ChallengeHistoryCard from "@/components/history/ChallengeHistoryCard";
import FinalLeaderboard from "@/components/history/FinalLeaderboard";
import { useHistory, RoomRecord, ChallengeRecord } from "@/context/HistoryContext";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Calendar, Users, Layers } from "lucide-react";
import Link from "next/link";

export default function RoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { fetchRoomDetail } = useHistory();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [room, setRoom] = useState<RoomRecord | null>(null);
  const [challenges, setChallenges] = useState<ChallengeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!roomId || !user) return;
    fetchRoomDetail(roomId).then(data => {
      if (data) { setRoom(data.room); setChallenges(data.challenges); }
      setLoading(false);
    });
  }, [roomId, user, fetchRoomDetail]);

  if (isLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TopNavbar />
        <p className="text-white/30 animate-pulse text-sm">Loading room details...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TopNavbar />
        <div className="text-center">
          <p className="text-white/40 mb-4">Room not found.</p>
          <Link href="/history" className="text-primary text-sm">← Back to History</Link>
        </div>
      </div>
    );
  }

  // Final leaderboard uses the "after" snapshot of the last challenge
  const lastChallenge = challenges[challenges.length - 1];
  const finalSnapshots = lastChallenge?.historicalRankings?.after ?? room.players;

  return (
    <div className="min-h-screen relative flex flex-col overflow-x-hidden">
      <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <TopNavbar />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        {/* Back */}
        <Link href="/history" className="flex items-center gap-2 text-white/40 hover:text-white text-xs font-medium uppercase tracking-wide mb-6 w-fit transition-colors">
          <ArrowLeft size={14} /> Back to History
        </Link>

        {/* Room Header */}
        <div className="bg-black/40 border border-primary/15 backdrop-blur-xl rounded-2xl px-7 py-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-primary to-primary/10" />
          <div className="ml-3">
            <p className="text-white/30 text-xs uppercase tracking-wide mb-1">Room Record</p>
            <h1 className="text-3xl font-semibold text-white tracking-tight">{room.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-white/40 text-xs">
              <span className="font-mono text-primary font-semibold bg-primary/5 border border-primary/15 px-2.5 py-1 rounded-lg tracking-[0.12em]">CODE: {room.code}</span>
              <span className="flex items-center gap-1"><Users size={12} />{room.players.length} players</span>
              <span className="flex items-center gap-1"><Layers size={12} />{challenges.length} challenges</span>
              <span className="flex items-center gap-1"><Calendar size={12} />{new Date(room.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Challenge List */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h2 className="text-white/40 font-medium text-xs tracking-wide uppercase mb-1">Challenge Breakdown</h2>
            {challenges.length === 0 ? (
              <div className="py-16 text-center text-white/25 text-sm border border-white/[0.05] border-dashed rounded-2xl">No challenges recorded yet.</div>
            ) : (
              challenges.map((c, i) => <ChallengeHistoryCard key={c._id} challenge={c} index={i} />)
            )}
          </div>

          {/* Final Leaderboard */}
          <div className="flex flex-col gap-3">
            <h2 className="text-white/40 font-medium text-xs tracking-wide uppercase mb-1">Final Standings</h2>
            <FinalLeaderboard snapshots={finalSnapshots} />
          </div>
        </div>
      </div>
    </div>
  );
}

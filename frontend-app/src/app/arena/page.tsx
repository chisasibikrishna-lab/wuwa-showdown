"use client";
import React, { useState, useEffect } from "react";
import TopNavbar from "@/components/TopNavbar";
import ChallengeSummaryModal from "@/components/ChallengeSummaryModal";
import JoinRoomForm from "@/components/arena/JoinRoomForm";
import StandbyMode from "@/components/arena/StandbyMode";
import MissionPrecheck from "@/components/arena/MissionPrecheck";
import OperationActivePanel from "@/components/arena/OperationActivePanel";
import { useTournament, RoomPlayer, ChallengeResult } from "@/context/TournamentContext";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), { ssr: false });

function calculateElapsedSeconds(startedAt: number): number {
  return Math.floor((Date.now() - startedAt) / 1000);
}

export default function ArenaPage() {
  const { user, isLoading } = useAuth();
  const { rooms, setPlayerReady, submitChallengeGeoguess } = useTournament();
  const router = useRouter();

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [submittedCoords, setSubmittedCoords] = useState<[number, number] | null>(null);
  const [guessCoords, setGuessCoords] = useState<[number, number] | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [previousRanking, setPreviousRanking] = useState<RoomPlayer[]>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryChallengeId, setSummaryChallengeId] = useState<string | null>(null);
  const [summaryChallengeResults, setSummaryChallengeResults] = useState<ChallengeResult[]>([]);

  // Route protection
  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  // Derived state
  const room = rooms.find(r => r.id === activeRoomId);
  const myPlayer = room?.players.find(p => String(p.id) === String(user?.id));
  const isPending = room?.pendingPlayers?.some(p => String(p.id) === String(user?.id)) ?? false;
  const activeChallenge = room?.activeChallengeId
    ? room.challenges.find(c => c.id === room.activeChallengeId)
    : null;
  const myResult = activeChallenge?.results.find(
    r => r.playerId != null && String(r.playerId) === String(user?.id)
  );

  // Reset state on new challenge
  useEffect(() => {
    setGuessCoords(null);
    setSubmittedCoords(null);
    setTimeLeft(0);
    setHasSubmitted(false);
    setShowSummaryModal(false);
    if (room) setPreviousRanking([...room.players].sort((a, b) => b.roomScore - a.roomScore));
  }, [activeChallenge?.id]);

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeChallenge?.status === "active" && activeChallenge.startedAt && !myResult) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - activeChallenge.startedAt!) / 1000);
        setTimeLeft(Math.max(0, activeChallenge.timeLimitSeconds - elapsed));
      }, 500);
    } else {
      setTimeLeft(0);
    }
    return () => clearInterval(interval);
  }, [activeChallenge?.status, activeChallenge?.startedAt, myResult, activeChallenge?.timeLimitSeconds]);

  // Reset summary state when new active challenge begins
  useEffect(() => {
    if (activeChallenge?.status === "active" && room) {
      setPreviousRanking([...room.players].sort((a, b) => b.roomScore - a.roomScore));
      setSummaryChallengeId(null);
      setShowSummaryModal(false);
      setSummaryChallengeResults([]);
    }
  }, [activeChallenge?.status, room]);

  // Trigger summary modal on completion
  useEffect(() => {
    if (!room) return;
    const completedChallenges = room.challenges.filter(c => c.status === "completed");
    if (completedChallenges.length === 0) return;
    const latestCompleted = completedChallenges[completedChallenges.length - 1];
    if (summaryChallengeId === latestCompleted.id) return;
    setSummaryChallengeId(latestCompleted.id);
    setSummaryChallengeResults(latestCompleted.results);
    // setShowSummaryModal(true); // Removed automatic popup per user request
  }, [room, summaryChallengeId]);

  // Reset guess when challenge waiting
  useEffect(() => {
    if (activeChallenge?.status === "waiting") setGuessCoords(null);
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
      <div className="min-h-screen relative flex flex-col selection:bg-white/20 overflow-x-hidden">
        <TopNavbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-white/60 p-20 text-center font-medium text-sm tracking-wide animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!activeRoomId) {
    return (
      <div className="min-h-screen relative flex flex-col selection:bg-white/20 overflow-x-hidden">
        <TopNavbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <JoinRoomForm onJoined={(id) => { setActiveRoomId(id); setGuessCoords(null); }} />
        </div>
      </div>
    );
  }

  if (!room) return <div className="text-white/50 p-20 text-center font-medium text-sm tracking-wide animate-pulse">Connecting to Server...</div>;
  if (!myPlayer) {
    return (
      <div className="min-h-screen relative flex flex-col selection:bg-white/20 overflow-x-hidden">
        <TopNavbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center py-16 px-10 border border-[#ffcc00]/15 bg-[#ffcc00]/[0.02] rounded-2xl w-full max-w-md shadow-xl backdrop-blur-sm relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ffcc00] to-transparent opacity-60" />
            <div className="w-14 h-14 rounded-full border-[3px] border-[#ffcc00]/20 border-t-[#ffcc00] animate-spin mb-6" />
            <h2 className="text-2xl text-white font-semibold tracking-tight mb-2">{isPending ? 'Awaiting Approval' : 'Connecting...'}</h2>
            <p className="text-white/40 text-sm max-w-xs leading-relaxed">
              {isPending
                ? 'Your join request has been sent. The Admin will approve your entry shortly.'
                : 'Waiting for server to sync your data...'
              }
            </p>
            <div className="mt-6 bg-white/[0.03] border border-white/[0.06] px-4 py-2 rounded-lg">
              <span className="text-white/30 text-xs font-medium tracking-wide">Room: </span>
              <span className="text-[#ffcc00] font-mono font-semibold text-sm tracking-[0.15em]">{room.code}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-center selection:bg-white/20 overflow-x-hidden">
      <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <TopNavbar />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col items-center">
        {/* Header HUD */}
        <div className="w-full max-w-5xl mt-[6vh] lg:mt-[10vh] flex flex-col sm:flex-row justify-between items-center bg-black/40 border border-[#ffcc00]/20 px-6 sm:px-8 py-5 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl mb-5 gap-4 sm:gap-0 transition-all z-20">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={myPlayer.avatar} alt="Profile" className="w-11 h-11 rounded-full border border-[#ffcc00]/30 shadow-[0_0_12px_rgba(255,204,0,0.15)]" />
            <div>
              <div className="text-white font-semibold tracking-tight text-lg">{myPlayer.name}</div>
              <div className="text-[#ffcc00] font-mono text-xs tracking-wide mt-0.5">TOTAL PTS: <span className="font-bold">{myPlayer.roomScore}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {summaryChallengeId && (
              <button 
                onClick={() => setShowSummaryModal(true)}
                className="bg-white/[0.05] hover:bg-white/10 text-white/80 border border-white/10 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all"
              >
                View Last Results
              </button>
            )}
            <div className="hidden sm:flex flex-col items-end justify-center">
              <div className="bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-lg font-mono text-[#ffcc00] font-semibold tracking-[0.15em] text-sm">{room.code}</div>
            </div>
          </div>
        </div>

        {/* Dynamic Challenge States */}
        {!activeChallenge ? (
          <StandbyMode />
        ) : activeChallenge.status === "waiting" ? (
          <MissionPrecheck
            roomId={room.id}
            myPlayer={myPlayer}
            onReady={() => setPlayerReady(room.id, myPlayer.id, true)}
          />
        ) : activeChallenge.status === "active" || activeChallenge.status === "completed" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            {/* Left Panel */}
            <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1 h-full">
              <OperationActivePanel
                activeChallenge={activeChallenge}
                myResult={myResult}
                guessCoords={guessCoords}
                timeLeft={timeLeft}
                hasSubmitted={hasSubmitted}
                onSubmit={handleSubmit}
              />
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
                  onLocationSelect={myResult ? () => { } : setGuessCoords}
                  correctLocation={myResult ? activeChallenge.targetCoords : null}
                  readOnly={!!myResult || activeChallenge.status === "completed"}
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

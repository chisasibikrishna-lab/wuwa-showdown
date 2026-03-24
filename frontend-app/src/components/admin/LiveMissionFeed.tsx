"use client";
import React from "react";
import { MapPin, Users, CheckCircle, UserX, UserCheck, UserPlus } from "lucide-react";
import { Room, Challenge } from "@/context/TournamentContext";

interface Props {
  room: Room;
  activeChallenge: Challenge;
  challengeTimeLeft: number | null;
  allReady: boolean;
  onLaunch: () => void;
  onEnd: () => void;
  onFinish: () => void;
  onKickPlayer: (playerId: number | string) => void;
  onAdmitPlayer: (playerId: number | string) => void;
  onAdmitAll: () => void;
}

const formatTime = (seconds: number | null) => {
  if (seconds === null) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function LiveMissionFeed({
  room,
  activeChallenge,
  challengeTimeLeft,
  allReady,
  onLaunch,
  onEnd,
  onFinish,
  onKickPlayer,
  onAdmitPlayer,
  onAdmitAll,
}: Props) {
  const pendingPlayers = room.pendingPlayers || [];

  return (
    <div className={`border rounded-2xl p-8 md:p-10 shadow-xl relative overflow-hidden transition-all duration-500 ${activeChallenge.status === 'waiting' ? 'bg-[#ffcc00]/[0.02] border-[#ffcc00]/15' : 'bg-red-500/[0.03] border-red-500/20'}`}>
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-40 ${activeChallenge.status === 'waiting' ? 'text-[#ffcc00]' : 'text-red-500'}`} />

      <div className="flex flex-col items-center text-center w-full">
        {activeChallenge.status === 'waiting' ? (
          <>
            <h2 className="text-2xl sm:text-3xl text-white font-semibold tracking-tight mb-2">Watcher System: Pre-check</h2>
            <p className="text-white/40 text-sm mb-8 max-w-md leading-relaxed">Waiting for all competitors to mark ready status before launch.</p>

            {/* Pending Join Requests */}
            {pendingPlayers.length > 0 && (
              <div className="w-full max-w-2xl bg-amber-500/[0.03] border border-amber-500/15 rounded-2xl p-5 mb-6 text-left">
                <div className="flex justify-between items-center border-b border-amber-500/10 pb-4 mb-4">
                  <span className="text-amber-400/70 font-medium text-xs tracking-wide uppercase flex items-center gap-2">
                    <UserPlus size={14} /> Pending Requests
                  </span>
                  <button
                    onClick={onAdmitAll}
                    className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 hover:border-emerald-500/35 px-4 py-1.5 rounded-lg text-emerald-400 text-xs font-semibold transition-all duration-200"
                  >
                    <UserCheck size={13} />
                    Admit All ({pendingPlayers.length})
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {pendingPlayers.map(p => (
                    <div key={p.id} className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <div className="flex items-center gap-3 w-full sm:w-auto mb-3 sm:mb-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.avatar} alt="av" className="w-8 h-8 rounded-full" />
                        <span className="text-white font-medium tracking-tight text-sm">{p.name}</span>
                        <span className="text-amber-400/50 text-[10px] font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15">PENDING</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => onAdmitPlayer(p.id)}
                          className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-400 text-xs font-medium transition-all duration-200"
                          title={`Admit ${p.name}`}
                        >
                          <UserCheck size={13} />
                          Admit
                        </button>
                        <button
                          onClick={() => onKickPlayer(p.id)}
                          className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 px-3 py-1.5 rounded-lg text-red-400 text-xs font-medium transition-all duration-200"
                          title={`Reject ${p.name}`}
                        >
                          <UserX size={13} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admitted Players - Ready Roster */}
            <div className="w-full max-w-2xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 mb-10 max-h-[300px] overflow-y-auto text-left">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-4 mb-4 sticky top-0 bg-[#0a0a0c]/90 backdrop-blur-md z-10 pt-1 -mt-1">
                <span className="text-white/40 font-medium text-xs tracking-wide uppercase flex items-center gap-2"><Users size={14} /> Roster Readiness</span>
                <span className={`font-semibold font-mono px-3 py-1 rounded-lg text-xs ${allReady ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/15'}`}>
                  {room.players.filter(p => p.isReady).length} / {room.players.length} READY
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {room.players.map(p => (
                  <div key={p.id} className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                    <div className="flex items-center gap-3 w-full sm:w-auto mb-3 sm:mb-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.avatar} alt="av" className="w-8 h-8 rounded-full" />
                      <span className="text-white font-medium tracking-tight text-sm">{p.name}</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/[0.04]">
                        <span className="text-xs text-white/30 tracking-wide">Ready</span>
                        {p.isReady ? <CheckCircle size={15} className="text-[#ffcc00]" /> : <div className="w-4 h-4 border-2 border-white/15 rounded-full" />}
                      </div>
                      <button
                        onClick={() => onKickPlayer(p.id)}
                        className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 px-3 py-1.5 rounded-lg text-red-400 text-xs font-medium transition-all duration-200"
                        title={`Kick ${p.name}`}
                      >
                        <UserX size={13} />
                        Kick
                      </button>
                    </div>
                  </div>
                ))}
                {room.players.length === 0 && <span className="text-white/25 text-sm py-10 text-center font-medium">Empty Room. Nobody to launch...</span>}
              </div>
            </div>

            <button
              onClick={onLaunch}
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
                onClick={onFinish}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-4 rounded-xl font-semibold tracking-wide text-sm transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] min-w-[280px]"
              >
                Finish & Return
              </button>
            ) : (
              <button
                onClick={onEnd}
                className="bg-red-500 hover:bg-red-600 text-white px-12 py-4 rounded-xl font-semibold tracking-wide text-sm transition-all duration-200 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] min-w-[280px]"
              >
                Terminate Event
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

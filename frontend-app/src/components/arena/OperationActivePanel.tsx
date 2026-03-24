"use client";
import React from "react";
import { CheckCircle2, Timer, Target, MonitorPlay, MapPin } from "lucide-react";
import { Challenge, ChallengeResult } from "@/context/TournamentContext";

interface Props {
  activeChallenge: Challenge;
  myResult: ChallengeResult | undefined;
  guessCoords: [number, number] | null;
  timeLeft: number;
  hasSubmitted: boolean;
  onSubmit: () => void;
}

export default function OperationActivePanel({
  activeChallenge,
  myResult,
  guessCoords,
  timeLeft,
  hasSubmitted,
  onSubmit,
}: Props) {
  if (myResult || activeChallenge.status === "completed") {
    return (
      <div className="bg-black/40 border border-[#ffcc00]/20 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col items-center justify-center text-center h-full overflow-hidden min-h-[500px] relative">
        <CheckCircle2 size={52} className="text-[#ffcc00]/80 mb-5" />
        <h2 className="text-2xl lg:text-3xl text-white font-semibold tracking-tight mb-4">Submission Locked</h2>

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
    );
  }

  return (
    <div className="bg-black/40 border border-red-500/20 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col gap-4 relative overflow-hidden h-fit">
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
          // eslint-disable-next-line @next/next/no-img-element
          <img src={activeChallenge.image} alt="Target Intel" className="object-cover w-full h-full" />
        ) : (
          <div className="text-white/15 flex flex-col items-center gap-2"><Target size={40} /><span className="text-xs font-medium">NO VISUAL</span></div>
        )}
      </div>

      <div className="bg-black/20 border border-white/[0.04] rounded-xl p-4 mt-2">
        <p className="text-white/60 text-sm leading-relaxed mb-3">
          Study the information and mark the correct spot on the map. You can earn up to <span className="text-[#ffcc00] font-semibold">20 points</span>.
        </p>

        <ul className="text-white/40 text-xs flex flex-col gap-2 list-disc pl-4 marker:text-white/20">
          <li>
            <span className="text-white/50 font-medium">Accuracy (up to 15 points):</span><br />
            • Within 50 units → 15 points<br />
            • Within 150 units → 10 points<br />
            • Within 300 units → 5 points
          </li>

          <li>
            <span className="text-white/50 font-medium">Speed Bonus (up to 5 points):</span><br />
            • Faster answers give you more bonus points
          </li>
        </ul>
      </div>

      <div className="mt-3 pt-4 border-t border-white/[0.05]">
        <button
          onClick={onSubmit}
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
  );
}

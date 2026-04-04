"use client";
import React, { useState } from "react";
import { useBracket } from "@/context/BracketContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shuffle, Swords, Trophy, Users } from "lucide-react";
import Link from "next/link";

export default function CreateBracketPage() {
  const router = useRouter();
  const { createBracket, generateBracket } = useBracket();

  const [name, setName] = useState("");
  const [type, setType] = useState<"single" | "double">("single");
  const [participantsText, setParticipantsText] = useState("");
  const [randomize, setRandomize] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const participants = participantsText
    .split("\n")
    .map(p => p.trim())
    .filter(Boolean);

  const participantCount = participants.length;
  const isValid = name.trim() && participantCount >= 2 && participantCount <= 128;

  const handleSubmit = async (asDraft: boolean) => {
    if (!isValid) return;
    setLoading(true);
    setError("");

    try {
      const bracket = await createBracket({
        name: name.trim(),
        type,
        participants,
        randomizeSeeding: randomize,
      });

      if (!bracket) {
        setError("Failed to create bracket");
        setLoading(false);
        return;
      }

      if (!asDraft) {
        const generated = await generateBracket(bracket._id);
        if (!generated) {
          setError("Created but failed to generate matches");
          setLoading(false);
          return;
        }
        router.push(`/bracket/${generated.shareCode}`);
      } else {
        router.push(`/bracket/${bracket.shareCode}`);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-12">
      {/* Back */}
      <Link
        href="/bracket"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to brackets
      </Link>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Create Tournament</h1>
        <p className="text-zinc-500 mt-1">Set up your elimination bracket</p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Tournament Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Tournament Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Spring Championship 2026"
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/[0.08] text-white
                       placeholder-zinc-600 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20
                       transition-all text-sm"
          />
        </div>

        {/* Tournament Type */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Tournament Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setType("single")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left
                ${type === "single"
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:border-white/[0.12]"
                }`}
            >
              <Swords size={18} />
              <div>
                <div className="font-semibold text-sm">Single Elimination</div>
                <div className="text-xs text-zinc-500 mt-0.5">One loss and you're out</div>
              </div>
            </button>
            <button
              onClick={() => setType("double")}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left
                ${type === "double"
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:border-white/[0.12]"
                }`}
            >
              <Trophy size={18} />
              <div>
                <div className="font-semibold text-sm">Double Elimination</div>
                <div className="text-xs text-zinc-500 mt-0.5">Two losses to be eliminated</div>
              </div>
            </button>
          </div>
        </div>

        {/* Participants */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-zinc-300">
              Participants
              <span className="text-zinc-500 font-normal ml-1">(one per line)</span>
            </label>
            <span className={`text-xs font-mono ${participantCount > 128 ? "text-red-400" : participantCount >= 2 ? "text-emerald-400" : "text-zinc-500"}`}>
              {participantCount} / 128
            </span>
          </div>
          <textarea
            value={participantsText}
            onChange={e => setParticipantsText(e.target.value)}
            rows={10}
            placeholder={"Player1\nPlayer2\nPlayer3\nPlayer4\nPlayer5\nPlayer6\nPlayer7\nPlayer8"}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/[0.08] text-white
                       placeholder-zinc-700 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20
                       transition-all text-sm font-mono resize-y leading-relaxed"
          />
          {participantCount > 0 && participantCount < 2 && (
            <p className="text-amber-400 text-xs mt-1.5">Need at least 2 participants</p>
          )}
          {participantCount > 128 && (
            <p className="text-red-400 text-xs mt-1.5">Maximum 128 participants</p>
          )}
        </div>

        {/* Randomize Toggle */}
        <div className="flex items-center justify-between bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/[0.06] rounded-xl px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Shuffle size={18} className="text-zinc-400" />
            <div>
              <div className="text-sm font-medium text-zinc-200">Randomize Seeding</div>
              <div className="text-xs text-zinc-500 mt-0.5">Shuffle participant order before generating bracket</div>
            </div>
          </div>
          <button
            onClick={() => setRandomize(!randomize)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200
              ${randomize ? "bg-primary" : "bg-zinc-700"}`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
                ${randomize ? "translate-x-[22px]" : "translate-x-0.5"}`}
            />
          </button>
        </div>

        {/* Preview info */}
        {participantCount >= 2 && (
          <div className="bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/[0.05] rounded-xl px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Users size={14} />
              <span>{participantCount} participants</span>
              <span className="text-zinc-600">&middot;</span>
              <span>{Math.pow(2, Math.ceil(Math.log2(participantCount))) - participantCount} byes</span>
              <span className="text-zinc-600">&middot;</span>
              <span>{Math.ceil(Math.log2(participantCount))} rounds</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => handleSubmit(false)}
            disabled={!isValid || loading}
            className="flex-1 px-6 py-3 rounded-xl bg-primary text-black font-semibold text-sm
                       hover:bg-primary-light transition-all shadow-primary-md
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? "Creating..." : "Generate Bracket"}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={!isValid || loading}
            className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300 font-medium text-sm
                       hover:bg-white/[0.08] transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}

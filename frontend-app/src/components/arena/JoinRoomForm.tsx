"use client";
import React, { useState } from "react";
import { LogIn, AlertTriangle } from "lucide-react";
import { useTournament } from "@/context/TournamentContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { User as UserIcon } from "lucide-react";

interface Props {
  onJoined: (roomId: string) => void;
}

export default function JoinRoomForm({ onJoined }: Props) {
  const { rooms, joinRoom } = useTournament();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [errorStatus, setErrorStatus] = useState("");

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus("");
    const upCode = roomCode.toUpperCase().trim();
    if (user && upCode) {
      const foundRoom = rooms.find(r => r.code === upCode);
      if (foundRoom) {
        joinRoom(upCode, user as any);
        onJoined(foundRoom.id);
      } else {
        setErrorStatus("INVALID ACCESS CODE");
      }
    }
  };

  return (
    <div className="bg-[#111318] border border-white/[0.06] rounded-2xl p-10 max-w-[420px] w-full shadow-2xl shadow-black/50 relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-primary to-primary/40" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-2 mt-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <LogIn size={20} className="text-primary" />
        </div>
        <h1 className="text-2xl text-white font-semibold tracking-tight">Join Room</h1>
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
          <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-primary/5 border-primary/15 text-primary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={user?.avatar} className="w-8 h-8 rounded-full border border-primary/30" alt="avatar" />
            <span className="font-semibold tracking-wide text-sm">{user?.name}</span>
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
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white font-mono text-lg tracking-[0.25em] outline-none focus:border-primary/40 focus:bg-white/[0.05] text-center uppercase transition-all duration-200 placeholder:text-white/20"
          />
        </div>

        <button
          type="submit"
          disabled={roomCode.length < 3}
          className="w-full bg-primary hover:bg-primary-light text-black px-8 py-3.5 rounded-xl font-semibold tracking-wide text-[15px] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-primary-md hover:shadow-primary-lg mt-1"
        >
          Join Game
        </button>
      </form>
    </div>
  );
}

"use client";
import React from "react";
import Link from "next/link";
import { RoomRecord } from "@/context/HistoryContext";
import { Calendar, Users, Layers, ChevronRight, Clock } from "lucide-react";

interface Props {
  rooms: RoomRecord[];
  onDeleteClick?: (room: RoomRecord) => void;
  isAdmin?: boolean;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RoomHistoryList({ rooms, onDeleteClick, isAdmin }: Props) {
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border border-white/[0.05] border-dashed rounded-3xl text-white/25">
        <Layers size={40} className="mb-4 opacity-30" />
        <p className="font-medium tracking-wide text-sm">No match history yet.</p>
        <p className="text-xs mt-1 text-white/15">Complete a challenge in a room to start building history.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <div
          key={room._id}
          className="group bg-black/40 border border-white/[0.08] hover:border-primary/30 rounded-2xl p-5 backdrop-blur-xl shadow-lg transition-all duration-200 flex flex-col justify-between gap-4"
        >
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold text-lg tracking-tight truncate">{room.name}</h3>
                <span className="text-white/30 font-mono text-xs tracking-[0.12em]">CODE: {room.code}</span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${room.closedAt ? "bg-white/5 text-white/30 border-white/10" : "bg-primary/10 text-primary border-primary/20"}`}>
                {room.closedAt ? "CLOSED" : "ACTIVE"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-white/40">
              <div className="flex items-center gap-1.5"><Users size={12} />{room.players.length} players</div>
              <div className="flex items-center gap-1.5"><Layers size={12} />{room.challengeCount} challenges</div>
              <div className="flex items-center gap-1.5 col-span-2"><Clock size={12} />{timeAgo(room.createdAt)}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/history/${room._id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/[0.04] hover:bg-primary/10 border border-white/[0.08] hover:border-primary/20 text-white/60 hover:text-primary rounded-xl text-xs font-semibold tracking-wide transition-all duration-200"
            >
              View Details <ChevronRight size={13} />
            </Link>
            {isAdmin && onDeleteClick && (
              <button
                onClick={() => onDeleteClick(room)}
                className="px-3 py-2 bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/25 text-red-400/60 hover:text-red-400 rounded-xl text-xs font-semibold transition-all duration-200"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

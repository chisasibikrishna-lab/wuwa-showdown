"use client";
import React, { useState } from "react";
import { RoomRecord } from "@/context/HistoryContext";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  room: RoomRecord;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteRoomModal({ room, onConfirm, onCancel }: Props) {
  const [input, setInput] = useState("");
  const matches = input.trim().toLowerCase() === room.name.trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1117] border border-red-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
          <X size={18} />
        </button>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={26} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Delete Room Record?</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              This will permanently delete <span className="text-white font-medium">"{room.name}"</span> and all its challenge history. This cannot be undone.
            </p>
          </div>
          <div className="w-full text-left">
            <label className="text-white/40 text-xs font-medium tracking-wide uppercase mb-2 block">
              Type the room name to confirm
            </label>
            <input
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={room.name}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-red-500/30 transition-all placeholder:text-white/20 font-mono"
            />
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!matches}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors text-sm font-semibold shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              Delete Forever
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

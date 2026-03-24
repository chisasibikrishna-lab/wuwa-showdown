"use client";
import React from "react";
import { MonitorPlay } from "lucide-react";

export default function StandbyMode() {
  return (
    <div className="flex flex-col items-center justify-center py-24 border border-white/[0.04] bg-[#111318]/60 rounded-2xl w-full max-w-3xl shadow-xl backdrop-blur-sm">
      <MonitorPlay size={56} className="text-white/[0.06] mb-6" />
      <h2 className="text-2xl text-white font-semibold tracking-tight mb-2">Standby Mode</h2>
      <p className="text-white/35 text-sm text-center max-w-sm leading-relaxed">
        No operation is currently active. Await instruction from the Game Master.
      </p>
    </div>
  );
}

"use client";
import React from "react";
import { Radio } from "lucide-react";

export default function StandbyMode() {
  return (
    <div className="flex flex-col items-center justify-center p-16 md:p-24 border border-primary/20 bg-black/40 rounded-3xl w-full max-w-5xl shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl relative overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div className="absolute inset-2 border-2 border-primary/40 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '1s' }}></div>
          <div className="w-16 h-16 bg-black/60 border border-primary/30 rounded-full flex items-center justify-center backdrop-blur-md shadow-primary-md relative z-10">
            <Radio size={28} className="text-primary animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-3xl md:text-4xl text-white font-semibold tracking-tight mb-3">Awaiting Transmission</h2>
        <div className="h-1 w-12 bg-gradient-to-r from-transparent via-primary/70 to-transparent rounded-full mb-6"></div>
        <p className="text-white/40 text-sm md:text-base text-center max-w-md leading-relaxed font-medium">
          Intelligence packets are currently being prepared by Mission Control. Maintain your frequency and stand by for orders.
        </p>
      </div>
    </div>
  );
}

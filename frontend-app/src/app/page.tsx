"use client";
import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[1100px] animate-in fade-in zoom-in duration-700">
      {/* Decorative center glowing orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-[#ffcc00]/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center gap-12 mt-12">
        {/* Title / Emblem space */}
        <div className="text-center space-y-4">
          <h2
            className="text-white text-[16px] xl:text-[20px] tracking-[0.4em] uppercase text-white/60"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            Welcome to the Arena
          </h2>
          <h1
            className="text-white text-[70px] xl:text-[100px] italic uppercase leading-none drop-shadow-[0_0_25px_rgba(255,204,0,0.3)]"
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}
          >
            Ultimate{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffcc00] to-[#b38f00]">
              Showdown
            </span>
          </h1>
        </div>

        {/* Play Now Button */}
        <div className="relative group cursor-pointer mt-8">
          {/* Animated rings */}
          <div className="absolute -inset-4 rounded-full border border-[#ffcc00]/20 scale-90 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out" />
          <div className="absolute -inset-8 rounded-full border border-[#ffcc00]/10 scale-90 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-out delay-75" />

          <Link href="/leaderboard">
            <button className="relative px-16 py-6 overflow-hidden rounded-full bg-[#161922] border-[2px] border-[#ffcc00]/30 hover:border-[#ffcc00] transition-colors duration-300">
              {/* Button inner glow and hover state */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#ffcc00]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffcc00] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#ffcc00] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(255,204,0,0.8)]" />

              <span
                className="relative z-10 text-[28px] uppercase text-white group-hover:text-[#ffcc00] transition-colors duration-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] tracking-widest"
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.1em" }}
              >
                Play Now
              </span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

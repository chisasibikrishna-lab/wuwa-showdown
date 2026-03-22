"use client";
import React, { useState, ReactNode } from "react";
import TopNavbar from "./TopNavbar";

interface BaseLayoutProps {
  children: ReactNode;
}

export default function BaseLayout({ children }: BaseLayoutProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className="min-h-screen bg-[#0a0a0c] flex flex-col items-center relative overflow-x-hidden font-sans selection:bg-white/20"
      onMouseMove={handleMouseMove}
    >
      {/* Base Dark dotted grid */}
      <div
        className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Interactive Hover dotted grid - Spotlight effect */}
      <div
        className="fixed inset-0 z-0 opacity-60 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: "radial-gradient(circle at center, #ffffff 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          WebkitMaskImage: `radial-gradient(circle 160px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
          maskImage: `radial-gradient(circle 160px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
        }}
      />

      {/* Subtle ambient glow behind the panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <TopNavbar />

      {/* Main Content Area */}
      <div className="relative z-10 w-full flex-grow pt-32 pb-16 flex justify-center px-4">{children}</div>
    </div>
  );
}

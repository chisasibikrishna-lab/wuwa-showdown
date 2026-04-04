"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, History, ChevronDown, Shield, User, Palette } from "lucide-react";
import ThemeSelectModal from "@/components/ThemeSelectModal";

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/[0.05] transition-colors group"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={user.avatar} className="w-7 h-7 rounded-full border border-white/20" alt="Avatar" />
        <span className="text-white font-semibold tracking-wide text-[13px] uppercase hidden sm:block">{user.name}</span>
        <ChevronDown size={13} className={`text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f1117]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50">
          {/* Profile Header */}
          <div className="px-4 py-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatar} className="w-9 h-9 rounded-full border border-white/20" alt="Avatar" />
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {user.role === "admin" ? (
                    <><Shield size={10} className="text-primary" /><span className="text-primary text-[10px] font-semibold uppercase tracking-wide">Admin</span></>
                  ) : (
                    <><User size={10} className="text-white/30" /><span className="text-white/30 text-[10px] font-medium uppercase tracking-wide">Player</span></>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5">
            <Link
              href="/history"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors text-sm font-medium"
            >
              <History size={15} className="text-primary/70" />
              Match History
            </Link>
            <button
              onClick={() => { setThemeModalOpen(true); setOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors text-sm font-medium"
            >
              <Palette size={15} className="text-primary/70" />
              Theme
            </button>
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/5 transition-colors text-sm font-medium"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      )}
      <ThemeSelectModal open={themeModalOpen} onClose={() => setThemeModalOpen(false)} />
    </div>
  );
}

"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";
import { Rajdhani } from "next/font/google";

const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

interface NavItemProps {
  label: string;
  href: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ label, href, isActive }) => {
  return (
    <Link href={href} className="relative flex items-center justify-center h-full px-8 cursor-pointer group">
      {/* Skewed Background Container */}
      <div className="absolute inset-y-0 left-0 right-0 -skew-x-[20deg] pointer-events-none z-0">
        {/* Hover State Background */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 bg-white/[0.03] opacity-0 group-hover:opacity-100 ${isActive ? "!opacity-0" : ""}`}
        />

        {/* Active State Gradient Background */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 bg-gradient-to-t from-[#ffcc00]/25 via-[#ffcc00]/5 to-transparent ${isActive ? "opacity-100" : "opacity-0"}`}
        />

        {/* Active Side Slanted Lines */}
        <div
          className={`absolute inset-y-0 left-0 w-[1px] transition-opacity duration-300 bg-gradient-to-t from-[#ffcc00] via-[#ffcc00]/40 to-transparent ${isActive ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute inset-y-0 right-0 w-[1px] transition-opacity duration-300 bg-gradient-to-t from-[#ffcc00] via-[#ffcc00]/40 to-transparent ${isActive ? "opacity-100" : "opacity-0"}`}
        />

        {/* Active Bottom Glowing Line */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[3px] transition-opacity duration-300 bg-[#ffcc00] shadow-[0_0_15px_rgba(255,204,0,0.8)] ${isActive ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* Nav Item Text */}
      <span
        className={`relative z-10 text-[15px] uppercase font-bold tracking-[0.12em] transition-colors duration-300 ${
          isActive ? "text-[#ffcc00] drop-shadow-[0_0_8px_rgba(255,204,0,0.6)]" : "text-[#8b92a5] group-hover:text-white"
        }`}
      >
        {label}
      </span>
    </Link>
  );
};

const baseNavItems = [
  { label: "HOME", href: "/" },
  // { label: "LEADERBOARD", href: "/leaderboard" },
  { label: "MAP", href: "/map" },
  { label: "ARENA", href: "/arena" },
];

export default function TopNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const navItems = user?.role === "admin"
    ? [...baseNavItems, { label: "ADMIN", href: "/admin" }]
    : baseNavItems;

  return (
    <div className={`w-full flex justify-start z-50 fixed top-0 left-0 right-0 pointer-events-none ${rajdhani.className}`}>
      <div className="relative h-14 w-full max-w-[1000px] pointer-events-auto">
        {/* Glassmorphism Background with Slanted Right Edge */}
        <div
          className="absolute inset-0 bg-[#161922]/90 backdrop-blur-md border-t border-b border-white/[0.04]"
          style={{ clipPath: "polygon(0 0, 100% 0, 98% 100%, 0% 100%)" }}
        />

        {/* Content Container */}
        <div className="relative h-full flex items-center pl-8 pr-16 z-10">
          {/* Left Side: Title */}
          <div className="flex-shrink-0 mr-16 pt-1">
            <h1
              className="text-white text-[28px] italic uppercase font-bold tracking-[0.08em]"
              style={{
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              GAMESVIEWTAMIL
            </h1>
          </div>

          {/* Right Side: Navigation Items & Auth */}
          <div className="flex flex-1 h-full items-center justify-between">
            <div className="flex h-full">
              {navItems.map((item) => (
                <NavItem key={item.label} label={item.label} href={item.href} isActive={pathname === item.href} />
              ))}
            </div>

            <div className="flex items-center pl-4 border-l border-white/10 h-8 ml-auto pointer-events-auto">
               {user ? (
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <img src={user.avatar} className="w-6 h-6 rounded-full border border-white/20 shadow-inner" />
                       <span className="text-white font-semibold tracking-wide text-[13px] uppercase">{user.name}</span>
                    </div>
                    <button onClick={logout} className="text-white/40 hover:text-red-400 transition-colors flex items-center gap-1 text-[11px] uppercase font-bold tracking-widest" title="Logout">
                       <LogOut size={14} />
                    </button>
                 </div>
               ) : (
                 <Link href="/login" className="text-[#ffcc00] border border-[#ffcc00]/50 hover:bg-[#ffcc00]/10 px-3 py-1 rounded transition-all flex items-center gap-2 text-[12px] uppercase font-semibold tracking-wide">
                    <UserIcon size={14} /> Login
                 </Link>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
        className={`relative z-10 text-[15px] uppercase transition-colors duration-300 ${
          isActive ? "text-[#ffcc00] drop-shadow-[0_0_8px_rgba(255,204,0,0.6)]" : "text-[#8b92a5] group-hover:text-white"
        }`}
        style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: "0.12em" }}
      >
        {label}
      </span>
    </Link>
  );
};

const navItems = [
  { label: "HOME", href: "/" },
  { label: "LEADERBOARD", href: "/leaderboard" },
  { label: "MAP", href: "/map" },
  { label: "ARENA", href: "/arena" },
  { label: "ADMIN", href: "/admin" },
];

export default function TopNavbar() {
  const pathname = usePathname();

  return (
    <div className="w-full flex justify-start z-50 fixed top-0 left-0 right-0 pointer-events-none">
      <div className="relative h-14 w-full max-w-[912px] pointer-events-auto">
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
              className="text-white text-[32px] italic uppercase"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: "0.08em",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              GAMESVIEWTAMIL
            </h1>
          </div>

          {/* Right Side: Navigation Items */}
          <div className="flex h-full">
            {navItems.map((item) => (
              <NavItem key={item.label} label={item.label} href={item.href} isActive={pathname === item.href} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { Edit2, Sun, Settings, Trash2, Command, type LucideIcon } from "lucide-react";

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  danger?: boolean;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, shortcut, danger, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full group flex items-center justify-between px-3 py-2.5 rounded-xl
        transition-all duration-200 ease-out outline-none
        hover:bg-white/10 focus:bg-white/10 active:scale-[0.98]
        ${danger ? "hover:bg-red-500/10 focus:bg-red-500/10" : ""}
      `}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={16}
          className={`transition-colors duration-200 ${
            danger ? "text-red-400/70 group-hover:text-red-400" : "text-neutral-400 group-hover:text-neutral-200"
          }`}
        />
        <span
          className={`text-sm font-medium tracking-wide ${
            danger ? "text-red-400/90 group-hover:text-red-400" : "text-neutral-300 group-hover:text-white"
          }`}
        >
          {label}
        </span>
      </div>

      {shortcut && (
        <span className="text-[11px] font-medium tracking-widest text-neutral-500 group-hover:text-neutral-400 transition-colors">
          {shortcut}
        </span>
      )}
    </button>
  );
};

const Separator: React.FC = () => (
  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-1.5" />
);

interface FloatingPanelProps {
  isVisible: boolean;
}

export default function FloatingPanel({ isVisible }: FloatingPanelProps) {
  return (
    <div
      className={`
        relative z-30 w-[280px] p-1.5
        rounded-[16px]
        bg-[#121214]/80
        backdrop-blur-xl backdrop-saturate-150
        border border-white/[0.08]
        shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.1)]
        transition-all duration-700 ease-out
        ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95 pointer-events-none"}
      `}
    >
      {/* Actions Group */}
      <div className="flex flex-col gap-0.5">
        <MenuItem icon={Edit2} label="Edit Mode" shortcut="⌘E" />
        <MenuItem icon={Command} label="Command menu" shortcut="⌘K" />
      </div>

      <Separator />

      {/* Preferences Group */}
      <div className="flex flex-col gap-0.5">
        <MenuItem icon={Sun} label="Light mode" shortcut="⇧⌘L" />
        <MenuItem icon={Settings} label="Settings" shortcut="⌘," />
      </div>

      <Separator />

      {/* Danger Zone */}
      <div className="flex flex-col gap-0.5">
        <MenuItem icon={Trash2} label="Reset Leaderboard" danger />
      </div>
    </div>
  );
}

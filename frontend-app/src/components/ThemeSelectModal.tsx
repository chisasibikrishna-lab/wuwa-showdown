"use client";
import React, { useEffect, useRef } from "react";
import { useTheme, THEMES, ThemeOption } from "@/context/ThemeContext";
import { X, Check } from "lucide-react";

interface ThemeSelectModalProps {
  open: boolean;
  onClose: () => void;
}

function ThemeCard({ theme, isActive, onSelect }: { theme: ThemeOption; isActive: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`relative group rounded-2xl p-3 pt-3.5 transition-all duration-300 cursor-pointer text-left
        ${isActive
          ? "bg-white/[0.06] scale-[1.02]"
          : "bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12]"
        }`}
      style={{
        outline: isActive ? `2px solid ${theme.primary}` : undefined,
        outlineOffset: isActive ? '-2px' : undefined,
        borderColor: isActive ? theme.primary : undefined,
        borderRadius: '1rem',
        boxShadow: isActive ? `0 0 20px ${theme.primary}30, inset 0 0 20px ${theme.primary}08` : undefined,
      }}
    >
      {/* Active check */}
      {isActive && (
        <div
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
          style={{ background: theme.primary }}
        >
          <Check size={11} className="text-black" strokeWidth={3} />
        </div>
      )}

      {/* Preview Window */}
      <div
        className="w-full aspect-[16/10] rounded-lg overflow-hidden mb-2.5 relative"
        style={{ background: theme.bg === "#ffffff" ? "#f5f5f5" : "#1a1a22" }}
      >
        {/* Fake window top bar dots */}
        <div className="flex items-center gap-1 p-2 pb-0">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.primary, opacity: 0.8 }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.primary, opacity: 0.5 }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.primary, opacity: 0.3 }} />
        </div>

        {/* Fake accent bar */}
        <div className="mx-2 mt-2 h-1.5 rounded-full" style={{ background: theme.primary }} />

        {/* Fake content line */}
        <div className="mx-2 mt-1.5 h-1 rounded-full w-2/3" style={{ background: theme.primary, opacity: 0.2 }} />
      </div>

      {/* Theme name */}
      <p className={`text-xs font-semibold tracking-wide ${isActive ? "text-white" : "text-white/60 group-hover:text-white/80"} transition-colors`}>
        {theme.name}
      </p>
    </button>
  );
}

export default function ThemeSelectModal({ open, onClose }: ThemeSelectModalProps) {
  const { currentTheme, setTheme } = useTheme();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[999] flex items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-[#0f1117]/95 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-white text-lg font-bold tracking-wide">Choose Theme</h2>
            <p className="text-white/40 text-xs mt-0.5">Personalize your experience</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-white/40" />
          </button>
        </div>

        {/* Theme Grid */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {THEMES.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={currentTheme === theme.id}
                onSelect={() => {
                  setTheme(theme.id);
                  onClose();
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

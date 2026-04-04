"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface ThemeOption {
  id: string;
  name: string;
  primary: string;
  bg: string;
  fg: string;
}

export const THEMES: ThemeOption[] = [
  { id: "imperial-gold",    name: "Imperial Gold",    primary: "#ffcc00", bg: "#0a0a0c", fg: "#ededed" },
  { id: "blackbox-classic", name: "BlackBox Classic", primary: "#00d26a", bg: "#0f1117", fg: "#ededed" },
  { id: "daylight",         name: "Daylight",         primary: "#09090b", bg: "#ffffff", fg: "#09090b" },
  { id: "matrix-green",     name: "Matrix Green",     primary: "#22c55e", bg: "#0a0a0c", fg: "#ededed" },
  { id: "arctic-cyan",      name: "Arctic Cyan",      primary: "#06b6d4", bg: "#0a0a0c", fg: "#ededed" },
  { id: "cobalt-blue",      name: "Cobalt Blue",      primary: "#3b82f6", bg: "#0a0a0c", fg: "#ededed" },
  { id: "indigo-pulse",     name: "Indigo Pulse",     primary: "#6366f1", bg: "#0a0a0c", fg: "#ededed" },
  { id: "violet-flux",      name: "Violet Flux",      primary: "#8b5cf6", bg: "#0a0a0c", fg: "#ededed" },
  { id: "magenta-rose",     name: "Magenta Rose",     primary: "#d946ef", bg: "#0a0a0c", fg: "#ededed" },
  { id: "crimson-ruby",     name: "Crimson Ruby",     primary: "#f43f5e", bg: "#0a0a0c", fg: "#ededed" },
  { id: "amber-blaze",      name: "Amber Blaze",      primary: "#f59e0b", bg: "#0a0a0c", fg: "#ededed" },
  { id: "copper-ember",     name: "Copper Ember",     primary: "#ea580c", bg: "#0a0a0c", fg: "#ededed" },
  { id: "slate-silver",     name: "Slate Silver",     primary: "#94a3b8", bg: "#0a0a0c", fg: "#ededed" },
];

interface ThemeContextValue {
  currentTheme: string;
  setTheme: (themeId: string) => void;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<string>("imperial-gold");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wuwa-theme");
    if (saved && THEMES.some(t => t.id === saved)) {
      setCurrentTheme(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("wuwa-theme", currentTheme);
  }, [currentTheme, mounted]);

  const setTheme = useCallback((themeId: string) => {
    if (THEMES.some(t => t.id === themeId)) {
      setCurrentTheme(themeId);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

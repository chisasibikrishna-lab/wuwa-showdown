"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Player {
  id: number;
  name: string;
  score: number;
  avatar: string;
}

interface TournamentContextValue {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  addPoints: (playerId: number, points: number) => void;
  removePoints: (playerId: number, points: number) => void;
  kickPlayer: (playerId: number) => void;
  addPlayer: (name: string) => void;
  resetLeaderboard: () => void;
}

const TournamentContext = createContext<TournamentContextValue | null>(null);

const DEFAULT_PLAYERS: Player[] = [
  { id: 1, name: "Rover_Alpha", score: 15, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rover_Alpha" },
  { id: 2, name: "Yangyang_Fan", score: 12, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yangyang_Fan" },
  { id: 3, name: "Jiyan_Main", score: 10, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jiyan_Main" },
  { id: 4, name: "Yinlin_Simp", score: 8, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yinlin_Simp" },
  { id: 5, name: "Encore_Plays", score: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Encore_Plays" },
  { id: 6, name: "Encore_Plays", score: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Encore_Plays" },
  { id: 7, name: "Encore_Plays", score: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Encore_Plays" },
  { id: 8, name: "Encore_Plays", score: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Encore_Plays" },
  { id: 9, name: "Encore_Plays", score: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Encore_Plays" },
  { id: 10, name: "Encore_Plays", score: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Encore_Plays" },
];

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("wuwa_tournament_players");
    if (saved) {
      try {
        setPlayers(JSON.parse(saved));
      } catch {
        console.error("Failed to load players");
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("wuwa_tournament_players", JSON.stringify(players));
  }, [players]);

  const addPoints = (playerId: number, points: number) => {
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, score: p.score + points } : p)));
  };

  const removePoints = (playerId: number, points: number) => {
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, score: Math.max(0, p.score - points) } : p)));
  };

  const kickPlayer = (playerId: number) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  };

  const addPlayer = (name: string) => {
    setPlayers((prev) => {
      const newId = prev.length > 0 ? Math.max(...prev.map((p) => p.id)) + 1 : 1;
      return [...prev, { id: newId, name, score: 0, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` }];
    });
  };

  const resetLeaderboard = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
  };

  return (
    <TournamentContext.Provider
      value={{ players, setPlayers, addPoints, removePoints, kickPlayer, addPlayer, resetLeaderboard }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament(): TournamentContextValue {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error("useTournament must be used within a TournamentProvider");
  return ctx;
}

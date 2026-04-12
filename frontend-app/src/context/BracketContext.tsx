"use client";
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { io, Socket } from "socket.io-client";

export interface BracketParticipant {
  seed: number;
  name: string;
}

export interface BracketMatch {
  matchId: string;
  round: number;
  position: number;
  bracket: "winners" | "losers" | "grand";
  participant1Seed: number | null;
  participant2Seed: number | null;
  winnerSeed: number | null;
  score1: number;
  score2: number;
  venue: string | null;
  status: "pending" | "active" | "completed" | "bye";
}

export interface BracketData {
  _id: string;
  name: string;
  type: "single" | "double";
  status: "draft" | "active" | "completed";
  creatorId: string;
  creatorName: string;
  shareCode: string;
  participants: BracketParticipant[];
  randomizeSeeding: boolean;
  venues: string[];
  matches: BracketMatch[];
  champion: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BracketContextValue {
  brackets: BracketData[];
  loadingBrackets: boolean;
  activeBracket: BracketData | null;
  fetchBrackets: () => Promise<void>;
  fetchBracket: (shareCode: string) => Promise<BracketData | null>;
  createBracket: (data: { name: string; type: string; participants: string[]; randomizeSeeding: boolean; venues?: string[] }) => Promise<BracketData | null>;
  updateBracket: (id: string, data: { name?: string; type?: string; participants?: string[]; randomizeSeeding?: boolean; venues?: string[] }) => Promise<BracketData | null>;
  generateBracket: (id: string) => Promise<BracketData | null>;
  setMatchWinner: (id: string, matchId: string, winnerSeed: number, score1?: number, score2?: number) => Promise<BracketData | null>;
  setMatchVenue: (id: string, matchId: string, venue: string | null) => Promise<BracketData | null>;
  undoMatchWinner: (id: string, matchId: string) => Promise<BracketData | null>;
  resetBracket: (id: string) => Promise<BracketData | null>;
  deleteBracket: (id: string) => Promise<boolean>;
  joinBracketRoom: (shareCode: string) => void;
  leaveBracketRoom: (shareCode: string) => void;
  setActiveBracket: (bracket: BracketData | null) => void;
}

const BracketContext = createContext<BracketContextValue | null>(null);

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

let bracketSocket: Socket | null = null;

export function BracketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [brackets, setBrackets] = useState<BracketData[]>([]);
  const [loadingBrackets, setLoadingBrackets] = useState(false);
  const [activeBracket, setActiveBracket] = useState<BracketData | null>(null);

  const headers = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  // Socket.IO connection for real-time bracket updates
  useEffect(() => {
    if (!token) return;

    if (!bracketSocket) {
      bracketSocket = io(BASE, { auth: { token } });
    } else {
      bracketSocket.auth = { token };
      if (!bracketSocket.connected) bracketSocket.connect();
    }

    const onBracketUpdate = (bracket: BracketData) => {
      setActiveBracket(prev => {
        if (prev && prev._id === bracket._id) return bracket;
        return prev;
      });
      setBrackets(prev => prev.map(b => b._id === bracket._id ? bracket : b));
    };

    bracketSocket.off("BRACKET_UPDATE");
    bracketSocket.on("BRACKET_UPDATE", onBracketUpdate);

    return () => {
      bracketSocket?.off("BRACKET_UPDATE", onBracketUpdate);
    };
  }, [token]);

  const fetchBrackets = useCallback(async () => {
    if (!token) return;
    setLoadingBrackets(true);
    try {
      const res = await fetch(`${BASE}/api/brackets`, { headers: headers() });
      const data = await res.json();
      setBrackets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBrackets(false);
    }
  }, [token, headers]);

  const fetchBracket = useCallback(async (shareCode: string): Promise<BracketData | null> => {
    try {
      const res = await fetch(`${BASE}/api/brackets/${shareCode}`);
      if (!res.ok) return null;
      const data = await res.json();
      setActiveBracket(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const createBracket = useCallback(async (data: { name: string; type: string; participants: string[]; randomizeSeeding: boolean }): Promise<BracketData | null> => {
    if (!token) return null;
    try {
      const res = await fetch(`${BASE}/api/brackets`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      const bracket = await res.json();
      setBrackets(prev => [bracket, ...prev]);
      return bracket;
    } catch {
      return null;
    }
  }, [token, headers]);

  const updateBracket = useCallback(async (id: string, data: any): Promise<BracketData | null> => {
    if (!token) return null;
    try {
      const res = await fetch(`${BASE}/api/brackets/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      const bracket = await res.json();
      setActiveBracket(bracket);
      setBrackets(prev => prev.map(b => b._id === id ? bracket : b));
      return bracket;
    } catch {
      return null;
    }
  }, [token, headers]);

  const generateBracket = useCallback(async (id: string): Promise<BracketData | null> => {
    if (!token) return null;
    try {
      const res = await fetch(`${BASE}/api/brackets/${id}/generate`, {
        method: "POST",
        headers: headers(),
      });
      if (!res.ok) return null;
      const bracket = await res.json();
      setActiveBracket(bracket);
      setBrackets(prev => prev.map(b => b._id === id ? bracket : b));
      return bracket;
    } catch {
      return null;
    }
  }, [token, headers]);

  const setMatchWinner = useCallback(async (id: string, matchId: string, winnerSeed: number, score1?: number, score2?: number): Promise<BracketData | null> => {
    if (!token) return null;
    try {
      const res = await fetch(`${BASE}/api/brackets/${id}/matches/${matchId}/winner`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ winnerSeed, score1, score2 }),
      });
      if (!res.ok) return null;
      const bracket = await res.json();
      setActiveBracket(bracket);
      // Also emit via socket for real-time
      bracketSocket?.emit("BRACKET_SET_WINNER", { bracketId: id, matchId, winnerSeed, score1, score2 });
      return bracket;
    } catch {
      return null;
    }
  }, [token, headers]);

  const setMatchVenue = useCallback(async (id: string, matchId: string, venue: string | null): Promise<BracketData | null> => {
    if (!token) return null;
    try {
      const res = await fetch(`${BASE}/api/brackets/${id}/matches/${matchId}/venue`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ venue }),
      });
      if (!res.ok) return null;
      const bracket = await res.json();
      setActiveBracket(bracket);
      // Also emit via socket for real-time
      bracketSocket?.emit("BRACKET_SET_VENUE", { bracketId: id, matchId, venue });
      return bracket;
    } catch {
      return null;
    }
  }, [token, headers]);

  const undoMatchWinner = useCallback(async (id: string, matchId: string): Promise<BracketData | null> => {
    if (!token) return null;
    try {
      const res = await fetch(`${BASE}/api/brackets/${id}/matches/${matchId}/undo`, {
        method: "PUT",
        headers: headers(),
      });
      if (!res.ok) return null;
      const bracket = await res.json();
      setActiveBracket(bracket);
      return bracket;
    } catch {
      return null;
    }
  }, [token, headers]);

  const resetBracket = useCallback(async (id: string): Promise<BracketData | null> => {
    if (!token) return null;
    try {
      const res = await fetch(`${BASE}/api/brackets/${id}/reset`, {
        method: "POST",
        headers: headers(),
      });
      if (!res.ok) return null;
      const bracket = await res.json();
      setActiveBracket(bracket);
      setBrackets(prev => prev.map(b => b._id === id ? bracket : b));
      return bracket;
    } catch {
      return null;
    }
  }, [token, headers]);

  const deleteBracket = useCallback(async (id: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`${BASE}/api/brackets/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      if (res.ok) {
        setBrackets(prev => prev.filter(b => b._id !== id));
        if (activeBracket?._id === id) setActiveBracket(null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [token, headers, activeBracket]);

  const joinBracketRoom = useCallback((shareCode: string) => {
    bracketSocket?.emit("BRACKET_JOIN", { shareCode });
  }, []);

  const leaveBracketRoom = useCallback((shareCode: string) => {
    bracketSocket?.emit("BRACKET_LEAVE", { shareCode });
  }, []);

  return (
    <BracketContext.Provider value={{
      brackets, loadingBrackets, activeBracket,
      fetchBrackets, fetchBracket, createBracket, updateBracket,
      generateBracket, setMatchWinner, undoMatchWinner, setMatchVenue,
      resetBracket, deleteBracket, joinBracketRoom, leaveBracketRoom,
      setActiveBracket,
    }}>
      {children}
    </BracketContext.Provider>
  );
}

export function useBracket(): BracketContextValue {
  const ctx = useContext(BracketContext);
  if (!ctx) throw new Error("useBracket must be used within BracketProvider");
  return ctx;
}

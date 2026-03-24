"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface PlayerSnapshot {
  id: string;
  name: string;
  avatar: string;
  roomScore: number;
}

export interface ChallengeResultRecord {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  points: number;
  distance: number;
  timeTaken: number;
}

export interface ChallengeRecord {
  _id: string;
  roomRecordId: string;
  roomCode: string;
  timeLimitSeconds: number;
  completedAt: string;
  results: ChallengeResultRecord[];
  historicalRankings: {
    before: PlayerSnapshot[];
    after: PlayerSnapshot[];
  };
  createdAt: string;
}

export interface RoomRecord {
  _id: string;
  name: string;
  code: string;
  creator: string;
  players: PlayerSnapshot[];
  challengeCount: number;
  closedAt: string | null;
  createdAt: string;
}

interface HistoryContextValue {
  rooms: RoomRecord[];
  loadingRooms: boolean;
  fetchRooms: () => Promise<void>;
  fetchRoomDetail: (roomId: string) => Promise<{ room: RoomRecord; challenges: ChallengeRecord[] } | null>;
  deleteRoom: (roomId: string) => Promise<boolean>;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export function HistoryProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const headers = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

  const fetchRooms = useCallback(async () => {
    if (!token) return;
    setLoadingRooms(true);
    try {
      const res = await fetch(`${BASE}/api/history/rooms`, { headers: headers() });
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRooms(false);
    }
  }, [token]);

  const fetchRoomDetail = useCallback(async (roomId: string) => {
    if (!token) return null;
    try {
      const res = await fetch(`${BASE}/api/history/rooms/${roomId}`, { headers: headers() });
      if (!res.ok) return null;
      return await res.json() as { room: RoomRecord; challenges: ChallengeRecord[] };
    } catch {
      return null;
    }
  }, [token]);

  const deleteRoom = useCallback(async (roomId: string) => {
    if (!token) return false;
    try {
      const res = await fetch(`${BASE}/api/history/rooms/${roomId}`, { method: "DELETE", headers: headers() });
      if (res.ok) {
        setRooms(prev => prev.filter(r => r._id !== roomId));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [token]);

  return (
    <HistoryContext.Provider value={{ rooms, loadingRooms, fetchRooms, fetchRoomDetail, deleteRoom }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}

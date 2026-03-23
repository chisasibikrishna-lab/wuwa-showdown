"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

export interface Player {
  id: number;
  name: string;
  score: number;
  avatar: string;
}

export interface RoomPlayer extends Player {
  roomScore: number;
  hasLoadedAssets: boolean;
  isReady: boolean;
}

export interface ChallengeResult {
  playerId: number | string;
  points: number;
  distance: number;
  timeTaken: number;
}

export interface Challenge {
  id: string;
  image: string | null;
  targetCoords: [number, number];
  timeLimitSeconds: number;
  status: "pending" | "waiting" | "active" | "completed";
  results: ChallengeResult[];
  startedAt?: number;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  createdAt: number;
  creator: string;
  players: RoomPlayer[];
  challenges: Challenge[];
  activeChallengeId: string | null;
}

interface TournamentContextValue {
  connected: boolean;
  players: Player[];
  addPlayer: (name: string) => void;
  kickPlayer: (playerId: number) => void;

  rooms: Room[];
  createRoom: (name: string, creator: string) => void;
  joinRoom: (roomCode: string, player: Player) => void;
  deleteRoom: (roomId: string) => void;

  addRoomPoints: (roomId: string, playerId: number, points: number) => void;
  removeRoomPoints: (roomId: string, playerId: number, points: number) => void;
  resetRoomLeaderboard: (roomId: string) => void;

  createChallenge: (roomId: string, image: string, targetCoords: [number, number], timeLimitSeconds: number) => void;
  startChallengeLobby: (roomId: string, challengeId: string) => void;
  launchChallenge: (roomId: string, challengeId: string) => void;
  endChallenge: (roomId: string, challengeId: string) => void;

  setPlayerLoadedAssets: (roomId: string, playerId: number, loaded: boolean) => void;
  setPlayerReady: (roomId: string, playerId: number, ready: boolean) => void;
  submitChallengeGeoguess: (roomId: string, challengeId: string, playerId: number | string, guessedCoords: [number, number], timeTaken: number) => void;
}

const TournamentContext = createContext<TournamentContextValue | null>(null);

let socket: Socket;

export function TournamentProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Connect with JWT Payload
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000", {
        auth: { token }
      });
    } else {
      socket.auth = { token };
      socket.disconnect().connect();
    }

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onStateUpdate = (state: { rooms: Room[], players: Player[] }) => {
      setRooms(state.rooms || []);
      setPlayers(state.players || []);
    };

    if (socket.connected) setConnected(true);

    // Remove existing to avoid dupes across re-renders
    socket.off("connect");
    socket.off("disconnect");
    socket.off("STATE_UPDATE");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("STATE_UPDATE", onStateUpdate);

    return () => {
      if (socket) {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("STATE_UPDATE", onStateUpdate);
      }
    };
  }, [token]);

  const addPlayer = (name: string) => socket?.emit("ADD_PLAYER", name);
  const kickPlayer = (playerId: number) => socket?.emit("KICK_PLAYER", playerId);
  const createRoom = (name: string, creator: string) => socket?.emit("CREATE_ROOM", { name, creator });
  const joinRoom = (roomCode: string, player: Player) => socket?.emit("JOIN_ROOM", { roomCode, player });
  const deleteRoom = (roomId: string) => socket?.emit("DELETE_ROOM", roomId);
  const addRoomPoints = (roomId: string, playerId: number, points: number) => socket?.emit("ADD_ROOM_POINTS", { roomId, playerId, points });
  const removeRoomPoints = (roomId: string, playerId: number, points: number) => socket?.emit("REMOVE_ROOM_POINTS", { roomId, playerId, points });
  const resetRoomLeaderboard = (roomId: string) => socket?.emit("RESET_LEADERBOARD", roomId);
  const createChallenge = (roomId: string, image: string, targetCoords: [number, number], timeLimitSeconds: number) => socket?.emit("CREATE_CHALLENGE", { roomId, image, targetCoords, timeLimitSeconds });
  const startChallengeLobby = (roomId: string, challengeId: string) => socket?.emit("START_CHALLENGE_LOBBY", { roomId, challengeId });
  const launchChallenge = (roomId: string, challengeId: string) => socket?.emit("LAUNCH_CHALLENGE", { roomId, challengeId });
  const endChallenge = (roomId: string, challengeId: string) => socket?.emit("END_CHALLENGE", { roomId, challengeId });
  const setPlayerLoadedAssets = (roomId: string, playerId: number, loaded: boolean) => socket?.emit("SET_ASSETS_LOADED", { roomId, playerId, loaded });
  const setPlayerReady = (roomId: string, playerId: number, ready: boolean) => socket?.emit("SET_READY", { roomId, playerId, ready });
  const submitChallengeGeoguess = (roomId: string, challengeId: string, playerId: number | string, guessedCoords: [number, number], timeTaken: number) => socket?.emit("SUBMIT_GEOGUESS", { roomId, challengeId, playerId, guessedCoords, timeTaken });

  return (
    <TournamentContext.Provider
      value={{
        connected,
        players, addPlayer, kickPlayer,
        rooms, createRoom, joinRoom, deleteRoom,
        addRoomPoints, removeRoomPoints, resetRoomLeaderboard,
        createChallenge, startChallengeLobby, launchChallenge, endChallenge,
        setPlayerLoadedAssets, setPlayerReady, submitChallengeGeoguess
      }}
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

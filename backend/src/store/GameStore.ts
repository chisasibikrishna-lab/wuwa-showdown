import { User as UserModel } from "../models/User";
import mongoose from "mongoose";

export interface Player {
  id: number | string;
  name: string;
  score: number;
  avatar: string;
}

export interface RoomPlayer extends Player {
  roomScore: number;
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
  pendingPlayers: Player[];
  challenges: Challenge[];
  activeChallengeId: string | null;
}

class GameManager {
  private rooms: Room[] = [];

  public async getFullState() {
    try {
      const topUsers = await UserModel.find({}).sort({ totalScore: -1 }).limit(50);
      const globalPlayers = topUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        score: u.totalScore,
        avatar: u.avatar
      })) as Player[];

      return {
        rooms: this.rooms,
        players: globalPlayers,
      };
    } catch (e) {
      console.error(e);
      return { rooms: this.rooms, players: [] };
    }
  }

  // GLOBAL PLAYERS
  public addPlayer(name: string) {
    // Deprecated for MongoDB
  }

  public kickPlayerGlobal(playerId: number | string) {
    // Deprecated for MongoDB
  }

  // ROOM LOGIC
  private generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  public createRoom(name: string, creator: string) {
    const newRoom: Room = {
      id: Date.now().toString(),
      code: this.generateRoomCode(),
      name,
      createdAt: Date.now(),
      creator,
      players: [],
      pendingPlayers: [],
      challenges: [],
      activeChallengeId: null,
    };
    this.rooms.push(newRoom);
    return newRoom;
  }

  public joinRoom(roomCode: string, player: Player) {
    const room = this.rooms.find(r => r.code === roomCode);
    if (!room) return false;
    // Already admitted
    if (room.players.find(p => String(p.id) === String(player.id))) return true;
    // Already pending
    if (room.pendingPlayers.find(p => String(p.id) === String(player.id))) return true;
    room.pendingPlayers.push(player);
    return true;
  }

  public admitPlayer(roomId: string, playerId: number | string) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    const idx = room.pendingPlayers.findIndex(p => String(p.id) === String(playerId));
    if (idx === -1) return;
    const [player] = room.pendingPlayers.splice(idx, 1);
    room.players.push({ ...player, roomScore: 0, isReady: false });
  }

  public admitAllPlayers(roomId: string) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    for (const player of room.pendingPlayers) {
      room.players.push({ ...player, roomScore: 0, isReady: false });
    }
    room.pendingPlayers = [];
  }

  public deleteRoom(roomId: string) {
    this.rooms = this.rooms.filter(r => r.id !== roomId);
  }

  public kickPlayerFromRoom(roomId: string, playerId: number | string) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    room.players = room.players.filter(p => String(p.id) !== String(playerId));
    room.pendingPlayers = room.pendingPlayers.filter(p => String(p.id) !== String(playerId));
  }

  public addRoomPoints(roomId: string, playerId: number, points: number) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    const p = room.players.find(x => String(x.id) === String(playerId));
    if (p) p.roomScore += points;
  }

  public removeRoomPoints(roomId: string, playerId: number, points: number) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    const p = room.players.find(x => String(x.id) === String(playerId));
    if (p) p.roomScore = Math.max(0, p.roomScore - points);
  }

  public resetRoomLeaderboard(roomId: string) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    room.players.forEach(p => p.roomScore = 0);
  }

  // CHALLENGE LOGIC
  public createChallenge(roomId: string, image: string, targetCoords: [number, number], timeLimitSeconds: number) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    room.challenges.push({
      id: Date.now().toString(),
      image,
      targetCoords,
      timeLimitSeconds,
      status: "pending",
      results: []
    });
  }

  public startChallengeLobby(roomId: string, challengeId: string) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    room.players.forEach(p => {
      p.isReady = false;
    });
    room.activeChallengeId = challengeId;
    const c = room.challenges.find(x => x.id === challengeId);
    if (c) c.status = "waiting";
  }

  public launchChallenge(roomId: string, challengeId: string): number | void {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    const c = room.challenges.find(x => x.id === challengeId);
    if (c) {
      c.status = "active";
      c.startedAt = Date.now();
      return c.timeLimitSeconds;
    }
  }

  public endChallenge(roomId: string, challengeId: string) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    const c = room.challenges.find(x => x.id === challengeId);
    if (c) c.status = "completed";
  }

  public clearActiveChallenge(roomId: string) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    room.activeChallengeId = null;
  }

  // PLAYER ACTIONS IN ROOM

  public setPlayerReady(roomId: string, playerId: number, ready: boolean) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    const p = room.players.find(x => String(x.id) === String(playerId));
    if (p) p.isReady = ready;
  }

  public async submitChallengeGeoguess(roomId: string, challengeId: string, playerId: number | string, guessedCoords: [number, number], timeTaken: number) {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return;
    const c = room.challenges.find(x => x.id === challengeId);
    if (!c || c.status !== "active") return;
    if (c.results.find(x => x.playerId != null && String(x.playerId) === String(playerId))) return;

    const dx = c.targetCoords[0] - guessedCoords[0];
    const dy = c.targetCoords[1] - guessedCoords[1];
    const distance = Math.sqrt(dx * dx + dy * dy);

    let points = 1;
    if (distance <= 50) points = 15;
    else if (distance <= 150) points = 10;
    else if (distance <= 300) points = 5;

    const timeRatio = Math.max(0, 1 - (timeTaken / c.timeLimitSeconds));
    points += Math.floor(timeRatio * 5);

    c.results.push({ playerId, points, distance, timeTaken });

    const p = room.players.find(x => String(x.id) === String(playerId));
    if (p) p.roomScore += points;

    try {
      if (mongoose.Types.ObjectId.isValid(playerId.toString())) {
        await UserModel.findByIdAndUpdate(playerId, { $inc: { totalScore: points } });
      }
    } catch(e) {
      console.error("Failed to update global database score", e);
    }

    // Auto-end challenge when every connected player has submitted
    if (room.players.length > 0 && c.results.length >= room.players.length) {
      this.endChallenge(roomId, challengeId);
    }
  }
}

export const gameManager = new GameManager();

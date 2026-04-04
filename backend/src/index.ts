import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { config } from "./config/env";
import { gameManager } from "./store/GameStore";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
import historyRoutes from "./routes/historyRoutes";
import bracketRoutes from "./routes/bracketRoutes";
import { RoomRecord } from "./models/RoomRecord";
import { ChallengeRecord } from "./models/ChallengeRecord";
import { Bracket } from "./models/Bracket";

const app = express();
app.use(cors({ origin: config.FRONTEND_URL, methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/brackets", bracketRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  maxHttpBufferSize: 1e8 
});

import jwt from "jsonwebtoken";

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Unauthorized: No Token Provided"));
  
  jwt.verify(token, config.JWT_SECRET, (err: any, decoded: any) => {
    if (err) return next(new Error("Unauthorized: Invalid Token"));
    socket.data.user = decoded;
    next();
  });
});

// Broadcast the entire structured state to all clients
const broadcastState = async () => {
  io.emit("STATE_UPDATE", await gameManager.getFullState());
};

// Shared helper: persist a completed challenge and upsert its RoomRecord
async function persistChallengeRecord(roomId: string, challengeId: string) {
  const room = gameManager.getRoomById(roomId);
  if (!room) return;
  const challenge = room.challenges.find(c => c.id === challengeId);
  if (!challenge || challenge.status !== "completed") return;

  // Check if we already recorded this challenge to avoid duplicates
  const already = await ChallengeRecord.findOne({ liveId: challengeId } as any);
  if (already) return;

  try {
    let roomRecord = await RoomRecord.findOne({ code: room.code });
    if (!roomRecord) {
      roomRecord = await RoomRecord.create({
        name: room.name, code: room.code, creator: room.creator,
        players: room.players.map(p => ({ id: String(p.id), name: p.name, avatar: p.avatar, roomScore: p.roomScore })),
        challengeCount: 1,
      });
    } else {
      roomRecord.players = room.players.map(p => ({ id: String(p.id), name: p.name, avatar: p.avatar, roomScore: p.roomScore })) as any;
      roomRecord.challengeCount = (roomRecord.challengeCount || 0) + 1;
      await roomRecord.save();
    }

    const enrichedResults = challenge.results.map(r => {
      const player = room.players.find(p => String(p.id) === String(r.playerId));
      return { ...r, playerName: player?.name ?? "Unknown", playerAvatar: player?.avatar ?? "" };
    });

    await ChallengeRecord.create({
      liveId: challengeId,
      roomRecordId: roomRecord._id,
      roomCode: room.code,
      timeLimitSeconds: challenge.timeLimitSeconds,
      completedAt: new Date(),
      results: enrichedResults,
      historicalRankings: challenge.historicalRankings || { before: [], after: [] },
    });
    console.log(`[History] Saved challenge ${challengeId} for room ${room.code}`);
  } catch (e) {
    console.error("[History] Failed to save challenge record", e);
  }
}

io.on("connection", async (socket: Socket) => {
  console.log(`[Socket] Operator connected: ${socket.id}`);

  // Send initial state immediately
  socket.emit("STATE_UPDATE", await gameManager.getFullState());

  socket.on("ADD_PLAYER", (name: string) => {
    gameManager.addPlayer(name);
    broadcastState();
  });

  socket.on("KICK_PLAYER", (playerId: number) => {
    if (socket.data.user?.role !== "admin") return;
    gameManager.kickPlayerGlobal(playerId);
    broadcastState();
  });

  socket.on("CREATE_ROOM", ({ name, creator }) => {
    if (socket.data.user?.role !== "admin") return;
    gameManager.createRoom(name, creator);
    broadcastState();
  });

  socket.on("JOIN_ROOM", ({ roomCode, player }) => {
    gameManager.joinRoom(roomCode, player);
    broadcastState();
  });

  socket.on("FINALIZE_ROOM", async (roomId: string) => {
    if (socket.data.user?.role !== "admin") return;
    // Persist the room before deleting from memory
    const room = await gameManager.getRoomById(roomId);
    if (room) {
      try {
        const existing = await RoomRecord.findOne({ code: room.code });
        if (!existing) {
          await RoomRecord.create({
            name: room.name,
            code: room.code,
            creator: room.creator,
            players: room.players.map(p => ({ id: String(p.id), name: p.name, avatar: p.avatar, roomScore: p.roomScore })),
            challengeCount: room.challenges.filter(c => c.status === "completed").length,
            closedAt: new Date(),
          });
        }
      } catch (e) {
        console.error("[History] Failed to save room record", e);
      }
    }
    gameManager.deleteRoom(roomId);
    broadcastState();
  });

  socket.on("KICK_PLAYER_FROM_ROOM", ({ roomId, playerId }) => {
    if (socket.data.user?.role !== "admin") return;
    gameManager.kickPlayerFromRoom(roomId, playerId);
    broadcastState();
  });

  socket.on("ADMIT_PLAYER", ({ roomId, playerId }) => {
    if (socket.data.user?.role !== "admin") return;
    gameManager.admitPlayer(roomId, playerId);
    broadcastState();
  });

  socket.on("ADMIT_ALL_PLAYERS", (roomId: string) => {
    if (socket.data.user?.role !== "admin") return;
    gameManager.admitAllPlayers(roomId);
    broadcastState();
  });

  socket.on("ADD_ROOM_POINTS", ({ roomId, playerId, points }) => {
    if (socket.data.user?.role !== "admin") return;
    gameManager.addRoomPoints(roomId, playerId, points);
    broadcastState();
  });

  socket.on("REMOVE_ROOM_POINTS", ({ roomId, playerId, points }) => {
    if (socket.data.user?.role !== "admin") return;
    gameManager.removeRoomPoints(roomId, playerId, points);
    broadcastState();
  });

  socket.on("RESET_LEADERBOARD", (roomId: string) => {
    if (socket.data.user?.role !== "admin") return;
    gameManager.resetRoomLeaderboard(roomId);
    broadcastState();
  });

  socket.on("CREATE_CHALLENGE", ({ roomId, image, targetCoords, timeLimitSeconds }) => {
    if (socket.data.user?.role !== "admin") return;
    gameManager.createChallenge(roomId, image, targetCoords, timeLimitSeconds);
    broadcastState();
  });

  socket.on("START_CHALLENGE_LOBBY", ({ roomId, challengeId }) => {
    if (socket.data.user?.role !== "admin") return;
    gameManager.startChallengeLobby(roomId, challengeId);
    broadcastState();
  });

  socket.on("LAUNCH_CHALLENGE", ({ roomId, challengeId }) => {
    if (socket.data.user?.role !== "admin") return;
    const timeLimit = gameManager.launchChallenge(roomId, challengeId);
    broadcastState();
    
    // Server Authority: Auto close the mission precisely when the duration terminates
    if (timeLimit) {
      setTimeout(async () => {
        gameManager.endChallenge(roomId, challengeId);
        broadcastState();
        await persistChallengeRecord(roomId, challengeId);
      }, timeLimit * 1000);
    }
  });

  socket.on("END_CHALLENGE", async ({ roomId, challengeId }) => {
    if (socket.data.user?.role !== "admin") return;
    gameManager.endChallenge(roomId, challengeId);
    broadcastState();
    await persistChallengeRecord(roomId, challengeId);
  });

  socket.on("CLEAR_ACTIVE_CHALLENGE", (roomId: string) => {
    if (socket.data.user?.role !== "admin") return;
    gameManager.clearActiveChallenge(roomId);
    broadcastState();
  });



  socket.on("SET_READY", ({ roomId, playerId, ready }) => {
    gameManager.setPlayerReady(roomId, playerId, ready);
    broadcastState();
  });

  socket.on("SUBMIT_GEOGUESS", async ({ roomId, challengeId, playerId, guessedCoords, timeTaken }) => {
    await gameManager.submitChallengeGeoguess(roomId, challengeId, playerId, guessedCoords, timeTaken);
    broadcastState();
    // Auto-complete: if all players submitted, GameStore marks challenge as completed internally — persist it here
    const room = gameManager.getRoomById(roomId);
    if (room) {
      const challenge = room.challenges.find(c => c.id === challengeId);
      if (challenge?.status === "completed") {
        await persistChallengeRecord(roomId, challengeId);
      }
    }
  });

  // ─── Bracket Real-Time Events ───
  socket.on("BRACKET_JOIN", ({ shareCode }: { shareCode: string }) => {
    socket.join(`bracket:${shareCode}`);
  });

  socket.on("BRACKET_LEAVE", ({ shareCode }: { shareCode: string }) => {
    socket.leave(`bracket:${shareCode}`);
  });

  socket.on("BRACKET_SET_WINNER", async ({ bracketId, matchId, winnerSeed }: { bracketId: string; matchId: string; winnerSeed: number }) => {
    if (socket.data.user?.role !== "admin") return;
    try {
      const { advanceWinner: advWinner } = await import("./utils/bracketGenerator");
      const bracket = await Bracket.findById(bracketId);
      if (!bracket || bracket.status !== "active") return;

      const matches = bracket.matches as any[];
      const match = matches.find((m: any) => m.matchId === matchId);
      if (!match || match.participant1Seed === null || match.participant2Seed === null) return;

      match.winnerSeed = winnerSeed;
      match.status = "completed";
      const loserSeed = match.participant1Seed === winnerSeed ? match.participant2Seed : match.participant1Seed;
      advWinner(matches, matchId, winnerSeed, loserSeed, bracket.type as "single" | "double");

      // Check completion
      if (bracket.type === "single") {
        const wm = matches.filter((m: any) => m.bracket === "winners");
        const finalMatch = wm.reduce((a: any, b: any) => a.round > b.round ? a : b);
        if (finalMatch.winnerSeed !== null) {
          bracket.status = "completed";
          const champ = bracket.participants.find((p: any) => p.seed === finalMatch.winnerSeed);
          bracket.champion = champ?.name || null;
        }
      } else {
        const gf0 = matches.find((m: any) => m.matchId === "GF-M0");
        const gf1 = matches.find((m: any) => m.matchId === "GF-M1");
        if (gf0?.winnerSeed !== null) {
          if (gf0.winnerSeed === gf0.participant1Seed) {
            bracket.status = "completed";
            const champ = bracket.participants.find((p: any) => p.seed === gf0.winnerSeed);
            bracket.champion = champ?.name || null;
          } else if (gf1?.winnerSeed !== null) {
            bracket.status = "completed";
            const champ = bracket.participants.find((p: any) => p.seed === gf1.winnerSeed);
            bracket.champion = champ?.name || null;
          }
        }
      }

      bracket.markModified("matches");
      await bracket.save();
      io.to(`bracket:${bracket.shareCode}`).emit("BRACKET_UPDATE", bracket);
    } catch (e) {
      console.error("[Bracket Socket] Set winner error:", e);
    }
  });

  socket.on("BRACKET_UNDO_WINNER", async ({ bracketId, matchId }: { bracketId: string; matchId: string }) => {
    if (socket.data.user?.role !== "admin") return;
    try {
      const { undoWinner: undoW } = await import("./utils/bracketGenerator");
      const bracket = await Bracket.findById(bracketId);
      if (!bracket) return;

      undoW(bracket.matches as any[], matchId, bracket.type as "single" | "double");
      if (bracket.status === "completed") {
        bracket.status = "active";
        bracket.champion = null;
      }

      bracket.markModified("matches");
      await bracket.save();
      io.to(`bracket:${bracket.shareCode}`).emit("BRACKET_UPDATE", bracket);
    } catch (e) {
      console.error("[Bracket Socket] Undo error:", e);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Operator disconnected: ${socket.id}`);
  });
});

mongoose.connect(config.MONGO_URI).then(() => {
  console.log("[MongoDB] Database connected successfully");
}).catch(err => {
  console.error("[MongoDB] Connection failed:", err);
});

export default app;

if (!process.env.VERCEL) {
  // For local development
  httpServer.listen(config.PORT, () => {
    console.log(`[Server] Game Master Central Backend Online -> ${config.NODE_ENV} Mode || Port: ${config.PORT}`);
  });
}

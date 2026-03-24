import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { config } from "./config/env";
import { gameManager } from "./store/GameStore";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";

const app = express();
app.use(cors({ origin: config.FRONTEND_URL, methods: ["GET", "POST"] }));
app.use(express.json());
app.use("/api/auth", authRoutes);

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

  socket.on("DELETE_ROOM", (roomId: string) => {
    if (socket.data.user?.role !== "admin") return;
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
      setTimeout(() => {
        gameManager.endChallenge(roomId, challengeId);
        broadcastState();
      }, timeLimit * 1000);
    }
  });

  socket.on("END_CHALLENGE", ({ roomId, challengeId }) => {
    if (socket.data.user?.role !== "admin") return;
    gameManager.endChallenge(roomId, challengeId);
    broadcastState();
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

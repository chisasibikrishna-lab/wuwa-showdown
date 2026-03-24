import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { RoomRecord } from "../models/RoomRecord";
import { ChallengeRecord } from "../models/ChallengeRecord";

const router = Router();

// Middleware to extract user from JWT
function authMiddleware(req: Request, res: Response, next: Function) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(auth.slice(7), config.JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// GET /api/history/rooms - list rooms (admin: all, player: rooms they were in)
router.get("/rooms", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let rooms;
    if (user.role === "admin") {
      rooms = await RoomRecord.find().select("-__v").sort({ createdAt: -1 });
    } else {
      rooms = await RoomRecord.find({ "players.id": String(user.id) }).select("-__v").sort({ createdAt: -1 });
    }
    return res.json(rooms);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/history/rooms/:roomId - room detail with challenges
router.get("/rooms/:roomId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const room = await RoomRecord.findById(req.params.roomId).select("-__v");
    if (!room) return res.status(404).json({ error: "Room not found" });
    const challenges = await ChallengeRecord.find({ roomRecordId: room._id }).select("-__v").sort({ createdAt: 1 });
    return res.json({ room, challenges });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/history/rooms/:roomId - admin only
router.delete("/rooms/:roomId", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  try {
    const room = await RoomRecord.findByIdAndDelete(req.params.roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    await ChallengeRecord.deleteMany({ roomRecordId: req.params.roomId });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import {
  createBracket,
  listBrackets,
  getBracket,
  updateBracket,
  generateBracket,
  setMatchWinner,
  undoMatchWinner,
  resetBracket,
  deleteBracket,
  setMatchVenue,
} from "../controllers/bracketController";

const router = Router();

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

router.post("/", authMiddleware, createBracket);
router.get("/", authMiddleware, listBrackets);
router.get("/:shareCode", getBracket); // public access for shared links
router.put("/:id", authMiddleware, updateBracket);
router.post("/:id/generate", authMiddleware, generateBracket);
router.put("/:id/matches/:matchId/winner", authMiddleware, setMatchWinner);
router.put("/:id/matches/:matchId/undo", authMiddleware, undoMatchWinner);
router.put("/:id/matches/:matchId/venue", authMiddleware, setMatchVenue);
router.post("/:id/reset", authMiddleware, resetBracket);
router.delete("/:id", authMiddleware, deleteBracket);

export default router;

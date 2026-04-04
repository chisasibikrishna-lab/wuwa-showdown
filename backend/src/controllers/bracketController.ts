import { Request, Response } from "express";
import { Bracket } from "../models/Bracket";
import {
  generateSingleElimination,
  generateDoubleElimination,
  advanceWinner,
  undoWinner,
  generateShareCode,
  Participant,
} from "../utils/bracketGenerator";

// POST /api/brackets — create new bracket (draft)
export async function createBracket(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { name, type, participants, randomizeSeeding } = req.body;

    if (!name || !type) return res.status(400).json({ error: "Name and type required" });
    if (!["single", "double"].includes(type)) return res.status(400).json({ error: "Type must be single or double" });

    const parsedParticipants: Participant[] = (participants || [])
      .filter((p: string) => p.trim())
      .map((p: string, i: number) => ({ seed: i + 1, name: p.trim() }));

    if (parsedParticipants.length > 128) return res.status(400).json({ error: "Max 128 participants" });

    // Generate unique share code
    let shareCode = generateShareCode();
    while (await Bracket.findOne({ shareCode })) {
      shareCode = generateShareCode();
    }

    const bracket = await Bracket.create({
      name,
      type,
      status: "draft",
      creatorId: user.id,
      creatorName: user.name,
      shareCode,
      participants: parsedParticipants,
      randomizeSeeding: randomizeSeeding || false,
      matches: [],
    });

    return res.status(201).json(bracket);
  } catch (e) {
    console.error("[Bracket] Create error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

// GET /api/brackets — list brackets
export async function listBrackets(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    let brackets;
    if (user.role === "admin") {
      brackets = await Bracket.find().select("-__v").sort({ createdAt: -1 });
    } else {
      brackets = await Bracket.find({ creatorId: user.id }).select("-__v").sort({ createdAt: -1 });
    }
    return res.json(brackets);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}

// GET /api/brackets/:shareCode — get bracket by share code (public-ish)
export async function getBracket(req: Request, res: Response) {
  try {
    const bracket = await Bracket.findOne({ shareCode: req.params.shareCode }).select("-__v");
    if (!bracket) return res.status(404).json({ error: "Bracket not found" });
    return res.json(bracket);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}

// PUT /api/brackets/:id — update draft bracket
export async function updateBracket(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const bracket = await Bracket.findById(req.params.id);
    if (!bracket) return res.status(404).json({ error: "Bracket not found" });
    if (bracket.creatorId.toString() !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (bracket.status !== "draft") {
      return res.status(400).json({ error: "Can only edit draft brackets" });
    }

    const { name, type, participants, randomizeSeeding } = req.body;
    if (name) bracket.name = name;
    if (type && ["single", "double"].includes(type)) bracket.type = type;
    if (randomizeSeeding !== undefined) bracket.randomizeSeeding = randomizeSeeding;
    if (participants) {
      const parsed = participants
        .filter((p: string) => p.trim())
        .map((p: string, i: number) => ({ seed: i + 1, name: p.trim() }));
      if (parsed.length > 128) return res.status(400).json({ error: "Max 128 participants" });
      bracket.participants = parsed;
    }

    await bracket.save();
    return res.json(bracket);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}

// POST /api/brackets/:id/generate — generate matches and set active
export async function generateBracket(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const bracket = await Bracket.findById(req.params.id);
    if (!bracket) return res.status(404).json({ error: "Bracket not found" });
    if (bracket.creatorId.toString() !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (bracket.participants.length < 2) {
      return res.status(400).json({ error: "Need at least 2 participants" });
    }

    const participants: Participant[] = bracket.participants.map((p: any) => ({
      seed: p.seed,
      name: p.name,
    }));

    const matches = bracket.type === "double"
      ? generateDoubleElimination(participants, bracket.randomizeSeeding)
      : generateSingleElimination(participants, bracket.randomizeSeeding);

    bracket.matches = matches as any;
    bracket.status = "active";
    bracket.champion = null;
    await bracket.save();

    return res.json(bracket);
  } catch (e) {
    console.error("[Bracket] Generate error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

// PUT /api/brackets/:id/matches/:matchId/winner — set winner
export async function setMatchWinner(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const bracket = await Bracket.findById(req.params.id);
    if (!bracket) return res.status(404).json({ error: "Bracket not found" });
    if (bracket.creatorId.toString() !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (bracket.status !== "active" && bracket.status !== "completed") {
      return res.status(400).json({ error: "Bracket not active" });
    }

    const { winnerSeed, score1, score2 } = req.body;
    const matchId = String(req.params.matchId);
    const matches = bracket.matches as any[];
    const match = matches.find((m: any) => m.matchId === matchId);

    if (!match) return res.status(404).json({ error: "Match not found" });
    if (match.participant1Seed === null || match.participant2Seed === null) {
      return res.status(400).json({ error: "Match not ready — waiting for participants" });
    }
    if (winnerSeed !== match.participant1Seed && winnerSeed !== match.participant2Seed) {
      return res.status(400).json({ error: "Winner must be a participant in the match" });
    }

    // If changing an existing winner, safely cascade-clear the old winner downstream first
    if (match.winnerSeed !== null && match.winnerSeed !== winnerSeed) {
      undoWinner(matches, matchId, bracket.type as "single" | "double");
    }

    match.winnerSeed = winnerSeed;
    if (score1 !== undefined) match.score1 = Number(score1) || 0;
    if (score2 !== undefined) match.score2 = Number(score2) || 0;
    match.status = "completed";
    
    // Changing the winner re-activates the tournament if it was previously completed
    if (bracket.status === "completed") {
      bracket.status = "active";
      bracket.champion = null;
    }

    const loserSeed = match.participant1Seed === winnerSeed ? match.participant2Seed : match.participant1Seed;

    // Advance winner (and loser for double elim)
    advanceWinner(matches, matchId, winnerSeed, loserSeed, bracket.type as "single" | "double");

    // Check if tournament is complete
    if (bracket.type === "single") {
      const winnersMatches = matches.filter((m: any) => m.bracket === "winners");
      const finalMatch = winnersMatches.reduce((a: any, b: any) => a.round > b.round ? a : b);
      if (finalMatch.winnerSeed !== null) {
        bracket.status = "completed";
        const champ = bracket.participants.find((p: any) => p.seed === finalMatch.winnerSeed);
        bracket.champion = champ?.name || null;
      }
    } else {
      // Double elimination: check grand final
      const gf0 = matches.find((m: any) => m.matchId === "GF-M0");
      const gf1 = matches.find((m: any) => m.matchId === "GF-M1");
      if (gf0?.winnerSeed !== null) {
        // If winners bracket champ won GF, tournament over
        if (gf0.winnerSeed === gf0.participant1Seed) {
          bracket.status = "completed";
          const champ = bracket.participants.find((p: any) => p.seed === gf0.winnerSeed);
          bracket.champion = champ?.name || null;
        } else if (gf1?.winnerSeed !== null) {
          // Reset match completed
          bracket.status = "completed";
          const champ = bracket.participants.find((p: any) => p.seed === gf1.winnerSeed);
          bracket.champion = champ?.name || null;
        }
      }
    }

    bracket.markModified("matches");
    await bracket.save();

    return res.json(bracket);
  } catch (e) {
    console.error("[Bracket] Set winner error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

// PUT /api/brackets/:id/matches/:matchId/undo — undo winner
export async function undoMatchWinner(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const bracket = await Bracket.findById(req.params.id);
    if (!bracket) return res.status(404).json({ error: "Bracket not found" });
    if (bracket.creatorId.toString() !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const matchId = String(req.params.matchId);
    const matches = bracket.matches as any[];

    undoWinner(matches, matchId, bracket.type as "single" | "double");

    // Reset completed status if we undid something
    if (bracket.status === "completed") {
      bracket.status = "active";
      bracket.champion = null;
    }

    bracket.markModified("matches");
    await bracket.save();

    return res.json(bracket);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}

// POST /api/brackets/:id/reset — reset to draft
export async function resetBracket(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const bracket = await Bracket.findById(req.params.id);
    if (!bracket) return res.status(404).json({ error: "Bracket not found" });
    if (bracket.creatorId.toString() !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    bracket.status = "draft";
    bracket.matches = [] as any;
    bracket.champion = null;
    await bracket.save();

    return res.json(bracket);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}

// DELETE /api/brackets/:id
export async function deleteBracket(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const bracket = await Bracket.findById(req.params.id);
    if (!bracket) return res.status(404).json({ error: "Bracket not found" });
    if (bracket.creatorId.toString() !== user.id && user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    await bracket.deleteOne();
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}

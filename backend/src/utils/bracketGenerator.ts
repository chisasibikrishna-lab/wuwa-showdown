export interface Participant {
  seed: number;
  name: string;
}

export interface Match {
  matchId: string;
  round: number;
  position: number;
  bracket: "winners" | "losers" | "grand";
  participant1Seed: number | null;
  participant2Seed: number | null;
  winnerSeed: number | null;
  score1: number;
  score2: number;
  status: "pending" | "active" | "completed" | "bye";
}

function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Standard tournament seeding placement.
 * For a bracket of size N, seeds are placed so that
 * seed 1 faces seed N, seed 2 faces seed N-1, etc.
 * This ensures top seeds don't meet until later rounds.
 */
function standardSeedOrder(bracketSize: number): number[] {
  // Recursive approach: for each round, interleave seeds
  if (bracketSize === 1) return [1];
  const half = standardSeedOrder(bracketSize / 2);
  const result: number[] = [];
  for (const seed of half) {
    result.push(seed);
    result.push(bracketSize + 1 - seed);
  }
  return result;
}

function createMatch(
  matchId: string,
  round: number,
  position: number,
  bracket: Match["bracket"],
  p1: number | null,
  p2: number | null
): Match {
  const isBye = (p1 !== null && p2 === null) || (p1 === null && p2 !== null);
  return {
    matchId,
    round,
    position,
    bracket,
    participant1Seed: p1,
    participant2Seed: p2,
    winnerSeed: isBye ? (p1 ?? p2) : null,
    score1: 0,
    score2: 0,
    status: isBye ? "bye" : "pending",
  };
}

export function generateSingleElimination(participants: Participant[], randomize: boolean): Match[] {
  const count = participants.length;
  if (count < 2) return [];

  const bracketSize = nextPowerOf2(count);
  const totalRounds = Math.log2(bracketSize);
  const seedOrder = standardSeedOrder(bracketSize);

  // If randomize, shuffle participants before assigning seeds
  const ordered = randomize ? shuffle(participants) : [...participants];

  // Map: seed number -> participant (null means BYE)
  const seedMap = new Map<number, Participant | null>();
  for (let i = 0; i < bracketSize; i++) {
    seedMap.set(i + 1, i < ordered.length ? { ...ordered[i], seed: i + 1 } : null);
  }

  const matches: Match[] = [];

  // Generate round 0 (first round)
  const firstRoundMatchCount = bracketSize / 2;
  for (let pos = 0; pos < firstRoundMatchCount; pos++) {
    const seed1 = seedOrder[pos * 2];
    const seed2 = seedOrder[pos * 2 + 1];
    const p1 = seedMap.get(seed1) ? seed1 : null;
    const p2 = seedMap.get(seed2) ? seed2 : null;
    matches.push(createMatch(`W-R0-M${pos}`, 0, pos, "winners", p1, p2));
  }

  // Generate subsequent rounds (empty, will be filled as winners advance)
  for (let round = 1; round < totalRounds; round++) {
    const matchCount = bracketSize / Math.pow(2, round + 1);
    for (let pos = 0; pos < matchCount; pos++) {
      matches.push(createMatch(`W-R${round}-M${pos}`, round, pos, "winners", null, null));
    }
  }

  // Auto-advance byes in round 0
  advanceByes(matches, "winners", totalRounds);

  return matches;
}

export function generateDoubleElimination(participants: Participant[], randomize: boolean): Match[] {
  const count = participants.length;
  if (count < 2) return [];

  const bracketSize = nextPowerOf2(count);
  const winnersRounds = Math.log2(bracketSize);

  // Generate winners bracket (same as single elimination)
  const matches = generateSingleElimination(participants, randomize);

  // Generate losers bracket
  // Losers bracket has (winnersRounds - 1) * 2 rounds
  // Odd rounds receive drop-downs from winners bracket
  // Even rounds are internal losers bracket playoffs
  const losersRounds = (winnersRounds - 1) * 2;

  for (let round = 0; round < losersRounds; round++) {
    // Calculate match count for this losers round
    // Losers bracket halves every 2 rounds
    const fullSize = bracketSize / 2;
    const halvings = Math.floor((round + 1) / 2);
    const matchCount = Math.max(1, fullSize / Math.pow(2, halvings));

    for (let pos = 0; pos < matchCount; pos++) {
      matches.push(createMatch(`L-R${round}-M${pos}`, round, pos, "losers", null, null));
    }
  }

  // Grand final
  matches.push(createMatch("GF-M0", 0, 0, "grand", null, null));
  // Grand final reset (if losers bracket winner wins)
  matches.push(createMatch("GF-M1", 1, 0, "grand", null, null));

  return matches;
}

function advanceByes(matches: Match[], bracket: Match["bracket"], totalRounds: number) {
  const bracketMatches = matches.filter(m => m.bracket === bracket);
  const round0 = bracketMatches.filter(m => m.round === 0);

  for (const match of round0) {
    if (match.status === "bye" && match.winnerSeed !== null) {
      // Find the next round match and place the winner
      const nextRound = 1;
      const nextPos = Math.floor(match.position / 2);
      const nextMatch = bracketMatches.find(m => m.round === nextRound && m.position === nextPos);
      if (nextMatch) {
        const isTop = match.position % 2 === 0;
        if (isTop) {
          nextMatch.participant1Seed = match.winnerSeed;
        } else {
          nextMatch.participant2Seed = match.winnerSeed;
        }
        // Check if the next match now has a bye too
        if (
          (nextMatch.participant1Seed !== null && nextMatch.participant2Seed === null) ||
          (nextMatch.participant1Seed === null && nextMatch.participant2Seed !== null)
        ) {
          // Don't auto-bye here — only first round gets auto-byes
        }
      }
    }
  }
}

/**
 * Advance a winner to the next match in the bracket.
 * Returns the matchId of the next match that was updated, or null if it's the final.
 */
export function advanceWinner(
  matches: Match[],
  matchId: string,
  winnerSeed: number,
  loserSeed: number | null,
  bracketType: "single" | "double"
): { updatedMatchIds: string[] } {
  const match = matches.find(m => m.matchId === matchId);
  if (!match) return { updatedMatchIds: [] };

  const updatedMatchIds: string[] = [];

  if (match.bracket === "winners") {
    // Advance winner in winners bracket
    const nextRound = match.round + 1;
    const nextPos = Math.floor(match.position / 2);
    const winnersMatches = matches.filter(m => m.bracket === "winners");
    const maxRound = Math.max(...winnersMatches.map(m => m.round));

    if (nextRound <= maxRound) {
      const nextMatch = winnersMatches.find(m => m.round === nextRound && m.position === nextPos);
      if (nextMatch) {
        const isTop = match.position % 2 === 0;
        if (isTop) nextMatch.participant1Seed = winnerSeed;
        else nextMatch.participant2Seed = winnerSeed;
        updatedMatchIds.push(nextMatch.matchId);
      }
    } else if (bracketType === "double") {
      // Winners bracket champion goes to grand final
      const grandFinal = matches.find(m => m.matchId === "GF-M0");
      if (grandFinal) {
        grandFinal.participant1Seed = winnerSeed;
        updatedMatchIds.push(grandFinal.matchId);
      }
    }

    // For double elimination, loser drops to losers bracket
    if (bracketType === "double" && loserSeed !== null) {
      const losersMatches = matches.filter(m => m.bracket === "losers");
      // Map winners round to losers bracket entry point
      // Winners round 0 losers go to losers round 0
      // Winners round 1 losers go to losers round 2
      // Winners round N losers go to losers round 2*N - (N > 0 ? 0 : 0)
      const losersRound = match.round === 0 ? 0 : match.round * 2 - 1;
      const losersRoundMatches = losersMatches.filter(m => m.round === losersRound);

      if (losersRoundMatches.length > 0) {
        // Place loser in appropriate position
        const targetPos = match.position % losersRoundMatches.length;
        const targetMatch = losersRoundMatches[targetPos] || losersRoundMatches[0];
        if (targetMatch) {
          if (targetMatch.participant1Seed === null) {
            targetMatch.participant1Seed = loserSeed;
          } else {
            targetMatch.participant2Seed = loserSeed;
          }
          updatedMatchIds.push(targetMatch.matchId);
        }
      }
    }
  } else if (match.bracket === "losers") {
    // Advance in losers bracket
    const losersMatches = matches.filter(m => m.bracket === "losers");
    const maxLosersRound = Math.max(...losersMatches.map(m => m.round));

    if (match.round < maxLosersRound) {
      const nextRound = match.round + 1;
      const nextRoundMatches = losersMatches.filter(m => m.round === nextRound);
      const nextPos = Math.floor(match.position / 2);
      const actualPos = Math.min(nextPos, nextRoundMatches.length - 1);
      const nextMatch = nextRoundMatches[actualPos];
      if (nextMatch) {
        if (nextMatch.participant1Seed === null) {
          nextMatch.participant1Seed = winnerSeed;
        } else {
          nextMatch.participant2Seed = winnerSeed;
        }
        updatedMatchIds.push(nextMatch.matchId);
      }
    } else {
      // Losers bracket champion goes to grand final
      const grandFinal = matches.find(m => m.matchId === "GF-M0");
      if (grandFinal) {
        grandFinal.participant2Seed = winnerSeed;
        updatedMatchIds.push(grandFinal.matchId);
      }
    }
  } else if (match.bracket === "grand") {
    if (match.matchId === "GF-M0") {
      // If losers bracket winner wins, we need a reset match
      const winnersChamp = match.participant1Seed;
      if (winnerSeed !== winnersChamp) {
        // Losers bracket winner won — need reset
        const resetMatch = matches.find(m => m.matchId === "GF-M1");
        if (resetMatch) {
          resetMatch.participant1Seed = match.participant1Seed;
          resetMatch.participant2Seed = match.participant2Seed;
          resetMatch.status = "pending";
          updatedMatchIds.push(resetMatch.matchId);
        }
      }
    }
    // GF-M1 winner is the champion — no more advancement
  }

  return { updatedMatchIds };
}

/**
 * Undo a winner selection and cascade-clear all downstream matches.
 */
export function undoWinner(matches: Match[], matchId: string, bracketType: "single" | "double"): string[] {
  const match = matches.find(m => m.matchId === matchId);
  if (!match || match.winnerSeed === null) return [];

  const clearedMatchIds: string[] = [matchId];
  const previousWinner = match.winnerSeed;
  match.winnerSeed = null;
  match.status = "active";

  // Find and clear downstream matches that contain the previous winner
  const queue = [{ seed: previousWinner, fromMatch: match }];

  while (queue.length > 0) {
    const { seed, fromMatch } = queue.shift()!;

    // Find next match where this seed was placed
    const downstream = findDownstreamMatch(matches, fromMatch, bracketType);
    if (!downstream) continue;

    if (downstream.participant1Seed === seed) {
      downstream.participant1Seed = null;
    } else if (downstream.participant2Seed === seed) {
      downstream.participant2Seed = null;
    }

    if (downstream.winnerSeed !== null) {
      const nextWinner = downstream.winnerSeed;
      downstream.winnerSeed = null;
      downstream.status = downstream.participant1Seed !== null || downstream.participant2Seed !== null ? "active" : "pending";
      clearedMatchIds.push(downstream.matchId);
      queue.push({ seed: nextWinner, fromMatch: downstream });
    } else {
      downstream.status = downstream.participant1Seed !== null || downstream.participant2Seed !== null ? "pending" : "pending";
      clearedMatchIds.push(downstream.matchId);
    }
  }

  // For double elimination, also clear the loser path if applicable
  if (bracketType === "double" && match.bracket === "winners") {
    const loserSeed = match.participant1Seed === previousWinner ? match.participant2Seed : match.participant1Seed;
    if (loserSeed !== null) {
      // Find where the loser was placed in losers bracket and clear from there
      const losersMatches = matches.filter(m => m.bracket === "losers");
      for (const lm of losersMatches) {
        if (lm.participant1Seed === loserSeed || lm.participant2Seed === loserSeed) {
          if (lm.participant1Seed === loserSeed) lm.participant1Seed = null;
          if (lm.participant2Seed === loserSeed) lm.participant2Seed = null;
          if (lm.winnerSeed !== null) {
            queue.push({ seed: lm.winnerSeed, fromMatch: lm });
            lm.winnerSeed = null;
          }
          lm.status = "pending";
          clearedMatchIds.push(lm.matchId);
        }
      }
    }
  }

  return [...new Set(clearedMatchIds)];
}

function findDownstreamMatch(matches: Match[], fromMatch: Match, bracketType: "single" | "double"): Match | null {
  if (fromMatch.bracket === "winners") {
    const winnersMatches = matches.filter(m => m.bracket === "winners");
    const maxRound = Math.max(...winnersMatches.map(m => m.round));
    const nextRound = fromMatch.round + 1;
    const nextPos = Math.floor(fromMatch.position / 2);

    if (nextRound <= maxRound) {
      return winnersMatches.find(m => m.round === nextRound && m.position === nextPos) || null;
    } else if (bracketType === "double") {
      return matches.find(m => m.matchId === "GF-M0") || null;
    }
  } else if (fromMatch.bracket === "losers") {
    const losersMatches = matches.filter(m => m.bracket === "losers");
    const maxLosersRound = Math.max(...losersMatches.map(m => m.round));

    if (fromMatch.round < maxLosersRound) {
      const nextRound = fromMatch.round + 1;
      const nextRoundMatches = losersMatches.filter(m => m.round === nextRound);
      const nextPos = Math.min(Math.floor(fromMatch.position / 2), nextRoundMatches.length - 1);
      return nextRoundMatches[nextPos] || null;
    } else {
      return matches.find(m => m.matchId === "GF-M0") || null;
    }
  } else if (fromMatch.bracket === "grand" && fromMatch.matchId === "GF-M0") {
    return matches.find(m => m.matchId === "GF-M1") || null;
  }

  return null;
}

export function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

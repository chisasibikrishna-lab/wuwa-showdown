"use client";
import React, { useEffect, useState, useRef } from "react";
import { BracketMatch } from "@/context/BracketContext";

interface ConnectorLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive: boolean;
}

interface BracketConnectorsProps {
  matches: BracketMatch[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  bracketFilter: "winners" | "losers";
}

export default function BracketConnectors({ matches, containerRef, bracketFilter }: BracketConnectorsProps) {
  const [lines, setLines] = useState<ConnectorLine[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateLines = () => {
      const containerRect = container.getBoundingClientRect();
      const newLines: ConnectorLine[] = [];
      const filtered = matches.filter(m => m.bracket === bracketFilter);

      // Group by round
      const rounds = new Map<number, BracketMatch[]>();
      for (const m of filtered) {
        if (!rounds.has(m.round)) rounds.set(m.round, []);
        rounds.get(m.round)!.push(m);
      }

      const roundNums = [...rounds.keys()].sort((a, b) => a - b);

      for (let i = 0; i < roundNums.length - 1; i++) {
        const currentRound = roundNums[i];
        const nextRound = roundNums[i + 1];
        const currentMatches = rounds.get(currentRound)!;
        const nextMatches = rounds.get(nextRound)!;

        for (const match of currentMatches) {
          const matchEl = container.querySelector(`[data-match-id="${match.matchId}"]`);
          if (!matchEl) continue;

          // Find the next round match this feeds into
          const nextPos = Math.floor(match.position / 2);
          const nextMatch = nextMatches.find(m => m.position === nextPos) || nextMatches[Math.min(nextPos, nextMatches.length - 1)];
          if (!nextMatch) continue;

          const nextEl = container.querySelector(`[data-match-id="${nextMatch.matchId}"]`);
          if (!nextEl) continue;

          const matchRect = matchEl.getBoundingClientRect();
          const nextRect = nextEl.getBoundingClientRect();

          const x1 = matchRect.right - containerRect.left;
          const y1 = matchRect.top + matchRect.height / 2 - containerRect.top;
          const x2 = nextRect.left - containerRect.left;
          const y2 = nextRect.top + nextRect.height / 2 - containerRect.top;

          const hasWinner = match.winnerSeed !== null;
          newLines.push({ x1, y1, x2, y2, isActive: hasWinner });
        }
      }

      setLines(newLines);
    };

    // Delay to allow DOM to render
    const timer = setTimeout(calculateLines, 100);

    const observer = new ResizeObserver(calculateLines);
    observer.observe(container);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [matches, containerRef, bracketFilter]);

  if (lines.length === 0) return null;

  const maxX = Math.max(...lines.map(l => Math.max(l.x1, l.x2)), 0) + 20;
  const maxY = Math.max(...lines.map(l => Math.max(l.y1, l.y2)), 0) + 20;

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 pointer-events-none z-0"
      width={maxX}
      height={maxY}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="glow">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#ffcc00" floodOpacity="0.3" />
        </filter>
      </defs>
      {lines.map((line, i) => {
        const midX = (line.x1 + line.x2) / 2;
        const path = `M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2} ${line.y2}`;
        return (
          <path
            key={i}
            d={path}
            fill="none"
            stroke={line.isActive ? "#ffcc00" : "rgba(255,255,255,0.18)"}
            strokeWidth={line.isActive ? 2 : 1.5}
            filter={line.isActive ? "url(#glow)" : undefined}
            className="transition-all duration-500"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

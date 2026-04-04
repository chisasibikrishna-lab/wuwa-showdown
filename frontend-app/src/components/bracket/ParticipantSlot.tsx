"use client";
import React from "react";
import { BracketParticipant, useBracket } from "@/context/BracketContext";
import { useAuth } from "@/context/AuthContext";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface ParticipantSlotProps {
  participant: BracketParticipant | null;
  isWinner: boolean;
  isLoser: boolean;
  isBye: boolean;
  isClickable: boolean;
  onClick?: () => void;
  seed: number | null;
  score?: number;
  isOverlay?: boolean;
}

export default function ParticipantSlot({
  participant, isWinner, isLoser, isBye, isClickable, onClick, seed, score, isOverlay
}: ParticipantSlotProps) {
  const { activeBracket } = useBracket();
  const { user } = useAuth();
  
  const isDraft = activeBracket?.status === "draft";
  const isOwner = user && activeBracket && (user.id === activeBracket.creatorId || user.role === "admin");
  const canDragDrop = isDraft && isOwner && seed !== null && !isBye && !isOverlay;

  const dragId = `seed-${seed}`;

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: dragId,
    disabled: !canDragDrop,
  });

  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
    id: dragId,
    disabled: !canDragDrop,
  });

  const setNodeRef = (element: HTMLElement | null) => {
    setDroppableRef(element);
    setDraggableRef(element);
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : "auto",
  } : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...(canDragDrop ? { ...attributes, ...listeners } : {})}
      onClick={isClickable && !canDragDrop ? onClick : undefined}
      disabled={!isClickable && !canDragDrop}
      className={`
        w-full flex items-center gap-2 px-3 py-2 text-left transition-all duration-200
        ${canDragDrop 
            ? "cursor-grab active:cursor-grabbing hover:bg-white/[0.12] active:bg-white/[0.15]" 
            : isClickable ? "cursor-pointer hover:bg-white/[0.08]" : "cursor-default"
        }
        ${isDragging && !isOverlay ? "opacity-30 scale-105 shadow-primary-md ring-2 ring-primary z-50 bg-[#0a0a0c]/80 backdrop-blur-sm" : ""}
        ${isOver && !isOverlay ? "bg-primary/20 ring-2 ring-primary/60 scale-105 shadow-lg" : ""}
        ${isWinner
          ? "bg-primary/15 text-primary font-semibold"
          : isLoser
            ? "opacity-40 text-zinc-500"
            : isBye
              ? "text-zinc-600 italic"
              : participant ? "text-zinc-100" : "text-zinc-500"
        }
      `}
    >
      {/* Seed badge */}
      {seed !== null && !isBye && (
        <span className={`
          text-[10.5px] font-bold w-5 h-5 rounded flex items-center justify-center shrink-0
          ${isWinner ? "bg-primary/20 text-primary" : "bg-zinc-700/50 text-zinc-300 font-mono"}
        `}>
          {seed}
        </span>
      )}

      {/* Name */}
      <span className="text-sm font-medium truncate flex-1">
        {isBye ? "BYE" : participant?.name || "TBD"}
      </span>

      {/* Score badge */}
      {score !== undefined && !isBye && (
        <span className={`
          text-xs font-bold px-1.5 py-0.5 rounded min-w-[22px] text-center shrink-0
          ${isWinner
            ? "bg-primary/20 text-primary"
            : "bg-zinc-800 text-zinc-400"
          }
        `}>
          {score}
        </span>
      )}

      {/* Winner dot */}
      {isWinner && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-primary-xs shrink-0" />
      )}
    </button>
  );
}

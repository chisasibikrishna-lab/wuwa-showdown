"use client";
import React, { useEffect, useState, use, useMemo } from "react";
import { useBracket } from "@/context/BracketContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import BracketVisualization from "@/components/bracket/BracketVisualization";
import ConfirmModal from "@/components/ConfirmModal";
import {
  ArrowLeft, Share2, RotateCcw, Trophy, Users, Pencil,
  Check, X, Swords, Undo, Redo, UserPlus, Trash2
} from "lucide-react";
import Link from "next/link";
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';
import { generateSingleElimination, generateDoubleElimination } from "@/utils/bracketPreview";
import ParticipantSlot from "@/components/bracket/ParticipantSlot";

export default function BracketViewPage({ params }: { params: Promise<{ shareCode: string }> }) {
  const { shareCode } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const {
    activeBracket, fetchBracket, setMatchWinner, undoMatchWinner,
    resetBracket, generateBracket, updateBracket, joinBracketRoom,
    leaveBracketRoom, setActiveBracket,
  } = useBracket();

  const [loading, setLoading] = useState(true);
  const [showCopied, setShowCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [addPlayerModalOpen, setAddPlayerModalOpen] = useState(false);
  const [deletePlayerModalOpen, setDeletePlayerModalOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const [activeDragSeed, setActiveDragSeed] = useState<number | null>(null);

  type BracketAction = { type: "SELECT" | "UNSELECT", matchId: string, seed: number };
  const [undoStack, setUndoStack] = useState<BracketAction[]>([]);
  const [redoStack, setRedoStack] = useState<BracketAction[]>([]);

  const pushAction = (action: BracketAction) => {
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]);
  };

  useEffect(() => {
    fetchBracket(shareCode).then(() => setLoading(false));
    joinBracketRoom(shareCode);
    return () => {
      leaveBracketRoom(shareCode);
      setActiveBracket(null);
    };
  }, [shareCode]);

  const bracket = activeBracket;
  const isOwner = user && bracket && (user.id === bracket.creatorId || user.role === "admin");

  const previewMatches = useMemo(() => {
    if (!bracket || bracket.status !== "draft") return bracket?.matches || [];
    const participants = bracket.participants.map((p: any) => ({ seed: p.seed, name: p.name }));
    if (bracket.type === "single") {
      return generateSingleElimination(participants, bracket.randomizeSeeding);
    } else {
      return generateDoubleElimination(participants, bracket.randomizeSeeding);
    }
  }, [bracket]);

  const previewBracket = bracket ? { ...bracket, matches: previewMatches } : null;

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/bracket/${shareCode}`);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleSelectWinner = async (matchId: string, winnerSeed: number, score1?: number, score2?: number) => {
    if (!bracket) return;
    await setMatchWinner(bracket._id, matchId, winnerSeed, score1, score2);
    pushAction({ type: "SELECT", matchId, seed: winnerSeed });
  };

  const handleUndoWinner = async (matchId: string) => {
    if (!bracket) return;
    const match = bracket.matches.find((m: any) => m.matchId === matchId);
    if (match && match.winnerSeed !== null) {
      pushAction({ type: "UNSELECT", matchId, seed: match.winnerSeed });
    }
    await undoMatchWinner(bracket._id, matchId);
  };

  const triggerToolbarUndo = async () => {
    if (!bracket) return;
    const lastAction = undoStack[undoStack.length - 1];
    if (!lastAction) return;

    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, lastAction]);

    if (lastAction.type === "SELECT") {
      await undoMatchWinner(bracket._id, lastAction.matchId);
    } else {
      await setMatchWinner(bracket._id, lastAction.matchId, lastAction.seed);
    }
  };

  const triggerToolbarRedo = async () => {
    if (!bracket) return;
    const nextAction = redoStack[redoStack.length - 1];
    if (!nextAction) return;

    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, nextAction]);

    if (nextAction.type === "SELECT") {
      await setMatchWinner(bracket._id, nextAction.matchId, nextAction.seed);
    } else {
      await undoMatchWinner(bracket._id, nextAction.matchId);
    }
  };

  const confirmReset = () => {
    setResetModalOpen(true);
  };

  const handleExecuteReset = async () => {
    if (!bracket) return;
    await resetBracket(bracket._id);
    setUndoStack([]);
    setRedoStack([]);
  };

  const handleQuickAddClick = () => {
    if (!newPlayerName.trim() || !bracket) return;
    if (bracket.status === "active") {
      setAddPlayerModalOpen(true);
    } else {
      handleExecuteAddPlayer();
    }
  };

  const handleExecuteAddPlayer = async () => {
    if (!newPlayerName.trim() || !bracket) return;
    setIsAddingPlayer(true);
    try {
      const currentParticipants = bracket.participants.map((p: any) => p.name);
      currentParticipants.push(newPlayerName.trim());

      if (bracket.status === "active") {
        await resetBracket(bracket._id);
        await updateBracket(bracket._id, { participants: currentParticipants });
        await generateBracket(bracket._id);
        setUndoStack([]);
        setRedoStack([]);
      } else {
        await updateBracket(bracket._id, { participants: currentParticipants });
      }
      setNewPlayerName("");
    } finally {
      setIsAddingPlayer(false);
    }
  };

  const confirmDeleteParticipant = (name: string) => {
    setPlayerToDelete(name);
    if (bracket.status === "active") {
      setDeletePlayerModalOpen(true);
    } else {
      handleExecuteDeletePlayer(name);
    }
  };

  const handleExecuteDeletePlayer = async (nameOverride?: string) => {
    const targetName = typeof nameOverride === "string" ? nameOverride : playerToDelete;
    if (!targetName || !bracket) return;
    setIsAddingPlayer(true);
    try {
      const newParticipants = bracket.participants.map((p: any) => p.name).filter((n: string) => n !== targetName);
      if (bracket.status === "active") {
        await resetBracket(bracket._id);
        await updateBracket(bracket._id, { participants: newParticipants });
        await generateBracket(bracket._id);
        setUndoStack([]);
        setRedoStack([]);
      } else {
        await updateBracket(bracket._id, { participants: newParticipants });
      }
    } finally {
      setIsAddingPlayer(false);
      setDeletePlayerModalOpen(false);
      setPlayerToDelete("");
    }
  };

  const handleRegenerate = async () => {
    if (!bracket) return;
    await generateBracket(bracket._id);
  };

  const startEditing = () => {
    if (!bracket) return;
    setEditName(bracket.name);
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!bracket) return;
    await updateBracket(bracket._id, { name: editName });
    setEditing(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const seed = parseInt(String(event.active.id).replace("seed-", ""));
    if (!isNaN(seed)) setActiveDragSeed(seed);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragSeed(null);
    const { active, over } = event;
    if (!over || active.id === over.id || !bracket || bracket.status !== "draft" || !isOwner) return;

    const activeSeed = parseInt(String(active.id).replace("seed-", ""));
    const overSeed = parseInt(String(over.id).replace("seed-", ""));

    if (isNaN(activeSeed) || isNaN(overSeed)) return;

    const newParticipants = [...bracket.participants];
    const activeIndex = newParticipants.findIndex((p: any) => p.seed === activeSeed);
    const overIndex = newParticipants.findIndex((p: any) => p.seed === overSeed);

    if (activeIndex === -1 || overIndex === -1) return;

    const tempName = newParticipants[activeIndex].name;
    newParticipants[activeIndex].name = newParticipants[overIndex].name;
    newParticipants[overIndex].name = tempName;

    updateBracket(bracket._id, { participants: newParticipants.map((p: any) => p.name) });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ffcc00]/30 border-t-[#ffcc00] rounded-full animate-spin" />
      </div>
    );
  }

  if (!bracket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-white">Bracket not found</h2>
        <Link href="/bracket" className="text-[#ffcc00] hover:underline text-sm">
          Back to brackets
        </Link>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
    <div className="min-h-screen pt-20 px-4 sm:px-6 pb-12">
      {/* Top bar */}
      <div className="max-w-[1400px] mx-auto">
        <Link
          href="/bracket"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> All brackets
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-b border-[#ffcc00]/40 text-white focus:outline-none"
                />
                <button onClick={saveEdit} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10">
                  <Check size={18} />
                </button>
                <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg text-zinc-400 hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                {bracket.name}
                {isOwner && bracket.status === "draft" && (
                  <button onClick={startEditing} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                    <Pencil size={16} />
                  </button>
                )}
              </h1>
            )}

            {/* Meta badges */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`
                px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider
                ${bracket.status === "active"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : bracket.status === "completed"
                    ? "bg-[#ffcc00]/20 text-[#ffcc00] border border-[#ffcc00]/30"
                    : "bg-zinc-700 text-zinc-300"
                }
              `}>
                {bracket.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {bracket.type === "single" ? "Single Elim" : "Double Elim"}
              </span>
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Users size={12} /> {bracket.participants.length} players
              </span>
              <code className="text-xs text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded font-mono">
                {bracket.shareCode}
              </code>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {isOwner && (
              <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden focus-within:border-[#ffcc00]/40 transition-colors">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Quick add player..."
                  className="bg-transparent text-sm text-white px-3 py-2 w-36 focus:outline-none placeholder-zinc-600"
                  onKeyDown={(e) => e.key === "Enter" && handleQuickAddClick()}
                />
                <button
                  onClick={handleQuickAddClick}
                  disabled={!newPlayerName.trim() || isAddingPlayer}
                  className="p-2 text-zinc-400 hover:text-[#ffcc00] hover:bg-white/[0.05] transition-colors disabled:opacity-50"
                  title="Add player"
                >
                  <UserPlus size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-white/[0.05] border border-white/[0.08]
                         text-zinc-300 hover:bg-white/[0.08] transition-all"
              >
                <Share2 size={14} />
                {showCopied ? "Copied!" : "Share"}
              </button>

              {isOwner && bracket.status === "draft" && (
                <button
                  onClick={handleRegenerate}
                  disabled={bracket.participants.length < 2}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-[#ffcc00] text-black font-semibold
                           hover:bg-[#ffd633] transition-all disabled:opacity-40 disabled:cursor-not-allowed
                           shadow-[0_0_20px_rgba(255,204,0,0.2)]"
                >
                  <Swords size={14} /> Generate
                </button>
              )}

              {/* Reset was moved to bottom floating toolbar for active matches */}
            </div>
          </div>
        </div>

        {/* Champion Banner */}
        {bracket.champion && (
          <div className="mb-6 bg-gradient-to-r from-[#ffcc00]/10 via-[#ffcc00]/5 to-transparent
                          border border-[#ffcc00]/20 rounded-2xl px-6 py-4 flex items-center gap-4
                          shadow-[0_0_40px_rgba(255,204,0,0.08)]">
            <div className="w-10 h-10 rounded-xl bg-[#ffcc00]/20 flex items-center justify-center">
              <Trophy size={20} className="text-[#ffcc00]" />
            </div>
            <div>
              <div className="text-xs text-[#ffcc00]/60 uppercase tracking-widest font-semibold">Champion</div>
              <div className="text-xl font-bold text-[#ffcc00]">{bracket.champion}</div>
            </div>
          </div>
        )}

        {/* Participant Manager UI */}
        <div className="mb-6 bg-[#0a0a0c]/40 backdrop-blur-xl border border-white/[0.05] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Users size={16} className="text-[#ffcc00]" />
              Roster ({bracket.participants.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {bracket.participants.map((p: any) => (
              <div
                key={p.seed}
                className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2
                           hover:bg-white/[0.06] transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-zinc-500 bg-black/40 px-1.5 rounded">{p.seed}</span>
                  <span className="text-sm text-zinc-300 truncate font-medium">{p.name}</span>
                </div>
                {isOwner && (
                  <button
                    onClick={() => confirmDeleteParticipant(p.name)}
                    disabled={isAddingPlayer}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all disabled:opacity-0"
                    title="Remove player"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            {bracket.participants.length === 0 && (
              <div className="col-span-full py-4 text-center text-zinc-500 text-sm">
                No players added yet. Use the Quick Add box above.
              </div>
            )}
          </div>
        </div>

        {/* Bracket Visualization */}
        <div className="bg-[#0a0a0c]/40 backdrop-blur border border-white/[0.05] rounded-2xl p-4 sm:p-6 mb-24">
          {previewBracket && (
            <BracketVisualization
              bracket={previewBracket}
              isAdmin={!!isOwner}
              onSelectWinner={handleSelectWinner}
              onUndoWinner={handleUndoWinner}
            />
          )}
        </div>
      </div>

      {/* Floating Action Toolbar */}
      {isOwner && bracket.status === "active" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 
                        bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.1] rounded-2xl shadow-2xl">

          <button
            onClick={triggerToolbarUndo}
            disabled={undoStack.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                       disabled:opacity-30 disabled:cursor-not-allowed
                       text-zinc-300 hover:bg-white/[0.06] hover:text-white"
            title="Undo"
          >
            <Undo size={16} /> Undo
          </button>

          <div className="w-[1px] h-6 bg-white/[0.1]" />

          <button
            onClick={triggerToolbarRedo}
            disabled={redoStack.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                       disabled:opacity-30 disabled:cursor-not-allowed
                       text-zinc-300 hover:bg-white/[0.06] hover:text-white"
            title="Redo"
          >
            <Redo size={16} /> Redo
          </button>

          <div className="w-[1px] h-6 bg-white/[0.1] mx-2" />

          <button
            onClick={confirmReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                       text-[#ffcc00] hover:bg-[#ffcc00]/10"
            title="Edit Bracket Matchups"
          >
            <Pencil size={16} /> Edit
          </button>
        </div>
      )}
      {/* Modals */}
      <ConfirmModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={handleExecuteReset}
        title="Edit Matchups?"
        message="Entering Edit Mode will return this active tournament to the Draft phase. All currently recorded match results will be cleared so you can safely alter participants or Drag and Drop new matchups. Proceed?"
        confirmText="Enter Edit Mode"
        variant="danger"
      />

      <ConfirmModal
        isOpen={addPlayerModalOpen}
        onClose={() => setAddPlayerModalOpen(false)}
        onConfirm={handleExecuteAddPlayer}
        title="Regenerate Active Bracket?"
        message="Adding a player to an active bracket destroys the current structural tree mathematics. The tournament will be completely regenerated and ALL current match results will be permanently lost. Are you sure you want to proceed?"
        confirmText="Regenerate"
        variant="danger"
      />

      <ConfirmModal
        isOpen={deletePlayerModalOpen}
        onClose={() => { setDeletePlayerModalOpen(false); setPlayerToDelete(""); }}
        onConfirm={handleExecuteDeletePlayer}
        title="Regenerate Active Bracket?"
        message={`Removing ${playerToDelete} from an active bracket requires rebuilding the tournament structure from scratch. ALL match progress will be permanently lost. Proceed?`}
        confirmText="Remove & Regenerate"
        variant="danger"
      />
      <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeDragSeed && bracket ? (
          <div className="w-52 bg-[#0a0a0c]/90 border border-[#ffcc00]/50 rounded-xl shadow-[0_0_20px_rgba(255,204,0,0.3)] overflow-hidden scale-105 pointer-events-none origin-top-left">
             <ParticipantSlot
                participant={bracket.participants.find((p: any) => p.seed === activeDragSeed) || null}
                seed={activeDragSeed}
                isWinner={false}
                isLoser={false}
                isBye={false}
                isClickable={false}
                isOverlay={true}
             />
          </div>
        ) : null}
      </DragOverlay>
    </div>
    </DndContext>
  );
}

"use client";
import React, { useEffect } from "react";
import { useBracket, BracketData } from "@/context/BracketContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trophy, Users, Clock, Trash2, Share2 } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { useState } from "react";

function StatusBadge({ status }: { status: BracketData["status"] }) {
  const colors = {
    draft: "bg-zinc-700 text-zinc-300",
    active: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    completed: "bg-primary/20 text-primary border border-primary/30",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${colors[status]}`}>
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: BracketData["type"] }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
      {type === "single" ? "Single Elim" : "Double Elim"}
    </span>
  );
}

function BracketCard({ bracket, onDelete }: { bracket: BracketData; onDelete: (id: string) => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const isOwner = user?.id === bracket.creatorId || user?.role === "admin";
  const date = new Date(bracket.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div
      onClick={() => router.push(`/bracket/${bracket.shareCode}`)}
      className="group relative bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl cursor-pointer overflow-hidden
                 hover:bg-[#0a0a0c]/90 hover:border-white/[0.15] transition-all duration-300
                 hover:shadow-primary-xl flex flex-col"
    >
      {/* Visual Image Banner */}
      <div className="relative h-24 w-full bg-[#111113] border-b border-white/[0.06] overflow-hidden shrink-0">
        <img 
          src={`https://api.dicebear.com/7.x/shapes/svg?seed=${bracket.shareCode}&backgroundColor=111113`} 
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 mix-blend-screen" 
          alt="Bracket theme" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/90 via-[#0a0a0c]/20 to-transparent" />
        <div className="absolute top-3 right-3 shadow-lg">
          <StatusBadge status={bracket.status} />
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-white font-semibold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors" title={bracket.name}>
            {bracket.name}
          </h3>
          <p className="text-zinc-500 text-sm mt-1.5">by {bracket.creatorName} &middot; {date}</p>
        </div>

      {/* Info Row */}
      <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-zinc-500" />
          <span>{bracket.participants.length} players</span>
        </div>
        <TypeBadge type={bracket.type} />
      </div>

      {/* Champion */}
      {bracket.champion && (
        <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-2 mb-4">
          <Trophy size={14} className="text-primary" />
          <span className="text-primary text-sm font-medium">{bracket.champion}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-auto">
        <code className="text-xs text-zinc-500 bg-white/[0.04] px-2 py-1 rounded-md font-mono">
          {bracket.shareCode}
        </code>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(`${window.location.origin}/bracket/${bracket.shareCode}`);
            }}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
            title="Copy share link"
          >
            <Share2 size={14} />
          </button>
          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(bracket._id);
              }}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Delete bracket"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default function BracketListPage() {
  const { brackets, loadingBrackets, fetchBrackets, deleteBracket } = useBracket();
  const { user } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [bracketToDelete, setBracketToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchBrackets();
  }, [fetchBrackets]);

  const confirmDelete = (id: string) => {
    setBracketToDelete(id);
    setModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (bracketToDelete) {
      await deleteBracket(bracketToDelete);
      setBracketToDelete(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tournament Brackets</h1>
          <p className="text-zinc-500 mt-1">Create and manage elimination brackets</p>
        </div>
        {user && (
          <Link
            href="/bracket/create"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-semibold text-sm
                       hover:bg-primary-light transition-all shadow-primary-md
                       hover:shadow-primary-lg"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Bracket
          </Link>
        )}
      </div>

      {/* Loading */}
      {loadingBrackets && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loadingBrackets && brackets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0a0a0c]/60 backdrop-blur-xl border border-white/[0.06] flex items-center justify-center mb-4">
            <Trophy size={28} className="text-zinc-600" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">No brackets yet</h3>
          <p className="text-zinc-500 text-sm mb-6 max-w-xs">
            Create your first tournament bracket to get started
          </p>
          {user && (
            <Link
              href="/bracket/create"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-semibold text-sm
                         hover:bg-primary-light transition-all"
            >
              <Plus size={16} strokeWidth={2.5} />
              Create Bracket
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!loadingBrackets && brackets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brackets.map((bracket) => (
            <BracketCard key={bracket._id} bracket={bracket} onDelete={confirmDelete} />
          ))}
        </div>
      )}

      {/* Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setBracketToDelete(null); }}
        onConfirm={handleExecuteDelete}
        title="Delete Bracket"
        message="Are you sure you want to delete this tournament bracket? All match data, records, and history will be permanently destroyed."
        confirmText="Delete Bracket"
        variant="danger"
      />
    </div>
  );
}

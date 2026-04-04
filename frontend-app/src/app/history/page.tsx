"use client";
import React, { useEffect, useState } from "react";
import TopNavbar from "@/components/TopNavbar";
import RoomHistoryList from "@/components/history/RoomHistoryList";
import DeleteRoomModal from "@/components/history/DeleteRoomModal";
import { useHistory, RoomRecord } from "@/context/HistoryContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { History } from "lucide-react";

export default function HistoryPage() {
  const { user, isLoading } = useAuth();
  const { rooms, loadingRooms, fetchRooms, deleteRoom } = useHistory();
  const router = useRouter();
  const [toDelete, setToDelete] = useState<RoomRecord | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) fetchRooms();
  }, [user, fetchRooms]);

  if (isLoading || !user) return null;

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    await deleteRoom(toDelete._id);
    setToDelete(null);
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-x-hidden">
      <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <TopNavbar />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="flex items-center gap-3.5 mb-10">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <History size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl text-white font-semibold tracking-tight">Match History</h1>
            <p className="text-white/30 text-sm mt-0.5">
              {user.role === "admin" ? "All recorded rooms and their challenge results" : "Rooms you participated in"}
            </p>
          </div>
        </div>

        {loadingRooms ? (
          <div className="py-24 text-center text-white/30 text-sm animate-pulse font-medium">Loading history...</div>
        ) : (
          <RoomHistoryList
            rooms={rooms}
            isAdmin={user.role === "admin"}
            onDeleteClick={setToDelete}
          />
        )}
      </div>

      {toDelete && (
        <DeleteRoomModal
          room={toDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

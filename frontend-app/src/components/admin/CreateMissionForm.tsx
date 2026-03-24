"use client";
import React, { useRef, useState } from "react";
import { MapPin, Upload, X, Timer } from "lucide-react";
import dynamic from "next/dynamic";
import { useTournament } from "@/context/TournamentContext";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), { ssr: false });

interface Props {
  roomId: string;
}

export default function CreateMissionForm({ roomId }: Props) {
  const { createChallenge } = useTournament();
  const [geoImage, setGeoImage] = useState<string | null>(null);
  const [geoCoords, setGeoCoords] = useState<[number, number] | null>(null);
  const [timeLimit, setTimeLimit] = useState(60);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setGeoImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateChallenge = () => {
    if (geoImage && geoCoords) {
      createChallenge(roomId, geoImage, geoCoords, timeLimit);
      setGeoImage(null);
      setGeoCoords(null);
      setTimeLimit(60);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-[#111318] border border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/20">
      <h2 className="text-white font-semibold text-sm tracking-wide uppercase flex items-center gap-2.5 mb-6">
        <MapPin size={16} className="text-[#ffcc00]" /> Create New Geoguess Operation
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-3">
          <label className="text-white/40 font-medium text-xs tracking-wide uppercase">1. Intelligence Image Payload</label>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          {geoImage ? (
            <div className="relative w-full aspect-video rounded-xl border border-white/[0.08] bg-black overflow-hidden group shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={geoImage} alt="Uploaded" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
              <button onClick={() => { setGeoImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"><X size={16} /></button>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-video border-2 border-dashed border-white/[0.06] bg-white/[0.01] rounded-xl flex flex-col items-center justify-center gap-3 text-white/20 hover:border-[#ffcc00]/30 hover:text-[#ffcc00]/70 hover:bg-[#ffcc00]/[0.02] transition-all duration-200">
              <Upload size={36} />
              <span className="font-medium tracking-wide text-xs">Upload Local File</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-white/40 font-medium text-xs tracking-wide uppercase flex justify-between">
            <span>2. Set Tactical Coordinate</span>
            {geoCoords && <span className="text-[#ffcc00] font-mono bg-[#ffcc00]/5 px-2 py-0.5 rounded-lg border border-[#ffcc00]/15 text-[11px]">{Math.round(geoCoords[0])}, {Math.round(geoCoords[1])}</span>}
          </label>
          <div className="w-full aspect-video rounded-xl border border-white/[0.08] overflow-hidden bg-[#053446ff] shadow-lg">
            <InteractiveMap selectedLocation={geoCoords} onLocationSelect={setGeoCoords} />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row items-end gap-5 bg-white/[0.02] p-6 rounded-xl border border-white/[0.04] mt-2">
          <div className="flex-1 w-full relative">
            <label className="text-white/40 font-medium text-xs tracking-wide uppercase mb-2 flex items-center gap-2">
              <Timer size={14} /> Operation Time Limit (Seconds)
            </label>
            <input
              type="number" min="10" step="5" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full bg-[#111318] border border-white/[0.08] rounded-xl pl-4 pr-14 py-3.5 text-white font-mono text-lg outline-none focus:border-[#ffcc00]/30 transition-all duration-200"
            />
            <div className="absolute right-4 bottom-3.5 text-white/20 font-medium text-sm">SEC</div>
          </div>
          <button
            onClick={handleCreateChallenge}
            disabled={!geoImage || !geoCoords}
            className="w-full md:w-auto bg-[#ffcc00] hover:bg-[#ffe066] text-black px-10 py-3.5 rounded-xl font-semibold tracking-wide text-sm transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,204,0,0.1)] disabled:shadow-none min-w-[220px]"
          >
            Register Mission
          </button>
        </div>
      </div>
    </div>
  );
}

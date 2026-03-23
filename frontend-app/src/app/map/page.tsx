"use client";

import dynamic from "next/dynamic";
import TopNavbar from "@/components/TopNavbar";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
});

export default function MapPage() {
  return (
    <div className="w-full h-screen bg-transparent relative overflow-hidden flex flex-col">
      <TopNavbar />
      <div className="flex-1 w-full relative z-0">
        <InteractiveMap />
      </div>
    </div>
  );
}

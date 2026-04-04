"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname === "/login" || pathname === "/register";
    const isPublicBracket = pathname.startsWith("/bracket/") && pathname !== "/bracket/create";

    if (!user && !isAuthPage && !isPublicBracket) {
      setAuthorized(false);
      router.push("/login");
    } else if (user && isAuthPage) {
      setAuthorized(false);
      router.push("/");
    } else {
      setAuthorized(true);
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading || !authorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-primary p-20 text-center font-bold uppercase tracking-widest font-mono animate-pulse">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}

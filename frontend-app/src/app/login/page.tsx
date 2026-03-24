"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import Link from "next/link";
import TopNavbar from "@/components/TopNavbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      login(data.token, data.user);
      router.push("/arena");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] relative flex flex-col font-sans selection:bg-white/20 flex-1 w-full mx-auto" style={{ zIndex: 50 }}>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-[#161922]/90 border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden backdrop-blur-md">
           <div className="absolute top-0 left-0 w-full h-2 bg-[#ffcc00]" />
           <h1 className="text-2xl text-white font-semibold tracking-tight mb-2 flex items-center gap-3">
             <LogIn size={28} className="text-[#ffcc00]" /> Login
           </h1>
           <p className="text-white/40 text-sm mb-8">Enter your account details to sign in.</p>
           
           {error && <div className="text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded mb-4 text-sm font-mono">{error}</div>}

           <form onSubmit={handleLogin} className="flex flex-col gap-5">
             <div>
               <label className="text-white/50 font-medium uppercase tracking-wide text-xs mb-1 block">Email</label>
               <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#ffcc00]/50 transition-colors" />
             </div>
             <div>
               <label className="text-white/50 font-medium uppercase tracking-wide text-xs mb-1 block">Password</label>
               <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#ffcc00]/50 transition-colors" />
             </div>
             <button type="submit" className="w-full bg-[#ffcc00] hover:bg-[#ffe066] text-black py-3.5 rounded-xl font-semibold tracking-wide text-sm transition-all shadow-[0_0_20px_rgba(255,204,0,0.1)] mt-4 block text-center">
                Login
             </button>
           </form>
           <p className="text-white/40 text-sm text-center mt-6 font-medium tracking-wide">Don't have an account? <Link href="/register" className="text-[#ffcc00] hover:underline hover:text-white transition-colors">Register Here</Link></p>
        </div>
      </div>
    </div>
  );
}

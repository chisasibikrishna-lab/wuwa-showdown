"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "player" | "admin";
  avatar: string;
  score: number;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("wuwa_token");
      const savedUser = localStorage.getItem("wuwa_user");
      
      if (savedToken && savedUser) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          
          if (res.ok) {
            const data = await res.json();
            setToken(savedToken);
            setUser(data.user);
          } else {
            // Token is invalid, clean up local storage
            localStorage.removeItem("wuwa_token");
            localStorage.removeItem("wuwa_user");
          }
        } catch (e) {
          // If network error, optimistically load the saved state to allow offline usage
          console.error("Failed to validate user session", e);
          try {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          } catch (err) {
            // Ignored
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("wuwa_token", newToken);
    localStorage.setItem("wuwa_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("wuwa_token");
    localStorage.removeItem("wuwa_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

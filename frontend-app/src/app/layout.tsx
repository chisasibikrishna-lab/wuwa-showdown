import "./globals.css";
import BaseLayout from "@/components/BaseLayout";
import { TournamentProvider } from "@/context/TournamentContext";
import { AuthProvider } from "@/context/AuthContext";
import { HistoryProvider } from "@/context/HistoryContext";
import RouteGuard from "@/components/RouteGuard";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wuwa Tournament App",
  description: "Leaderboard and weekly scoring app for Wuwa tournaments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full">
        <AuthProvider>
          <TournamentProvider>
            <HistoryProvider>
              <RouteGuard>
                <BaseLayout>{children}</BaseLayout>
              </RouteGuard>
            </HistoryProvider>
          </TournamentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

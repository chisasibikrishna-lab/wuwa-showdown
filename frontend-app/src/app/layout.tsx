import "./globals.css";
import BaseLayout from "@/components/BaseLayout";
import { TournamentProvider } from "@/context/TournamentContext";
import { AuthProvider } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wuwa Tournament App",
  description: "Leaderboard and weekly scoring app for Wuwa tournaments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full">
        <AuthProvider>
          <TournamentProvider>
            <RouteGuard>
              <BaseLayout>{children}</BaseLayout>
            </RouteGuard>
          </TournamentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

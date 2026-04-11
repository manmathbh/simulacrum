"use client";

import { useState } from "react";

import { DashboardShell } from "./components/dashboard-shell";
import { Sidebar } from "./components/sidebar";
import { mockChatMessages } from "./lib/mock-dashboard-data";

export default function Home() {
  const [activeView, setActiveView] = useState<
    "interview" | "past-sessions" | "analytics"
  >("interview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-[1800px] grid-cols-1 lg:grid-cols-[18rem_1fr]">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex min-h-screen flex-col border-t border-white/10 lg:border-t-0 lg:border-l lg:border-white/10">
          <header className="border-b border-white/10 px-6 py-5 sm:px-8">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Simulacrum Dashboard
            </h1>
            <p className="mt-1 text-sm text-indigo-200">
              Roleplay and interview prep workspace
            </p>
          </header>

          <DashboardShell
            initialMessages={mockChatMessages}
            activeView={activeView}
          />
        </main>
      </div>
    </div>
  );
}

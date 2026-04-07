import { DashboardShell } from "./components/dashboard-shell";
import { Sidebar } from "./components/sidebar";
import { mockChatMessages } from "./lib/mock-dashboard-data";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1800px] grid-cols-1 lg:grid-cols-[18rem_1fr]">
        <Sidebar />
        <main className="flex min-h-screen flex-col border-t border-cyan-500/20 lg:border-t-0 lg:border-l">
          <header className="border-b border-cyan-400/20 px-6 py-5 sm:px-8">
            <h1 className="text-xl font-semibold tracking-tight text-cyan-700 dark:text-cyan-300 sm:text-2xl">
              Simulacrum Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Roleplay and interview prep workspace
            </p>
          </header>

          <DashboardShell initialMessages={mockChatMessages} />
        </main>
      </div>
    </div>
  );
}

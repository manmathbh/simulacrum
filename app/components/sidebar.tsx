"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type ViewId = "interview" | "past-sessions" | "analytics";

const links: Array<{ id: ViewId; label: string }> = [
  { id: "interview", label: "New Scenario" },
  { id: "past-sessions", label: "Past Sessions" },
  { id: "analytics", label: "Progress Analytics" },
];

type SidebarProps = {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
};

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside className="flex h-full flex-col border-b border-white/10 bg-white/5 px-5 py-6 text-white backdrop-blur-md lg:border-r lg:border-b-0 lg:px-6 lg:py-8">
      <div className="mb-4 flex items-center justify-between lg:mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
            Simulacrum
          </p>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-white">
            AI Interview Studio
          </h2>
        </div>

        <button
          type="button"
          className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-xs text-white lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="sidebar-nav"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      <nav
        id="sidebar-nav"
        className={`${mobileOpen ? "space-y-3" : "hidden"} lg:block lg:space-y-3`}
      >
        {links.map((link) => (
          <button
            key={link.id}
            type="button"
            className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
              activeView === link.id
                ? "border-indigo-300/70 bg-indigo-500/25"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
            }`}
            onClick={() => setActiveView(link.id)}
          >
            <span
              className={`text-sm font-medium ${
                activeView === link.id
                  ? "text-white"
                  : "text-slate-200 group-hover:text-white"
              }`}
            >
              {link.label}
            </span>
            <span className="text-indigo-200/90">+</span>
          </button>
        ))}
      </nav>

      <div className="mt-6 border-t border-white/10 pt-4 lg:mt-auto">
        {status === "authenticated" && session.user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-lg">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt="User avatar"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full border border-white/20 object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-xs font-semibold text-white">
                  {session.user.name?.slice(0, 1) ?? "U"}
                </div>
              )}
              <p className="truncate text-sm font-medium text-slate-100">
                {session.user.name ?? "Signed in"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => signOut()}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-500"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => signIn("google")}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-500"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </aside>
  );
}

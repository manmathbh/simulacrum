"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const links = [
  "New Scenario",
  "Past Sessions",
  "Progress Analytics",
];

export function Sidebar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("New Scenario");

  return (
    <aside className="flex h-full flex-col border-b border-cyan-500/20 bg-white/90 px-5 py-6 dark:bg-slate-950/95 lg:border-r lg:border-b-0 lg:px-6 lg:py-8">
      <div className="mb-4 flex items-center justify-between lg:mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
            Simulacrum
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            AI Interview Studio
          </h2>
        </div>

        <button
          type="button"
          className="rounded-lg border border-cyan-500/25 px-3 py-1 text-xs text-slate-700 dark:text-slate-200 lg:hidden"
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
            key={link}
            type="button"
            className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
              activeLink === link
                ? "border-cyan-600/50 bg-cyan-500/10 dark:border-cyan-300/60"
                : "border-cyan-500/20 bg-white/80 hover:border-cyan-600/40 hover:bg-cyan-50/60 dark:border-cyan-400/20 dark:bg-slate-900/80 dark:hover:border-cyan-300/40 dark:hover:bg-slate-900"
            }`}
            onClick={() => setActiveLink(link)}
          >
            <span
              className={`text-sm font-medium ${
                activeLink === link
                  ? "text-cyan-700 dark:text-cyan-200"
                  : "text-slate-700 group-hover:text-cyan-700 dark:text-slate-200 dark:group-hover:text-cyan-200"
              }`}
            >
              {link}
            </span>
            <span className="text-cyan-600/80 dark:text-cyan-400/80">+</span>
          </button>
        ))}
      </nav>

      <div className="mt-6 border-t border-cyan-500/20 pt-4 lg:mt-auto">
        {status === "authenticated" && session.user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-white/80 px-3 py-2 dark:bg-slate-900/80">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt="User avatar"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full border border-cyan-500/30 object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-500/30 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                  {session.user.name?.slice(0, 1) ?? "U"}
                </div>
              )}
              <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                {session.user.name ?? "Signed in"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => signOut()}
              className="w-full rounded-xl border border-cyan-500/25 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-cyan-50/60 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => signIn("google")}
            className="w-full rounded-xl border border-cyan-500/25 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-cyan-50/60 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </aside>
  );
}

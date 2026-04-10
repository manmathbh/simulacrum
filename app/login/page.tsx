"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.16),transparent_25%),radial-gradient(circle_at_50%_90%,rgba(14,116,144,0.16),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.1)_1px,transparent_1px)] bg-[size:36px_36px] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)]" />

      <section className="relative mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-3xl text-center">
          <div className="rounded-3xl border border-cyan-500/20 bg-white/80 p-8 shadow-2xl shadow-cyan-900/10 backdrop-blur-md dark:bg-slate-900/70 sm:p-12">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-300">
              Simulacrum
            </p>

            <div className="mb-5 flex justify-center">
              <span className="rounded-full border border-cyan-500/25 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 px-4 py-1 text-xs font-medium text-cyan-800 dark:text-cyan-200">
                ✨ AI-Powered Coaching
              </span>
            </div>

            <h1 className="text-balance text-4xl font-semibold leading-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
              Master Your Next Tech Interview
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
              Practice with AI Mock Interviews, get live communication feedback,
              and improve your ATS Resume Grader score before your real
              interviews.
            </p>

            {isAuthenticated && (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">
                Signed in as {session.user?.name ?? "your account"}
              </p>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="inline-flex items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/15 px-8 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-500/25 dark:text-cyan-100"
              >
                Continue with Google
              </button>

              {isAuthenticated && (
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300/70 bg-white px-8 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Continue to Dashboard
                </Link>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Powered by: Next.js • Tailwind CSS • OpenRouter AI
          </p>
        </div>
      </section>

      <footer className="relative z-10 flex items-center justify-center gap-4 px-6 py-5 text-xs text-slate-500 dark:text-slate-400">
        <span>© {new Date().getFullYear()} Simulacrum</span>
        <a
          href="https://github.com/manmathbh/simulacrum"
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-cyan-700 dark:hover:text-cyan-300"
        >
          View Source on GitHub
        </a>
        <a
          href="https://manmathportfolio.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-cyan-700 dark:hover:text-cyan-300"
        >
          Built by Manmath Hatte
        </a>
      </footer>
    </main>
  );
}

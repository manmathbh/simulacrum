"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { ThemeToggle } from "@/app/components/theme-toggle";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"
        fill="currentColor"
      />
      <path
        d="M18 15l.75 2.25L21 18l-2.25.75L18 21l-.75-2.25L15 18l2.25-.75L18 15z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 text-slate-900 selection:bg-cyan-500/25 dark:bg-slate-950 dark:text-slate-100">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] animate-[float-slow_12s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-cyan-400/20 via-cyan-500/10 to-transparent blur-[100px] dark:from-cyan-500/15 dark:via-cyan-600/8" />
        <div className="absolute -bottom-32 right-1/4 h-[400px] w-[400px] animate-[float-slow_10s_ease-in-out_infinite_2s] rounded-full bg-gradient-to-tl from-blue-400/20 via-indigo-400/10 to-transparent blur-[100px] dark:from-blue-500/12 dark:via-indigo-500/8" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-[soft-pulse_8s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-cyan-400/8 to-blue-400/8 blur-[80px] dark:from-cyan-500/5 dark:to-blue-500/5" />
      </div>

      {/* Subtle grid overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)]" />

      {/* Top navigation bar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            <SparkleIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Simulacrum
          </span>
        </div>
        <ThemeToggle />
      </nav>

      {/* Hero section */}
      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-20 sm:pb-28">
        <div className="w-full max-w-2xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-700 backdrop-blur-sm dark:border-cyan-500/25 dark:bg-cyan-500/10 dark:text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            AI-Powered Coaching
          </div>

          {/* Headline */}
          <h1 className="text-balance text-4xl font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-50">
            Master Your Next
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              {" "}Tech Interview
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
            Practice with AI Mock Interviews, get live communication feedback,
            and improve your ATS Resume Grader score before your real
            interviews.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {[
              { icon: "🎙️", label: "Mock Interviews" },
              { icon: "📊", label: "Live Feedback" },
              { icon: "📄", label: "ATS Resume Grader" },
              { icon: "🤖", label: "AI-Powered" },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-sm transition-colors hover:border-cyan-300/40 hover:bg-cyan-50/50 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-cyan-600/40 dark:hover:bg-cyan-950/30"
              >
                <span className="text-sm">{icon}</span>
                {label}
              </span>
            ))}
          </div>

          {/* Auth status */}
          {isAuthenticated && (
            <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Signed in as {session.user?.name ?? "your account"}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="inline-flex items-center gap-3 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10 hover:ring-cyan-300/50 active:scale-[0.98] dark:bg-slate-800 dark:text-slate-200 dark:shadow-slate-900/50 dark:ring-slate-700 dark:hover:shadow-cyan-500/5 dark:hover:ring-cyan-600/40"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {isAuthenticated && (
              <Link
                href="/"
                className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/40 active:scale-[0.98]"
              >
                Continue to Dashboard
                <svg
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            )}
          </div>

          {/* Separator */}
          <div className="mx-auto mt-12 flex max-w-xs items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              How it works
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700" />
          </div>

          {/* Steps */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Sign In",
                desc: "Connect your Google account to get started instantly.",
              },
              {
                step: "02",
                title: "Upload Resume",
                desc: "Let AI analyze and optimize your resume for ATS.",
              },
              {
                step: "03",
                title: "Practice",
                desc: "Run mock interviews and receive live feedback.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="group rounded-2xl border border-slate-200/80 bg-white/60 p-5 text-left backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:shadow-lg hover:shadow-cyan-500/5 dark:border-slate-700/80 dark:bg-slate-800/60 dark:hover:border-cyan-600/40"
              >
                <span className="text-xs font-bold tracking-wider text-cyan-500 opacity-70">
                  {step}
                </span>
                <h3 className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-slate-200/60 px-6 py-5 text-xs text-slate-400 backdrop-blur-sm dark:border-slate-800/60 dark:text-slate-500">
        <span>© {new Date().getFullYear()} Simulacrum</span>
        <a
          href="https://github.com/manmathbh/simulacrum"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
        >
          View Source on GitHub
        </a>
        <a
          href="https://manmathportfolio.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-400"
        >
          Built by Manmath Hatte
        </a>
      </footer>
    </main>
  );
}

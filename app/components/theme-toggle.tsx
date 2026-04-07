"use client";

import { useTheme } from "next-themes";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5V5.2M12 18.8v2.7M5.2 5.2l1.9 1.9M16.9 16.9l1.9 1.9M2.5 12h2.7M18.8 12h2.7M5.2 18.8l1.9-1.9M16.9 7.1l1.9-1.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M20 14.2A8.5 8.5 0 1 1 9.8 4a7 7 0 1 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const { setTheme } = useTheme();

  const handleToggle = () => {
    const root = document.documentElement;
    const isDarkNow = root.classList.contains("dark");
    const nextTheme = isDarkNow ? "light" : "dark";

    setTheme(nextTheme);

    // Keep DOM class in sync immediately for reliable visual switching.
    root.classList.remove(nextTheme === "dark" ? "light" : "dark");
    root.classList.add(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="rounded-full border border-cyan-500/25 bg-white/80 p-2 text-cyan-700 transition-colors hover:bg-gray-200 dark:border-cyan-400/25 dark:bg-slate-900/80 dark:text-cyan-300 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      <SunIcon className="hidden h-5 w-5 dark:block" />
      <MoonIcon className="h-5 w-5 dark:hidden" />
    </button>
  );
}

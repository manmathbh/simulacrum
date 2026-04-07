"use client";

import { FeedbackSnapshot } from "../lib/dashboard-contracts";
import { mockFeedbackSnapshot } from "../lib/mock-dashboard-data";

type FeedbackPanelProps = {
  snapshot?: FeedbackSnapshot;
};

function toStatusLabel(status: FeedbackSnapshot["metrics"][number]["status"]) {
  if (status === "pending") return "-";
  if (status === "strong") return "Strong";
  if (status === "good") return "Good";
  return "Needs Work";
}

export function FeedbackPanel({ snapshot = mockFeedbackSnapshot }: FeedbackPanelProps) {
  const metrics = snapshot.metrics;

  return (
    <section className="flex min-h-[340px] flex-col px-6 py-6 sm:px-8 sm:py-8">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-cyan-700 dark:text-cyan-300">
          Real-time Feedback Panel
        </h3>
        <span className="rounded-full border border-cyan-500/25 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
          Live Analysis
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <article
            key={metric.key}
            className="rounded-xl border border-cyan-500/20 bg-white/70 p-4 dark:bg-slate-900/70"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-slate-700 dark:text-slate-300">{metric.label}</p>
              <p className="rounded-full border border-cyan-500/25 px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                {toStatusLabel(metric.status)}
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-cyan-700 dark:text-cyan-200">
              {metric.score}
              <span className="ml-1 text-sm text-slate-500 dark:text-slate-400">/100</span>
            </p>
          </article>
        ))}
      </div>

      <div className="mt-4 flex-1 rounded-2xl border border-cyan-500/20 bg-white/70 p-4 dark:bg-slate-900/70">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Composite performance score: <span className="text-cyan-700 dark:text-cyan-200">{snapshot.compositeScore}/100</span>
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Live coaching cue: {snapshot.coachingCue}
        </p>
      </div>
    </section>
  );
}

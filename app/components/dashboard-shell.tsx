"use client";

import { useEffect, useState } from "react";

import { ChatInterfacePanel } from "./chat-interface-panel";
import { FeedbackPanel } from "./feedback-panel";
import { ThemeToggle } from "./theme-toggle";
import {
  AtsResumeAnalysis,
  ChatMessage,
  FeedbackSnapshot,
} from "../lib/dashboard-contracts";
import { analyzeResume, postDashboardTurn } from "../lib/api-client";

const pendingSnapshot: FeedbackSnapshot = {
  metrics: [
    { key: "confidence", label: "Confidence", score: 0, status: "pending" },
    { key: "clarity", label: "Clarity", score: 0, status: "pending" },
    { key: "tone", label: "Tone", score: 0, status: "pending" },
    { key: "grammar", label: "Grammar", score: 0, status: "pending" },
  ],
  compositeScore: 0,
  coachingCue: "Awaiting your first response to begin live analysis...",
  updatedAt: "",
};

const STORAGE_KEYS = {
  messages: "simulacrum.messages",
  atsData: "simulacrum.atsData",
  resumeFileName: "simulacrum.resumeFileName",
  resumeText: "simulacrum.resumeText",
  lastSavedAt: "simulacrum.lastSavedAt",
  history: "simulacrum.history",
} as const;

function getAtsScoreBand(score: number) {
  if (score >= 80) {
    return {
      label: "Strong",
      className: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
    };
  }

  if (score >= 60) {
    return {
      label: "Needs Polish",
      className: "border-amber-400/40 bg-amber-500/15 text-amber-200",
    };
  }

  return {
    label: "Needs Work",
    className: "border-rose-400/40 bg-rose-500/15 text-rose-200",
  };
}

type DashboardShellProps = {
  initialMessages: ChatMessage[];
  activeView: "interview" | "past-sessions" | "analytics";
};

type PastSession = {
  id: string;
  timestamp: string;
  resumeName: string | null;
  finalSnapshot: FeedbackSnapshot;
  messages: ChatMessage[];
};

export function DashboardShell({
  initialMessages,
  activeView,
}: DashboardShellProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [snapshot, setSnapshot] = useState<FeedbackSnapshot>(pendingSnapshot);
  const [isSending, setIsSending] = useState(false);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [atsData, setAtsData] = useState<AtsResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsError, setAtsError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [selectedTranscript, setSelectedTranscript] =
    useState<PastSession | null>(null);

  const markSessionSaved = () => {
    if (typeof window === "undefined") {
      return;
    }

    const now = new Date().toISOString();
    window.localStorage.setItem(STORAGE_KEYS.lastSavedAt, now);
    setLastSavedAt(now);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const savedMessages = window.localStorage.getItem(STORAGE_KEYS.messages);
      const savedAtsData = window.localStorage.getItem(STORAGE_KEYS.atsData);
      const savedResumeFileName = window.localStorage.getItem(
        STORAGE_KEYS.resumeFileName,
      );
      const savedResumeText = window.localStorage.getItem(STORAGE_KEYS.resumeText);
      const savedLastSavedAt = window.localStorage.getItem(STORAGE_KEYS.lastSavedAt);
      const savedHistory = window.localStorage.getItem(STORAGE_KEYS.history);

      if (savedMessages) {
        setMessages(JSON.parse(savedMessages) as ChatMessage[]);
      }

      if (savedAtsData) {
        setAtsData(JSON.parse(savedAtsData) as AtsResumeAnalysis);
      }

      if (savedResumeFileName) {
        setResumeName(savedResumeFileName);
      }

      if (savedResumeText) {
        setResumeText(savedResumeText);
      }

      if (savedLastSavedAt) {
        setLastSavedAt(savedLastSavedAt);
      }

      if (savedHistory) {
        setPastSessions(JSON.parse(savedHistory) as PastSession[]);
      }
    } catch (error) {
      console.error("Failed to hydrate dashboard session:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(pastSessions));
  }, [pastSessions]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
    markSessionSaved();
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (atsData) {
      window.localStorage.setItem(STORAGE_KEYS.atsData, JSON.stringify(atsData));
      markSessionSaved();
      return;
    }

    window.localStorage.removeItem(STORAGE_KEYS.atsData);
    markSessionSaved();
  }, [atsData]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (resumeName) {
      window.localStorage.setItem(STORAGE_KEYS.resumeFileName, resumeName);
      markSessionSaved();
      return;
    }

    window.localStorage.removeItem(STORAGE_KEYS.resumeFileName);
    markSessionSaved();
  }, [resumeName]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (resumeText) {
      window.localStorage.setItem(STORAGE_KEYS.resumeText, resumeText);
      markSessionSaved();
      return;
    }

    window.localStorage.removeItem(STORAGE_KEYS.resumeText);
    markSessionSaved();
  }, [resumeText]);

  const sendMessage = async (content: string) => {
    setIsSending(true);

    try {
      const data = await postDashboardTurn({
        message: { content },
        resumeText: resumeText ?? undefined,
      });

      setMessages((prev) => [
        ...prev,
        data.chat.userMessage,
        data.chat.assistantMessage,
      ]);
      setSnapshot(data.feedback.snapshot);
    } catch {
      const fallbackSystemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        role: "system",
        content:
          "Message could not be delivered. Please retry in a moment.",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, fallbackSystemMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingResume(true);
    setResumeUploadError(null);
    setAtsError(null);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      const primaryWorkerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const fallbackWorkerUrl =
        "https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs";

      pdfjsLib.GlobalWorkerOptions.workerSrc = primaryWorkerUrl;

      const arrayBuffer = await file.arrayBuffer();
      let loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      });
      let pdfDocument;

      try {
        pdfDocument = await loadingTask.promise;
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = fallbackWorkerUrl;
        loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
        });
        pdfDocument = await loadingTask.promise;
      }
      const pages: string[] = [];

      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        const page = await pdfDocument.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")
          .trim();

        if (pageText) {
          pages.push(pageText);
        }
      }

      const parsedResumeText = pages.join("\n\n").trim();
      setResumeText(parsedResumeText || null);
      setResumeName(file.name);
      setResumeUploadError(null);

      if (parsedResumeText) {
        setIsAnalyzing(true);
        setAtsError(null);

        try {
          const result = await analyzeResume(
            parsedResumeText,
            jobDescription.trim() || undefined,
          );
          setAtsData(result);
        } catch (error) {
          console.error("ATS analysis failed:", error);
          setAtsData(null);
          setAtsError(
            "Resume uploaded, but ATS analysis failed. Please retry in a moment.",
          );
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        setAtsData(null);
        setAtsError(null);
      }
    } catch (error) {
      console.error("Resume upload failed:", error);
      setResumeUploadError(
        "Resume upload failed. Please try again with a valid PDF.",
      );
      setAtsData(null);
      setAtsError(null);
    } finally {
      setIsUploadingResume(false);
      event.target.value = "";
    }
  };

  const endAndSaveSession = () => {
    if (messages.length > 0) {
      const finishedSession: PastSession = {
        id: `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        resumeName,
        finalSnapshot: snapshot,
        messages,
      };

      setPastSessions((prev) => [finishedSession, ...prev]);
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.messages);
      window.localStorage.removeItem(STORAGE_KEYS.atsData);
      window.localStorage.removeItem(STORAGE_KEYS.resumeFileName);
      window.localStorage.removeItem(STORAGE_KEYS.resumeText);
      window.localStorage.removeItem(STORAGE_KEYS.lastSavedAt);
    }

    setMessages([]);
    setSnapshot(pendingSnapshot);
    setResumeText(null);
    setResumeName(null);
    setResumeUploadError(null);
    setAtsData(null);
    setAtsError(null);
    setLastSavedAt(null);
  };

  const totalInterviews = pastSessions.length;

  const averageScore =
    totalInterviews > 0
      ? Math.round(
          pastSessions.reduce(
            (sum, session) => sum + session.finalSnapshot.compositeScore,
            0,
          ) / totalInterviews,
        )
      : 0;

  const metricAverages = {
    confidence: 0,
    clarity: 0,
    tone: 0,
    grammar: 0,
  };

  if (totalInterviews > 0) {
    const totals = pastSessions.reduce(
      (acc, session) => {
        for (const metric of session.finalSnapshot.metrics) {
          if (metric.key === "confidence") acc.confidence += metric.score;
          if (metric.key === "clarity") acc.clarity += metric.score;
          if (metric.key === "tone") acc.tone += metric.score;
          if (metric.key === "grammar") acc.grammar += metric.score;
        }

        return acc;
      },
      { confidence: 0, clarity: 0, tone: 0, grammar: 0 },
    );

    metricAverages.confidence = Math.round(totals.confidence / totalInterviews);
    metricAverages.clarity = Math.round(totals.clarity / totalInterviews);
    metricAverages.tone = Math.round(totals.tone / totalInterviews);
    metricAverages.grammar = Math.round(totals.grammar / totalInterviews);
  }

  const latestSession = pastSessions[0] ?? null;
  const latestMetricScores = {
    confidence:
      latestSession?.finalSnapshot.metrics.find((m) => m.key === "confidence")
        ?.score ?? 0,
    clarity:
      latestSession?.finalSnapshot.metrics.find((m) => m.key === "clarity")
        ?.score ?? 0,
    tone:
      latestSession?.finalSnapshot.metrics.find((m) => m.key === "tone")
        ?.score ?? 0,
    grammar:
      latestSession?.finalSnapshot.metrics.find((m) => m.key === "grammar")
        ?.score ?? 0,
  };

  const metricTrends = {
    confidence: latestMetricScores.confidence - metricAverages.confidence,
    clarity: latestMetricScores.clarity - metricAverages.clarity,
    tone: latestMetricScores.tone - metricAverages.tone,
    grammar: latestMetricScores.grammar - metricAverages.grammar,
  };

  const quickActions = [
    {
      title: "Start Mock Interview",
      subtitle: "Jump into a new scenario with live AI coaching.",
    },
    {
      title: "Upload Resume",
      subtitle: "Personalize questions with resume-aware prompts.",
    },
    {
      title: "Review Sessions",
      subtitle: "Open transcripts and reflect on outcomes.",
    },
    {
      title: "Track Analytics",
      subtitle: "Measure confidence, clarity, tone, and grammar trends.",
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-1 flex-col bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white">
      <div className="absolute top-4 right-6 z-10">
        <div className="flex items-center gap-3">
          {lastSavedAt ? (
            <span className="text-[11px] text-slate-300">
              Last saved: {new Date(lastSavedAt).toLocaleTimeString()}
            </span>
          ) : null}
          <button
            type="button"
            onClick={endAndSaveSession}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/10"
          >
            End & Save Session
          </button>
          <ThemeToggle />
        </div>
      </div>

      <section className="px-6 pt-16 pb-6 sm:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Stop Guessing. Start Practicing.
        </h2>
        <p className="mt-2 text-sm text-indigo-200">
          Build interview confidence with scenario-based practice, ATS feedback,
          and real-time coaching.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <article
              key={action.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-lg"
            >
              <p className="text-sm font-semibold text-white">{action.title}</p>
              <p className="mt-1 text-xs text-slate-300">{action.subtitle}</p>
            </article>
          ))}
        </div>
      </section>

      {activeView === "interview" && (
        <>
          <div className="mx-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 shadow-xl backdrop-blur-lg sm:mx-8">
            <label className="block text-sm font-semibold text-white tracking-tight">
              Upload Resume (PDF)
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="block w-full max-w-md text-sm text-slate-200 file:mr-4 file:rounded-md file:border file:border-white/20 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500"
              />
              <p className="text-xs text-slate-300">
                {isUploadingResume
                  ? "Parsing resume..."
                  : resumeUploadError
                    ? resumeUploadError
                    : resumeName
                      ? `Uploaded: ${resumeName}`
                      : "No resume uploaded yet."}
              </p>
            </div>

            <div className="mt-4">
              <label
                htmlFor="job-description"
                className="block text-sm font-semibold tracking-tight text-white"
              >
                Target Job Description (Optional)
              </label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the role description to score JD match and missing skills..."
                rows={5}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 backdrop-blur-md outline-none transition focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                  <span>Analyzing resume with AI...</span>
                </div>
              ) : atsError ? (
                <p className="text-xs text-rose-200">{atsError}</p>
              ) : atsData ? (
                <div className="space-y-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">
                      ATS Score: {atsData.score}/100
                    </p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getAtsScoreBand(atsData.score).className}`}
                    >
                      {getAtsScoreBand(atsData.score).label}
                    </span>
                    {jobDescription.trim() ? (
                      <span className="rounded-full border border-indigo-300/40 bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-100">
                        JD Match Mode
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <p className="font-semibold">Strengths</p>
                    <ul className="list-disc pl-4">
                      {atsData.strengths.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">Weaknesses</p>
                    <ul className="list-disc pl-4">
                      {atsData.weaknesses.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-300">
                  ATS analysis will appear here after a resume is uploaded.
                </p>
              )}
            </div>
          </div>

          <section className="mt-6 grid flex-1 grid-cols-1 gap-6 px-6 pb-8 sm:px-8 xl:grid-cols-2">
            <ChatInterfacePanel
              messages={messages}
              isSending={isSending}
              onSendMessage={sendMessage}
            />
            <FeedbackPanel snapshot={snapshot} />
          </section>
        </>
      )}

      {activeView === "past-sessions" && (
        <section className="flex flex-1 flex-col px-6 py-10 sm:px-8">
          <h3 className="text-2xl font-bold tracking-tight text-white">
            Interview History
          </h3>
          <p className="mt-1 text-sm text-indigo-200">Revisit every session and replay your transcript.</p>

          {pastSessions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur-lg">
              <p className="text-sm text-slate-300">
                No past sessions yet. Start a new scenario!
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {pastSessions.map((session) => (
                <article
                  key={session.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-lg"
                >
                  <p className="text-xs text-slate-300">
                    {new Date(session.timestamp).toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    Resume: {session.resumeName ?? "No resume uploaded"}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Final Composite Score: {session.finalSnapshot.compositeScore}/100
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedTranscript(session)}
                    className="mt-4 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-indigo-500"
                  >
                    View Transcript
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeView === "analytics" && (
        <section className="flex flex-1 flex-col px-6 py-10 sm:px-8">
          <h3 className="text-2xl font-bold tracking-tight text-white">
            Progress Analytics
          </h3>
          <p className="mt-1 text-sm text-indigo-200">Track your growth with data-rich interview insights.</p>

          {totalInterviews === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur-lg">
              <p className="text-sm text-slate-300">
                No analytics yet. Complete your first interview to unlock
                progress insights.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-lg">
                  <p className="text-sm text-slate-300">
                    Total Mock Interviews
                  </p>
                  <p className="mt-2 text-4xl font-bold text-white tracking-tight">
                    {totalInterviews}
                  </p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-lg">
                  <p className="text-sm text-slate-300">
                    Average ATS Score
                  </p>
                  <p className="mt-2 text-4xl font-bold text-white tracking-tight">
                    {averageScore}
                    <span className="ml-1 text-base text-slate-300">
                      /100
                    </span>
                  </p>
                </article>
              </div>

              <article className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-lg">
                <h4 className="text-lg font-bold tracking-tight text-white">
                  Average Skill Breakdown
                </h4>

                <div className="mt-5 space-y-4">
                  {[
                    {
                      label: "Confidence",
                      score: metricAverages.confidence,
                      trend: metricTrends.confidence,
                    },
                    {
                      label: "Clarity",
                      score: metricAverages.clarity,
                      trend: metricTrends.clarity,
                    },
                    {
                      label: "Tone",
                      score: metricAverages.tone,
                      trend: metricTrends.tone,
                    },
                    {
                      label: "Grammar",
                      score: metricAverages.grammar,
                      trend: metricTrends.grammar,
                    },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-slate-200">
                          {metric.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300">
                            {metric.score}/100
                          </span>
                          {totalInterviews > 0 ? (
                            <span
                              className={`text-xs font-medium ${
                                metric.trend > 0
                                  ? "text-emerald-300"
                                  : metric.trend < 0
                                    ? "text-rose-300"
                                    : "text-slate-300"
                              }`}
                            >
                              {metric.trend > 0
                                ? `↑ +${metric.trend}`
                                : metric.trend < 0
                                  ? `↓ ${metric.trend}`
                                  : "→ 0"}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="h-2.5 w-full rounded-full bg-white/10">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </>
          )}
        </section>
      )}

      {selectedTranscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-xl backdrop-blur-lg">
            <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  {selectedTranscript.resumeName ?? "Interview Session"}
                </p>
                <p className="text-xs text-slate-300">
                  Composite Score: {selectedTranscript.finalSnapshot.compositeScore}
                  /100
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTranscript(null)}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-indigo-500"
              >
                Close
              </button>
            </header>

            <div className="space-y-4 overflow-y-auto p-4">
              {selectedTranscript.messages.map((message) => (
                <article
                  key={message.id}
                  className={`max-w-[90%] rounded-xl px-4 py-3 text-sm ${
                    message.role === "user"
                      ? "ml-auto border border-indigo-400/40 bg-indigo-500/20 text-indigo-100"
                      : "border border-white/10 bg-white/5 text-slate-200"
                  }`}
                >
                  <p className="mb-1 text-xs uppercase tracking-wide text-slate-300">
                    {message.role === "user"
                      ? "You"
                      : message.role === "assistant"
                        ? "AI Interviewer"
                        : "System"}
                  </p>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

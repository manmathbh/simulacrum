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
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
  }

  if (score >= 60) {
    return {
      label: "Needs Polish",
      className:
        "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    };
  }

  return {
    label: "Needs Work",
    className:
      "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
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
  const [atsData, setAtsData] = useState<AtsResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsError, setAtsError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);

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
          const result = await analyzeResume(parsedResumeText);
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

  return (
    <div className="relative flex flex-1 flex-col">
      <div className="absolute top-4 right-6 z-10">
        <div className="flex items-center gap-3">
          {lastSavedAt ? (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Last saved: {new Date(lastSavedAt).toLocaleTimeString()}
            </span>
          ) : null}
          <button
            type="button"
            onClick={endAndSaveSession}
            className="text-xs font-medium text-slate-600 underline decoration-dotted underline-offset-4 transition hover:text-cyan-700 dark:text-slate-300 dark:hover:text-cyan-300"
          >
            End & Save Session
          </button>
          <ThemeToggle />
        </div>
      </div>

      {activeView === "interview" && (
        <>
          <div className="border-b border-cyan-500/20 px-6 py-4 sm:px-8">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Upload Resume (PDF)
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="block w-full max-w-md text-sm text-slate-700 file:mr-4 file:rounded-md file:border file:border-cyan-500/30 file:bg-cyan-500/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-cyan-800 hover:file:bg-cyan-500/20 dark:text-slate-300 dark:file:border-cyan-400/30 dark:file:text-cyan-200"
              />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isUploadingResume
                  ? "Parsing resume..."
                  : resumeUploadError
                    ? resumeUploadError
                    : resumeName
                      ? `Uploaded: ${resumeName}`
                      : "No resume uploaded yet."}
              </p>
            </div>

            <div className="mt-3 rounded-lg border border-cyan-500/20 bg-white/60 p-3 dark:bg-slate-900/50">
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-500/60 border-t-transparent" />
                  <span>Analyzing resume with AI...</span>
                </div>
              ) : atsError ? (
                <p className="text-xs text-rose-700 dark:text-rose-300">{atsError}</p>
              ) : atsData ? (
                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                      ATS Score: {atsData.score}/100
                    </p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getAtsScoreBand(atsData.score).className}`}
                    >
                      {getAtsScoreBand(atsData.score).label}
                    </span>
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
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  ATS analysis will appear here after a resume is uploaded.
                </p>
              )}
            </div>
          </div>

          <section className="grid flex-1 grid-cols-1 divide-y divide-cyan-400/15 xl:grid-cols-2 xl:divide-x xl:divide-y-0">
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
          <h3 className="text-2xl font-semibold text-cyan-700 dark:text-cyan-300">
            Interview History
          </h3>

          {pastSessions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-white/70 p-8 text-center dark:bg-slate-900/70">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No past sessions yet. Start a new scenario!
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {pastSessions.map((session) => (
                <article
                  key={session.id}
                  className="rounded-2xl border border-cyan-500/20 bg-white/80 p-5 shadow-sm dark:bg-slate-900/70"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(session.timestamp).toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                    Resume: {session.resumeName ?? "No resume uploaded"}
                  </p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                    Final Composite Score: {session.finalSnapshot.compositeScore}/100
                  </p>
                  <button
                    type="button"
                    onClick={() => console.log(session.messages)}
                    className="mt-4 rounded-lg border border-cyan-500/25 px-3 py-1.5 text-xs font-medium text-cyan-700 transition hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-slate-800"
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
        <section className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8">
          <div className="w-full max-w-2xl rounded-2xl border border-cyan-500/20 bg-white/70 p-10 text-center dark:bg-slate-900/70">
            <h3 className="text-xl font-semibold text-cyan-700 dark:text-cyan-300">
              Coming Soon: Detailed Progress Tracking
            </h3>
          </div>
        </section>
      )}
    </div>
  );
}

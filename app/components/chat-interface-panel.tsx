"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { ChatMessage } from "../lib/dashboard-contracts";

type ChatInterfacePanelProps = {
  messages: ChatMessage[];
  isSending: boolean;
  onSendMessage: (content: string) => Promise<void> | void;
};

function toDisplayName(role: ChatMessage["role"]) {
  if (role === "user") return "You";
  if (role === "assistant") return "AI Interviewer";
  return "System";
}

export function ChatInterfacePanel({
  messages,
  isSending,
  onSendMessage,
}: ChatInterfacePanelProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messagesRef.current) return;

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = inputValue.trim();
    if (!trimmed || isSending) {
      return;
    }

    setInputValue("");
    await onSendMessage(trimmed);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <section className="flex min-h-[340px] flex-col px-6 py-6 sm:px-8 sm:py-8">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-cyan-700 dark:text-cyan-300">Chat Interface</h3>
        <span className="rounded-full border border-cyan-500/25 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
          Scenario: Product Manager Interview
        </span>
      </div>

      <div className="flex flex-1 flex-col rounded-2xl border border-cyan-500/20 bg-white/70 p-4 dark:bg-slate-900/70">
        <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`max-w-[90%] rounded-xl px-4 py-3 text-sm ${
                message.role === "user"
                  ? "ml-auto border border-cyan-600/35 bg-cyan-500/10 text-cyan-900 dark:border-cyan-300/40 dark:text-cyan-100"
                  : "border border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              <p className="mb-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {toDisplayName(message.role)}
              </p>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </article>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <textarea
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Type your response..."
            rows={2}
            className="max-h-40 min-h-11 flex-1 resize-y rounded-lg border border-cyan-500/25 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-600/35 placeholder:text-slate-500 focus:ring-2 dark:border-cyan-400/20 dark:bg-slate-950 dark:text-slate-100 dark:ring-cyan-300/40"
          />
          <button
            type="submit"
            disabled={isSending}
            className="h-11 rounded-lg border border-cyan-600/45 bg-cyan-500/15 px-4 text-sm font-medium text-cyan-800 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-300/50 dark:text-cyan-100 dark:hover:bg-cyan-500/30"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </section>
  );
}

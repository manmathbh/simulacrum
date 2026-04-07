import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  DashboardTurnRequest,
  DashboardTurnResponse,
  FeedbackSnapshot,
} from "../../../lib/dashboard-contracts";

export const runtime = "nodejs";

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openai = openRouterApiKey
  ? new OpenAI({
      apiKey: openRouterApiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Simulacrum",
      },
    })
  : null;

const openRouterModelCandidates = [
  "meta-llama/llama-3.1-8b-instruct:free",
  "qwen/qwen3.6-plus:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "z-ai/glm-4.5-air:free",
];

type ParsedAiResponse = {
  reply: string;
  metrics: {
    confidence: number;
    clarity: number;
    tone: number;
    grammar: number;
  };
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function statusFromScore(score: number): "strong" | "good" | "needs-work" {
  if (score >= 80) return "strong";
  if (score >= 70) return "good";
  return "needs-work";
}

function isLowSignalMessage(message: string) {
  const words = message.trim().split(/\s+/).filter(Boolean);
  const alphaNumChars = (message.match(/[a-z0-9]/gi) ?? []).length;
  const punctuationOnly = /^[\W_]+$/.test(message.trim());

  return words.length < 5 || alphaNumChars < 5 || punctuationOnly;
}

export async function POST(request: Request) {
  const body = (await request.json()) as DashboardTurnRequest;
  const content = body.message?.content?.trim();
  const resumeText = body.resumeText?.trim();

  if (!content) {
    return NextResponse.json(
      { error: "Message content is required." },
      { status: 400 },
    );
  }

  let assistantReply =
    "Nice structure. Tighten your opening to one line, then anchor with a measurable result.";
  const defaultScores = {
    confidence: 76,
    clarity: 73,
    tone: 79,
    grammar: 84,
  };
  let aiScores = { ...defaultScores };
  const baseSystemPrompt =
    "You are an evaluator. You must ONLY evaluate the text of the USER's most recent message. NEVER evaluate or grade the AI interviewer's text. If the user's message is extremely short (under 5 words), gibberish, or just punctuation (like '...'), you must output very low scores (e.g., 10 or 0) for all metrics, and the coaching cue should be: 'Please provide a complete answer to the question.' You MUST respond with ONLY a valid JSON object in this exact format: { \"reply\": \"your interview response and coaching\", \"metrics\": { \"confidence\": 80, \"clarity\": 75, \"tone\": 85, \"grammar\": 90 } }. Do not include markdown formatting or extra text outside the JSON.";
  const resumeContext = resumeText
    ? `\n\nThe candidate's resume is below. Analyze it and tailor your interview questions directly to their specific experience and projects. Resume: ${resumeText.slice(0, 16000)}`
    : "";
  const systemPrompt = `${baseSystemPrompt}${resumeContext}`;

  if (isLowSignalMessage(content)) {
    assistantReply = "Please provide a complete answer to the question.";
    aiScores = {
      confidence: 10,
      clarity: 10,
      tone: 10,
      grammar: 10,
    };
  } else if (openai) {
    let lastErrorMessage: string | null = null;

    try {
      for (const model of openRouterModelCandidates) {
        try {
          const completion = await openai.chat.completions.create({
            model,
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content:
                  `USER_MOST_RECENT_MESSAGE:\n"${content}"\n\n` +
                  "Evaluate and respond using ONLY this user message for scoring.",
              },
            ],
            temperature: 0.7,
          });

          const modelText = completion.choices[0]?.message?.content?.trim();
          if (modelText) {
            try {
              const parsed = JSON.parse(modelText) as ParsedAiResponse;
              const parsedReply = parsed.reply?.trim();
              const metrics = parsed.metrics;

              if (parsedReply) {
                assistantReply = parsedReply;
              } else {
                assistantReply = modelText;
              }

              if (metrics) {
                aiScores = {
                  confidence: clampScore(Number(metrics.confidence)),
                  clarity: clampScore(Number(metrics.clarity)),
                  tone: clampScore(Number(metrics.tone)),
                  grammar: clampScore(Number(metrics.grammar)),
                };
              }
            } catch {
              assistantReply = modelText;
              aiScores = { ...defaultScores };
            }

            lastErrorMessage = null;
            break;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          lastErrorMessage = `[${model}] ${message}`;
        }
      }

      if (lastErrorMessage) {
        throw new Error(lastErrorMessage);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("OpenRouter request failed:", message);

      assistantReply =
        "Unable to reach OpenRouter right now. Please retry in a few moments. If this persists, check model/provider availability in your OpenRouter workspace.";
      aiScores = { ...defaultScores };
    }
  } else {
    console.warn("OPENROUTER_API_KEY is missing. Returning fallback response.");
  }

  const now = new Date().toISOString();
  const compositeScore = Math.round(
    (aiScores.confidence + aiScores.clarity + aiScores.tone + aiScores.grammar) /
      4,
  );

  const snapshot: FeedbackSnapshot = {
    metrics: [
      {
        key: "confidence",
        label: "Confidence",
        score: aiScores.confidence,
        status: statusFromScore(aiScores.confidence),
      },
      {
        key: "clarity",
        label: "Clarity",
        score: aiScores.clarity,
        status: statusFromScore(aiScores.clarity),
      },
      {
        key: "tone",
        label: "Tone",
        score: aiScores.tone,
        status: statusFromScore(aiScores.tone),
      },
      {
        key: "grammar",
        label: "Grammar",
        score: aiScores.grammar,
        status: statusFromScore(aiScores.grammar),
      },
    ],
    compositeScore,
    coachingCue: assistantReply,
    updatedAt: now,
  };

  const response: DashboardTurnResponse = {
    chat: {
      userMessage: {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        createdAt: now,
      },
      assistantMessage: {
        id: `assistant-${Date.now() + 1}`,
        role: "assistant",
        content: assistantReply,
        createdAt: now,
      },
    },
    feedback: {
      snapshot,
    },
  };

  return NextResponse.json(response);
}

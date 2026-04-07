import OpenAI from "openai";
import { NextResponse } from "next/server";

import { AtsResumeAnalysis } from "../../lib/dashboard-contracts";

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
  "qwen/qwen3.6-plus:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "z-ai/glm-4.5-air:free",
];

function sanitizeAnalysis(input: AtsResumeAnalysis): AtsResumeAnalysis {
  const score = Math.max(0, Math.min(100, Math.round(Number(input.score) || 0)));
  const strengths = Array.isArray(input.strengths)
    ? input.strengths.slice(0, 5).map((item) => String(item))
    : [];
  const weaknesses = Array.isArray(input.weaknesses)
    ? input.weaknesses.slice(0, 5).map((item) => String(item))
    : [];

  return { score, strengths, weaknesses };
}

export async function POST(request: Request) {
  const body = (await request.json()) as { resumeText?: string };
  const resumeText = body.resumeText?.trim();

  if (!resumeText) {
    return NextResponse.json(
      { error: "resumeText is required." },
      { status: 400 },
    );
  }

  if (!openai) {
    return NextResponse.json(
      {
        score: 0,
        strengths: ["OPENROUTER_API_KEY is not configured."],
        weaknesses: ["Unable to run ATS analysis without API access."],
      },
      { status: 200 },
    );
  }

  let rawModelText = "";
  let lastErrorMessage: string | null = null;

  for (const model of openRouterModelCandidates) {
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a strict, professional ATS screening system. You MUST respond with ONLY raw JSON in this exact format: { \"score\": 85, \"strengths\": [\"...\", \"...\"], \"weaknesses\": [\"...\", \"...\"] }. Do not include markdown formatting or any text outside the JSON object.",
          },
          {
            role: "user",
            content: `Analyze the following resume for ATS readiness:\n\n${resumeText.slice(0, 20000)}`,
          },
        ],
        temperature: 0.2,
      });

      const modelText = completion.choices[0]?.message?.content?.trim();
      if (modelText) {
        rawModelText = modelText;
        lastErrorMessage = null;
        break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      lastErrorMessage = `[${model}] ${message}`;
    }
  }

  if (!rawModelText && lastErrorMessage) {
    console.error("ATS analysis failed:", lastErrorMessage);
    return NextResponse.json(
      {
        score: 0,
        strengths: ["Resume uploaded successfully."],
        weaknesses: ["ATS analysis service is temporarily unavailable."],
      },
      { status: 200 },
    );
  }

  try {
    const parsed = JSON.parse(rawModelText) as AtsResumeAnalysis;
    return NextResponse.json(sanitizeAnalysis(parsed));
  } catch (error) {
    console.error("ATS JSON parse failed:", error);
    return NextResponse.json(
      { error: "Failed to parse ATS analysis JSON response." },
      { status: 500 },
    );
  }
}

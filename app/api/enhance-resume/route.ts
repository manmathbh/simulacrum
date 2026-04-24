import OpenAI from "openai";
import { NextResponse } from "next/server";

import type { ResumeData } from "../../lib/resume-builder-contracts";

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

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeEnhancedResume(
  source: ResumeData,
  candidate: Partial<ResumeData>,
): ResumeData {
  const safeSummary = cleanString(candidate.summary) || source.summary;

  const safeExperience = source.experience.map((item, index) => {
    const incoming = candidate.experience?.[index];
    return {
      ...item,
      description: cleanString(incoming?.description) || item.description,
    };
  });

  const safeProjects = source.projects.map((item, index) => {
    const incoming = candidate.projects?.[index];
    return {
      ...item,
      description: cleanString(incoming?.description) || item.description,
    };
  });

  return {
    ...source,
    summary: safeSummary,
    experience: safeExperience,
    projects: safeProjects,
  };
}

function extractJsonObject(raw: string): string {
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return raw;
  }

  return raw.slice(firstBrace, lastBrace + 1);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ResumeData> & {
    targetJD?: string;
  };

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "ResumeData payload is required." }, { status: 400 });
  }

  const { targetJD: rawTargetJD, ...resumePayload } = body;
  const targetJD = cleanString(rawTargetJD);
  const resumeData = resumePayload as ResumeData;

  if (!resumeData.fullName && !resumeData.summary) {
    return NextResponse.json(
      { error: "Resume content is too empty to enhance." },
      { status: 400 },
    );
  }

  if (!openai) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not configured." },
      { status: 500 },
    );
  }

  let rawModelText = "";
  let lastErrorMessage: string | null = null;

  for (const model of openRouterModelCandidates) {
    try {
      const systemPrompt = targetJD
        ? "You are an expert resume tailor, technical recruiter, and ATS specialist. Aggressively rewrite the candidate's summary, each experience.description, and each projects.description so they are tailored to the provided target job description. Naturally embed relevant JD keywords, required skills, tools, and responsibilities while preserving the candidate's original truth, chronology, and metrics. Do not fabricate employers, roles, technologies, dates, or outcomes. Keep content professional, high-impact, concise, and ATS-optimized. Preserve all original IDs and structural shape. Return ONLY valid raw JSON matching the exact same ResumeData schema keys."
        : "You are an expert technical recruiter and resume writer. Rewrite and improve the candidate's summary, each experience.description, and each projects.description to be highly professional, impactful, ATS-optimized, and concise. Use strong action verbs and metric-driven statements where possible. Preserve all original IDs and structural shape. Return ONLY valid raw JSON matching the exact same ResumeData schema keys.";

      const userPrompt = targetJD
        ? `Tailor this ResumeData object specifically to the target job description and return the same JSON structure only.\n\nTarget Job Description:\n${targetJD.slice(0, 12000)}\n\nResumeData:\n${JSON.stringify(
            resumeData,
          )}`
        : `Enhance this ResumeData object and return the same JSON structure only:\n\n${JSON.stringify(
            resumeData,
          )}`;

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.3,
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
    console.error("Resume enhancement failed:", lastErrorMessage);
    return NextResponse.json(
      { error: "AI enhancement service is temporarily unavailable." },
      { status: 502 },
    );
  }

  try {
    const parsed = JSON.parse(extractJsonObject(rawModelText)) as Partial<ResumeData>;
    const enhanced = sanitizeEnhancedResume(resumeData, parsed);
    return NextResponse.json(enhanced);
  } catch (error) {
    console.error("Resume enhancement JSON parse failed:", error);
    return NextResponse.json(
      { error: "Failed to parse AI-enhanced resume JSON." },
      { status: 500 },
    );
  }
}

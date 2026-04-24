import {
  AtsResumeAnalysis,
  DashboardTurnRequest,
  DashboardTurnResponse,
} from "./dashboard-contracts";
import type { ResumeData } from "./resume-builder-contracts";

export async function postDashboardTurn(
  payload: DashboardTurnRequest,
): Promise<DashboardTurnResponse> {
  const response = await fetch("/api/dashboard/respond", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to send message.");
  }

  return (await response.json()) as DashboardTurnResponse;
}

export async function analyzeResume(
  resumeText: string,
  jobDescription?: string,
): Promise<AtsResumeAnalysis> {
  const response = await fetch("/api/analyze-resume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ resumeText, jobDescription }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to analyze resume (${response.status} ${response.statusText}): ${errorText}`,
    );
  }

  return (await response.json()) as AtsResumeAnalysis;
}

export async function enhanceResumeData(
  data: ResumeData,
  targetJD?: string,
): Promise<ResumeData> {
  const response = await fetch("/api/enhance-resume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data, targetJD }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to enhance resume (${response.status} ${response.statusText}): ${errorText}`,
    );
  }

  return (await response.json()) as ResumeData;
}

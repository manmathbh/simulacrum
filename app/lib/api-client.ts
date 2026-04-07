import {
  AtsResumeAnalysis,
  DashboardTurnRequest,
  DashboardTurnResponse,
} from "./dashboard-contracts";

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
): Promise<AtsResumeAnalysis> {
  const response = await fetch("/api/analyze-resume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ resumeText }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to analyze resume (${response.status} ${response.statusText}): ${errorText}`,
    );
  }

  return (await response.json()) as AtsResumeAnalysis;
}

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
}

export interface SendChatMessageRequest {
  content: string;
}

export interface DashboardTurnRequest {
  message: SendChatMessageRequest;
  resumeText?: string;
}

export interface ResumeUploadResponse {
  text: string;
}

export interface AnalyzeResumeRequest {
  resumeText: string;
}

export interface AtsResumeAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
}

export interface SendChatMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export type FeedbackMetricKey =
  | "confidence"
  | "clarity"
  | "tone"
  | "grammar";

export interface FeedbackMetric {
  key: FeedbackMetricKey;
  label: string;
  score: number;
  status: "strong" | "good" | "needs-work" | "pending";
}

export interface FeedbackSnapshot {
  metrics: FeedbackMetric[];
  compositeScore: number;
  coachingCue: string;
  updatedAt: string;
}

export interface FeedbackSnapshotResponse {
  snapshot: FeedbackSnapshot;
}

export interface DashboardTurnResponse {
  chat: SendChatMessageResponse;
  feedback: FeedbackSnapshotResponse;
}

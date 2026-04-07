import { ChatMessage, FeedbackSnapshot } from "./dashboard-contracts";

export const mockChatMessages: ChatMessage[] = [
  {
    id: "m-1",
    role: "assistant",
    content: "Welcome. Tell me about yourself in under 60 seconds.",
    createdAt: "2026-04-04T10:00:00.000Z",
  },
  {
    id: "m-2",
    role: "user",
    content: "I am a product-focused engineer with 4 years of startup experience.",
    createdAt: "2026-04-04T10:00:08.000Z",
  },
];

export const mockFeedbackSnapshot: FeedbackSnapshot = {
  metrics: [
    { key: "confidence", label: "Confidence", score: 72, status: "good" },
    { key: "clarity", label: "Clarity", score: 68, status: "needs-work" },
    { key: "tone", label: "Tone", score: 74, status: "good" },
    { key: "grammar", label: "Grammar", score: 81, status: "strong" },
  ],
  compositeScore: 74,
  coachingCue:
    "Trim filler words and land your impact statement in one concise sentence.",
  updatedAt: "2026-04-04T10:00:12.000Z",
};

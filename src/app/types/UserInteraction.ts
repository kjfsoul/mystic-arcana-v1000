export type UserInteraction = {
  id: string;
  type: "prompt" | "summary" | "feedback";
  timestamp: Date;
  readerId: string;
  sessionTag: string;
  promptType?: string;
  promptContent?: string;
  summary?: string; // Added for 1-word summary
  // Add other interaction-specific fields
};

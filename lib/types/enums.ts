export const INTERACTION_TYPES = [
  "meeting",
  "call",
  "email",
  "message",
  "note",
] as const;
export type InteractionType = (typeof INTERACTION_TYPES)[number];

export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

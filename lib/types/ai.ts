import { z } from "zod";

export const followUpSuggestionSchema = z.object({
  title: z.string(),
  due_date: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  contact_id: z.string().uuid(),
  reasoning: z.string(),
});

export const suggestFollowUpsResponseSchema = z.object({
  suggestions: z.array(followUpSuggestionSchema).max(5),
});

export type FollowUpSuggestion = z.infer<typeof followUpSuggestionSchema>;
export type SuggestFollowUpsResponse = z.infer<
  typeof suggestFollowUpsResponseSchema
>;

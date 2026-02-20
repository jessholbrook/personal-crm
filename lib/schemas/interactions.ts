import { z } from "zod";
import { INTERACTION_TYPES } from "@/lib/types/enums";

export const interactionSchema = z.object({
  type: z.enum(INTERACTION_TYPES),
  title: z.string().max(200).optional(),
  content: z.string().max(10000).optional(),
  occurred_at: z.string().min(1, "Date is required"),
  contact_ids: z.array(z.string().uuid()).min(1, "Select at least one contact"),
});

export type InteractionFormData = z.infer<typeof interactionSchema>;

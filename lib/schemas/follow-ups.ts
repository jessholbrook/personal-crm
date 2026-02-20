import { z } from "zod";
import { PRIORITIES } from "@/lib/types/enums";

export const followUpSchema = z.object({
  contact_id: z.string().uuid("Select a contact"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  due_date: z.string().min(1, "Due date is required"),
  priority: z.enum(PRIORITIES),
});

export type FollowUpFormData = z.infer<typeof followUpSchema>;

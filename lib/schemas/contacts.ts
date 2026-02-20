import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email").max(200).or(z.literal("")).optional(),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  title: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

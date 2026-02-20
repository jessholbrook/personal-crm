import { z } from "zod";

export const CONTACT_FIELDS = [
  "name",
  "email",
  "company",
  "title",
] as const;

export const DATE_FIELDS = [
  "occurred_at",
  "created_at",
  "due_date",
] as const;

const textFilterSchema = z.object({
  kind: z.literal("text"),
  field: z.enum(CONTACT_FIELDS),
  operator: z.enum(["eq", "ilike", "neq"]),
  value: z.string(),
});

const dateFilterSchema = z.object({
  kind: z.literal("date"),
  field: z.enum(DATE_FIELDS),
  operator: z.enum(["gte", "lte", "eq"]),
  value: z.string(),
});

export const searchFilterSchema = z.discriminatedUnion("kind", [
  textFilterSchema,
  dateFilterSchema,
]);

export const searchQuerySchema = z.object({
  table: z.enum(["contacts", "interactions", "follow_ups"]),
  filters: z.array(searchFilterSchema),
  limit: z.number().int().min(1).max(50).default(20),
});

export type SearchFilter = z.infer<typeof searchFilterSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;

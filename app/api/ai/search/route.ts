import { createClient } from "@/lib/supabase/server";
import { anthropic, MODEL } from "@/lib/ai/client";
import { SEARCH_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { searchQuerySchema } from "@/lib/types/search";
import type { SearchQuery } from "@/lib/types/search";

export async function POST(request: Request) {
  const { query } = await request.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  // Ask Claude to translate NL → structured query
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: [
      {
        type: "text",
        text: SEARCH_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Today's date: ${today}\n\nSearch query: ${query}`,
      },
    ],
  });

  const text =
    message.content[0]?.type === "text" ? message.content[0].text : "";

  // Validate the structured query
  let searchQuery: SearchQuery;
  try {
    const parsed = JSON.parse(text);
    searchQuery = searchQuerySchema.parse(parsed);
  } catch {
    return Response.json(
      { error: "Could not understand search query. Try rephrasing." },
      { status: 422 }
    );
  }

  // Execute the validated query against Supabase
  let dbQuery = supabase
    .from(searchQuery.table)
    .select("*")
    .limit(searchQuery.limit);

  for (const filter of searchQuery.filters) {
    if (filter.kind === "text") {
      switch (filter.operator) {
        case "eq":
          dbQuery = dbQuery.eq(filter.field, filter.value);
          break;
        case "neq":
          dbQuery = dbQuery.neq(filter.field, filter.value);
          break;
        case "ilike":
          dbQuery = dbQuery.ilike(filter.field, `%${filter.value}%`);
          break;
      }
    } else {
      switch (filter.operator) {
        case "eq":
          dbQuery = dbQuery.eq(filter.field, filter.value);
          break;
        case "gte":
          dbQuery = dbQuery.gte(filter.field, filter.value);
          break;
        case "lte":
          dbQuery = dbQuery.lte(filter.field, filter.value);
          break;
      }
    }
  }

  const { data, error } = await dbQuery;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    table: searchQuery.table,
    filters: searchQuery.filters,
    results: data ?? [],
  });
}

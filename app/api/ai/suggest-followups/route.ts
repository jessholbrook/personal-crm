import { createClient } from "@/lib/supabase/server";
import { anthropic, MODEL } from "@/lib/ai/client";
import { SUGGEST_FOLLOWUPS_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { suggestFollowUpsResponseSchema } from "@/lib/types/ai";

export async function POST(request: Request) {
  const { contactId } = await request.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .single();

  if (!contact) return new Response("Contact not found", { status: 404 });

  // Get recent interactions
  const { data: junctions } = await supabase
    .from("interaction_contacts")
    .select("interaction_id")
    .eq("contact_id", contactId);

  const interactionIds =
    junctions?.map((j: { interaction_id: string }) => j.interaction_id) ?? [];

  let interactions: Array<{
    type: string;
    title: string | null;
    content: string | null;
    occurred_at: string;
  }> = [];
  if (interactionIds.length > 0) {
    const { data } = await supabase
      .from("interactions")
      .select("type, title, content, occurred_at")
      .in("id", interactionIds)
      .order("occurred_at", { ascending: false })
      .limit(20);
    interactions = data ?? [];
  }

  // Get open follow-ups
  const { data: openFollowUps } = await supabase
    .from("follow_ups")
    .select("title, due_date, priority")
    .eq("contact_id", contactId)
    .is("completed_at", null);

  const today = new Date().toISOString().split("T")[0];

  const interactionText =
    interactions.length > 0
      ? interactions
          .map(
            (i) =>
              `[${i.occurred_at}] ${i.type}: ${i.title ?? ""} ${(i.content ?? "").slice(0, 500)}`
          )
          .join("\n")
      : "No interactions recorded.";

  const followUpText =
    openFollowUps && openFollowUps.length > 0
      ? openFollowUps
          .map(
            (f: { title: string; due_date: string; priority: string }) =>
              `- ${f.title} (due ${f.due_date}, ${f.priority})`
          )
          .join("\n")
      : "None";

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SUGGEST_FOLLOWUPS_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Today: ${today}\nContact: ${contact.name} (ID: ${contact.id})${contact.company ? ` at ${contact.company}` : ""}\n\nRecent interactions:\n${interactionText}\n\nOpen follow-ups:\n${followUpText}`,
      },
    ],
  });

  const text =
    message.content[0]?.type === "text" ? message.content[0].text : "";

  // Parse and validate
  try {
    const parsed = JSON.parse(text);
    const validated = suggestFollowUpsResponseSchema.parse(parsed);
    return Response.json(validated);
  } catch {
    return Response.json(
      { error: "Failed to parse AI response" },
      { status: 502 }
    );
  }
}

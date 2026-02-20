import { createClient } from "@/lib/supabase/server";
import { anthropic, MODEL } from "@/lib/ai/client";
import { CONVERSATION_PREP_SYSTEM_PROMPT } from "@/lib/ai/prompts";

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

  // Get last 5 interactions
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
      .limit(5);
    interactions = data ?? [];
  }

  // Get open follow-ups
  const { data: openFollowUps } = await supabase
    .from("follow_ups")
    .select("title, due_date, priority")
    .eq("contact_id", contactId)
    .is("completed_at", null);

  // Get tags
  const { data: tagJunctions } = await supabase
    .from("contact_tags")
    .select("tag_id")
    .eq("contact_id", contactId);

  const tagIds =
    tagJunctions?.map((t: { tag_id: string }) => t.tag_id) ?? [];
  let tags: Array<{ name: string }> = [];
  if (tagIds.length > 0) {
    const { data } = await supabase
      .from("tags")
      .select("name")
      .in("id", tagIds);
    tags = data ?? [];
  }

  const interactionText =
    interactions.length > 0
      ? interactions
          .map(
            (i) =>
              `[${i.occurred_at}] ${i.type}: ${i.title ?? ""}\n${(i.content ?? "").slice(0, 1000)}`
          )
          .join("\n\n")
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

  const tagText =
    tags.length > 0 ? tags.map((t) => t.name).join(", ") : "None";

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: CONVERSATION_PREP_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Contact: ${contact.name}${contact.company ? ` at ${contact.company}` : ""}${contact.title ? ` (${contact.title})` : ""}\nEmail: ${contact.email ?? "N/A"}\nPhone: ${contact.phone ?? "N/A"}\nNotes: ${contact.notes ?? "None"}\nTags: ${tagText}\n\nRecent interactions:\n${interactionText}\n\nOpen follow-ups:\n${followUpText}`,
      },
    ],
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(new TextEncoder().encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

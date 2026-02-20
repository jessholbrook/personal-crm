import { createClient } from "@/lib/supabase/server";
import { anthropic, MODEL } from "@/lib/ai/client";
import { SUMMARIZE_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  const { contactId } = await request.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // Get contact + interactions
  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .single();

  if (!contact) return new Response("Contact not found", { status: 404 });

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
      .limit(50);
    interactions = data ?? [];
  }

  if (interactions.length === 0) {
    return Response.json({
      summary: "No interactions recorded yet for this contact.",
    });
  }

  // Truncate content to stay within limits
  const interactionText = interactions
    .map(
      (i) =>
        `[${i.occurred_at}] ${i.type}: ${i.title ?? ""} ${(i.content ?? "").slice(0, 2000)}`
    )
    .join("\n")
    .slice(0, 50000);

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SUMMARIZE_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Contact: ${contact.name}${contact.company ? ` at ${contact.company}` : ""}${contact.title ? ` (${contact.title})` : ""}\n\nInteraction history:\n${interactionText}`,
      },
    ],
  });

  // Convert to ReadableStream for Next.js
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

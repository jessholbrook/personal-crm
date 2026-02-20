"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { interactionSchema } from "@/lib/schemas/interactions";
import type { ActionResult } from "@/lib/types/actions";

export async function createInteraction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const raw = {
    type: formData.get("type"),
    title: formData.get("title"),
    content: formData.get("content"),
    occurred_at: formData.get("occurred_at"),
    contact_ids: formData.getAll("contact_ids"),
  };

  const parsed = interactionSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid form data",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "Not authenticated" };

  const { data, error } = await supabase
    .from("interactions")
    .insert({
      user_id: user.id,
      type: parsed.data.type,
      title: parsed.data.title || null,
      content: parsed.data.content || null,
      occurred_at: parsed.data.occurred_at,
    })
    .select("id")
    .single();

  if (error) return { status: "error", message: error.message };

  // Insert junction records
  const junctions = parsed.data.contact_ids.map((contactId) => ({
    interaction_id: data.id,
    contact_id: contactId,
    user_id: user.id,
  }));

  const { error: junctionError } = await supabase
    .from("interaction_contacts")
    .insert(junctions);

  if (junctionError) return { status: "error", message: junctionError.message };

  revalidatePath("/interactions");
  revalidatePath("/contacts");
  revalidatePath("/");
  return { status: "success", data: { id: data.id } };
}

export async function updateInteraction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    type: formData.get("type"),
    title: formData.get("title"),
    content: formData.get("content"),
    occurred_at: formData.get("occurred_at"),
    contact_ids: formData.getAll("contact_ids"),
  };

  const parsed = interactionSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid form data",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "Not authenticated" };

  const { error } = await supabase
    .from("interactions")
    .update({
      type: parsed.data.type,
      title: parsed.data.title || null,
      content: parsed.data.content || null,
      occurred_at: parsed.data.occurred_at,
    })
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  // Replace junction records
  await supabase
    .from("interaction_contacts")
    .delete()
    .eq("interaction_id", id);

  const junctions = parsed.data.contact_ids.map((contactId) => ({
    interaction_id: id,
    contact_id: contactId,
    user_id: user.id,
  }));

  const { error: junctionError } = await supabase
    .from("interaction_contacts")
    .insert(junctions);

  if (junctionError) return { status: "error", message: junctionError.message };

  revalidatePath("/interactions");
  revalidatePath(`/interactions/${id}`);
  revalidatePath("/contacts");
  revalidatePath("/");
  return { status: "success", data: undefined };
}

export async function deleteInteraction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("interactions").delete().eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/interactions");
  revalidatePath("/contacts");
  revalidatePath("/");
  return { status: "success", data: undefined };
}

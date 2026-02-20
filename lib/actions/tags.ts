"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { tagSchema } from "@/lib/schemas/tags";
import type { ActionResult } from "@/lib/types/actions";

export async function createTag(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const raw = Object.fromEntries(formData);
  const parsed = tagSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid form data",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "Not authenticated" };

  const { data, error } = await supabase
    .from("tags")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      color: parsed.data.color || null,
    })
    .select("id")
    .single();

  if (error) return { status: "error", message: error.message };

  revalidatePath("/contacts");
  return { status: "success", data: { id: data.id } };
}

export async function deleteTag(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/contacts");
  return { status: "success", data: undefined };
}

export async function assignTag(
  contactId: string,
  tagId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "Not authenticated" };

  const { error } = await supabase.from("contact_tags").insert({
    contact_id: contactId,
    tag_id: tagId,
    user_id: user.id,
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/contacts");
  return { status: "success", data: undefined };
}

export async function removeTag(
  contactId: string,
  tagId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_tags")
    .delete()
    .eq("contact_id", contactId)
    .eq("tag_id", tagId);

  if (error) return { status: "error", message: error.message };

  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/contacts");
  return { status: "success", data: undefined };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { followUpSchema } from "@/lib/schemas/follow-ups";
import type { ActionResult } from "@/lib/types/actions";

export async function createFollowUp(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const raw = Object.fromEntries(formData);
  const parsed = followUpSchema.safeParse(raw);

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
    .from("follow_ups")
    .insert({
      user_id: user.id,
      contact_id: parsed.data.contact_id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      due_date: parsed.data.due_date,
      priority: parsed.data.priority,
    })
    .select("id")
    .single();

  if (error) return { status: "error", message: error.message };

  revalidatePath("/follow-ups");
  revalidatePath(`/contacts/${parsed.data.contact_id}`);
  revalidatePath("/");
  return { status: "success", data: { id: data.id } };
}

export async function updateFollowUp(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = followUpSchema.safeParse(raw);

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
  const { error } = await supabase
    .from("follow_ups")
    .update({
      contact_id: parsed.data.contact_id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      due_date: parsed.data.due_date,
      priority: parsed.data.priority,
    })
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/follow-ups");
  revalidatePath(`/follow-ups/${id}`);
  revalidatePath(`/contacts/${parsed.data.contact_id}`);
  revalidatePath("/");
  return { status: "success", data: undefined };
}

export async function completeFollowUp(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("follow_ups")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/follow-ups");
  revalidatePath(`/follow-ups/${id}`);
  revalidatePath("/");
  return { status: "success", data: undefined };
}

export async function deleteFollowUp(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("follow_ups").delete().eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/follow-ups");
  revalidatePath("/");
  return { status: "success", data: undefined };
}

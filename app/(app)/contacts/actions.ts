"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { contactSchema } from "@/lib/schemas/contacts";
import type { ActionResult } from "@/lib/types/actions";

export async function createContact(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const raw = Object.fromEntries(formData);
  const parsed = contactSchema.safeParse(raw);

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
    .from("contacts")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      title: parsed.data.title || null,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (error) return { status: "error", message: error.message };

  revalidatePath("/contacts");
  revalidatePath("/");
  return { status: "success", data: { id: data.id } };
}

export async function updateContact(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid form data",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contacts")
    .update({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      title: parsed.data.title || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  revalidatePath("/");
  return { status: "success", data: undefined };
}

export async function deleteContact(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/contacts");
  revalidatePath("/");
  return { status: "success", data: undefined };
}

import type { DbClient } from "@/lib/types/database";
import type { FollowUp } from "@/lib/types/models";

// Joined type for follow-ups with contact name
export type FollowUpWithContact = FollowUp & {
  contacts: { id: string; name: string } | null;
};

export async function getFollowUps(
  supabase: DbClient,
  options?: { completed?: boolean }
) {
  let query = supabase
    .from("follow_ups")
    .select("*, contacts(id, name)")
    .order("due_date");

  if (options?.completed === false) {
    query = query.is("completed_at", null);
  } else if (options?.completed === true) {
    query = query.not("completed_at", "is", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as FollowUpWithContact[];
}

export async function getDueFollowUps(supabase: DbClient) {
  const { data, error } = await supabase
    .from("follow_ups")
    .select("*, contacts(id, name)")
    .is("completed_at", null)
    .order("due_date");

  if (error) throw error;
  return (data ?? []) as unknown as FollowUpWithContact[];
}

export async function getFollowUpById(supabase: DbClient, id: string) {
  const { data, error } = await supabase
    .from("follow_ups")
    .select("*, contacts(id, name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as FollowUpWithContact;
}

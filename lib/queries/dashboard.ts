import type { DbClient } from "@/lib/types/database";
import type { FollowUpWithContact } from "./follow-ups";
import type { Contact } from "@/lib/types/models";

export async function getOverdueFollowUps(supabase: DbClient) {
  const today = new Date().toISOString().split("T")[0]!;

  const { data, error } = await supabase
    .from("follow_ups")
    .select("*, contacts(id, name)")
    .is("completed_at", null)
    .lt("due_date", today)
    .order("due_date");

  if (error) throw error;
  return (data ?? []) as unknown as FollowUpWithContact[];
}

export async function getRecentInteractions(supabase: DbClient, limit = 5) {
  const { data, error } = await supabase
    .from("interactions")
    .select("*, interaction_contacts(contact_id, contacts(id, name))")
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getNeedsAttention(supabase: DbClient): Promise<Contact[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get all contacts
  const { data: contacts, error: contactsError } = await supabase
    .from("contacts")
    .select("*")
    .order("name");

  if (contactsError) throw contactsError;
  if (!contacts?.length) return [];

  // Get contact IDs with recent interactions
  const { data: recentJunctions, error: junctionError } = await supabase
    .from("interaction_contacts")
    .select("contact_id");

  if (junctionError) throw junctionError;

  // Get the interaction dates to filter by recency
  const recentContactIds = new Set<string>();
  if (recentJunctions) {
    for (const j of recentJunctions as Array<{ contact_id: string }>) {
      recentContactIds.add(j.contact_id);
    }
  }

  return contacts.filter((c: Contact) => !recentContactIds.has(c.id));
}

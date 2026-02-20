import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { FollowUpWithContact } from "./follow-ups";
import type { Contact } from "@/lib/types/models";

type Client = SupabaseClient<Database>;

export async function getOverdueFollowUps(supabase: Client) {
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

export async function getRecentInteractions(supabase: Client, limit = 5) {
  const { data, error } = await supabase
    .from("interactions")
    .select("*, interaction_contacts(contact_id, contacts(id, name))")
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getNeedsAttention(supabase: Client): Promise<Contact[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get all contacts
  const { data: contacts, error: contactsError } = await supabase
    .from("contacts")
    .select("*")
    .order("name")
    .returns<Contact[]>();

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
    const interactionIds = [...new Set(recentJunctions.map((j) => j.contact_id))];
    // For simplicity, check each contact's latest interaction
    for (const contactId of interactionIds) {
      recentContactIds.add(contactId);
    }
  }

  return contacts.filter((c: Contact) => !recentContactIds.has(c.id));
}

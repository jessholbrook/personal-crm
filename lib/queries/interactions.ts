import type { DbClient } from "@/lib/types/database";
import type { Interaction } from "@/lib/types/models";

// Joined type for interactions with their contacts
type InteractionWithContacts = Interaction & {
  interaction_contacts: Array<{
    contact_id: string;
    contacts: { id: string; name: string } | null;
  }>;
};

export async function getInteractions(
  supabase: DbClient,
  options?: { type?: string; limit?: number }
) {
  let query = supabase
    .from("interactions")
    .select("*, interaction_contacts(contact_id, contacts(id, name))")
    .order("occurred_at", { ascending: false });

  if (options?.type) {
    query = query.eq("type", options.type);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as InteractionWithContacts[];
}

export async function getInteractionsByContact(
  supabase: DbClient,
  contactId: string
) {
  // Get interaction IDs for this contact, then fetch full interactions
  const { data: junctions, error: junctionError } = await supabase
    .from("interaction_contacts")
    .select("interaction_id")
    .eq("contact_id", contactId);

  if (junctionError) throw junctionError;

  const ids = junctions?.map((j: { interaction_id: string }) => j.interaction_id) ?? [];
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .in("id", ids)
    .order("occurred_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getInteractionById(supabase: DbClient, id: string) {
  const [interactionRes, contactsRes] = await Promise.all([
    supabase.from("interactions").select("*").eq("id", id).single(),
    supabase
      .from("interaction_contacts")
      .select("contact_id")
      .eq("interaction_id", id),
  ]);

  if (interactionRes.error) throw interactionRes.error;

  // Get contact names
  const contactIds = contactsRes.data?.map((ic: { contact_id: string }) => ic.contact_id) ?? [];
  const { data: contacts } = contactIds.length > 0
    ? await supabase.from("contacts").select("id, name").in("id", contactIds)
    : { data: [] };

  return {
    ...interactionRes.data,
    contacts: contacts ?? [],
  };
}

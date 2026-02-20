import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { Contact, FollowUp } from "@/lib/types/models";

type Client = SupabaseClient<Database>;

// Joined types for nested selects (until types are auto-generated)
type ContactWithTags = Contact & {
  contact_tags: Array<{ tag_id: string; tags: { id: string; name: string; color: string | null } | null }>;
};

export async function getContacts(
  supabase: Client,
  options?: { search?: string; tagId?: string }
) {
  let query = supabase
    .from("contacts")
    .select("*, contact_tags(tag_id, tags(id, name, color))")
    .order("name");

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,company.ilike.%${options.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const contacts = (data ?? []) as unknown as ContactWithTags[];

  if (options?.tagId) {
    return contacts.filter((contact) =>
      contact.contact_tags.some((ct) => ct.tag_id === options.tagId)
    );
  }

  return contacts;
}

export async function getContactById(supabase: Client, id: string) {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getContactWithDetails(supabase: Client, id: string) {
  const [contactRes, interactionsRes, followUpsRes, tagsRes] = await Promise.all([
    supabase.from("contacts").select("*").eq("id", id).single(),
    supabase
      .from("interactions")
      .select("*")
      .in(
        "id",
        // Subquery: get interaction IDs for this contact
        (await supabase
          .from("interaction_contacts")
          .select("interaction_id")
          .eq("contact_id", id)
        ).data?.map((ic) => ic.interaction_id) ?? []
      )
      .order("occurred_at", { ascending: false }),
    supabase
      .from("follow_ups")
      .select("*")
      .eq("contact_id", id)
      .order("due_date"),
    supabase
      .from("tags")
      .select("*")
      .in(
        "id",
        (await supabase
          .from("contact_tags")
          .select("tag_id")
          .eq("contact_id", id)
        ).data?.map((ct) => ct.tag_id) ?? []
      ),
  ]);

  if (contactRes.error) throw contactRes.error;

  return {
    contact: contactRes.data,
    interactions: interactionsRes.data ?? [],
    followUps: (followUpsRes.data ?? []) as FollowUp[],
    tags: tagsRes.data ?? [],
  };
}

export async function getContactCount(supabase: Client) {
  const { count, error } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  return count ?? 0;
}

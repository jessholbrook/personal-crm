import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type { Tag } from "@/lib/types/models";

type Client = SupabaseClient<Database>;

export async function getTags(supabase: Client) {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getTagsByContact(
  supabase: Client,
  contactId: string
): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("contact_tags")
    .select("tag_id")
    .eq("contact_id", contactId);

  if (error) throw error;

  const tagIds = data?.map((ct) => ct.tag_id) ?? [];
  if (tagIds.length === 0) return [];

  const { data: tags, error: tagsError } = await supabase
    .from("tags")
    .select("*")
    .in("id", tagIds)
    .order("name")
    .returns<Tag[]>();

  if (tagsError) throw tagsError;
  return tags ?? [];
}

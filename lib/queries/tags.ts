import type { DbClient } from "@/lib/types/database";
import type { Tag } from "@/lib/types/models";

export async function getTags(supabase: DbClient) {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getTagsByContact(
  supabase: DbClient,
  contactId: string
): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("contact_tags")
    .select("tag_id")
    .eq("contact_id", contactId);

  if (error) throw error;

  const tagIds = data?.map((ct: { tag_id: string }) => ct.tag_id) ?? [];
  if (tagIds.length === 0) return [];

  const { data: tags, error: tagsError } = await supabase
    .from("tags")
    .select("*")
    .in("id", tagIds)
    .order("name");

  if (tagsError) throw tagsError;
  return (tags ?? []) as Tag[];
}

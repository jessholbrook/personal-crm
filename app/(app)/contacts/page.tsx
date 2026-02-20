import { createClient } from "@/lib/supabase/server";
import { getContacts } from "@/lib/queries/contacts";
import { getTags } from "@/lib/queries/tags";
import { ContactCard } from "@/components/contacts/contact-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ContactsToolbar } from "./contacts-toolbar";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [contacts, tags] = await Promise.all([
    getContacts(supabase, { search: params.q, tagId: params.tag }),
    getTags(supabase),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Contacts</h1>
      </div>

      <ContactsToolbar tags={tags} />

      {contacts.length === 0 ? (
        <EmptyState
          title="No contacts yet"
          description={
            params.q || params.tag
              ? "No contacts match your filters. Try adjusting your search."
              : "Add your first contact to start building your personal CRM."
          }
          actionLabel={!params.q && !params.tag ? "Add Contact" : undefined}
          actionHref={!params.q && !params.tag ? "/contacts/new" : undefined}
        />
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  );
}

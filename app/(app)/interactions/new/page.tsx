import { createClient } from "@/lib/supabase/server";
import { getContacts } from "@/lib/queries/contacts";
import { InteractionForm } from "@/components/interactions/interaction-form";

export default async function NewInteractionPage({
  searchParams,
}: {
  searchParams: Promise<{ contact?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const contacts = await getContacts(supabase);

  const defaultContactIds = params.contact ? [params.contact] : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Log Interaction</h1>
      <InteractionForm
        mode="create"
        contacts={contacts.map((c) => ({ id: c.id, name: c.name }))}
        defaultContactIds={defaultContactIds}
      />
    </div>
  );
}

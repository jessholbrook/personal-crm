import { createClient } from "@/lib/supabase/server";
import { getContacts } from "@/lib/queries/contacts";
import { FollowUpForm } from "@/components/follow-ups/follow-up-form";

export default async function NewFollowUpPage({
  searchParams,
}: {
  searchParams: Promise<{ contact?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const contacts = await getContacts(supabase);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-serif text-2xl font-semibold">New Follow-up</h1>
      <FollowUpForm
        mode="create"
        contacts={contacts.map((c) => ({ id: c.id, name: c.name }))}
        defaultContactId={params.contact}
      />
    </div>
  );
}

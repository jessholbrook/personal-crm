import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getContactById } from "@/lib/queries/contacts";
import { ContactForm } from "@/components/contacts/contact-form";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  let contact;
  try {
    contact = await getContactById(supabase, id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Edit Contact</h1>
      <ContactForm mode="edit" contact={contact} />
    </div>
  );
}

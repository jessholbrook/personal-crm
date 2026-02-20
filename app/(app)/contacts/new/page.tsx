import { ContactForm } from "@/components/contacts/contact-form";

export default function NewContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-serif text-2xl font-semibold">New Contact</h1>
      <ContactForm mode="create" />
    </div>
  );
}

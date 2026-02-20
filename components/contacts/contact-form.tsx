"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createContact, updateContact } from "@/app/(app)/contacts/actions";
import type { Contact } from "@/lib/types/models";
import type { ActionResult } from "@/lib/types/actions";

const initialState: ActionResult<{ id: string }> = {
  status: "success",
  data: { id: "" },
};

export function ContactForm({
  mode,
  contact,
}: {
  mode: "create" | "edit";
  contact?: Contact;
}) {
  const router = useRouter();

  const action = async (
    _prev: ActionResult<{ id: string }>,
    formData: FormData
  ) => {
    if (mode === "edit" && contact) {
      const result = await updateContact(contact.id, formData);
      if (result.status === "success") {
        return { status: "success" as const, data: { id: contact.id } };
      }
      return result as ActionResult<{ id: string }>;
    }
    return createContact(formData);
  };

  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success" && state.data.id && isPending === false) {
      if (mode === "create" && state.data.id !== "") {
        router.push(`/contacts/${state.data.id}`);
      } else if (mode === "edit" && contact) {
        router.push(`/contacts/${contact.id}`);
      }
    }
  }, [state, isPending, mode, contact, router]);

  const fieldErrors =
    state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={contact?.name ?? ""}
          placeholder="Jane Smith"
          required
        />
        {fieldErrors?.name && (
          <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={contact?.email ?? ""}
            placeholder="jane@example.com"
          />
          {fieldErrors?.email && (
            <p className="text-sm text-destructive">{fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={contact?.phone ?? ""}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            defaultValue={contact?.company ?? ""}
            placeholder="Acme Corp"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={contact?.title ?? ""}
            placeholder="Product Manager"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={contact?.notes ?? ""}
          placeholder="Add any notes about this contact..."
          rows={4}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Contact"
              : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

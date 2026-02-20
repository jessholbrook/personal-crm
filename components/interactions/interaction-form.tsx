"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createInteraction,
  updateInteraction,
} from "@/lib/actions/interactions";
import { INTERACTION_TYPES } from "@/lib/types/enums";
import type { Interaction, Contact } from "@/lib/types/models";
import type { ActionResult } from "@/lib/types/actions";

const TYPE_LABELS: Record<string, string> = {
  meeting: "Meeting",
  call: "Call",
  email: "Email",
  message: "Message",
  note: "Note",
};

const initialState: ActionResult<{ id: string }> = {
  status: "success",
  data: { id: "" },
};

export function InteractionForm({
  mode,
  interaction,
  contacts,
  defaultContactIds = [],
}: {
  mode: "create" | "edit";
  interaction?: Interaction & { contacts: Array<{ id: string; name: string }> };
  contacts: Array<Pick<Contact, "id" | "name">>;
  defaultContactIds?: string[];
}) {
  const router = useRouter();

  const existingContactIds =
    mode === "edit" && interaction
      ? interaction.contacts.map((c) => c.id)
      : defaultContactIds;

  const action = async (
    _prev: ActionResult<{ id: string }>,
    formData: FormData
  ) => {
    if (mode === "edit" && interaction) {
      const result = await updateInteraction(interaction.id, formData);
      if (result.status === "success") {
        return { status: "success" as const, data: { id: interaction.id } };
      }
      return result as ActionResult<{ id: string }>;
    }
    return createInteraction(formData);
  };

  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success" && state.data.id && !isPending) {
      if (mode === "create" && state.data.id !== "") {
        router.push(`/interactions/${state.data.id}`);
      } else if (mode === "edit" && interaction) {
        router.push(`/interactions/${interaction.id}`);
      }
    }
  }, [state, isPending, mode, interaction, router]);

  const fieldErrors =
    state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select
            name="type"
            defaultValue={interaction?.type ?? "meeting"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERACTION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {TYPE_LABELS[type] ?? type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors?.type && (
            <p className="text-sm text-destructive">{fieldErrors.type[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="occurred_at">Date *</Label>
          <Input
            id="occurred_at"
            name="occurred_at"
            type="date"
            defaultValue={
              interaction?.occurred_at?.split("T")[0] ??
              new Date().toISOString().split("T")[0]
            }
            required
          />
          {fieldErrors?.occurred_at && (
            <p className="text-sm text-destructive">
              {fieldErrors.occurred_at[0]}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={interaction?.title ?? ""}
          placeholder="Quick catch-up about project"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Notes</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={interaction?.content ?? ""}
          placeholder="What did you discuss?"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Contacts *</Label>
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-3">
          {contacts.map((contact) => (
            <label
              key={contact.id}
              className="flex items-center gap-2 rounded p-1 text-sm hover:bg-accent"
            >
              <input
                type="checkbox"
                name="contact_ids"
                value={contact.id}
                defaultChecked={existingContactIds.includes(contact.id)}
                className="rounded border-border"
              />
              {contact.name}
            </label>
          ))}
          {contacts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No contacts yet. Create a contact first.
            </p>
          )}
        </div>
        {fieldErrors?.contact_ids && (
          <p className="text-sm text-destructive">
            {fieldErrors.contact_ids[0]}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Log Interaction"
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

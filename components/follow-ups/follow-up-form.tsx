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
  createFollowUp,
  updateFollowUp,
} from "@/lib/actions/follow-ups";
import { PRIORITIES } from "@/lib/types/enums";
import type { FollowUp, Contact } from "@/lib/types/models";
import type { ActionResult } from "@/lib/types/actions";

const initialState: ActionResult<{ id: string }> = {
  status: "success",
  data: { id: "" },
};

export function FollowUpForm({
  mode,
  followUp,
  contacts,
  defaultContactId,
}: {
  mode: "create" | "edit";
  followUp?: FollowUp;
  contacts: Array<Pick<Contact, "id" | "name">>;
  defaultContactId?: string;
}) {
  const router = useRouter();

  const action = async (
    _prev: ActionResult<{ id: string }>,
    formData: FormData
  ) => {
    if (mode === "edit" && followUp) {
      const result = await updateFollowUp(followUp.id, formData);
      if (result.status === "success") {
        return { status: "success" as const, data: { id: followUp.id } };
      }
      return result as ActionResult<{ id: string }>;
    }
    return createFollowUp(formData);
  };

  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success" && state.data.id && !isPending) {
      if (mode === "create" && state.data.id !== "") {
        router.push("/follow-ups");
      } else if (mode === "edit" && followUp) {
        router.push(`/follow-ups/${followUp.id}`);
      }
    }
  }, [state, isPending, mode, followUp, router]);

  const fieldErrors =
    state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="contact_id">Contact *</Label>
        <Select
          name="contact_id"
          defaultValue={followUp?.contact_id ?? defaultContactId ?? ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a contact" />
          </SelectTrigger>
          <SelectContent>
            {contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors?.contact_id && (
          <p className="text-sm text-destructive">
            {fieldErrors.contact_id[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={followUp?.title ?? ""}
          placeholder="Check in about project proposal"
          required
        />
        {fieldErrors?.title && (
          <p className="text-sm text-destructive">{fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date *</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={
              followUp?.due_date?.split("T")[0] ??
              new Date().toISOString().split("T")[0]
            }
            required
          />
          {fieldErrors?.due_date && (
            <p className="text-sm text-destructive">
              {fieldErrors.due_date[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            name="priority"
            defaultValue={followUp?.priority ?? "medium"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p} className="capitalize">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={followUp?.description ?? ""}
          placeholder="What do you need to follow up on?"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Follow-up"
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

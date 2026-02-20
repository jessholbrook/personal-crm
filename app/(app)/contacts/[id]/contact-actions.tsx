"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteContact } from "@/app/(app)/contacts/actions";

export function ContactActions({
  contactId,
  contactName,
}: {
  contactId: string;
  contactName: string;
}) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteContact(contactId);
      if (result.status === "success") {
        router.push("/contacts");
      }
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => setShowDelete(true)}
      >
        Delete
      </Button>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete contact"
        description={`Are you sure you want to delete ${contactName}? This will also remove their interactions, follow-ups, and tags. This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  );
}

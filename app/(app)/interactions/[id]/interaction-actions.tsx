"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteInteraction } from "@/lib/actions/interactions";

export function InteractionActions({
  interactionId,
}: {
  interactionId: string;
}) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteInteraction(interactionId);
      if (result.status === "success") {
        router.push("/interactions");
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
        title="Delete interaction"
        description="Are you sure you want to delete this interaction? This action cannot be undone."
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  );
}

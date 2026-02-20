"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { completeFollowUp, deleteFollowUp } from "@/lib/actions/follow-ups";

export function FollowUpActions({
  followUpId,
  isCompleted,
}: {
  followUpId: string;
  isCompleted: boolean;
}) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    startTransition(async () => {
      await completeFollowUp(followUpId);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteFollowUp(followUpId);
      if (result.status === "success") {
        router.push("/follow-ups");
      }
    });
  }

  return (
    <div className="flex gap-2">
      {!isCompleted && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleComplete}
          disabled={isPending}
        >
          {isPending ? "Completing..." : "Mark Complete"}
        </Button>
      )}
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
        title="Delete follow-up"
        description="Are you sure you want to delete this follow-up? This action cannot be undone."
        onConfirm={handleDelete}
        loading={isPending}
      />
    </div>
  );
}

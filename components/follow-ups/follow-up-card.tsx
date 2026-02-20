"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { completeFollowUp } from "@/lib/actions/follow-ups";
import type { FollowUpWithContact } from "@/lib/queries/follow-ups";

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

export function FollowUpCard({
  followUp,
}: {
  followUp: FollowUpWithContact;
}) {
  const [isPending, startTransition] = useTransition();
  const isOverdue =
    !followUp.completed_at && new Date(followUp.due_date) < new Date();
  const isCompleted = !!followUp.completed_at;

  function handleComplete() {
    startTransition(async () => {
      await completeFollowUp(followUp.id);
    });
  }

  return (
    <Card
      className={`transition-colors ${isCompleted ? "opacity-60" : ""} ${isOverdue ? "border-destructive/50" : ""}`}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <button
          type="button"
          onClick={handleComplete}
          disabled={isPending || isCompleted}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            isCompleted
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground hover:border-primary"
          }`}
          aria-label={isCompleted ? "Completed" : "Mark as complete"}
        >
          {isCompleted && (
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        <Link
          href={`/follow-ups/${followUp.id}`}
          className="min-w-0 flex-1"
        >
          <p
            className={`font-medium ${isCompleted ? "line-through" : ""} text-foreground`}
          >
            {followUp.title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={isOverdue ? "font-medium text-destructive" : ""}
            >
              {isOverdue ? "Overdue: " : "Due "}
              {new Date(followUp.due_date).toLocaleDateString()}
            </span>
            {followUp.contacts && (
              <>
                <span>·</span>
                <span>{followUp.contacts.name}</span>
              </>
            )}
          </div>
        </Link>

        <Badge
          variant="secondary"
          className={`shrink-0 ${PRIORITY_COLORS[followUp.priority] ?? ""}`}
        >
          {followUp.priority}
        </Badge>
      </CardContent>
    </Card>
  );
}

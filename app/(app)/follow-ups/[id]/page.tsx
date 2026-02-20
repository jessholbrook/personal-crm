import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFollowUpById } from "@/lib/queries/follow-ups";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FollowUpActions } from "./follow-up-actions";

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

export default async function FollowUpDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  let followUp;
  try {
    followUp = await getFollowUpById(supabase, id);
  } catch {
    notFound();
  }

  const isOverdue =
    !followUp.completed_at && new Date(followUp.due_date) < new Date();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">
            {followUp.title}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant="secondary"
              className={PRIORITY_COLORS[followUp.priority] ?? ""}
            >
              {followUp.priority} priority
            </Badge>
            {followUp.completed_at ? (
              <Badge variant="outline" className="text-green-700">
                Completed
              </Badge>
            ) : isOverdue ? (
              <Badge variant="destructive">Overdue</Badge>
            ) : null}
          </div>
        </div>
        <FollowUpActions
          followUpId={id}
          isCompleted={!!followUp.completed_at}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Due Date</p>
            <p
              className={`text-sm ${isOverdue ? "font-medium text-destructive" : ""}`}
            >
              {new Date(followUp.due_date).toLocaleDateString()}
            </p>
          </div>

          {followUp.contacts && (
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <Link
                href={`/contacts/${followUp.contacts.id}`}
                className="text-sm text-primary hover:underline"
              >
                {followUp.contacts.name}
              </Link>
            </div>
          )}

          {followUp.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="whitespace-pre-wrap text-sm">
                {followUp.description}
              </p>
            </div>
          )}

          {followUp.completed_at && (
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-sm">
                {new Date(followUp.completed_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button asChild variant="outline" size="sm">
        <Link href="/follow-ups">Back to Follow-ups</Link>
      </Button>
    </div>
  );
}

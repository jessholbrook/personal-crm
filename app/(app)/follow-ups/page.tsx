import { createClient } from "@/lib/supabase/server";
import { getFollowUps } from "@/lib/queries/follow-ups";
import { FollowUpCard } from "@/components/follow-ups/follow-up-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function FollowUpsPage() {
  const supabase = await createClient();
  const [pending, completed] = await Promise.all([
    getFollowUps(supabase, { completed: false }),
    getFollowUps(supabase, { completed: true }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Follow-ups</h1>
        <Button asChild>
          <Link href="/follow-ups/new">New Follow-up</Link>
        </Button>
      </div>

      {pending.length === 0 && completed.length === 0 ? (
        <EmptyState
          title="No follow-ups yet"
          description="Schedule follow-ups with your contacts to stay on top of your relationships."
          actionLabel="New Follow-up"
          actionHref="/follow-ups/new"
        />
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Pending ({pending.length})
              </h2>
              {pending.map((fu) => (
                <FollowUpCard key={fu.id} followUp={fu} />
              ))}
            </div>
          )}

          {completed.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Completed ({completed.length})
              </h2>
              {completed.map((fu) => (
                <FollowUpCard key={fu.id} followUp={fu} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

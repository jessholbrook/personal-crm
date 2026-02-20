import { createClient } from "@/lib/supabase/server";
import { getInteractions } from "@/lib/queries/interactions";
import { InteractionCard } from "@/components/interactions/interaction-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function InteractionsPage() {
  const supabase = await createClient();
  const interactions = await getInteractions(supabase);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Interactions</h1>
        <Button asChild>
          <Link href="/interactions/new">Log Interaction</Link>
        </Button>
      </div>

      {interactions.length === 0 ? (
        <EmptyState
          title="No interactions yet"
          description="Log your first meeting, call, or email to start tracking your relationships."
          actionLabel="Log Interaction"
          actionHref="/interactions/new"
        />
      ) : (
        <div className="space-y-2">
          {interactions.map((interaction) => (
            <InteractionCard key={interaction.id} interaction={interaction} />
          ))}
        </div>
      )}
    </div>
  );
}

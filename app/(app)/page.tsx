import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getContactCount } from "@/lib/queries/contacts";
import {
  getOverdueFollowUps,
  getRecentInteractions,
  getNeedsAttention,
} from "@/lib/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NaturalLanguageSearch } from "@/components/ai/natural-language-search";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [overdueFollowUps, recentInteractions, needsAttention, contactCount] =
    await Promise.all([
      getOverdueFollowUps(supabase),
      getRecentInteractions(supabase, 5),
      getNeedsAttention(supabase),
      getContactCount(supabase),
    ]);

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl text-primary">Dashboard</h1>

      {/* AI Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <NaturalLanguageSearch />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Contacts
            </p>
            <p className="mt-1 text-2xl font-semibold">{contactCount}</p>
          </CardContent>
        </Card>
        <Card className={overdueFollowUps.length > 0 ? "border-destructive/50" : ""}>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Overdue Follow-ups
            </p>
            <p className={`mt-1 text-2xl font-semibold ${overdueFollowUps.length > 0 ? "text-destructive" : ""}`}>
              {overdueFollowUps.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Needs Attention
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {needsAttention.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overdue follow-ups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Overdue Follow-ups</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/follow-ups">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {overdueFollowUps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You're all caught up!
              </p>
            ) : (
              <div className="space-y-3">
                {overdueFollowUps.slice(0, 5).map((fu) => (
                  <Link
                    key={fu.id}
                    href={`/follow-ups/${fu.id}`}
                    className="block rounded-md p-2 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{fu.title}</p>
                        {fu.contacts && (
                          <p className="text-xs text-muted-foreground">
                            {fu.contacts.name}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-destructive">
                        {new Date(fu.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent interactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Interactions</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/interactions">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentInteractions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No interactions recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentInteractions.map(
                  (interaction: {
                    id: string;
                    type: string;
                    title: string | null;
                    occurred_at: string;
                    interaction_contacts: Array<{
                      contact_id: string;
                      contacts: { id: string; name: string } | null;
                    }>;
                  }) => {
                    const contacts = interaction.interaction_contacts
                      .map((ic) => ic.contacts)
                      .filter(
                        (c): c is NonNullable<typeof c> => c !== null
                      );
                    return (
                      <div
                        key={interaction.id}
                        className="flex items-start gap-3"
                      >
                        <Badge
                          variant="outline"
                          className="mt-0.5 shrink-0 text-xs capitalize"
                        >
                          {interaction.type}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          {interaction.title && (
                            <p className="truncate text-sm">
                              {interaction.title}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              interaction.occurred_at
                            ).toLocaleDateString()}
                            {contacts.length > 0 && (
                              <> · {contacts.map((c) => c.name).join(", ")}</>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Needs attention */}
        {needsAttention.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Needs Attention</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/contacts">View contacts</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-muted-foreground">
                Contacts with no recorded interactions
              </p>
              <div className="flex flex-wrap gap-2">
                {needsAttention.slice(0, 10).map((contact) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="rounded-full bg-muted px-3 py-1 text-sm transition-colors hover:bg-accent"
                  >
                    {contact.name}
                  </Link>
                ))}
                {needsAttention.length > 10 && (
                  <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                    +{needsAttention.length - 10} more
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getContactWithDetails } from "@/lib/queries/contacts";
import { getTags } from "@/lib/queries/tags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TagPicker } from "@/components/tags/tag-picker";
import { AiSummary } from "@/components/ai/ai-summary";
import { AiSuggestions } from "@/components/ai/ai-suggestions";
import { ConversationPrep } from "@/components/ai/conversation-prep";
import { ContactActions } from "./contact-actions";
import type { Tag } from "@/lib/types/models";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  let details;
  try {
    details = await getContactWithDetails(supabase, id);
  } catch {
    notFound();
  }

  const allTags = await getTags(supabase);
  const { contact, interactions, followUps, tags } = details;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">{contact.name}</h1>
          {(contact.title || contact.company) && (
            <p className="mt-1 text-muted-foreground">
              {[contact.title, contact.company].filter(Boolean).join(" at ")}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/contacts/${id}/edit`}>Edit</Link>
          </Button>
          <ContactActions contactId={id} contactName={contact.name} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="whitespace-pre-wrap text-sm">{contact.notes}</p>
                </div>
              )}
              {!contact.email && !contact.phone && !contact.notes && (
                <p className="text-sm text-muted-foreground">
                  No details added yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent interactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Interactions</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/interactions/new?contact=${id}`}>
                  + Add
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {interactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No interactions recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {interactions.slice(0, 5).map((interaction: { id: string; type: string; summary?: string; occurred_at: string }) => (
                    <div key={interaction.id} className="flex items-start gap-3">
                      <span className="mt-0.5 rounded bg-muted px-1.5 py-0.5 text-xs font-medium capitalize">
                        {interaction.type}
                      </span>
                      <div className="min-w-0 flex-1">
                        {interaction.summary && (
                          <p className="truncate text-sm">
                            {interaction.summary}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(interaction.occurred_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {interactions.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{interactions.length - 5} more
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Features */}
          <AiSummary contactId={id} />
          <ConversationPrep contactId={id} />
          <AiSuggestions contactId={id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <TagPicker
                contactId={id}
                assignedTags={tags as Tag[]}
                allTags={allTags as Tag[]}
              />
            </CardContent>
          </Card>

          {/* Follow-ups */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Follow-ups</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/follow-ups/new?contact=${id}`}>
                  + Add
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {followUps.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No follow-ups scheduled.
                </p>
              ) : (
                <div className="space-y-2">
                  {followUps
                    .filter((fu) => !fu.completed_at)
                    .slice(0, 5)
                    .map((followUp) => {
                      const isOverdue =
                        new Date(followUp.due_date) < new Date();
                      return (
                        <div key={followUp.id} className="text-sm">
                          <p className="font-medium">{followUp.title}</p>
                          <p
                            className={`text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}
                          >
                            Due{" "}
                            {new Date(followUp.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

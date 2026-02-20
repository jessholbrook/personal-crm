import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getInteractionById } from "@/lib/queries/interactions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractionActions } from "./interaction-actions";

const TYPE_LABELS: Record<string, string> = {
  meeting: "Meeting",
  call: "Call",
  email: "Email",
  message: "Message",
  note: "Note",
};

export default async function InteractionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  let interaction;
  try {
    interaction = await getInteractionById(supabase, id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="capitalize">
            {TYPE_LABELS[interaction.type] ?? interaction.type}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {new Date(interaction.occurred_at).toLocaleDateString()}
          </span>
        </div>
        <InteractionActions interactionId={id} />
      </div>

      {interaction.title && (
        <h1 className="font-serif text-2xl font-semibold">
          {interaction.title}
        </h1>
      )}

      {interaction.content && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{interaction.content}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">People</CardTitle>
        </CardHeader>
        <CardContent>
          {interaction.contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts linked.</p>
          ) : (
            <div className="space-y-2">
              {interaction.contacts.map(
                (contact: { id: string; name: string }) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="block text-sm text-primary hover:underline"
                  >
                    {contact.name}
                  </Link>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Button asChild variant="outline" size="sm">
        <Link href="/interactions">Back to Interactions</Link>
      </Button>
    </div>
  );
}

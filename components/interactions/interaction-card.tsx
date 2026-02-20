import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type InteractionWithContacts = {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  occurred_at: string;
  interaction_contacts: Array<{
    contact_id: string;
    contacts: { id: string; name: string } | null;
  }>;
};

const TYPE_LABELS: Record<string, string> = {
  meeting: "Meeting",
  call: "Call",
  email: "Email",
  message: "Message",
  note: "Note",
};

export function InteractionCard({
  interaction,
}: {
  interaction: InteractionWithContacts;
}) {
  const contacts = interaction.interaction_contacts
    .map((ic) => ic.contacts)
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <Link href={`/interactions/${interaction.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-start gap-4 p-4">
          <Badge variant="outline" className="mt-0.5 shrink-0 capitalize">
            {TYPE_LABELS[interaction.type] ?? interaction.type}
          </Badge>

          <div className="min-w-0 flex-1">
            {interaction.title && (
              <p className="truncate font-medium text-foreground">
                {interaction.title}
              </p>
            )}
            {interaction.content && !interaction.title && (
              <p className="truncate text-sm text-foreground">
                {interaction.content}
              </p>
            )}
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {new Date(interaction.occurred_at).toLocaleDateString()}
              </span>
              {contacts.length > 0 && (
                <>
                  <span>·</span>
                  <span className="truncate">
                    {contacts.map((c) => c.name).join(", ")}
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

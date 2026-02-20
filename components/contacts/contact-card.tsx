import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TagBadge } from "@/components/tags/tag-badge";
import type { Contact } from "@/lib/types/models";

type ContactWithTags = Contact & {
  contact_tags: Array<{
    tag_id: string;
    tags: { id: string; name: string; color: string | null } | null;
  }>;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ContactCard({ contact }: { contact: ContactWithTags }) {
  const tags = contact.contact_tags
    .map((ct) => ct.tags)
    .filter((t): t is NonNullable<typeof t> => t !== null);

  return (
    <Link href={`/contacts/${contact.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">
              {contact.name}
            </p>
            {(contact.title || contact.company) && (
              <p className="truncate text-sm text-muted-foreground">
                {[contact.title, contact.company].filter(Boolean).join(" at ")}
              </p>
            )}
          </div>

          {tags.length > 0 && (
            <div className="hidden gap-1 sm:flex">
              {tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

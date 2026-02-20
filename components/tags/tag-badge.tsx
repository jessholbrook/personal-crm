import { Badge } from "@/components/ui/badge";
import type { Tag } from "@/lib/types/models";

const TAG_COLORS: Record<string, string> = {
  red: "bg-red-100 text-red-800 hover:bg-red-200",
  blue: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  green: "bg-green-100 text-green-800 hover:bg-green-200",
  yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  purple: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  pink: "bg-pink-100 text-pink-800 hover:bg-pink-200",
  orange: "bg-orange-100 text-orange-800 hover:bg-orange-200",
};

export function TagBadge({
  tag,
  onRemove,
}: {
  tag: Pick<Tag, "id" | "name" | "color">;
  onRemove?: (tagId: string) => void;
}) {
  const colorClass = tag.color ? TAG_COLORS[tag.color] ?? "" : "";

  return (
    <Badge variant="secondary" className={colorClass}>
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(tag.id)}
          className="ml-1 inline-flex items-center hover:text-destructive"
          aria-label={`Remove ${tag.name}`}
        >
          ×
        </button>
      )}
    </Badge>
  );
}

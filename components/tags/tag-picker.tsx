"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagBadge } from "./tag-badge";
import { assignTag, removeTag, createTag } from "@/lib/actions/tags";
import type { Tag } from "@/lib/types/models";

export function TagPicker({
  contactId,
  assignedTags,
  allTags,
}: {
  contactId: string;
  assignedTags: Tag[];
  allTags: Tag[];
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isPending, startTransition] = useTransition();

  const availableTags = allTags.filter(
    (t) => !assignedTags.some((at) => at.id === t.id)
  );

  function handleAssign(tagId: string) {
    startTransition(async () => {
      await assignTag(contactId, tagId);
    });
  }

  function handleRemove(tagId: string) {
    startTransition(async () => {
      await removeTag(contactId, tagId);
    });
  }

  function handleCreateAndAssign() {
    if (!newTagName.trim()) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", newTagName.trim());
      const result = await createTag(formData);
      if (result.status === "success") {
        await assignTag(contactId, result.data.id);
        setNewTagName("");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {assignedTags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} onRemove={handleRemove} />
        ))}
        {assignedTags.length === 0 && (
          <span className="text-sm text-muted-foreground">No tags</span>
        )}
      </div>

      {showPicker ? (
        <div className="space-y-2 rounded-md border border-border p-3">
          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleAssign(tag.id)}
                  disabled={isPending}
                  className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs transition-colors hover:bg-accent"
                >
                  + {tag.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag name..."
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateAndAssign();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCreateAndAssign}
              disabled={isPending || !newTagName.trim()}
            >
              Add
            </Button>
          </div>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowPicker(false)}
            className="text-xs"
          >
            Done
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setShowPicker(true)}
          className="text-xs text-muted-foreground"
        >
          + Manage tags
        </Button>
      )}
    </div>
  );
}

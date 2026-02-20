"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { Tag } from "@/lib/types/models";

export function ContactsToolbar({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("q") ?? "";
  const currentTag = searchParams.get("tag") ?? "";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/contacts?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="Search contacts..."
        defaultValue={currentSearch}
        onChange={(e) => {
          const value = e.target.value;
          // Debounce: wait for user to stop typing
          const timeout = setTimeout(() => updateParams("q", value), 300);
          return () => clearTimeout(timeout);
        }}
        className="sm:max-w-xs"
      />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => updateParams("tag", "")}
            className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
              !currentTag
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() =>
                updateParams("tag", currentTag === tag.id ? "" : tag.id)
              }
              className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                currentTag === tag.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      <div className="sm:ml-auto">
        <Button asChild>
          <Link href="/contacts/new">Add Contact</Link>
        </Button>
      </div>
    </div>
  );
}

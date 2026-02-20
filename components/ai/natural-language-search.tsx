"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SearchResult = {
  table: string;
  filters: Array<{ kind: string; field: string; operator: string; value: string }>;
  results: Array<Record<string, string>>;
};

export function NaturalLanguageSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setResult(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Search failed. Try rephrasing your query.");
        return;
      }

      setResult(data);
    } catch {
      setError("Failed to connect to AI service. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function getResultLink(table: string, item: Record<string, string>) {
    switch (table) {
      case "contacts":
        return `/contacts/${item.id}`;
      case "interactions":
        return `/interactions/${item.id}`;
      case "follow_ups":
        return `/follow-ups/${item.id}`;
      default:
        return "#";
    }
  }

  function getResultLabel(table: string, item: Record<string, string>) {
    switch (table) {
      case "contacts":
        return item.name ?? item.email ?? "Contact";
      case "interactions":
        return item.title ?? `${item.type} on ${item.occurred_at}`;
      case "follow_ups":
        return item.title ?? "Follow-up";
      default:
        return "Result";
    }
  }

  const TABLE_LABELS: Record<string, string> = {
    contacts: "Contacts",
    interactions: "Interactions",
    follow_ups: "Follow-ups",
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "contacts at Acme" or "meetings last week"'
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">
              {TABLE_LABELS[result.table] ?? result.table}
            </Badge>
            <span>
              {result.results.length} result
              {result.results.length !== 1 ? "s" : ""}
            </span>
          </div>

          {result.results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No results found. Try a different search.
            </p>
          ) : (
            <div className="space-y-1">
              {result.results.map((item, i) => (
                <Link key={i} href={getResultLink(result.table, item)}>
                  <Card className="transition-colors hover:bg-accent/50">
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">
                        {getResultLabel(result.table, item)}
                      </p>
                      {result.table === "contacts" && item.company && (
                        <p className="text-xs text-muted-foreground">
                          {item.company}
                        </p>
                      )}
                      {result.table === "interactions" && item.occurred_at && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.occurred_at).toLocaleDateString()}
                        </p>
                      )}
                      {result.table === "follow_ups" && item.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Due {new Date(item.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

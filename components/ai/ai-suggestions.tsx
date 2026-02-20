"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFollowUp } from "@/lib/actions/follow-ups";
import type { FollowUpSuggestion } from "@/lib/types/ai";

export function AiSuggestions({ contactId }: { contactId: string }) {
  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();

  async function generate() {
    setSuggestions([]);
    setError(null);
    setCreated(new Set());
    setLoading(true);

    try {
      const res = await fetch("/api/ai/suggest-followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });

      if (!res.ok) {
        setError("Failed to generate suggestions. Try again.");
        return;
      }

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      setSuggestions(data.suggestions);
    } catch {
      setError("Failed to connect to AI service. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCreate(suggestion: FollowUpSuggestion, index: number) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("contact_id", suggestion.contact_id);
      formData.set("title", suggestion.title);
      formData.set("due_date", suggestion.due_date);
      formData.set("priority", suggestion.priority);
      formData.set("description", suggestion.reasoning);

      const result = await createFollowUp(formData);
      if (result.status === "success") {
        setCreated((prev) => new Set(prev).add(index));
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">AI Suggestions</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={generate}
          disabled={loading}
        >
          {loading
            ? "Thinking..."
            : suggestions.length > 0
              ? "Refresh"
              : "Suggest Follow-ups"}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="rounded-md border border-border p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.reasoning}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Due {new Date(s.due_date).toLocaleDateString()} ·{" "}
                      {s.priority} priority
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreate(s, i)}
                    disabled={isPending || created.has(i)}
                    className="shrink-0"
                  >
                    {created.has(i) ? "Created" : "Create"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : !loading ? (
          <p className="text-sm text-muted-foreground">
            Get AI-powered follow-up suggestions based on your interaction
            history.
          </p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Analyzing patterns...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

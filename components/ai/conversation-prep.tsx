"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ConversationPrep({ contactId }: { contactId: string }) {
  const [briefing, setBriefing] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBriefing("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/conversation-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });

      if (!res.ok) {
        setError("Failed to generate briefing. Try again.");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setBriefing(text);
      }
    } catch {
      setError("Failed to connect to AI service. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Conversation Prep</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={generate}
          disabled={loading}
        >
          {loading ? "Preparing..." : briefing ? "Refresh" : "Prepare"}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {briefing ? (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-foreground">
            {briefing}
          </div>
        ) : !loading ? (
          <p className="text-sm text-muted-foreground">
            Generate a briefing before your next meeting or call with this
            contact.
          </p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Preparing briefing...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

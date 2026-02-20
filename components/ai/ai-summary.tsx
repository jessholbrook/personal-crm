"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AiSummary({ contactId }: { contactId: string }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setSummary("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });

      if (!res.ok) {
        setError("Failed to generate summary. Try again.");
        return;
      }

      // Check if it's a JSON response (no interactions case)
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await res.json();
        setSummary(data.summary);
        return;
      }

      // Stream the response
      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setSummary(text);
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
        <CardTitle className="text-base">AI Summary</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={generate}
          disabled={loading}
        >
          {loading ? "Generating..." : summary ? "Refresh" : "Generate"}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {summary ? (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-foreground">
            {summary}
          </div>
        ) : !loading ? (
          <p className="text-sm text-muted-foreground">
            Generate an AI summary of your interaction history with this
            contact.
          </p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Analyzing interactions...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

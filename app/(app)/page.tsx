export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl text-primary">Dashboard</h1>

      {/* Placeholder — will be populated with real data in Task #24 */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            Overdue Follow-ups
          </h2>
          <p className="mt-2 text-2xl font-semibold text-primary">0</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            Recent Interactions
          </h2>
          <p className="mt-2 text-2xl font-semibold text-primary">0</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            Contacts
          </h2>
          <p className="mt-2 text-2xl font-semibold text-primary">0</p>
        </div>
      </div>
    </div>
  );
}

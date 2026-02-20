export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      {/* Navigation will be added in Phase 2 */}
      <main className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}

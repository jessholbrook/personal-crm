import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl text-primary-700">Dashboard</h1>
      <p className="text-gray-600">
        Welcome back, {user.email}. Your CRM is ready.
      </p>

      {/* Dashboard sections will be added in Phase 2 */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-medium text-gray-500">Overdue Follow-ups</h2>
          <p className="mt-2 text-2xl font-semibold text-primary-700">0</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-medium text-gray-500">Recent Interactions</h2>
          <p className="mt-2 text-2xl font-semibold text-primary-700">0</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-medium text-gray-500">Contacts</h2>
          <p className="mt-2 text-2xl font-semibold text-primary-700">0</p>
        </div>
      </div>
    </div>
  );
}

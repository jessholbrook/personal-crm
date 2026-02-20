import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { Header } from "@/components/layout/header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header email={user.email ?? ""} />
        <main className="flex-1 p-4 pb-20 sm:p-6 md:pb-6 lg:p-8">
          {children}
        </main>
      </div>
      <BottomTabs />
    </div>
  );
}

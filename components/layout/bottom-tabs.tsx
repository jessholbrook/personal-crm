"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: "◈" },
  { href: "/contacts", label: "Contacts", icon: "◉" },
  { href: "/interactions", label: "Activity", icon: "◎" },
  { href: "/follow-ups", label: "Follow-ups", icon: "◇" },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for notched devices */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

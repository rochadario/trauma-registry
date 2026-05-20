"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { BugReportDialog } from "@/components/layout/bug-report-dialog";
import { useSync } from "@/lib/sync/use-sync";
import {
  Users,
  LayoutDashboard,
  FilePlus,
  Download,
  Menu,
  X,
  LogOut,
  MailOpen,
} from "lucide-react";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isOpenTraumaDomain =
    typeof window !== "undefined" &&
    window.location.hostname.includes("opentraumaregistry");
  const appLabel = isOpenTraumaDomain ? (
    <span className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white shadow-sm overflow-hidden p-0.5">
        <img src="/logo-icon.png" alt="" className="h-full w-full object-contain" />
      </span>
      <span className="leading-none">
        <span className="block text-xs font-semibold leading-tight text-muted-foreground">Open</span>
        <span className="block text-sm font-bold leading-tight"><span className="text-red-600">Trauma</span> Registry</span>
      </span>
    </span>
  ) : "RESPOND";
  const [user, setUser] = useState<{ email?: string } | null>(null);
  useSync();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  }

  const navItems = [
    {
      href: `/${locale}/dashboard`,
      label: t("dashboard"),
      icon: LayoutDashboard,
    },
    {
      href: `/${locale}/patients/new`,
      label: t("newPatient"),
      icon: FilePlus,
    },
    {
      href: `/${locale}/patients`,
      label: t("patients"),
      icon: Users,
    },
    {
      href: `/${locale}/export`,
      label: t("export"),
      icon: Download,
    },
    {
      href: `/${locale}/report-config`,
      label: t("reportConfig"),
      icon: MailOpen,
    },
  ];

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <div className="h-dvh flex overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed height, never scrolls */}
      <aside
        className={`fixed md:static z-40 w-64 h-dvh md:h-full bg-card border-r flex flex-col transition-transform duration-200 shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <Link href={`/${locale}/patients`} className="font-bold text-lg">
            {appLabel}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="text-xs text-muted-foreground truncate">
            {user?.email}
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t("logout")}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content — scrolls independently */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b bg-card px-4 py-3 flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-bold flex-1">{appLabel}</span>
          <BugReportDialog userEmail={user?.email} />
        </header>
        <OfflineBanner />
        <div className="hidden md:flex items-center justify-end px-4 py-1 border-b bg-card">
          <BugReportDialog userEmail={user?.email} />
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  CalendarPlus2,
  CalendarRange,
  Clock3,
  LayoutDashboard,
  Search,
  Settings2,
  Shapes,
  Users,
} from "lucide-react";

import { AdminNotifications } from "@/components/admin/admin-notifications";
import { cn } from "@/lib/utils";

const navigationSections = [
  {
    title: "Vue générale",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
    ],
  },
  {
    title: "Rendez-vous",
    items: [
      { href: "/admin/rendez-vous/en-attente", label: "En attente", icon: Clock3 },
      { href: "/admin/rendez-vous/agenda", label: "Agenda", icon: CalendarRange },
      { href: "/admin/rendez-vous/nouveau", label: "Nouveau rendez-vous", icon: CalendarPlus2 },
    ],
  },
  {
    title: "Configuration",
    items: [
      { href: "/admin/categories", label: "Catégories", icon: Shapes },
      { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
      { href: "/admin/checker-ref-mail", label: "Suivi emails", icon: Search },
      { href: "/admin/parametres", label: "Paramètres", icon: Settings2 },
    ],
  },
];

function getCurrentSection(pathname: string) {
  for (const section of navigationSections) {
    for (const item of section.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return item;
      }
    }
  }

  return navigationSections[0].items[0];
}

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const currentPath = usePathname();
  const currentSection = getCurrentSection(currentPath);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar CRM Style */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6">
          <div className="font-semibold tracking-tight text-slate-900">
            Administration
          </div>
          <Link
            href="/"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Voir le site public"
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <Link
            href="/admin/rendez-vous/nouveau"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <CalendarPlus2 className="size-4" />
            <span>Nouveau RDV</span>
          </Link>

          <div className="mt-8 space-y-8">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{section.title}</p>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        )}
                      >
                        <Icon className={cn("size-4", isActive ? "text-blue-700" : "text-slate-400")} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Header CRM Style */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <span className="text-slate-500">App /</span> {currentSection.label}
          </div>
          
          <div className="flex items-center gap-4">
            <AdminNotifications />
            
            {/* Mobile menu link if needed - hidden on desktop */}
            <Link
               href="/"
               className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 lg:hidden"
             >
               Site
               <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

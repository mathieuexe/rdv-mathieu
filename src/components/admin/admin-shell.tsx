"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  KanbanSquare,
  CalendarPlus2,
  CalendarRange,
  CalendarSync,
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
      { href: "/admin/statistiques", label: "Statistiques", icon: BarChart3 },
    ],
  },
  {
    title: "Rendez-vous",
    items: [
      { href: "/admin/rendez-vous/en-attente", label: "En attente", icon: Clock3 },
      { href: "/admin/rendez-vous/agenda", label: "Agenda", icon: CalendarRange },
      { href: "/admin/rendez-vous/nouveau", label: "Nouveau rendez-vous", icon: CalendarPlus2 },
      { href: "/admin/google-calendar", label: "Google Agenda", icon: CalendarSync },
    ],
  },
  {
    title: "Prospection",
    items: [{ href: "/admin/pipeline", label: "Pipeline", icon: KanbanSquare }],
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

/**
 * Entrée de menu correspondant à la page affichée. On retient l'adresse la plus
 * précise : sans cela « /admin » (Tableau de bord) correspondrait à toutes les
 * pages de l'administration.
 */
function getCurrentSection(pathname: string) {
  const items = navigationSections.flatMap((section) => section.items);
  const matches = items.filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return matches.sort((a, b) => b.href.length - a.href.length)[0] ?? items[0];
}

interface AdminShellProps {
  children: React.ReactNode;
  session?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    avatarUrl?: string;
    email?: string;
  };
}

export function AdminShell({ children, session }: AdminShellProps) {
  const currentPath = usePathname();
  const currentSection = getCurrentSection(currentPath);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar CRM Style */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-accent-soft font-serif text-xs font-black text-accent">
              M
            </span>
            <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-slate-900">Administration</span>
          </div>
          <Link
            href="/"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-accent-soft hover:text-accent"
            title="Voir le site public"
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <Link
            href="/admin/rendez-vous/nouveau"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(48,128,238,0.25)]"
          >
            <CalendarPlus2 className="size-4" />
            <span>Nouveau RDV</span>
          </Link>

          <div className="mt-8 space-y-8">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <p className="da-eyebrow mb-3 text-[11px]">{section.title}</p>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = item.href === currentSection.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-accent-soft text-accent"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        )}
                      >
                        <Icon className={cn("size-4", isActive ? "text-accent" : "text-slate-400")} />
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
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
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
               className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-accent hover:text-accent lg:hidden"
             >
               Site
               <ArrowUpRight className="size-3" />
            </Link>

            {session && (
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-slate-900">{session.fullName}</p>
                  <p className="text-xs text-slate-500">Administrateur</p>
                </div>
                {session.avatarUrl ? (
                  <img src={session.avatarUrl} alt={session.fullName || "Avatar"} className="size-8 rounded-full border border-slate-200 object-cover" />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-accent-soft text-sm font-medium text-accent">
                    {session.firstName?.charAt(0)}{session.lastName?.charAt(0)}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Navigation sur téléphone et tablette, où la barre latérale est masquée. */}
        <nav
          aria-label="Navigation de l'administration"
          className="sticky top-16 z-10 overflow-x-auto border-b border-slate-200 bg-white lg:hidden"
        >
          <div className="flex min-w-max gap-1 px-3 py-2">
            {navigationSections
              .flatMap((section) => section.items)
              .map((item) => {
                const isActive = item.href === currentSection.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive ? "bg-accent-soft text-accent" : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <Icon className={cn("size-4", isActive ? "text-accent" : "text-slate-400")} />
                    {item.label}
                  </Link>
                );
              })}
          </div>
        </nav>

        {/* Page Content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

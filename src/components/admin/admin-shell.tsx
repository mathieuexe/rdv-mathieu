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
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigationSections = [
  {
    title: "Vue générale",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, description: "Synthèse" },
    ],
  },
  {
    title: "Rendez-vous",
    items: [
      { href: "/admin/rendez-vous/en-attente", label: "En attente", icon: Clock3, description: "À traiter" },
      { href: "/admin/rendez-vous/agenda", label: "Agenda", icon: CalendarRange, description: "Confirmés" },
      { href: "/admin/rendez-vous/nouveau", label: "Créer un rendez-vous", icon: CalendarPlus2, description: "Ajout manuel" },
    ],
  },
  {
    title: "Configuration",
    items: [
      { href: "/admin/categories", label: "Catégories", icon: Shapes, description: "Types de rendez-vous" },
      { href: "/admin/checker-ref-mail", label: "Checker ref mail", icon: Search, description: "Historique email" },
      { href: "/admin/parametres", label: "Paramètres", icon: Settings2, description: "Site et maintenance" },
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3f7ff_0%,#f8fafc_24%,#f8fafc_100%)]">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)] px-5 py-6 lg:border-r lg:border-b-0 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-blue-500/70">Administration</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">RDV Mathieu</h1>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:text-slate-950"
            >
              <span>Voir le site</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <Link
            href="/admin/rendez-vous/nouveau"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <CalendarPlus2 className="size-4" />
            <span>Créer</span>
          </Link>

          <div className="mt-8 space-y-7">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-3 text-xs font-medium uppercase tracking-[0.18em] text-blue-500/60">{section.title}</p>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
                          isActive
                            ? "bg-white text-slate-950 shadow-sm ring-1 ring-blue-100"
                            : "text-slate-600 hover:bg-white hover:text-slate-950",
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-9 items-center justify-center rounded-xl border text-slate-500",
                            isActive ? "border-blue-100 bg-blue-50 text-blue-600" : "border-transparent bg-transparent",
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className={cn("font-medium", isActive ? "text-slate-950" : "text-slate-700")}>{item.label}</p>
                          <p className="text-xs text-slate-400">{item.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0 px-4 py-4 sm:px-6 lg:px-8">
          <header className="rounded-[28px] border border-blue-100 bg-white px-6 py-5 shadow-[0_16px_50px_rgba(37,99,235,0.08)]">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-600/70">Espace administrateur</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{currentSection.label}</h2>
                <p className="mt-1 text-sm text-slate-500">{currentSection.description}</p>
              </div>
              <div className="text-sm text-slate-400">Interface de gestion des rendez-vous</div>
            </div>
          </header>

          <main className="mt-4 space-y-4">{children}</main>
        </div>
      </div>
    </div>
  );
}

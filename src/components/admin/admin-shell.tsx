"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarPlus2, CalendarRange, Clock3, LayoutDashboard, Search, Settings2, Shapes } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/rendez-vous/en-attente", label: "En attente", icon: Clock3 },
  { href: "/admin/rendez-vous/agenda", label: "Agenda", icon: CalendarRange },
  { href: "/admin/rendez-vous/nouveau", label: "Creer un RDV", icon: CalendarPlus2 },
  { href: "/admin/categories", label: "Catégories", icon: Shapes },
  { href: "/admin/checker-ref-mail", label: "Checker ref mail", icon: Search },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings2 },
];

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const currentPath = usePathname();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[220px_1fr] lg:px-6">
        <aside className="rounded-[20px] border border-slate-200 bg-white p-4">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Administration</p>
            <h1 className="mt-2 text-lg font-semibold text-slate-950">Rendez-vous</h1>
          </div>

          <nav className="mt-4 space-y-1.5">
            {navigation.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "border border-slate-950 bg-slate-950 text-white"
                      : "border border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-4">{children}</main>
      </div>
    </div>
  );
}

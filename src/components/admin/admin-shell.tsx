"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarRange, LayoutDashboard, Settings2, Shapes, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Catégories", icon: Shapes },
  { href: "/admin/rendez-vous", label: "Rendez-vous", icon: CalendarRange },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings2 },
];

interface AdminShellProps {
  children: React.ReactNode;
  isDemoMode: boolean;
}

export function AdminShell({ children, isDemoMode }: AdminShellProps) {
  const currentPath = usePathname();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-6">
        <aside className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.3)]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Back-office</p>
            <h1 className="mt-3 text-2xl font-semibold">Studio de réservation</h1>
            <p className="mt-3 text-sm text-slate-300">
              Centralisez vos créneaux, pilotez les demandes et basculez le site en maintenance si besoin.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {navigation.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {isDemoMode ? (
            <div className="mt-8 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="size-4" />
                <span>Mode démonstration</span>
              </div>
              <p className="mt-2 text-amber-100/80">
                Configurez Supabase pour activer l'authentification réelle et la persistance des données.
              </p>
            </div>
          ) : null}
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}

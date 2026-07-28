"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarPlus2,
  CalendarRange,
  Clock3,
  LayoutDashboard,
  Search,
  Settings2,
  Shapes,
  ShieldAlert,
  UserCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/rendez-vous/en-attente", label: "En attente", icon: Clock3 },
  { href: "/admin/rendez-vous/agenda", label: "Agenda", icon: CalendarRange },
  { href: "/admin/rendez-vous/nouveau", label: "Creer un RDV", icon: CalendarPlus2 },
  { href: "/admin/categories", label: "Catégories", icon: Shapes },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings2 },
];

interface AdminShellProps {
  children: React.ReactNode;
  isDemoMode: boolean;
}

export function AdminShell({ children, isDemoMode }: AdminShellProps) {
  const currentPath = usePathname();

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="grid min-h-screen lg:grid-cols-[270px_1fr]">
        <aside className="border-r border-slate-200/80 bg-white px-5 py-6 shadow-[18px_0_50px_rgba(15,23,42,0.04)]">
          <div className="rounded-2xl bg-[linear-gradient(135deg,#4f46e5_0%,#2563eb_55%,#06b6d4_100%)] p-5 text-white shadow-[0_24px_70px_rgba(37,99,235,0.28)]">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Back-office</p>
            <h1 className="mt-3 text-2xl font-semibold">AdminPanel</h1>
            <p className="mt-3 text-sm text-white/80">
              Centralisez vos categories, les demandes en attente et les rendez-vous confirmes.
            </p>
          </div>

          <div className="mt-8">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Navigation</p>
          </div>

          <nav className="mt-3 space-y-1.5">
            {navigation.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-[linear-gradient(135deg,#4f46e5_0%,#2563eb_55%,#06b6d4_100%)] text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {isDemoMode ? (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="size-4" />
                <span>Mode démonstration</span>
              </div>
              <p className="mt-2 text-amber-800">
                Configurez Supabase pour activer l'authentification réelle et la persistance des données.
              </p>
            </div>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="border-b border-slate-200/80 bg-white/90 px-5 py-4 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <label className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <Search className="size-4" />
                <input
                  type="text"
                  placeholder="Rechercher une page ou un rendez-vous..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </label>

              <div className="flex items-center justify-between gap-3 xl:justify-end">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-medium text-slate-600">
                  <Bell className="size-4 text-indigo-500" />
                  <span>Administration</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f46e5_0%,#2563eb_55%,#06b6d4_100%)] text-white">
                    <UserCircle2 className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Espace admin</p>
                    <p className="text-xs text-slate-500">Gestion des rendez-vous</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="space-y-6 px-5 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

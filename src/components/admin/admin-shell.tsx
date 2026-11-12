"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  CalendarPlus2,
  CalendarRange,
  CalendarSync,
  ChevronRight,
  Clock3,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  MailSearch,
  Settings2,
  Shapes,
  Users,
  X,
} from "lucide-react";

import { logoutAction } from "@/app/admin/login/actions";
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
      { href: "/admin/checker-ref-mail", label: "Suivi emails", icon: MailSearch },
      { href: "/admin/parametres", label: "Paramètres", icon: Settings2 },
    ],
  },
];

const allItems = navigationSections.flatMap((section) => section.items.map((item) => ({ ...item, section: section.title })));

/**
 * Entrée de menu correspondant à la page affichée. On retient l'adresse la plus
 * précise : sans cela « /admin » (Tableau de bord) correspondrait à toutes les
 * pages de l'administration.
 */
function getCurrentSection(pathname: string) {
  const matches = allItems.filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return matches.sort((a, b) => b.href.length - a.href.length)[0] ?? allItems[0];
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

function Avatar({ session, className }: { session: NonNullable<AdminShellProps["session"]>; className?: string }) {
  const initials = `${session.firstName?.charAt(0) ?? ""}${session.lastName?.charAt(0) ?? ""}` || "A";

  return session.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- avatar distant de petite taille, sans intérêt à optimiser
    <img src={session.avatarUrl} alt="" className={cn("rounded-full object-cover", className)} />
  ) : (
    <span className={cn("flex items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white", className)}>
      {initials}
    </span>
  );
}

/** Barre latérale sombre : navigation, raccourci de création et compte. */
function Sidebar({
  currentHref,
  session,
  onNavigate,
}: {
  currentHref: string;
  session?: AdminShellProps["session"];
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[#0d1424] text-slate-300">
      <div className="flex h-14 shrink-0 items-center gap-3 px-5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500 font-serif text-sm font-black text-white">
          M
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-white">Mathieu Cerenzia</p>
          <p className="text-xs text-slate-400">Administration</p>
        </div>
      </div>

      <div className="px-3 pt-3">
        <Link
          href="/admin/rendez-vous/nouveau"
          onClick={onNavigate}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-400"
        >
          <CalendarPlus2 className="size-4" />
          Nouveau rendez-vous
        </Link>
      </div>

      <nav aria-label="Navigation de l'administration" className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {navigationSections.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{section.title}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.href === currentHref;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      {isActive ? <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-blue-400" aria-hidden="true" /> : null}
                      <Icon className={cn("size-[18px] shrink-0", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowUpRight className="size-[18px] text-slate-500" />
          Voir le site
        </Link>

        {session ? (
          <div className="flex items-center gap-3 rounded-lg px-2.5 py-2">
            <Avatar session={session} className="size-8 shrink-0" />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-white">{session.fullName}</p>
              <p className="truncate text-xs text-slate-500">{session.email ?? "Administrateur"}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Se déconnecter"
                aria-label="Se déconnecter"
                className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminShell({ children, session }: AdminShellProps) {
  const currentPath = usePathname();
  const currentSection = getCurrentSection(currentPath);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Le menu mobile se referme avec Échap et bloque le défilement de la page tant qu'il est ouvert.
  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Ordinateur : barre latérale fixe */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block">
        <Sidebar currentHref={currentSection.href} session={session} />
      </aside>

      {/* Téléphone et tablette : la même barre, en tiroir */}
      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu de l'administration">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/50"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            <Sidebar currentHref={currentSection.href} session={session} onNavigate={() => setIsMenuOpen(false)} />
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Fermer le menu"
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="-ml-1.5 flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="size-5" />
            </button>

            <nav aria-label="Fil d'Ariane" className="flex min-w-0 items-center gap-1.5 text-sm">
              <span className="hidden text-slate-500 sm:inline">{currentSection.section}</span>
              <ChevronRight className="hidden size-3.5 shrink-0 text-slate-300 sm:block" />
              <span className="truncate font-medium text-slate-900">{currentSection.label}</span>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <AdminNotifications />
            {session ? (
              <div className="ml-1.5 border-l border-slate-200 pl-3 lg:hidden">
                <Avatar session={session} className="size-8" />
              </div>
            ) : null}
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

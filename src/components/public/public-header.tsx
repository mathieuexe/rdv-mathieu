import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";

import { logoutAccountAction } from "@/app/compte/actions";
import { getPublicUserSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./mobile-menu";

interface PublicHeaderProps {
  currentPath?: string;
}

function getLinkClass(href: string, currentPath?: string) {
  const isAccountPath = href === "/compte" && currentPath?.startsWith("/compte");
  const isActive = currentPath === href || isAccountPath;

  if (href === "/connexion") {
    return isActive
      ? "da-btn da-btn-sm da-btn-primary"
      : "da-btn da-btn-sm da-btn-secondary";
  }

  if (href === "/admin") {
    return "da-btn da-btn-sm rounded-xl border border-rose-600 bg-rose-600 font-semibold text-white hover:bg-rose-700";
  }

  return isActive
    ? "text-[15px] font-semibold text-accent"
    : "text-[15px] font-medium text-slate-500 transition-colors hover:text-slate-900";
}

export async function PublicHeader({ currentPath }: PublicHeaderProps) {
  const session = await getPublicUserSession();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-4 text-slate-900">
        <Link href="/" className="group flex items-center gap-3" aria-label="Accueil">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-accent-soft font-serif text-sm font-black text-accent">
            M
          </span>
          <span className="text-[13px] font-medium uppercase tracking-[0.1em] text-slate-900 transition-colors group-hover:text-accent">
            Mathieu Cerenzia
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/" className={getLinkClass("/", currentPath)}>
            Accueil
          </Link>
          <Link href="/qui-suis-je" className={getLinkClass("/qui-suis-je", currentPath)}>
            Qui suis-je ?
          </Link>
          {session.isAuthenticated ? (
            <>
              <div className="group relative">
                <Link href="/compte" className={`inline-flex items-center gap-2 ${getLinkClass("/compte", currentPath)}`}>
                  {session.avatarUrl ? (
                    <img
                      src={session.avatarUrl}
                      alt={session.fullName || "Avatar"}
                      className="hidden size-8 rounded-full border border-slate-200 object-cover sm:block"
                    />
                  ) : (
                    <span className="hidden size-8 items-center justify-center rounded-full border border-slate-200 bg-accent-soft text-xs font-semibold text-accent sm:flex">
                      {session.firstName?.charAt(0) || ""}
                      {session.lastName?.charAt(0) || ""}
                    </span>
                  )}
                  <span className="hidden sm:inline">{session.fullName}</span>
                  <span className="sm:hidden">Mon compte</span>
                  <ChevronDown className="size-4" />
                </Link>

                <div className="invisible absolute right-0 top-full z-20 mt-2 w-56 translate-y-2 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <Link
                    href="/compte"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-accent-soft hover:text-accent"
                  >
                    Mes rendez-vous
                  </Link>
                  <Link
                    href="/compte/parametres"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-accent-soft hover:text-accent"
                  >
                    Paramètres
                  </Link>
                  <Link
                    href="/compte/logs"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-accent-soft hover:text-accent"
                  >
                    Logs d&apos;activité
                  </Link>
                  <div className="my-1 h-px bg-slate-200" />
                  <form action={logoutAccountAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="size-4" />
                      Se déconnecter
                    </button>
                  </form>
                </div>
              </div>
              {session.isAdmin ? (
                <Link href="/admin" className={cn(getLinkClass("/admin", currentPath), "hidden sm:inline-flex")}>
                  AdminPanel
                </Link>
              ) : null}
            </>
          ) : (
            <div className="flex items-center gap-5">
              <Link href="/inscription" className={cn(getLinkClass("/inscription", currentPath), "hidden sm:inline-block")}>
                S&apos;inscrire
              </Link>
              <Link href="/connexion" className={getLinkClass("/connexion", currentPath)}>
                Se connecter
              </Link>
            </div>
          )}
        </nav>
        <MobileMenu isAuthenticated={session.isAuthenticated} isAdmin={!!session.isAdmin} />
      </div>
    </header>
  );
}

import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { getPublicUserSession } from "@/lib/auth";

interface PublicHeaderProps {
  currentPath?: string;
}

function getLinkClass(href: string, currentPath?: string) {
  const isAccountPath = href === "/compte" && currentPath?.startsWith("/compte");
  const isActive = currentPath === href || isAccountPath;

  if (href === "/connexion") {
    return isActive
      ? "rounded-md border border-blue-600 bg-blue-600 px-4 py-2 text-white font-semibold transition-colors"
      : "rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 font-semibold transition-colors hover:bg-slate-50";
  }

  if (href === "/compte") {
    return isActive ? "font-semibold text-blue-600" : "font-medium text-slate-700 hover:text-slate-900 transition-colors";
  }

  if (href === "/admin") {
    return "rounded-md bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 transition-colors";
  }

  return isActive ? "font-semibold text-blue-600" : "font-medium text-slate-700 hover:text-slate-900 transition-colors";
}

export async function PublicHeader({ currentPath }: PublicHeaderProps) {
  const session = await getPublicUserSession();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 text-slate-900">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 transition-colors hover:text-blue-600 [font-family:var(--font-cal-sans),sans-serif]">
          Rdv.mathieucerenzia.fr
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {session.isAuthenticated ? (
            <>
              <div className="group relative">
                <Link href="/compte" className={`inline-flex items-center gap-1 ${getLinkClass("/compte", currentPath)}`}>
                  <span>Bonjour, {session.fullName}</span>
                  <ChevronDown className="size-4" />
                </Link>

                <div className="invisible absolute right-0 top-full z-20 mt-2 w-56 translate-y-2 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <Link href="/compte" className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900">
                    Mes rendez-vous
                  </Link>
                  <Link
                    href="/compte/parametres"
                    className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    Paramètres
                  </Link>
                  <Link href="/compte/logs" className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900">
                    Logs d&apos;activité
                  </Link>
                </div>
              </div>
              {session.isAdmin ? (
                <Link href="/admin" className={getLinkClass("/admin", currentPath)}>
                  AdminPanel
                </Link>
              ) : null}
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/inscription" className={getLinkClass("/inscription", currentPath)}>
                S&apos;inscrire
              </Link>
              <Link href="/connexion" className={getLinkClass("/connexion", currentPath)}>
                Se connecter
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

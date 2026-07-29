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
      ? "border border-black bg-black px-4 py-2 text-white"
      : "border border-black px-4 py-2";
  }

  if (href === "/compte") {
    return isActive ? "font-semibold underline underline-offset-4" : "underline underline-offset-4";
  }

  if (href === "/admin") {
    return "rounded-full bg-red-600 px-4 py-2 font-semibold text-white";
  }

  return isActive ? "font-semibold underline underline-offset-4" : "underline underline-offset-4";
}

export async function PublicHeader({ currentPath }: PublicHeaderProps) {
  const session = await getPublicUserSession();

  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 text-black">
        <Link href="/" className="text-sm font-semibold tracking-[0.18em] uppercase">
          RDV Mathieu
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {session.isAuthenticated ? (
            <>
              <div className="group relative">
                <Link href="/compte" className={`inline-flex items-center gap-1 ${getLinkClass("/compte", currentPath)}`}>
                  <span>Bonjour : {session.fullName}</span>
                  <ChevronDown className="size-4" />
                </Link>

                <div className="invisible absolute right-0 top-full z-20 mt-3 w-52 translate-y-1 rounded-2xl border border-neutral-200 bg-white p-2 opacity-0 shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <Link href="/compte" className="block rounded-xl px-3 py-2 text-neutral-700 transition hover:bg-neutral-50 hover:text-black">
                    Mes rendez-vous
                  </Link>
                  <Link
                    href="/compte/parametres"
                    className="block rounded-xl px-3 py-2 text-neutral-700 transition hover:bg-neutral-50 hover:text-black"
                  >
                    Paramètres
                  </Link>
                  <Link href="/compte/logs" className="block rounded-xl px-3 py-2 text-neutral-700 transition hover:bg-neutral-50 hover:text-black">
                    Logs
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
            <>
              <Link href="/inscription" className={getLinkClass("/inscription", currentPath)}>
                S&apos;inscrire
              </Link>
              <Link href="/connexion" className={getLinkClass("/connexion", currentPath)}>
                Se connecter
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";

import { getPublicUserSession } from "@/lib/auth";

interface PublicHeaderProps {
  currentPath?: string;
}

function getLinkClass(href: string, currentPath?: string) {
  const isActive = currentPath === href;

  if (href === "/connexion") {
    return isActive
      ? "border border-black bg-black px-4 py-2 text-white"
      : "border border-black px-4 py-2";
  }

  if (href === "/compte") {
    return isActive ? "font-semibold underline underline-offset-4" : "underline underline-offset-4";
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
            <Link href="/compte" className={getLinkClass("/compte", currentPath)}>
              Bonjour : {session.fullName}
            </Link>
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

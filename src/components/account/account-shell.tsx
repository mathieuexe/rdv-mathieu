import Link from "next/link";

import { logoutAccountAction } from "@/app/compte/actions";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import type { PublicUserSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/compte", label: "Mes rendez-vous" },
  { href: "/compte/parametres", label: "Paramètres" },
  { href: "/compte/logs", label: "Logs" },
];

interface AccountShellProps {
  session: PublicUserSession;
  currentPath: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AccountShell({ session, currentPath, title, description, children }: AccountShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <PublicHeader currentPath={currentPath} />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Mon compte</p>
              <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
              <p className="mt-2 text-sm text-neutral-600">{session.fullName}</p>
              <p className="mt-1 text-sm text-neutral-500">{session.email}</p>
              {description ? <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600">{description}</p> : null}
            </div>

            <form action={logoutAccountAction}>
              <button type="submit" className="underline underline-offset-4">
                Se déconnecter
              </button>
            </form>
          </div>

          <nav className="mt-6 flex flex-wrap gap-3">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    isActive
                      ? "border-black bg-black text-white"
                      : "border-neutral-300 bg-white text-neutral-700 hover:border-black hover:text-black",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <section className="mt-8">{children}</section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

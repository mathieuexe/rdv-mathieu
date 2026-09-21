import Link from "next/link";
import { LogOut, UserCircle } from "lucide-react";

import { logoutAccountAction } from "@/app/compte/actions";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import type { PublicUserSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/compte", label: "Mes rendez-vous" },
  { href: "/compte/parametres", label: "Paramètres" },
  { href: "/compte/logs", label: "Logs d'activité" },
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
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PublicHeader currentPath={currentPath} />

      <main className="flex-1 px-6 pb-20 pt-12 sm:pt-16">
        <div className="mx-auto max-w-[960px]">
          {/* En-tête de compte */}
          <div className="flex flex-col items-center text-center">
            <span className="flex size-16 items-center justify-center rounded-full border border-slate-200 bg-accent-soft text-accent">
              <UserCircle className="size-8" />
            </span>
            <p className="da-eyebrow mt-5">Espace client</p>
            <h1 className="da-display mt-2 text-[28px] leading-[1.15] sm:text-[36px]">{session.fullName}</h1>
            <p className="mt-2 text-[15px] text-slate-500">{session.email}</p>

            <form action={logoutAccountAction} className="mt-6">
              <button type="submit" className="da-btn da-btn-quiet da-btn-sm">
                <LogOut className="size-4" />
                Se déconnecter
              </button>
            </form>
          </div>

          {/* Navigation */}
          <div className="mt-12 border-b border-slate-200">
            <nav className="-mb-px flex justify-center gap-8 overflow-x-auto" aria-label="Tabs">
              {navigation.map((item) => {
                const isActive = currentPath === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "whitespace-nowrap border-b-2 py-4 text-[15px] font-medium transition-colors",
                      isActive
                        ? "border-accent text-accent"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Contenu */}
          <div className="mt-12">
            <div className="mx-auto max-w-[620px] text-center">
              <h2 className="da-title text-[26px] sm:text-[32px]">{title}</h2>
              {description && <p className="mt-4 text-[16px] leading-relaxed text-slate-500">{description}</p>}
            </div>

            <section className="mt-10">{children}</section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

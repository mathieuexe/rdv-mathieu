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
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <PublicHeader currentPath={currentPath} />

      <main className="flex-1 px-6 py-10 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <UserCircle className="size-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{session.fullName}</h1>
                <p className="mt-1 text-sm text-slate-500">{session.email}</p>
              </div>
            </div>

            <form action={logoutAccountAction}>
              <button 
                type="submit" 
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <LogOut className="size-4" />
                Se déconnecter
              </button>
            </form>
          </div>

          <div className="mt-8 mb-8">
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex gap-6" aria-label="Tabs">
                {navigation.map((item) => {
                  const isActive = currentPath === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "whitespace-nowrap border-b-2 py-4 text-sm font-medium transition-colors",
                        isActive
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {description && <p className="mt-2 text-sm text-slate-600 max-w-3xl">{description}</p>}
          </div>

          <section>{children}</section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

import { redirect } from "next/navigation";
import { LogOut, Mail } from "lucide-react";

import { getPublicUserSession } from "@/lib/auth";
import { logoutAccountAction } from "@/app/compte/actions";

export default async function BannedPage() {
  const session = await getPublicUserSession();

  if (!session.isAuthenticated || !session.isBanned) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header minimaliste */}
      <header className="flex h-16 items-center px-4 sm:px-6">
        <form action={logoutAccountAction}>
          <button
            type="submit"
            className="text-sm font-medium text-slate-900 transition-colors hover:text-slate-600"
          >
            Se déconnecter
          </button>
        </form>
      </header>

      {/* Contenu principal */}
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center sm:p-12">
        <div className="w-full max-w-md space-y-6 text-left">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Ton compte est bloqué
          </h1>
          
          <div className="space-y-4 text-slate-600">
            <p>
              Suite à des activités récentes allant à l'encontre de nos Termes et conditions, nous avons bloqué ton compte.
            </p>
            <p>
              Si tu souhaites obtenir plus d'informations concernant notre décision, n'hésite pas à nous contacter par e-mail.
            </p>
          </div>
        </div>
      </main>

      {/* Footer avec boutons d'action */}
      <footer className="p-4 sm:p-6 w-full max-w-md mx-auto space-y-3">
        <a
          href="mailto:info@mathieucerenzia.fr"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[#007782] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#006069]"
        >
          <Mail className="size-5" />
          Nous contacter
        </a>
        <form action={logoutAccountAction} className="w-full">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Se déconnecter
          </button>
        </form>
      </footer>
    </div>
  );
}

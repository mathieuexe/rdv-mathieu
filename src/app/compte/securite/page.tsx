import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";

import { changeAccountPasswordAction } from "@/app/compte/actions";
import { AccountPasswordForm } from "@/components/account/account-password-form";
import { AccountShell } from "@/components/account/account-shell";
import { getPublicUserSession } from "@/lib/auth";

export default async function AccountSecurityPage() {
  const session = await getPublicUserSession();

  if (!session.isAuthenticated) {
    redirect("/connexion");
  }

  if (session.isBanned) {
    redirect("/bloque");
  }

  if (!session.requiresPasswordChange) {
    redirect("/compte");
  }

  return (
    <AccountShell
      session={session}
      currentPath="/compte/securite"
      title="Sécurité"
      description="Votre compte a été créé avec un mot de passe temporaire. Choisissez maintenant un mot de passe personnel et sécurisé."
    >
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-6 py-4">
          <KeyRound className="size-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-900">Changer le mot de passe temporaire</h2>
        </div>
        
        <div className="p-6">
          <p className="mb-6 text-sm text-slate-600">
            Cette étape est demandée une seule fois lors de votre première connexion.
          </p>

          <AccountPasswordForm action={changeAccountPasswordAction} />
        </div>
      </section>
    </AccountShell>
  );
}

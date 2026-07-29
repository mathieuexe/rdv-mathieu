import { redirect } from "next/navigation";

import { changeAccountPasswordAction } from "@/app/compte/actions";
import { AccountPasswordForm } from "@/components/account/account-password-form";
import { AccountShell } from "@/components/account/account-shell";
import { getPublicUserSession } from "@/lib/auth";

export default async function AccountSecurityPage() {
  const session = await getPublicUserSession();

  if (!session.isAuthenticated) {
    redirect("/connexion");
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
      <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
        <div className="border-b border-neutral-200 pb-6">
          <h2 className="text-2xl font-semibold text-neutral-950">Changer le mot de passe temporaire</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
            Cette étape est demandée une seule fois lors de votre première connexion.
          </p>
        </div>

        <div className="mt-6">
          <AccountPasswordForm action={changeAccountPasswordAction} />
        </div>
      </section>
    </AccountShell>
  );
}

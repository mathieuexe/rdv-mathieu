import { redirect } from "next/navigation";
import { UserCog } from "lucide-react";

import { updateAccountProfileAction } from "@/app/compte/actions";
import { AccountProfileForm } from "@/components/account/account-profile-form";
import { AccountShell } from "@/components/account/account-shell";
import { getPublicUserSession } from "@/lib/auth";
import { getUserProfileByUserId } from "@/lib/data-access";

export default async function AccountSettingsPage() {
  const session = await getPublicUserSession();

  if (!session.isAuthenticated || !session.userId) {
    redirect("/connexion");
  }

  if (session.isBanned) {
    redirect("/bloque");
  }

  const profile = await getUserProfileByUserId(session.userId);

  if (!profile) {
    redirect("/compte");
  }

  return (
    <AccountShell
      session={session}
      currentPath="/compte/parametres"
      title="Paramètres"
      description="Modifiez ici vos informations personnelles utilisées pour vos rendez-vous et votre espace client."
    >
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-6 py-4">
          <UserCog className="size-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-900">Informations personnelles</h2>
        </div>
        
        <div className="p-6">
          <p className="mb-6 text-sm text-slate-600">
            Vous pouvez mettre à jour votre nom, votre prénom, votre adresse email et votre numéro de téléphone.
          </p>

          <AccountProfileForm profile={profile} action={updateAccountProfileAction} />
        </div>
      </section>
    </AccountShell>
  );
}

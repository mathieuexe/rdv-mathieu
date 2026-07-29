import { redirect } from "next/navigation";

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
      <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
        <div className="border-b border-neutral-200 pb-6">
          <h2 className="text-2xl font-semibold text-neutral-950">Informations personnelles</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
            Vous pouvez mettre à jour votre nom, votre prénom, votre adresse email et votre numéro de téléphone.
          </p>
        </div>

        <div className="mt-6">
          <AccountProfileForm profile={profile} action={updateAccountProfileAction} />
        </div>
      </section>
    </AccountShell>
  );
}

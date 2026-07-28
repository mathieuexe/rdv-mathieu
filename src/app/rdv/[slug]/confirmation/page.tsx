import Link from "next/link";
import { CheckCheck, MailCheck } from "lucide-react";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { formatDateTimeFr } from "@/lib/utils";

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ slot?: string; firstName?: string }>;
}) {
  const { slot, firstName } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <PublicHeader />

      <main className="flex-1 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <section className="rounded-[28px] border border-neutral-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-10">
            <div className="inline-flex rounded-full border border-black px-4 py-2 text-xs uppercase tracking-[0.22em] text-black">
              Demande envoyee
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
              Merci{firstName ? ` ${firstName}` : ""}, votre demande est en attente de validation.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-600">
              Un email de confirmation provisoire vous est envoye. La validation finale du rendez-vous vous sera
              communiquee ensuite par email.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] border border-neutral-200 bg-neutral-50 p-5">
                <CheckCheck className="size-5 text-black" />
                <p className="mt-4 text-sm font-semibold text-black">Statut actuel</p>
                <p className="mt-2 text-sm leading-7 text-neutral-600">Votre creneau est reserve a titre provisoire.</p>
              </div>
              <div className="rounded-[22px] border border-neutral-200 bg-neutral-50 p-5">
                <MailCheck className="size-5 text-black" />
                <p className="mt-4 text-sm font-semibold text-black">Rappel du creneau</p>
                <p className="mt-2 text-sm leading-7 text-neutral-600">
                  {slot
                    ? `Demande enregistree pour le ${formatDateTimeFr(slot, { dateStyle: "full", timeStyle: "short" })}.`
                    : "Le recapitulatif vous a ete envoye par email."}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[22px] border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-sm font-semibold text-black">Suite du processus</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-neutral-600">
                <li>Votre demande reste provisoire tant qu&apos;elle n&apos;est pas validee.</li>
                <li>Vous recevez un email de confirmation si le rendez-vous est accepte.</li>
                <li>En cas d&apos;annulation ou de refus, un email dedie vous sera egalement envoye.</li>
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
              >
                Retour a l&apos;accueil
              </Link>
              <Link
                href="/compte"
                className="inline-flex items-center justify-center rounded-full border border-black px-6 py-3 text-sm font-semibold text-black"
              >
                Ouvrir mon compte
              </Link>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

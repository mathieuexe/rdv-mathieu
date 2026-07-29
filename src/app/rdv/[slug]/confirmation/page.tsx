import Link from "next/link";

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

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <section className="border-b border-neutral-200 pb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Merci{firstName ? ` ${firstName}` : ""}, votre demande est en attente de validation.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-neutral-600">
              Un email de confirmation provisoire vous est envoye. La validation finale du rendez-vous vous sera
              communiquee ensuite par email.
            </p>
          </section>

          <section className="mt-8 space-y-6">
            {slot ? (
              <div className="rounded-2xl border border-neutral-200 px-5 py-5">
                <p className="text-sm font-medium text-neutral-900">Créneau demandé</p>
                <p className="mt-2 text-sm leading-7 text-neutral-600">
                  {formatDateTimeFr(slot, { dateStyle: "full", timeStyle: "short" })}
                </p>
              </div>
            ) : null}

            <div className="space-y-2 text-sm leading-7 text-neutral-600">
              <p>Votre demande reste provisoire tant qu&apos;elle n&apos;est pas validée.</p>
              <p>Vous recevrez un email si le rendez-vous est accepté, refusé ou annulé.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
              >
                Retour a l&apos;accueil
              </Link>
              <Link
                href="/compte"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-black"
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

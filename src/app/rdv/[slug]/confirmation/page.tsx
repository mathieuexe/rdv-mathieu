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
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <PublicHeader />

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <section className="border-b border-slate-200 pb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Merci{firstName ? ` ${firstName}` : ""}, votre demande est en attente de validation.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Un email de confirmation provisoire vous a été envoyé. La validation finale du rendez-vous vous sera
              communiquée ensuite par email.
            </p>
          </section>

          <section className="mt-8 space-y-6">
            {slot ? (
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-6 py-6">
                <p className="text-sm font-medium text-slate-900">Créneau demandé</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {formatDateTimeFr(slot, { dateStyle: "full", timeStyle: "short" })}
                </p>
              </div>
            ) : null}

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-5 shadow-sm text-sm leading-7 text-amber-900">
              <p className="font-semibold text-amber-950 mb-1">Votre demande reste provisoire tant qu&apos;elle n&apos;est pas validée.</p>
              <p>Vous recevrez un email si le rendez-vous est accepté, refusé ou annulé.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row pt-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Retour à l&apos;accueil
              </Link>
              <Link
                href="/compte"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
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

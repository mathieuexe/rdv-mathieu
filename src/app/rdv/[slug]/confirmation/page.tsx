import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock } from "lucide-react";

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
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PublicHeader />

      <main className="flex-1 px-6 pb-20 pt-12 sm:pt-16">
        <div className="mx-auto flex max-w-[620px] flex-col items-center">
          <span className="flex size-14 items-center justify-center rounded-full border border-slate-200 bg-accent-soft text-accent">
            <CalendarCheck className="size-7" />
          </span>

          <p className="da-eyebrow mt-5">Demande enregistrée</p>

          <h1 className="da-display mt-2 text-center text-[30px] leading-[1.15] sm:text-[40px]">
            Merci{firstName ? ` ${firstName}` : ""}, votre demande est{" "}
            <span className="text-accent">en attente de validation</span>.
          </h1>

          <p className="mt-4 max-w-md text-center text-[16px] leading-relaxed text-slate-500">
            Un email de confirmation provisoire vous a été envoyé. La validation finale du rendez-vous vous sera
            communiquée ensuite par email.
          </p>

          {slot ? (
            <div className="da-card mt-10 w-full p-6">
              <p className="da-eyebrow">Créneau demandé</p>
              <p className="mt-2 flex items-start gap-2.5 text-[16px] leading-relaxed text-slate-900">
                <Clock className="mt-1 size-4 shrink-0 text-accent" />
                <span>{formatDateTimeFr(slot, { dateStyle: "full", timeStyle: "short" })}</span>
              </p>
            </div>
          ) : null}

          <div className="da-card mt-4 w-full border-amber-200 bg-amber-50 p-6">
            <p className="text-[15px] font-semibold text-amber-900">
              Votre demande reste provisoire tant qu&apos;elle n&apos;est pas validée.
            </p>
            <p className="mt-1 text-[14px] leading-relaxed text-amber-800">
              Vous recevrez un email si le rendez-vous est accepté, refusé ou annulé.
            </p>
          </div>

          <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
            <Link href="/" className="da-btn da-btn-primary w-full">
              Retour à l&apos;accueil
              <ArrowRight className="size-5" />
            </Link>
            <Link href="/compte" className="da-btn da-btn-secondary w-full">
              Ouvrir mon compte
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

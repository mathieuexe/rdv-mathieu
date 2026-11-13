import type { Metadata } from "next";

import { EmbedCopyright } from "@/components/embed/embed-copyright";
import { EmbedHeightReporter } from "@/components/embed/embed-height-reporter";
import { CalendarCheck } from "@/components/icons";
import { formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Demande enregistrée",
  robots: { index: false, follow: false },
};

/** Confirmation affichée dans le widget, sans quitter la page qui l'intègre. */
export default async function EmbedConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ slot?: string; firstName?: string }>;
}) {
  const [{ slug }, { slot, firstName }] = await Promise.all([params, searchParams]);

  return (
    <div className="rdv-embed bg-white px-4 py-10 text-center text-slate-900 sm:px-6">
      <EmbedHeightReporter />

      <div className="mx-auto max-w-[520px]">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CalendarCheck className="size-7" />
        </span>
        <h1 className="da-title mt-5 text-[22px] sm:text-[26px]">
          Merci{firstName ? ` ${firstName}` : ""}, votre demande est envoyée
        </h1>
        {slot ? (
          <p className="mt-3 text-[16px] font-semibold text-slate-900 first-letter:uppercase">
            {formatDateTimeFr(slot, { dateStyle: "full", timeStyle: "short" })}
          </p>
        ) : null}
        <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
          Un email récapitulatif vient de vous être envoyé. Le rendez-vous sera confirmé par un second email dès sa
          validation.
        </p>
        <a href={`/embed/${slug}`} className="da-btn da-btn-secondary da-btn-sm mt-8">
          Prendre un autre rendez-vous
        </a>
      </div>

      <EmbedCopyright />
    </div>
  );
}

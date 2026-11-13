import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { BookingForm } from "@/components/booking/booking-form";
import { EmbedCopyright } from "@/components/embed/embed-copyright";
import { EmbedHeightReporter } from "@/components/embed/embed-height-reporter";
import { TriangleAlert } from "@/components/icons";
import { getBookingState } from "@/lib/booking";
import { getCategorySlots } from "@/lib/data-access";
import { refreshPersonalAvailabilityIfStale } from "@/lib/google-calendar-sync";
import { isMaintenanceBypassedForHeaders } from "@/lib/maintenance";
import type { SiteSettings } from "@/types/domain";

export const metadata: Metadata = {
  title: "Prise de rendez-vous",
  // Page technique destinée aux iframes : inutile dans les moteurs de recherche.
  robots: { index: false, follow: false },
};

/**
 * Version intégrable d'un agenda, affichée dans une iframe sur un autre site
 * (voir `public/embed.js`). Même tunnel que `/rdv/[slug]`, sans en-tête ni
 * pied de page du site.
 */
export default async function EmbedBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ slug }, { mode }] = await Promise.all([params, searchParams]);
  after(() => refreshPersonalAvailabilityIfStale());

  const [requestHeaders, initialPayload] = await Promise.all([headers(), getCategorySlots(slug)]);

  if (!initialPayload) {
    notFound();
  }

  const bypassMaintenance = isMaintenanceBypassedForHeaders(requestHeaders, initialPayload.siteSettings as SiteSettings);
  const payload = bypassMaintenance ? await getCategorySlots(slug, { bypassMaintenance: true }) : initialPayload;

  if (!payload) {
    notFound();
  }

  // Maintenance, réservation suspendue… : le message s'affiche dans le widget
  // plutôt que de rediriger l'iframe vers une autre page du site.
  const bookingState = getBookingState(payload.category, payload.siteSettings);

  return (
    <div className="rdv-embed bg-white px-3 py-4 text-slate-900 sm:px-4">
      <EmbedHeightReporter />

      {!bookingState.available ? (
        <section className="mx-auto max-w-[620px] rounded-2xl border border-slate-200 p-8 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600">
            <TriangleAlert className="size-6" />
          </span>
          <h1 className="da-title mt-4 text-[20px]">{bookingState.title}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500">{bookingState.message}</p>
        </section>
      ) : (
        <BookingForm
          category={payload.category}
          categorySlug={payload.category.slug}
          slots={payload.slots}
          helperMessage={bookingState.message}
          embedded={mode === "popup" ? "popup" : "inline"}
        />
      )}

      <EmbedCopyright />
    </div>
  );
}

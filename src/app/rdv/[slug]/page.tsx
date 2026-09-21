import { TriangleAlert } from "lucide-react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { BookingForm } from "@/components/booking/booking-form";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getPublicUserSession } from "@/lib/auth";
import { getBookingState } from "@/lib/booking";
import { getCategorySlots } from "@/lib/data-access";
import { refreshPersonalAvailabilityIfStale } from "@/lib/google-calendar-sync";
import { isMaintenanceBypassedForHeaders } from "@/lib/maintenance";
import type { SiteSettings } from "@/types/domain";

export default async function BookingCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const requestHeaders = await headers();
  await refreshPersonalAvailabilityIfStale();

  const initialPayload = await getCategorySlots(slug);

  if (!initialPayload) {
    notFound();
  }

  const bypassMaintenance = isMaintenanceBypassedForHeaders(requestHeaders, initialPayload.siteSettings as SiteSettings);
  const payload = bypassMaintenance ? await getCategorySlots(slug, { bypassMaintenance: true }) : initialPayload;

  if (!payload) {
    notFound();
  }

  if (payload.siteSettings.maintenanceMode) {
    redirect("/maintenance");
  }

  const bookingState = getBookingState(payload.category, payload.siteSettings);
  const session = await getPublicUserSession();

  if (session.isBanned) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PublicHeader />

      <main className="flex-1 px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-[1120px]">
          {!bookingState.available ? (
            <section className="da-card mx-auto max-w-[620px] p-8 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600">
                <TriangleAlert className="size-7" />
              </span>
              <p className="da-eyebrow mt-5">Réservation indisponible</p>
              <h2 className="da-title mt-2 text-[24px] sm:text-[28px]">{bookingState.title}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-500">{bookingState.message}</p>
            </section>
          ) : (
            <BookingForm
              category={payload.category}
              categorySlug={payload.category.slug}
              slots={payload.slots}
              helperMessage={bookingState.message}
              isAuthenticated={session.isAuthenticated}
              initialUser={
                session.isAuthenticated
                  ? {
                      firstName: session.firstName,
                      lastName: session.lastName,
                      email: session.email,
                      phone: session.phone,
                    }
                  : undefined
              }
            />
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

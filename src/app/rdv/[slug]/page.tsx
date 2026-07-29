import { TriangleAlert } from "lucide-react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { BookingForm } from "@/components/booking/booking-form";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getPublicUserSession } from "@/lib/auth";
import { getBookingState } from "@/lib/booking";
import { getCategorySlots } from "@/lib/data-access";
import { isMaintenanceBypassedForHeaders } from "@/lib/maintenance";
import type { SiteSettings } from "@/types/domain";

export default async function BookingCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const requestHeaders = await headers();
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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-black">
      <PublicHeader />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {!bookingState.available ? (
            <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-8">
              <div className="flex items-start gap-3">
                <TriangleAlert className="mt-1 size-5 text-amber-700" />
                <div>
                  <h2 className="text-2xl font-semibold text-amber-950">{bookingState.title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-amber-900/90">{bookingState.message}</p>
                </div>
              </div>
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

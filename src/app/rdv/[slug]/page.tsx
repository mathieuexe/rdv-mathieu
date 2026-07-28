import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { BookingForm } from "@/components/booking/booking-form";
import { getPublicUserSession } from "@/lib/auth";
import { getBookingState } from "@/lib/booking";
import { getCategorySlots } from "@/lib/data-access";

export default async function BookingCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const payload = await getCategorySlots(slug);

  if (!payload) {
    notFound();
  }

  if (payload.siteSettings.maintenanceMode) {
    redirect("/maintenance");
  }

  const bookingState = getBookingState(payload.category, payload.siteSettings);
  const session = await getPublicUserSession();

  return (
    <main className="min-h-screen bg-[#f6f5f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {!bookingState.available ? (
          <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-8">
            <Link href="/" className="text-sm text-amber-900 underline underline-offset-4">
              Retour à l'accueil
            </Link>
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
            initialUser={
              session.isAuthenticated
                ? {
                    firstName: session.firstName,
                    lastName: session.lastName,
                    email: session.email,
                  }
                : undefined
            }
          />
        )}
      </div>
    </main>
  );
}

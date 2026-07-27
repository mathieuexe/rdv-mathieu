import Link from "next/link";
import { Clock3, MapPinned, MoveRight, TriangleAlert } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { BookingForm } from "@/components/booking/booking-form";
import { getBookingState } from "@/lib/booking";
import { getCategorySlots } from "@/lib/data-access";
import { formatAppointmentMode } from "@/lib/utils";

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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(180deg,#071120_0%,#0f172a_42%,#f8fbff_42%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[36px] border border-white/10 bg-slate-950/75 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Link href="/" className="text-sm text-cyan-200/90 transition hover:text-cyan-100">
                Retour à l'accueil
              </Link>
              <h1 className="mt-5 font-serif text-5xl leading-none tracking-tight sm:text-6xl">
                {payload.category.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                {payload.category.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Durée</p>
                <div className="mt-3 flex items-center gap-2 text-lg font-semibold">
                  <Clock3 className="size-4 text-cyan-300" />
                  <span>{payload.category.durationMinutes} minutes</span>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mode</p>
                <div className="mt-3 flex items-center gap-2 text-lg font-semibold">
                  <MapPinned className="size-4 text-cyan-300" />
                  <span>{formatAppointmentMode(payload.category.appointmentMode)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {!bookingState.available ? (
          <section className="rounded-[32px] border border-amber-200 bg-amber-50 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-8">
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
            categorySlug={payload.category.slug}
            slots={payload.slots}
            helperMessage={bookingState.message}
          />
        )}

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Processus</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Comment fonctionne la réservation</h2>
            </div>
            <MoveRight className="size-5 text-cyan-700" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              <p className="font-semibold text-slate-950">1. Choix du créneau</p>
              <p className="mt-2">Les créneaux proposés respectent les horaires définis par l'administrateur.</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              <p className="font-semibold text-slate-950">2. Demande en attente</p>
              <p className="mt-2">Vous recevez une confirmation visuelle et un email indiquant que la demande est en cours.</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              <p className="font-semibold text-slate-950">3. Validation finale</p>
              <p className="mt-2">L'administrateur accepte ou refuse la demande et vous informe par email.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

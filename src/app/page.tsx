import Link from "next/link";
import { ArrowRight, CalendarClock, ShieldCheck, Sparkles } from "lucide-react";

import { getCategories, getSiteSettings } from "@/lib/data-access";
import { formatAppointmentMode } from "@/lib/utils";

export default async function Home() {
  const [categories, settings] = await Promise.all([getCategories(), getSiteSettings()]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(180deg,#f8fbff_0%,#edf3ff_50%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[36px] border border-white/80 bg-white/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-950">
                <Sparkles className="size-3.5" />
                <span>Prise de rendez-vous en ligne</span>
              </div>
              <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-none tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Une réservation simple pour vos clients, un contrôle total pour votre activité.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Publiez vos catégories de rendez-vous, cadrez vos créneaux, validez chaque demande et gardez la main sur
                les indisponibilités, les congés et la maintenance du site.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/rdv/consultation-30min"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-950"
                >
                  <span>Réserver un rendez-vous</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/admin/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-950"
                >
                  <span>Accéder au back-office</span>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white">
                <CalendarClock className="size-5 text-cyan-300" />
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-slate-400">Site</p>
                <h2 className="mt-2 text-3xl font-semibold">{settings.maintenanceMode ? "Maintenance" : "Ouvert"}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{settings.maintenanceMessage}</p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6">
                <ShieldCheck className="size-5 text-cyan-700" />
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-slate-500">Workflow</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">Validation admin</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Chaque demande est confirmée au client comme en attente, puis traitée dans le back-office.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {categories.map((category) => (
            <article key={category.id} className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {category.durationMinutes} min
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                    category.isOnline ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {category.isOnline ? "En ligne" : "Hors ligne"}
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{category.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{category.description}</p>

              <div className="mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                <span className="rounded-full border border-slate-200 px-3 py-2">
                  {formatAppointmentMode(category.appointmentMode)}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-2">/{category.slug}</span>
              </div>

              <Link href={`/rdv/${category.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
                <span>Voir la page de réservation</span>
                <ArrowRight className="size-4" />
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

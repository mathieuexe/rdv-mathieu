import Link from "next/link";
import { Plus, TimerReset } from "lucide-react";

import { getCategories } from "@/lib/data-access";
import { formatAppointmentMode } from "@/lib/utils";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Configuration</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Catégories de rendez-vous</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Chaque catégorie possède son lien public, sa durée, son mode et ses propres règles de disponibilité.
          </p>
        </div>

        <Link
          href="/admin/categories/nouvelle"
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-950"
        >
          <Plus className="size-4" />
          <span>Nouvelle catégorie</span>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {categories.map((category) => (
          <article key={category.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{category.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{category.description}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                  category.isOnline ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                }`}
              >
                {category.isOnline ? "En ligne" : "Hors ligne"}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Durée</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{category.durationMinutes} min</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Mode</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatAppointmentMode(category.appointmentMode)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Lien</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">/{category.slug}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <TimerReset className="size-4 text-cyan-700" />
              <span>{category.blackoutPeriods.length} période(s) d'indisponibilité configurée(s)</span>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Link href={`/rdv/${category.slug}`} className="text-sm font-medium text-cyan-800">
                Ouvrir la page publique
              </Link>
              <Link href={`/admin/categories/${category.id}`} className="text-sm font-medium text-slate-950">
                Modifier
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

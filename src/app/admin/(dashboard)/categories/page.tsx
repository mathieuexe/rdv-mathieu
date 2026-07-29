import Link from "next/link";
import { Plus, TimerReset } from "lucide-react";

import { getCategories } from "@/lib/data-access";
import { formatAppointmentMode } from "@/lib/utils";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Configuration</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Catégories de rendez-vous</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Chaque catégorie regroupe sa durée, son mode, ses visuels et ses horaires de disponibilité.
          </p>
        </div>

        <Link
          href="/admin/categories/nouvelle"
          className="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="size-4" />
          <span>Nouvelle catégorie</span>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {categories.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-300 px-5 py-10 text-sm text-slate-500 xl:col-span-2">
            Aucune catégorie n&apos;est encore configurée.
          </div>
        ) : (
          categories.map((category) => (
            <article
              key={category.id}
              className="overflow-hidden rounded-[24px] border border-slate-200 bg-white transition duration-150 hover:border-slate-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.04)]"
            >
              {category.bannerImageUrl ? (
                <div className="aspect-[8/3] w-full overflow-hidden border-b border-slate-200 bg-slate-100">
                  <img src={category.bannerImageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              ) : null}

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {category.thumbnailImageUrl ? (
                      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                        <img src={category.thumbnailImageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        RDV
                      </div>
                    )}

                    <div>
                      <h2 className="text-xl font-semibold text-slate-950">{category.title}</h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{category.description}</p>
                    </div>
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
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Durée</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{category.durationMinutes} min</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Mode</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {formatAppointmentMode(category.appointmentMode)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Slug</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{category.slug}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <TimerReset className="size-4 text-slate-500" />
                  <span>{category.blackoutPeriods.length} période(s) d&apos;indisponibilité configurée(s)</span>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-sm text-slate-500">Visuels et paramètres de la catégorie</span>
                  <Link href={`/admin/categories/${category.id}`} className="text-sm font-semibold text-slate-950 underline underline-offset-4">
                    Modifier
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

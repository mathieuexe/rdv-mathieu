import Link from "next/link";
import Image from "next/image";
import { Plus, TimerReset, Settings, CalendarRange, MapPin } from "lucide-react";

import { getCategories } from "@/lib/data-access";
import { formatAppointmentMode } from "@/lib/utils";
import { CategoryActions } from "@/components/admin/category-actions";
import { deleteCategoryAction, duplicateCategoryAction } from "../actions";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catégories de rendez-vous</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gérez vos types de rendez-vous, leurs durées et disponibilités.
          </p>
        </div>

        <Link
          href="/admin/categories/nouvelle"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="size-4" />
          <span>Nouvelle catégorie</span>
        </Link>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {categories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-5 py-10 text-center text-sm text-slate-500 xl:col-span-2">
            Aucune catégorie n&apos;est encore configurée.
          </div>
        ) : (
          categories.map((category) => (
            <article
              key={category.id}
              className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300"
            >
              {category.bannerImageUrl ? (
                <div className="relative aspect-[8/3] w-full overflow-hidden border-b border-slate-200 bg-slate-100">
                  <Image src={category.bannerImageUrl} alt="" fill sizes="(max-width: 1280px) 100vw, 50vw" className="object-cover" />
                </div>
              ) : null}

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {category.thumbnailImageUrl ? (
                      <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                        <Image src={category.thumbnailImageUrl} alt="" fill sizes="48px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        RDV
                      </div>
                    )}

                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{category.title}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{category.description}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      category.isOnline
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                        : "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/20"
                    }`}
                  >
                    {category.isOnline ? "En ligne" : "Hors ligne"}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <TimerReset className="size-3.5" />
                      <span>Durée</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{category.durationMinutes} min</p>
                  </div>
                  <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <MapPin className="size-3.5" />
                      <span>Mode</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900 truncate" title={formatAppointmentMode(category.appointmentMode)}>
                      {formatAppointmentMode(category.appointmentMode)}
                    </p>
                  </div>
                  <div className="col-span-2 rounded-md border border-slate-100 bg-slate-50 p-3 sm:col-span-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <CalendarRange className="size-3.5" />
                      <span>Indispos.</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{category.blackoutPeriods.length}</p>
                  </div>
                </div>

                <div className="mt-auto pt-6 flex items-center gap-2">
                  <Link 
                    href={`/admin/categories/${category.slug}`} 
                    className="flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Settings className="size-4" />
                    Modifier la catégorie
                  </Link>
                  <CategoryActions 
                    categoryId={category.id} 
                    duplicateAction={duplicateCategoryAction} 
                    deleteAction={deleteCategoryAction} 
                  />
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

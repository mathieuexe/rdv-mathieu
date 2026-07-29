import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getPublicCategories } from "@/lib/data-access";

export default async function Home() {
  const categories = await getPublicCategories();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-black">
      <PublicHeader />

      <main className="flex-1 px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <section className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                  <CalendarDays className="size-4" />
                  <span>Prise de rendez-vous</span>
                </div>

                <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                  Bienvenue sur mon espace de prise de rendez-vous
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-neutral-600">
                  Choisissez simplement la catégorie qui vous convient pour accéder à son agenda et réserver un créneau.
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-5 py-6">
                <p className="text-sm text-neutral-500">Catégories disponibles</p>
                <p className="mt-2 text-3xl font-semibold text-neutral-950">{categories.length}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-500">Uniquement les calendriers actuellement ouverts à la réservation.</p>
              </div>
            </div>
          </section>

          {categories.length === 0 ? (
            <section className="mt-8 rounded-[28px] border border-dashed border-neutral-300 bg-white px-6 py-12 text-center shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
              <p className="text-lg font-medium text-neutral-900">Aucun calendrier n&apos;est disponible pour le moment.</p>
              <p className="mt-3 text-sm text-neutral-500">Revenez un peu plus tard pour consulter les prochaines disponibilités.</p>
            </section>
          ) : (
            <section className="mt-8 grid gap-5 lg:grid-cols-2">
              {categories.map((category) => (
                <article
                  key={category.id}
                  className="group overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)]"
                >
                  <div className="aspect-[8/3] w-full overflow-hidden bg-neutral-100">
                    {category.bannerImageUrl ? (
                      <img src={category.bannerImageUrl} alt="" className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.01]" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#fafafa_0%,#f1f5f9_100%)]">
                        <span className="text-sm text-neutral-400">Catégorie</span>
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-5 sm:px-6 sm:py-6">
                    <div className="flex items-start gap-4">
                      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-sm font-semibold text-neutral-900">
                        {category.thumbnailImageUrl ? (
                          <img src={category.thumbnailImageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          category.title
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase() ?? "")
                            .join("") || "RDV"
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-neutral-950">{category.title}</p>
                        <p className="mt-2 line-clamp-3 text-sm leading-7 text-neutral-600">{category.description}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-neutral-200 pt-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">Réservation en ligne</div>
                      <Link
                        href={`/rdv/${category.slug}`}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 transition duration-200 hover:border-neutral-900 hover:bg-neutral-50"
                      >
                        <span>Accéder</span>
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

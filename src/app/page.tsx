import Link from "next/link";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getPublicCategories } from "@/lib/data-access";

export default async function Home() {
  const categories = await getPublicCategories();

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <PublicHeader />

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <section className="border-b border-neutral-200 pb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Bienvenue sur mon espace de prise de rendez-vous
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-neutral-600">
              Choisissez la catégorie souhaitée ci-dessous pour accéder directement aux créneaux disponibles.
            </p>
          </section>

          {categories.length === 0 ? (
            <section className="mt-8 rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center">
              <p className="text-lg font-medium text-neutral-900">Aucun calendrier n&apos;est disponible pour le moment.</p>
              <p className="mt-3 text-sm text-neutral-500">Revenez un peu plus tard pour consulter les prochaines disponibilités.</p>
            </section>
          ) : (
            <section className="mt-8 space-y-4">
              {categories.map((category) => (
                <article
                  key={category.id}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                >
                  <div className="aspect-[8/3] w-full overflow-hidden bg-neutral-100">
                    {category.bannerImageUrl ? (
                      <img src={category.bannerImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-100">
                        <span className="text-sm text-neutral-400">{category.title}</span>
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-5 sm:px-6">
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
                        <p className="mt-2 text-sm leading-7 text-neutral-600">{category.description}</p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-neutral-200 pt-4">
                      <Link href={`/rdv/${category.slug}`} className="text-sm font-medium underline underline-offset-4">
                        Accéder à cette catégorie
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

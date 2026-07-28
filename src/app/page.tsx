import Link from "next/link";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getPublicCategories } from "@/lib/data-access";

export default async function Home() {
  const categories = await getPublicCategories();

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <PublicHeader />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="mt-8 text-2xl font-semibold">Bienvenue sur mon espace de prise de rendez-vous</h1>
          <p className="mt-3 text-base">
            Choisissez l&apos;un des calendriers disponibles ci-dessous pour accéder à la page de réservation.
          </p>

          {categories.length === 0 ? (
            <p className="mt-8 text-base">
              Aucun calendrier n&apos;est disponible pour le moment.
            </p>
          ) : (
            <ul className="mt-8 space-y-3">
              {categories.map((category) => (
                <li key={category.id} className="rounded-2xl border border-neutral-200 px-4 py-4">
                  <p className="text-base font-semibold">{category.title}</p>
                  <p className="mt-1 text-sm text-neutral-600">URL directe : /rdv/{category.slug}</p>
                  <Link href={`/rdv/${category.slug}`} className="mt-3 inline-flex underline underline-offset-4">
                    Accéder à cette catégorie
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

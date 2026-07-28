import Link from "next/link";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function Home() {
  const supabase = getSupabaseAdminClient();
  const categories =
    supabase
      ? (
          await supabase
            .from("categories")
            .select("id, slug, title")
            .order("created_at", { ascending: true })
        ).data ?? []
      : [];

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-black">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">Bienvenue sur mon espace de prise de rendez-vous</h1>
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
              <li key={String(category.id)}>
                <Link href={`/rdv/${String(category.slug)}`} className="underline underline-offset-4">
                  {String(category.title)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

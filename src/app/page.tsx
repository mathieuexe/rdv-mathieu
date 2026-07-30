import Link from "next/link";
import { ArrowRight, Clock, MapPin, CalendarDays } from "lucide-react";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getPublicCategories } from "@/lib/data-access";
import { getPublicUserSession } from "@/lib/auth";
import { formatAppointmentMode } from "@/lib/utils";

export default async function Home() {
  const categories = await getPublicCategories();
  const session = await getPublicUserSession();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <PublicHeader />

      <main className="flex-1 px-6 py-12 md:py-20 flex flex-col">
        {session.isBanned ? (
          <div className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center">
            <div className="space-y-6 text-left mb-8">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Ton compte est bloqué
              </h1>
              
              <div className="space-y-4 text-slate-600">
                <p>
                  Suite à des activités récentes allant à l'encontre de nos Termes et conditions, nous avons bloqué ton compte.
                </p>
                <p>
                  Si tu souhaites obtenir plus d'informations concernant notre décision, n'hésite pas à nous contacter par e-mail.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-5xl w-full">
            <section className="text-center mb-16">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Prenez rendez-vous en ligne
              </h1>
              <p className="mt-4 mx-auto max-w-2xl text-lg text-slate-600">
                Choisissez le motif de votre rendez-vous ci-dessous et réservez directement le créneau qui vous convient le mieux.
              </p>
            </section>

            {categories.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <CalendarDays className="mx-auto size-12 text-slate-400 mb-4" />
              <p className="text-lg font-medium text-slate-900">Aucun calendrier n&apos;est disponible pour le moment.</p>
              <p className="mt-2 text-sm text-slate-500">Revenez un peu plus tard pour consulter les prochaines disponibilités.</p>
            </section>
          ) : (
            <section className="grid gap-6 sm:grid-cols-2">
              {categories.map((category) => (
                <Link
                  href={`/rdv/${category.slug}`}
                  key={category.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300"
                >
                  <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-100">
                    {category.bannerImageUrl ? (
                      <img 
                        src={category.bannerImageUrl} 
                        alt="" 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100">
                        <CalendarDays className="size-8 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 shadow-sm">
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
                        <h2 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                          {category.title}
                        </h2>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{category.description}</p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="size-4 text-slate-400" />
                        <span>{category.durationMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="size-4 text-slate-400" />
                        <span className="truncate">{formatAppointmentMode(category.appointmentMode)}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-blue-600">
                      <span>Prendre rendez-vous</span>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          )}
        </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

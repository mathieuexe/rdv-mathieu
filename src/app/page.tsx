import Link from "next/link";
import Image from "next/image";
import { CalendarDays, ChevronRight } from "@/components/icons";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { PublicBlackoutMarquee } from "@/components/public/public-blackout-marquee";
import { ContactButton } from "@/components/public/contact-button";
import { getPublicCategories, getSiteSettings } from "@/lib/data-access";
import { getPublicUserSession } from "@/lib/auth";
import { formatAppointmentMode } from "@/lib/utils";

export default async function Home() {
  const [categories, session, settings] = await Promise.all([
    getPublicCategories(),
    getPublicUserSession(),
    getSiteSettings()
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PublicHeader currentPath="/" />

      {settings.enableBlackoutMarquee && settings.globalBlackoutPeriods && settings.globalBlackoutPeriods.length > 0 && (
        <PublicBlackoutMarquee periods={settings.globalBlackoutPeriods} />
      )}

      <main className="flex-1">
        {session.isBanned ? (
          <section className="px-6 py-24">
            <div className="mx-auto flex max-w-[620px] flex-col items-center text-center">
              <span className="da-pill border-rose-200 bg-rose-50 text-rose-600">Accès suspendu</span>
              <h1 className="da-display mt-6 text-[32px] leading-[1.15] sm:text-[42px]">
                Ton compte est <span className="text-accent">bloqué</span>
              </h1>
              <p className="mt-4 text-[16px] leading-relaxed text-slate-500">
                Suite à des activités récentes allant à l&apos;encontre de nos Termes et conditions, nous avons bloqué ton
                compte.
              </p>
              <p className="mt-3 text-[16px] leading-relaxed text-slate-500">
                Si tu souhaites obtenir plus d&apos;informations concernant notre décision, n&apos;hésite pas à nous
                contacter par e-mail.
              </p>
            </div>
          </section>
        ) : (
          <section className="px-6 py-12 sm:py-20">
            <div className="mx-auto max-w-[560px]">
              <h1 className="da-display text-center text-[30px] leading-[1.15] sm:text-[38px]">
                Prendre <span className="text-accent">rendez-vous</span>
              </h1>
              <p className="mt-3 text-center text-[16px] text-slate-500">Choisissez un motif pour voir les créneaux disponibles.</p>

              {settings.bookingBlocked ? (
                <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
                  <p className="da-title text-[18px] text-amber-900">
                    La prise de rendez-vous est actuellement suspendue.
                  </p>
                  {settings.bookingBlockedMessage && (
                    <p className="mt-3 text-[15px] leading-relaxed text-amber-800">{settings.bookingBlockedMessage}</p>
                  )}
                  <div className="mt-6 flex justify-center">
                    <ContactButton />
                  </div>
                </div>
              ) : categories.length === 0 ? (
                <div className="mt-10 rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center">
                  <CalendarDays className="mx-auto mb-3 size-8 text-slate-300" />
                  <p className="da-title text-[18px]">Aucun rendez-vous n&apos;est proposé pour le moment.</p>
                  <p className="mt-2 text-[15px] text-slate-500">Revenez un peu plus tard.</p>
                </div>
              ) : (
                <ul className="mt-10 space-y-3">
                  {categories.map((category, index) => (
                    <li key={category.id}>
                      <Link
                        href={`/rdv/${category.slug}`}
                        className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-accent hover:bg-accent-soft focus-visible:border-accent focus-visible:outline-none sm:p-5"
                      >
                        <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-accent-soft text-sm font-semibold text-accent">
                          {category.thumbnailImageUrl ? (
                            <Image
                              src={category.thumbnailImageUrl}
                              alt=""
                              fill
                              priority={index === 0}
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            category.title
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part) => part[0]?.toUpperCase() ?? "")
                              .join("") || "RDV"
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-[17px] font-semibold leading-snug text-slate-900">
                            {category.title}
                          </span>
                          <span className="mt-0.5 block text-[14px] text-slate-500">
                            {category.durationMinutes} min · {formatAppointmentMode(category.appointmentMode)}
                          </span>
                        </span>

                        <ChevronRight className="size-5 shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </main>

      <PublicFooter showBookingWidget={false} />
    </div>
  );
}

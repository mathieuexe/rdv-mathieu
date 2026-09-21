import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, MapPin, CalendarDays, CheckCircle2 } from "lucide-react";

import { DiscordIcon } from "@/components/shared/discord-icon";
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
          <>
            {/* ---------------------------------------------------------- Hero */}
            <section className="px-6 pb-16 pt-12 sm:pt-16">
              <div className="mx-auto flex max-w-[620px] flex-col items-center">
                <Image
                  src="/images/mathieu-upscale.png"
                  alt="Mathieu Cerenzia"
                  width={76}
                  height={76}
                  priority
                  className="size-[76px] rounded-full border border-slate-200 object-cover object-[45%_47%]"
                />

                <div className="da-pill da-pulse mt-4">Prise de rendez-vous en ligne</div>

                <h1 className="da-display mt-6 text-center text-[32px] leading-[1.15] sm:text-[42px]">
                  Prenez rendez-vous
                  <br />
                  <span className="text-accent">en ligne</span>
                </h1>

                <p className="mt-4 max-w-md text-center text-[16px] leading-relaxed text-slate-900">
                  Choisissez le motif de votre rendez-vous ci-dessous et réservez directement le créneau qui vous
                  convient le mieux.
                </p>

                <div className="mt-10 flex w-full max-w-[560px] flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link href="#motifs" className="da-btn da-btn-primary w-full">
                    Voir les motifs
                    <ArrowRight className="size-5" />
                  </Link>
                  <Link href="/qui-suis-je" className="da-btn da-btn-secondary w-full">
                    Qui suis-je ?
                  </Link>
                </div>

                <p className="mt-4 text-center text-[14px] text-slate-500">
                  Réservation en ligne &nbsp;•&nbsp; Confirmation par email &nbsp;•&nbsp; Annulation depuis votre espace
                </p>
              </div>
            </section>

            {/* ------------------------------------------------------ Motifs */}
            <section id="motifs" className="scroll-mt-24 px-6 py-16 sm:py-20">
              <div className="mx-auto max-w-[960px]">
                <div className="da-reveal mx-auto max-w-[620px] text-center">
                  <p className="da-eyebrow">Les motifs disponibles</p>
                  <h2 className="da-title mt-2 text-[26px] sm:text-[32px]">Choisissez votre rendez-vous</h2>
                  <p className="mt-4 text-[16px] leading-relaxed text-slate-500">
                    Chaque motif a sa propre durée et son propre mode de déroulement. Sélectionnez celui qui correspond à
                    votre besoin.
                  </p>
                </div>

                {settings.bookingBlocked ? (
                  <div className="da-card mt-10 border-amber-200 bg-amber-50 px-6 py-14 text-center">
                    <CalendarDays className="mx-auto mb-4 size-10 text-amber-600" />
                    <p className="da-title text-[20px] text-amber-900">
                      La prise de rendez-vous est actuellement suspendue.
                    </p>
                    {settings.bookingBlockedMessage && (
                      <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-amber-800">
                        {settings.bookingBlockedMessage}
                      </p>
                    )}
                    <div className="mt-8 flex justify-center">
                      <ContactButton />
                    </div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="da-card mt-10 border-dashed px-6 py-14 text-center">
                    <CalendarDays className="mx-auto mb-4 size-10 text-slate-300" />
                    <p className="da-title text-[20px]">Aucun calendrier n&apos;est disponible pour le moment.</p>
                    <p className="mt-2 text-[15px] text-slate-500">
                      Revenez un peu plus tard pour consulter les prochaines disponibilités.
                    </p>
                  </div>
                ) : (
                  <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {categories.map((category, index) => (
                      <Link
                        href={`/rdv/${category.slug}`}
                        key={category.id}
                        className="da-card da-card-hover da-reveal group flex flex-col overflow-hidden"
                      >
                        <div className="relative aspect-[21/9] w-full overflow-hidden border-b border-slate-200 bg-slate-50">
                          {category.bannerImageUrl ? (
                            <Image
                              src={category.bannerImageUrl}
                              alt=""
                              fill
                              priority={index === 0}
                              sizes="(max-width: 640px) 100vw, 50vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <CalendarDays className="size-8 text-slate-300" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex items-start gap-4">
                            <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-accent-soft text-sm font-semibold text-accent">
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
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="da-title text-[18px] transition-colors group-hover:text-accent">
                                {category.title}
                              </h3>
                              <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-slate-500">
                                {category.description}
                              </p>
                            </div>
                          </div>

                          <ul className="mt-5 space-y-2.5 border-t border-slate-200/70 pt-4">
                            <li className="flex items-start gap-2.5 text-[14px] leading-snug text-slate-900">
                              <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
                              <span>{category.durationMinutes} min</span>
                            </li>
                            <li className="flex items-start gap-2.5 text-[14px] leading-snug text-slate-900">
                              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                              <span className="truncate">{formatAppointmentMode(category.appointmentMode)}</span>
                            </li>
                          </ul>

                          <div className="mt-6 flex items-center gap-2 text-[15px] font-semibold text-accent">
                            <span>Prendre rendez-vous</span>
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ------------------------------------------------ Déroulement */}
            <section className="border-y border-slate-200 px-6 py-16 sm:py-20">
              <div className="mx-auto max-w-[960px]">
                <div className="da-reveal mx-auto max-w-[620px] text-center">
                  <p className="da-eyebrow">Comment ça se passe</p>
                  <h2 className="da-title mt-2 text-[26px] sm:text-[32px]">Trois étapes, rien de plus</h2>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    {
                      step: "01",
                      title: "Choisissez un motif",
                      text: "Chaque motif précise la durée du rendez-vous et son mode de déroulement.",
                      points: ["Durée annoncée", "Mode de rendez-vous"],
                    },
                    {
                      step: "02",
                      title: "Réservez un créneau",
                      text: "Le calendrier n'affiche que les créneaux réellement disponibles, à l'heure de Paris.",
                      points: ["Disponibilités en direct", "Fuseau Europe/Paris"],
                    },
                    {
                      step: "03",
                      title: "Recevez la confirmation",
                      text: "Un email provisoire part immédiatement, puis la validation finale vous est envoyée.",
                      points: ["Email de récapitulatif", "Suivi dans votre espace"],
                    },
                  ].map((phase) => (
                    <article key={phase.step} className="da-card da-card-hover da-reveal flex flex-col p-6">
                      <span className="da-step-number">{phase.step}</span>
                      <h3 className="da-title mt-2 text-[18px]">{phase.title}</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{phase.text}</p>
                      <ul className="mt-5 space-y-2.5 border-t border-slate-200/70 pt-4">
                        {phase.points.map((point) => (
                          <li key={point} className="flex items-start gap-2.5 text-[14px] leading-snug text-slate-900">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* --------------------------------------------------- Discord */}
            <section className="px-6 py-16 sm:py-20">
              <div className="da-reveal mx-auto flex max-w-[960px] flex-col items-center text-center">
                <span className="flex size-12 items-center justify-center rounded-full border border-slate-200 bg-accent-soft text-accent">
                  <DiscordIcon className="size-6" />
                </span>
                <p className="da-eyebrow mt-5">La communauté</p>
                <h2 className="da-title mt-2 text-[26px] sm:text-[32px]">Rejoignez le serveur Discord</h2>
                <p className="mt-4 max-w-[560px] text-[16px] leading-relaxed text-slate-500">
                  Venez échanger avec la communauté, partager vos idées et soumettre votre projet directement sur le
                  serveur.
                </p>
                <a
                  href="https://discord.mathieucerenzia.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="da-btn da-btn-primary mt-8"
                >
                  Rejoindre le serveur
                  <ArrowRight className="size-5" />
                </a>
              </div>
            </section>
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

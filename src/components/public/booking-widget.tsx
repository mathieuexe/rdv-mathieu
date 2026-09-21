"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CalendarDays, Clock, MapPin, X } from "lucide-react";

export interface BookingWidgetCategory {
  slug: string;
  title: string;
  durationMinutes: number;
  modeLabel: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
}

interface BookingWidgetProps {
  categories: BookingWidgetCategory[];
  /** Avatar affiché en tête du panneau (photo de profil du praticien). */
  avatarUrl?: string;
  /** Bannière de tête ; à défaut, la première bannière de catégorie est utilisée. */
  bannerUrl?: string;
  hostName?: string;
  hostRole?: string;
}

function getInitials(title: string) {
  return (
    title
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "RDV"
  );
}

export function BookingWidget({
  categories,
  avatarUrl,
  bannerUrl,
  hostName = "Mathieu Cerenzia",
  hostRole = "Prise de rendez-vous en ligne",
}: BookingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const headerBanner = useMemo(
    () => bannerUrl || categories.find((category) => category.bannerUrl)?.bannerUrl,
    [bannerUrl, categories],
  );

  // Fermeture par Échap et par clic à l'extérieur du widget
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  // Inutile sur le tunnel de réservation : l'utilisateur y est déjà
  if (pathname?.startsWith("/rdv") || categories.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    >
      {isOpen && (
        <div
          id="booking-widget-panel"
          role="dialog"
          aria-label="Prendre rendez-vous"
          className="da-widget-pop w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        >
          {/* -------------------------------------------------- Bannière */}
          <div className="relative h-24 w-full overflow-hidden bg-accent-soft">
            {headerBanner ? (
              <Image src={headerBanner} alt="" fill sizes="368px" className="object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-accent/90 via-accent to-slate-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le widget de prise de rendez-vous"
              className="absolute right-2 top-2 rounded-full bg-white/85 p-1.5 text-slate-700 backdrop-blur transition-colors hover:bg-white hover:text-accent"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* -------------------------------------------------- Identité */}
          <div className="px-5 pb-4">
            <div className="-mt-9 flex items-end gap-3">
              <span className="relative flex size-[68px] shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-accent-soft font-serif text-lg font-black text-accent shadow-[0_8px_20px_rgba(15,23,42,0.16)]">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={hostName}
                    fill
                    sizes="68px"
                    className="object-cover object-[45%_47%]"
                  />
                ) : (
                  hostName.charAt(0)
                )}
              </span>

              <span className="min-w-0 pb-1">
                <span className="da-eyebrow block text-[11px]">{hostRole}</span>
                <span className="da-display mt-0.5 block truncate text-[20px] leading-tight">{hostName}</span>
              </span>
            </div>

            <p className="mt-3 text-[13.5px] leading-relaxed text-slate-500">
              Choisissez le motif de votre rendez-vous, puis un créneau dans mon agenda.
            </p>
          </div>

          {/* -------------------------------------------------- Motifs */}
          <div className="max-h-[min(22rem,52dvh)] overflow-y-auto border-t border-slate-200/80 bg-slate-50/60 p-3">
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/rdv/${category.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white p-2.5 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_10px_26px_rgba(48,128,238,0.12)]"
                  >
                    <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-accent-soft text-[13px] font-semibold text-accent">
                      {category.thumbnailUrl ? (
                        <Image src={category.thumbnailUrl} alt="" fill sizes="44px" className="object-cover" />
                      ) : (
                        getInitials(category.title)
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-semibold text-slate-900 transition-colors group-hover:text-accent">
                        {category.title}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5 text-accent" />
                          {category.durationMinutes} min
                        </span>
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                          <MapPin className="size-3.5 shrink-0 text-accent" />
                          <span className="truncate">{category.modeLabel}</span>
                        </span>
                      </span>
                    </span>

                    <ArrowRight className="size-4 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="booking-widget-panel"
        className="da-btn da-btn-primary da-btn-sm rounded-full shadow-[0_10px_30px_rgba(48,128,238,0.3)]"
      >
        {isOpen ? <X className="size-5" /> : <CalendarDays className="size-5" />}
        <span>{isOpen ? "Fermer" : "Prendre rendez-vous"}</span>
      </button>
    </div>
  );
}

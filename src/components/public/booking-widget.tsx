"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CalendarDays, Clock, MapPin, X } from "lucide-react";

export interface BookingWidgetCategory {
  slug: string;
  title: string;
  durationMinutes: number;
  modeLabel: string;
}

interface BookingWidgetProps {
  categories: BookingWidgetCategory[];
}

export function BookingWidget({ categories }: BookingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
          className="da-widget-pop w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(48,128,238,0.18)]"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="da-eyebrow">En quelques clics</p>
              <p className="da-title mt-1 text-[17px]">Choisissez votre motif</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le widget de prise de rendez-vous"
              className="-mr-2 -mt-1 rounded-full p-2 text-slate-400 transition-colors hover:bg-accent-soft hover:text-accent"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="max-h-[min(24rem,60dvh)] overflow-y-auto p-3">
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/rdv/${category.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="group flex flex-col gap-2 rounded-xl border border-slate-200 p-3 transition-all hover:border-accent hover:bg-accent-soft"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[15px] font-semibold text-slate-900 transition-colors group-hover:text-accent">
                        {category.title}
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5 text-accent" />
                        {category.durationMinutes} min
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-accent" />
                        {category.modeLabel}
                      </span>
                    </span>
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

import { AlertTriangle } from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { fr } from "date-fns/locale";

import type { BlackoutPeriod } from "@/types/domain";

interface PublicBlackoutMarqueeProps {
  periods: BlackoutPeriod[];
}

export function PublicBlackoutMarquee({ periods }: PublicBlackoutMarqueeProps) {
  const now = new Date();

  // Filter out periods that are already past
  const upcomingPeriods = periods.filter((period) => {
    const endDateTime = parseISO(`${period.endDate}T${period.endTime}:00`);
    return isAfter(endDateTime, now);
  });

  if (upcomingPeriods.length === 0) {
    return null;
  }

  // Trier par date de début croissante
  upcomingPeriods.sort((a, b) => {
    const startA = parseISO(`${a.startDate}T${a.startTime}:00`);
    const startB = parseISO(`${b.startDate}T${b.startTime}:00`);
    return startA.getTime() - startB.getTime();
  });

  return (
    <div className="bg-slate-900 border-b border-slate-800 overflow-hidden text-white relative z-40">
      <div className="flex items-center px-4 py-2 sm:px-6">
        <div className="flex items-center justify-center shrink-0 mr-4 text-rose-400 bg-slate-800 rounded-full p-1.5 relative z-10">
          <AlertTriangle className="size-4" />
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap flex gap-12 items-center">
            {upcomingPeriods.map((period, index) => {
              const start = parseISO(`${period.startDate}T${period.startTime}:00`);
              const end = parseISO(`${period.endDate}T${period.endTime}:00`);
              
              const formattedStart = format(start, "d MMMM", { locale: fr });
              const formattedEnd = format(end, "d MMMM", { locale: fr });
              const isOngoing = isBefore(start, now) && isAfter(end, now);

              return (
                <span key={index} className="text-sm font-medium inline-flex items-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold mr-2 ${isOngoing ? "bg-rose-500/20 text-rose-300" : "bg-blue-500/20 text-blue-300"}`}>
                    {isOngoing ? "En cours" : "À venir"}
                  </span>
                  <span>
                    Indisponibilité du {formattedStart} au {formattedEnd}
                  </span>
                  {period.message ? <span className="ml-2 text-slate-400">— {period.message}</span> : null}
                </span>
              );
            })}
            
            {/* Dupliquer pour assurer un défilement continu s'il y a peu d'éléments */}
            {upcomingPeriods.length < 3 && upcomingPeriods.map((period, index) => {
              const start = parseISO(`${period.startDate}T${period.startTime}:00`);
              const end = parseISO(`${period.endDate}T${period.endTime}:00`);
              
              const formattedStart = format(start, "d MMMM", { locale: fr });
              const formattedEnd = format(end, "d MMMM", { locale: fr });
              const isOngoing = isBefore(start, now) && isAfter(end, now);

              return (
                <span key={`dup-${index}`} className="text-sm font-medium inline-flex items-center" aria-hidden="true">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold mr-2 ${isOngoing ? "bg-rose-500/20 text-rose-300" : "bg-blue-500/20 text-blue-300"}`}>
                    {isOngoing ? "En cours" : "À venir"}
                  </span>
                  <span>
                    Indisponibilité du {formattedStart} au {formattedEnd}
                  </span>
                  {period.message ? <span className="ml-2 text-slate-400">— {period.message}</span> : null}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
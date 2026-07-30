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
    <div className="bg-rose-600 border-b border-rose-700 text-white relative z-40">
      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left">
          {upcomingPeriods.map((period, index) => {
            const start = parseISO(`${period.startDate}T${period.startTime}:00`);
            const end = parseISO(`${period.endDate}T${period.endTime}:00`);
            
            const formattedStart = format(start, "d MMMM", { locale: fr });
            const formattedEnd = format(end, "d MMMM", { locale: fr });
            const isOngoing = isBefore(start, now) && isAfter(end, now);
            const isSameDay = formattedStart === formattedEnd;

            return (
              <div key={index} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center shrink-0 text-rose-600 bg-white rounded-full p-1 shadow-sm">
                    <AlertTriangle className="size-3.5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-white text-rose-600 uppercase tracking-wide shadow-sm">
                    {isOngoing ? "En cours" : "À venir"}
                  </span>
                </div>
                
                <span className="text-sm font-semibold text-white">
                  {isSameDay 
                    ? `Indisponibilité le ${formattedStart}`
                    : `Indisponibilité du ${formattedStart} au ${formattedEnd}`
                  }
                  {period.message ? <span className="ml-1.5 font-normal opacity-90">— {period.message}</span> : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
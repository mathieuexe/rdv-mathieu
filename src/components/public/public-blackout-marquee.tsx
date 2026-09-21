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
    <div className="relative z-40 border-b border-rose-200 bg-rose-50 text-rose-900">
      <div className="mx-auto max-w-[1120px] px-6 py-3">
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
                  <div className="flex shrink-0 items-center justify-center rounded-full border border-rose-200 bg-white p-1 text-rose-600">
                    <AlertTriangle className="size-3.5" />
                  </div>
                  <span className="rounded-full border border-rose-200 bg-white px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-rose-600 sm:text-[11px]">
                    {isOngoing ? "En cours" : "À venir"}
                  </span>
                </div>
                
                <span className="text-[14px] font-medium text-rose-900">
                  {isSameDay 
                    ? `Indisponibilité le ${formattedStart}`
                    : `Indisponibilité du ${formattedStart} au ${formattedEnd}`
                  }
                  {period.message ? <span className="ml-1.5 font-normal text-rose-700">— {period.message}</span> : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
import { GoogleCalendarIcon } from "@/components/shared/google-calendar-icon";
import { cn } from "@/lib/utils";

interface GoogleCalendarBadgeProps {
  className?: string;
  /** Version compacte : icône seule (utile dans les cellules du calendrier). */
  compact?: boolean;
  label?: string;
}

/** Badge signalant un créneau importé depuis Google Agenda (rendez-vous personnel). */
export function GoogleCalendarBadge({ className, compact = false, label }: GoogleCalendarBadgeProps) {
  const title = label ?? "Importé de Google Agenda";

  if (compact) {
    return (
      <span
        title={title}
        className={cn(
          "inline-flex size-5 shrink-0 items-center justify-center rounded-md border border-violet-200 bg-white",
          className,
        )}
      >
        <GoogleCalendarIcon className="size-3.5" />
        <span className="sr-only">{title}</span>
      </span>
    );
  }

  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700",
        className,
      )}
    >
      <GoogleCalendarIcon className="size-3.5" />
      {title}
    </span>
  );
}

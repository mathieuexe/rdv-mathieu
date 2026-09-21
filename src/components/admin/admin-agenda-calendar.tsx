"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addDays, addMonths, endOfMonth, endOfWeek, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, UserRound } from "lucide-react";

import { GoogleCalendarBadge } from "@/components/shared/google-calendar-badge";
import { cn, formatAppointmentMode, formatDateTimeFr } from "@/lib/utils";
import type { AppointmentCategory, AppointmentRecord, GoogleCalendarEventRecord } from "@/types/domain";

interface AppointmentWithCategory extends AppointmentRecord {
  category?: AppointmentCategory;
}

interface AdminAgendaCalendarProps {
  appointments: AppointmentWithCategory[];
  /** Rendez-vous personnels importés de Google Agenda (indisponibilités). */
  googleEvents?: GoogleCalendarEventRecord[];
}

const weekdayLabels = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];

function getParisDateKey(value: string | Date) {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(typeof value === "string" ? new Date(value) : value);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
}

function createMonthCells(currentMonth: Date) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const cells: Date[] = [];

  for (let cursor = gridStart; cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    cells.push(cursor);
  }

  return cells;
}

/** Clés de jour couvertes par un évènement (un évènement journée entière peut s'étaler). */
function getParisDateKeysBetween(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(new Date(endIso).getTime() - 1);
  const keys: string[] = [];

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    const key = getParisDateKey(cursor);

    if (!keys.includes(key)) {
      keys.push(key);
    }
  }

  const endKey = getParisDateKey(end);

  if (!keys.includes(endKey)) {
    keys.push(endKey);
  }

  return keys;
}

function formatGoogleEventRange(event: GoogleCalendarEventRecord) {
  if (event.isAllDay) {
    return "Journée entière";
  }

  return `${formatDateTimeFr(event.startsAt, { timeStyle: "short" })} - ${formatDateTimeFr(event.endsAt, {
    timeStyle: "short",
  })}`;
}

function getOriginLabel(appointment: AppointmentWithCategory) {
  if (appointment.origin === "administrateur") {
    return appointment.createdByAdminEmail ? `Administration (${appointment.createdByAdminEmail})` : "Administration";
  }

  return "Réservation en ligne";
}

export function AdminAgendaCalendar({ appointments, googleEvents = [] }: AdminAgendaCalendarProps) {
  const sortedAppointments = useMemo(
    () => [...appointments].sort((left, right) => left.startsAt.localeCompare(right.startsAt)),
    [appointments],
  );
  const initialMonth = useMemo(() => {
    if (sortedAppointments.length === 0) {
      return startOfMonth(new Date());
    }

    return startOfMonth(new Date(sortedAppointments[0].startsAt));
  }, [sortedAppointments]);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDateKey, setSelectedDateKey] = useState(
    sortedAppointments[0] ? getParisDateKey(sortedAppointments[0].startsAt) : getParisDateKey(new Date()),
  );

  const appointmentsByDay = useMemo(() => {
    return sortedAppointments.reduce<Record<string, AppointmentWithCategory[]>>((accumulator, appointment) => {
      const dateKey = getParisDateKey(appointment.startsAt);
      accumulator[dateKey] ??= [];
      accumulator[dateKey].push(appointment);
      return accumulator;
    }, {});
  }, [sortedAppointments]);

  const googleEventsByDay = useMemo(() => {
    return [...googleEvents]
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
      .reduce<Record<string, GoogleCalendarEventRecord[]>>((accumulator, event) => {
        for (const dateKey of getParisDateKeysBetween(event.startsAt, event.endsAt)) {
          accumulator[dateKey] ??= [];
          accumulator[dateKey].push(event);
        }

        return accumulator;
      }, {});
  }, [googleEvents]);

  const monthCells = useMemo(() => createMonthCells(currentMonth), [currentMonth]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        month: "long",
        year: "numeric",
      }).format(currentMonth),
    [currentMonth],
  );
  const selectedDayAppointments = appointmentsByDay[selectedDateKey] ?? [];
  const selectedDayGoogleEvents = googleEventsByDay[selectedDateKey] ?? [];
  const totalThisMonth = useMemo(() => {
    const currentMonthPrefix = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
    return sortedAppointments.filter((appointment) => getParisDateKey(appointment.startsAt).startsWith(currentMonthPrefix)).length;
  }, [currentMonth, sortedAppointments]);

  if (appointments.length === 0 && googleEvents.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 px-6 py-14 text-center text-sm text-slate-500">
        Aucun rendez-vous confirmé à afficher dans l&apos;agenda.
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Vue mensuelle</p>
            <h2 className="mt-2 text-2xl font-semibold capitalize text-slate-950">{monthLabel}</h2>
            <p className="mt-2 text-sm text-slate-600">{totalThisMonth} rendez-vous confirmé(s) sur ce mois.</p>
            {googleEvents.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex size-3 rounded-full border border-blue-200 bg-blue-100" />
                  Rendez-vous du site
                </span>
                <GoogleCalendarBadge label="Rendez-vous personnel (Google Agenda)" />
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentMonth((value) => startOfMonth(subMonths(value, 1)))}
              className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition duration-150 hover:border-slate-300 hover:bg-slate-50"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(startOfMonth(new Date()))}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition duration-150 hover:border-slate-300 hover:bg-slate-50"
            >
              Aujourd&apos;hui
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth((value) => startOfMonth(addMonths(value, 1)))}
              className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition duration-150 hover:border-slate-300 hover:bg-slate-50"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70">
          {weekdayLabels.map((label) => (
            <div key={label} className="px-3 py-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {monthCells.map((date) => {
            const dateKey = getParisDateKey(date);
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isSelected = selectedDateKey === dateKey;
            const dayAppointments = appointmentsByDay[dateKey] ?? [];
            const dayGoogleEvents = googleEventsByDay[dateKey] ?? [];

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDateKey(dateKey)}
                className={cn(
                  "min-h-[150px] border-b border-r border-slate-200 p-3 text-left align-top transition duration-150",
                  "last:border-r-0 hover:bg-slate-50/70",
                  isSelected && "bg-blue-50/70",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-full text-sm font-medium",
                      isCurrentMonth ? "text-slate-900" : "text-slate-300",
                      isSelected && "bg-blue-600 text-white",
                    )}
                  >
                    {date.getDate()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {dayGoogleEvents.length > 0 ? <GoogleCalendarBadge compact /> : null}
                    {dayAppointments.length > 0 ? (
                      <span className="text-xs font-medium text-slate-400">{dayAppointments.length}</span>
                    ) : null}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-xl border border-blue-100 bg-blue-50 px-2.5 py-2 text-xs text-slate-700"
                    >
                      <p className="font-semibold text-slate-900">
                        {formatDateTimeFr(appointment.startsAt, { timeStyle: "short" })}
                      </p>
                      <p className="mt-1 truncate">
                        {appointment.firstName} {appointment.lastName}
                      </p>
                      <p className="truncate text-slate-500">{appointment.category?.title ?? "Rendez-vous"}</p>
                    </div>
                  ))}
                  {dayAppointments.length > 3 ? (
                    <p className="text-xs font-medium text-slate-500">+ {dayAppointments.length - 3} autre(s)</p>
                  ) : null}

                  {dayGoogleEvents.slice(0, 2).map((event) => (
                    <div
                      key={`${event.id}-${dateKey}`}
                      className="rounded-xl border border-violet-100 bg-violet-50 px-2.5 py-2 text-xs text-slate-700"
                    >
                      <p className="flex items-center gap-1.5 font-semibold text-violet-900">
                        <GoogleCalendarBadge compact className="size-4 border-violet-200" />
                        {event.isAllDay ? "Journée" : formatDateTimeFr(event.startsAt, { timeStyle: "short" })}
                      </p>
                      <p className="mt-1 truncate text-violet-800">{event.summary}</p>
                      <p className="truncate text-violet-500">Indisponible (perso)</p>
                    </div>
                  ))}
                  {dayGoogleEvents.length > 2 ? (
                    <p className="text-xs font-medium text-violet-500">
                      + {dayGoogleEvents.length - 2} perso
                    </p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-200 pb-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Jour sélectionné</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            {formatDateTimeFr(`${selectedDateKey}T12:00:00`, { dateStyle: "full" })}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {selectedDayAppointments.length === 0
              ? "Aucun rendez-vous confirmé sur cette date."
              : `${selectedDayAppointments.length} rendez-vous confirmé(s) sur cette journée.`}
            {selectedDayGoogleEvents.length > 0
              ? ` ${selectedDayGoogleEvents.length} indisponibilité(s) personnelle(s).`
              : ""}
          </p>
        </div>

        {selectedDayGoogleEvents.length > 0 ? (
          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-500">Agenda personnel</p>
            {selectedDayGoogleEvents.map((event) => (
              <article key={`${event.id}-detail`} className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-violet-950">{event.summary}</p>
                  <GoogleCalendarBadge compact />
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-violet-800">
                  <p className="inline-flex items-center gap-2">
                    <Clock3 className="size-4 text-violet-400" />
                    {formatGoogleEventRange(event)}
                  </p>
                  <p className="text-xs text-violet-600">
                    Ce créneau est bloqué à la réservation{event.calendarSummary ? ` · ${event.calendarSummary}` : ""}.
                  </p>
                  {event.htmlLink ? (
                    <a
                      href={event.htmlLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 underline underline-offset-4"
                    >
                      <span>Ouvrir dans Google Agenda</span>
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          {selectedDayAppointments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
              {selectedDayGoogleEvents.length > 0
                ? "Aucun rendez-vous du site sur cette journée."
                : "Cette journée est libre."}
            </div>
          ) : (
            selectedDayAppointments.map((appointment) => (
              <article key={appointment.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {appointment.firstName} {appointment.lastName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{appointment.category?.title ?? "Rendez-vous"}</p>
                  </div>

                  <Link
                    href={`/admin/rendez-vous/${appointment.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-slate-950 underline underline-offset-4"
                  >
                    <span>Ouvrir</span>
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="inline-flex items-center gap-2">
                    <Clock3 className="size-4 text-slate-400" />
                    {formatDateTimeFr(appointment.startsAt, { timeStyle: "short" })} -{" "}
                    {formatDateTimeFr(appointment.endsAt, { timeStyle: "short" })}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4 text-slate-400" />
                    {appointment.category?.appointmentMode
                      ? formatAppointmentMode(appointment.category.appointmentMode)
                      : "Type non disponible"}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <UserRound className="size-4 text-slate-400" />
                    {getOriginLabel(appointment)}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

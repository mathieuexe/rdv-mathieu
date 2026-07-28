"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3, LoaderCircle, MapPinned, MessageSquareText } from "lucide-react";

import { groupSlotsByDay } from "@/lib/booking";
import { cn, formatAppointmentMode, formatDateTimeFr } from "@/lib/utils";
import type { AppointmentCategory, BookingSlot } from "@/types/domain";

const weekdayHeaders = ["LUN.", "MAR.", "MER.", "JEU.", "VEN.", "SAM.", "DIM."];

interface BookingFormProps {
  category: AppointmentCategory;
  categorySlug: string;
  slots: BookingSlot[];
  helperMessage: string;
  initialUser?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

function toMonthKey(dateKey: string) {
  return dateKey.slice(0, 7);
}

function formatMonthLabel(dateKey: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(new Date(`${dateKey}-01T12:00:00`));
}

function formatSelectedDayLabel(dateKey: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function getCalendarCells(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1, 12, 0, 0);
  const daysInMonth = new Date(year, month, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;

  return [
    ...Array.from({ length: offset }, (_, index) => ({ key: `empty-${index}`, dayNumber: null })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      key: `${monthKey}-${String(index + 1).padStart(2, "0")}`,
      dayNumber: index + 1,
    })),
  ];
}

export function BookingForm({ category, categorySlug, slots, helperMessage, initialUser }: BookingFormProps) {
  const router = useRouter();
  const groupedSlots = useMemo(() => groupSlotsByDay(slots), [slots]);
  const dayEntries = useMemo(
    () =>
      Object.entries(groupedSlots)
        .map(([dateKey, dateSlots]) => ({
          dateKey,
          dateSlots,
          availableCount: dateSlots.filter((slot) => !slot.isBlocked).length,
        }))
        .sort((a, b) => a.dateKey.localeCompare(b.dateKey)),
    [groupedSlots],
  );
  const monthKeys = useMemo(() => Array.from(new Set(dayEntries.map((entry) => toMonthKey(entry.dateKey)))), [dayEntries]);
  const firstAvailableDateKey = dayEntries.find((entry) => entry.availableCount > 0)?.dateKey ?? dayEntries[0]?.dateKey ?? "";
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedDateKey, setSelectedDateKey] = useState(firstAvailableDateKey);
  const [visibleMonthKey, setVisibleMonthKey] = useState(toMonthKey(firstAvailableDateKey || new Date().toISOString().slice(0, 10)));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!selectedDateKey && firstAvailableDateKey) {
      setSelectedDateKey(firstAvailableDateKey);
    }
  }, [selectedDateKey, firstAvailableDateKey]);

  useEffect(() => {
    if (!selectedDateKey) {
      setSelectedSlot("");
      return;
    }

    const currentDaySlots = groupedSlots[selectedDateKey] ?? [];

    if (!currentDaySlots.some((slot) => slot.start === selectedSlot && !slot.isBlocked)) {
      setSelectedSlot("");
    }
  }, [groupedSlots, selectedDateKey, selectedSlot]);

  useEffect(() => {
    if (selectedDateKey) {
      setVisibleMonthKey(toMonthKey(selectedDateKey));
    }
  }, [selectedDateKey]);

  const selectedDay = dayEntries.find((entry) => entry.dateKey === selectedDateKey) ?? null;
  const visibleMonthIndex = Math.max(0, monthKeys.findIndex((monthKey) => monthKey === visibleMonthKey));
  const calendarCells = getCalendarCells(monthKeys[visibleMonthIndex] ?? visibleMonthKey);
  const hasAnyAvailableSlot = dayEntries.some((entry) => entry.availableCount > 0);
  const initials = category.title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");

    const payload = {
      categorySlug,
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
      startsAt: selectedSlot,
    };

    const response = await fetch("/api/public/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { success?: boolean; error?: string };

    if (!response.ok) {
      setError(data.error ?? "Une erreur est survenue lors de l'envoi.");
      setIsSubmitting(false);
      return;
    }

    const params = new URLSearchParams({
      slot: payload.startsAt,
      firstName: payload.firstName,
    });

    router.push(`/rdv/${categorySlug}/confirmation?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="grid lg:grid-cols-[250px_minmax(0,1fr)_220px]">
          <aside className="border-b border-neutral-200 bg-[#fafaf9] p-6 lg:border-b-0 lg:border-r">
            <a href="/" className="text-sm text-neutral-500 underline underline-offset-4">
              Retour à l'accueil
            </a>
            <div className="mt-6 flex size-14 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
              {initials || "RDV"}
            </div>
            <p className="mt-4 text-sm text-neutral-500">{category.title}</p>
            <h1 className="mt-2 text-3xl font-semibold text-neutral-950">{category.title}</h1>

            <div className="mt-4 flex items-center gap-2 text-sm text-neutral-600">
              <Clock3 className="size-4" />
              <span>{category.durationMinutes} min</span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
              <MapPinned className="size-4" />
              <span>{formatAppointmentMode(category.appointmentMode)}</span>
            </div>

            <p className="mt-5 text-sm leading-7 text-neutral-600">{category.description}</p>

            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600">
              <p className="font-medium text-neutral-900">Lien direct</p>
              <p className="mt-1 break-all">/rdv/{categorySlug}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600">
              <p className="font-medium text-neutral-900">Information</p>
              <p className="mt-1">{helperMessage}</p>
            </div>
          </aside>

          <section className="border-b border-neutral-200 p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-5 text-neutral-700" />
              <div>
                <p className="text-lg font-semibold text-neutral-950">Sélectionnez la date et l'heure</p>
                <p className="text-sm text-neutral-500">Choisissez d'abord un jour, puis un créneau disponible.</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-neutral-500">
                  {formatMonthLabel(monthKeys[visibleMonthIndex] ?? visibleMonthKey)}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleMonthKey(monthKeys[Math.max(0, visibleMonthIndex - 1)] ?? visibleMonthKey)}
                    disabled={visibleMonthIndex === 0}
                    className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleMonthKey(monthKeys[Math.min(monthKeys.length - 1, visibleMonthIndex + 1)] ?? visibleMonthKey)
                    }
                    disabled={visibleMonthIndex >= monthKeys.length - 1}
                    className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-7 gap-y-4 text-center text-xs uppercase tracking-[0.12em] text-neutral-400">
                {weekdayHeaders.map((label) => (
                  <div key={label}>{label}</div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-7 gap-y-3 text-center">
                {calendarCells.map((cell) => {
                  if (cell.dayNumber === null) {
                    return <div key={cell.key} className="h-10" />;
                  }

                  const entry = dayEntries.find((item) => item.dateKey === cell.key);
                  const isSelected = selectedDateKey === cell.key;
                  const isDisabled = !entry || entry.availableCount === 0;

                  return (
                    <div key={cell.key} className="flex justify-center">
                      <button
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedDateKey(cell.key)}
                        className={cn(
                          "flex size-10 items-center justify-center rounded-full text-sm transition",
                          isDisabled && "cursor-not-allowed text-neutral-300",
                          !isDisabled && !isSelected && "text-neutral-700 hover:bg-neutral-100",
                          isSelected && "bg-sky-500 text-white",
                        )}
                      >
                        {cell.dayNumber}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-sm text-neutral-500">
                Heure d'Europe, Paris (24h)
              </div>
            </div>
          </section>

          <section className="p-6">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                {selectedDay ? formatSelectedDayLabel(selectedDay.dateKey) : "Aucun jour disponible"}
              </p>
            </div>

            <div className="mt-4 max-h-[460px] space-y-3 overflow-y-auto pr-1">
              {selectedDay ? (
                selectedDay.dateSlots.map((slot) => {
                  const active = selectedSlot === slot.start;

                  return (
                    <button
                      key={slot.start}
                      type="button"
                      disabled={slot.isBlocked}
                      onClick={() => setSelectedSlot(slot.start)}
                      className={cn(
                        "flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition",
                        slot.isBlocked
                          ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-950",
                        active && "border-sky-500 bg-sky-500 text-white",
                      )}
                    >
                      {slot.label}
                    </button>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-6 text-sm text-neutral-500">
                  {hasAnyAvailableSlot
                    ? "Sélectionnez une date dans le calendrier."
                    : "Aucun créneau n'est disponible pour le moment."}
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-3">
          <MessageSquareText className="size-5 text-neutral-700" />
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Vos informations</p>
            <p className="text-sm text-neutral-600">La demande reste en attente tant qu'elle n'est pas validée.</p>
          </div>
        </div>

        <form action={handleSubmit} className="mt-6 space-y-4">
          <input type="hidden" name="selectedSlot" value={selectedSlot} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-neutral-700">
              <span>Prénom</span>
              <input
                name="firstName"
                required
                defaultValue={initialUser?.firstName ?? ""}
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-neutral-900 focus:bg-white"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-neutral-700">
              <span>Nom</span>
              <input
                name="lastName"
                required
                defaultValue={initialUser?.lastName ?? ""}
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-neutral-900 focus:bg-white"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-neutral-700">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={initialUser?.email ?? ""}
              readOnly={Boolean(initialUser?.email)}
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-neutral-900 focus:bg-white"
            />
          </label>

          {initialUser?.email ? (
            <p className="text-xs text-neutral-500">L'email du compte connecté est utilisé pour rattacher vos rendez-vous.</p>
          ) : null}

          <label className="space-y-2 text-sm font-medium text-neutral-700">
            <span>Téléphone</span>
            <input
              name="phone"
              type="tel"
              required
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-neutral-900 focus:bg-white"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-neutral-700">
            <span>Message optionnel</span>
            <textarea
              name="message"
              rows={4}
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-neutral-900 focus:bg-white"
            />
          </label>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-800">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="size-4 text-neutral-700" />
              <span>
                {selectedSlot ? "Créneau sélectionné" : "Sélectionnez un créneau avant d'envoyer votre demande"}
              </span>
            </div>
            <p className="mt-2 text-neutral-600">
              {selectedSlot ? formatDateTimeFr(selectedSlot, { dateStyle: "full", timeStyle: "short" }) : "Le récapitulatif du rendez-vous apparaîtra ici."}
            </p>
          </div>

          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={!selectedSlot || isSubmitting || !hasAnyAvailableSlot}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
            <span>{isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}</span>
          </button>
        </form>
      </section>
    </div>
  );
}

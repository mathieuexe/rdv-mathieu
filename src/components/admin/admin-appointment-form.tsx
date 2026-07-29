"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPinned } from "lucide-react";

import { groupSlotsByDay } from "@/lib/booking";
import { cn, formatAppointmentMode } from "@/lib/utils";
import type { AppointmentCategory, BookingSlot } from "@/types/domain";

interface AdminAppointmentFormProps {
  categories: AppointmentCategory[];
  action: (formData: FormData) => Promise<void>;
}

const weekdayHeaders = ["LUN.", "MAR.", "MER.", "JEU.", "VEN.", "SAM.", "DIM."];

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

export function AdminAppointmentForm({ categories, action }: AdminAppointmentFormProps) {
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSlots() {
      if (!categorySlug) {
        setSlots([]);
        return;
      }

      setLoading(true);
      setError("");
      setSelectedSlot("");

      const response = await fetch(`/api/public/availability/${categorySlug}`);
      const data = (await response.json()) as { slots?: BookingSlot[]; error?: string };

      if (!response.ok) {
        setError(data.error ?? "Impossible de charger les disponibilites.");
        setSlots([]);
        setLoading(false);
        return;
      }

      setSlots(data.slots ?? []);
      setLoading(false);
    }

    void loadSlots();
  }, [categorySlug]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.slug === categorySlug) ?? null,
    [categories, categorySlug],
  );
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
  const [selectedDateKey, setSelectedDateKey] = useState(firstAvailableDateKey);
  const [visibleMonthKey, setVisibleMonthKey] = useState(
    toMonthKey(firstAvailableDateKey || new Date().toISOString().slice(0, 10)),
  );

  useEffect(() => {
    setSelectedDateKey(firstAvailableDateKey);
  }, [firstAvailableDateKey]);

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

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Création</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Créer un rendez-vous</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          L&apos;administrateur peut réserver directement un créneau disponible au nom d&apos;un client.
        </p>
      </div>

      <form action={action} className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-5">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Catégorie</span>
            <select
              name="categorySlug"
              value={categorySlug}
              onChange={(event) => setCategorySlug(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Prénom</span>
              <input
                name="firstName"
                required
                className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Nom</span>
              <input
                name="lastName"
                required
                className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Téléphone</span>
            <input
              name="phone"
              type="tel"
              required
              className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Message</span>
            <textarea
              name="message"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </label>
        </div>

        <div className="space-y-5">
          <input type="hidden" name="startsAt" value={selectedSlot} />

          <div className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Disponibilités</p>
              {selectedCategory ? (
                <>
                  <p className="text-lg font-semibold text-slate-950">{selectedCategory.title}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="size-4" />
                      {selectedCategory.durationMinutes} min
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPinned className="size-4" />
                      {formatAppointmentMode(selectedCategory.appointmentMode)}
                    </span>
                  </div>
                </>
              ) : null}
            </div>
            {loading ? <p className="mt-3 text-sm text-slate-600">Chargement...</p> : null}
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <div className="flex items-center gap-3">
                  <CalendarDays className="size-5 text-slate-700" />
                  <div>
                    <p className="text-lg font-semibold text-slate-950">Sélectionnez la date et l&apos;heure</p>
                    <p className="text-sm text-slate-500">Le sélecteur reprend la même logique que sur le site public.</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-500">
                      {formatMonthLabel(monthKeys[visibleMonthIndex] ?? visibleMonthKey)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVisibleMonthKey(monthKeys[Math.max(0, visibleMonthIndex - 1)] ?? visibleMonthKey)}
                        disabled={visibleMonthIndex === 0}
                        className="flex size-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleMonthKey(monthKeys[Math.min(monthKeys.length - 1, visibleMonthIndex + 1)] ?? visibleMonthKey)
                        }
                        disabled={visibleMonthIndex >= monthKeys.length - 1}
                        className="flex size-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-7 gap-y-4 text-center text-xs uppercase tracking-[0.12em] text-slate-400">
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
                              isDisabled && "cursor-not-allowed text-slate-300",
                              !isDisabled && !isSelected && "text-slate-700 hover:bg-slate-100",
                              isSelected && "bg-sky-500 text-white",
                            )}
                          >
                            {cell.dayNumber}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 text-sm text-slate-500">Heure d&apos;Europe, Paris (24h)</div>
                </div>
              </div>

              <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
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
                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-950",
                          active && "border-sky-500 bg-sky-500 text-white",
                        )}
                      >
                        {slot.label}
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                    {hasAnyAvailableSlot
                      ? "Sélectionnez une date dans le calendrier."
                      : "Aucun créneau n'est disponible pour le moment."}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedSlot}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Créer le rendez-vous
          </button>
        </div>
      </form>
    </section>
  );
}

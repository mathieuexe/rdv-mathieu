"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPinned } from "lucide-react";

import { CalendarLegend } from "@/components/shared/calendar-legend";
import { groupSlotsByDay } from "@/lib/booking";
import { cn, formatAppointmentMode } from "@/lib/utils";
import type { AppointmentCategory, BookingSlot, UserProfileRecord } from "@/types/domain";

interface AdminAppointmentFormProps {
  categories: AppointmentCategory[];
  registeredClients: UserProfileRecord[];
  action: (formData: FormData) => Promise<void>;
  errorMessage?: string;
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

export function AdminAppointmentForm({ categories, registeredClients, action, errorMessage }: AdminAppointmentFormProps) {
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [linkedUserId, setLinkedUserId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [updateLinkedUserProfile, setUpdateLinkedUserProfile] = useState(false);
  const [createClientAccount, setCreateClientAccount] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [visibleMonthKey, setVisibleMonthKey] = useState(toMonthKey(new Date().toISOString().slice(0, 10)));
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
        setError(data.error ?? "Impossible de charger les disponibilités.");
        setSlots([]);
        setLoading(false);
        return;
      }

      const nextSlots = data.slots ?? [];
      const nextGroupedSlots = groupSlotsByDay(nextSlots);
      const nextDayEntries = Object.entries(nextGroupedSlots)
        .map(([dateKey, dateSlots]) => ({
          dateKey,
          availableCount: dateSlots.filter((slot) => !slot.isBlocked).length,
        }))
        .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
      const nextFirstAvailableDateKey =
        nextDayEntries.find((entry) => entry.availableCount > 0)?.dateKey ?? nextDayEntries[0]?.dateKey ?? "";

      setSlots(nextSlots);
      setSelectedDateKey(nextFirstAvailableDateKey);
      setVisibleMonthKey(toMonthKey(nextFirstAvailableDateKey || new Date().toISOString().slice(0, 10)));
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
  const selectedDay = dayEntries.find((entry) => entry.dateKey === selectedDateKey) ?? null;
  const visibleMonthIndex = Math.max(0, monthKeys.findIndex((monthKey) => monthKey === visibleMonthKey));
  const calendarCells = getCalendarCells(monthKeys[visibleMonthIndex] ?? visibleMonthKey);
  const hasAnyAvailableSlot = dayEntries.some((entry) => entry.availableCount > 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const selectedClient = useMemo(
    () => registeredClients.find((client) => client.userId === linkedUserId) ?? null,
    [registeredClients, linkedUserId],
  );
  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();

    if (!query) {
      return registeredClients;
    }

    const matches = registeredClients.filter((client) =>
      `${client.firstName} ${client.lastName} ${client.email}`.toLowerCase().includes(query),
    );

    if (selectedClient && !matches.some((client) => client.userId === selectedClient.userId)) {
      return [selectedClient, ...matches];
    }

    return matches;
  }, [clientSearch, registeredClients, selectedClient]);

  function handleClientChange(nextUserId: string) {
    setLinkedUserId(nextUserId);
    setUpdateLinkedUserProfile(false);
    setCreateClientAccount(false);

    const nextClient = registeredClients.find((client) => client.userId === nextUserId);

    if (!nextClient) {
      return;
    }

    setFirstName(nextClient.firstName);
    setLastName(nextClient.lastName);
    setEmail(nextClient.email);
    setPhone(nextClient.phone ?? "");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Créer un rendez-vous</h1>
          <p className="mt-1 text-sm text-slate-500">
            L&apos;administrateur peut réserver directement un créneau disponible au nom d&apos;un client.
          </p>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <form action={action} className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Client Info Card */}
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="font-semibold text-slate-800">Informations Client</h2>
            </div>
            <div className="space-y-5 p-4 md:p-6">
              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Client déjà inscrit</span>
                <input
                  type="search"
                  value={clientSearch}
                  onChange={(event) => setClientSearch(event.target.value)}
                  placeholder="Rechercher par nom, prénom ou email"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <select
                  name="linkedUserId"
                  value={linkedUserId}
                  onChange={(event) => handleClientChange(event.target.value)}
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Aucun lien client</option>
                  {filteredClients.map((client) => (
                    <option key={client.userId} value={client.userId}>
                      {client.firstName} {client.lastName} - {client.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  Si vous sélectionnez un client inscrit, ce rendez-vous apparaîtra aussi dans son espace personnel.
                </p>
                {clientSearch.trim() && filteredClients.length === 0 ? (
                  <p className="text-xs text-amber-700">Aucun client ne correspond à votre recherche.</p>
                ) : null}
              </label>

              {selectedClient ? (
                <label className="block rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-700">
                  <span className="flex items-start gap-3">
                    <input
                      name="updateLinkedUserProfile"
                      type="checkbox"
                      checked={updateLinkedUserProfile}
                      onChange={(event) => setUpdateLinkedUserProfile(event.target.checked)}
                      className="mt-0.5 size-4 rounded border-slate-300 text-blue-600"
                    />
                    <span>
                      <span className="block font-medium text-slate-900">Mettre aussi à jour la fiche client</span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        Si cette option est cochée, les informations du client seront mises à jour.
                      </span>
                    </span>
                  </span>
                </label>
              ) : (
                <label className="block rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-slate-700">
                  <span className="flex items-start gap-3">
                    <input
                      name="createClientAccount"
                      type="checkbox"
                      checked={createClientAccount}
                      onChange={(event) => setCreateClientAccount(event.target.checked)}
                      className="mt-0.5 size-4 rounded border-slate-300 text-emerald-600"
                    />
                    <span>
                      <span className="block font-medium text-slate-900">Créer aussi un compte client</span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        Le client recevra un email avec un mot de passe temporaire.
                      </span>
                    </span>
                  </span>
                </label>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  <span>Prénom</span>
                  <input
                    name="firstName"
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>

                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  <span>Nom</span>
                  <input
                    name="lastName"
                    required
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              </div>

              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Téléphone</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>

              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Message</span>
                <textarea
                  name="message"
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>
            </div>
          </section>
        </div>

        {/* Calendar and Slots Card */}
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="font-semibold text-slate-800">Planification</h2>
            </div>
            <div className="space-y-5 p-4">
              <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                <span>Catégorie</span>
                <select
                  name="categorySlug"
                  value={categorySlug}
                  onChange={(event) => setCategorySlug(event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>

              <input type="hidden" name="startsAt" value={selectedSlot} />

              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-2">
                  {selectedCategory ? (
                    <>
                      <p className="font-medium text-slate-900">{selectedCategory.title}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="size-3.5" />
                          {selectedCategory.durationMinutes} min
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPinned className="size-3.5" />
                          {formatAppointmentMode(selectedCategory.appointmentMode)}
                        </span>
                      </div>
                    </>
                  ) : null}
                </div>
                {loading ? <p className="mt-3 text-sm text-slate-600">Chargement...</p> : null}
                {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {formatMonthLabel(monthKeys[visibleMonthIndex] ?? visibleMonthKey)}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setVisibleMonthKey(monthKeys[Math.max(0, visibleMonthIndex - 1)] ?? visibleMonthKey)}
                        disabled={visibleMonthIndex === 0}
                        className="flex size-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleMonthKey(monthKeys[Math.min(monthKeys.length - 1, visibleMonthIndex + 1)] ?? visibleMonthKey)
                        }
                        disabled={visibleMonthIndex >= monthKeys.length - 1}
                        className="flex size-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-y-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {weekdayHeaders.map((label) => (
                      <div key={label}>{label.slice(0, 3)}</div>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
                    {calendarCells.map((cell) => {
                      if (cell.dayNumber === null) {
                        return <div key={cell.key} className="h-8" />;
                      }

                      const entry = dayEntries.find((item) => item.dateKey === cell.key);
                      const isSelected = selectedDateKey === cell.key;
                      const isDisabled = !entry || entry.availableCount === 0;
                      const isPastDay = cell.key < todayKey;
                      const isBlackoutDay =
                        !!entry &&
                        entry.availableCount === 0 &&
                        entry.dateSlots.some((slot) => slot.reason?.toLowerCase().includes("indispon"));

                      return (
                        <div key={cell.key} className="flex justify-center">
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => setSelectedDateKey(cell.key)}
                            className={cn(
                              "flex size-8 items-center justify-center rounded text-sm transition-colors",
                              isDisabled && isPastDay && "cursor-not-allowed bg-slate-50 text-slate-400",
                              isDisabled && !isPastDay && !isBlackoutDay && "cursor-not-allowed text-slate-300",
                              isDisabled && isBlackoutDay && "cursor-not-allowed bg-rose-50 text-rose-700",
                              !isDisabled && !isSelected && "bg-white text-slate-700 hover:bg-slate-100",
                              isSelected && "bg-blue-600 text-white font-medium",
                            )}
                          >
                            {cell.dayNumber}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <CalendarLegend className="mt-4 scale-90 origin-left" />
                </div>
              </div>

              <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
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
                          "flex w-full items-center justify-center rounded-md border px-3 py-2 text-sm transition-colors",
                          slot.isBlocked
                            ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50",
                          active && "border-blue-600 bg-blue-600 text-white font-medium hover:bg-blue-700 hover:border-blue-700 hover:text-white",
                        )}
                      >
                        {slot.label}
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-md border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                    {hasAnyAvailableSlot
                      ? "Sélectionnez une date."
                      : "Aucun créneau disponible."}
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-slate-200 bg-slate-50 p-4">
              <button
                type="submit"
                disabled={!selectedSlot}
                className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Créer le rendez-vous
              </button>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}

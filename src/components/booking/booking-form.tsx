"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  LoaderCircle,
  Video,
} from "lucide-react";

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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [firstName, setFirstName] = useState(initialUser?.firstName ?? "");
  const [lastName, setLastName] = useState(initialUser?.lastName ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!selectedDateKey && firstAvailableDateKey) {
      setSelectedDateKey(firstAvailableDateKey);
    }
  }, [selectedDateKey, firstAvailableDateKey]);

  useEffect(() => {
    if (!selectedDateKey) {
      setSelectedSlot("");
      setCurrentStep(1);
      return;
    }

    const currentDaySlots = groupedSlots[selectedDateKey] ?? [];

    if (!currentDaySlots.some((slot) => slot.start === selectedSlot && !slot.isBlocked)) {
      setSelectedSlot("");
      setCurrentStep(1);
    }
  }, [groupedSlots, selectedDateKey, selectedSlot]);

  useEffect(() => {
    if (selectedDateKey) {
      setVisibleMonthKey(toMonthKey(selectedDateKey));
    }
  }, [selectedDateKey]);

  const selectedDay = dayEntries.find((entry) => entry.dateKey === selectedDateKey) ?? null;
  const selectedSlotDetails = selectedDay?.dateSlots.find((slot) => slot.start === selectedSlot) ?? null;
  const visibleMonthIndex = Math.max(0, monthKeys.findIndex((monthKey) => monthKey === visibleMonthKey));
  const calendarCells = getCalendarCells(monthKeys[visibleMonthIndex] ?? visibleMonthKey);
  const hasAnyAvailableSlot = dayEntries.some((entry) => entry.availableCount > 0);
  const initials = category.title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  function validateStepTwo() {
    if (firstName.trim().length < 2) {
      return "Le prénom est requis.";
    }

    if (lastName.trim().length < 2) {
      return "Le nom est requis.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Veuillez saisir un email valide.";
    }

    if (phone.trim().length < 8) {
      return "Le téléphone est requis.";
    }

    return null;
  }

  function handleSelectSlot(slotStart: string) {
    setSelectedSlot(slotStart);
    setCurrentStep(2);
    setError("");
  }

  function handleContinueToRecap() {
    const validationError = validateStepTwo();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setCurrentStep(3);
  }

  async function handleSubmit() {
    if (!selectedSlot) {
      setError("Sélectionnez un créneau avant de confirmer.");
      setCurrentStep(1);
      return;
    }

    const validationError = validateStepTwo();

    if (validationError) {
      setError(validationError);
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload = {
      categorySlug,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
      startsAt: selectedSlot,
    };

    let response: Response;

    try {
      response = await fetch("/api/public/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch {
      setError("Impossible de contacter le serveur pour le moment.");
      setIsSubmitting(false);
      return;
    }

    let data: { success?: boolean; error?: string } = {};

    try {
      data = (await response.json()) as { success?: boolean; error?: string };
    } catch {
      data = {};
    }

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
    <div className="mx-auto max-w-[1120px] space-y-6">
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)_240px]">
          <aside className="border-b border-gray-200 bg-white p-6 lg:border-r lg:border-b-0 lg:p-8">
            {category.bannerImageUrl ? (
              <div className="-m-6 mb-6 overflow-hidden border-b border-gray-200 bg-gray-100 rounded-t-2xl lg:-m-8 lg:mb-8 lg:rounded-tr-none">
                <div className="h-[240px] w-full">
                  <img src={category.bannerImageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              </div>
            ) : (
              <div className="-m-6 mb-6 h-[240px] rounded-t-2xl border-b border-gray-200 bg-gray-100 lg:-m-8 lg:mb-8 lg:rounded-tr-none" />
            )}

            <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 text-sm font-semibold text-gray-900">
              {category.thumbnailImageUrl ? (
                <img src={category.thumbnailImageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials || "RDV"
              )}
            </div>
            <p className="mt-4 text-lg font-bold text-gray-950">{category.title}</p>
            <p className="mt-2 text-sm leading-6 text-gray-500">{category.description}</p>

            <div className="mt-6 space-y-3 text-sm text-gray-500">
              <div className="flex items-start gap-3">
                <CheckSquare className="mt-0.5 size-4 shrink-0 text-gray-500" />
                <span>{helperMessage}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-4 shrink-0 text-gray-500" />
                <span>{category.durationMinutes} min</span>
              </div>
              <div className="flex items-center gap-3">
                <Video className="size-4 shrink-0 text-gray-500" />
                <span>{formatAppointmentMode(category.appointmentMode)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="size-4 shrink-0 text-gray-500" />
                <span>Europe, Paris (24h)</span>
              </div>
            </div>

          </aside>

          <section
            className={cn(
              "border-b border-gray-200 p-6 lg:border-b-0 lg:p-8",
              currentStep === 1 ? "lg:border-r" : "lg:col-span-2",
            )}
          >
            {currentStep === 1 ? (
              <>
                <div className="flex items-center gap-3">
                  <CalendarDays className="size-5 text-gray-500" />
                  <div>
                    <p className="text-lg font-semibold text-gray-950">Sélectionnez la date et l'heure</p>
                    <p className="text-sm text-gray-500">Choisissez d'abord un jour, puis un créneau disponible.</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold capitalize text-gray-900">
                      {formatMonthLabel(monthKeys[visibleMonthIndex] ?? visibleMonthKey)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVisibleMonthKey(monthKeys[Math.max(0, visibleMonthIndex - 1)] ?? visibleMonthKey)}
                        disabled={visibleMonthIndex === 0}
                        className="flex size-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all duration-150 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleMonthKey(monthKeys[Math.min(monthKeys.length - 1, visibleMonthIndex + 1)] ?? visibleMonthKey)
                        }
                        disabled={visibleMonthIndex >= monthKeys.length - 1}
                        className="flex size-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all duration-150 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wide text-gray-400">
                    {weekdayHeaders.map((label) => (
                      <div key={label}>{label}</div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-2 text-center">
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
                              "flex size-10 items-center justify-center rounded-lg text-sm transition-all duration-150",
                              isDisabled && "cursor-not-allowed text-gray-300",
                              !isDisabled && !isSelected && "bg-gray-100 text-gray-700 hover:bg-gray-200",
                              isSelected && "bg-black text-white shadow-sm",
                            )}
                          >
                            {cell.dayNumber}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                    Heure d&apos;Europe, Paris (24h)
                  </div>
                </div>
              </>
            ) : currentStep === 2 ? (
              <div className="mx-auto max-w-2xl space-y-5">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-gray-950">Vos informations</p>
                  <p className="text-sm text-gray-500">
                    {selectedSlot
                      ? `Créneau choisi : ${formatDateTimeFr(selectedSlot, { dateStyle: "full", timeStyle: "short" })}`
                      : "Complétez vos informations pour continuer."}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-gray-700">
                    <span>Prénom</span>
                    <input
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all duration-150 focus:border-black"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-gray-700">
                    <span>Nom</span>
                    <input
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all duration-150 focus:border-black"
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm font-medium text-gray-700">
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all duration-150 focus:border-black"
                  />
                </label>

                {initialUser?.email ? (
                  <p className="text-xs text-gray-500">
                    Les champs préremplis peuvent être corrigés avant la confirmation du rendez-vous.
                  </p>
                ) : null}

                <label className="space-y-2 text-sm font-medium text-gray-700">
                  <span>Téléphone</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all duration-150 focus:border-black"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-gray-700">
                  <span>Message optionnel</span>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all duration-150 focus:border-black"
                  />
                </label>

                {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setError("");
                    }}
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-all duration-150 hover:bg-gray-50"
                  >
                    Modifier le créneau
                  </button>
                  <button
                    type="button"
                    onClick={handleContinueToRecap}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-gray-900"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-5">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-5">
                  <p className="text-sm font-semibold text-gray-900">Récapitulatif</p>
                  <dl className="mt-4 space-y-3 text-sm text-gray-600">
                    <div>
                      <dt className="font-medium text-gray-900">Catégorie</dt>
                      <dd>{category.title}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Date et heure</dt>
                      <dd>
                        {selectedSlotDetails
                          ? formatDateTimeFr(selectedSlotDetails.start, { dateStyle: "full", timeStyle: "short" })
                          : "Aucun créneau sélectionné"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Nom</dt>
                      <dd>{firstName} {lastName}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Email</dt>
                      <dd>{email}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Téléphone</dt>
                      <dd>{phone}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Message</dt>
                      <dd>{message.trim() || "Aucun message"}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-5 text-sm text-gray-800">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckSquare className="size-4 text-gray-500" />
                    <span>Confirmation</span>
                  </div>
                  <p className="mt-2 text-gray-600">
                    En confirmant, votre demande sera enregistrée puis transmise pour validation.
                  </p>
                </div>

                {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(2);
                      setError("");
                    }}
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-all duration-150 hover:bg-gray-50"
                  >
                    Modifier les informations
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                    <span>{isSubmitting ? "Confirmation..." : "Confirmer la demande"}</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {currentStep === 1 ? (
            <section className="p-6 lg:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900">Créneaux horaires</p>
                <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs font-medium text-gray-500">
                  <span className="rounded-full px-3 py-1 text-gray-500">12h</span>
                  <span className="rounded-full bg-white px-3 py-1 text-gray-900 shadow-sm">24h</span>
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
                        onClick={() => handleSelectSlot(slot.start)}
                        className={cn(
                          "flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium transition-all duration-150",
                          slot.isBlocked
                            ? "cursor-not-allowed bg-gray-50 text-gray-300"
                            : "bg-white text-gray-700 hover:border-black hover:bg-gray-50 hover:text-gray-950",
                          active && "border-black bg-black text-white hover:bg-black hover:text-white",
                        )}
                      >
                        {slot.label}
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500">
                    {hasAnyAvailableSlot
                      ? "Sélectionnez une date dans le calendrier."
                      : "Aucun créneau n'est disponible pour le moment."}
                  </div>
                )}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}

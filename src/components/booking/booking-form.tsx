"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { cn, formatAppointmentMode, formatDateTimeFr, formatPhone } from "@/lib/utils";
import { PhoneInput } from "@/components/ui/phone-input";
import type { AppointmentCategory, BookingSlot } from "@/types/domain";

const weekdayHeaders = ["LUN.", "MAR.", "MER.", "JEU.", "VEN.", "SAM.", "DIM."];

interface BookingFormProps {
  category: AppointmentCategory;
  categorySlug: string;
  slots: BookingSlot[];
  helperMessage: string;
  isAuthenticated?: boolean;
  initialUser?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
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

export function BookingForm({ category, categorySlug, slots, helperMessage, isAuthenticated, initialUser }: BookingFormProps) {
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
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [firstName, setFirstName] = useState(initialUser?.firstName ?? "");
  const [lastName, setLastName] = useState(initialUser?.lastName ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [phone, setPhone] = useState(initialUser?.phone ?? "");
  const [message, setMessage] = useState("");
  const shouldSuggestSavedPhone = category.appointmentMode === "telephone" && Boolean(initialUser?.phone?.trim());
  const [phoneConfirmation, setPhoneConfirmation] = useState<"pending" | "yes" | "no">(shouldSuggestSavedPhone ? "pending" : "yes");
  const activeDateKey = selectedDateKey || firstAvailableDateKey;
  const selectedDay = dayEntries.find((entry) => entry.dateKey === activeDateKey) ?? null;
  const hasValidSelectedSlot = selectedDay?.dateSlots.some((slot) => slot.start === selectedSlot && !slot.isBlocked) ?? false;
  const activeSelectedSlot = hasValidSelectedSlot ? selectedSlot : "";
  const activeStep = activeSelectedSlot ? currentStep : 1;
  const selectedSlotDetails = selectedDay?.dateSlots.find((slot) => slot.start === activeSelectedSlot) ?? null;
  const visibleMonthIndex = Math.max(0, monthKeys.findIndex((monthKey) => monthKey === visibleMonthKey));
  const calendarCells = getCalendarCells(monthKeys[visibleMonthIndex] ?? visibleMonthKey);
  const hasAnyAvailableSlot = dayEntries.some((entry) => entry.availableCount > 0);
  const todayKey = new Date().toISOString().slice(0, 10);
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

  function handleSelectDate(dateKey: string) {
    setSelectedDateKey(dateKey);
    setVisibleMonthKey(toMonthKey(dateKey));
    setSelectedSlot("");
    setCurrentStep(1);
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
    if (!activeSelectedSlot) {
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
      startsAt: activeSelectedSlot,
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
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)_240px]">
          <aside className="border-b border-slate-200 bg-white p-6 lg:border-r lg:border-b-0 lg:p-8">
            {category.bannerImageUrl ? (
              <div className="relative -m-6 mb-6 overflow-hidden border-b border-slate-200 bg-slate-100 rounded-t-2xl lg:-m-8 lg:mb-8 lg:rounded-tr-none">
                <div className="relative h-[240px] w-full">
                  <Image src={category.bannerImageUrl} alt="" fill sizes="(max-width: 1024px) 100vw, 280px" className="object-cover object-center" priority />
                </div>
              </div>
            ) : (
              <div className="-m-6 mb-6 h-[240px] rounded-t-2xl border-b border-slate-200 bg-slate-100 lg:-m-8 lg:mb-8 lg:rounded-tr-none" />
            )}

            <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-900">
              {category.thumbnailImageUrl ? (
                <Image src={category.thumbnailImageUrl} alt="" fill priority sizes="64px" className="object-cover" />
              ) : (
                initials || "RDV"
              )}
            </div>
            <p className="mt-4 text-lg font-bold text-slate-900">{category.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{category.description}</p>

            <div className="mt-6 space-y-3 text-sm text-slate-500">
              <div className="flex items-start gap-3">
                <CheckSquare className="mt-0.5 size-4 shrink-0 text-slate-500" />
                <span>{category.customMessage || "Choisissez le créneau qui vous convient."}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-4 shrink-0 text-slate-500" />
                <span>{category.durationMinutes} min</span>
              </div>
              <div className="flex items-center gap-3">
                <Video className="size-4 shrink-0 text-slate-500" />
                <span>{formatAppointmentMode(category.appointmentMode)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="size-4 shrink-0 text-slate-500" />
                <span>Europe, Paris (24h)</span>
              </div>
            </div>

          </aside>

          <section
            className={cn(
              "border-b border-slate-200 p-4 sm:p-6 lg:border-b-0 lg:p-8",
              currentStep === 1 ? "lg:border-r" : "lg:col-span-2",
            )}
          >
            {activeStep === 1 ? (
              <>
                <div className="flex items-center gap-3">
                  <CalendarDays className="size-5 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-base sm:text-lg font-semibold text-slate-900">Sélectionnez la date et l&apos;heure</p>
                    <p className="text-xs sm:text-sm text-slate-500">Choisissez d&apos;abord un jour, puis un créneau disponible.</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold capitalize text-slate-900">
                      {formatMonthLabel(monthKeys[visibleMonthIndex] ?? visibleMonthKey)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVisibleMonthKey(monthKeys[Math.max(0, visibleMonthIndex - 1)] ?? visibleMonthKey)}
                        disabled={visibleMonthIndex === 0}
                        className="flex size-8 sm:size-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all duration-150 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleMonthKey(monthKeys[Math.min(monthKeys.length - 1, visibleMonthIndex + 1)] ?? visibleMonthKey)
                        }
                        disabled={visibleMonthIndex >= monthKeys.length - 1}
                        className="flex size-8 sm:size-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all duration-150 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs uppercase tracking-wide text-slate-400">
                    {weekdayHeaders.map((label) => (
                      <div key={label} className="hidden sm:block">{label}</div>
                    ))}
                    {weekdayHeaders.map((label) => (
                      <div key={`short-${label}`} className="sm:hidden">{label.slice(0, 1)}</div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-1 sm:gap-2 text-center">
                    {calendarCells.map((cell) => {
                      if (cell.dayNumber === null) {
                        return <div key={cell.key} className="h-8 sm:h-10" />;
                      }

                      const entry = dayEntries.find((item) => item.dateKey === cell.key);
                      const isSelected = activeDateKey === cell.key;
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
                            onClick={() => handleSelectDate(cell.key)}
                            className={cn(
                              "flex size-8 sm:size-10 items-center justify-center rounded-lg text-sm transition-all duration-150",
                            isDisabled && isPastDay && "cursor-not-allowed bg-slate-100 text-slate-400",
                            isDisabled && !isPastDay && !isBlackoutDay && "cursor-not-allowed text-slate-300",
                            isDisabled && isBlackoutDay && "cursor-not-allowed bg-red-100 text-red-700",
                              !isDisabled && !isSelected && "bg-slate-100 text-slate-700 hover:bg-slate-200",
                              isSelected && "bg-blue-600 text-white shadow-sm",
                            )}
                          >
                            {cell.dayNumber}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                    Heure d&apos;Europe, Paris (24h)
                  </div>
                </div>
              </>
            ) : activeStep === 2 ? (
              <div className="mx-auto max-w-2xl space-y-5">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-slate-900">Vos informations</p>
                  <p className="text-sm text-slate-500">
                    {activeSelectedSlot
                      ? `Créneau choisi : ${formatDateTimeFr(activeSelectedSlot, { dateStyle: "full", timeStyle: "short" })}`
                      : "Complétez vos informations pour continuer."}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Prénom</span>
                    <input
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Nom</span>
                    <input
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>

                {initialUser?.email ? (
                  <p className="text-xs text-slate-500">
                    Les champs préremplis peuvent être corrigés avant la confirmation du rendez-vous.
                  </p>
                ) : null}

                {shouldSuggestSavedPhone ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                    <p className="font-medium text-slate-900">
                      Lors de votre dernier rendez-vous téléphonique, vous aviez utilisé le numéro de téléphone{" "}
                      <span className="font-semibold">{initialUser?.phone}</span>. Est-ce toujours correct ?
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setPhone(initialUser?.phone ?? "");
                          setPhoneConfirmation("yes");
                        }}
                        className={cn(
                          "rounded-md border px-4 py-2 text-sm font-medium transition-all duration-150",
                          phoneConfirmation === "yes"
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400",
                        )}
                      >
                        Oui
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhone("");
                          setPhoneConfirmation("no");
                        }}
                        className={cn(
                          "rounded-md border px-4 py-2 text-sm font-medium transition-all duration-150",
                          phoneConfirmation === "no"
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400",
                        )}
                      >
                        Non
                      </button>
                    </div>
                    {phoneConfirmation === "no" ? (
                      <p className="mt-3 text-xs text-slate-500">
                        Si non, vous pouvez modifier le numéro ci-dessous.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Téléphone</span>
                  <PhoneInput
                    value={phone}
                    onChange={(val) => setPhone(val || "")}
                  />
                </label>

                {!isAuthenticated ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                    <p className="font-medium text-slate-900">Avez-vous un compte ?</p>
                    <p className="mt-2">
                      Ce n&apos;est pas obligatoire. Cela sert uniquement à retrouver l&apos;historique de vos rendez-vous et à
                      annuler un rendez-vous en ligne si besoin.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <a href="/connexion" className="font-medium text-slate-900 underline underline-offset-4">
                        Connectez-vous
                      </a>
                      <a href="/inscription" className="font-medium text-slate-900 underline underline-offset-4">
                        Inscrivez-vous
                      </a>
                    </div>
                  </div>
                ) : null}

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Message optionnel</span>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    className="inline-flex flex-1 items-center justify-center rounded-md border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-50"
                  >
                    Modifier le créneau
                  </button>
                  <button
                    type="button"
                    onClick={handleContinueToRecap}
                    className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-blue-700"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-5">
                  <p className="text-sm font-semibold text-slate-900">Récapitulatif</p>
                  <dl className="mt-4 space-y-3 text-sm text-slate-600">
                    <div>
                      <dt className="font-medium text-slate-900">Catégorie</dt>
                      <dd>{category.title}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-900">Date et heure</dt>
                      <dd>
                        {selectedSlotDetails
                          ? formatDateTimeFr(selectedSlotDetails.start, { dateStyle: "full", timeStyle: "short" })
                          : "Aucun créneau sélectionné"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-900">Nom</dt>
                      <dd>{firstName} {lastName}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-900">Email</dt>
                      <dd>{email}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-900">Téléphone</dt>
                      <dd>{formatPhone(phone)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-900">Message</dt>
                      <dd>{message.trim() || "Aucun message"}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm text-slate-800">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckSquare className="size-4 text-slate-500" />
                    <span>Confirmation</span>
                  </div>
                  <p className="mt-2 text-slate-600">
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
                    className="inline-flex flex-1 items-center justify-center rounded-md border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-50"
                  >
                    Modifier les informations
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                    <span>{isSubmitting ? "Confirmation..." : "Confirmer la demande"}</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {activeStep === 1 ? (
            <section className="p-6 lg:p-8">
              <div className="mb-6 space-y-4">
                <p className="text-sm font-semibold text-slate-900">Créneaux horaires</p>
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100">
                  <span className="text-xs font-medium text-slate-700">Masquer les indisponibles</span>
                  <div
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                      showOnlyAvailable ? "bg-blue-600" : "bg-slate-300"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowOnlyAvailable(!showOnlyAvailable);
                    }}
                  >
                    <span
                      className={cn(
                        "inline-block size-3.5 transform rounded-full bg-white transition-transform",
                        showOnlyAvailable ? "translate-x-4" : "translate-x-1"
                      )}
                    />
                  </div>
                </label>
              </div>

              <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
                {selectedDay ? (
                  selectedDay.dateSlots
                    .filter((slot) => !showOnlyAvailable || !slot.isBlocked)
                    .map((slot) => {
                    const active = activeSelectedSlot === slot.start;

                    return (
                      <button
                        key={slot.start}
                        type="button"
                        disabled={slot.isBlocked}
                        onClick={() => handleSelectSlot(slot.start)}
                        className={cn(
                          "flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium transition-all duration-150",
                          slot.isBlocked
                            ? "cursor-not-allowed bg-slate-50 text-slate-300"
                            : "bg-white text-slate-700 hover:border-blue-600 hover:text-blue-600",
                          active && "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white hover:border-blue-700",
                        )}
                      >
                        {slot.label}
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
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

"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock, Info, LoaderCircle, MapPin, Zap } from "lucide-react";

import { groupSlotsByDay } from "@/lib/booking";
import { cn, formatAppointmentMode, formatDateTimeFr } from "@/lib/utils";
import type { AppointmentCategory, BookingSlot } from "@/types/domain";

// Le champ téléphone embarque une bibliothèque lourde et ne sert qu'à la
// seconde étape : il est chargé à part pour ne pas ralentir le choix du créneau.
const PhoneInput = dynamic(() => import("@/components/ui/phone-input").then((mod) => mod.PhoneInput), {
  ssr: false,
  loading: () => <input className="da-field" disabled aria-label="Téléphone" />,
});

const weekdayHeaders = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const DEFAULT_HELPER_MESSAGE = "Choisissez le créneau qui vous convient.";

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

type FieldErrors = Record<string, string>;

function toMonthKey(dateKey: string) {
  return dateKey.slice(0, 7);
}

function formatMonthLabel(monthKey: string) {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(`${monthKey}-01T12:00:00`));
}

function formatDayLabel(dateKey: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("fr-FR", options).format(new Date(`${dateKey}T12:00:00`));
}

function getCalendarCells(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1, 12, 0, 0);
  const daysInMonth = new Date(year, month, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;

  return [
    ...Array.from({ length: offset }, (_, index) => ({ key: `empty-${index}`, dayNumber: null as number | null })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      key: `${monthKey}-${String(index + 1).padStart(2, "0")}`,
      dayNumber: (index + 1) as number | null,
    })),
  ];
}

/** Regroupe les créneaux d'une journée par moment, pour une lecture immédiate. */
function groupSlotsByPeriod(daySlots: BookingSlot[]) {
  const periods = [
    { label: "Matin", slots: [] as BookingSlot[] },
    { label: "Après-midi", slots: [] as BookingSlot[] },
    { label: "Soir", slots: [] as BookingSlot[] },
  ];

  for (const slot of daySlots) {
    const hour = Number.parseInt(slot.label.slice(0, 2), 10);
    periods[hour < 12 ? 0 : hour < 18 ? 1 : 2].slots.push(slot);
  }

  return periods.filter((period) => period.slots.length > 0);
}

export function BookingForm({ category, categorySlug, slots, helperMessage, isAuthenticated, initialUser }: BookingFormProps) {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Seuls les créneaux réservables sont proposés : inutile d'afficher ce qu'on ne peut pas choisir.
  const dayEntries = useMemo(() => {
    const grouped = groupSlotsByDay(slots.filter((slot) => !slot.isBlocked));

    return Object.entries(grouped)
      .map(([dateKey, dateSlots]) => ({ dateKey, dateSlots }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [slots]);
  const monthKeys = useMemo(() => Array.from(new Set(dayEntries.map((entry) => toMonthKey(entry.dateKey)))), [dayEntries]);
  const firstDateKey = dayEntries[0]?.dateKey ?? "";
  const earliestSlot = dayEntries[0]?.dateSlots[0] ?? null;

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDateKey, setSelectedDateKey] = useState(firstDateKey);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [visibleMonthKey, setVisibleMonthKey] = useState(toMonthKey(firstDateKey || new Date().toISOString().slice(0, 10)));
  const [firstName, setFirstName] = useState(initialUser?.firstName ?? "");
  const [lastName, setLastName] = useState(initialUser?.lastName ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [phone, setPhone] = useState(initialUser?.phone ?? "");
  const [message, setMessage] = useState("");
  const [customFieldResponses, setCustomFieldResponses] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDay = dayEntries.find((entry) => entry.dateKey === selectedDateKey) ?? dayEntries[0] ?? null;
  const activeSlot = dayEntries.flatMap((entry) => entry.dateSlots).find((slot) => slot.start === selectedSlot) ?? null;
  const activeStep = activeSlot ? step : 1;
  const visibleMonthIndex = Math.max(0, monthKeys.indexOf(visibleMonthKey));
  const visibleMonth = monthKeys[visibleMonthIndex] ?? visibleMonthKey;
  const calendarCells = getCalendarCells(visibleMonth);
  const periods = selectedDay ? groupSlotsByPeriod(selectedDay.dateSlots) : [];
  const modeLabel = formatAppointmentMode(category.appointmentMode);
  const note = helperMessage && helperMessage !== DEFAULT_HELPER_MESSAGE ? helperMessage : "";
  const initials =
    category.title
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "RDV";

  // À chaque changement d'étape, on ramène le haut du tunnel à l'écran.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeStep]);

  function handleSelectDate(dateKey: string) {
    setSelectedDateKey(dateKey);
    setSelectedSlot("");
    setError("");

    // Sur petit écran les horaires sont sous le calendrier : on les amène à l'écran.
    requestAnimationFrame(() => {
      const element = slotsRef.current;

      if (element && element.getBoundingClientRect().top > window.innerHeight * 0.6) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function handleSelectSlot(slot: BookingSlot) {
    setSelectedDateKey(slot.start.slice(0, 10));
    setSelectedSlot(slot.start);
    setError("");
    setStep(2);
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (firstName.trim().length < 2) errors.firstName = "Indiquez votre prénom.";
    if (lastName.trim().length < 2) errors.lastName = "Indiquez votre nom.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Indiquez une adresse email valide.";
    if (phone.trim().length < 8) errors.phone = "Indiquez un numéro de téléphone valide.";

    for (const field of category.customFields ?? []) {
      if (field.required && !customFieldResponses[field.id]?.trim()) {
        errors[`custom-${field.id}`] = "Ce champ est obligatoire.";
      }
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !activeSlot) {
      return;
    }

    const errors = validate();
    setFieldErrors(errors);

    const firstInvalid = Object.keys(errors)[0];

    if (firstInvalid) {
      setError("");
      const target = formRef.current?.querySelector<HTMLElement>(`[data-field="${firstInvalid}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.querySelector<HTMLElement>("input, select, textarea")?.focus({ preventScroll: true });
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
      customFieldResponsesJson: JSON.stringify(customFieldResponses),
      startsAt: activeSlot.start,
    };

    let response: Response;

    try {
      response = await fetch("/api/public/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.");
      setIsSubmitting(false);
      return;
    }

    let data: { error?: string } = {};

    try {
      data = (await response.json()) as { error?: string };
    } catch {
      data = {};
    }

    if (!response.ok) {
      setIsSubmitting(false);

      // Créneau pris entre-temps : retour au choix de l'horaire avec des
      // disponibilités à jour, sans perdre les coordonnées déjà saisies.
      if (response.status === 409) {
        setError(data.error ?? "Ce créneau vient d'être réservé. Choisissez-en un autre.");
        setSelectedSlot("");
        setStep(1);
        router.refresh();
        return;
      }

      setError(data.error ?? "Une erreur est survenue. Réessayez dans un instant.");
      return;
    }

    const params = new URLSearchParams({ slot: payload.startsAt, firstName: payload.firstName });
    router.push(`/rdv/${categorySlug}/confirmation?${params.toString()}`);
  }

  function clearFieldError(name: string) {
    if (fieldErrors[name]) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }
  }

  const steps = [
    { number: 1, label: "Date et heure" },
    { number: 2, label: "Vos coordonnées" },
  ];

  return (
    <div ref={topRef} className="mx-auto w-full max-w-[920px] scroll-mt-24">
      {/* ------------------------------------------------------------ En-tête */}
      <header className="flex items-center gap-4">
        <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-accent-soft text-sm font-semibold text-accent">
          {category.thumbnailImageUrl ? (
            <Image src={category.thumbnailImageUrl} alt="" fill priority sizes="56px" className="object-cover" />
          ) : (
            initials
          )}
        </span>
        <div className="min-w-0">
          <h1 className="da-title text-[20px] sm:text-[24px]">{category.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-accent" />
              {category.durationMinutes} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-accent" />
              {modeLabel}
            </span>
          </p>
        </div>
      </header>

      {category.description && activeStep === 1 ? (
        <p className="mt-4 text-[15px] leading-relaxed text-slate-500">{category.description}</p>
      ) : null}

      {/* -------------------------------------------------------------- Étapes */}
      <ol className="mt-6 flex items-center gap-3 text-[14px] font-medium">
        {steps.map((item, index) => {
          const isDone = activeStep > item.number;
          const isCurrent = activeStep === item.number;

          return (
            <li key={item.number} className="flex items-center gap-3" aria-current={isCurrent ? "step" : undefined}>
              {index > 0 ? <span className="h-px w-6 bg-slate-200 sm:w-10" aria-hidden="true" /> : null}
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-[13px] font-semibold",
                  isCurrent && "border-accent bg-accent text-white",
                  isDone && "border-accent bg-accent-soft text-accent",
                  !isCurrent && !isDone && "border-slate-200 text-slate-400",
                )}
              >
                {isDone ? <Check className="size-4" /> : item.number}
              </span>
              <span className={cn(isCurrent ? "text-slate-900" : "text-slate-400")}>{item.label}</span>
            </li>
          );
        })}
      </ol>

      {error ? (
        <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[14px] font-medium text-rose-700">
          {error}
        </p>
      ) : null}

      {activeStep === 1 ? (
        /* ================================================= Étape 1 : créneau */
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white">
          {dayEntries.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <CalendarDays className="mx-auto size-9 text-slate-300" />
              <p className="da-title mt-4 text-[18px]">Aucun créneau disponible pour le moment</p>
              <p className="mt-2 text-[15px] text-slate-500">Revenez un peu plus tard, de nouvelles disponibilités sont ajoutées régulièrement.</p>
              <Link href="/" className="da-btn da-btn-secondary da-btn-sm mt-6">
                Voir les autres rendez-vous
              </Link>
            </div>
          ) : (
            <>
              {note ? (
                <p className="flex items-start gap-2.5 border-b border-slate-200 px-4 py-3 text-[14px] leading-relaxed text-slate-600 sm:px-6">
                  <Info className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>{note}</span>
                </p>
              ) : null}

              {earliestSlot ? (
                <div className="border-b border-slate-200 p-4 sm:px-6">
                  <button
                    type="button"
                    onClick={() => handleSelectSlot(earliestSlot)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-left transition-colors hover:border-accent"
                  >
                    <Zap className="size-5 shrink-0 text-accent" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-accent">Au plus tôt</span>
                      <span className="block text-[15px] font-semibold text-slate-900 first-letter:uppercase">
                        {formatDayLabel(earliestSlot.start.slice(0, 10), { weekday: "long", day: "numeric", month: "long" })} à{" "}
                        {earliestSlot.label}
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              ) : null}

              <div className="grid md:grid-cols-2">
                {/* ---------------------------------------------- Calendrier */}
                <div className="border-b border-slate-200 p-4 sm:p-6 md:border-b-0 md:border-r">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[16px] font-semibold capitalize text-slate-900">{formatMonthLabel(visibleMonth)}</h2>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Mois précédent"
                        onClick={() => setVisibleMonthKey(monthKeys[Math.max(0, visibleMonthIndex - 1)] ?? visibleMonth)}
                        disabled={visibleMonthIndex === 0}
                        className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Mois suivant"
                        onClick={() =>
                          setVisibleMonthKey(monthKeys[Math.min(monthKeys.length - 1, visibleMonthIndex + 1)] ?? visibleMonth)
                        }
                        disabled={visibleMonthIndex >= monthKeys.length - 1}
                        className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[12px] font-medium text-slate-400">
                    {weekdayHeaders.map((label) => (
                      <div key={label}>{label}</div>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-1">
                    {calendarCells.map((cell) => {
                      if (cell.dayNumber === null) {
                        return <div key={cell.key} />;
                      }

                      const isAvailable = dayEntries.some((entry) => entry.dateKey === cell.key);
                      const isSelected = selectedDay?.dateKey === cell.key;

                      return (
                        <button
                          key={cell.key}
                          type="button"
                          disabled={!isAvailable}
                          aria-pressed={isSelected}
                          aria-label={formatDayLabel(cell.key, { weekday: "long", day: "numeric", month: "long" })}
                          onClick={() => handleSelectDate(cell.key)}
                          className={cn(
                            "mx-auto flex aspect-square w-full max-w-12 items-center justify-center rounded-full text-[15px] transition-colors",
                            !isAvailable && "cursor-not-allowed text-slate-300",
                            isAvailable && !isSelected && "bg-accent-soft font-semibold text-accent hover:bg-accent hover:text-white",
                            isSelected && "bg-accent font-semibold text-white",
                          )}
                        >
                          {cell.dayNumber}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-4 text-[13px] text-slate-400">Les jours en bleu ont des créneaux libres.</p>
                </div>

                {/* ------------------------------------------------ Horaires */}
                <div ref={slotsRef} className="scroll-mt-24 p-4 sm:p-6">
                  {selectedDay ? (
                    <>
                      <h2 className="text-[16px] font-semibold text-slate-900 first-letter:uppercase">
                        {formatDayLabel(selectedDay.dateKey, { weekday: "long", day: "numeric", month: "long" })}
                      </h2>
                      <p className="mt-1 text-[13px] text-slate-400">Heure de Paris · choisissez un horaire</p>

                      <div className="mt-4 space-y-5">
                        {periods.map((period) => (
                          <div key={period.label}>
                            <p className="text-[13px] font-medium text-slate-500">{period.label}</p>
                            <div className="mt-2 grid grid-cols-3 gap-2 min-[420px]:grid-cols-4 md:grid-cols-3 lg:grid-cols-4">
                              {period.slots.map((slot) => (
                                <button
                                  key={slot.start}
                                  type="button"
                                  onClick={() => handleSelectSlot(slot)}
                                  className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-[15px] font-semibold text-slate-900 transition-colors hover:border-accent hover:bg-accent hover:text-white"
                                >
                                  {slot.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </section>
      ) : (
        /* ============================================= Étape 2 : coordonnées */
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
          <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent-soft p-4">
            <CalendarDays className="size-5 shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-accent">Votre créneau</p>
              <p className="text-[15px] font-semibold text-slate-900 first-letter:uppercase">
                {activeSlot ? formatDateTimeFr(activeSlot.start, { dateStyle: "full", timeStyle: "short" }) : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
              }}
              className="shrink-0 rounded-lg px-3 py-2 text-[14px] font-semibold text-accent underline underline-offset-4 hover:text-accent-hover"
            >
              Modifier
            </button>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="firstName" label="Prénom" error={fieldErrors.firstName}>
                <input
                  id="booking-firstName"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    clearFieldError("firstName");
                  }}
                  autoComplete="given-name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  aria-invalid={Boolean(fieldErrors.firstName)}
                  className={cn("da-field", fieldErrors.firstName && "border-rose-400")}
                />
              </Field>

              <Field name="lastName" label="Nom" error={fieldErrors.lastName}>
                <input
                  id="booking-lastName"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    clearFieldError("lastName");
                  }}
                  autoComplete="family-name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  aria-invalid={Boolean(fieldErrors.lastName)}
                  className={cn("da-field", fieldErrors.lastName && "border-rose-400")}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="email" label="Email" hint="Pour recevoir la confirmation." error={fieldErrors.email}>
                <input
                  id="booking-email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearFieldError("email");
                  }}
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="next"
                  aria-invalid={Boolean(fieldErrors.email)}
                  className={cn("da-field", fieldErrors.email && "border-rose-400")}
                />
              </Field>

              <Field name="phone" label="Téléphone" error={fieldErrors.phone} asGroup>
                <PhoneInput
                  value={phone}
                  onChange={(value) => {
                    setPhone(value || "");
                    clearFieldError("phone");
                  }}
                />
              </Field>
            </div>

            {category.customFields?.map((field) => {
              const name = `custom-${field.id}`;
              const update = (value: string) => {
                setCustomFieldResponses((current) => ({ ...current, [field.id]: value }));
                clearFieldError(name);
              };

              return (
                <Field key={field.id} name={name} label={field.label} optional={!field.required} error={fieldErrors[name]}>
                  {field.type === "text" ? (
                    <input
                      id={`booking-${name}`}
                      value={customFieldResponses[field.id] || ""}
                      onChange={(event) => update(event.target.value)}
                      placeholder={field.placeholder || ""}
                      aria-invalid={Boolean(fieldErrors[name])}
                      className={cn("da-field", fieldErrors[name] && "border-rose-400")}
                    />
                  ) : (
                    <select
                      id={`booking-${name}`}
                      value={customFieldResponses[field.id] || ""}
                      onChange={(event) => update(event.target.value)}
                      aria-invalid={Boolean(fieldErrors[name])}
                      className={cn("da-field", fieldErrors[name] && "border-rose-400")}
                    >
                      <option value="" disabled>
                        Sélectionnez une option…
                      </option>
                      {field.options?.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              );
            })}

            <Field name="message" label="Message" optional>
              <textarea
                id="booking-message"
                rows={3}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Précisez l'objet du rendez-vous si vous le souhaitez."
                className="da-field"
              />
            </Field>
          </div>

          <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <button type="submit" disabled={isSubmitting} className="da-btn da-btn-primary w-full">
              {isSubmitting ? <LoaderCircle className="size-5 animate-spin" /> : null}
              {isSubmitting ? "Envoi en cours…" : "Confirmer le rendez-vous"}
            </button>
          </div>

          <p className="text-center text-[13px] leading-relaxed text-slate-500">
            Votre demande est transmise pour validation : vous recevez la réponse par email.
            {!isAuthenticated ? (
              <>
                {" "}
                Un compte n&apos;est pas nécessaire, mais vous pouvez{" "}
                <Link href="/connexion" className="font-semibold text-accent underline underline-offset-4">
                  vous connecter
                </Link>{" "}
                pour retrouver vos rendez-vous.
              </>
            ) : null}
          </p>
        </form>
      )}
    </div>
  );
}

function Field({
  name,
  label,
  hint,
  error,
  optional,
  asGroup,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  /** Pour un champ composé (téléphone) : pas de `<label>` lié à un identifiant unique. */
  asGroup?: boolean;
  children: React.ReactNode;
}) {
  const labelContent = (
    <>
      {label}
      {optional ? <span className="ml-1.5 font-normal text-slate-400">(facultatif)</span> : null}
    </>
  );

  return (
    <div data-field={name} className="space-y-1.5">
      {asGroup ? (
        <p className="text-[14px] font-medium text-slate-900">{labelContent}</p>
      ) : (
        <label htmlFor={`booking-${name}`} className="block text-[14px] font-medium text-slate-900">
          {labelContent}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="text-[13px] font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

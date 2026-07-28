"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, LoaderCircle, MessageSquareText } from "lucide-react";

import { groupSlotsByDay } from "@/lib/booking";
import { cn } from "@/lib/utils";
import type { BookingSlot } from "@/types/domain";

interface BookingFormProps {
  categorySlug: string;
  slots: BookingSlot[];
  helperMessage: string;
  initialUser?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export function BookingForm({ categorySlug, slots, helperMessage, initialUser }: BookingFormProps) {
  const router = useRouter();
  const groupedSlots = useMemo(() => groupSlotsByDay(slots), [slots]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

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
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[32px] border border-white/12 bg-slate-950/70 p-6 shadow-[0_30px_80px_rgba(8,15,33,0.45)] backdrop-blur sm:p-8">
        <div className="flex items-center gap-3 text-slate-200">
          <CalendarDays className="size-5 text-cyan-300" />
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Choix du créneau</p>
            <p className="text-sm text-slate-300">{helperMessage}</p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {Object.entries(groupedSlots).map(([dateKey, dateSlots]) => (
            <div key={dateKey} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">{dateSlots[0]?.dayLabel}</h3>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {dateSlots.filter((slot) => !slot.isBlocked).length} dispo
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {dateSlots.map((slot) => {
                  const active = selectedSlot === slot.start;

                  return (
                    <button
                      key={slot.start}
                      type="button"
                      disabled={slot.isBlocked}
                      onClick={() => setSelectedSlot(slot.start)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-sm font-medium transition-all",
                        slot.isBlocked
                          ? "cursor-not-allowed border-white/10 bg-white/5 text-slate-500"
                          : "border-white/10 bg-white/5 text-slate-100 hover:border-cyan-300/50 hover:bg-cyan-300/10",
                        active && "border-cyan-300 bg-cyan-300/15 text-white shadow-[0_16px_40px_rgba(34,211,238,0.2)]",
                      )}
                    >
                      <span className="block">{slot.label}</span>
                      <span className="mt-1 block text-[11px] text-slate-400">
                        {slot.isBlocked ? slot.reason ?? "Indisponible" : "Disponible"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-900/10 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="flex items-center gap-3">
          <MessageSquareText className="size-5 text-cyan-700" />
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Vos informations</p>
            <p className="text-sm text-slate-600">La demande reste en attente tant qu'elle n'est pas validée.</p>
          </div>
        </div>

        <form action={handleSubmit} className="mt-6 space-y-4">
          <input type="hidden" name="selectedSlot" value={selectedSlot} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Prénom</span>
              <input
                name="firstName"
                required
                defaultValue={initialUser?.firstName ?? ""}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-600 focus:bg-white"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Nom</span>
              <input
                name="lastName"
                required
                defaultValue={initialUser?.lastName ?? ""}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-600 focus:bg-white"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={initialUser?.email ?? ""}
              readOnly={Boolean(initialUser?.email)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-600 focus:bg-white"
            />
          </label>

          {initialUser?.email ? (
            <p className="text-xs text-slate-500">L'email du compte connecte est utilise pour rattacher vos rendez-vous.</p>
          ) : null}

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Téléphone</span>
            <input
              name="phone"
              type="tel"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-600 focus:bg-white"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Message optionnel</span>
            <textarea
              name="message"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-600 focus:bg-white"
            />
          </label>

          <div className="rounded-2xl border border-cyan-900/10 bg-cyan-50 px-4 py-4 text-sm text-cyan-950">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="size-4" />
              <span>
                {selectedSlot ? "Créneau sélectionné" : "Sélectionnez un créneau avant d'envoyer votre demande"}
              </span>
            </div>
            <p className="mt-2 text-cyan-900/80">
              {selectedSlot
                ? new Date(selectedSlot).toLocaleString("fr-FR", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })
                : "Le récapitulatif du rendez-vous apparaîtra ici."}
            </p>
          </div>

          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={!selectedSlot || isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-950 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
            <span>{isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}</span>
          </button>
        </form>
      </section>
    </div>
  );
}

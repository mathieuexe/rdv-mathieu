"use client";

import { useEffect, useMemo, useState } from "react";

import type { AppointmentCategory, BookingSlot } from "@/types/domain";

interface AdminAppointmentFormProps {
  categories: AppointmentCategory[];
  action: (formData: FormData) => Promise<void>;
}

function groupSlots(slots: BookingSlot[]) {
  return slots.reduce<Record<string, BookingSlot[]>>((acc, slot) => {
    const dateKey = slot.start.slice(0, 10);
    acc[dateKey] ??= [];
    acc[dateKey].push(slot);
    return acc;
  }, {});
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

  const groupedSlots = useMemo(() => groupSlots(slots.filter((slot) => !slot.isBlocked)), [slots]);

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Creation</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Creer un rendez-vous</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          L&apos;administrateur peut reserver directement un creneau disponible au nom d&apos;un client.
        </p>
      </div>

      <form action={action} className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-5">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Categorie</span>
            <select
              name="categorySlug"
              value={categorySlug}
              onChange={(event) => setCategorySlug(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-600 focus:bg-white"
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
              <span>Prenom</span>
              <input
                name="firstName"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-600 focus:bg-white"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Nom</span>
              <input
                name="lastName"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-600 focus:bg-white"
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-600 focus:bg-white"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Telephone</span>
            <input
              name="phone"
              type="tel"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-600 focus:bg-white"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Message</span>
            <textarea
              name="message"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-600 focus:bg-white"
            />
          </label>
        </div>

        <div className="space-y-5">
          <input type="hidden" name="startsAt" value={selectedSlot} />

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Creneaux disponibles</p>
            {loading ? <p className="mt-3 text-sm text-slate-600">Chargement...</p> : null}
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

            <div className="mt-4 space-y-4">
              {Object.entries(groupedSlots).map(([dateKey, daySlots]) => (
                <div key={dateKey}>
                  <p className="text-sm font-medium text-slate-900">{daySlots[0]?.dayLabel}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {daySlots.map((slot) => (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => setSelectedSlot(slot.start)}
                        className={`rounded-full border px-4 py-2 text-sm ${
                          selectedSlot === slot.start
                            ? "border-cyan-700 bg-cyan-700 text-white"
                            : "border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {!loading && Object.keys(groupedSlots).length === 0 ? (
                <p className="text-sm text-slate-600">Aucun creneau disponible pour cette categorie.</p>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedSlot}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-950 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Creer le rendez-vous
          </button>
        </div>
      </form>
    </section>
  );
}

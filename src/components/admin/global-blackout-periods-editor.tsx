"use client";

import { useState } from "react";
import { CalendarRange, Plus, Trash2 } from "lucide-react";

import type { BlackoutPeriod } from "@/types/domain";

interface EditableBlackoutPeriod {
  key: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  message: string;
}

interface GlobalBlackoutPeriodsEditorProps {
  periods: BlackoutPeriod[];
}

function createEmptyPeriod(): EditableBlackoutPeriod {
  return {
    key: crypto.randomUUID(),
    startDate: "",
    startTime: "00:00",
    endDate: "",
    endTime: "23:59",
    message: "",
  };
}

export function GlobalBlackoutPeriodsEditor({ periods }: GlobalBlackoutPeriodsEditorProps) {
  const [items, setItems] = useState<EditableBlackoutPeriod[]>(
    periods.length > 0
      ? periods.map((period) => ({
          key: period.id,
          startDate: period.startDate,
          startTime: period.startTime,
          endDate: period.endDate,
          endTime: period.endTime,
          message: period.message ?? "",
        }))
      : [],
  );

  function updateItem(key: string, field: keyof Omit<EditableBlackoutPeriod, "key">, value: string) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setItems((current) => [...current, createEmptyPeriod()]);
  }

  function removeItem(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  return (
    <div className="rounded-[22px] border border-slate-200 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Périodes d&apos;indisponibilité globales</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Bloquez complètement les réservations pendant une période donnée. La raison est affichée publiquement si
            vous la renseignez.
          </p>
        </div>

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Plus className="size-4" />
          <span>Ajouter une période</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
          Aucune indisponibilité globale configurée.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item, index) => (
            <div key={item.key} className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                  <CalendarRange className="size-4 text-slate-500" />
                  <span>Période {index + 1}</span>
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:text-rose-700"
                >
                  <Trash2 className="size-4" />
                  <span>Supprimer</span>
                </button>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Date de début</span>
                  <input
                    type="date"
                    name="blackoutStartDate"
                    value={item.startDate}
                    onChange={(event) => updateItem(item.key, "startDate", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Heure de début</span>
                  <input
                    type="time"
                    name="blackoutStartTime"
                    value={item.startTime}
                    onChange={(event) => updateItem(item.key, "startTime", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Date de fin</span>
                  <input
                    type="date"
                    name="blackoutEndDate"
                    value={item.endDate}
                    onChange={(event) => updateItem(item.key, "endDate", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Heure de fin</span>
                  <input
                    type="time"
                    name="blackoutEndTime"
                    value={item.endTime}
                    onChange={(event) => updateItem(item.key, "endTime", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
                  />
                </label>
              </div>

              <label className="mt-4 block space-y-2 text-sm font-medium text-slate-700">
                <span>Raison affichée publiquement</span>
                <textarea
                  name="blackoutMessage"
                  rows={3}
                  value={item.message}
                  onChange={(event) => updateItem(item.key, "message", event.target.value)}
                  placeholder="Facultatif. Exemple : congés annuels, fermeture exceptionnelle, déplacement professionnel..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

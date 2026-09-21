"use client";

import { useState } from "react";
import { ExternalLink, PencilLine, RotateCcw, X } from "lucide-react";

import { PendingSubmitButton } from "@/components/admin/google-calendar-controls";
import { GoogleCalendarBadge } from "@/components/shared/google-calendar-badge";

export interface EditableGoogleEvent {
  id: string;
  summary: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  rangeLabel: string;
  calendarLabel: string;
  isOverridden: boolean;
  googleSummary?: string;
  googleRangeLabel?: string;
  htmlLink?: string;
}

interface GoogleCalendarEventListProps {
  events: EditableGoogleEvent[];
  saveAction: (formData: FormData) => Promise<void>;
  resetAction: (formData: FormData) => Promise<void>;
}

export function GoogleCalendarEventList({ events, saveAction, resetAction }: GoogleCalendarEventListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (events.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-slate-500">Aucun rendez-vous personnel importé pour le moment.</p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {events.map((event) => {
        const isEditing = editingId === event.id;

        return (
          <li key={event.id} className="p-4">
            {isEditing ? (
              <form action={saveAction} className="space-y-3">
                <input type="hidden" name="eventId" value={event.id} />

                <label className="block space-y-1 text-xs font-medium text-slate-700">
                  <span>Titre de l&apos;indisponibilité</span>
                  <input
                    type="text"
                    name="summary"
                    defaultValue={event.summary}
                    required
                    maxLength={200}
                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1 text-xs font-medium text-slate-700">
                    <span>Début</span>
                    <span className="flex gap-2">
                      <input
                        type="date"
                        name="startDate"
                        defaultValue={event.startDate}
                        required
                        className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="time"
                        name="startTime"
                        defaultValue={event.startTime}
                        required
                        className="w-28 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </span>
                  </label>

                  <label className="block space-y-1 text-xs font-medium text-slate-700">
                    <span>Fin</span>
                    <span className="flex gap-2">
                      <input
                        type="date"
                        name="endDate"
                        defaultValue={event.endDate}
                        required
                        className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="time"
                        name="endTime"
                        defaultValue={event.endTime}
                        required
                        className="w-28 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </span>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <PendingSubmitButton className="bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700">
                    Enregistrer
                  </PendingSubmitButton>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <X className="size-3.5" />
                    Annuler
                  </button>
                  <p className="text-xs text-slate-500">
                    La retouche est conservée lors des prochaines synchronisations.
                  </p>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 text-sm">
                  <p className="flex flex-wrap items-center gap-2 font-medium text-slate-900">
                    <GoogleCalendarBadge compact />
                    {event.summary}
                    {event.isOverridden ? (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        Modifié
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-slate-500">{event.rangeLabel}</p>
                  {event.isOverridden && event.googleRangeLabel ? (
                    <p className="mt-0.5 text-xs text-slate-400">
                      Google : {event.googleSummary} · {event.googleRangeLabel}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">{event.calendarLabel}</span>

                  <button
                    type="button"
                    onClick={() => setEditingId(event.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <PencilLine className="size-3.5" />
                    Modifier
                  </button>

                  {event.isOverridden ? (
                    <form action={resetAction}>
                      <input type="hidden" name="eventId" value={event.id} />
                      <PendingSubmitButton
                        className="border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                        icon={<RotateCcw className="size-3.5" />}
                      >
                        Rétablir Google
                      </PendingSubmitButton>
                    </form>
                  ) : null}

                  {event.htmlLink ? (
                    <a
                      href={event.htmlLink}
                      target="_blank"
                      rel="noreferrer"
                      title="Ouvrir dans Google Agenda"
                      className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

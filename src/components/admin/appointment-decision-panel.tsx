"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";

interface AppointmentDecisionPanelProps {
  appointmentId: string;
}

export function AppointmentDecisionPanel({ appointmentId }: AppointmentDecisionPanelProps) {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isPending, setIsPending] = useState<"accept" | "reject" | null>(null);

  async function submitDecision(action: "accept" | "reject") {
    setIsPending(action);
    setFeedback("");

    const response = await fetch(`/api/admin/appointments/${appointmentId}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(action === "reject" ? { reason } : {}),
    });

    const data = (await response.json()) as { success?: boolean; message?: string; error?: string };

    setFeedback(data.message ?? data.error ?? "Action terminée.");
    setIsPending(null);
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-950">Décision administrateur</p>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={4}
        placeholder="Motif de refus optionnel si vous refusez la demande..."
        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-cyan-600"
      />

      {feedback ? <p className="mt-4 text-sm font-medium text-cyan-900">{feedback}</p> : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={isPending !== null}
          onClick={() => submitDecision("accept")}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:bg-slate-300"
        >
          {isPending === "accept" ? <LoaderCircle className="size-4 animate-spin" /> : null}
          <span>Accepter</span>
        </button>

        <button
          type="button"
          disabled={isPending !== null}
          onClick={() => submitDecision("reject")}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:bg-slate-300"
        >
          {isPending === "reject" ? <LoaderCircle className="size-4 animate-spin" /> : null}
          <span>Refuser</span>
        </button>
      </div>
    </div>
  );
}

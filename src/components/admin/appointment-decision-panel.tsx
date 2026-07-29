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
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <p className="text-sm font-semibold text-slate-950">Decision administrateur</p>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={4}
        placeholder="Motif de refus obligatoire si vous refusez la demande..."
        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
      />

      {feedback ? <p className="mt-4 text-sm font-medium text-blue-900">{feedback}</p> : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={isPending !== null}
          onClick={() => submitDecision("accept")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:bg-slate-300"
        >
          {isPending === "accept" ? <LoaderCircle className="size-4 animate-spin" /> : null}
          <span>Accepter</span>
        </button>

        <button
          type="button"
          disabled={isPending !== null}
          onClick={() => submitDecision("reject")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:bg-slate-300"
        >
          {isPending === "reject" ? <LoaderCircle className="size-4 animate-spin" /> : null}
          <span>Refuser</span>
        </button>
      </div>
    </div>
  );
}

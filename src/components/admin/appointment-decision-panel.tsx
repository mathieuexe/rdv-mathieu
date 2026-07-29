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
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-semibold text-slate-950">Décision administrateur</p>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={4}
        placeholder="Motif de refus obligatoire si vous refusez la demande..."
        className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-slate-950 outline-none transition duration-150 placeholder:text-slate-400 focus:border-slate-950 focus:bg-white"
      />

      {feedback ? <p className="mt-4 text-sm font-medium text-slate-700">{feedback}</p> : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={isPending !== null}
          onClick={() => submitDecision("accept")}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition duration-150 hover:bg-emerald-100 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          {isPending === "accept" ? <LoaderCircle className="size-4 animate-spin" /> : null}
          <span>Accepter</span>
        </button>

        <button
          type="button"
          disabled={isPending !== null}
          onClick={() => submitDecision("reject")}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition duration-150 hover:bg-rose-100 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          {isPending === "reject" ? <LoaderCircle className="size-4 animate-spin" /> : null}
          <span>Refuser</span>
        </button>
      </div>
    </div>
  );
}

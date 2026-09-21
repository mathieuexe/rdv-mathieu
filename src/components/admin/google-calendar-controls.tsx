"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle, Unlink } from "lucide-react";

import { cn } from "@/lib/utils";

interface PendingSubmitButtonProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function PendingSubmitButton({ children, className, icon }: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

export function DisconnectGoogleCalendarForm({ action }: { action: () => Promise<void> }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
      >
        <Unlink className="size-4" />
        Déconnecter le compte
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-sm text-rose-700">
        Les indisponibilités importées seront supprimées. Confirmer&nbsp;?
      </p>
      <button
        type="button"
        onClick={() => setIsConfirming(false)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        Annuler
      </button>
      <form action={action}>
        <PendingSubmitButton className="bg-rose-600 text-white hover:bg-rose-700" icon={<Unlink className="size-4" />}>
          Confirmer la déconnexion
        </PendingSubmitButton>
      </form>
    </div>
  );
}

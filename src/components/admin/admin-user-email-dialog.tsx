"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";

interface AdminUserEmailDialogProps {
  userEmail: string;
  userFirstName: string;
  action: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export function AdminUserEmailDialog({ userEmail, userFirstName, action }: AdminUserEmailDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    try {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess("Email envoyé avec succès.");
        setTimeout(() => {
          setIsOpen(false);
          setSuccess("");
        }, 2000);
      }
    } catch (e) {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 shadow-sm transition hover:bg-slate-50"
      >
        <Mail className="size-4" />
        Envoyer un e-mail
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Nouveau message à {userFirstName}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <input type="hidden" name="email" value={userEmail} />
              <input type="hidden" name="firstName" value={userFirstName} />

              {error && (
                <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  <span>Sujet</span>
                  <input
                    name="subject"
                    required
                    placeholder="Sujet de l'email"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>

                <label className="block space-y-1.5 text-sm font-medium text-slate-700">
                  <span>Message</span>
                  <textarea
                    name="message"
                    required
                    rows={8}
                    placeholder="Tapez votre message ici..."
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 whitespace-pre-wrap"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? "Envoi en cours..." : "Envoyer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

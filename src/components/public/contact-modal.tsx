"use client";

import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple CAPTCHA
  const [captchaParams] = useState(() => {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    return { num1, num2, answer: num1 + num2 };
  });

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Check captcha
    const userCaptcha = parseInt(formData.get("captcha") as string, 10);
    if (userCaptcha !== captchaParams.answer) {
      setError("Le résultat du calcul est incorrect.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      civility: formData.get("civility"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative flex h-[95dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl transition-all sm:h-auto sm:max-h-[90vh] sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="da-title text-[18px] sm:text-[20px]">Urgence / Contactez-moi</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-accent-soft hover:text-accent"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-5 flex size-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                <Send className="size-8" />
              </div>
              <h3 className="da-display mb-2 text-[26px]">Message envoyé</h3>
              <p className="text-[15px] leading-relaxed text-slate-500">
                Nous avons bien reçu votre demande. Un accusé de réception vous a été envoyé par e-mail avec le récapitulatif en pièce jointe (PDF).
              </p>
              <button
                onClick={onClose}
                className="da-btn da-btn-primary da-btn-sm mt-8"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[14px] text-rose-600">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[14px] font-medium text-slate-900">Civilité <span className="text-accent">*</span></label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
                  {["Monsieur", "Madame", "Maître", "Professeur"].map((c) => (
                    <label key={c} className="flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-xs font-medium text-slate-700 transition-all hover:border-slate-300 sm:px-3 sm:text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent">
                      <input type="radio" name="civility" value={c} required className="sr-only" />
                      {c}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[14px] font-medium text-slate-900">
                    Adresse e-mail <span className="text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="da-field"
                    placeholder="vous@exemple.fr"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-[14px] font-medium text-slate-900">
                    Téléphone portable
                  </label>
                  <PhoneInput
                    name="phone"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-[14px] font-medium text-slate-900">
                  Objet <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  minLength={2}
                  maxLength={150}
                  className="da-field"
                  placeholder="Sujet de votre demande"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-[14px] font-medium text-slate-900">
                  Message <span className="text-accent">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={5}
                  className="da-field resize-none"
                  placeholder="Décrivez votre demande en détail..."
                />
              </div>

              <div className="da-card bg-slate-50 p-3 sm:p-4">
                <div className="space-y-2">
                  <label htmlFor="captcha" className="text-[14px] font-medium text-slate-900">
                    Vérification anti-spam <span className="text-accent">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-medium text-slate-900 sm:text-[15px]">
                      Combien font {captchaParams.num1} + {captchaParams.num2} ?
                    </span>
                    <input
                      type="number"
                      id="captcha"
                      name="captcha"
                      required
                      className="da-field w-20 px-3 py-2 sm:w-24"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="da-btn da-btn-primary w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="size-5" />
                      Envoyer ma demande
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { logoutAccountAction } from "@/app/compte/actions";

interface MobileMenuProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const linkClass =
  "text-[15px] font-medium text-slate-700 transition-colors hover:text-accent";

export function MobileMenu({ isAuthenticated, isAdmin }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-accent-soft hover:text-accent"
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-6 shadow-lg">
          <Link href="/" className={linkClass} onClick={() => setIsOpen(false)}>
            Accueil
          </Link>
          <Link href="/qui-suis-je" className={linkClass} onClick={() => setIsOpen(false)}>
            Qui suis-je ?
          </Link>

          {isAuthenticated ? (
            <>
              <p className="da-eyebrow mt-2 border-t border-slate-200 pt-4">Mon compte</p>
              <Link href="/compte" className={`${linkClass} pl-1`} onClick={() => setIsOpen(false)}>
                Mes rendez-vous
              </Link>
              <Link href="/compte/parametres" className={`${linkClass} pl-1`} onClick={() => setIsOpen(false)}>
                Paramètres
              </Link>
              <Link href="/compte/logs" className={`${linkClass} pl-1`} onClick={() => setIsOpen(false)}>
                Logs d&apos;activité
              </Link>

              <form action={logoutAccountAction}>
                <button
                  type="submit"
                  className="w-full pl-1 text-left text-[15px] font-medium text-rose-600 transition-colors hover:text-rose-700"
                >
                  Se déconnecter
                </button>
              </form>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="da-btn da-btn-sm mt-2 w-full rounded-xl bg-rose-600 font-semibold text-white hover:bg-rose-700"
                  onClick={() => setIsOpen(false)}
                >
                  AdminPanel
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/inscription" className={linkClass} onClick={() => setIsOpen(false)}>
                S&apos;inscrire
              </Link>
              <Link
                href="/connexion"
                className="da-btn da-btn-sm da-btn-primary mt-1 w-full"
                onClick={() => setIsOpen(false)}
              >
                Se connecter
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

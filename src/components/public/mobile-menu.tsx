"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, AlertCircle } from "lucide-react";
import { logoutAccountAction } from "@/app/compte/actions";
import { ContactModal } from "./contact-modal";

interface MobileMenuProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function MobileMenu({ isAuthenticated, isAdmin }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-700 hover:text-slate-900"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />

      {isOpen && (
        <div className="absolute top-full left-0 right-0 border-b border-slate-200 bg-white p-4 shadow-lg flex flex-col gap-4">
          <Link 
            href="/" 
            className="font-medium text-slate-700 hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Accueil
          </Link>
          <Link 
            href="/qui-suis-je" 
            className="font-medium text-slate-700 hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Qui suis-je ?
          </Link>

          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsContactModalOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-md bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-200"
            >
              <AlertCircle className="size-4" />
              Urgence / Contact
            </button>
          </div>
          
          {isAuthenticated ? (
            <>
              <div className="font-semibold text-slate-900 border-t border-slate-100 pt-4 mt-2">
                Mon compte
              </div>
              <Link 
                href="/compte" 
                className="font-medium text-slate-700 hover:text-blue-600 pl-4"
                onClick={() => setIsOpen(false)}
              >
                Mes rendez-vous
              </Link>
              <Link 
                href="/compte/parametres" 
                className="font-medium text-slate-700 hover:text-blue-600 pl-4"
                onClick={() => setIsOpen(false)}
              >
                Paramètres
              </Link>
              <Link 
                href="/compte/logs" 
                className="font-medium text-slate-700 hover:text-blue-600 pl-4"
                onClick={() => setIsOpen(false)}
              >
                Logs d&apos;activité
              </Link>
              
              <form action={logoutAccountAction}>
                <button
                  type="submit"
                  className="font-medium text-rose-600 hover:text-rose-700 pl-4 text-left w-full"
                >
                  Se déconnecter
                </button>
              </form>

              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="font-medium text-white bg-rose-600 px-4 py-2 rounded-md text-center mt-4"
                  onClick={() => setIsOpen(false)}
                >
                  AdminPanel
                </Link>
              )}
            </>
          ) : (
            <>
              <Link 
                href="/inscription" 
                className="font-medium text-slate-700 hover:text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                S&apos;inscrire
              </Link>
              <Link 
                href="/connexion" 
                className="font-medium text-white bg-blue-600 px-4 py-2 rounded-md text-center mt-2"
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
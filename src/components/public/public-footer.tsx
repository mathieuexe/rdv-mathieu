import Script from "next/script";
import Link from "next/link";

import { getSiteSettings } from "@/lib/data-access";

export async function PublicFooter() {
  const settings = await getSiteSettings();

  return (
    <>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-slate-500 sm:flex-row">
          <p>Copyright © {new Date().getFullYear()} RDV Mathieu. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <Link href="/mentions-legales" className="transition-colors hover:text-slate-900">
              Mentions légales
            </Link>
            <Link href="/politique-cookies-securite" className="transition-colors hover:text-slate-900">
              Politique cookies et sécurité
            </Link>
          </div>
        </div>
      </footer>

      {settings.enableWhatsappWidget ? (
        <>
          <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" />
          <div
            className="elfsight-app-662a0ae1-203a-46c9-b266-de8e2f78d432"
            data-elfsight-app-lazy
            style={{
              position: "fixed",
              left: "16px",
              bottom: "16px",
              zIndex: 60,
            }}
          />
        </>
      ) : null}
    </>
  );
}

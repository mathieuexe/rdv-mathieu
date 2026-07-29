import Script from "next/script";
import Link from "next/link";

import { getSiteSettings } from "@/lib/data-access";

export async function PublicFooter() {
  const settings = await getSiteSettings();

  return (
    <>
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5 text-sm text-neutral-600">
          <p>Copyright © {new Date().getFullYear()} RDV Mathieu. Tous droits reserves.</p>
          <div className="flex items-center gap-4">
            <Link href="/mentions-legales" className="underline underline-offset-4">
              Mentions legales
            </Link>
            <Link href="/politique-cookies-securite" className="underline underline-offset-4">
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
          />
        </>
      ) : null}
    </>
  );
}

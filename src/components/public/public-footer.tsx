import Script from "next/script";
import Link from "next/link";

import { getPublicCategories, getSiteSettings } from "@/lib/data-access";
import { formatAppointmentMode } from "@/lib/utils";
import { BookingWidget } from "./booking-widget";

export async function PublicFooter() {
  const [settings, categories] = await Promise.all([getSiteSettings(), getPublicCategories()]);

  return (
    <>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-4 px-6 py-10 text-center">
          <span className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-accent-soft font-serif text-sm font-black text-accent">
            M
          </span>

          <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-slate-900">Mathieu Cerenzia</p>
          <p className="text-sm text-slate-500">Prise de rendez-vous en ligne, développement web et automatisation.</p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <Link href="/qui-suis-je" className="transition-colors hover:text-accent">
              Qui suis-je ?
            </Link>
            <Link href="/mentions-legales" className="transition-colors hover:text-accent">
              Mentions légales
            </Link>
            <Link href="/politique-cookies-securite" className="transition-colors hover:text-accent">
              Politique cookies et sécurité
            </Link>
          </div>

          <p className="mt-2 text-[13px] text-slate-400">
            © {new Date().getFullYear()} Mathieu Cerenzia • Tous droits réservés
          </p>
        </div>
      </footer>

      {settings.bookingBlocked ? null : (
        <BookingWidget
          avatarUrl="/images/mathieu-upscale.png"
          categories={categories.map((category) => ({
            slug: category.slug,
            title: category.title,
            durationMinutes: category.durationMinutes,
            modeLabel: formatAppointmentMode(category.appointmentMode),
            thumbnailUrl: category.thumbnailImageUrl,
            bannerUrl: category.bannerImageUrl,
          }))}
        />
      )}

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

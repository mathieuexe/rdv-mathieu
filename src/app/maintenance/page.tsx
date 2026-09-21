import Link from "next/link";
import { Wrench } from "lucide-react";

import { getSiteSettings } from "@/lib/data-access";

export default async function MaintenancePage() {
  const settings = await getSiteSettings();

  return (
    <main className="flex min-h-screen bg-white px-6 py-12 text-slate-900">
      <section className="m-auto flex w-full max-w-[520px] flex-col items-center text-center">
        <span className="flex size-14 items-center justify-center rounded-full border border-slate-200 bg-accent-soft text-accent">
          <Wrench className="size-7" />
        </span>

        <p className="da-eyebrow mt-5">Indisponible</p>

        <h1 className="da-display mt-2 text-[32px] leading-[1.15] sm:text-[42px]">
          Site en <span className="text-accent">maintenance</span>
        </h1>

        <p className="mt-4 text-[16px] leading-relaxed text-slate-500">
          {settings.maintenanceMessage ||
            "Le site est momentanément indisponible pour des raisons de maintenance. Veuillez nous excuser pour la gêne occasionnée."}
        </p>

        <Link href="/" className="da-btn da-btn-primary mt-10 w-full max-w-[320px]">
          Réessayer
        </Link>
      </section>
    </main>
  );
}

import Link from "next/link";
import { Wrench } from "lucide-react";

import { getSiteSettings } from "@/lib/data-access";

export default async function MaintenancePage() {
  const settings = await getSiteSettings();

  return (
    <main className="flex min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <section className="m-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-slate-100">
          <Wrench className="size-8 text-slate-500" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Site en maintenance</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {settings.maintenanceMessage || "Le site est momentanément indisponible pour des raisons de maintenance. Veuillez nous excuser pour la gêne occasionnée."}
        </p>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <Link href="/" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
            Réessayer
          </Link>
        </div>
      </section>
    </main>
  );
}

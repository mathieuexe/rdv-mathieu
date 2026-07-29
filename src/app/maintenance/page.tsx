import Link from "next/link";

import { getSiteSettings } from "@/lib/data-access";

export default async function MaintenancePage() {
  const settings = await getSiteSettings();

  return (
    <main className="flex min-h-screen bg-white px-6 py-10 text-black">
      <section className="m-auto w-full max-w-2xl border border-neutral-200 px-8 py-10 sm:px-12 sm:py-14">
        <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Maintenance</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Site temporairement indisponible</h1>
        <p className="mt-4 text-sm leading-7 text-neutral-600">
          {settings.maintenanceMessage || "Le site est momentanément en maintenance."}
        </p>

        <div className="mt-8">
          <Link href="/" className="text-sm font-medium underline underline-offset-4">
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>
    </main>
  );
}

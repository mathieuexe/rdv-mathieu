import { revalidatePath } from "next/cache";

import { getGoogleCalendarSyncSecret } from "@/lib/env";
import { syncGoogleCalendar } from "@/lib/google-calendar-sync";

/**
 * Synchronisation périodique de l'agenda Google personnel.
 * À appeler depuis un cron (Vercel Cron, GitHub Actions, cron-job.org…) avec
 * l'en-tête `Authorization: Bearer <GOOGLE_CALENDAR_SYNC_SECRET>`.
 */
export async function GET(request: Request) {
  const secret = getGoogleCalendarSyncSecret();

  if (!secret) {
    return Response.json({ error: "Synchronisation planifiée non configurée." }, { status: 503 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const providedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : new URL(request.url).searchParams.get("secret");

  if (providedSecret !== secret) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }

  const result = await syncGoogleCalendar();

  if (result.status === "success") {
    revalidatePath("/admin/google-calendar");
    revalidatePath("/admin/rendez-vous/agenda");
  }

  return Response.json(result, { status: result.status === "error" ? 500 : 200 });
}

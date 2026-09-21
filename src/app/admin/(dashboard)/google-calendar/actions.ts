"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth";
import {
  deleteAllGoogleCalendarEvents,
  deleteGoogleCalendarAccount,
  getGoogleCalendarAccountWithTokens,
  resetGoogleCalendarEventOverride,
  updateGoogleCalendarEventOverride,
  updateGoogleCalendarPreferences,
} from "@/lib/data-access";
import { parisWallClockToIso, revokeGoogleToken } from "@/lib/google-calendar";
import { syncGoogleCalendar } from "@/lib/google-calendar-sync";

const GOOGLE_CALENDAR_PATH = "/admin/google-calendar";

async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    redirect("/admin/login");
  }

  return session;
}

function revalidateGoogleCalendarViews() {
  revalidatePath(GOOGLE_CALENDAR_PATH);
  revalidatePath("/admin/rendez-vous/agenda");
  revalidatePath("/admin");
}

export async function syncGoogleCalendarAction() {
  await requireAdminSession();

  const result = await syncGoogleCalendar({ ignoreDisabled: true });
  revalidateGoogleCalendarViews();

  if (result.status === "not_connected") {
    redirect(`${GOOGLE_CALENDAR_PATH}?error=${encodeURIComponent("Aucun compte Google connecté.")}`);
  }

  if (result.status === "error") {
    redirect(`${GOOGLE_CALENDAR_PATH}?error=${encodeURIComponent(result.message)}`);
  }

  const eventCount = result.status === "success" ? result.eventCount : 0;
  redirect(`${GOOGLE_CALENDAR_PATH}?synced=${eventCount}`);
}

export async function saveGoogleCalendarPreferencesAction(formData: FormData) {
  await requireAdminSession();

  const account = await getGoogleCalendarAccountWithTokens();

  if (!account) {
    redirect(`${GOOGLE_CALENDAR_PATH}?error=${encodeURIComponent("Aucun compte Google connecté.")}`);
  }

  const calendarIds = formData
    .getAll("calendarIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const syncEnabled = formData.get("syncEnabled") === "on";

  if (calendarIds.length === 0) {
    redirect(
      `${GOOGLE_CALENDAR_PATH}?error=${encodeURIComponent("Sélectionnez au moins un agenda à synchroniser.")}`,
    );
  }

  try {
    await updateGoogleCalendarPreferences({ accountId: account.id, calendarIds, syncEnabled });

    if (syncEnabled) {
      await syncGoogleCalendar();
    } else {
      // Synchronisation coupée : on retire les indisponibilités importées.
      await deleteAllGoogleCalendarEvents(account.id);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Enregistrement impossible.";
    revalidateGoogleCalendarViews();
    redirect(`${GOOGLE_CALENDAR_PATH}?error=${encodeURIComponent(message)}`);
  }

  revalidateGoogleCalendarViews();
  redirect(`${GOOGLE_CALENDAR_PATH}?saved=1`);
}

export async function disconnectGoogleCalendarAction() {
  await requireAdminSession();

  const account = await getGoogleCalendarAccountWithTokens();

  if (account) {
    if (account.refreshToken || account.accessToken) {
      await revokeGoogleToken(account.refreshToken ?? account.accessToken);
    }

    await deleteGoogleCalendarAccount(account.id);
  }

  revalidateGoogleCalendarViews();
  redirect(`${GOOGLE_CALENDAR_PATH}?disconnected=1`);
}

/** Retouche locale d'une indisponibilité importée : titre, date et heures. */
export async function saveGoogleCalendarEventAction(formData: FormData) {
  await requireAdminSession();

  const eventId = String(formData.get("eventId") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();

  if (!eventId || !startDate || !startTime || !endDate || !endTime) {
    redirect(`${GOOGLE_CALENDAR_PATH}?error=${encodeURIComponent("Renseignez la date et l'heure de début et de fin.")}`);
  }

  if (!summary) {
    redirect(`${GOOGLE_CALENDAR_PATH}?error=${encodeURIComponent("Le titre de l'indisponibilité est requis.")}`);
  }

  // `redirect()` lève une exception : la conversion est isolée pour ne pas
  // confondre une erreur de saisie avec une redirection.
  let conversion: { startsAt: string; endsAt: string } | null = null;
  let failure = "";

  try {
    conversion = {
      startsAt: parisWallClockToIso(startDate, startTime),
      endsAt: parisWallClockToIso(endDate, endTime),
    };
  } catch (error) {
    failure = error instanceof Error ? error.message : "Date ou heure invalide.";
  }

  if (!failure && conversion && new Date(conversion.startsAt) >= new Date(conversion.endsAt)) {
    failure = "La fin doit être postérieure au début.";
  }

  if (!failure && conversion) {
    try {
      await updateGoogleCalendarEventOverride({ eventId, summary, ...conversion });
    } catch (error) {
      failure = error instanceof Error ? error.message : "Modification impossible.";
    }
  }

  revalidateGoogleCalendarViews();

  if (failure) {
    redirect(`${GOOGLE_CALENDAR_PATH}?error=${encodeURIComponent(failure)}`);
  }

  redirect(`${GOOGLE_CALENDAR_PATH}?updated=1`);
}

/** Rétablit les valeurs d'origine reçues de Google. */
export async function resetGoogleCalendarEventAction(formData: FormData) {
  await requireAdminSession();

  const eventId = String(formData.get("eventId") ?? "").trim();

  if (!eventId) {
    redirect(`${GOOGLE_CALENDAR_PATH}?error=${encodeURIComponent("Indisponibilité introuvable.")}`);
  }

  try {
    await resetGoogleCalendarEventOverride(eventId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rétablissement impossible.";
    redirect(`${GOOGLE_CALENDAR_PATH}?error=${encodeURIComponent(message)}`);
  }

  revalidateGoogleCalendarViews();
  redirect(`${GOOGLE_CALENDAR_PATH}?restored=1`);
}

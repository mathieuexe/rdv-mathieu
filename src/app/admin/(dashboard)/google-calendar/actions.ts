"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth";
import {
  deleteAllGoogleCalendarEvents,
  deleteGoogleCalendarAccount,
  getGoogleCalendarAccountWithTokens,
  updateGoogleCalendarPreferences,
} from "@/lib/data-access";
import { revokeGoogleToken } from "@/lib/google-calendar";
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

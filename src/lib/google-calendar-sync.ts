import {
  getGoogleCalendarAccountWithTokens,
  replaceGoogleCalendarEvents,
  setGoogleCalendarSyncResult,
  updateGoogleCalendarAccessToken,
} from "@/lib/data-access";
import { isGoogleCalendarConfigured } from "@/lib/env";
import {
  type GoogleBusyEvent,
  listGoogleBusyEvents,
  listGoogleCalendars,
  refreshGoogleAccessToken,
} from "@/lib/google-calendar";

/** Fenêtre synchronisée : un peu de passé pour l'agenda, large horizon pour les réservations. */
const SYNC_WINDOW_PAST_DAYS = 7;
const SYNC_WINDOW_FUTURE_DAYS = 120;
/** Durée au-delà de laquelle une synchronisation automatique est relancée. */
const SYNC_STALE_AFTER_MS = 10 * 60 * 1000;

export type GoogleSyncResult =
  | { status: "not_connected" }
  | { status: "disabled" }
  | { status: "skipped"; lastSyncedAt?: string }
  | { status: "success"; eventCount: number; calendarCount: number }
  | { status: "error"; message: string };

function getSyncWindow() {
  const now = Date.now();

  return {
    timeMin: new Date(now - SYNC_WINDOW_PAST_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    timeMax: new Date(now + SYNC_WINDOW_FUTURE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
  };
}

type AccountWithTokens = NonNullable<Awaited<ReturnType<typeof getGoogleCalendarAccountWithTokens>>>;

/** Renvoie un jeton d'accès valide, en le rafraîchissant au besoin. */
export async function getFreshGoogleAccessToken(account: AccountWithTokens) {
  const expiresAt = new Date(account.tokenExpiresAt).getTime();

  if (Number.isFinite(expiresAt) && expiresAt - Date.now() > 2 * 60 * 1000) {
    return account.accessToken;
  }

  if (!account.refreshToken) {
    throw new Error(
      "Jeton Google expiré et aucun jeton de rafraîchissement enregistré. Reconnectez le compte Google.",
    );
  }

  const tokens = await refreshGoogleAccessToken(account.refreshToken);
  await updateGoogleCalendarAccessToken(account.id, tokens.accessToken, tokens.expiresAt);

  return tokens.accessToken;
}

/** Liste les agendas disponibles du compte connecté (pour la sélection en administration). */
export async function listAvailableGoogleCalendars() {
  const account = await getGoogleCalendarAccountWithTokens();

  if (!account) {
    return [];
  }

  try {
    const accessToken = await getFreshGoogleAccessToken(account);
    return await listGoogleCalendars(accessToken);
  } catch {
    return [];
  }
}

export async function syncGoogleCalendar(options?: { ignoreDisabled?: boolean }): Promise<GoogleSyncResult> {
  const account = await getGoogleCalendarAccountWithTokens();

  if (!account) {
    return { status: "not_connected" };
  }

  if (!account.syncEnabled && !options?.ignoreDisabled) {
    return { status: "disabled" };
  }

  const { timeMin, timeMax } = getSyncWindow();
  const calendarIds = account.calendarIds.length > 0 ? account.calendarIds : ["primary"];

  try {
    const accessToken = await getFreshGoogleAccessToken(account);
    const collected: GoogleBusyEvent[] = [];

    for (const calendarId of calendarIds) {
      const events = await listGoogleBusyEvents({ accessToken, calendarId, timeMin, timeMax });
      collected.push(...events);
    }

    // Un même évènement peut apparaître sur plusieurs agendas partagés.
    const deduplicated = Array.from(
      new Map(collected.map((event) => [`${event.calendarId}::${event.googleEventId}`, event])).values(),
    );

    const eventCount = await replaceGoogleCalendarEvents({
      accountId: account.id,
      calendarIds,
      windowStartIso: timeMin,
      windowEndIso: timeMax,
      events: deduplicated,
    });

    await setGoogleCalendarSyncResult({ accountId: account.id, eventCount, error: null });

    return { status: "success", eventCount, calendarCount: calendarIds.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue lors de la synchronisation Google.";
    await setGoogleCalendarSyncResult({ accountId: account.id, eventCount: 0, error: message });

    return { status: "error", message };
  }
}

/** Synchronise uniquement si la dernière synchronisation date de plus de 10 minutes. */
export async function syncGoogleCalendarIfStale(): Promise<GoogleSyncResult> {
  const account = await getGoogleCalendarAccountWithTokens();

  if (!account) {
    return { status: "not_connected" };
  }

  if (!account.syncEnabled) {
    return { status: "disabled" };
  }

  const lastSyncedAt = account.lastSyncedAt ? new Date(account.lastSyncedAt).getTime() : 0;

  if (Date.now() - lastSyncedAt < SYNC_STALE_AFTER_MS) {
    return { status: "skipped", lastSyncedAt: account.lastSyncedAt };
  }

  return syncGoogleCalendar();
}

/**
 * Point d'entrée des pages publiques : garantit que les indisponibilités
 * personnelles sont à jour avant de calculer les créneaux, sans jamais
 * faire échouer la requête si Google est indisponible.
 */
export async function refreshPersonalAvailabilityIfStale() {
  if (!isGoogleCalendarConfigured()) {
    return;
  }

  try {
    await syncGoogleCalendarIfStale();
  } catch {
    // La synchronisation ne doit jamais bloquer la prise de rendez-vous.
  }
}

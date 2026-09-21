import { getGoogleOAuthEnv, isGoogleCalendarConfigured } from "@/lib/env";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export const GOOGLE_OAUTH_STATE_COOKIE = "google_calendar_oauth_state";

export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

const PARIS_TIME_ZONE = "Europe/Paris";

export interface GoogleTokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  scope?: string;
}

export interface GoogleCalendarSummary {
  id: string;
  summary: string;
  primary: boolean;
  accessRole: string;
}

export interface GoogleBusyEvent {
  googleEventId: string;
  calendarId: string;
  calendarSummary?: string;
  summary: string;
  startsAt: string;
  endsAt: string;
  isAllDay: boolean;
  htmlLink?: string;
}

function getTimeZoneOffsetMinutes(instant: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(instant).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return (asUtc - instant.getTime()) / 60_000;
}

/**
 * Convertit une heure murale parisienne (`2026-09-21`, `14:30`) en instant ISO.
 * Utilisé pour les évènements « journée entière » et pour les retouches saisies
 * en administration.
 */
export function parisWallClockToIso(dateOnly: string, time = "00:00") {
  const normalizedTime = /^\d{2}:\d{2}$/.test(time) ? time : "00:00";
  const naive = new Date(`${dateOnly}T${normalizedTime}:00Z`);

  if (Number.isNaN(naive.getTime())) {
    throw new Error("Date ou heure invalide.");
  }

  const offsetMinutes = getTimeZoneOffsetMinutes(naive, PARIS_TIME_ZONE);

  return new Date(naive.getTime() - offsetMinutes * 60_000).toISOString();
}

/** Convertit une date "journée entière" Google (YYYY-MM-DD) en minuit heure de Paris. */
export function parisDayStartToIso(dateOnly: string) {
  return parisWallClockToIso(dateOnly);
}

type JsonRecord = Record<string, unknown>;

function readString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function readRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" ? (value as JsonRecord) : {};
}

function readRecordArray(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.filter((item): item is JsonRecord => Boolean(item) && typeof item === "object") : [];
}

async function googleFetchJson(url: string, init: RequestInit, errorPrefix: string): Promise<JsonRecord> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const payload = readRecord(await response.json().catch(() => null));

  if (!response.ok) {
    const description =
      readString(payload.error_description) ??
      (payload.error !== undefined ? JSON.stringify(payload.error) : undefined) ??
      `HTTP ${response.status}`;

    throw new Error(`${errorPrefix} : ${description}`);
  }

  return payload;
}

export function buildGoogleAuthUrl(state: string) {
  const { clientId, redirectUri } = getGoogleOAuthEnv();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_CALENDAR_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

function toTokenSet(payload: JsonRecord): GoogleTokenSet {
  const expiresInSeconds = Number(payload.expires_in ?? 3600);

  return {
    accessToken: String(payload.access_token),
    refreshToken: readString(payload.refresh_token),
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    scope: readString(payload.scope),
  };
}

export async function exchangeGoogleAuthCode(code: string): Promise<GoogleTokenSet> {
  if (!isGoogleCalendarConfigured()) {
    throw new Error("Les identifiants Google ne sont pas configurés.");
  }

  const { clientId, clientSecret, redirectUri } = getGoogleOAuthEnv();
  const payload = await googleFetchJson(
    GOOGLE_TOKEN_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    },
    "Échec de l'échange du code Google",
  );

  return toTokenSet(payload);
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<GoogleTokenSet> {
  if (!isGoogleCalendarConfigured()) {
    throw new Error("Les identifiants Google ne sont pas configurés.");
  }

  const { clientId, clientSecret } = getGoogleOAuthEnv();
  const payload = await googleFetchJson(
    GOOGLE_TOKEN_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
      }),
    },
    "Impossible de rafraîchir le jeton Google",
  );

  return { ...toTokenSet(payload), refreshToken };
}

export async function revokeGoogleToken(token: string) {
  await fetch(GOOGLE_REVOKE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
    cache: "no-store",
  }).catch(() => null);
}

export async function fetchGoogleAccountEmail(accessToken: string) {
  const payload = await googleFetchJson(
    GOOGLE_USERINFO_URL,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    "Impossible de lire le compte Google",
  );

  return typeof payload.email === "string" ? payload.email.toLowerCase() : "";
}

export async function listGoogleCalendars(accessToken: string): Promise<GoogleCalendarSummary[]> {
  const payload = await googleFetchJson(
    `${GOOGLE_CALENDAR_API}/users/me/calendarList?minAccessRole=reader&maxResults=250`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    "Impossible de lister les agendas Google",
  );

  return readRecordArray(payload.items).map((item) => ({
    id: String(item.id),
    summary: String(item.summaryOverride ?? item.summary ?? item.id),
    primary: Boolean(item.primary),
    accessRole: String(item.accessRole ?? "reader"),
  }));
}

/**
 * Récupère les évènements occupés d'un agenda sur une fenêtre donnée.
 * Les évènements marqués "Disponible" (transparency) et les refus sont ignorés :
 * ils ne doivent pas bloquer de créneau.
 */
export async function listGoogleBusyEvents(input: {
  accessToken: string;
  calendarId: string;
  timeMin: string;
  timeMax: string;
}): Promise<GoogleBusyEvent[]> {
  const events: GoogleBusyEvent[] = [];
  let pageToken: string | undefined;
  let calendarSummary: string | undefined;

  do {
    const params = new URLSearchParams({
      timeMin: input.timeMin,
      timeMax: input.timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      showDeleted: "false",
      maxResults: "250",
    });

    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const payload = await googleFetchJson(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(input.calendarId)}/events?${params.toString()}`,
      { headers: { Authorization: `Bearer ${input.accessToken}` } },
      `Impossible de lire l'agenda « ${input.calendarId} »`,
    );

    calendarSummary = readString(payload.summary) ?? calendarSummary;

    for (const item of readRecordArray(payload.items)) {
      if (item.status === "cancelled" || item.transparency === "transparent") {
        continue;
      }

      const selfAttendee = readRecordArray(item.attendees).find((attendee) => attendee.self === true);

      if (selfAttendee?.responseStatus === "declined") {
        continue;
      }

      const start = readRecord(item.start);
      const end = readRecord(item.end);
      const startDate = readString(start.date);
      const endDate = readString(end.date);
      const startDateTime = readString(start.dateTime);
      const endDateTime = readString(end.dateTime);
      const isAllDay = Boolean(startDate);

      const startsAt = startDate
        ? parisDayStartToIso(startDate)
        : startDateTime
          ? new Date(startDateTime).toISOString()
          : null;
      const endsAt = isAllDay
        ? parisDayStartToIso(endDate ?? startDate!)
        : endDateTime
          ? new Date(endDateTime).toISOString()
          : null;

      if (!startsAt || !endsAt || startsAt >= endsAt) {
        continue;
      }

      const summary = readString(item.summary)?.trim();

      events.push({
        googleEventId: String(item.id),
        calendarId: input.calendarId,
        calendarSummary,
        summary: summary || "Occupé",
        startsAt,
        endsAt,
        isAllDay,
        htmlLink: readString(item.htmlLink),
      });
    }

    pageToken = readString(payload.nextPageToken);
  } while (pageToken);

  return events;
}

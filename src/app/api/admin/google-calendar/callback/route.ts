import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { getGoogleCalendarAccount, upsertGoogleCalendarAccount } from "@/lib/data-access";
import {
  exchangeGoogleAuthCode,
  fetchGoogleAccountEmail,
  GOOGLE_OAUTH_STATE_COOKIE,
} from "@/lib/google-calendar";
import { syncGoogleCalendar } from "@/lib/google-calendar-sync";

function redirectWithError(origin: string, message: string) {
  return NextResponse.redirect(`${origin}/admin/google-calendar?error=${encodeURIComponent(message)}`);
}

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return NextResponse.redirect(`${origin}/admin/login`);
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(GOOGLE_OAUTH_STATE_COOKIE);

  const error = searchParams.get("error");

  if (error) {
    return redirectWithError(origin, `Connexion Google refusée (${error}).`);
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithError(origin, "Requête de connexion Google invalide ou expirée. Réessayez.");
  }

  try {
    const tokens = await exchangeGoogleAuthCode(code);
    const googleEmail = await fetchGoogleAccountEmail(tokens.accessToken);
    const existing = await getGoogleCalendarAccount();

    await upsertGoogleCalendarAccount({
      googleEmail,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: tokens.expiresAt,
      scope: tokens.scope,
      calendarIds: existing?.calendarIds ?? ["primary"],
    });

    const result = await syncGoogleCalendar({ ignoreDisabled: true });

    revalidatePath("/admin/google-calendar");
    revalidatePath("/admin/rendez-vous/agenda");

    if (result.status === "error") {
      return redirectWithError(origin, `Compte connecté mais synchronisation impossible : ${result.message}`);
    }

    return NextResponse.redirect(`${origin}/admin/google-calendar?connected=1`);
  } catch (caughtError) {
    const message =
      caughtError instanceof Error && caughtError.message
        ? caughtError.message
        : "Impossible de connecter le compte Google.";

    return redirectWithError(origin, message);
  }
}

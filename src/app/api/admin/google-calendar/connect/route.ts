import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { isGoogleCalendarConfigured } from "@/lib/env";
import { buildGoogleAuthUrl, GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/google-calendar";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const session = await getAdminSession();

  if (!session.isAuthenticated) {
    return NextResponse.redirect(`${origin}/admin/login`);
  }

  if (!isGoogleCalendarConfigured()) {
    const message = encodeURIComponent(
      "Identifiants Google manquants : renseignez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.",
    );
    return NextResponse.redirect(`${origin}/admin/google-calendar?error=${message}`);
  }

  const state = randomBytes(24).toString("hex");
  const cookieStore = await cookies();

  cookieStore.set({
    name: GOOGLE_OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(buildGoogleAuthUrl(state));
}

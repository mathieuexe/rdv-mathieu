import { cookies } from "next/headers";

import { getAdminEmail, isSupabaseConfigured } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const DEMO_COOKIE = "rdv_demo_admin";

export async function getAdminSession() {
  const cookieStore = await cookies();

  if (!isSupabaseConfigured()) {
    const demoEnabled = cookieStore.get(DEMO_COOKIE)?.value === "1";

    return {
      isAuthenticated: demoEnabled,
      isDemoMode: true,
      email: getAdminEmail(),
    };
  }

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase!.auth.getUser();

  const email = data.user?.email?.toLowerCase();

  return {
    isAuthenticated: Boolean(email && email === getAdminEmail()),
    isDemoMode: false,
    email,
  };
}

export async function setDemoAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearDemoAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
}

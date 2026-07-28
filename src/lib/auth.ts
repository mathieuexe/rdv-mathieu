import { cookies } from "next/headers";

import { getAdminEmail, isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
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
  const user = data.user;
  const email = user?.email?.toLowerCase();
  const isAdmin = user ? await isUserAdmin(user.id) : false;

  return {
    isAuthenticated: Boolean(email && isAdmin),
    isDemoMode: false,
    email,
    userId: user?.id,
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

export interface PublicUserSession {
  isAuthenticated: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  userId?: string;
  isAdmin?: boolean;
}

export async function isUserAdmin(userId: string) {
  const supabaseAdmin = getSupabaseAdminClient();

  if (!supabaseAdmin) {
    return false;
  }

  const { data } = await supabaseAdmin.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
  return Boolean(data?.user_id);
}

export async function getPublicUserSession(): Promise<PublicUserSession> {
  if (!isSupabaseConfigured()) {
    return {
      isAuthenticated: false,
    };
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      isAuthenticated: false,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      isAuthenticated: false,
    };
  }

  const isAdmin = await isUserAdmin(user.id);

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("first_name, last_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const firstName =
    typeof profile?.first_name === "string"
      ? profile.first_name
      : typeof user.user_metadata.first_name === "string"
        ? user.user_metadata.first_name
        : undefined;
  const lastName =
    typeof profile?.last_name === "string"
      ? profile.last_name
      : typeof user.user_metadata.last_name === "string"
        ? user.user_metadata.last_name
        : undefined;
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || user.email;

  return {
    isAuthenticated: true,
    userId: user.id,
    email: user.email.toLowerCase(),
    firstName,
    lastName,
    fullName,
    isAdmin,
  };
}

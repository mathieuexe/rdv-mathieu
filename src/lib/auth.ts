import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminSession() {
  if (!isSupabaseConfigured()) {
    return {
      isAuthenticated: false,
      email: undefined,
    };
  }

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase!.auth.getUser();
  const user = data.user;
  const email = user?.email?.toLowerCase();
  const isAdmin = user ? await isUserAdmin(user.id) : false;

  return {
    isAuthenticated: Boolean(email && isAdmin),
    email,
    userId: user?.id,
  };
}

export interface PublicUserSession {
  isAuthenticated: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  userId?: string;
  isAdmin?: boolean;
  requiresPasswordChange?: boolean;
  isBanned?: boolean;
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
    .select("first_name, last_name, phone, requires_password_change, is_banned")
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
  const phone = typeof profile?.phone === "string" ? profile.phone : undefined;
  const requiresPasswordChange = Boolean(profile?.requires_password_change);
  const isBanned = Boolean(profile?.is_banned);

  return {
    isAuthenticated: true,
    userId: user.id,
    email: user.email.toLowerCase(),
    firstName,
    lastName,
    fullName,
    phone,
    isAdmin,
    requiresPasswordChange,
    isBanned,
  };
}

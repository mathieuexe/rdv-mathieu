const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(publicSupabaseUrl && publicSupabaseAnonKey);
}

export function isAdminSupabaseConfigured() {
  return Boolean(publicSupabaseUrl && serviceRoleKey);
}

export function getPublicSupabaseEnv() {
  return {
    url: publicSupabaseUrl ?? "",
    anonKey: publicSupabaseAnonKey ?? "",
  };
}

export function getServiceRoleEnv() {
  return {
    url: publicSupabaseUrl ?? "",
    serviceRoleKey: serviceRoleKey ?? "",
  };
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.toLowerCase() ?? "admin@example.com";
}

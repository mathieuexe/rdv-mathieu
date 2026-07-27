import { createClient } from "@supabase/supabase-js";

import { getServiceRoleEnv, isAdminSupabaseConfigured } from "@/lib/env";

export function getSupabaseAdminClient() {
  if (!isAdminSupabaseConfigured()) {
    return null;
  }

  const { url, serviceRoleKey } = getServiceRoleEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { extractClientContextFromHeaders } from "@/lib/account-activity";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, sessionId, path, title, userId } = body;

    const requestHeaders = await headers();
    const clientContext = extractClientContextFromHeaders(requestHeaders);
    const supabase = getSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (action === "start") {
      const { data, error } = await supabase
        .from("page_views")
        .insert({
          session_id: sessionId,
          user_id: userId || null,
          path,
          title,
          ip_address: clientContext.ipAddress,
          country: clientContext.country,
          device_type: clientContext.deviceType,
          operating_system: clientContext.operatingSystem,
          browser: clientContext.browser,
          duration_seconds: 0,
        })
        .select("id")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ id: data.id });
    } else if (action === "ping" && id) {
      // Ping updates the duration_seconds
      // we assume ping is sent every 5 seconds, so we just increment by 5 or just send total duration
      const { duration } = body;
      
      const { error } = await supabase
        .from("page_views")
        .update({ duration_seconds: duration })
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

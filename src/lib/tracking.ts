import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export interface TrackingStats {
  totalViews: number;
  uniqueVisitors: number;
  averageDuration: number;
  topPages: { path: string; title: string; views: number }[];
  topCountries: { country: string; count: number }[];
  deviceStats: { device: string; count: number }[];
}

export async function getTrackingStats(days = 30): Promise<TrackingStats> {
  const supabase = getSupabaseAdminClient();
  
  if (!supabase) {
    throw new Error("Database not connected");
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString();

  // For complex aggregations, we'll fetch raw data and process in memory 
  // (In a real app with huge traffic, we'd use SQL functions, but this is fine for now)
  const { data: views, error } = await supabase
    .from("page_views")
    .select("*")
    .gte("created_at", startDateStr);

  if (error || !views) {
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      averageDuration: 0,
      topPages: [],
      topCountries: [],
      deviceStats: [],
    };
  }

  const totalViews = views.length;
  const uniqueSessions = new Set(views.map(v => v.session_id));
  const uniqueVisitors = uniqueSessions.size;
  
  const totalDuration = views.reduce((sum, v) => sum + (v.duration_seconds || 0), 0);
  const averageDuration = totalViews > 0 ? Math.round(totalDuration / totalViews) : 0;

  // Top Pages
  const pageMap = new Map<string, { path: string; title: string; views: number }>();
  for (const v of views) {
    const existing = pageMap.get(v.path) || { path: v.path, title: v.title || v.path, views: 0 };
    existing.views++;
    if (v.title && v.title !== v.path) existing.title = v.title; // update title if found
    pageMap.set(v.path, existing);
  }
  const topPages = Array.from(pageMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Top Countries
  const countryMap = new Map<string, number>();
  for (const v of views) {
    const country = v.country || "Inconnu";
    countryMap.set(country, (countryMap.get(country) || 0) + 1);
  }
  const topCountries = Array.from(countryMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Devices
  const deviceMap = new Map<string, number>();
  for (const v of views) {
    const device = v.device_type || "desktop";
    deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
  }
  const deviceStats = Array.from(deviceMap.entries())
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalViews,
    uniqueVisitors,
    averageDuration,
    topPages,
    topCountries,
    deviceStats,
  };
}

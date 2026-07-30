"use client";

import dynamic from "next/dynamic";

export const DynamicAdminAgendaCalendar = dynamic(
  () => import("./admin-agenda-calendar").then((mod) => mod.AdminAgendaCalendar),
  { ssr: false, loading: () => <div className="h-[600px] w-full animate-pulse rounded-lg bg-slate-100" /> }
);

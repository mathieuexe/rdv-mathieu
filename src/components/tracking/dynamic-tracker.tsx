"use client";

import dynamic from "next/dynamic";

export const DynamicTracker = dynamic(() => import("./tracker").then((mod) => mod.Tracker), { ssr: false });

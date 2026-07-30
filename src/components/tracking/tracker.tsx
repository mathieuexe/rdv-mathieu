"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function Tracker({ userId }: { userId?: string }) {
  const pathname = usePathname();
  const sessionIdRef = useRef<string>("");
  const currentViewIdRef = useRef<string | null>(null);
  const durationRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionIdRef.current) {
      const stored = sessionStorage.getItem("app_session_id");
      if (stored) {
        sessionIdRef.current = stored;
      } else {
        const newSessionId = generateSessionId();
        sessionStorage.setItem("app_session_id", newSessionId);
        sessionIdRef.current = newSessionId;
      }
    }
  }, []);

  useEffect(() => {
    // Reset duration for new page
    durationRef.current = 0;
    currentViewIdRef.current = null;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (pathname.startsWith("/admin")) {
      // Do not track admin routes to keep data clean
      return;
    }

    const startTracking = async () => {
      try {
        const response = await fetch("/api/public/tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "start",
            sessionId: sessionIdRef.current,
            path: pathname,
            title: document.title,
            userId: userId,
          }),
        });
        
        const data = await response.json();
        if (data.id) {
          currentViewIdRef.current = data.id;
          
          // Start pinging every 5 seconds
          intervalRef.current = setInterval(async () => {
            if (!currentViewIdRef.current) return;
            
            durationRef.current += 5;
            
            // We use keepalive to ensure request is sent even if navigating away
            try {
              fetch("/api/public/tracking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "ping",
                  id: currentViewIdRef.current,
                  duration: durationRef.current,
                }),
                keepalive: true,
              });
            } catch (e) {
              // Ignore ping errors
            }
          }, 5000);
        }
      } catch (error) {
        // Ignore tracking errors
      }
    };

    // Delay slightly to let document title update
    const timeoutId = setTimeout(startTracking, 500);

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pathname, userId]);

  return null;
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Bell, BellRing, Check, Info, AlertTriangle, UserPlus, CalendarPlus, CalendarMinus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type NotificationType = "new_user" | "new_appointment" | "canceled_appointment" | "approaching_appointment";

interface AdminNotification {
  id: string;
  type: NotificationType;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Audio elements for notifications
  const newNotificationAudio = useRef<HTMLAudioElement | null>(null);
  const approachingAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // We create audio objects only on the client side
    newNotificationAudio.current = new Audio("/sounds/notification.mp3");
    approachingAudio.current = new Audio("/sounds/notification.mp3");
  }, []);

  const playNotificationSound = () => {
    if (newNotificationAudio.current) {
      newNotificationAudio.current.play().catch((e) => console.log("Audio play prevented:", e));
    }
  };

  const playApproachingSound = () => {
    if (approachingAudio.current) {
      approachingAudio.current.play().catch((e) => console.log("Audio play prevented:", e));
    }
  };

  const fetchNotifications = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data as AdminNotification[]);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    // Subscribe to new notifications
    const channel = supabase
      .channel("admin_notifications_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
        },
        (payload) => {
          const newNotif = payload.new as AdminNotification;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
          playNotificationSound();
          
          // Optionally, show a native browser notification
          if (Notification.permission === "granted") {
            new Notification("Administration", { body: newNotif.message });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  // Approaching appointments polling (every minute)
  useEffect(() => {
    const checkApproachingAppointments = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      // Find appointments in the next 15 minutes
      const now = new Date();
      const in15Minutes = new Date(now.getTime() + 15 * 60000);

      const { data, error } = await supabase
        .from("appointments")
        .select("id, first_name, last_name, starts_at")
        .in("status", ["en_attente", "accepte"])
        .gte("starts_at", now.toISOString())
        .lte("starts_at", in15Minutes.toISOString());

      if (!error && data && data.length > 0) {
        // For each approaching appointment, check if we already alerted
        data.forEach((app) => {
          const alertedKey = `alerted_approaching_${app.id}`;
          if (!localStorage.getItem(alertedKey)) {
            localStorage.setItem(alertedKey, "true");
            
            const newNotif: AdminNotification = {
              id: `approaching_${app.id}`,
              type: "approaching_appointment",
              message: `Le rendez-vous de ${app.first_name} ${app.last_name} commence bientôt !`,
              link: `/admin/rendez-vous/${app.id}`,
              is_read: false,
              created_at: new Date().toISOString(),
            };

            setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
            setUnreadCount((prev) => prev + 1);
            playApproachingSound();

            if (Notification.permission === "granted") {
              new Notification("Rendez-vous imminent !", { body: newNotif.message });
            }
          }
        });
      }
    };

    // Check immediately, then every 1 minute
    checkApproachingAppointments();
    const interval = setInterval(checkApproachingAppointments, 60000);

    return () => clearInterval(interval);
  }, []);

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    // If it's a virtual notification (approaching)
    if (id.startsWith("approaching_")) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await supabase.from("admin_notifications").update({ is_read: true }).eq("id", id);
  };

  const markAllAsRead = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    await supabase.from("admin_notifications").update({ is_read: true }).eq("is_read", false);
  };

  const deleteAllNotifications = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setNotifications([]);
    setUnreadCount(0);

    // Delete all from DB where id is not null (which is all of them)
    const { error } = await supabase.from("admin_notifications").delete().not("id", "is", null);
    if (error) {
      console.error("Erreur lors de la suppression des notifications:", error);
    }
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case "new_user":
        return <UserPlus className="size-4 text-blue-600" />;
      case "new_appointment":
        return <CalendarPlus className="size-4 text-emerald-600" />;
      case "canceled_appointment":
        return <CalendarMinus className="size-4 text-rose-600" />;
      case "approaching_appointment":
        return <AlertTriangle className="size-4 text-amber-600" />;
      default:
        return <Info className="size-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex size-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
      >
        {unreadCount > 0 ? <BellRing className="size-5 animate-pulse text-blue-600" /> : <Bell className="size-5" />}
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex size-2.5 items-center justify-center rounded-full bg-rose-500 ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Tout lu
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={deleteAllNotifications}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Tout supprimer
                </button>
              )}
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Aucune notification pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50",
                      !notification.is_read ? "bg-blue-50/50" : ""
                    )}
                  >
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !notification.is_read ? "font-medium text-slate-900" : "text-slate-600")}>
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(notification.created_at).toLocaleString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        {notification.link && (
                          <button
                            onClick={() => {
                              markAsRead(notification.id);
                              router.push(notification.link!);
                              setIsOpen(false);
                            }}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            Voir les détails
                          </button>
                        )}
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs font-medium text-slate-500 hover:text-slate-700"
                          >
                            Marquer comme lu
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

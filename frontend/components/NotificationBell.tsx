"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const generateDeadlineNotifications = useCallback(async (uid: string) => {
    const { data: opps } = await supabase
      .from("opportunities")
      .select("id, company, role, deadline, days_left")
      .eq("user_id", uid)
      .lte("days_left", 3)
      .gt("days_left", 0);

    if (opps && opps.length > 0) {
      for (const opp of opps) {
        const exists = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", uid)
          .eq("link", `/dashboard#${opp.id}`)
          .single();

        if (!exists.data) {
          await supabase.from("notifications").insert({
            user_id: uid,
            type: "deadline",
            title: `⏰ ${opp.company} deadline approaching!`,
            message: `${opp.role} — ${opp.days_left} day(s) left (${opp.deadline})`,
            link: `/dashboard#${opp.id}`,
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      await generateDeadlineNotifications(user.id);

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setNotifications(data as Notification[]);
    };
    init();
  }, [generateDeadlineNotifications]);

  // Realtime
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const typeIcons: Record<string, string> = {
    deadline: "⏰",
    community: "👥",
    duplicate: "📋",
    spam: "⚠️",
    general: "🔔",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-[#0A0B15] border border-[#12142A] rounded-xl shadow-2xl z-50 max-h-[400px] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#12142A]">
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-[340px]">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-[#12142A]/50 hover:bg-white/5 transition-colors cursor-pointer ${
                      !n.is_read ? "bg-indigo-500/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{typeIcons[n.type] || "🔔"}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!n.is_read ? "text-white" : "text-slate-400"}`}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{n.message}</p>
                        )}
                        <p className="text-[10px] text-slate-600 mt-1">
                          {new Date(n.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!n.is_read && (
                        <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

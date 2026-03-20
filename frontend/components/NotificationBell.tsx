"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const generateDeadlineNotifications = useCallback(async (uid: string) => {
    // Check deadlines for 1, 3, and 7 days
    const { data: opps } = await supabase
      .from("opportunities")
      .select("id, company, role, deadline, days_left")
      .eq("user_id", uid)
      .lte("days_left", 7)
      .gt("days_left", 0)
      .eq("is_applied", false);

    if (!opps || opps.length === 0) return;

    const todayStr = new Date().toISOString().split("T")[0];

    for (const opp of opps) {
      const daysLeft = opp.days_left;
      if (![1, 3, 7].includes(daysLeft)) continue;

      // Deduplicate: one notification per opp per day
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", uid)
        .eq("type", "deadline")
        .like("message", `%${opp.id}%`)
        .gte("created_at", `${todayStr}T00:00:00`)
        .maybeSingle();

      if (existing) continue;

      const urgency =
        daysLeft === 1
          ? "⚠️ URGENT — Deadline Tomorrow!"
          : daysLeft === 3
          ? "⏳ Deadline in 3 Days"
          : "📅 Deadline in 1 Week";

      await supabase.from("notifications").insert({
        user_id: uid,
        type: "deadline",
        title: urgency,
        message: `💼 ${opp.company} — ${opp.role} | Due: ${opp.deadline} | id:${opp.id}`,
        link: "/dashboard",
      });
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

  // Real-time listener — shows new notifications instantly without refresh
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

  const handleClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notification.id);
      setNotifications((prev) =>
        prev.map((n) => n.id === notification.id ? { ...n, is_read: true } : n)
      );
    }
    setOpen(false);
    if (notification.link) router.push(notification.link);
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleExtractClick = (e: React.MouseEvent, message: string) => {
    e.stopPropagation();
    setOpen(false);
    const textToExtract = message.replace(/\|?\s*id:[a-f0-9-]+/g, "").trim();
    router.push(`/extract?text=${encodeURIComponent(textToExtract)}`);
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
                <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300">
                  Mark all read
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-[340px]">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No notifications yet 🔔
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`px-4 py-3 border-b border-[#12142A]/50 hover:bg-white/5 transition-colors cursor-pointer group ${
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
                          <div className="mt-1">
                            <p className="text-xs text-slate-500 whitespace-pre-wrap line-clamp-2 mb-1.5">
                              {n.message.replace(/\|?\s*id:[a-f0-9-]+/g, "")}
                            </p>
                            <button
                              onClick={(e) => handleExtractClick(e, n.message)}
                              className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-medium rounded border border-indigo-500/20 transition-colors"
                            >
                              <Zap className="w-3 h-3" />
                              Extract Details
                            </button>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-600 mt-1">
                          {new Date(n.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        {!n.is_read && <div className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0" />}
                        <button
                          onClick={(e) => deleteNotification(e, n.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
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

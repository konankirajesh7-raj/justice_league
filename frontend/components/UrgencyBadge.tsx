"use client";

import React from "react";

interface UrgencyBadgeProps {
  daysLeft: number | null;
  urgency: string;
}

export default function UrgencyBadge({ daysLeft, urgency }: UrgencyBadgeProps) {
  if (daysLeft === null || daysLeft === undefined) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700">
        📅 No deadline
      </span>
    );
  }

  if (daysLeft <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
        ⛔ Expired
      </span>
    );
  }

  if (urgency === "red") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
        🔴 {daysLeft} day{daysLeft !== 1 ? "s" : ""} left - URGENT
      </span>
    );
  }

  if (urgency === "yellow") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        🟡 {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      🟢 {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
    </span>
  );
}

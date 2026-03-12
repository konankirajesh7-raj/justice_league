"use client";

import React from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export default function EmptyState({
  title = "No opportunities yet",
  description = "Start by pasting a WhatsApp message to extract opportunity details.",
  actionText = "Paste a WhatsApp message →",
  actionHref = "/extract",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
        <Inbox className="w-10 h-10 text-indigo-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md mb-6">{description}</p>
      <Link
        href={actionHref}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5"
      >
        {actionText}
      </Link>
    </div>
  );
}

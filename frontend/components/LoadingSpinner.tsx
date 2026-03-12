"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20" />
        <Loader2 className="absolute inset-0 w-12 h-12 text-indigo-500 animate-spin" />
      </div>
      <p className="text-slate-400 text-sm font-medium animate-pulse">
        {message}
      </p>
    </div>
  );
}

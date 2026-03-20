"use client";

import React from "react";

interface Props {
  message?: string;
  skeleton?: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-[#0a0b15] border border-[#12142a] rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="shimmer w-11 h-11 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="shimmer h-4 w-3/4 rounded" />
          <div className="shimmer h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="shimmer h-5 w-20 rounded-full" />
        <div className="shimmer h-5 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer h-3 w-full rounded" />
      </div>
      <div className="pt-3 border-t border-white/5 flex gap-2">
        <div className="shimmer h-7 w-20 rounded-lg" />
        <div className="shimmer h-7 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export default function LoadingSpinner({ message = "Loading...", skeleton = false }: Props) {
  if (skeleton) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      {/* Pulsing AI orb */}
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" style={{ animationDuration: "1.5s" }} />
      </div>
      <p className="text-sm text-slate-400 font-medium text-center max-w-xs">{message}</p>
    </div>
  );
}

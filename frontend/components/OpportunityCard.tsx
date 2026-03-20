"use client";

import React from "react";
import UrgencyBadge from "./UrgencyBadge";
import {
  ExternalLink, CheckCircle, Share2, Trash2,
  MapPin, GraduationCap, Calendar, Banknote,
  ThumbsUp,
} from "lucide-react";

interface Opportunity {
  id: string;
  company: string;
  role: string;
  type: string;
  branch_eligible: string;
  cgpa_required: number | null;
  deadline: string | null;
  location: string;
  stipend: string;
  apply_link: string | null;
  days_left: number | null;
  urgency: string;
  is_applied: boolean;
  is_public: boolean;
  upvotes: number;
  created_at: string;
  required_skills?: string | null;
  users?: { name: string; college: string; branch: string };
}

interface Props {
  opportunity: Opportunity;
  onDelete?: (id: string) => void;
  onApply?: (id: string) => void;
  onShare?: (id: string) => void;
  onUpvote?: (id: string) => void;
  showActions?: boolean;
  showCommunityInfo?: boolean;
  hasUpvoted?: boolean;
}

const typeConfig: Record<string, { bg: string; text: string; border: string }> = {
  Internship: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/25" },
  Job:        { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/25" },
  Hackathon:  { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/25" },
  Scholarship:{ bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25" },
};

const avatarColors = [
  "from-indigo-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-violet-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}

/* ── Circular countdown ring ────────────────────────────────── */
function DeadlineRing({ daysLeft, urgency }: { daysLeft: number | null; urgency: string }) {
  if (daysLeft === null || daysLeft >= 99) return null;
  const max = 30;
  const capped = Math.min(daysLeft, max);
  const pct = (capped / max) * 100;
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const strokeColor = urgency === "red" ? "#ef4444" : urgency === "yellow" ? "#f59e0b" : "#10b981";

  return (
    <div className="relative w-14 h-14 flex-shrink-0" title={`${daysLeft} days left`}>
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 40 40">
        <circle className="ring-track" cx="20" cy="20" r={r} fill="none" strokeWidth="3" stroke="rgba(255,255,255,0.06)" />
        <circle
          cx="20" cy="20" r={r} fill="none" strokeWidth="3"
          stroke={strokeColor}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-slate-300 tabular-nums leading-none text-center">
          {daysLeft}<br /><span className="text-[8px] text-slate-500">days</span>
        </span>
      </div>
    </div>
  );
}

export default function OpportunityCard({
  opportunity,
  onDelete, onApply, onShare, onUpvote,
  showActions = true, showCommunityInfo = false, hasUpvoted = false,
}: Props) {
  const tc = typeConfig[opportunity.type] || typeConfig["Internship"];
  const avatarGrad = getAvatarColor(opportunity.company);
  const companyInitial = opportunity.company.charAt(0).toUpperCase();

  return (
    <div className={`relative group bg-[#0a0b15] border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
      opportunity.is_applied
        ? "border-emerald-500/30 bg-emerald-500/3 hover:shadow-emerald-500/5"
        : "border-[#12142a] hover:border-indigo-500/30 hover:shadow-indigo-500/8"
    }`}>

      {/* Applied badge */}
      {opportunity.is_applied && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-2.5 h-2.5" /> Applied
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Company avatar */}
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white text-base font-bold flex-shrink-0 shadow-lg`}>
          {companyInitial}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
            {opportunity.company}
          </h3>
          <p className="text-sm text-slate-400 truncate">{opportunity.role}</p>
        </div>
        {/* Deadline ring */}
        <DeadlineRing daysLeft={opportunity.days_left} urgency={opportunity.urgency} />
      </div>

      {/* Type + urgency badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`badge ${tc.bg} ${tc.text} ${tc.border}`}>
          {opportunity.type}
        </span>
        <UrgencyBadge daysLeft={opportunity.days_left} urgency={opportunity.urgency} />
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-[13px]">
        <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className="truncate">{opportunity.branch_eligible}</span>
        </div>
        {opportunity.cgpa_required && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-indigo-400 font-mono text-[11px] flex-shrink-0">CGPA</span>
            <span>≥ {opportunity.cgpa_required}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
          <Banknote className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{opportunity.stipend}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="truncate">{opportunity.location}</span>
        </div>
        {opportunity.deadline && (
          <div className="flex items-center gap-1.5 text-slate-400 col-span-2">
            <Calendar className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span>Deadline: {opportunity.deadline}</span>
          </div>
        )}
      </div>

      {/* Community info */}
      {showCommunityInfo && opportunity.users && (
        <div className="mb-4 px-3 py-2 bg-white/4 rounded-lg border border-white/5 text-xs text-slate-400">
          Shared by <span className="text-indigo-400 font-medium">{opportunity.users.name || "Anonymous"}</span>
          {" "}from <span className="text-slate-300">{opportunity.users.college || "Unknown"}</span>
        </div>
      )}

      {/* Skills */}
      {opportunity.required_skills && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {opportunity.required_skills.split(",").map((skill: string, i: number) => (
            <span key={i} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium rounded-full">
              {skill.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3.5 border-t border-white/5 flex-wrap">
        {opportunity.apply_link && (
          <a
            href={opportunity.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all hover:-translate-y-0.5 shadow-sm shadow-indigo-500/20"
          >
            Apply Now <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {showActions && (
          <>
            {onApply && !opportunity.is_applied && (
              <button
                onClick={() => onApply(opportunity.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/20 transition-all"
              >
                <CheckCircle className="w-3 h-3" /> Mark Applied
              </button>
            )}

            {onShare && (
              <button
                onClick={() => onShare(opportunity.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  opportunity.is_public
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                    : "bg-white/4 text-slate-400 border-white/8 hover:bg-white/8"
                }`}
              >
                <Share2 className="w-3 h-3" />
                {opportunity.is_public ? "Shared" : "Share"}
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(opportunity.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/8 hover:bg-red-500/15 text-red-400 text-xs font-semibold rounded-lg border border-red-500/10 transition-all ml-auto"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </>
        )}

        {onUpvote && (
          <button
            onClick={() => onUpvote(opportunity.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              hasUpvoted
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                : "bg-white/4 text-slate-400 border-white/8 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/20"
            }`}
          >
            <ThumbsUp className={`w-3 h-3 ${hasUpvoted ? "fill-current" : ""}`} />
            {opportunity.upvotes || 0}
          </button>
        )}
      </div>
    </div>
  );
}

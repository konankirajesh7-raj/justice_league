"use client";

import React from "react";
import UrgencyBadge from "./UrgencyBadge";
import {
  ExternalLink,
  CheckCircle,
  Share2,
  Trash2,
  MapPin,
  GraduationCap,
  Calendar,
  Banknote,
  ThumbsUp,
  Building2,
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
  users?: {
    name: string;
    college: string;
    branch: string;
  };
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onDelete?: (id: string) => void;
  onApply?: (id: string) => void;
  onShare?: (id: string) => void;
  onUpvote?: (id: string) => void;
  showActions?: boolean;
  showCommunityInfo?: boolean;
  hasUpvoted?: boolean;
}

const typeColors: Record<string, string> = {
  Internship: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Job: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Hackathon: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Scholarship: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function OpportunityCard({
  opportunity,
  onDelete,
  onApply,
  onShare,
  onUpvote,
  showActions = true,
  showCommunityInfo = false,
  hasUpvoted = false,
}: OpportunityCardProps) {
  return (
    <div
      className={`relative group bg-[#0A0B15] border rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/5 ${
        opportunity.is_applied
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-[#12142A] hover:border-indigo-500/30"
      }`}
    >
      {/* Applied overlay */}
      {opportunity.is_applied && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" />
            Applied
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
              {opportunity.company}
            </h3>
            <p className="text-sm text-slate-400">{opportunity.role}</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${
            typeColors[opportunity.type] || typeColors["Internship"]
          }`}
        >
          {opportunity.type}
        </span>
        <UrgencyBadge
          daysLeft={opportunity.days_left}
          urgency={opportunity.urgency}
        />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <GraduationCap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="truncate">{opportunity.branch_eligible}</span>
        </div>
        {opportunity.cgpa_required && (
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-indigo-400 font-mono text-xs flex-shrink-0">
              CGPA
            </span>
            <span>≥ {opportunity.cgpa_required}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-slate-400">
          <Banknote className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="truncate">{opportunity.stipend}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="truncate">{opportunity.location}</span>
        </div>
        {opportunity.deadline && (
          <div className="flex items-center gap-2 text-slate-400 col-span-2">
            <Calendar className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>Deadline: {opportunity.deadline}</span>
          </div>
        )}
      </div>

      {/* Community info */}
      {showCommunityInfo && opportunity.users && (
        <div className="mb-4 px-3 py-2 bg-white/5 rounded-lg border border-white/5">
          <p className="text-xs text-slate-400">
            Shared by{" "}
            <span className="text-indigo-400 font-medium">
              {opportunity.users.name || "Anonymous"}
            </span>{" "}
            from{" "}
            <span className="text-slate-300">
              {opportunity.users.college || "Unknown College"}
            </span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#12142A] flex-wrap">
        {opportunity.apply_link && (
          <a
            href={opportunity.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            Apply Now
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {showActions && (
          <>
            {onApply && !opportunity.is_applied && (
              <button
                onClick={() => onApply(opportunity.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/20 transition-all duration-200"
              >
                <CheckCircle className="w-3 h-3" />
                Mark Applied
              </button>
            )}

            {onShare && (
              <button
                onClick={() => onShare(opportunity.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                  opportunity.is_public
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/20"
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                }`}
              >
                <Share2 className="w-3 h-3" />
                {opportunity.is_public ? "Shared" : "Share"}
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(opportunity.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg border border-red-500/10 transition-all duration-200 ml-auto"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </>
        )}

        {onUpvote && (
          <button
            onClick={() => onUpvote(opportunity.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
              hasUpvoted
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/20"
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

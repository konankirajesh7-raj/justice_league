"use client";

import React from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface UserProfile {
  branch: string;
  cgpa: number | null;
  age: number | null;
}

interface OpportunityData {
  branch_eligible: string;
  cgpa_required: number | null;
  required_skills: string | null;
}

interface EligibilityCardProps {
  profile: UserProfile;
  opportunity: OpportunityData;
}

export default function EligibilityCard({ profile, opportunity }: EligibilityCardProps) {
  const checks: { label: string; status: "pass" | "fail" | "warn"; detail: string }[] = [];

  // Branch check
  const eligibleBranches = opportunity.branch_eligible?.toLowerCase() || "all";
  const userBranch = profile.branch?.toLowerCase() || "";
  if (eligibleBranches === "all" || !eligibleBranches) {
    checks.push({ label: "Branch", status: "pass", detail: `All branches eligible` });
  } else if (userBranch && eligibleBranches.includes(userBranch)) {
    checks.push({ label: "Branch", status: "pass", detail: `Your branch (${profile.branch}) is eligible` });
  } else if (!userBranch) {
    checks.push({ label: "Branch", status: "warn", detail: `Update your branch in Profile to check eligibility` });
  } else {
    checks.push({ label: "Branch", status: "fail", detail: `Requires ${opportunity.branch_eligible}, you are ${profile.branch}` });
  }

  // CGPA check
  if (!opportunity.cgpa_required) {
    checks.push({ label: "CGPA", status: "pass", detail: "No CGPA requirement" });
  } else if (profile.cgpa === null || profile.cgpa === undefined) {
    checks.push({ label: "CGPA", status: "warn", detail: "Update your CGPA in Profile to check" });
  } else if (profile.cgpa >= opportunity.cgpa_required) {
    checks.push({ label: "CGPA", status: "pass", detail: `Your CGPA (${profile.cgpa}) ≥ ${opportunity.cgpa_required} required` });
  } else {
    checks.push({ label: "CGPA", status: "fail", detail: `Your CGPA (${profile.cgpa}) < ${opportunity.cgpa_required} required` });
  }

  // Skills info (no pass/fail, just info)
  if (opportunity.required_skills) {
    checks.push({ label: "Skills Required", status: "warn", detail: opportunity.required_skills });
  }

  const passCount = checks.filter((c) => c.status === "pass").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const overall = failCount > 0 ? "not-eligible" : passCount === checks.filter(c => c.status !== "warn" || c.label === "Skills Required").length ? "eligible" : "partial";

  return (
    <div className={`border rounded-xl p-5 ${
      overall === "eligible" 
        ? "bg-emerald-500/5 border-emerald-500/20"
        : overall === "not-eligible"
        ? "bg-red-500/5 border-red-500/20"
        : "bg-amber-500/5 border-amber-500/20"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          {overall === "eligible" ? (
            <><CheckCircle className="w-5 h-5 text-emerald-400" /> You&apos;re Eligible! ✅</>
          ) : overall === "not-eligible" ? (
            <><XCircle className="w-5 h-5 text-red-400" /> Not Eligible ❌</>
          ) : (
            <><AlertTriangle className="w-5 h-5 text-amber-400" /> Eligibility Check</>
          )}
        </h3>
      </div>

      <div className="space-y-2">
        {checks.map((check, i) => (
          <div key={i} className="flex items-start gap-2">
            {check.status === "pass" ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : check.status === "fail" ? (
              <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <span className="text-xs font-semibold text-slate-300">{check.label}: </span>
              <span className="text-xs text-slate-400">{check.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

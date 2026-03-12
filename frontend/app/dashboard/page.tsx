"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import OpportunityCard from "@/components/OpportunityCard";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import ShareModal from "@/components/ShareModal";
import {
  Plus,
  Search,
  Bookmark,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Bell,
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
}

export default function DashboardPage() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Deadline");
  const [searchQuery, setSearchQuery] = useState("");
  const [shareOppId, setShareOppId] = useState<string | null>(null);
  const [shareOppTitle, setShareOppTitle] = useState("");

  const fetchOpportunities = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("user_id", userId)
        .order("deadline", { ascending: true });
      if (error) throw error;
      setOpportunities((data as Opportunity[]) || []);
    } catch (err) {
      console.error("Failed to fetch opportunities:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser as unknown as Record<string, unknown>);
        fetchOpportunities(authUser.id);
      }
    };
    getUser();
  }, [fetchOpportunities]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("opportunities-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "opportunities",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchOpportunities(user.id as string);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchOpportunities]);

  const handleDelete = async (id: string) => {
    await supabase.from("opportunities").delete().eq("id", id);
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
  };

  const handleApply = async (id: string) => {
    await supabase.from("opportunities").update({ is_applied: true }).eq("id", id);
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, is_applied: true } : o))
    );
  };

  const handleShare = async (id: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;
    setShareOppId(id);
    setShareOppTitle(`${opp.company} - ${opp.role}`);
  };

  // Filter and sort
  const filtered = opportunities
    .filter((o) => filter === "All" || o.type === filter)
    .filter(
      (o) =>
        !searchQuery ||
        o.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "Deadline") {
        const aDate = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const bDate = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return aDate - bDate;
      }
      if (sortBy === "Recent")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (sortBy === "Company") return a.company.localeCompare(b.company);
      return 0;
    });

  const stats = {
    total: opportunities.length,
    urgent: opportunities.filter(
      (o) => o.days_left !== null && o.days_left <= 3 && o.days_left > 0
    ).length,
    applied: opportunities.filter((o) => o.is_applied).length,
    expiring: opportunities.filter(
      (o) => o.days_left !== null && o.days_left <= 7 && o.days_left > 0
    ).length,
  };

  const userName =
    user && (user.user_metadata as Record<string, unknown>)
      ? ((user.user_metadata as Record<string, unknown>).name as string) ||
        ((user.email as string)?.split("@")[0])
      : "there";

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#07080F] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
              Hey {userName}! 👋
            </h1>
            <p className="text-slate-400">
              Track all your opportunities in one place. Never miss a deadline.
            </p>
          </div>

          {/* Deadline Alerts */}
          {opportunities.filter((o) => o.days_left !== null && (o.days_left as number) > 0 && (o.days_left as number) <= 3).length > 0 && (
            <div className="mb-6 bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-sm font-bold text-red-400">⏰ Upcoming Deadlines!</span>
              </div>
              <div className="space-y-1">
                {opportunities
                  .filter((o) => o.days_left !== null && (o.days_left as number) > 0 && (o.days_left as number) <= 3)
                  .map((o) => (
                    <p key={o.id} className="text-xs text-red-400/80">
                      <span className="font-semibold text-red-300">{o.company}</span> — {o.role} · {o.days_left} day(s) left ({o.deadline})
                    </p>
                  ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Saved",
                value: stats.total,
                icon: <Bookmark className="w-5 h-5" />,
                color: "from-indigo-500/10 to-purple-500/10",
                border: "border-indigo-500/20",
                iconColor: "text-indigo-400",
              },
              {
                label: "Urgent 🔴",
                value: stats.urgent,
                icon: <AlertTriangle className="w-5 h-5" />,
                color: "from-red-500/10 to-orange-500/10",
                border: "border-red-500/20",
                iconColor: "text-red-400",
              },
              {
                label: "Applied ✅",
                value: stats.applied,
                icon: <CheckCircle2 className="w-5 h-5" />,
                color: "from-emerald-500/10 to-green-500/10",
                border: "border-emerald-500/20",
                iconColor: "text-emerald-400",
              },
              {
                label: "Expiring Soon 🟡",
                value: stats.expiring,
                icon: <Clock className="w-5 h-5" />,
                color: "from-yellow-500/10 to-amber-500/10",
                border: "border-yellow-500/20",
                iconColor: "text-yellow-400",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-xl p-5 card-hover`}
              >
                <div className={`${stat.iconColor} mb-3`}>{stat.icon}</div>
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-sm text-slate-400 font-medium mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-500" />
              {["All", "Internship", "Job", "Hackathon", "Scholarship"].map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filter === f
                        ? "bg-indigo-600 text-white"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 border border-[#12142A]"
                    }`}
                  >
                    {f}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-[#12142A] rounded-lg text-sm text-slate-300 outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="Deadline" className="bg-[#0A0B15]">
                  Sort: Deadline
                </option>
                <option value="Recent" className="bg-[#0A0B15]">
                  Sort: Recent
                </option>
                <option value="Company" className="bg-[#0A0B15]">
                  Sort: Company
                </option>
              </select>

              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48 pl-9 pr-4 py-2 bg-white/5 border border-[#12142A] rounded-lg text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <LoadingSpinner message="Loading your opportunities..." />
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onDelete={handleDelete}
                  onApply={handleApply}
                  onShare={handleShare}
                  showActions={true}
                />
              ))}
            </div>
          )}

          {/* Floating Add Button */}
          <Link
            href="/extract"
            className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 z-40 pulse-glow"
          >
            <Plus className="w-6 h-6" />
          </Link>

          {/* Share Modal */}
          {shareOppId && (
            <ShareModal
              opportunityId={shareOppId}
              opportunityTitle={shareOppTitle}
              isOpen={!!shareOppId}
              onClose={() => setShareOppId(null)}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

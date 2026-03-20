"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import OpportunityCard from "@/components/OpportunityCard";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import ShareModal from "@/components/ShareModal";
import {
  Plus, Search, Bookmark, AlertTriangle, CheckCircle2,
  Clock, Filter, Bell, SlidersHorizontal, X, TrendingUp,
} from "lucide-react";

interface Opportunity {
  id: string; company: string; role: string; type: string;
  branch_eligible: string; cgpa_required: number | null;
  deadline: string | null; location: string; stipend: string;
  apply_link: string | null; days_left: number | null;
  urgency: string; is_applied: boolean; is_public: boolean;
  upvotes: number; created_at: string; required_skills?: string | null;
}

/* Animated stat card */
function StatCard({ label, value, icon, color, border, iconColor, sub }: {
  label: string; value: number; icon: React.ReactNode;
  color: string; border: string; iconColor: string; sub?: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-5 card-hover`}>
      <div className={`${iconColor} mb-3`}>{icon}</div>
      <p className="text-3xl font-black text-white tabular-nums">{value}</p>
      <p className="text-sm text-slate-400 font-medium mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Deadline");
  const [searchQuery, setSearchQuery] = useState("");
  const [shareOppId, setShareOppId] = useState<string | null>(null);
  const [shareOppTitle, setShareOppTitle] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchOpportunities = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("opportunities").select("*").eq("user_id", userId)
        .order("deadline", { ascending: true });
      if (error) throw error;
      setOpportunities((data as Opportunity[]) || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) { setUser(u as unknown as Record<string, unknown>); fetchOpportunities(u.id); }
    });
  }, [fetchOpportunities]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("dash-opps")
      .on("postgres_changes", { event: "*", schema: "public", table: "opportunities", filter: `user_id=eq.${user.id}` },
        () => fetchOpportunities(user.id as string))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, fetchOpportunities]);

  const handleDelete = async (id: string) => {
    await supabase.from("opportunities").delete().eq("id", id);
    setOpportunities(p => p.filter(o => o.id !== id));
  };
  const handleApply = async (id: string) => {
    await supabase.from("opportunities").update({ is_applied: true }).eq("id", id);
    setOpportunities(p => p.map(o => o.id === id ? { ...o, is_applied: true } : o));
  };
  const handleShare = (id: string) => {
    const opp = opportunities.find(o => o.id === id);
    if (!opp) return;
    setShareOppId(id); setShareOppTitle(`${opp.company} - ${opp.role}`);
  };

  const stats = {
    total: opportunities.length,
    urgent: opportunities.filter(o => o.days_left !== null && o.days_left > 0 && o.days_left <= 3).length,
    applied: opportunities.filter(o => o.is_applied).length,
    expiring: opportunities.filter(o => o.days_left !== null && o.days_left > 0 && o.days_left <= 7).length,
  };

  const tabFilters: Record<string, (o: Opportunity) => boolean> = {
    All: () => true,
    Urgent: o => o.days_left !== null && o.days_left > 0 && o.days_left <= 3,
    Expiring: o => o.days_left !== null && o.days_left > 0 && o.days_left <= 7,
    Applied: o => o.is_applied,
  };

  const filtered = opportunities
    .filter(tabFilters[activeTab] || (() => true))
    .filter(o => typeFilter === "All" || o.type === typeFilter)
    .filter(o => !searchQuery ||
      o.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.role.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "Deadline") {
        return (a.deadline ? new Date(a.deadline).getTime() : Infinity) -
               (b.deadline ? new Date(b.deadline).getTime() : Infinity);
      }
      if (sortBy === "Recent") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "Company") return a.company.localeCompare(b.company);
      return 0;
    });

  const userName = user
    ? (((user.user_metadata as Record<string, unknown>)?.name as string) || (user.email as string)?.split("@")[0])
    : "there";

  const urgentOpps = opportunities.filter(o => o.days_left !== null && o.days_left > 0 && o.days_left <= 3);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#07080f] pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Welcome */}
          <div className="mb-8 slide-up">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">
              Hey <span className="gradient-text">{userName}</span>! 👋
            </h1>
            <p className="text-slate-400">Track all your opportunities. Never miss a deadline.</p>
          </div>

          {/* Deadline Alert Banner */}
          {urgentOpps.length > 0 && (
            <div className="mb-6 bg-red-500/5 border border-red-500/20 rounded-2xl p-4 glow-danger slide-up">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-sm font-bold text-red-400">⏰ {urgentOpps.length} deadline{urgentOpps.length > 1 ? "s" : ""} expiring soon!</span>
              </div>
              <div className="space-y-1">
                {urgentOpps.map(o => (
                  <p key={o.id} className="text-xs text-red-400/80">
                    <span className="font-semibold text-red-300">{o.company}</span> — {o.role}
                    <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 rounded text-[10px] font-mono">{o.days_left}d left</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Saved" value={stats.total} icon={<Bookmark className="w-5 h-5" />}
              color="from-indigo-500/10 to-purple-500/10" border="border-indigo-500/20" iconColor="text-indigo-400" />
            <StatCard label="Urgent 🔴" value={stats.urgent} icon={<AlertTriangle className="w-5 h-5" />}
              color="from-red-500/10 to-orange-500/10" border="border-red-500/20" iconColor="text-red-400" sub="≤ 3 days" />
            <StatCard label="Applied ✅" value={stats.applied} icon={<CheckCircle2 className="w-5 h-5" />}
              color="from-emerald-500/10 to-green-500/10" border="border-emerald-500/20" iconColor="text-emerald-400" />
            <StatCard label="Expiring 🟡" value={stats.expiring} icon={<Clock className="w-5 h-5" />}
              color="from-yellow-500/10 to-amber-500/10" border="border-yellow-500/20" iconColor="text-yellow-400" sub="≤ 7 days" />
          </div>

          {/* Tabs + Search/Filter bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/3 border border-white/6 rounded-xl p-1">
              {["All", "Urgent", "Expiring", "Applied"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-44 pl-8 pr-3 py-2 bg-white/5 border border-white/8 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Filter button */}
              <button onClick={() => setFilterOpen(!filterOpen)}
                className={`p-2 rounded-xl border transition-all ${filterOpen ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" : "bg-white/5 border-white/8 text-slate-400 hover:bg-white/8"}`}>
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {filterOpen && (
            <div className="mb-6 p-4 bg-[#0a0b15] border border-white/8 rounded-2xl scale-in">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-500 font-medium">Type:</span>
                  <div className="flex gap-1.5">
                    {["All", "Internship", "Job", "Hackathon", "Scholarship"].map(f => (
                      <button key={f} onClick={() => setTypeFilter(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${typeFilter === f ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/8 border border-white/8"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-slate-500 font-medium">Sort:</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="px-3 py-1.5 bg-white/5 border border-white/8 rounded-lg text-xs text-slate-300 outline-none focus:border-indigo-500 cursor-pointer">
                    <option value="Deadline" className="bg-[#0a0b15]">By Deadline</option>
                    <option value="Recent" className="bg-[#0a0b15]">Most Recent</option>
                    <option value="Company" className="bg-[#0a0b15]">By Company</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <LoadingSpinner skeleton />
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <p className="text-xs text-slate-500 mb-4">{filtered.length} opportunit{filtered.length !== 1 ? "ies" : "y"}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp}
                    onDelete={handleDelete} onApply={handleApply} onShare={handleShare} showActions />
                ))}
              </div>
            </>
          )}
        </div>

        {/* FAB */}
        <Link href="/extract"
          className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300 z-40 pulse-glow">
          <Plus className="w-6 h-6" />
        </Link>

        {shareOppId && (
          <ShareModal opportunityId={shareOppId} opportunityTitle={shareOppTitle}
            isOpen={!!shareOppId} onClose={() => setShareOppId(null)} />
        )}
      </div>
    </AuthGuard>
  );
}

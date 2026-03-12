"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import LoadingSpinner from "@/components/LoadingSpinner";
import OpportunityCard from "@/components/OpportunityCard";
import { Users, ArrowLeft, Shield, Calendar } from "lucide-react";
import Link from "next/link";

interface CommunityPost {
  id: string;
  message: string | null;
  created_at: string;
  shared_by: string;
  opportunity_id: string;
  opportunities: {
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
    required_skills: string | null;
  };
  users: {
    name: string;
    college: string;
  };
}

interface CommunityInfo {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  created_at: string;
}

interface Member {
  user_id: string;
  role: string;
  users: { name: string; college: string; branch: string };
}

export default function CommunityDetailPage() {
  const params = useParams();
  const communityId = params.id as string;
  const [community, setCommunity] = useState<CommunityInfo | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    if (!communityId) return;
    const fetchAll = async () => {
      // Fetch community info
      const { data: comm } = await supabase
        .from("communities")
        .select("*")
        .eq("id", communityId)
        .single();
      if (comm) setCommunity(comm as CommunityInfo);

      // Fetch shared posts with opportunities and user info
      const { data: postsData } = await supabase
        .from("community_posts")
        .select("*, opportunities(*), users:shared_by(name, college)")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });
      if (postsData) setPosts(postsData as unknown as CommunityPost[]);

      // Fetch members
      const { data: membersData } = await supabase
        .from("community_members")
        .select("user_id, role, users:user_id(name, college, branch)")
        .eq("community_id", communityId);
      if (membersData) setMembers(membersData as unknown as Member[]);

      setLoading(false);
    };
    fetchAll();
  }, [communityId]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#07080F] flex items-center justify-center">
          <LoadingSpinner message="Loading community..." />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#07080F] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back */}
          <Link
            href="/communities"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Communities
          </Link>

          {/* Header */}
          <div className="bg-[#0A0B15] border border-[#12142A] rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-white">{community?.name}</h1>
                    {community?.description && (
                      <p className="text-sm text-slate-400">{community.description}</p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-[#12142A] rounded-lg text-sm text-slate-300 hover:bg-white/10 transition-all"
              >
                <Users className="w-4 h-4" />
                {members.length} Members
              </button>
            </div>

            {/* Member count & date */}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Created {new Date(community?.created_at || "").toLocaleDateString()}
              </span>
              <span>{posts.length} shared opportunities</span>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Posts Feed */}
            <div className="flex-1">
              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-slate-500">No opportunities shared yet. Share from your dashboard!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id}>
                      {/* Shared by header */}
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                          {post.users?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="text-xs text-slate-400">
                          <span className="text-slate-300 font-medium">{post.users?.name || "Someone"}</span>
                          {post.users?.college && ` · ${post.users.college}`}
                          {" · "}
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {post.message && (
                        <p className="text-sm text-slate-400 px-1 mb-2 italic">&quot;{post.message}&quot;</p>
                      )}
                      <OpportunityCard
                        opportunity={{
                          ...post.opportunities,
                          users: post.users as { name: string; college: string; branch: string },
                        }}
                        showActions={false}
                        showCommunityInfo={false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Members Sidebar */}
            {showMembers && (
              <div className="hidden md:block w-64">
                <div className="bg-[#0A0B15] border border-[#12142A] rounded-xl p-4 sticky top-24">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" /> Members
                  </h3>
                  <div className="space-y-2">
                    {members.map((m) => (
                      <div key={m.user_id} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-white text-[10px] font-bold">
                          {m.users?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 truncate">{m.users?.name || "Unknown"}</p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {m.users?.college || ""} {m.role === "admin" ? "· Admin" : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

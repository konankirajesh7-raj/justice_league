"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Users, Plus, LogIn, Shield, X, Lock, Globe, Trash2, Settings } from "lucide-react";

interface Community {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  created_by: string;
  created_at: string;
}

export default function CommunitiesPage() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  // Create form
  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Join form
  const [joinName, setJoinName] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    setUser(authUser as unknown as Record<string, unknown>);

    // Get communities the user is a member of
    const { data: memberships } = await supabase
      .from("community_members")
      .select("community_id, communities(*)")
      .eq("user_id", authUser.id);

    if (memberships) {
      const comms = memberships.map((m: Record<string, unknown>) => m.communities as Community);
      setMyCommunities(comms);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user || !createName.trim() || !createPassword.trim()) {
      setCreateError("Community name and password are required");
      return;
    }
    setCreating(true);
    setCreateError("");

    // Check if name already exists
    const { data: existing } = await supabase
      .from("communities")
      .select("id")
      .eq("name", createName.trim())
      .single();

    if (existing) {
      setCreateError("A community with this name already exists");
      setCreating(false);
      return;
    }

    const { data: community, error } = await supabase
      .from("communities")
      .insert({
        name: createName.trim(),
        password: createPassword.trim(),
        description: createDesc.trim() || null,
        created_by: user.id,
        member_count: 1,
      })
      .select()
      .single();

    if (error) {
      setCreateError(error.message);
      setCreating(false);
      return;
    }

    // Add creator as admin member
    await supabase.from("community_members").insert({
      community_id: community.id,
      user_id: user.id,
      role: "admin",
    });

    setShowCreate(false);
    setCreateName("");
    setCreatePassword("");
    setCreateDesc("");
    setCreating(false);
    fetchData();
  };

  const handleJoin = async () => {
    if (!user || !joinName.trim() || !joinPassword.trim()) {
      setJoinError("Community name and password are required");
      return;
    }
    setJoining(true);
    setJoinError("");

    // Find community by name and password
    const { data: community } = await supabase
      .from("communities")
      .select("*")
      .eq("name", joinName.trim())
      .eq("password", joinPassword.trim())
      .single();

    if (!community) {
      setJoinError("Invalid community name or password");
      setJoining(false);
      return;
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("community_members")
      .select("id")
      .eq("community_id", community.id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      setJoinError("You are already a member of this community");
      setJoining(false);
      return;
    }

    await supabase.from("community_members").insert({
      community_id: community.id,
      user_id: user.id,
      role: "member",
    });

    // Update member count
    await supabase
      .from("communities")
      .update({ member_count: (community.member_count || 1) + 1 })
      .eq("id", community.id);

    setShowJoin(false);
    setJoinName("");
    setJoinPassword("");
    setJoining(false);
    fetchData();
  };

  const handleLeave = async (communityId: string) => {
    if (!user) return;
    await supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", user.id as string);
    setMyCommunities((prev) => prev.filter((c) => c.id !== communityId));
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#07080F] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-400">Local Communities</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
              My Communities 👥
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto">
              Create private groups to share opportunities with classmates, friends, or college groups.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" /> Create Community
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-[#12142A] text-slate-300 text-sm font-semibold rounded-lg transition-all hover:-translate-y-0.5"
            >
              <LogIn className="w-4 h-4" /> Join Community
            </button>
          </div>

          {/* Communities Grid */}
          {loading ? (
            <LoadingSpinner message="Loading communities..." />
          ) : myCommunities.length === 0 ? (
            <div className="text-center py-16">
              <Globe className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-400 mb-2">No communities yet</h3>
              <p className="text-slate-500 text-sm">Create one or join an existing community to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myCommunities.map((community) => (
                <div
                  key={community.id}
                  className="bg-[#0A0B15] border border-[#12142A] rounded-xl p-5 card-hover group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-indigo-400" />
                    </div>
                    {community.created_by === (user?.id as string) && (
                      <span className="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full font-semibold">ADMIN</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{community.name}</h3>
                  {community.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{community.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                    <Users className="w-3.5 h-3.5" />
                    <span>{community.member_count || 1} member(s)</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/communities/${community.id}`}
                      className="flex-1 py-2 text-center bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-sm font-semibold rounded-lg transition-all"
                    >
                      Open Feed
                    </Link>
                    {community.created_by === (user?.id as string) ? (
                      <Link
                        href={`/communities/${community.id}`}
                        className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                        title="Manage community"
                      >
                        <Settings className="w-4 h-4" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleLeave(community.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Leave community"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Modal */}
          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
              <div className="bg-[#0A0B15] border border-[#12142A] rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-400" /> Create Community
                  </h3>
                  <button onClick={() => setShowCreate(false)} className="p-1 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {createError && (
                  <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 mb-4">{createError}</div>
                )}

                <div className="space-y-3">
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Community name"
                    className="w-full px-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 outline-none transition-all"
                  />
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="Join password (share with members)"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <textarea
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 outline-none transition-all resize-none"
                  />
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create Community"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Join Modal */}
          {showJoin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
              <div className="bg-[#0A0B15] border border-[#12142A] rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <LogIn className="w-5 h-5 text-indigo-400" /> Join Community
                  </h3>
                  <button onClick={() => setShowJoin(false)} className="p-1 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {joinError && (
                  <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 mb-4">{joinError}</div>
                )}

                <div className="space-y-3">
                  <input
                    type="text"
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    placeholder="Community name"
                    className="w-full px-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 outline-none transition-all"
                  />
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      placeholder="Community password"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    {joining ? "Joining..." : "Join Community"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

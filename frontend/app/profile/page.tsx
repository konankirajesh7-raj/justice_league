"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  User,
  Mail,
  GraduationCap,
  Building2,
  Phone,
  Save,
  LogOut,
  Trash2,
  Bookmark,
  CheckCircle,
  Share2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [authUser, setAuthUser] = useState<Record<string, unknown> | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [college, setCollege] = useState("");
  const [phone, setPhone] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    shared: 0,
    expired: 0,
  });

  const branches = [
    "CSE",
    "IT",
    "ECE",
    "EEE",
    "Mechanical",
    "Civil",
    "MBA",
    "BCA",
    "Other",
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setAuthUser(user as unknown as Record<string, unknown>);
      setEmail(user.email || "");

      // Fetch profile from users table
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setName(profile.name || "");
        setBranch(profile.branch || "");
        setCgpa(profile.cgpa?.toString() || "");
        setCollege(profile.college || "");
        setPhone(profile.phone || "");
      }

      // Fetch stats
      const { data: opportunities } = await supabase
        .from("opportunities")
        .select("is_applied, is_public, days_left")
        .eq("user_id", user.id);

      if (opportunities) {
        setStats({
          total: opportunities.length,
          applied: opportunities.filter((o: Record<string, unknown>) => o.is_applied).length,
          shared: opportunities.filter((o: Record<string, unknown>) => o.is_public).length,
          expired: opportunities.filter(
            (o: Record<string, unknown>) => o.days_left !== null && (o.days_left as number) <= 0
          ).length,
        });
      }

      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!authUser) return;
    setSaving(true);
    setError("");
    setSaved(false);

    const { error: updateError } = await supabase
      .from("users")
      .upsert({
        id: authUser.id,
        email: email,
        name: name,
        branch: branch,
        cgpa: cgpa ? parseFloat(cgpa) : null,
        college: college,
        phone: phone,
      });

    if (updateError) {
      setError("Failed to save profile. Please try again.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (!authUser) return;
    // Delete user data
    await supabase.from("opportunities").delete().eq("user_id", authUser.id);
    await supabase.from("reminders").delete().eq("user_id", authUser.id);
    await supabase.from("upvotes").delete().eq("user_id", authUser.id);
    await supabase.from("users").delete().eq("id", authUser.id);
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#07080F] flex items-center justify-center">
          <LoadingSpinner message="Loading your profile..." />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#07080F] py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-white text-3xl font-black">
              {name?.charAt(0)?.toUpperCase() ||
                email?.charAt(0)?.toUpperCase() ||
                "U"}
            </div>
            <h1 className="text-2xl font-black text-white">
              {name || "Your Profile"}
            </h1>
            <p className="text-slate-500">{email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Saved",
                value: stats.total,
                icon: <Bookmark className="w-4 h-4 text-indigo-400" />,
              },
              {
                label: "Applied",
                value: stats.applied,
                icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
              },
              {
                label: "Shared",
                value: stats.shared,
                icon: <Share2 className="w-4 h-4 text-amber-400" />,
              },
              {
                label: "Expired",
                value: stats.expired,
                icon: <XCircle className="w-4 h-4 text-red-400" />,
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-[#0A0B15] border border-[#12142A] rounded-xl p-4 text-center card-hover"
              >
                <div className="flex justify-center mb-2">{s.icon}</div>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Edit Form */}
          <div className="bg-[#0A0B15] border border-[#12142A] rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              Edit Profile
            </h2>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 mb-4">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {saved && (
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 mb-4">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Profile saved successfully!
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                  <User className="w-4 h-4" /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                    <GraduationCap className="w-4 h-4" /> Branch
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  >
                    <option value="" className="bg-[#0A0B15]">
                      Select branch
                    </option>
                    {branches.map((b) => (
                      <option key={b} value={b} className="bg-[#0A0B15]">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">
                    CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="e.g., 8.5"
                    className="w-full px-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                  <Building2 className="w-4 h-4" /> College
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="Your college name"
                  className="w-full px-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                  <Phone className="w-4 h-4" /> Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-3 bg-white/5 border border-[#12142A] rounded-lg text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#0A0B15] border border-red-500/20 rounded-xl p-6">
            <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSignOut}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-[#12142A] text-slate-300 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>

          {/* Delete modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
              <div className="bg-[#0A0B15] border border-red-500/30 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Delete Account?
                  </h3>
                </div>
                <p className="text-slate-400 text-sm mb-6">
                  This will permanently delete your account and all your saved
                  opportunities. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-[#12142A] text-slate-300 font-semibold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-all"
                  >
                    Delete Forever
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

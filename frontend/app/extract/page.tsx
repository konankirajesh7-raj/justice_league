"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { extractOpportunity } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import UrgencyBadge from "@/components/UrgencyBadge";
import EligibilityCard from "@/components/EligibilityCard";
import {
  Zap, Save, RotateCcw, Building2, Briefcase, GraduationCap,
  MapPin, Banknote, Calendar, ExternalLink, ClipboardPaste,
  Sparkles, CheckCircle, AlertTriangle, Copy, ShieldAlert, Wrench,
} from "lucide-react";

const SAMPLES = [
  { label: "TCS Internship", emoji: "🏢", text: `🎉 Opportunity Alert! TCS NextStep Internship 2025\nCompany: Tata Consultancy Services\nRole: Software Developer Intern\nEligible: CSE, IT, ECE - 2025 & 2026 batch\nCGPA: 7.5 and above\nLocation: Hyderabad, Bangalore, Chennai\nStipend: Rs 15,000/month\nLast Date: March 28, 2025\nApply: https://nextstep.tcs.com\nForward to all students!` },
  { label: "Infosys", emoji: "💼", text: `Fwd: Fwd: URGENT Infosys Campus Connect!!\ninfosys internship open for CSE ECE students\n2025 passout 6 cgpa minimum\nstipend 12000 per month pune location\nlast date 15 march 2025\nlink: careers.infosys.com/internship\napply fast seats limited` },
  { label: "Hackathon", emoji: "🏆", text: `SMART INDIA HACKATHON 2025 IS OPEN!\nRegistration Deadline: April 5, 2025\nTeam Size: 2-6 members\nAll branches eligible, No CGPA bar\nPrize Pool: Rs 1 Crore+\nThemes: Agriculture, Healthcare, Education\nRegister NOW: sih.gov.in\nShare with everyone!` },
];

interface ExtractedData {
  company?: string; role?: string; type?: string;
  branch_eligible?: string; cgpa_required?: number | null;
  deadline?: string | null; location?: string; stipend?: string;
  apply_link?: string | null; raw_text?: string;
  days_left: number | null; urgency: string;
  required_skills?: string | null;
  isDuplicate?: boolean; isSpam?: boolean; spamReasons?: string[];
}

/* AI thinking beam animation */
function AIBeam() {
  return (
    <div className="bg-[#0A0B15] border border-indigo-500/20 rounded-2xl p-8 mb-6 text-center">
      <div className="relative w-full h-1 bg-white/5 rounded-full overflow-hidden mb-6">
        <div className="absolute inset-0 ai-beam rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-indigo-500/30 flex items-center justify-center">
            <Zap className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" style={{ animationDuration: "1.5s" }} />
        </div>
        <div>
          <p className="text-white font-bold text-lg">AI is reading your message…</p>
          <p className="text-slate-400 text-sm mt-1">Extracting company, role, deadline, stipend & more</p>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailTile({ icon, label, value, iconColor = "text-indigo-400" }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; iconColor?: string;
}) {
  return (
    <div className="bg-white/4 border border-white/6 hover:border-white/10 rounded-xl p-4 transition-all">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={iconColor}>{icon}</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-white font-semibold text-[15px]">{value}</div>
    </div>
  );
}

function ExtractPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [userProfile, setUserProfile] = useState<{ branch: string; cgpa: number | null; age: number | null } | null>(null);
  const [inputText, setInputText] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        setUser(u as unknown as Record<string, unknown>);
        supabase.from("users").select("branch, cgpa, age").eq("id", u.id).single()
          .then(({ data }) => { if (data) setUserProfile(data as { branch: string; cgpa: number | null; age: number | null }); });
      }
    });
  }, []);

  useEffect(() => {
    const t = searchParams.get("text");
    if (t) setInputText(decodeURIComponent(t));
  }, [searchParams]);

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setLoading(true); setError(""); setExtractedData(null); setSaved(false);
    try {
      const result = await extractOpportunity(inputText, user?.id as string);
      setExtractedData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!extractedData || !user) return;
    setSaving(true);
    try {
      const { error: e } = await supabase.from("opportunities").insert({
        user_id: user.id,
        company: extractedData.company || "Unknown",
        role: extractedData.role || "Unknown",
        type: extractedData.type || "Internship",
        branch_eligible: extractedData.branch_eligible || "All",
        cgpa_required: extractedData.cgpa_required ?? null,
        deadline: extractedData.deadline || null,
        location: extractedData.location || "Remote",
        stipend: extractedData.stipend || "Not mentioned",
        apply_link: extractedData.apply_link ?? null,
        raw_text: extractedData.raw_text || inputText,
        days_left: extractedData.days_left ?? 99,
        urgency: extractedData.urgency || "green",
        required_skills: extractedData.required_skills ?? null,
      });
      if (e) throw e;
      setSaved(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("Failed to save. Please try again.");
    } finally { setSaving(false); }
  };

  const handleReset = () => { setInputText(""); setExtractedData(null); setError(""); setSaved(false); };

  const handlePaste = async () => {
    try { const t = await navigator.clipboard.readText(); setInputText(t); } catch { /* permission denied */ }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#07080F] pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10 slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-400">AI-Powered Extraction</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
              Extract <span className="gradient-text">Opportunity</span>
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
              Paste any WhatsApp forward. Our AI extracts company, role, deadline, stipend — in seconds.
            </p>
          </div>

          {/* Input box */}
          <div className="bg-[#0A0B15] border border-[#12142a] hover:border-indigo-500/20 rounded-2xl p-6 mb-6 transition-colors slide-up delay-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Paste Message</h2>
              </div>
              <div className="flex items-center gap-2">
                {inputText && <span className="text-xs text-slate-500 font-mono">{inputText.length} chars</span>}
                <button onClick={handlePaste}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-indigo-400 bg-white/4 hover:bg-indigo-500/10 border border-white/8 hover:border-indigo-500/20 rounded-lg transition-all">
                  <Copy className="w-3 h-3" /> Paste from clipboard
                </button>
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.ctrlKey && e.key === "Enter") handleExtract(); }}
              placeholder={"Paste your WhatsApp opportunity message here…\n\nExamples: internship openings, job postings, hackathon announcements, scholarships — any format works!"}
              className="w-full h-48 p-4 bg-white/4 border border-[#12142a] rounded-xl text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all resize-none font-mono text-sm leading-relaxed"
            />

            {/* Sample buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs text-slate-500 self-center">Try a sample:</span>
              {SAMPLES.map((s, i) => (
                <button key={i} onClick={() => setInputText(s.text)}
                  className="px-3 py-1.5 bg-white/4 hover:bg-indigo-500/10 border border-[#12142a] hover:border-indigo-500/30 rounded-lg text-xs font-medium text-slate-400 hover:text-indigo-400 transition-all">
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>

            <button onClick={handleExtract} disabled={loading || !inputText.trim()}
              className="w-full mt-5 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-base hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Zap className="w-5 h-5" /> Extract with AI <span className="text-indigo-300 text-xs font-mono ml-1">(Ctrl+↵)</span></>
              )}
            </button>
          </div>

          {/* AI beam loading state */}
          {loading && <AIBeam />}

          {/* Error */}
          {error && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 scale-in">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-red-400 font-semibold text-sm">{error}</p>
                <p className="text-red-400/60 text-xs mt-1">Make sure the API is configured correctly.</p>
              </div>
            </div>
          )}

          {/* Results */}
          {extractedData && !loading && (
            <div className="bg-[#0A0B15] border border-indigo-500/30 rounded-2xl p-6 mb-6 glow scale-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">Extracted Details</h2>
                </div>
                <UrgencyBadge daysLeft={extractedData.days_left} urgency={extractedData.urgency} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <DetailTile icon={<Building2 className="w-4 h-4" />} label="Company" value={extractedData.company || "—"} />
                <DetailTile icon={<Briefcase className="w-4 h-4" />} label="Role" value={extractedData.role || "—"} iconColor="text-purple-400" />
                <DetailTile icon={<span className="text-xs font-bold">TYPE</span>} label="Type"
                  value={<span className="inline-flex px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">{extractedData.type}</span>} />
                <DetailTile icon={<GraduationCap className="w-4 h-4" />} label="Eligible Branches" value={extractedData.branch_eligible || "—"} iconColor="text-emerald-400" />
                <DetailTile icon={<span className="text-xs font-bold font-mono">CGPA</span>} label="CGPA Required"
                  value={extractedData.cgpa_required ? `≥ ${extractedData.cgpa_required}` : "No minimum"} />
                <DetailTile icon={<Calendar className="w-4 h-4" />} label="Deadline" value={extractedData.deadline || "Not specified"} iconColor="text-red-400" />
                <DetailTile icon={<MapPin className="w-4 h-4" />} label="Location" value={extractedData.location || "—"} iconColor="text-amber-400" />
                <DetailTile icon={<Banknote className="w-4 h-4" />} label="Stipend" value={extractedData.stipend || "—"} iconColor="text-emerald-400" />
              </div>

              {extractedData.apply_link && (
                <div className="mb-4 bg-white/4 border border-white/6 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ExternalLink className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Apply Link</span>
                  </div>
                  <a href={String(extractedData.apply_link)} target="_blank" rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 break-all text-sm">
                    {String(extractedData.apply_link)}
                  </a>
                </div>
              )}

              {extractedData.required_skills && (
                <div className="mb-4 bg-white/4 border border-white/6 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Required Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {String(extractedData.required_skills).split(",").map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {extractedData.isDuplicate && (
                <div className="mb-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                  <Copy className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-amber-400 font-semibold text-sm">⚠️ Duplicate Detected</p>
                    <p className="text-amber-400/70 text-xs mt-1">You already have this saved. Saving again will create a duplicate.</p>
                  </div>
                </div>
              )}

              {extractedData.isSpam && (
                <div className="mb-4 bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-400 font-semibold text-sm">🚨 Possible Spam Detected</p>
                      <ul className="mt-2 space-y-1">
                        {extractedData.spamReasons?.map((r, i) => (
                          <li key={i} className="text-red-400/70 text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {r}
                          </li>
                        ))}
                      </ul>
                      <p className="text-red-400/50 text-xs mt-2">You can still save it if you believe it&apos;s genuine.</p>
                    </div>
                  </div>
                </div>
              )}

              {userProfile && (
                <div className="mb-5">
                  <EligibilityCard profile={userProfile} opportunity={{
                    branch_eligible: extractedData.branch_eligible as string,
                    cgpa_required: extractedData.cgpa_required as number | null,
                    required_skills: extractedData.required_skills as string | null,
                  }} />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {saved ? (
                  <div className="flex-1 py-4 bg-emerald-600/20 text-emerald-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-emerald-500/30">
                    <CheckCircle className="w-5 h-5" /> Saved! Redirecting to dashboard…
                  </div>
                ) : (
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 shadow-lg shadow-emerald-500/10">
                    {saving
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><Save className="w-5 h-5" />{extractedData.isDuplicate ? "Save Anyway" : extractedData.isSpam ? "Save Anyway (Override)" : "Save to Dashboard"}</>
                    }
                  </button>
                )}
                <button onClick={handleReset}
                  className="py-4 px-6 bg-white/4 hover:bg-white/8 border border-[#12142a] text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Extract Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

export default function ExtractPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07080F] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading…</p>
        </div>
      </div>
    }>
      <ExtractPageContent />
    </Suspense>
  );
}

"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, ClipboardPaste, Zap, BarChart3, XCircle, CheckCircle2,
  Users, TrendingDown, IndianRupee, Sparkles, Star, Bell, ChevronRight,
  Shield, Globe, Rocket,
} from "lucide-react";
import { useScrollRevealAll } from "@/lib/useScrollReveal";

/* ── Animated number counter ───────────────────────────────── */
function CountUp({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const step = end / (duration / 16);
        let cur = 0;
        const timer = setInterval(() => {
          cur = Math.min(cur + step, end);
          setCount(Math.round(cur));
          if (cur >= end) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Typewriter ──────────────────────────────────────────────── */
const words = ["Internships", "Jobs", "Hackathons", "Scholarships"];
function Typewriter() {
  const [idx, setIdx] = useState(0);
  const [sub, setSub] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[idx % words.length];
    const timeout = deleting
      ? setTimeout(() => {
          setSub((s) => s.slice(0, -1));
          if (sub.length <= 1) { setDeleting(false); setIdx((i) => i + 1); }
        }, 60)
      : setTimeout(() => {
          setSub(word.slice(0, sub.length + 1));
          if (sub === word) { setTimeout(() => setDeleting(true), 1400); }
        }, 90);
    return () => clearTimeout(timeout);
  }, [sub, deleting, idx]);

  return (
    <span className="gradient-text">
      {sub}
      <span className="animate-pulse text-indigo-400">|</span>
    </span>
  );
}

export default function LandingPage() {
  useScrollRevealAll(".reveal", 0.12);
  useScrollRevealAll(".reveal-left", 0.12);
  useScrollRevealAll(".reveal-right", 0.12);

  const stats = [
    { icon: <Users className="w-6 h-6 text-indigo-400" />, end: 93, suffix: "M+", label: "Students Affected", color: "from-indigo-500/10 to-purple-500/10", border: "border-indigo-500/20" },
    { icon: <TrendingDown className="w-6 h-6 text-red-400" />, end: 4, suffix: "", label: "Missed Per Semester", color: "from-red-500/10 to-orange-500/10", border: "border-red-500/20" },
    { icon: <IndianRupee className="w-6 h-6 text-amber-400" />, prefix: "₹", end: 15, suffix: "Cr", label: "Lost Yearly", color: "from-amber-500/10 to-yellow-500/10", border: "border-amber-500/20" },
  ];

  const steps = [
    { step: "01", emoji: "📋", icon: <ClipboardPaste className="w-7 h-7" />, title: "Paste", description: "Copy any WhatsApp forward — messy forwards, chain messages, group blasts. Any format, any language." },
    { step: "02", emoji: "⚡", icon: <Zap className="w-7 h-7" />, title: "Extract", description: "AI reads and extracts company, role, eligibility criteria, deadline, stipend, apply link — instantly." },
    { step: "03", emoji: "📊", icon: <BarChart3 className="w-7 h-7" />, title: "Track", description: "Dashboard organizes everything with countdown timers, urgency alerts, and one-click apply." },
  ];

  const features = [
    { icon: <Shield className="w-5 h-5 text-emerald-400" />, title: "Spam Detection", desc: "AI filters fake/scam opportunities before they clutter your dashboard." },
    { icon: <Bell className="w-5 h-5 text-indigo-400" />, title: "Deadline Alerts", desc: "Get notified before deadlines expire — never miss an opportunity again." },
    { icon: <Globe className="w-5 h-5 text-purple-400" />, title: "Community Share", desc: "Share opportunities with classmates in private password-protected groups." },
    { icon: <Star className="w-5 h-5 text-amber-400" />, title: "Eligibility Check", desc: "Auto-checks if you meet CGPA and branch requirements based on your profile." },
    { icon: <Rocket className="w-5 h-5 text-pink-400" />, title: "Duplicate Guard", desc: "Detects if you already saved the same opportunity and warns you." },
    { icon: <Sparkles className="w-5 h-5 text-cyan-400" />, title: "Skills Extraction", desc: "Pulls required skills from listings so you know exactly what to prep." },
  ];

  const testimonials = [
    { name: "Priya S.", college: "NIT Trichy", text: "Saved me from missing a TCS deadline that was buried in 300+ messages!", avatar: "P" },
    { name: "Rahul M.", college: "VIT Vellore", text: "My entire placement group uses this now. The AI extraction is insanely accurate.", avatar: "R" },
    { name: "Aarav K.", college: "BITS Pilani", text: "Finally a tool built for Indian students. The CGPA checker alone is gold.", avatar: "A" },
  ];

  return (
    <div className="relative overflow-hidden">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative min-h-[95vh] flex items-center animated-gradient hero-grid pt-20">
        {/* Orbs */}
        <div className="orb w-[500px] h-[500px] bg-indigo-600/15 top-[-100px] left-[-100px]" />
        <div className="orb w-[400px] h-[400px] bg-purple-600/12 bottom-[-80px] right-[-60px]" />
        <div className="orb w-[250px] h-[250px] bg-pink-600/8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="text-center max-w-5xl mx-auto">

            {/* Badge */}
            <div className="slide-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/25 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-sm font-semibold text-indigo-400 tracking-wide">
                PROJECT REMEMBER ME — Built for 93M Students
              </span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>

            {/* Headline */}
            <h1 className="slide-up delay-100 text-5xl sm:text-6xl md:text-8xl font-black leading-[1.05] mb-6 tracking-tight">
              Never Miss a<br />
              <Typewriter />
              <br />
              <span className="text-slate-300">From WhatsApp</span>
            </h1>

            {/* Sub */}
            <p className="slide-up delay-200 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Paste any forward → AI extracts everything → deadlines tracked → you apply on time.
              <span className="text-indigo-400 font-semibold"> Free forever.</span>
            </p>

            {/* CTAs */}
            <div className="slide-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/extract"
                className="group btn-primary text-lg px-8 py-4"
              >
                Start Tracking Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="btn-ghost text-lg px-8 py-4"
              >
                View Dashboard
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Social proof row */}
            <div className="slide-up delay-400 flex items-center justify-center gap-2 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {["P","R","A","K","S"].map((l, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#07080f]">{l}</div>
                ))}
              </div>
              <span>Trusted by <span className="text-slate-300 font-semibold">2,400+</span> students across India</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 animate-bounce">
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <div key={i} className={`reveal bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-8 text-center card-hover`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex justify-center mb-4">{s.icon}</div>
                <p className="text-5xl font-black text-white mb-2 tabular-nums">
                  {(s as { prefix?: string }).prefix}
                  <CountUp end={s.end} suffix={s.suffix} />
                </p>
                <p className="text-sm text-slate-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ───────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
              <span className="text-xs font-semibold text-purple-400 tracking-widest uppercase">How It Works</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Three steps to <span className="gradient-text">never miss</span> again
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">No app to install. No account needed to try. Paste and go.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[calc(33%+20px)] right-[calc(33%+20px)] h-px bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30" />

            {steps.map((s, i) => (
              <div key={i} className="reveal glass-card p-8 relative group" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="absolute -top-4 left-6 px-3 py-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full font-mono shadow-lg shadow-indigo-500/30">
                  STEP {s.step}
                </div>
                <div className="text-5xl mb-5 mt-2 group-hover:scale-110 transition-transform duration-300">{s.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{s.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="orb w-[400px] h-[400px] bg-purple-600/6 top-0 right-0" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Everything you need, <span className="gradient-text">nothing you don&apos;t</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="reveal glass-card p-6 group" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before / After ─────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Before &amp; After <span className="gradient-text">OpportUnity</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Without */}
            <div className="reveal-left bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"><XCircle className="w-5 h-5 text-red-400" /></div>
                <h3 className="text-xl font-bold text-red-400">Without OpportUnity</h3>
              </div>
              <ul className="space-y-3.5">
                {["Scrolling 300+ WhatsApp messages every morning","Missing deadlines buried in thread noise","Messy Fwd: Fwd: Fwd: chains you never open","No idea what you&apos;ve already applied to","Same opportunity shared 15 times, still miss it","Important details hidden in paragraphs of text"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </li>
                ))}
              </ul>
            </div>
            {/* With */}
            <div className="reveal-right bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
                <h3 className="text-xl font-bold text-emerald-400">With OpportUnity</h3>
              </div>
              <ul className="space-y-3.5">
                {["Clean, searchable opportunity cards at a glance","Deadline countdowns with 🔴 🟡 🟢 urgency levels","AI extracts all details in under 2 seconds","Track applied / saved / expired with one click","Community feed with verified, upvoted opportunities","Eligibility check tells you if you qualify instantly"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="orb w-[350px] h-[350px] bg-indigo-600/6 bottom-0 left-0" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Loved by <span className="gradient-text">students</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="reveal glass-card p-6 group" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.college}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-28 relative">
        <div className="max-w-3xl mx-auto px-4 text-center reveal">
          <div className="relative">
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-3xl border border-indigo-500/20 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-0 rounded-3xl border border-purple-500/10 animate-ping" style={{ animationDuration: "3s", animationDelay: "1s" }} />

            <div className="relative bg-gradient-to-br from-indigo-500/10 via-purple-500/8 to-pink-500/5 border border-indigo-500/20 rounded-3xl p-14 glow">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-4xl sm:text-5xl font-black mb-4">
                Ready to Track Your <span className="gradient-text">Future?</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Join thousands of students who never miss an opportunity again.<br />
                Free forever. No credit card needed.
              </p>
              <Link href="/login" className="group btn-primary text-lg px-10 py-4 inline-flex">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-[#12142A]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🔔</span>
            <span className="text-xl font-bold gradient-text">OpportUnity</span>
          </div>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed mb-6">
            Built for PROJECT REMEMBER ME hackathon. Made with ❤️ for 93M Indian college students.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-600">
            {[["Extract", "/extract"], ["Dashboard", "/dashboard"], ["Community", "/community"], ["My Groups", "/communities"], ["Login", "/login"]].map(([label, href]) => (
              <Link key={href} href={href} className="hover:text-indigo-400 transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

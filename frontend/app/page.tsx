"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardPaste,
  Zap,
  BarChart3,
  XCircle,
  CheckCircle2,
  Users,
  TrendingDown,
  IndianRupee,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center animated-gradient pattern-bg">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
              <span className="text-lg">🏆</span>
              <span className="text-sm font-semibold text-indigo-400 tracking-wide">
                PROJECT REMEMBER ME
              </span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-6">
              Never Miss an{" "}
              <span className="gradient-text">Opportunity</span> Buried in{" "}
              <span className="gradient-text">WhatsApp</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Paste any forward → AI extracts everything → deadlines tracked →
              you apply on time. Built for{" "}
              <span className="text-indigo-400 font-semibold">
                93M Indian college students
              </span>
              .
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/extract"
                className="group flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/25 text-lg"
              >
                Start Tracking Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 text-lg"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-7 h-7 text-indigo-400" />,
                stat: "93M+",
                label: "Students Affected",
                color: "from-indigo-500/10 to-purple-500/10",
                borderColor: "border-indigo-500/20",
              },
              {
                icon: <TrendingDown className="w-7 h-7 text-red-400" />,
                stat: "3-4",
                label: "Missed Per Semester",
                color: "from-red-500/10 to-orange-500/10",
                borderColor: "border-red-500/20",
              },
              {
                icon: <IndianRupee className="w-7 h-7 text-amber-400" />,
                stat: "₹15Cr",
                label: "Lost Yearly",
                color: "from-amber-500/10 to-yellow-500/10",
                borderColor: "border-amber-500/20",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${item.color} border ${item.borderColor} rounded-xl p-6 text-center card-hover`}
              >
                <div className="flex justify-center mb-4">{item.icon}</div>
                <p className="text-4xl font-black text-white mb-1">
                  {item.stat}
                </p>
                <p className="text-sm text-slate-400 font-medium">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Three simple steps to never miss an opportunity again
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <ClipboardPaste className="w-8 h-8" />,
                emoji: "📋",
                title: "Paste",
                description:
                  "Copy and paste any WhatsApp forward, messy group message, or opportunity text. Any format works.",
              },
              {
                step: "02",
                icon: <Zap className="w-8 h-8" />,
                emoji: "⚡",
                title: "Extract",
                description:
                  "Our AI reads and extracts company, role, eligibility, deadline, stipend, and apply link automatically.",
              },
              {
                step: "03",
                icon: <BarChart3 className="w-8 h-8" />,
                emoji: "📊",
                title: "Track",
                description:
                  "Everything organized in your dashboard with deadline countdowns, urgency alerts, and one-click apply.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative bg-[#0A0B15] border border-[#12142A] rounded-xl p-8 card-hover group"
              >
                <div className="absolute -top-4 left-6 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full font-mono">
                  STEP {item.step}
                </div>
                <div className="text-4xl mb-4 mt-2">{item.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Before & After{" "}
              <span className="gradient-text">OpportUnity</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Without */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-red-400">
                  Without OpportUnity
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Scrolling through 300+ WhatsApp messages",
                  "Missing deadlines because you forgot",
                  'Messy "Fwd: Fwd: Fwd:" messages',
                  "No way to track what you applied to",
                  "Same opportunity shared 15 times",
                  "Important details buried in paragraphs",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-slate-400"
                  >
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* With */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-emerald-400">
                  With OpportUnity
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Clean, searchable opportunity cards",
                  "Deadline countdowns with urgency alerts",
                  "AI extracts all details in seconds",
                  "Track applied vs saved vs expired",
                  "Community feed with upvotes",
                  "Never miss an opportunity again",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-slate-400"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-12 glow">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Ready to Track Your <span className="gradient-text">Future</span>?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Join thousands of students who never miss an opportunity again
            </p>
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/25 text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#12142A]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🔔</span>
            <span className="text-xl font-bold gradient-text">OpportUnity</span>
          </div>
          <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
            Built in 24 hours for PROJECT REMEMBER ME hackathon. Made for 93M
            Indian college students who deserve better opportunity tracking.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-600">
            <Link href="/extract" className="hover:text-indigo-400 transition-colors">
              Extract
            </Link>
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/community" className="hover:text-indigo-400 transition-colors">
              Community
            </Link>
            <Link href="/login" className="hover:text-indigo-400 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

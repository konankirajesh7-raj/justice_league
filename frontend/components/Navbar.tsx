"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Menu, X, User, LogOut, LayoutDashboard, ChevronDown,
  Zap, Bell,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user as unknown as Record<string, unknown>);
    };
    getUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? session.user as unknown as Record<string, unknown> : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    setMenuOpen(false);
    router.push("/login");
  }, [router]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/extract", label: "Extract" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/community", label: "Community" },
    { href: "/communities", label: "My Groups" },
  ];

  const isActive = (href: string) => pathname === href;
  const userInitial = ((user?.email as string)?.charAt(0) || "U").toUpperCase();
  const userHandle = (user?.email as string)?.split("@")[0];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#07080f]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-xl shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-purple-300 transition-all">
                OpportUnity
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "text-indigo-400"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-400 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <NotificationBell />

                  {/* Quick extract */}
                  <Link
                    href="/extract"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-semibold rounded-lg border border-indigo-500/20 transition-all hover:-translate-y-0.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Extract
                  </Link>

                  {/* Avatar dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/8 transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-indigo-500/30">
                        {userInitial}
                      </div>
                      <span className="text-sm text-slate-300 max-w-[100px] truncate">{userHandle}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {dropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                        <div className="absolute right-0 mt-2 w-52 bg-[#0d0f1e] border border-white/8 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden scale-in">
                          <div className="p-3.5 border-b border-white/6">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">{userInitial}</div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-200 truncate">{userHandle}</p>
                                <p className="text-[11px] text-slate-500 truncate">{user.email as string}</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-1.5">
                            <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-xl transition-colors">
                              <User className="w-4 h-4 text-slate-400" /> Profile
                            </Link>
                            <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-xl transition-colors">
                              <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                            </Link>
                            <div className="my-1 h-px bg-white/6" />
                            <button onClick={handleSignOut} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg border border-white/8 hover:bg-white/5 transition-all">Login</Link>
                  <Link href="/login" className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/20">Get Started</Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#0a0b15] border-l border-white/8 md:hidden slide-in-right overflow-y-auto">
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/6">
              <span className="font-bold gradient-text">OpportUnity</span>
              <button onClick={() => setMenuOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(link.href) ? "bg-indigo-500/15 text-indigo-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="p-4 border-t border-white/6">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">{userInitial}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{userHandle}</p>
                      <p className="text-xs text-slate-500">{user.email as string}</p>
                    </div>
                  </div>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 rounded-xl">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <button onClick={handleSignOut} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-primary w-full text-sm py-3">
                  Get Started Free
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

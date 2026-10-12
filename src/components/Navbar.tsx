'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Sparkles,
  Compass,
  FileText,
  Bookmark,
  Mail,
  User,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Layers,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, logout, loginAsDemoBrand, loginAsDemoCreator } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentRole = mounted ? role : null;
  const currentUser = mounted ? user : null;

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  CreatorConnect <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-medium">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Generative Production Marketplace</span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 ml-8">
              <Link
                href="/discover"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/discover')
                    ? 'bg-slate-800 text-white shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Discover Creators</span>
              </Link>

              <Link
                href="/briefs"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/briefs')
                    ? 'bg-slate-800 text-white shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Campaign Briefs</span>
              </Link>
            </nav>
          </div>

          {/* Right Area: Role Dashboards, Demo Account Switcher, User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Demo Switcher Quick Actions */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-indigo-500/50 hover:text-white transition-all shadow-sm"
                title="Switch test persona"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Persona: <strong className="text-white capitalize">{currentRole || 'Guest'}</strong></span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {demoMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-750 shadow-xl shadow-black/60 p-2 z-50 text-xs"
                  onClick={() => setDemoMenuOpen(false)}
                >
                  <div className="px-2 py-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Switch Test Account
                  </div>
                  <button
                    onClick={loginAsDemoBrand}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">Brand / Agency</div>
                      <div className="text-[11px] text-slate-400">Apex Athletics (Post briefs, invite)</div>
                    </div>
                    {currentRole === 'brand' && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </button>
                  <button
                    onClick={loginAsDemoCreator}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between mt-1 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">AI Creator</div>
                      <div className="text-[11px] text-slate-400">Elena Rostova (Portfolio, bids)</div>
                    </div>
                    {currentRole === 'creator' && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </button>
                </div>
              )}
            </div>

            {/* Authenticated Dashboard Actions */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                {currentRole === 'brand' ? (
                  <>
                    <Link
                      href="/brand/shortlist"
                      className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
                      title="Saved Shortlist"
                    >
                      <Bookmark className="w-4 h-4 text-amber-400" />
                    </Link>
                    <Link
                      href="/brand/briefs/new"
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Post New Brief</span>
                    </Link>
                    <Link
                      href="/brand/dashboard"
                      className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-xs text-slate-200 font-medium hover:bg-slate-800 transition-colors"
                    >
                      Brand Portal
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/creator/invitations"
                      className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
                      title="Invitations"
                    >
                      <Mail className="w-4 h-4 text-emerald-400" />
                    </Link>
                    <Link
                      href="/creator/portfolio"
                      className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-md shadow-violet-600/30 transition-all flex items-center space-x-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>My Portfolio</span>
                    </Link>
                    <Link
                      href="/creator/dashboard"
                      className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-xs text-slate-200 font-medium hover:bg-slate-800 transition-colors"
                    >
                      Creator Studio
                    </Link>
                  </>
                )}

                {/* User avatar & logout */}
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-slate-400 m-2" />
                    )}
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white text-xs font-medium transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl px-4 py-4 space-y-3">
          <Link
            href="/discover"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium"
          >
            Discover Creators
          </Link>
          <Link
            href="/briefs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium"
          >
            Campaign Briefs
          </Link>

          {currentRole === 'brand' ? (
            <>
              <Link
                href="/brand/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-indigo-400 hover:bg-slate-800 font-medium"
              >
                Brand Dashboard & Briefs
              </Link>
              <Link
                href="/brand/shortlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium"
              >
                Saved Shortlist
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/creator/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-violet-400 hover:bg-slate-800 font-medium"
              >
                Creator Studio & Profile
              </Link>
              <Link
                href="/creator/invitations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium"
              >
                Received Invitations
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Persona: {currentRole || 'Guest'}</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  loginAsDemoBrand();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-indigo-300 font-semibold"
              >
                Switch Brand
              </button>
              <button
                onClick={() => {
                  loginAsDemoCreator();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 text-[11px] text-violet-300 font-semibold"
              >
                Switch Creator
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import {
  Sparkles,
  ShieldCheck,
  Building2,
  Paintbrush,
  ArrowRight,
  AlertCircle,
  Lock,
  Mail,
  User,
} from 'lucide-react';

export default function InitialHomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, login, signup, loginAsDemoBrand, loginAsDemoCreator } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerRole, setRegisterRole] = useState<UserRole>('brand');
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerCompanyName, setRegisterCompanyName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Status & error state
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to role-specific dashboard immediately
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'creator') {
        router.push('/creator/dashboard');
      } else {
        router.push('/brand/dashboard');
      }
    }
  }, [user, authLoading, router]);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = loginEmail.trim();
    const trimmedPassword = loginPassword.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter both your email address and password.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (trimmedPassword.length < 4) {
      setError('Password must contain at least 4 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(trimmedEmail);
      const lower = trimmedEmail.toLowerCase();
      if (lower.includes('creator') || lower.includes('elena')) {
        router.push('/creator/dashboard');
      } else {
        router.push('/brand/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials and try again.');
      setIsSubmitting(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = registerFullName.trim();
    const trimmedEmail = registerEmail.trim();
    const trimmedPassword = registerPassword.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setError('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (trimmedPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(
        trimmedEmail,
        trimmedName,
        registerRole,
        registerRole === 'brand' ? registerCompanyName.trim() : undefined
      );

      if (registerRole === 'creator') {
        router.push('/creator/dashboard');
      } else {
        router.push('/brand/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Loading CreatorConnect AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Identity / Logo Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-0.5 mx-auto shadow-2xl shadow-indigo-500/25">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-indigo-400" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>CreatorConnect</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold">
              AI
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Commercial AI Content Creator Marketplace
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Tab Switcher: Login vs Registration */}
          <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Quick Reviewer Persona Shortcut */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 space-y-2.5">
            <div className="flex items-center gap-1.5 text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Reviewer Persona Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  loginAsDemoBrand();
                  router.push('/brand/dashboard');
                }}
                className="px-3 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all text-center"
              >
                Sign in as Brand
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsDemoCreator();
                  router.push('/creator/dashboard');
                }}
                className="px-3 py-2 rounded-xl bg-violet-600/90 hover:bg-violet-600 text-white text-xs font-bold shadow-md shadow-violet-600/20 transition-all text-center"
              >
                Sign in as Creator
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="creative@brand.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className="text-indigo-400 hover:underline font-semibold"
                >
                  Create an account
                </button>
              </div>
            </form>
          ) : (
            /* MODE 2: REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Account Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('brand')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      registerRole === 'brand'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building2 className={`w-4 h-4 mb-1 ${registerRole === 'brand' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <strong className="text-xs block text-white">Brand / Agency</strong>
                    <span className="text-[10px] text-slate-400">Post briefs & invite</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole('creator')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      registerRole === 'creator'
                        ? 'bg-violet-600/20 border-violet-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Paintbrush className={`w-4 h-4 mb-1 ${registerRole === 'creator' ? 'text-violet-400' : 'text-slate-500'}`} />
                    <strong className="text-xs block text-white">AI Creator</strong>
                    <span className="text-[10px] text-slate-400">Portfolio & productions</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={registerFullName}
                    onChange={(e) => setRegisterFullName(e.target.value)}
                    placeholder="Elena Rostova"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {registerRole === 'brand' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Company / Brand Name
                  </label>
                  <input
                    type="text"
                    value={registerCompanyName}
                    onChange={(e) => setRegisterCompanyName(e.target.value)}
                    placeholder="Apex Athletics Studio"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="elena@rostovafilms.ai"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Registering Account...' : 'Complete Sign Up'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-indigo-400 hover:underline font-semibold"
                >
                  Log In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

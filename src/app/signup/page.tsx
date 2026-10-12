'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import {
  Sparkles,
  ShieldCheck,
  Building2,
  Paintbrush,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [role, setRole] = useState<UserRole>('brand');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await signup(email, fullName, role, companyName);
      if (role === 'brand') {
        router.push('/brand/dashboard');
      } else {
        router.push('/creator/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 p-0.5 mx-auto shadow-xl shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
          Join CreatorConnect AI
        </h2>
        <p className="text-xs text-slate-400">
          Select your marketplace account role to unlock dedicated workflows.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection Segmented Cards */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Select Your Role *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('brand')}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    role === 'brand'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building2 className={`w-5 h-5 mb-2 ${role === 'brand' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div>
                    <strong className="text-xs font-bold block text-white">Brand / Agency</strong>
                    <span className="text-[10px] text-slate-400">Post briefs, shortlist & invite creators</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    role === 'creator'
                      ? 'bg-violet-600/20 border-violet-500 text-white shadow-lg shadow-violet-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Paintbrush className={`w-5 h-5 mb-2 ${role === 'creator' ? 'text-violet-400' : 'text-slate-500'}`} />
                  <div>
                    <strong className="text-xs font-bold block text-white">AI Creator</strong>
                    <span className="text-[10px] text-slate-400">Showcase workflows & bid on campaigns</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {role === 'brand' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Company / Brand Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Apex Athletics Studio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Sign Up'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, role, isLoading, loginAsDemoCreator } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Verifying creator studio authorization...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If authenticated user is a brand attempting to access creator studio routes
  if (role !== 'creator' && role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4">
        <div className="max-w-md mx-auto rounded-3xl bg-slate-900 border border-violet-500/30 p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Creator Studio Authorization Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You are currently authenticated as a <strong>Brand / Agency</strong> ({user.company_name || user.full_name}). This workspace is tailored for AI Creators.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => loginAsDemoCreator()}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to Creator Persona</span>
            </button>
            <Link
              href="/brand/dashboard"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-300 transition-colors"
            >
              Return to Brand Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, role, isLoading, loginAsDemoBrand } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Verifying brand authorization...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If authenticated user is a creator attempting to access brand routes
  if (role !== 'brand' && role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4">
        <div className="max-w-md mx-auto rounded-3xl bg-slate-900 border border-amber-500/30 p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Brand Authorization Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You are currently authenticated as an <strong>AI Creator</strong> ({user.full_name}). This portal is restricted to Brands & Creative Agencies.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => loginAsDemoBrand()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to Brand Persona</span>
            </button>
            <Link
              href="/creator/dashboard"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-300 transition-colors"
            >
              Return to Creator Studio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

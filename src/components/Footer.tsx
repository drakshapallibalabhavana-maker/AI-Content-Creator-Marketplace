import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Cpu, Lock, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs">
      {/* Trust & Transparency Banner */}
      <div className="border-b border-slate-900 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-medium text-sm">Commercial-Use Clarity</h4>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  Transparent model licensing disclosures, verified commercial tiers, and clear IP assignment frameworks.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Cpu className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-medium text-sm">Tool & Node Verification</h4>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  Audited generation pipelines across Runway, Sora, ComfyUI, ElevenLabs, and Midjourney.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-medium text-sm">Evidence-Backed Portfolios</h4>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  Real workflow manifests with prompt engineering records, seed reproducibility, and revision ledgers.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-medium text-sm">Zero Hallucination Matching</h4>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  Deterministic AND/OR filtering criteria without opaque scores or fabricated creator capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-white font-bold tracking-tight">CreatorConnect AI</span>
              <span className="text-slate-400 text-xs ml-2">HacXLerate 2026 Round 1 | Kampus.VC Challenge</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/discover" className="hover:text-white transition-colors">
              Creator Discovery
            </Link>
            <Link href="/briefs" className="hover:text-white transition-colors">
              Campaign Briefs
            </Link>
            <Link href="/brand/briefs/new" className="hover:text-white transition-colors">
              AI Brief Builder
            </Link>
            <Link href="/creator/portfolio" className="hover:text-white transition-colors">
              Creator Studio
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <p>© 2026 CreatorConnect AI Marketplace. Demonstrative production MVP with verified database persistence.</p>
          <p className="mt-2 sm:mt-0">All seed creator identities and brand briefs are fictional demonstrations.</p>
        </div>
      </div>
    </footer>
  );
}

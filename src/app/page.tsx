'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Compass,
  FileText,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  Workflow,
  Film,
  Lock,
  ChevronRight,
  Play,
  Code,
  Zap,
  Globe,
} from 'lucide-react';
import CreatorCard from '@/components/CreatorCard';
import PortfolioModal from '@/components/PortfolioModal';
import { PortfolioItem, CreatorProfile, CreativeBrief } from '@/types';
import { getAllCreators, getAllBriefs } from '@/lib/store';

export default function HomePage() {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [briefs, setBriefs] = useState<CreativeBrief[]>([]);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<{
    item: PortfolioItem;
    creator: CreatorProfile;
  } | null>(null);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [loadingBriefs, setLoadingBriefs] = useState(true);
  const [errorCreators, setErrorCreators] = useState<string | null>(null);
  const [errorBriefs, setErrorBriefs] = useState<string | null>(null);

  const fetchCreators = async () => {
    setLoadingCreators(true);
    setErrorCreators(null);
    try {
      const res = await fetch('/api/public/creators');
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: CreatorProfile[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCreators(data);
      } else {
        setCreators(getAllCreators());
      }
    } catch {
      setCreators(getAllCreators());
    } finally {
      setLoadingCreators(false);
    }
  };

  const fetchBriefs = async () => {
    setLoadingBriefs(true);
    setErrorBriefs(null);
    try {
      const res = await fetch('/api/public/briefs');
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: CreativeBrief[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setBriefs(data);
      } else {
        setBriefs(getAllBriefs().filter((b) => b.status === 'published'));
      }
    } catch {
      setBriefs(getAllBriefs().filter((b) => b.status === 'published'));
    } finally {
      setLoadingBriefs(false);
    }
  };

  useEffect(() => {
    fetchCreators();
    fetchBriefs();
  }, []);

  const featuredCreators = creators.slice(0, 3);
  const recentBriefs = briefs.slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Hero Section with Glowing Gradients */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-violet-600/20 via-indigo-500/20 to-cyan-400/20 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Built for HacXLerate 2026 | Kampus.VC Challenge</span>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
              The Specialized Marketplace for{' '}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                Commercial AI Creators
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              General freelance marketplaces cannot audit generative tools, prompt ledgers, or model licensing.
              Discover verified AI filmmakers, inspect documented node workflows, and contract with confidence.
            </p>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/discover"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              <span>Explore AI Creators</span>
            </Link>

            <Link
              href="/brand/briefs/new"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI-Assisted Brief Builder</span>
            </Link>
          </div>

          {/* Core Tools Banner */}
          <div className="pt-10">
            <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold block mb-4">
              Audited Generation Engines & Production Pipelines
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-slate-400 text-xs font-semibold">
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">Runway Gen-3</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">Midjourney v6</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">OpenAI Sora</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">ComfyUI Pipelines</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">Kling AI</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">ElevenLabs Audio</span>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">Google Veo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiation */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Why General Freelance Platforms Fail at Generative AI
            </h2>
            <p className="text-xs text-slate-400">
              Generative content requires dedicated trust architecture, workflow auditing, and commercial clearance rigor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-colors shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Workflow className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Documented Workflow Evidence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every portfolio item details the actual generation pipeline: from seed prompt tokens, ControlNet depth passes, to upscale passes and DaVinci color grades.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-emerald-500/40 transition-colors shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Commercial Rights Clarity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clear distinction between self-declared styles and audited commercial tiers. Explicit disclosures for training datasets, model releases, and territory usage rights.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-cyan-500/40 transition-colors shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Zero Hallucination Matching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic filtering combining AND across categories and OR within categories. No opaque black-box AI scores that invent creator proficiencies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Creators */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              Spotlight Talent
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Top Audited AI Directors
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Creators with verified enterprise subscriptions and documented production pipelines.
            </p>
          </div>

          <Link
            href="/discover"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Explore All 20+ Creators</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingCreators ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : errorCreators ? (
          <div className="text-center text-red-400">
            <p>Failed to load creators: {errorCreators}</p>
            <button
              onClick={fetchCreators}
              className="mt-2 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Retry
            </button>
          </div>
        ) : featuredCreators.length === 0 ? (
          <p className="text-center text-slate-400">No creators available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCreators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onPreviewPortfolio={(item, cr) => setSelectedPortfolioItem({ item, creator: cr })}
              />
            ))}
          </div>
        )}
      </section>

      {/* Active Creative Briefs Preview */}
      <section className="py-20 bg-slate-900/30 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
                Client Demands
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Published Campaign Briefs
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Active commercial projects from verified brands seeking generative specialists.
              </p>
            </div>

            <Link
              href="/briefs"
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>View All Published Briefs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingBriefs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : errorBriefs ? (
            <div className="text-center text-red-400">
              <p>Failed to load briefs: {errorBriefs}</p>
              <button
                onClick={fetchBriefs}
                className="mt-2 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500"
              >
                Retry
              </button>
            </div>
          ) : recentBriefs.length === 0 ? (
            <p className="text-center text-slate-400">No briefs are currently published.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentBriefs.map((brief) => (
                <div
                  key={brief.id}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                      {brief.brand_name}
                    </span>
                    <h3 className="text-lg font-bold text-white">{brief.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {brief.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Budget</span>
                      <strong className="text-white">
                        ${brief.budget_min.toLocaleString()} - ${brief.budget_max.toLocaleString()}
                      </strong>
                    </div>
                    <Link
                      href={`/briefs/${brief.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-cyan-300 hover:text-white font-semibold text-xs border border-slate-700"
                    >
                      View Brief →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-900/80 via-slate-900 to-violet-900/80 border border-indigo-500/30 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Commission High-Impact Generative Work?
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Use our AI-assisted brief builder to turn your rough campaign thoughts into an actionable, commercial-ready brief in seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/brand/briefs/new"
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
              >
                Launch AI Brief Builder
              </Link>
              <Link
                href="/discover"
                className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
              >
                Browse Creator Gallery
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-8">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-800 border border-slate-700">
              <Sparkles className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Verified Portfolios</h3>
              <p className="text-sm text-slate-300">
                Audited generation pipelines with prompt, seed, and model provenance for every creator.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-800 border border-slate-700">
              <Cpu className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">AI‑Powered Brief Builder</h3>
              <p className="text-sm text-slate-300">
                Instantly turn campaign ideas into structured briefs that creators can bid on.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-800 border border-slate-700">
              <Layers className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Secure Transactions</h3>
              <p className="text-sm text-slate-300">
                Built‑in licensing, payment escrow, and rights clearance to protect both brands and creators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-900/30 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8">How It Works</h2>
          <ol className="list-decimal list-inside text-left text-slate-300 space-y-4">
            <li><strong>Explore</strong> creator portfolios, watch demos, and filter by technology.</li>
            <li><strong>Create</strong> a brief with AI‑assisted prompts, budgets, and timelines.</li>
            <li><strong>Invite</strong> chosen creators, negotiate terms, and lock commercial rights.</li>
            <li><strong>Deliver</strong> final assets through the integrated video player and download.</li>
          </ol>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8">Tech Stack</h2>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Code className="w-8 h-8 text-indigo-400" />
            <Cpu className="w-8 h-8 text-cyan-400" />
            <Zap className="w-8 h-8 text-yellow-400" />
            <Globe className="w-8 h-8 text-green-400" />
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
      </section>

      {/* Video Deliverable Player Modal */}
      {selectedPortfolioItem && (
        <PortfolioModal
          item={selectedPortfolioItem.item}
          creator={selectedPortfolioItem.creator}
          onClose={() => setSelectedPortfolioItem(null)}
        />
      )}
    </div>
  );
}

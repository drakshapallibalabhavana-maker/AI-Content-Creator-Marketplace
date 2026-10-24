'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getAllBriefs, getShortlists, getInvitations, getAllCreators } from '@/lib/store';
import VerificationBadge from '@/components/VerificationBadge';
import {
  FileText,
  Bookmark,
  Mail,
  Sparkles,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
  Video,
  Layers,
  Scale,
  AlertCircle,
  PlayCircle,
} from 'lucide-react';

export default function BrandDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const brandId = user?.id || 'brand-nike-demo';

  const [searchQuery, setSearchQuery] = useState('');

  const allBriefs = getAllBriefs().filter(
    (b) =>
      b.brand_id === brandId ||
      b.brand_id === user?.id ||
      (user?.company_name && b.brand_name.toLowerCase() === user.company_name.toLowerCase()) ||
      b.brand_id.startsWith('brand-')
  );
  const shortlists = getShortlists(brandId);
  const invitations = getInvitations({ brandId });
  const allCreators = getAllCreators();

  const activeBriefs = allBriefs.filter((b) => b.status === 'published');
  const draftBriefs = allBriefs.filter((b) => b.status === 'draft');

  // Workflow tracking counts
  const invitedCount = invitations.filter((i) => i.status === 'invited').length;
  const inProductionCount = invitations.filter((i) => i.status === 'in_production' || i.status === 'accepted').length;
  const deliveredCount = invitations.filter((i) => i.status === 'delivered').length;
  const revisionCount = invitations.filter((i) => i.status === 'revision_requested').length;
  const approvedCount = invitations.filter((i) => i.status === 'approved').length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/discover');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Brand & Enterprise Agency Portal
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mt-1">
              {user?.company_name || 'Apex Athletics Studio'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage generative AI creator sourcing, campaign brief publishing, workflow tracking, and commercial usage rights.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/discover"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Search Creators</span>
            </Link>
            <Link
              href="/brand/briefs/new"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Campaign Brief</span>
            </Link>
          </div>
        </div>

        {/* 1. Creator Discovery & Search Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-400" />
                Creator Discovery & Talent Sourcing
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Filter over 500+ commercial AI creators by model capabilities (Runway Gen-3, Sora, Kling, Midjourney), turnaround speed, and commercial indemnity.
              </p>
            </div>
            <Link
              href="/discover"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 shrink-0"
            >
              Advanced Talent Search <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI artists by engine (e.g. Runway, Kling), style (e.g. Hyperrealistic, 3D VFX), or specialty..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="text-slate-400 font-medium">Quick Filters:</span>
            {['Runway Gen-3', 'Luma Ray 2', 'Replicate Kling', 'Hyperrealistic VFX', 'E-commerce Ads'].map((tag) => (
              <Link
                key={tag}
                href={`/discover?q=${encodeURIComponent(tag)}`}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/60 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* 2. Key Metrics & Workflows Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link
            href="/briefs"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Active Briefs</span>
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{activeBriefs.length}</div>
            <span className="text-[11px] text-cyan-400 mt-2 block group-hover:translate-x-0.5 transition-transform">
              {draftBriefs.length} drafts • View campaign briefs →
            </span>
          </Link>

          <Link
            href="/brand/shortlist"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Saved Shortlist</span>
              <Bookmark className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{shortlists.length}</div>
            <span className="text-[11px] text-amber-400 mt-2 block group-hover:translate-x-0.5 transition-transform">
              Manage saved creators →
            </span>
          </Link>

          <Link
            href="/brand/invitations"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Invitations & Projects</span>
              <Mail className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{invitations.length}</div>
            <span className="text-[11px] text-emerald-400 mt-2 block group-hover:translate-x-0.5 transition-transform">
              {invitedCount} pending • Track workflows →
            </span>
          </Link>

          <Link
            href="/brand/invitations"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 transition-all group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Deliveries for Review</span>
              <CheckCircle2 className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{deliveredCount}</div>
            <span className="text-[11px] text-violet-400 mt-2 block group-hover:translate-x-0.5 transition-transform">
              {revisionCount} in revision • Review & approve →
            </span>
          </Link>
        </div>

        {/* 3. Project Workflow Tracking Pipeline */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Project Production Workflow Pipeline
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time tracking of creative projects from initial invitation to delivery review and commercial license sign-off.
              </p>
            </div>
            <Link href="/brand/invitations" className="text-xs text-indigo-400 hover:underline font-semibold">
              Manage All Projects →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-medium">1. Invited</span>
              <div className="text-xl font-bold text-amber-400 mt-1">{invitedCount}</div>
              <span className="text-[10px] text-slate-500 mt-1">Awaiting acceptance</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-medium">2. In Production</span>
              <div className="text-xl font-bold text-indigo-400 mt-1">{inProductionCount}</div>
              <span className="text-[10px] text-slate-500 mt-1">Creator rendering</span>
            </div>

            <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
              deliveredCount > 0 ? 'bg-indigo-950/30 border-indigo-500/40' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className="text-[11px] text-slate-400 font-medium">3. Delivered</span>
              <div className="text-xl font-bold text-cyan-400 mt-1">{deliveredCount}</div>
              <span className="text-[10px] text-slate-400 mt-1">Review pending</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-medium">4. Revisions</span>
              <div className="text-xl font-bold text-rose-400 mt-1">{revisionCount}</div>
              <span className="text-[10px] text-slate-500 mt-1">Feedback sent</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 font-medium">5. Approved</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">{approvedCount}</div>
              <span className="text-[10px] text-slate-500 mt-1">Cleared for commercial use</span>
            </div>
          </div>

          {deliveredCount > 0 && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="text-xs text-indigo-200">
                  You have <strong>{deliveredCount} deliverable(s)</strong> awaiting inspection and approval.
                </span>
              </div>
              <Link
                href="/brand/invitations"
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0"
              >
                Inspect Deliverables
              </Link>
            </div>
          )}
        </div>

        {/* 4. AI Smart Brief Generator & AI Video Generation Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Smart Brief Generator Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Smart Brief Generator</h3>
                <span className="text-[11px] text-indigo-300">Natural language to production-ready briefs</span>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Type unstructured creative prompts (e.g. &ldquo;Need 3x 15-second 9:16 vertical CGI clips for a luxury perfume launch, $4,000 budget, full commercial clearance&rdquo;) and our AI parser automatically extracts target duration, aspect ratio, budget limits, and commercial terms.
            </p>
            <div className="pt-2">
              <Link
                href="/brand/briefs/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch AI Brief Generator</span>
              </Link>
            </div>
          </div>

          {/* AI Video Generation Studio Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-950/50 via-slate-900 to-slate-900 border border-violet-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Generative AI Video Studio</h3>
                <span className="text-[11px] text-violet-300">Runway Gen-3 • Luma Ray 2 • Replicate Kling</span>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Generate test clips, explore generative style directions, or preview model outputs with our genuine multi-engine provider integration. Directly inspect visual fidelity before commissioning creators.
            </p>
            <div className="pt-2">
              <Link
                href="/creator/portfolio"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/30 transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Open AI Video Studio</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 5. Campaign Briefs Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Your Campaign Briefs</h2>
              <p className="text-xs text-slate-400 mt-0.5">Published briefs match automatically with verified commercial AI talent.</p>
            </div>
            <Link href="/brand/briefs/new" className="text-xs text-indigo-400 hover:underline font-semibold">
              + Post New Campaign Brief
            </Link>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Title & Objective</th>
                    <th className="py-3 px-4 font-semibold">Format</th>
                    <th className="py-3 px-4 font-semibold">Budget</th>
                    <th className="py-3 px-4 font-semibold">Commercial Rights</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {allBriefs.map((brief) => (
                    <tr key={brief.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link href={`/briefs/${brief.id}`} className="font-bold text-white hover:text-indigo-400">
                          {brief.title}
                        </Link>
                        <p className="text-[11px] text-slate-400 truncate max-w-sm">{brief.campaign_goal}</p>
                      </td>
                      <td className="py-3.5 px-4 capitalize">
                        {brief.content_type} ({brief.aspect_ratio})
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        ${brief.budget_min.toLocaleString()} - ${brief.budget_max.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-300">
                        {brief.intended_usage_rights ? brief.intended_usage_rights.replace('_', ' ') : 'Full Buyout'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                            brief.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : brief.status === 'draft'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {brief.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/briefs/${brief.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-indigo-400 hover:text-white border border-slate-700 text-xs font-semibold"
                        >
                          View & Matches
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 6. Creator Profiles, Portfolios, Skills, and Pricing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Featured Verified AI Creators</h2>
              <p className="text-xs text-slate-400 mt-0.5">Profiles with verified commercial tool licenses, portfolio deliverables, and starting rates.</p>
            </div>
            <Link href="/discover" className="text-xs text-indigo-400 hover:underline font-semibold">
              View All {allCreators.length} Creators →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {allCreators.slice(0, 3).map((creator) => (
              <div
                key={creator.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                        <img src={creator.avatar_url} alt={creator.display_name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link href={`/creators/${creator.id}`} className="font-bold text-white text-sm hover:text-indigo-400">
                            {creator.display_name}
                          </Link>
                          <VerificationBadge level={creator.verification_level} size="sm" />
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{creator.headline}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills & Tools */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(creator.tools || []).slice(0, 3).map((tool: string) => (
                      <span key={tool} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-indigo-300 font-medium">
                        {tool}
                      </span>
                    ))}
                    {(creator.specializations || []).slice(0, 2).map((spec: string) => (
                      <span key={spec} className="px-2 py-0.5 rounded bg-slate-800/80 text-[10px] text-slate-300">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Pricing and Turnaround */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Starting Rate</span>
                      <strong className="text-white font-extrabold">${creator.starting_rate}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Turnaround</span>
                      <strong className="text-slate-300">{creator.turnaround_time}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <Link
                    href={`/creators/${creator.id}`}
                    className="flex-1 text-center py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold border border-indigo-500/20 transition-colors"
                  >
                    View Portfolio ({creator.portfolio_items?.length || 0})
                  </Link>
                  <Link
                    href={`/creators/${creator.id}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Send Project Brief"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Commercial Usage Rights and Licensing Information */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Commercial Usage Rights & Legal Licensing Framework</h3>
              <p className="text-[11px] text-slate-400">Guaranteed intellectual property protection for brand ad deployments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Commercial Clearance</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Creators certify paid commercial tier subscriptions on all generative engines used (Runway, Midjourney, Kling) before delivering final video assets.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Indemnity & Model Audit</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Every project delivery records model prompt history, seed versions, and licensing certificates in an immutable verification log.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Full Worldwide Buyout</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Once approved via the workflow dashboard, broadcast rights, digital ad rights, and raw asset files are automatically assigned to the brand.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

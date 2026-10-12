'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getAllBriefs, getShortlists, getInvitations } from '@/lib/store';
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
} from 'lucide-react';

export default function BrandDashboardPage() {
  const { user } = useAuth();
  const brandId = user?.id || 'brand-nike-demo';

  const allBriefs = getAllBriefs().filter((b) => b.brand_id === brandId || b.brand_id.startsWith('brand-'));
  const shortlists = getShortlists(brandId);
  const invitations = getInvitations({ brandId });

  const activeBriefs = allBriefs.filter((b) => b.status === 'published');
  const draftBriefs = allBriefs.filter((b) => b.status === 'draft');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              Brand & Agency Portal
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mt-1">
              {user?.company_name || 'Apex Athletics Studio'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage generative creative campaigns, shortlisted AI artists, and project invitation responses.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/brand/briefs/new"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Campaign Brief</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/briefs"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Active Briefs</span>
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{activeBriefs.length}</div>
            <span className="text-[11px] text-cyan-400 mt-2 block group-hover:translate-x-0.5 transition-transform">
              View all campaign briefs →
            </span>
          </Link>

          <Link
            href="/brand/shortlist"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all group"
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
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Invitations Sent</span>
              <Mail className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{invitations.length}</div>
            <span className="text-[11px] text-emerald-400 mt-2 block group-hover:translate-x-0.5 transition-transform">
              Check acceptance statuses →
            </span>
          </Link>
        </div>

        {/* Brand Briefs Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Your Campaign Briefs</h2>
            <Link href="/brand/briefs/new" className="text-xs text-indigo-400 hover:underline">
              + Create another brief
            </Link>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Title</th>
                    <th className="py-3 px-4 font-semibold">Format</th>
                    <th className="py-3 px-4 font-semibold">Budget</th>
                    <th className="py-3 px-4 font-semibold">Deadline</th>
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
                      <td className="py-3.5 px-4">{new Date(brief.deadline).toLocaleDateString()}</td>
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

        {/* Shortlist Quick View */}
        <div className="space-y-4 pt-4 border-t border-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Saved Creators on Shortlist</h2>
            <Link href="/brand/shortlist" className="text-xs text-amber-400 hover:underline">
              View full shortlist ({shortlists.length})
            </Link>
          </div>

          {shortlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {shortlists.slice(0, 3).map((item) => {
                const c = item.creator;
                if (!c) return null;
                return (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800">
                        <img src={c.avatar_url} alt={c.display_name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link href={`/creators/${c.id}`} className="font-bold text-white text-xs hover:text-indigo-400">
                          {c.display_name}
                        </Link>
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{c.headline}</p>
                      </div>
                    </div>
                    <Link
                      href={`/creators/${c.id}`}
                      className="text-xs text-indigo-400 hover:underline font-semibold"
                    >
                      Profile →
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center">
              No creators on shortlist yet.{' '}
              <Link href="/discover" className="text-indigo-400 underline">
                Browse discovery
              </Link>{' '}
              to save your favorite AI talent.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

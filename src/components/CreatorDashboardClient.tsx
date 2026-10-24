// 'use client'
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getCreatorById, getInvitations } from '@/lib/store';
import VerificationBadge from '@/components/VerificationBadge';
import AIVideoGenerator from '@/components/AIVideoGenerator';
import {
  Layers,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Video,
  AlertCircle,
  Scale,
  Wrench,
  FileCheck,
} from 'lucide-react';

export default function CreatorDashboardClient() {
  const { user } = useAuth();
  const creatorId = user?.role === 'creator' ? user.id : 'c1111111-1111-4111-8111-111111111111';
  const creator =
    getCreatorById(creatorId) || getCreatorById('c1111111-1111-4111-8111-111111111111')!;

  const [activeTab, setActiveTab] = useState<'overview' | 'ai_studio'>('overview');

  const invitations = getInvitations({ creatorId: creator.id });
  const pendingInvitations = invitations.filter((i) => i.status === 'invited');
  const inProductionProjects = invitations.filter(
    (i) => i.status === 'in_production' || i.status === 'accepted'
  );
  const deliveredProjects = invitations.filter((i) => i.status === 'delivered');
  const revisionProjects = invitations.filter((i) => i.status === 'revision_requested');
  const approvedProjects = invitations.filter((i) => i.status === 'approved');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-violet-500/40 shrink-0">
              <img src={creator.avatar_url} alt={creator.display_name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {creator.display_name}
                </h1>
                <VerificationBadge level={creator.verification_level} size="sm" />
              </div>
              <p className="text-xs text-violet-300 mt-0.5">{creator.headline}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Availability: <strong className="text-white capitalize">{creator.availability}</strong>
                </span>
                <span>•</span>
                <span>
                  Turnaround: <strong className="text-slate-200">{creator.turnaround_time}</strong>
                </span>
                <span>•</span>
                <span>
                  Starting Rate: <strong className="text-white">${creator.starting_rate}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/creator/profile"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile & Skills</span>
            </Link>
            <Link
              href="/creator/portfolio"
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs text-white font-bold shadow-lg shadow-violet-600/30 flex items-center gap-1.5 transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Manage Portfolio ({creator.portfolio_items?.length || 0})</span>
            </Link>
          </div>
        </div>

        {/* Action Alerts: Revisions or Deliveries needing creator action */}
        {revisionProjects.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Action Required: Revision Requested on {revisionProjects.length} Project(s)
                </span>
                <span className="text-[11px] text-rose-200">
                  A brand has requested changes on your delivery. Please review the revision notes and submit updated generative assets.
                </span>
              </div>
            </div>
            <Link
              href="/creator/invitations"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 shadow-md shadow-rose-600/30"
            >
              View Revision Notes
            </Link>
          </div>
        )}

        {/* Production Workflow Tracker */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                Production Workflow Tracker
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track creative projects through each stage of execution, delivery, and commercial sign-off.
              </p>
            </div>
            <Link href="/creator/invitations" className="text-xs text-violet-400 hover:underline font-semibold">
              Manage Project Pipeline →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-medium">1. Invitations</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">{pendingInvitations.length}</div>
              <span className="text-[10px] text-slate-500 mt-1">Awaiting your response</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-medium">2. In Production</span>
              <div className="text-xl font-bold text-indigo-400 mt-1">{inProductionProjects.length}</div>
              <span className="text-[10px] text-slate-500 mt-1">Generating deliverables</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-medium">3. Delivered</span>
              <div className="text-xl font-bold text-cyan-400 mt-1">{deliveredProjects.length}</div>
              <span className="text-[10px] text-slate-500 mt-1">Brand reviewing</span>
            </div>
            <div
              className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                revisionProjects.length > 0 ? 'bg-rose-950/30 border-rose-500/40' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <span className="text-[11px] text-slate-400 font-medium">4. Revisions</span>
              <div className="text-xl font-bold text-rose-400 mt-1">{revisionProjects.length}</div>
              <span className="text-[11px] text-slate-400 mt-1">Feedback received</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 font-medium">5. Approved</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">{approvedProjects.length}</div>
              <span className="text-[10px] text-slate-500 mt-1">Commercial rights cleared</span>
            </div>
          </div>
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI Tools */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                Licensed AI Tools
              </span>
              <Link href="/creator/profile" className="text-[10px] text-indigo-400 hover:underline">
                Edit
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(creator.tools || []).map((tool) => (
                <span
                  key={tool}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-indigo-300 font-medium border border-slate-700/60"
                >
                  {tool}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Commercial licenses certified for model generation.
            </p>
          </div>
          {/* Specializations */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                Specializations & Skills
              </span>
              <Link href="/creator/profile" className="text-[10px] text-violet-400 hover:underline">
                Edit
              </Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {creator.specializations.map((spec) => (
                <span
                  key={spec}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-violet-300 font-medium border border-slate-700/60"
                >
                  {spec}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Targeted creative categories for brand matching.
            </p>
          </div>
          {/* Commercial Terms */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                Commercial Terms & Rate
              </span>
              <Link href="/creator/profile" className="text-[10px] text-emerald-400 hover:underline">
                Edit
              </Link>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Starting Project Rate:</span>
                <strong className="text-white font-bold">${creator.starting_rate}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Turnaround Standard:</span>
                <strong className="text-slate-200">{creator.turnaround_time}</strong>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Commercial License:</span>
                <strong className="text-emerald-400 font-medium">100% Full Buyout Ready</strong>
              </div>
            </div>
          </div>
        </div>

        {/* AI Video Generator Studio */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-violet-400" />
                AI Video & Content Generation Studio
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Direct provider integration with Runway Gen-3 Alpha, Luma Ray 2, and Replicate Kling. Generate deliverables and save directly to your portfolio.
              </p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <AIVideoGenerator />
          </div>
        </div>

        {/* Incoming Invitations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Incoming Campaign Invitations & Bids
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Brands have invited you based on your model skills, turnaround, and pricing.
              </p>
            </div>
            <Link href="/creator/invitations" className="text-xs text-indigo-400 hover:underline font-semibold">
              View All ({invitations.length}) →
            </Link>
          </div>
          {invitations.length > 0 ? (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
              <div className="divide-y divide-slate-800">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {inv.brief?.title || 'Generative Campaign Brief'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                            inv.status === 'accepted' || inv.status === 'in_production'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : inv.status === 'delivered'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : inv.status === 'revision_requested'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : inv.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {inv.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Brand: <strong className="text-slate-300">{inv.brief?.brand_name || 'Brand Partner'}</strong> • Budget: <strong className="text-white">${inv.brief?.budget_min} - ${inv.brief?.budget_max}</strong> • Commercial Rights: <strong className="text-slate-200 capitalize">
                          {inv.brief?.intended_usage_rights ? inv.brief.intended_usage_rights.replace('_', ' ') : 'Full Buyout'}
                        </strong>
                      </p>
                      {inv.message && (
                        <p className="text-xs text-slate-300 italic">“{inv.message}”</p>
                      )}
                    </div>
                    <Link
                      href="/creator/invitations"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs font-semibold shrink-0"
                    >
                      Open Project Workflow →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              No campaign invitations received yet. Keep your portfolio and tools up to date to increase discoverability!
            </div>
          )}
        </div>

        {/* Verification & Rights */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Creator Verification & Commercial Rights Compliance</h3>
              <p className="text-[11px] text-slate-400">
                Your verified credentials protect you and ensure brand clients trust your deliverable licensing.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold">
                <VerificationBadge level={creator.verification_level} size="sm" />
                <span>Verification Level {creator.verification_level}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Identity, email confirmation, and AI tool subscription accounts have been verified by CreatorConnect AI.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Commercial Indemnity Guard</span>
              </div>
              <p className="text-[11px] text-slate-400">
                All client deliverables are backed by platform-registered prompt and seed generation records for complete copyright transparency.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <FileCheck className="w-4 h-4" />
                <span>Profile Completeness: {creator.profile_completeness}%</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Keep adding generative video samples to maintain highest visibility in brand match results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

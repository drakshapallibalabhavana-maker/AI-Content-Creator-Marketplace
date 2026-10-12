'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getCreatorById, getInvitations } from '@/lib/store';
import VerificationBadge from '@/components/VerificationBadge';
import {
  User,
  Layers,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Edit3,
} from 'lucide-react';

export default function CreatorDashboardPage() {
  const { user } = useAuth();
  const creatorId = user?.role === 'creator' ? user.id : 'c1111111-1111-4111-8111-111111111111';
  const creator = getCreatorById(creatorId) || getCreatorById('c1111111-1111-4111-8111-111111111111')!;

  const invitations = getInvitations({ creatorId: creator.id });
  const pendingInvitations = invitations.filter((i) => i.status === 'invited');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-violet-500/40">
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
              <span className="text-[11px] text-slate-400 capitalize">Availability: {creator.availability}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/creator/profile"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
            <Link
              href="/creator/portfolio"
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs text-white font-bold shadow-lg shadow-violet-600/30 flex items-center gap-1.5 transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Manage Portfolio</span>
            </Link>
          </div>
        </div>

        {/* Completeness Checklist & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Completeness score card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Completeness Meter
              </span>
              <div className="text-3xl font-extrabold text-indigo-400">{creator.profile_completeness}%</div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${creator.profile_completeness}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">Calculated from saved portfolio & tool specs</span>
          </div>

          {/* Pending Invitations card */}
          <Link
            href="/creator/invitations"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Pending Invitations
              </span>
              <div className="text-3xl font-extrabold text-emerald-400">{pendingInvitations.length}</div>
            </div>
            <span className="text-[11px] text-emerald-400 mt-2 block group-hover:translate-x-0.5 transition-transform">
              Review and accept briefs →
            </span>
          </Link>

          {/* Portfolio count */}
          <Link
            href="/creator/portfolio"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Portfolio Deliverables
              </span>
              <div className="text-3xl font-extrabold text-white">{creator.portfolio_items?.length || 0}</div>
            </div>
            <span className="text-[11px] text-violet-400 mt-2 block group-hover:translate-x-0.5 transition-transform">
              Upload AI generation →
            </span>
          </Link>

          {/* Starting rate */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Project Starting Rate
              </span>
              <div className="text-3xl font-extrabold text-white">${creator.starting_rate}</div>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">Turnaround: {creator.turnaround_time}</span>
          </div>
        </div>

        {/* Profile Completeness Checklist Checklist */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Verification & Onboarding Checklist
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 p-3 rounded-xl bg-slate-950 border border-slate-850">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Basic Bio & Contact Info</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 p-3 rounded-xl bg-slate-950 border border-slate-850">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Production Skills & Specializations</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 p-3 rounded-xl bg-slate-950 border border-slate-850">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>AI Tools & Engines Tagged</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 p-3 rounded-xl bg-slate-950 border border-slate-850">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>At least 1 Documented Portfolio Work</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 p-3 rounded-xl bg-slate-950 border border-slate-850">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Commercial Clearance Stance Specified</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 p-3 rounded-xl bg-slate-950 border border-slate-850">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Subscription Proof Verification Ready</span>
            </div>
          </div>
        </div>

        {/* Incoming Invitations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Received Campaign Invitations</h2>
            <Link href="/creator/invitations" className="text-xs text-indigo-400 hover:underline">
              View all invitations ({invitations.length})
            </Link>
          </div>

          {invitations.length > 0 ? (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="divide-y divide-slate-800">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {inv.brief?.title || 'Creative Campaign Invitation'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                            inv.status === 'accepted'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : inv.status === 'declined'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        From <strong className="text-slate-300">{inv.brief?.brand_name || 'Brand'}</strong> • Budget:{' '}
                        <strong className="text-white">${inv.brief?.budget_min} - ${inv.brief?.budget_max}</strong>
                      </p>
                      {inv.message && <p className="text-xs text-slate-300 italic">"{inv.message}"</p>}
                    </div>

                    <Link
                      href="/creator/invitations"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs font-semibold"
                    >
                      Respond to Invite →
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
      </div>
    </div>
  );
}

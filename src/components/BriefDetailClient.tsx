'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreativeBrief, CreatorProfile } from '@/types';
import { getMatchingCreatorsForBrief, closeBrief, createInvitation, getInvitations } from '@/lib/store';
import VerificationBadge from './VerificationBadge';
import { useAuth } from '@/lib/auth-context';
import {
  FileText,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Cpu,
  Mail,
  UserCheck,
  Share2,
  Lock,
  ArrowRight,
  Bookmark,
  Check,
} from 'lucide-react';

interface Props {
  brief: CreativeBrief;
}

export default function BriefDetailClient({ brief: initialBrief }: Props) {
  const { user, role } = useAuth();
  const [brief, setBrief] = useState<CreativeBrief>(initialBrief);
  const [invitedCreators, setInvitedCreators] = useState<Record<string, boolean>>({});
  const [actionSuccess, setActionSuccess] = useState('');

  // Calculate matching creators using deterministic ranking engine
  const matches = getMatchingCreatorsForBrief(brief);

  const isOwner = user?.role === 'brand' && (user.id === brief.brand_id || brief.brand_id.startsWith('brand-'));

  const handleCloseBrief = () => {
    if (confirm('Are you sure you want to close this campaign brief? No further invitations or bids can be accepted.')) {
      const closed = closeBrief(brief.id);
      setBrief(closed);
      setActionSuccess('Brief has been officially closed.');
    }
  };

  const handleInviteCreator = (creatorId: string) => {
    try {
      createInvitation(brief.id, creatorId, brief.brand_id, `Invited via automated match for ${brief.title}`);
      setInvitedCreators((prev) => ({ ...prev, [creatorId]: true }));
      setActionSuccess('Creator invited successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (e: any) {
      alert(e.message || 'Error sending invite');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <Link
          href="/briefs"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          ← Back to Published Briefs
        </Link>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
              brief.status === 'published'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : brief.status === 'draft'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {brief.status}
          </span>

          {isOwner && brief.status === 'published' && (
            <button
              onClick={handleCloseBrief}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              Close Brief
            </button>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Brief Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{brief.brand_name}</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">{brief.title}</h1>
          <p className="text-xs text-slate-400 mt-1">Campaign Goal: {brief.campaign_goal}</p>
        </div>

        {/* Deliverable Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-850 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Format / Ratio</span>
            <strong className="text-white text-sm">{brief.aspect_ratio} ({brief.resolution || '4K'})</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Deliverables</span>
            <strong className="text-white text-sm">{brief.deliverables_count} asset(s)</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Budget Range</span>
            <strong className="text-white text-sm">${brief.budget_min.toLocaleString()} - ${brief.budget_max.toLocaleString()}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Submission Deadline</span>
            <strong className="text-white text-sm">{new Date(brief.deadline).toLocaleDateString()}</strong>
          </div>
        </div>

        {/* Campaign Description & Creative Direction */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Project Overview</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{brief.description}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Target Audience</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{brief.target_audience}</p>
          </div>

          {brief.creative_direction && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Creative Direction</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-950 p-3 rounded-xl border border-slate-850">
                {brief.creative_direction}
              </p>
            </div>
          )}
        </div>

        {/* Styles & Platforms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">Creative Styles</span>
            <div className="flex flex-wrap gap-1.5">
              {brief.styles.map((style) => (
                <span
                  key={style}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium"
                >
                  {style}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">Intended Distribution Platforms</span>
            <div className="flex flex-wrap gap-1.5">
              {brief.intended_platforms.map((plat) => (
                <span
                  key={plat}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium"
                >
                  {plat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mandatory Commercial-Use Terms Box */}
        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Mandatory Commercial Rights & Licensing Requirements</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Intended Usage Rights</span>
              <strong className="text-slate-200 capitalize">{brief.intended_usage_rights.replace('_', ' ')}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Geographic Territory</span>
              <strong className="text-slate-200">{brief.territory}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">License Duration & Exclusivity</span>
              <strong className="text-slate-200">{brief.license_duration} • {brief.exclusivity}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-900/40 text-xs space-y-1.5 text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Model & Training Data Disclosure Required:{' '}
                <strong className="text-white">{brief.disclose_model_licensing ? 'Yes' : 'No'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Proof of Commercial Tool Subscription Required:{' '}
                <strong className="text-white">{brief.proof_of_tool_license_required ? 'Yes' : 'No'}</strong>
              </span>
            </div>
            {brief.licensing_restrictions && (
              <p className="text-slate-400 mt-2 text-[11px] leading-relaxed">
                Restrictions: {brief.licensing_restrictions}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Creator Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">
                Suggested Compatible AI Creators
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked using deterministic overlap: AI tool proficiency, style compatibility, and commercial stance.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-indigo-300 border border-slate-800 font-semibold">
            {matches.length} Recommended
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map(({ creator, matchScore, matchReasons }) => {
            const isInvited = invitedCreators[creator.id];
            return (
              <div
                key={creator.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                        <img src={creator.avatar_url} alt={creator.display_name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link href={`/creators/${creator.id}`} className="font-bold text-white hover:text-indigo-400 text-sm">
                          {creator.display_name}
                        </Link>
                        <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{creator.headline}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                        {matchScore}% Match
                      </span>
                    </div>
                  </div>

                  {/* Match Reasons Checklist */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 text-[11px] space-y-1">
                    <span className="font-semibold text-slate-400 block mb-1">Match Overlap Reasons:</span>
                    {matchReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tools preview */}
                  <div className="flex flex-wrap gap-1">
                    {creator.tools.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-750">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action: Invite or view profile */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-semibold">
                    ${creator.starting_rate} <span className="text-slate-500 text-[10px]">starting</span>
                  </span>

                  <div className="flex gap-2">
                    <Link
                      href={`/creators/${creator.id}`}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                    >
                      Profile
                    </Link>

                    {brief.status === 'published' && (
                      <button
                        onClick={() => handleInviteCreator(creator.id)}
                        disabled={isInvited}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          isInvited
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        }`}
                      >
                        {isInvited ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Invited</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5" />
                            <span>Invite</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

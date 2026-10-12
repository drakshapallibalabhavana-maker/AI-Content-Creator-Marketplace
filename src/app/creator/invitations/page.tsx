'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getInvitations, updateInvitationStatus } from '@/lib/store';
import {
  Mail,
  CheckCircle2,
  XCircle,
  ExternalLink,
  DollarSign,
  Calendar,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';

export default function CreatorInvitationsPage() {
  const { user } = useAuth();
  const creatorId = user?.role === 'creator' ? user.id : 'c1111111-1111-4111-8111-111111111111';
  const [invitations, setInvitations] = useState(getInvitations({ creatorId }));
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleResponse = (invitationId: string, status: 'accepted' | 'declined') => {
    updateInvitationStatus(invitationId, status);
    setInvitations(getInvitations({ creatorId }));
    setFeedbackMessage(`Invitation has been marked as ${status}.`);
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
              <Mail className="w-3.5 h-3.5" />
              <span>Direct Client Invitations</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Campaign Invitations
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review direct invites sent by brands interested in your style, tools, and commercial licensing terms.
            </p>
          </div>
        </div>

        {feedbackMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {invitations.length > 0 ? (
          <div className="space-y-4">
            {invitations.map((inv) => {
              const b = inv.brief;

              const statusBadge = {
                accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                declined: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                invited: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
              }[inv.status];

              return (
                <div
                  key={inv.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                        {b?.brand_name || 'Brand Invitation'}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-0.5">
                        {b ? (
                          <Link href={`/briefs/${b.id}`} className="hover:text-indigo-400 flex items-center gap-1.5">
                            <span>{b.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          </Link>
                        ) : (
                          <span>Campaign Brief</span>
                        )}
                      </h3>
                      {inv.message && (
                        <p className="text-xs text-slate-300 italic mt-2 bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                          "{inv.message}"
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border self-start ${statusBadge}`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  {b && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-850 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Budget</span>
                        <strong>${b.budget_min.toLocaleString()} - ${b.budget_max.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Format</span>
                        <strong>{b.content_type} ({b.aspect_ratio})</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Usage Rights</span>
                        <strong className="capitalize">{b.intended_usage_rights.replace('_', ' ')}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Deadline</span>
                        <strong>{new Date(b.deadline).toLocaleDateString()}</strong>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Received on {new Date(inv.created_at).toLocaleDateString()}
                      {inv.responded_at && ` • Responded on ${new Date(inv.responded_at).toLocaleDateString()}`}
                    </span>

                    {inv.status === 'invited' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResponse(inv.id, 'declined')}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-rose-300 border border-slate-700 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>

                        <button
                          onClick={() => handleResponse(inv.id, 'accepted')}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Invitation</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400 space-y-3">
            <Mail className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No invitations received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

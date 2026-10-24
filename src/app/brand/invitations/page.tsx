'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getInvitations, updateProjectWorkflowStatus } from '@/lib/store';
import { ProjectStatus, InvitationItem } from '@/types';
import {
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Play,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function BrandInvitationsPage() {
  const { user } = useAuth();
  const brandId = user?.id || 'brand-nike-demo';
  const [invitations, setInvitations] = useState<InvitationItem[]>(() =>
    getInvitations({ brandId })
  );
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Revision modal state
  const [revisionModalId, setRevisionModalId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const refreshInvitations = () => {
    setInvitations(getInvitations({ brandId }));
  };

  const handleBrandTransition = async (
    projectId: string,
    targetStatus: ProjectStatus,
    notes?: string
  ) => {
    setErrorMessage('');
    setFeedbackMessage('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          targetStatus,
          userId: user?.id || brandId,
          userRole: 'brand',
          revisionNotes: notes,
          note: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update project status.');
      }

      updateProjectWorkflowStatus({
        projectId,
        targetStatus,
        userId: user?.id || brandId,
        userRole: 'brand',
        revisionNotes: notes,
        note: notes,
      });

      refreshInvitations();
      setRevisionModalId(null);
      setRevisionNotes('');
      setFeedbackMessage(`Project successfully updated to: ${targetStatus.toUpperCase()}`);
      setTimeout(() => setFeedbackMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error executing project action');
    }
  };

  const statusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'invited':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'accepted':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'in_production':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'delivered':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'revision_requested':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'declined':
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
              <Mail className="w-3.5 h-3.5" />
              <span>Project Invitations & Production Workflow</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Campaign Invitations & Projects
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review creator collaborations, inspect delivered generative assets, request revisions, and issue commercial approvals.
            </p>
          </div>
        </div>

        {feedbackMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {invitations.length > 0 ? (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-4 font-semibold">Creator</th>
                    <th className="py-4 px-4 font-semibold">Campaign Brief</th>
                    <th className="py-4 px-4 font-semibold">Workflow Status</th>
                    <th className="py-4 px-4 font-semibold">Deliverable Asset</th>
                    <th className="py-4 px-4 font-semibold text-right">Review Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {invitations.map((inv) => {
                    const c = inv.creator;
                    const b = inv.brief;

                    return (
                      <React.Fragment key={inv.id}>
                        <tr className="hover:bg-slate-850/40 transition-colors">
                          <td className="py-4 px-4">
                            {c ? (
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                                  <img
                                    src={c.avatar_url}
                                    alt={c.display_name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <Link
                                    href={`/creators/${c.id}`}
                                    className="font-bold text-white hover:text-indigo-400"
                                  >
                                    {c.display_name}
                                  </Link>
                                  <p className="text-[10px] text-slate-400">{c.location}</p>
                                </div>
                              </div>
                            ) : (
                              <span>Unknown Creator</span>
                            )}
                          </td>

                          <td className="py-4 px-4 font-medium text-white">
                            {b ? (
                              <Link
                                href={`/briefs/${b.id}`}
                                className="hover:text-cyan-400 flex items-center gap-1"
                              >
                                <span>{b.title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                              </Link>
                            ) : (
                              <span>Brief Archived</span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge(
                                inv.status
                              )}`}
                            >
                              {inv.status.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            {inv.deliverable_url ? (
                              <div className="flex items-center gap-2">
                                <a
                                  href={inv.deliverable_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 flex items-center gap-1 font-semibold text-[11px]"
                                >
                                  <Play className="w-3 h-3" />
                                  <span>View Media</span>
                                </a>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px]">—</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {inv.status === 'delivered' && (
                                <>
                                  <button
                                    onClick={() => setRevisionModalId(inv.id)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-orange-400 border border-slate-700 text-xs font-semibold flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Request Revision</span>
                                  </button>

                                  <button
                                    onClick={() => handleBrandTransition(inv.id, 'approved')}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Approve Deliverable</span>
                                  </button>
                                </>
                              )}

                              {inv.status === 'approved' && (
                                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Approved</span>
                                </span>
                              )}

                              {(inv.status === 'invited' || inv.status === 'accepted') && (
                                <button
                                  onClick={() => handleBrandTransition(inv.id, 'cancelled', 'Cancelled by brand')}
                                  className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-rose-400 text-xs"
                                >
                                  Cancel Invite
                                </button>
                              )}

                              {inv.history && inv.history.length > 0 && (
                                <button
                                  onClick={() =>
                                    setActiveHistoryId(activeHistoryId === inv.id ? null : inv.id)
                                  }
                                  className="p-1.5 text-slate-400 hover:text-white rounded-lg ml-1"
                                  title="View Workflow Audit Log"
                                >
                                  {activeHistoryId === inv.id ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expandable History Row */}
                        {activeHistoryId === inv.id && inv.history && (
                          <tr className="bg-slate-950/60">
                            <td colSpan={5} className="py-3 px-6">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                  Workflow Audit Trail:
                                </span>
                                {inv.history.map((h, i) => (
                                  <div key={i} className="text-[11px] text-slate-300 flex items-center gap-3">
                                    <span className="font-semibold text-white">
                                      {h.from_status} → {h.to_status}
                                    </span>
                                    <span className="text-slate-500">
                                      {new Date(h.timestamp).toLocaleString()} ({h.user_role})
                                    </span>
                                    {h.notes && <span className="italic text-slate-400">"{h.notes}"</span>}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400 space-y-3">
            <p>No project invitations sent yet.</p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-1 text-indigo-400 font-semibold underline"
            >
              <span>Explore AI Creators in Discovery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Revision Feedback Modal */}
        {revisionModalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-orange-400" />
                <span>Request Creative Revision</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide specific guidance on lighting, camera motion, artifact cleanup, or style adjustments for the creator.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Revision Feedback *
                </label>
                <textarea
                  rows={4}
                  required
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="e.g. Please reduce the camera shake in the first 3 seconds and ensure consistent brand logo rendering on the packaging."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevisionModalId(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!revisionNotes.trim()}
                  onClick={() => handleBrandTransition(revisionModalId, 'revision_requested', revisionNotes)}
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs text-white font-bold"
                >
                  Send Revision Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  ExternalLink,
  DollarSign,
  Calendar,
  ShieldCheck,
  Check,
  X,
  Play,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Send,
  AlertCircle,
} from 'lucide-react';

export default function CreatorInvitationsPage() {
  const { user } = useAuth();
  const creatorId = user?.role === 'creator' ? user.id : 'c1111111-1111-4111-8111-111111111111';
  const [invitations, setInvitations] = useState<InvitationItem[]>(() =>
    getInvitations({ creatorId })
  );
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Deliverable submission state
  const [submittingProjectId, setSubmittingProjectId] = useState<string | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState('/videos/cyberpunk-pulse.mp4');
  const [deliverableNotes, setDeliverableNotes] = useState('');

  const refreshInvitations = () => {
    setInvitations(getInvitations({ creatorId }));
  };

  const handleWorkflowTransition = async (
    projectId: string,
    targetStatus: ProjectStatus,
    extra?: { deliverableUrl?: string; deliverableNotes?: string }
  ) => {
    setErrorMessage('');
    setFeedbackMessage('');

    try {
      // 1. Send update to server endpoint for validation
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          targetStatus,
          userId: user?.id || creatorId,
          userRole: 'creator',
          deliverableUrl: extra?.deliverableUrl,
          deliverableNotes: extra?.deliverableNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update project status.');
      }

      // 2. Sync local store
      updateProjectWorkflowStatus({
        projectId,
        targetStatus,
        userId: user?.id || creatorId,
        userRole: 'creator',
        deliverableUrl: extra?.deliverableUrl,
        deliverableNotes: extra?.deliverableNotes,
      });

      refreshInvitations();
      setSubmittingProjectId(null);
      setFeedbackMessage(`Project workflow status transitioned to: ${targetStatus.toUpperCase()}`);
      setTimeout(() => setFeedbackMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating workflow status');
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
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-semibold mb-2">
              <Mail className="w-3.5 h-3.5" />
              <span>Commercial Project Workflow</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Campaign Invitations & Projects
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Track your commercial campaigns from invitation through production, deliverable submissions, and client approvals.
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
          <div className="space-y-6">
            {invitations.map((inv) => {
              const b = inv.brief;

              return (
                <div
                  key={inv.id}
                  className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 space-y-5 shadow-2xl transition-all"
                >
                  {/* Top Bar */}
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

                    <div className="flex items-center gap-2 self-start">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusBadge(
                          inv.status
                        )}`}
                      >
                        {inv.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Campaign Specs Overview */}
                  {b && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-850 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Budget</span>
                        <strong className="text-white">${b.budget_min.toLocaleString()} – ${b.budget_max.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Format & Ratio</span>
                        <strong className="text-white">{b.content_type} ({b.aspect_ratio})</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Commercial Rights</span>
                        <strong className="capitalize text-emerald-400">{b.intended_usage_rights.replace('_', ' ')}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Deadline</span>
                        <strong className="text-white">{new Date(b.deadline).toLocaleDateString()}</strong>
                      </div>
                    </div>
                  )}

                  {/* Revision Feedback Banner if Revision Requested */}
                  {inv.status === 'revision_requested' && inv.revision_notes && (
                    <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-orange-400">
                        <RotateCcw className="w-4 h-4" />
                        <span>Client Revision Request:</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-line">{inv.revision_notes}</p>
                    </div>
                  )}

                  {/* Deliverable Submitted Display */}
                  {(inv.status === 'delivered' || inv.status === 'approved') && inv.deliverable_url && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                        Submitted Deliverable Preview
                      </span>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="truncate text-slate-300">{inv.deliverable_url}</span>
                        <a
                          href={inv.deliverable_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 flex items-center gap-1 font-semibold flex-shrink-0"
                        >
                          <Play className="w-3 h-3" />
                          <span>View Media</span>
                        </a>
                      </div>
                      {inv.deliverable_notes && (
                        <p className="text-[11px] text-slate-400 mt-1 italic">{inv.deliverable_notes}</p>
                      )}
                    </div>
                  )}

                  {/* Submission Form Drawer for In Production or Revision Requested */}
                  {submittingProjectId === inv.id && (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-violet-500/40 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-violet-400" />
                        <span>Submit Production Deliverable</span>
                      </h4>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Media Deliverable URL *
                        </label>
                        <input
                          type="text"
                          required
                          value={deliverableUrl}
                          onChange={(e) => setDeliverableUrl(e.target.value)}
                          placeholder="/videos/cyberpunk-pulse.mp4 or https://..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Workflow & Generation Notes
                        </label>
                        <textarea
                          rows={2}
                          value={deliverableNotes}
                          onChange={(e) => setDeliverableNotes(e.target.value)}
                          placeholder="e.g. Rendered with Runway Gen-3 Alpha, 4K Topaz upscale, DaVinci color grading."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSubmittingProjectId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleWorkflowTransition(inv.id, 'delivered', {
                              deliverableUrl,
                              deliverableNotes,
                            })
                          }
                          className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs text-white font-bold shadow-md shadow-violet-600/30 flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch Deliverable</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar per Status */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">
                        Received on {new Date(inv.created_at).toLocaleDateString()}
                      </span>
                      {inv.history && inv.history.length > 0 && (
                        <button
                          onClick={() =>
                            setActiveHistoryId(activeHistoryId === inv.id ? null : inv.id)
                          }
                          className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>Workflow History ({inv.history.length})</span>
                          {activeHistoryId === inv.id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* State 1: Invited */}
                      {inv.status === 'invited' && (
                        <>
                          <button
                            onClick={() => handleWorkflowTransition(inv.id, 'declined')}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-rose-300 border border-slate-700 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>

                          <button
                            onClick={() => handleWorkflowTransition(inv.id, 'accepted')}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept Invitation</span>
                          </button>
                        </>
                      )}

                      {/* State 2: Accepted */}
                      {inv.status === 'accepted' && (
                        <button
                          onClick={() => handleWorkflowTransition(inv.id, 'in_production')}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Start Production</span>
                        </button>
                      )}

                      {/* State 3: In Production or Revision Requested */}
                      {(inv.status === 'in_production' || inv.status === 'revision_requested') &&
                        submittingProjectId !== inv.id && (
                          <button
                            onClick={() => {
                              setSubmittingProjectId(inv.id);
                              setDeliverableUrl('/videos/cyberpunk-pulse.mp4');
                            }}
                            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Submit Deliverable</span>
                          </button>
                        )}

                      {/* State 4: Delivered */}
                      {inv.status === 'delivered' && (
                        <span className="text-[11px] text-purple-300 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>Under Client Review</span>
                        </span>
                      )}

                      {/* State 5: Approved */}
                      {inv.status === 'approved' && (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Approved & Commercial Clearance Cleared</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Collapsible Workflow History Audit */}
                  {activeHistoryId === inv.id && inv.history && (
                    <div className="pt-4 border-t border-slate-800 space-y-2">
                      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Audit Trail & Status Transitions
                      </h5>
                      <div className="space-y-1.5">
                        {inv.history.map((rec, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between text-slate-300"
                          >
                            <div className="flex items-center gap-2">
                              <span className="capitalize font-bold text-white">
                                {rec.from_status} → {rec.to_status}
                              </span>
                              <span className="text-slate-500 text-[10px]">({rec.user_role})</span>
                              {rec.notes && <span className="text-slate-400 italic">"{rec.notes}"</span>}
                            </div>
                            <span className="text-slate-500 text-[10px]">
                              {new Date(rec.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

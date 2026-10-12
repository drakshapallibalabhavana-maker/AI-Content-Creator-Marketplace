'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getInvitations } from '@/lib/store';
import {
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function BrandInvitationsPage() {
  const { user } = useAuth();
  const brandId = user?.id || 'brand-nike-demo';
  const invitations = getInvitations({ brandId });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
              <Mail className="w-3.5 h-3.5" />
              <span>Project Invitations Ledger</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Campaign Invitations
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Track creator invitation statuses, responses, and treatments for your active campaigns.
            </p>
          </div>
        </div>

        {invitations.length > 0 ? (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Creator</th>
                    <th className="py-3.5 px-4 font-semibold">Campaign Brief</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Sent Timestamp</th>
                    <th className="py-3.5 px-4 font-semibold">Responded</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {invitations.map((inv) => {
                    const c = inv.creator;
                    const b = inv.brief;

                    const statusBadge = {
                      accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                      declined: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                      invited: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    }[inv.status];

                    return (
                      <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4">
                          {c ? (
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800">
                                <img src={c.avatar_url} alt={c.display_name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <Link href={`/creators/${c.id}`} className="font-bold text-white hover:text-indigo-400">
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
                            <Link href={`/briefs/${b.id}`} className="hover:text-cyan-400 flex items-center gap-1">
                              <span>{b.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </Link>
                          ) : (
                            <span>Brief Archived</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${statusBadge}`}
                          >
                            {inv.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-400">
                          {new Date(inv.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-4 text-slate-400">
                          {inv.responded_at ? new Date(inv.responded_at).toLocaleDateString() : 'Awaiting response'}
                        </td>

                        <td className="py-4 px-4 text-right">
                          {c && (
                            <Link
                              href={`/creators/${c.id}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold"
                            >
                              Creator Profile
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400 space-y-3">
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
      </div>
    </div>
  );
}

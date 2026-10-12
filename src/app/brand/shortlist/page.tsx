'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getShortlists, removeFromShortlist, getAllBriefs, createInvitation } from '@/lib/store';
import VerificationBadge from '@/components/VerificationBadge';
import {
  Bookmark,
  Trash2,
  Mail,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

export default function BrandShortlistPage() {
  const { user } = useAuth();
  const brandId = user?.id || 'brand-nike-demo';

  const [items, setItems] = useState(getShortlists(brandId));
  const [selectedBriefId, setSelectedBriefId] = useState('');
  const [inviteModalCreatorId, setInviteModalCreatorId] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState('');

  const publishedBriefs = getAllBriefs().filter((b) => b.status === 'published');

  const handleRemove = (creatorId: string) => {
    removeFromShortlist(brandId, creatorId);
    setItems(getShortlists(brandId));
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteModalCreatorId || !selectedBriefId) return;

    try {
      createInvitation(selectedBriefId, inviteModalCreatorId, brandId, 'Invited from saved shortlist.');
      setInviteSuccess('Invitation sent successfully!');
      setTimeout(() => {
        setInviteSuccess('');
        setInviteModalCreatorId(null);
      }, 2000);
    } catch (e: any) {
      alert(e.message || 'Error sending invite');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-2">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Project Shortlist</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Saved AI Creators
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Curated talent bookmarked for your upcoming creative campaigns and spec productions.
            </p>
          </div>

          <Link
            href="/discover"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-slate-800 transition-colors flex items-center gap-2"
          >
            <span>Discover More Creators</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const c = item.creator;
              if (!c) return null;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                          <img src={c.avatar_url} alt={c.display_name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link href={`/creators/${c.id}`} className="font-bold text-white text-base hover:text-indigo-400">
                              {c.display_name}
                            </Link>
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">{c.headline}</p>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {c.location}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemove(c.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Remove from shortlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <VerificationBadge level={c.verification_level} size="sm" />

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.tools.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-750">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                      Rate: <strong className="text-white">${c.starting_rate}</strong> • Turnaround:{' '}
                      <strong className="text-white">{c.turnaround_time}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex gap-2">
                    <Link
                      href={`/creators/${c.id}`}
                      className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold text-center transition-colors"
                    >
                      View Portfolio
                    </Link>

                    <button
                      onClick={() => setInviteModalCreatorId(c.id)}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Invite</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Your Shortlist is Empty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When exploring creators in Discovery, click the bookmark icon on any creator card to save them here for easy project comparison.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              <span>Explore AI Creators</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {inviteModalCreatorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Select Campaign Brief</h3>
            {inviteSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{inviteSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Choose Brief:</label>
                  <select
                    value={selectedBriefId}
                    onChange={(e) => setSelectedBriefId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="">-- Select Brief --</option>
                    {publishedBriefs.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} (${b.budget_min} - ${b.budget_max})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalCreatorId(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white"
                  >
                    Send
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

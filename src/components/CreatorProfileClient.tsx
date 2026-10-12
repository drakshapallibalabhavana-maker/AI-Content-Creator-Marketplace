'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreatorProfile, PortfolioItem, CreativeBrief } from '@/types';
import VerificationBadge from './VerificationBadge';
import PortfolioModal from './PortfolioModal';
import { useAuth } from '@/lib/auth-context';
import {
  isShortlisted,
  addToShortlist,
  removeFromShortlist,
  getAllBriefs,
  createInvitation,
} from '@/lib/store';
import {
  Bookmark,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Cpu,
  Sparkles,
  Layers,
  CheckCircle2,
  Share2,
  Calendar,
  AlertCircle,
  FileText,
  Play,
  ArrowRight,
} from 'lucide-react';

interface Props {
  creator: CreatorProfile;
}

export default function CreatorProfileClient({ creator }: Props) {
  const { user, role } = useAuth();
  const brandId = user?.role === 'brand' ? user.id : 'brand-nike-demo';

  const [shortlisted, setShortlisted] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedBriefId, setSelectedBriefId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState('');

  React.useEffect(() => {
    setShortlisted(isShortlisted(brandId, creator.id));
  }, [brandId, creator.id]);

  const handleToggleShortlist = () => {
    if (shortlisted) {
      removeFromShortlist(brandId, creator.id);
      setShortlisted(false);
    } else {
      addToShortlist(brandId, creator.id);
      setShortlisted(true);
    }
  };

  const publishedBriefs = getAllBriefs().filter((b) => b.status === 'published');

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBriefId) {
      setInviteError('Please select a campaign brief');
      return;
    }

    try {
      createInvitation(selectedBriefId, creator.id, brandId, inviteMessage);
      setInviteSuccess(true);
      setInviteError('');
      setTimeout(() => {
        setInviteModalOpen(false);
        setInviteSuccess(false);
      }, 2000);
    } catch (err: any) {
      setInviteError(err.message || 'Failed to send invitation');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Profile Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background gradient decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-800 border-2 border-indigo-500/40 shadow-xl flex-shrink-0">
              <img
                src={creator.avatar_url}
                alt={creator.display_name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {creator.display_name}
                </h1>
                <VerificationBadge level={creator.verification_level} size="md" />
              </div>

              <p className="text-base text-indigo-300 font-medium">{creator.headline}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {creator.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Turnaround: <strong className="text-slate-300">{creator.turnaround_time}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 capitalize">
                  {creator.availability}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleToggleShortlist}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                shortlisted
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${shortlisted ? 'fill-amber-400' : ''}`} />
              <span>{shortlisted ? 'Shortlisted' : 'Save Creator'}</span>
            </button>

            <button
              onClick={() => setInviteModalOpen(true)}
              className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Invite to Brief</span>
            </button>
          </div>
        </div>

        {/* Profile Completeness Meter */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
              {creator.profile_completeness}%
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-300">Profile Completeness Score</span>
              <p className="text-[11px] text-slate-400">
                Verified portfolio manifests, audited tool setup, and explicit licensing stance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">Starting Project Rate:</span>
            <strong className="text-white text-sm">
              ${creator.starting_rate} {creator.currency}
            </strong>
          </div>
        </div>
      </div>

      {/* Grid: Left Column Details, Right Column Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Metadata, Stance, Tools) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Biography */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Biography & Background</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{creator.bio}</p>
          </div>

          {/* Commercial Clearance Stance */}
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Commercial Stance & Clearance</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{creator.commercial_use_stance}</p>
          </div>

          {/* AI Tools & Engines */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>AI Tools & Workflows</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {creator.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-medium"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Production Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {creator.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Specializations</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {creator.specializations.map((spec) => (
                <span
                  key={spec}
                  className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20 text-xs font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Portfolio Showcase */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">AI Portfolio Showcase</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Audited generations featuring workflow manifests, prompt notes, and format specs.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              {creator.portfolio_items?.length || 0} Deliverables
            </span>
          </div>

          {creator.portfolio_items && creator.portfolio_items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {creator.portfolio_items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPortfolioItem(item)}
                  className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 overflow-hidden cursor-pointer shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col"
                >
                  {/* Thumbnail / Media banner */}
                  <div className="relative h-48 bg-black overflow-hidden">
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Centered Play Button for Video Deliverables */}
                    {(item.media_type === 'video' || item.media_type === 'animation') && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="w-12 h-12 rounded-full bg-indigo-600/90 group-hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all border border-indigo-400/40">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end justify-between p-3 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-semibold uppercase tracking-wider border border-slate-700">
                        {item.media_type} ({item.aspect_ratio})
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                          {item.title}
                        </h4>
                        <VerificationBadge level={item.verification_status} size="sm" showLabel={false} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Workflow summary snippet */}
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-850 text-[11px] font-mono text-slate-300 truncate">
                      {item.workflow_summary}
                    </div>

                    {/* Card Footer: Tools & Details trigger */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex gap-1">
                        {item.tools_used.slice(0, 2).map((t) => (
                          <span key={t} className="text-[10px] text-cyan-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span className="text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]">
                        Inspect Workflow & Specs <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
              No portfolio items added yet.
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Item Detail Modal */}
      {selectedPortfolioItem && (
        <PortfolioModal
          item={selectedPortfolioItem}
          creator={creator}
          onClose={() => setSelectedPortfolioItem(null)}
        />
      )}

      {/* Campaign Brief Invitation Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Invite {creator.display_name} to Campaign Brief</h3>
            <p className="text-xs text-slate-400">
              Select one of your active campaign briefs to invite this creator. They will receive the invitation and can review your requirements.
            </p>

            {inviteSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Invitation successfully sent!</span>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                {inviteError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {inviteError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Select Published Campaign Brief:
                  </label>
                  <select
                    value={selectedBriefId}
                    onChange={(e) => setSelectedBriefId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose a Brief --</option>
                    {publishedBriefs.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} (${b.budget_min} - ${b.budget_max})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Personalized Invitation Message:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="We loved your spec ad on liquid dynamics and would love you to submit a treatment..."
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-750"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30"
                  >
                    Send Invitation
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

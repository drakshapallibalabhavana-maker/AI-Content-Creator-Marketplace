'use client';

import React from 'react';
import Link from 'next/link';
import { CreatorProfile, PortfolioItem } from '@/types';
import VerificationBadge from './VerificationBadge';
import {
  Bookmark,
  Sparkles,
  MapPin,
  Clock,
  Play,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { addToShortlist, removeFromShortlist, isShortlisted } from '@/lib/store';

interface Props {
  creator: CreatorProfile;
  onPreviewPortfolio?: (item: PortfolioItem, creator: CreatorProfile) => void;
  onShortlistChange?: () => void;
}

export default function CreatorCard({ creator, onPreviewPortfolio, onShortlistChange }: Props) {
  const { user, role } = useAuth();
  const brandId = user?.role === 'brand' ? user.id : 'brand-nike-demo';
  const [shortlisted, setShortlisted] = React.useState(false);

  React.useEffect(() => {
    setShortlisted(isShortlisted(brandId, creator.id));
  }, [brandId, creator.id]);

  const handleToggleShortlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (shortlisted) {
      removeFromShortlist(brandId, creator.id);
      setShortlisted(false);
    } else {
      addToShortlist(brandId, creator.id);
      setShortlisted(true);
    }
    if (onShortlistChange) onShortlistChange();
  };

  const availabilityColors = {
    available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    busy: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    unavailable: 'bg-slate-800 text-slate-400 border-slate-700',
  }[creator.availability];

  return (
    <div className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10 flex flex-col overflow-hidden">
      {/* Top Banner: Verification & Shortlist Action */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <Link href={`/creators/${creator.id}`} className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-750 group-hover:border-indigo-400 transition-colors">
                <img
                  src={creator.avatar_url}
                  alt={creator.display_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/creators/${creator.id}`}
                  className="text-base font-bold text-white hover:text-indigo-400 transition-colors"
                >
                  {creator.display_name}
                </Link>
                <VerificationBadge level={creator.verification_level} size="sm" showLabel={false} />
              </div>
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{creator.headline}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {creator.location}
                </span>
                <span className={`px-1.5 py-0.2 rounded-full border text-[10px] capitalize ${availabilityColors}`}>
                  {creator.availability}
                </span>
              </div>
            </div>
          </div>

          {/* Shortlist bookmark button */}
          <button
            onClick={handleToggleShortlist}
            className={`p-2 rounded-xl border transition-all ${
              shortlisted
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-750 hover:text-white hover:border-slate-700'
            }`}
            title={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
          >
            <Bookmark className={`w-4 h-4 ${shortlisted ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Portfolio Preview Grid */}
      {creator.portfolio_items && creator.portfolio_items.length > 0 && (
        <div className="px-5 py-2">
          <div className="grid grid-cols-2 gap-2">
            {creator.portfolio_items.slice(0, 2).map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Play ${item.title}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onPreviewPortfolio) onPreviewPortfolio(item, creator);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onPreviewPortfolio) onPreviewPortfolio(item, creator);
                  }
                }}
                className="group/thumb relative h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-indigo-500/60 cursor-pointer shadow-md transition-all"
              >
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                />

                {/* Centered Play Button for Video Deliverables */}
                {(item.media_type === 'video' || item.media_type === 'animation') && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      aria-label={`Play video: ${item.title}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onPreviewPortfolio) onPreviewPortfolio(item, creator);
                      }}
                      className="w-8 h-8 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-black/60 group-hover/thumb:scale-115 transition-all border border-indigo-400/40"
                    >
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </button>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-2 pointer-events-none">
                  <div className="flex items-center justify-between text-[10px] text-white font-medium">
                    <span className="truncate max-w-[80%] drop-shadow-sm">{item.title}</span>
                    {(item.media_type === 'video' || item.media_type === 'animation') && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold uppercase">
                        {item.aspect_ratio}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tools & Skills Chips */}
      <div className="p-5 pt-3 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Tools */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {creator.tools.slice(0, 3).map((tool) => (
              <span
                key={tool}
                className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 text-[11px] font-medium border border-slate-750"
              >
                {tool}
              </span>
            ))}
            {creator.tools.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-slate-400">+{creator.tools.length - 3}</span>
            )}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5">
            {creator.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-300 text-[11px] border border-slate-750"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Commercial Stance Snippet */}
        <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex items-start gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">{creator.commercial_use_stance}</span>
        </div>

        {/* Card Footer: Rates & Profile Link */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">From</span>
            <span className="text-base font-bold text-white">
              ${creator.starting_rate}{' '}
              <span className="text-xs font-normal text-slate-400">/ project</span>
            </span>
          </div>

          <Link
            href={`/creators/${creator.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/20 transition-all"
          >
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

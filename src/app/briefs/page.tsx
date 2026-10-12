'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getAllBriefs } from '@/lib/store';
import { CreativeBrief } from '@/types';
import {
  FileText,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function BriefsListPage() {
  const allBriefs = getAllBriefs().filter((b) => b.status === 'published');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = filterType === 'all' ? allBriefs : allBriefs.filter((b) => b.content_type === filterType);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Published Client Projects</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Commercial AI Creative Briefs
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Explore active briefs posted by verified brands. Review required deliverables, technical aspect ratios, and commercial usage rights.
            </p>
          </div>

          <Link
            href="/brand/briefs/new"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Post a Brief as Brand</span>
          </Link>
        </div>

        {/* Content Type Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {['all', 'video', 'animation', 'image', 'mixed'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize border transition-all ${
                filterType === type
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All Deliverable Types' : `${type} Briefs`}
            </button>
          ))}
        </div>

        {/* Briefs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((brief) => (
            <div
              key={brief.id}
              className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-6 space-y-5 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-cyan-400 tracking-wide uppercase">
                      {brief.brand_name}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mt-0.5">
                      {brief.title}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium capitalize">
                    {brief.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{brief.description}</p>

                {/* Specs pill badges */}
                <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    Format: <strong>{brief.aspect_ratio}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    Deliverables: <strong>{brief.deliverables_count}</strong>
                  </span>
                  {brief.duration_seconds && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      Duration: <strong>{brief.duration_seconds}s</strong>
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 capitalize">
                    Type: <strong>{brief.content_type}</strong>
                  </span>
                </div>

                {/* Commercial Terms snippet */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 flex items-start gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="text-slate-200">Commercial License: </strong>
                    {brief.intended_usage_rights} ({brief.territory}, {brief.license_duration}) • {brief.exclusivity}
                  </div>
                </div>
              </div>

              {/* Card Footer: Budget & Details Action */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Budget Range</span>
                  <span className="text-base font-extrabold text-white">
                    ${brief.budget_min.toLocaleString()} - ${brief.budget_max.toLocaleString()} {brief.currency}
                  </span>
                </div>

                <Link
                  href={`/briefs/${brief.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all group-hover:border-cyan-500/40"
                >
                  <span>View Full Brief & Matches</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

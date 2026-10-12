'use client';

import React from 'react';
import {
  TOOLS_CATALOG,
  SKILLS_CATALOG,
  SPECIALIZATIONS_CATALOG,
  ASPECT_RATIOS,
  CONTENT_TYPES,
} from '@/lib/constants';
import { DiscoveryFilterParams } from '@/types';
import {
  Filter,
  X,
  RotateCcw,
  Sparkles,
  Info,
  DollarSign,
  ShieldCheck,
  Cpu,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';

interface Props {
  filters: DiscoveryFilterParams;
  onChange: (newFilters: DiscoveryFilterParams) => void;
  onReset: () => void;
  totalResults: number;
}

export default function FilterSidebar({ filters, onChange, onReset, totalResults }: Props) {
  const toggleArrayItem = (key: keyof DiscoveryFilterParams, item: string) => {
    const currentList = ((filters[key] as string[]) || []) as string[];
    const exists = currentList.includes(item);
    const updated = exists ? currentList.filter((x) => x !== item) : [...currentList, item];
    onChange({
      ...filters,
      [key]: updated.length > 0 ? updated : undefined,
      page: 1, // reset pagination
    });
  };

  const handlePriceChange = (min?: number, max?: number) => {
    onChange({
      ...filters,
      price_min: min,
      price_max: max,
      page: 1,
    });
  };

  // Active filter count
  const activeCount =
    (filters.skills?.length || 0) +
    (filters.tools?.length || 0) +
    (filters.specializations?.length || 0) +
    (filters.content_types?.length || 0) +
    (filters.aspect_ratios?.length || 0) +
    (filters.commercial_use?.length || 0) +
    (filters.verification_level?.length || 0) +
    (filters.availability?.length || 0) +
    (filters.price_min !== undefined || filters.price_max !== undefined ? 1 : 0) +
    (filters.query ? 1 : 0);

  return (
    <div className="w-full space-y-6 text-sm">
      {/* Top Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 font-semibold text-white">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-400 text-xs font-bold border border-indigo-500/30">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Visible Semantic Rule Explanation Box */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Filter Semantics</span>
        </div>
        <p className="leading-relaxed">
          Filters from different categories are combined with <strong className="text-white">AND</strong>; multiple
          selected values within a category are combined with <strong className="text-white">OR</strong>.
        </p>
      </div>

      {/* 1. Tools & Models */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            AI Tools & Models
          </span>
          {filters.tools && filters.tools.length > 0 && (
            <span className="text-[11px] text-cyan-400 lowercase">{filters.tools.length} active</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TOOLS_CATALOG.map((tool) => {
            const isSelected = (filters.tools || []).includes(tool.name);
            return (
              <button
                key={tool.id}
                onClick={() => toggleArrayItem('tools', tool.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {tool.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Skills */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Production Skills
          </span>
          {filters.skills && filters.skills.length > 0 && (
            <span className="text-[11px] text-indigo-400 lowercase">{filters.skills.length} active</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SKILLS_CATALOG.map((skill) => {
            const isSelected = (filters.skills || []).includes(skill.name);
            return (
              <button
                key={skill.id}
                onClick={() => toggleArrayItem('skills', skill.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {skill.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Specializations */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">Specializations</div>
        <div className="flex flex-wrap gap-1.5">
          {SPECIALIZATIONS_CATALOG.map((spec) => {
            const isSelected = (filters.specializations || []).includes(spec.name);
            return (
              <button
                key={spec.id}
                onClick={() => toggleArrayItem('specializations', spec.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {spec.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Content Type & Aspect Ratio */}
      <div className="grid grid-cols-1 gap-4 pt-2 border-t border-slate-800/80">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
            Deliverable Format
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CONTENT_TYPES.map((type) => {
              const isSelected = (filters.content_types || []).includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleArrayItem('content_types', type)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize border transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
            Aspect Ratio
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ASPECT_RATIOS.map((ratio) => {
              const isSelected = (filters.aspect_ratios || []).includes(ratio);
              return (
                <button
                  key={ratio}
                  onClick={() => toggleArrayItem('aspect_ratios', ratio)}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {ratio}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Verification & Availability */}
      <div className="space-y-4 pt-2 border-t border-slate-800/80">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
            Verification Level
          </label>
          <div className="space-y-1.5">
            {[
              { id: 'verified', label: 'Verified Audited' },
              { id: 'evidence_submitted', label: 'Evidence Submitted' },
              { id: 'self_declared', label: 'Self-Declared' },
            ].map((v) => {
              const isSelected = (filters.verification_level || []).includes(v.id as any);
              return (
                <label
                  key={v.id}
                  className="flex items-center space-x-2 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleArrayItem('verification_level', v.id)}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span>{v.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
            Availability
          </label>
          <div className="flex gap-2">
            {['available', 'busy', 'unavailable'].map((status) => {
              const isSelected = (filters.availability || []).includes(status as any);
              return (
                <button
                  key={status}
                  onClick={() => toggleArrayItem('availability', status)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Starting Price Range */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
          Starting Rate Range ($)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min Rate"
            value={filters.price_min ?? ''}
            onChange={(e) =>
              handlePriceChange(e.target.value ? Number(e.target.value) : undefined, filters.price_max)
            }
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          <input
            type="number"
            placeholder="Max Rate"
            value={filters.price_max ?? ''}
            onChange={(e) =>
              handlePriceChange(filters.price_min, e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}

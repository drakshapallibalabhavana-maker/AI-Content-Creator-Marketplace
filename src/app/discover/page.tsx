'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { filterCreators } from '@/lib/store';
import { DiscoveryFilterParams, CreatorProfile, PortfolioItem } from '@/types';
import CreatorCard from '@/components/CreatorCard';
import FilterSidebar from '@/components/FilterSidebar';
import PortfolioModal from '@/components/PortfolioModal';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL query parameters
  const getInitialFilters = (): DiscoveryFilterParams => {
    const q = searchParams.get('q') || undefined;
    const skills = searchParams.getAll('skill');
    const tools = searchParams.getAll('tool');
    const specializations = searchParams.getAll('spec');
    const content_types = searchParams.getAll('type') as any;
    const aspect_ratios = searchParams.getAll('ratio') as any;
    const verification_level = searchParams.getAll('v') as any;
    const availability = searchParams.getAll('avail') as any;
    const price_min = searchParams.get('pmin') ? Number(searchParams.get('pmin')) : undefined;
    const price_max = searchParams.get('pmax') ? Number(searchParams.get('pmax')) : undefined;
    const sort_by = (searchParams.get('sort') as any) || 'relevance';
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

    return {
      query: q,
      skills: skills.length > 0 ? skills : undefined,
      tools: tools.length > 0 ? tools : undefined,
      specializations: specializations.length > 0 ? specializations : undefined,
      content_types: content_types.length > 0 ? content_types : undefined,
      aspect_ratios: aspect_ratios.length > 0 ? aspect_ratios : undefined,
      verification_level: verification_level.length > 0 ? verification_level : undefined,
      availability: availability.length > 0 ? availability : undefined,
      price_min,
      price_max,
      sort_by,
      page,
      limit: 9,
    };
  };

  const [filters, setFilters] = useState<DiscoveryFilterParams>(getInitialFilters);
  const [searchInput, setSearchInput] = useState(filters.query || '');
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<{
    item: PortfolioItem;
    creator: CreatorProfile;
  } | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state to URL
  const updateUrl = (newFilters: DiscoveryFilterParams) => {
    const params = new URLSearchParams();
    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.sort_by) params.set('sort', newFilters.sort_by);
    if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));
    if (newFilters.price_min !== undefined) params.set('pmin', String(newFilters.price_min));
    if (newFilters.price_max !== undefined) params.set('pmax', String(newFilters.price_max));

    newFilters.skills?.forEach((s) => params.append('skill', s));
    newFilters.tools?.forEach((t) => params.append('tool', t));
    newFilters.specializations?.forEach((sp) => params.append('spec', sp));
    newFilters.content_types?.forEach((ct) => params.append('type', ct));
    newFilters.aspect_ratios?.forEach((ar) => params.append('ratio', ar));
    newFilters.verification_level?.forEach((v) => params.append('v', v));
    newFilters.availability?.forEach((av) => params.append('avail', av));

    router.replace(`/discover?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (updated: DiscoveryFilterParams) => {
    setFilters(updated);
    updateUrl(updated);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...filters, query: searchInput.trim() || undefined, page: 1 };
    setFilters(updated);
    updateUrl(updated);
  };

  const handleReset = () => {
    const empty: DiscoveryFilterParams = { sort_by: 'relevance', page: 1, limit: 9 };
    setSearchInput('');
    setFilters(empty);
    updateUrl(empty);
  };

  const removeSingleFilter = (type: string, value?: string) => {
    const copy = { ...filters, page: 1 };
    if (type === 'query') {
      copy.query = undefined;
      setSearchInput('');
    } else if (type === 'price') {
      copy.price_min = undefined;
      copy.price_max = undefined;
    } else if (value) {
      const list = ((copy as any)[type] as string[]) || [];
      const filtered = list.filter((x) => x !== value);
      (copy as any)[type] = filtered.length > 0 ? filtered : undefined;
    }
    handleFilterChange(copy);
  };

  // Execute search through persistent data store
  const { creators, total, relaxedSuggestions, restrictiveFilterCategories } = filterCreators(filters);

  const totalPages = Math.ceil(total / (filters.limit || 9));
  const currentPage = filters.page || 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title & Pitch */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Commercial AI Creator Discovery</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Curated AI Directors & Generative Artists
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Find verified creators specializing in Runway, Midjourney, ComfyUI, and ElevenLabs. Audit workflow evidence and commercial clearances before booking.
            </p>
          </div>

          {/* Quick Demo Search Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Test zero results deliberately
                const zeroFilter: DiscoveryFilterParams = {
                  tools: ['Sora'],
                  price_max: 100,
                  availability: ['unavailable'],
                  page: 1,
                  limit: 9,
                };
                handleFilterChange(zeroFilter);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 font-medium transition-colors"
              title="Demonstrates empty state & filter relaxation"
            >
              Test 0-Result State
            </button>
          </div>
        </div>

        {/* Search Bar & Sort Controls */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by creator name, bio, tool (Runway, Sora), skill (prompting, lip-sync)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              Search
            </button>
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Sort by:</span>
              <select
                value={filters.sort_by || 'relevance'}
                onChange={(e) => handleFilterChange({ ...filters, sort_by: e.target.value as any, page: 1 })}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest Profiles</option>
                <option value="price_asc">Lowest Starting Rate</option>
                <option value="verification">Highest Verification Level</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {(filters.query ||
          filters.skills?.length ||
          filters.tools?.length ||
          filters.specializations?.length ||
          filters.content_types?.length ||
          filters.aspect_ratios?.length ||
          filters.verification_level?.length ||
          filters.availability?.length ||
          filters.price_min !== undefined ||
          filters.price_max !== undefined) && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-850">
            <span className="text-xs font-medium text-slate-400">Active filters:</span>

            {filters.query && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Search: "{filters.query}"
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeSingleFilter('query')} />
              </span>
            )}

            {filters.tools?.map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              >
                Tool: {tool}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeSingleFilter('tools', tool)} />
              </span>
            ))}

            {filters.skills?.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              >
                Skill: {skill}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeSingleFilter('skills', skill)} />
              </span>
            ))}

            {filters.specializations?.map((spec) => (
              <span
                key={spec}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30"
              >
                Spec: {spec}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeSingleFilter('specializations', spec)} />
              </span>
            ))}

            {filters.content_types?.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 capitalize"
              >
                Format: {type}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeSingleFilter('content_types', type)} />
              </span>
            ))}

            {filters.aspect_ratios?.map((ratio) => (
              <span
                key={ratio}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30"
              >
                Ratio: {ratio}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeSingleFilter('aspect_ratios', ratio)} />
              </span>
            ))}

            {filters.verification_level?.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              >
                Verification: {v}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeSingleFilter('verification_level', v)} />
              </span>
            ))}

            {filters.availability?.map((av) => (
              <span
                key={av}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 capitalize"
              >
                Status: {av}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeSingleFilter('availability', av)} />
              </span>
            ))}

            {(filters.price_min !== undefined || filters.price_max !== undefined) && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                Rate: ${filters.price_min || 0} - ${filters.price_max || '∞'}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeSingleFilter('price')} />
              </span>
            )}

            <button
              onClick={handleReset}
              className="text-xs text-rose-400 hover:text-rose-300 underline ml-2 font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Count & Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-md">
              <FilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleReset}
                totalResults={total}
              />
            </div>
          </aside>

          {/* Main Results Column */}
          <main className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>
                Showing <strong className="text-white">{creators.length}</strong> of{' '}
                <strong className="text-white">{total}</strong> creators matching criteria
              </span>
            </div>

            {/* Results Grid */}
            {creators.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {creators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    onPreviewPortfolio={(item, c) => setSelectedPortfolioItem({ item, creator: c })}
                  />
                ))}
              </div>
            ) : (
              /* Mandatory Comprehensive Empty State */
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-bold text-white">No Exact Matches Found</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No creators currently satisfy all combined filter requirements. Filters across categories are
                    evaluated with <strong className="text-slate-200">AND</strong>.
                  </p>
                </div>

                {/* Restrictive Filters Summary */}
                {restrictiveFilterCategories.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 max-w-lg mx-auto text-left space-y-2 text-xs">
                    <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>Restrictive Filter Analysis:</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      The query is particularly constrained by your selections in:{' '}
                      <strong className="text-amber-300 capitalize">
                        {restrictiveFilterCategories.join(', ')}
                      </strong>.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {restrictiveFilterCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => removeSingleFilter(cat)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-[11px] font-medium transition-colors"
                        >
                          Relax {cat} filter
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear All Filters</span>
                  </button>
                </div>

                {/* Closest Matches (Relaxed Filter Alternatives) */}
                {relaxedSuggestions && relaxedSuggestions.length > 0 && (
                  <div className="pt-8 border-t border-slate-800/80 text-left space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-sm font-bold text-white">
                        Closest Matches (Relaxed Filter Suggestions)
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        These creators meet several of your criteria:
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {relaxedSuggestions.map((sug) => (
                        <CreatorCard
                          key={sug.id}
                          creator={sug}
                          onPreviewPortfolio={(item, c) => setSelectedPortfolioItem({ item, creator: c })}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6 border-t border-slate-900">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => handleFilterChange({ ...filters, page: currentPage - 1 })}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handleFilterChange({ ...filters, page: pNum })}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold ${
                        currentPage === pNum
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => handleFilterChange({ ...filters, page: currentPage + 1 })}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Portfolio Item Detail Modal */}
      {selectedPortfolioItem && (
        <PortfolioModal
          item={selectedPortfolioItem.item}
          creator={selectedPortfolioItem.creator}
          onClose={() => setSelectedPortfolioItem(null)}
        />
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading discovery engine...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}

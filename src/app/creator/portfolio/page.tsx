'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getCreatorById, addPortfolioItem, deletePortfolioItem } from '@/lib/store';
import { portfolioItemSchema } from '@/lib/validations';
import { PortfolioItem } from '@/types';
import VerificationBadge from '@/components/VerificationBadge';
import PortfolioModal from '@/components/PortfolioModal';
import {
  TOOLS_CATALOG,
  SKILLS_CATALOG,
  STYLES_CATALOG,
  ASPECT_RATIOS,
  CONTENT_TYPES,
} from '@/lib/constants';
import {
  Layers,
  Plus,
  Trash2,
  Film,
  Play,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  Workflow,
  Sparkles,
} from 'lucide-react';

export default function CreatorPortfolioPage() {
  const { user } = useAuth();
  const creatorId = user?.role === 'creator' ? user.id : 'c1111111-1111-4111-8111-111111111111';
  const creator = getCreatorById(creatorId) || getCreatorById('c1111111-1111-4111-8111-111111111111')!;

  const [items, setItems] = useState<PortfolioItem[]>(creator.portfolio_items || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [inspectItem, setInspectItem] = useState<PortfolioItem | null>(null);

  // New Item State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'video' | 'animation' | 'image' | 'audio' | 'mixed'>('video');
  const [mediaUrl, setMediaUrl] = useState('/videos/cyberpunk-pulse.mp4');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80');
  const [creativeStyle, setCreativeStyle] = useState('Cinematic');
  const [workflowSummary, setWorkflowSummary] = useState('Script → Midjourney keyframes → Runway Gen-3 Alpha → Topaz upscale → DaVinci color grade');
  const [promptApproach, setPromptApproach] = useState('Cinematic lighting descriptors, negative artifacts, 100mm anamorphic lens.');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:5'>('16:9');
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [resolution, setResolution] = useState('4K');
  const [commercialUseStatus, setCommercialUseStatus] = useState<'available' | 'restricted' | 'editorial_only'>('available');
  const [licenseNote, setLicenseNote] = useState('Full commercial digital advertising rights with prompt ledger included.');
  const [selectedTools, setSelectedTools] = useState<string[]>(['Runway', 'Midjourney', 'DaVinci Resolve']);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Visual storytelling', 'Upscaling', 'Video editing']);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleDelete = (itemId: string) => {
    if (confirm('Delete this portfolio item from your public showcase?')) {
      deletePortfolioItem(creator.id, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const payload = {
      title,
      description,
      media_type: mediaType,
      media_url: mediaUrl,
      thumbnail_url: thumbnailUrl,
      creative_style: creativeStyle,
      workflow_summary: workflowSummary,
      prompt_approach: promptApproach,
      iteration_count: 12,
      aspect_ratio: aspectRatio,
      duration_seconds: Number(durationSeconds),
      resolution,
      commercial_use_status: commercialUseStatus,
      license_note: licenseNote,
      verification_status: 'self_declared' as const,
      tools_used: selectedTools,
      skills_demonstrated: selectedSkills,
    };

    const parsed = portfolioItemSchema.safeParse(payload);
    if (!parsed.success) {
      const errMap: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        errMap[err.path[0] as string] = err.message;
      });
      setFormErrors(errMap);
      return;
    }

    try {
      const newItem = addPortfolioItem(creator.id, payload);
      setItems([newItem, ...items]);
      setShowAddForm(false);
      setSuccessMessage('Portfolio item successfully added and published to your showcase!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e: any) {
      alert(e.message || 'Error creating item');
    }
  };

  const toggleTool = (toolName: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolName) ? prev.filter((t) => t !== toolName) : [...prev, toolName]
    );
  };

  const toggleSkill = (skillName: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillName) ? prev.filter((s) => s !== skillName) : [...prev, skillName]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
              Creator Studio
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mt-1">
              AI Portfolio & Deliverables
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Showcase verifiable AI generation workflows, prompt strategies, aspect ratios, and commercial clearances.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs text-white font-bold shadow-lg shadow-violet-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Cancel Upload' : 'Add New Portfolio Deliverable'}</span>
          </button>
        </div>

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Upload Form Modal / Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleCreateItem}
            className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Film className="w-4 h-4 text-violet-400" />
              <span>Add Documented AI Deliverable</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sub-Zero Pulse — Energy Drink Motion Teaser"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                />
                {formErrors.title && <span className="text-rose-400 text-[11px] block mt-1">{formErrors.title}</span>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Deliverable Type *</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white capitalize focus:outline-none focus:border-violet-500"
                >
                  {CONTENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Media Stream / Video URL *</label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="e.g. /videos/cyberpunk-pulse.mp4 or https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                  {/* Preset Selector */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span className="text-slate-500 py-0.5">Verified local presets:</span>
                    {[
                      { label: 'Cyberpunk', path: '/videos/cyberpunk-pulse.mp4' },
                      { label: 'Nature', path: '/videos/cinematic-nature.mp4' },
                      { label: 'Oceans', path: '/videos/ocean-documentary.mp4' },
                      { label: 'Animation', path: '/videos/animation-demo.mp4' },
                    ].map((p) => (
                      <button
                        type="button"
                        key={p.path}
                        onClick={() => setMediaUrl(p.path)}
                        className={`px-1.5 py-0.5 rounded border transition-colors ${
                          mediaUrl === p.path
                            ? 'bg-violet-600/30 text-violet-300 border-violet-500/50'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                {formErrors.media_url && <span className="text-rose-400 text-[11px] block mt-1">{formErrors.media_url}</span>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Thumbnail Poster URL *</label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                />
                {formErrors.thumbnail_url && (
                  <span className="text-rose-400 text-[11px] block mt-1">{formErrors.thumbnail_url}</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Piece Description *</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the commercial application, narrative arc, or spec client..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
              />
              {formErrors.description && <span className="text-rose-400 text-[11px] block mt-1">{formErrors.description}</span>}
            </div>

            {/* Workflow & Generation Ledger */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-3">
              <label className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Workflow className="w-3.5 h-3.5" />
                <span>Documented Generation Workflow (Pipeline Ledger) *</span>
              </label>
              <input
                type="text"
                value={workflowSummary}
                onChange={(e) => setWorkflowSummary(e.target.value)}
                placeholder="e.g. Script → Midjourney keyframes → Runway Gen-3 Alpha → Topaz upscale → DaVinci color grade"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              {formErrors.workflow_summary && (
                <span className="text-rose-400 text-[11px] block mt-1">{formErrors.workflow_summary}</span>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Prompt Approach & Tokens
                </label>
                <input
                  type="text"
                  value={promptApproach}
                  onChange={(e) => setPromptApproach(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Technical Format Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                >
                  {ASPECT_RATIOS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Duration (Sec)</label>
                <input
                  type="number"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Resolution</label>
                <input
                  type="text"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Creative Style</label>
                <select
                  value={creativeStyle}
                  onChange={(e) => setCreativeStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                >
                  {STYLES_CATALOG.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Commercial Clearance */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
              <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Commercial-Use Rights & Clearance Note *</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Commercial Status</label>
                  <select
                    value={commercialUseStatus}
                    onChange={(e) => setCommercialUseStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white capitalize focus:outline-none focus:border-emerald-500"
                  >
                    <option value="available">Available for Commercial Use</option>
                    <option value="restricted">Restricted / Partial Buyout</option>
                    <option value="editorial_only">Editorial Showcase Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">License Note</label>
                  <input
                    type="text"
                    value={licenseNote}
                    onChange={(e) => setLicenseNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* AI Tools Tagging */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Tools Used in this Piece *
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TOOLS_CATALOG.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => toggleTool(t.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      selectedTools.includes(t.name)
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white shadow-lg shadow-violet-600/30"
              >
                Publish Deliverable
              </button>
            </div>
          </form>
        )}

        {/* Existing Items Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 overflow-hidden shadow-xl flex flex-col justify-between transition-all"
            >
              <div
                className="relative h-48 bg-black overflow-hidden cursor-pointer group/media"
                onClick={() => setInspectItem(item)}
              >
                <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300" />
                
                {/* Floating Play Button on Video Cards */}
                {(item.media_type === 'video' || item.media_type === 'animation') && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectItem(item);
                      }}
                      className="w-11 h-11 rounded-full bg-violet-600/90 hover:bg-violet-500 text-white flex items-center justify-center shadow-xl shadow-black/70 group-hover/media:scale-110 transition-all border border-violet-400/40"
                      title="Play video piece"
                      aria-label="Play video piece"
                    >
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </button>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end justify-between p-3 pointer-events-none">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900/90 text-white font-semibold uppercase tracking-wider border border-slate-700">
                    {item.aspect_ratio} • {item.media_type}
                  </span>
                  <div className="flex gap-2 pointer-events-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectItem(item);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white transition-colors"
                      title="Inspect piece and specs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-[11px] font-mono text-slate-300 truncate">
                  {item.workflow_summary}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 text-[11px] font-semibold capitalize">
                    {item.commercial_use_status}
                  </span>
                  <button
                    onClick={() => setInspectItem(item)}
                    className="text-indigo-400 font-semibold text-[11px] hover:underline"
                  >
                    View Specs →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {inspectItem && (
        <PortfolioModal item={inspectItem} creator={creator} onClose={() => setInspectItem(null)} />
      )}
    </div>
  );
}

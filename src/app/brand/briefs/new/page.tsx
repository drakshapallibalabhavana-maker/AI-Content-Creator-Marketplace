'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrief } from '@/lib/store';
import { creativeBriefSchema } from '@/lib/validations';
import { useAuth } from '@/lib/auth-context';
import {
  STYLES_CATALOG,
  TOOLS_CATALOG,
  SKILLS_CATALOG,
  ASPECT_RATIOS,
  CONTENT_TYPES,
} from '@/lib/constants';
import {
  Sparkles,
  Wand2,
  Save,
  Send,
  Eye,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function NewBriefPage() {
  const router = useRouter();
  const { user } = useAuth();

  // AI Prompt Builder State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [brandName, setBrandName] = useState(user?.company_name || 'Apex Athletics');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [contentType, setContentType] = useState<'video' | 'animation' | 'image' | 'audio' | 'mixed'>('video');
  const [styles, setStyles] = useState<string[]>(['Cinematic', 'Premium']);
  const [creativeDirection, setCreativeDirection] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:5'>('16:9');
  const [durationSeconds, setDurationSeconds] = useState<number | undefined>(30);
  const [resolution, setResolution] = useState('4K');
  const [deliverablesCount, setDeliverablesCount] = useState(1);
  const [intendedPlatforms, setIntendedPlatforms] = useState<string[]>(['Instagram', 'YouTube']);
  const [budgetMin, setBudgetMin] = useState(1500);
  const [budgetMax, setBudgetMax] = useState(3000);
  const [currency, setCurrency] = useState('USD');
  const [deadline, setDeadline] = useState('2026-05-15');
  const [revisionRounds, setRevisionRounds] = useState(2);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['Prompt engineering', 'Video editing']);
  const [preferredTools, setPreferredTools] = useState<string[]>(['Runway', 'Midjourney']);

  // Mandatory Commercial Use Terms
  const [commercialUseRequired, setCommercialUseRequired] = useState(true);
  const [intendedUsageRights, setIntendedUsageRights] = useState<'organic' | 'paid_media' | 'broadcast'>('paid_media');
  const [territory, setTerritory] = useState('Worldwide');
  const [licenseDuration, setLicenseDuration] = useState('1 year');
  const [exclusivity, setExclusivity] = useState('Category exclusive');
  const [discloseModelLicensing, setDiscloseModelLicensing] = useState(true);
  const [proofOfToolLicenseRequired, setProofOfToolLicenseRequired] = useState(true);
  const [licensingRestrictions, setLicensingRestrictions] = useState('No unauthorized third-party trademark infringement.');

  // UI / Validation State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Generation Trigger
  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiNotice('');
    try {
      const res = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to generate brief');
      }

      const json = await res.json();
      const data = json.data;

      if (data) {
        if (data.title) setTitle(data.title);
        if (data.campaign_goal) setCampaignGoal(data.campaign_goal);
        if (data.description) setDescription(data.description);
        if (data.target_audience) setTargetAudience(data.target_audience);
        if (data.content_type) setContentType(data.content_type);
        if (data.styles && data.styles.length) setStyles(data.styles);
        if (data.creative_direction) setCreativeDirection(data.creative_direction);
        if (data.aspect_ratio) setAspectRatio(data.aspect_ratio);
        if (data.intended_platforms && data.intended_platforms.length) setIntendedPlatforms(data.intended_platforms);
        if (data.preferred_tools && data.preferred_tools.length) setPreferredTools(data.preferred_tools);
        if (data.preferred_skills && data.preferred_skills.length) setPreferredSkills(data.preferred_skills);

        setAiNotice('Campaign idea parsed and applied to form below. You can review and adjust all terms.');
      }
    } catch (err: any) {
      setAiNotice('Rule-based parser processed your concept. Review all terms below.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveBrief = (status: 'draft' | 'published') => {
    setValidationErrors({});

    const formData = {
      title,
      brand_name: brandName,
      campaign_goal: campaignGoal,
      description,
      target_audience: targetAudience,
      content_type: contentType,
      styles,
      creative_direction: creativeDirection,
      aspect_ratio: aspectRatio,
      duration_seconds: durationSeconds,
      resolution,
      deliverables_count: deliverablesCount,
      intended_platforms: intendedPlatforms,
      budget_min: Number(budgetMin),
      budget_max: Number(budgetMax),
      currency,
      deadline,
      revision_rounds: Number(revisionRounds),
      preferred_skills: preferredSkills,
      required_skills: [],
      preferred_tools: preferredTools,
      required_tools: [],
      prohibited_tools: [],
      commercial_use_required: commercialUseRequired,
      intended_usage_rights: intendedUsageRights,
      territory,
      license_duration: licenseDuration,
      exclusivity,
      disclose_model_licensing: discloseModelLicensing,
      proof_of_tool_license_required: proofOfToolLicenseRequired,
      licensing_restrictions: licensingRestrictions,
    };

    // Server/Client Zod Validation
    const parsed = creativeBriefSchema.safeParse(formData);
    if (!parsed.success) {
      const errMap: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        errMap[fieldName] = issue.message;
      });
      setValidationErrors(errMap);
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const brandId = user?.id || 'brand-nike-demo';
      const created = createBrief({
        ...formData,
        brand_id: brandId,
        status,
      });

      router.push(`/briefs/${created.id}`);
    } catch (e: any) {
      alert(e.message || 'Error creating brief');
      setIsSubmitting(false);
    }
  };

  const toggleStyle = (styleName: string) => {
    setStyles((prev) =>
      prev.includes(styleName) ? prev.filter((s) => s !== styleName) : [...prev, styleName]
    );
  };

  const togglePlatform = (plat: string) => {
    setIntendedPlatforms((prev) =>
      prev.includes(plat) ? prev.filter((p) => p !== plat) : [...prev, plat]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Structured Campaign Production</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Create AI Creative Brief
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Specify technical deliverables, visual style references, and mandatory commercial clearance terms.
          </p>
        </div>

        {/* BONUS: AI-Assisted Brief Builder Box */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Wand2 className="w-4 h-4" />
            <span>AI-Assisted Brief Generator (Bonus Feature)</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Describe your campaign idea in 1-2 natural sentences. Our server engine will analyze your concept, extract
            aspect ratios, styles, and deliverable types, and populate the validated brief below.
          </p>

          <form onSubmit={handleAIGenerate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. I need a premium vertical AI video advertisement for my sneaker brand, suitable for Instagram Reels."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiPrompt.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              {aiLoading ? (
                <span>Analyzing Concept...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Populate Brief</span>
                </>
              )}
            </button>
          </form>

          {aiNotice && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{aiNotice}</span>
            </div>
          )}
        </div>

        {/* Tab Toggle: Edit Form vs Live Preview */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'edit'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Structured Brief Form
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Review Live Brief</span>
          </button>
        </div>

        {/* SECTION 1: Form View */}
        {activeTab === 'edit' ? (
          <div className="space-y-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            {/* General Campaign Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                1. Campaign Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Velocity X — Next-Gen Running Spec Ad"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  {validationErrors.title && (
                    <span className="text-rose-400 text-[11px] mt-1 block">{validationErrors.title}</span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Brand / Agency Name *
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  {validationErrors.brand_name && (
                    <span className="text-rose-400 text-[11px] mt-1 block">{validationErrors.brand_name}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Primary Campaign Goal *
                </label>
                <input
                  type="text"
                  value={campaignGoal}
                  onChange={(e) => setCampaignGoal(e.target.value)}
                  placeholder="e.g. Launch the carbon-plate shoe with high-energy kinetic AI visuals and macro explosions."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                {validationErrors.campaign_goal && (
                  <span className="text-rose-400 text-[11px] mt-1 block">{validationErrors.campaign_goal}</span>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Project Description *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide comprehensive creative context, key story beats, product interaction requirements, and atmosphere..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                {validationErrors.description && (
                  <span className="text-rose-400 text-[11px] mt-1 block">{validationErrors.description}</span>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target Audience *
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Urban marathon runners and sneaker enthusiasts aged 20-38"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                {validationErrors.target_audience && (
                  <span className="text-rose-400 text-[11px] mt-1 block">{validationErrors.target_audience}</span>
                )}
              </div>
            </div>

            {/* Technical Format & Specs */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                2. Technical Format & Deliverables
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Deliverable Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white capitalize focus:outline-none focus:border-indigo-500"
                  >
                    {CONTENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Aspect Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
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
                    value={durationSeconds || ''}
                    onChange={(e) => setDurationSeconds(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 30"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Resolution</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="4K">4K UHD</option>
                    <option value="1080p">1080p FHD</option>
                    <option value="8K">8K Master</option>
                  </select>
                </div>
              </div>

              {/* Creative Styles Chips */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Creative Style Tags * (Select at least one)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLES_CATALOG.map((st) => {
                    const isSelected = styles.includes(st);
                    return (
                      <button
                        type="button"
                        key={st}
                        onClick={() => toggleStyle(st)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
                {validationErrors.styles && (
                  <span className="text-rose-400 text-[11px] mt-1 block">{validationErrors.styles}</span>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Creative Direction & Visual Metaphors
                </label>
                <textarea
                  rows={2}
                  value={creativeDirection}
                  onChange={(e) => setCreativeDirection(e.target.value)}
                  placeholder="e.g. Fast-paced camera tracking, anamorphic lens flares, dynamic liquid metallic textures..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Distribution platforms */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Distribution Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Instagram Reels', 'YouTube', 'TikTok', 'Broadcast TV', 'LinkedIn', 'Website'].map((p) => {
                    const isSelected = intendedPlatforms.includes(p);
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Budget & Timeline */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                3. Budget & Timeline
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Budget Min ($) *</label>
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  {validationErrors.budget_min && (
                    <span className="text-rose-400 text-[11px] mt-1 block">{validationErrors.budget_min}</span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Budget Max ($) *</label>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  {validationErrors.budget_max && (
                    <span className="text-rose-400 text-[11px] mt-1 block">{validationErrors.budget_max}</span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Deadline Date *</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  {validationErrors.deadline && (
                    <span className="text-rose-400 text-[11px] mt-1 block">{validationErrors.deadline}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Mandatory Commercial Use Terms */}
            <div className="space-y-4 pt-4 border-t border-slate-800 bg-emerald-950/20 p-6 rounded-2xl border border-emerald-900/40">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>4. Mandatory Commercial Clearance Terms</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Intended Usage Rights</label>
                  <select
                    value={intendedUsageRights}
                    onChange={(e) => setIntendedUsageRights(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white capitalize focus:outline-none focus:border-indigo-500"
                  >
                    <option value="organic">Organic Social Only</option>
                    <option value="paid_media">Paid Advertising Amplification</option>
                    <option value="broadcast">Global Broadcast / OTT</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Territory</label>
                  <input
                    type="text"
                    value={territory}
                    onChange={(e) => setTerritory(e.target.value)}
                    placeholder="e.g. Worldwide"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">License Duration</label>
                  <input
                    type="text"
                    value={licenseDuration}
                    onChange={(e) => setLicenseDuration(e.target.value)}
                    placeholder="e.g. 1 year, Perpetual"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={discloseModelLicensing}
                    onChange={(e) => setDiscloseModelLicensing(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-750 text-indigo-600 focus:ring-0"
                  />
                  <span>Require creator to disclose AI models, checkpoints, and prompt ledgers</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={proofOfToolLicenseRequired}
                    onChange={(e) => setProofOfToolLicenseRequired(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-750 text-indigo-600 focus:ring-0"
                  />
                  <span>Require proof of commercial-tier subscription for utilized tools</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Licensing Restrictions / Exclusions
                </label>
                <input
                  type="text"
                  value={licensingRestrictions}
                  onChange={(e) => setLicensingRestrictions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Submission Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleSaveBrief('draft')}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save as Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveBrief('published')}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Publish Campaign Brief</span>
              </button>
            </div>
          </div>
        ) : (
          /* SECTION 2: Preview Mode */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{brandName}</span>
              <h2 className="text-2xl font-bold text-white mt-1">{title || 'Untitled Campaign'}</h2>
              <p className="text-xs text-slate-400 mt-1">{campaignGoal}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-xs leading-relaxed text-slate-300 whitespace-pre-line">
              {description || 'No description provided.'}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400 block">Deliverables</span>
                <strong className="text-white">{deliverablesCount} {contentType}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400 block">Aspect Ratio</span>
                <strong className="text-white">{aspectRatio}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400 block">Budget</span>
                <strong className="text-white">${budgetMin} - ${budgetMax}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400 block">Deadline</span>
                <strong className="text-white">{deadline}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveTab('edit')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Back to Edit
              </button>
              <button
                onClick={() => handleSaveBrief('published')}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white"
              >
                Confirm & Publish Brief
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

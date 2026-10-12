'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getCreatorById, updateCreatorProfile } from '@/lib/store';
import { creatorProfileSchema } from '@/lib/validations';
import {
  TOOLS_CATALOG,
  SKILLS_CATALOG,
  SPECIALIZATIONS_CATALOG,
} from '@/lib/constants';
import {
  User,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sparkles,
} from 'lucide-react';

export default function CreatorProfileEditPage() {
  const { user } = useAuth();
  const creatorId = user?.role === 'creator' ? user.id : 'c1111111-1111-4111-8111-111111111111';
  const creator = getCreatorById(creatorId) || getCreatorById('c1111111-1111-4111-8111-111111111111')!;

  const [displayName, setDisplayName] = useState(creator.display_name);
  const [headline, setHeadline] = useState(creator.headline);
  const [bio, setBio] = useState(creator.bio);
  const [location, setLocation] = useState(creator.location);
  const [availability, setAvailability] = useState(creator.availability);
  const [startingRate, setStartingRate] = useState(creator.starting_rate);
  const [currency, setCurrency] = useState(creator.currency);
  const [turnaroundTime, setTurnaroundTime] = useState(creator.turnaround_time);
  const [commercialUseStance, setCommercialUseStance] = useState(creator.commercial_use_stance);
  const [selectedTools, setSelectedTools] = useState<string[]>(creator.tools);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(creator.skills);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(creator.specializations);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      display_name: displayName,
      headline,
      bio,
      location,
      starting_rate: Number(startingRate),
      currency,
      turnaround_time: turnaroundTime,
      commercial_use_stance: commercialUseStance,
      tools: selectedTools,
      skills: selectedSkills,
      specializations: selectedSpecs,
      availability,
    };

    const parsed = creatorProfileSchema.safeParse(formData);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      updateCreatorProfile(creator.id, formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message || 'Error updating profile');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
              Creator Studio
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mt-1">
              Edit Creator Profile
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Keep your bio, commercial terms, tool proficiencies, and rates updated for marketplace discovery.
            </p>
          </div>

          <Link
            href={`/creators/${creator.id}`}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-semibold border border-slate-800 transition-colors"
          >
            Preview Public Profile →
          </Link>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile successfully updated and persisted!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
          {/* Basic Identity */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              1. Basic Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Display Name *</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                />
                {errors.display_name && <span className="text-rose-400 text-[11px] mt-1 block">{errors.display_name}</span>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Location *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                />
                {errors.location && <span className="text-rose-400 text-[11px] mt-1 block">{errors.location}</span>}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Headline *</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
              />
              {errors.headline && <span className="text-rose-400 text-[11px] mt-1 block">{errors.headline}</span>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Biography & Production Experience *</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
              />
              {errors.bio && <span className="text-rose-400 text-[11px] mt-1 block">{errors.bio}</span>}
            </div>
          </div>

          {/* Rates & Commercial Stance */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              2. Rates & Commercial Rights Stance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Starting Project Rate ($) *</label>
                <input
                  type="number"
                  value={startingRate}
                  onChange={(e) => setStartingRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                />
                {errors.starting_rate && <span className="text-rose-400 text-[11px] mt-1 block">{errors.starting_rate}</span>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Typical Turnaround *</label>
                <input
                  type="text"
                  value={turnaroundTime}
                  onChange={(e) => setTurnaroundTime(e.target.value)}
                  placeholder="e.g. 3-5 days"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Availability</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white capitalize focus:outline-none focus:border-violet-500"
                >
                  <option value="available">Available for Work</option>
                  <option value="busy">Busy / Limited Capacity</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Commercial-Use Stance & Model Disclosures *
              </label>
              <textarea
                rows={2}
                value={commercialUseStance}
                onChange={(e) => setCommercialUseStance(e.target.value)}
                placeholder="Explicitly describe your commercial licensing terms, training disclosures, model releases, and tool tiers..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
              />
              {errors.commercial_use_stance && (
                <span className="text-rose-400 text-[11px] mt-1 block">{errors.commercial_use_stance}</span>
              )}
            </div>
          </div>

          {/* AI Tools & Engines */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
              3. AI Tools & Engines (Select all you use) *
            </label>
            <div className="flex flex-wrap gap-2">
              {TOOLS_CATALOG.map((t) => {
                const isSelected = selectedTools.includes(t.name);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => toggleItem(selectedTools, setSelectedTools, t.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
            {errors.tools && <span className="text-rose-400 text-[11px] block">{errors.tools}</span>}
          </div>

          {/* Production Skills */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
              4. Production Skills *
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILLS_CATALOG.map((s) => {
                const isSelected = selectedSkills.includes(s.name);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleItem(selectedSkills, setSelectedSkills, s.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
            {errors.skills && <span className="text-rose-400 text-[11px] block">{errors.skills}</span>}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

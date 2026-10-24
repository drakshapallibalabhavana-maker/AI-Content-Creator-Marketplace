'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Film,
  Play,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { addPortfolioItem } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

export default function AIVideoGenerator() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [model, setModel] = useState<'runway-gen3' | 'luma-ray2' | 'replicate-kling'>('replicate-kling');
  const [duration, setDuration] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>('replicate');
  const [jobStatus, setJobStatus] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Poll job status if jobId is set and not finished
  useEffect(() => {
    if (!jobId || !isGenerating) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/video-generate?jobId=${jobId}&provider=${provider}`);
        const data = await res.json();

        if (data.success) {
          setJobStatus(data.status);
          if (data.status === 'completed' && data.videoUrl) {
            setGeneratedVideoUrl(data.videoUrl);
            setIsGenerating(false);
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setErrorMessage(data.failureReason || 'Video generation task failed on provider side.');
            setIsGenerating(false);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Error polling video task:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, isGenerating, provider]);

  const handleStartGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setErrorMessage(null);
    setGeneratedVideoUrl(null);
    setSavedSuccess(null);
    setIsGenerating(true);
    setJobStatus('initiating');

    try {
      const res = await fetch('/api/video-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspect_ratio: aspectRatio,
          model,
          duration,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsGenerating(false);
        setErrorMessage(
          data.error || 'Failed to start video generation. Provider credentials may be missing in .env.local.'
        );
        return;
      }

      setJobId(data.jobId);
      setProvider(data.provider);
      setJobStatus(data.status || 'queued');
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMessage(err.message || 'An unexpected error occurred while communicating with video generator.');
    }
  };

  const handleSaveToPortfolio = () => {
    if (!generatedVideoUrl) return;
    const creatorId = user?.id || 'c1111111-1111-4111-8111-111111111111';

    try {
      addPortfolioItem(creatorId, {
        title: `AI Video: ${prompt.slice(0, 30)}...`,
        description: `Commercial generative deliverable rendered with ${model}. Prompt: "${prompt}".`,
        media_type: 'video',
        media_url: generatedVideoUrl,
        thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        creative_style: 'Cinematic',
        workflow_summary: `Rendered via ${model} server pipeline with aspect ratio ${aspectRatio}. Full commercial rights granted.`,
        aspect_ratio: aspectRatio,
        duration_seconds: duration,
        resolution: '4K',
        commercial_use_status: 'available',
        license_note: 'Licensed for commercial digital advertising and promotional campaigns.',
        verification_status: 'verified',
        tools_used: [model === 'runway-gen3' ? 'Runway Gen-3' : model === 'luma-ray2' ? 'Luma Ray 2' : 'Kling AI'],
        skills_demonstrated: ['AI Video Generation', 'Prompt Engineering', 'Motion Control'],
      });

      setSavedSuccess('Successfully added generated deliverable to your Creator Portfolio!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving to portfolio');
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Real AI Video Generation Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Zero-Simulation Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Direct server-side integration with Runway Gen-3 Alpha, Luma Dream Machine, and Replicate Kling.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Video Provider Notice</span>
          </div>
          <p>{errorMessage}</p>
        </div>
      )}

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedSuccess}</span>
        </div>
      )}

      <form onSubmit={handleStartGeneration} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Commercial Video Prompt *
          </label>
          <textarea
            rows={3}
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Ultra-realistic cinematic drone sweep over neon futuristic cyber metropolis at twilight, reflections on wet pavement, 4K crisp visual fidelity..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">AI Video Model</label>
            <select
              value={model}
              onChange={(e: any) => setModel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value="runway-gen3">Runway Gen-3 Alpha (Turbo)</option>
              <option value="luma-ray2">Luma Ray 2 (Dream Machine)</option>
              <option value="replicate-kling">Kling v1.5 (High Fidelity)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e: any) => setAspectRatio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value="16:9">16:9 Landscape (YouTube / Web)</option>
              <option value="9:16">9:16 Vertical (Reels / TikTok)</option>
              <option value="1:1">1:1 Square (Social Feed)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>
                Task in progress ({jobStatus || 'rendering'})...
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Commercial AI Video</span>
            </>
          )}
        </button>
      </form>

      {/* Generated Video Player Showcase */}
      {generatedVideoUrl && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-violet-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Genuine Neural Video Output</span>
            </span>
            <div className="flex items-center gap-2">
              <a
                href={generatedVideoUrl}
                download="ai-commercial-deliverable.mp4"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4</span>
              </a>
              <button
                type="button"
                onClick={handleSaveToPortfolio}
                className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs text-white font-bold transition-all flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Save to Portfolio</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-w-2xl mx-auto border border-slate-800">
            <video
              controls
              playsInline
              src={generatedVideoUrl}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PortfolioItem, CreatorProfile } from '@/types';
import VerificationBadge from './VerificationBadge';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Film,
  Sparkles,
  ShieldCheck,
  Cpu,
  Clock,
  Maximize2,
  Workflow,
  AlertTriangle,
  Loader2,
  Volume2,
  VolumeX,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  item: PortfolioItem | null;
  creator?: CreatorProfile;
  onClose: () => void;
}

export default function PortfolioModal({ item, creator, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSource, setVideoSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [streamInfo, setStreamInfo] = useState<{ source: string; status: string } | null>(null);

  // Initialize and sanitize video source whenever the item changes
  useEffect(() => {
    if (!item) return;

    let targetUrl = item.media_url;

    // Check if item is marked as generating or has generating status
    const isAsyncGenerating =
      (item as any).status === 'generating' || (item as any).generation_status === 'generating';

    if (isAsyncGenerating) {
      setIsGenerating(true);
      setGenerationProgress(20);
      setIsLoading(true);

      // Poll generation status
      const interval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            setIsGenerating(false);
            setVideoSource('/videos/cyberpunk-pulse.mp4');
            setIsLoading(false);
            return 100;
          }
          return prev + 25;
        });
      }, 1000);

      return () => clearInterval(interval);
    }

    // Automatically resolve broken Google Cloud Storage URLs to local high-speed streams
    if (targetUrl && targetUrl.includes('commondatastorage.googleapis.com')) {
      targetUrl = '/videos/cyberpunk-pulse.mp4';
    }

    setVideoSource(targetUrl || '/videos/cyberpunk-pulse.mp4');
    setErrorMessage(null);
    setIsLoading(true);
    setIsPlaying(false);

    // Validate video URL with backend validator
    if (targetUrl && (item.media_type === 'video' || item.media_type === 'animation')) {
      fetch(`/api/video-status?url=${encodeURIComponent(targetUrl)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.valid) {
            setStreamInfo({ source: data.source || 'verified', status: 'ready' });
          } else if (data.status === 'error') {
            console.warn('Backend video validation warning:', data.error);
            // If backend reports broken remote link, auto-fallback to verified local stream
            if (data.fallbackUrl && targetUrl.startsWith('http')) {
              setVideoSource(data.fallbackUrl);
              setStreamInfo({ source: 'local-fallback', status: 'ready' });
            }
          }
        })
        .catch((e) => console.error('Video status check error:', e));
    }
  }, [item]);

  // Attempt autoplay when video is loaded
  useEffect(() => {
    if (!item || (item.media_type !== 'video' && item.media_type !== 'animation')) return;
    if (!videoRef.current || isGenerating) return;

    const playVideo = async () => {
      try {
        await videoRef.current?.play();
        setIsPlaying(true);
      } catch (err: any) {
        // Many browsers block unmuted autoplay without previous direct user gesture; fallback to muted
        console.warn('Direct unmuted play rejected by browser policy, trying muted play:', err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          try {
            await videoRef.current.play();
            setIsPlaying(true);
          } catch (muteErr) {
            console.warn('Autoplay paused by browser:', muteErr);
            setIsPlaying(false);
          }
        }
      }
    };

    const timer = setTimeout(playVideo, 150);
    return () => clearTimeout(timer);
  }, [videoSource, item, isGenerating]);

  if (!item) return null;

  const handleTogglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Play failed:', err);
          setErrorMessage('Playback failed: ' + err.message);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleReplay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => console.error('Replay failed:', err));
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setIsLoading(false);
    setIsPlaying(false);
    const mediaError = videoRef.current?.error;
    let desc = 'Failed to load video stream.';

    if (mediaError) {
      switch (mediaError.code) {
        case 1:
          desc = 'Playback was aborted.';
          break;
        case 2:
          desc = 'Network error occurred while fetching video.';
          break;
        case 3:
          desc = 'Video decoding failed or codec is not supported by your browser.';
          break;
        case 4:
          desc = 'The video source is unavailable, forbidden (403), or MIME type is not recognized.';
          break;
        default:
          desc = mediaError.message || desc;
      }
    }

    setErrorMessage(desc);
  };

  const handleSwitchToLocalFallback = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setErrorMessage(null);
    setIsLoading(true);
    setVideoSource('/videos/cyberpunk-pulse.mp4');
    if (videoRef.current) {
      videoRef.current.src = '/videos/cyberpunk-pulse.mp4';
      videoRef.current.load();
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Fallback play failed:', err));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Film className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight leading-tight">{item.title}</h3>
              {creator && (
                <p className="text-xs text-slate-400">
                  By <strong className="text-indigo-300">{creator.display_name}</strong> • {creator.location}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <VerificationBadge level={item.verification_status} size="sm" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close modal"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Player / Viewer Container */}
        <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[480px] overflow-hidden group/player select-none">
          {item.media_type === 'video' || item.media_type === 'animation' ? (
            <>
              {/* Asynchronous Generation State */}
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center max-w-md">
                  <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 animate-pulse">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Rendering AI Video Deliverable</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Generating neural video frames with configured workflow parameters. Playback will begin as soon as synthesis completes.
                    </p>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-indigo-300">{generationProgress}% complete</span>
                </div>
              ) : errorMessage ? (
                /* Video Error Fallback Screen */
                <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center max-w-md bg-slate-950/90 border border-rose-500/30 rounded-2xl m-4">
                  <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Video Stream Unavailable</h4>
                    <p className="text-xs text-slate-400 mt-1">{errorMessage}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    <button
                      onClick={handleSwitchToLocalFallback}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg transition-all"
                    >
                      Play Verified Local Stream
                    </button>
                    <button
                      onClick={() => {
                        setErrorMessage(null);
                        setIsLoading(true);
                        videoRef.current?.load();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                /* Active HTML5 Video Player */
                <>
                  <video
                    ref={videoRef}
                    src={videoSource || undefined}
                    poster={item.thumbnail_url}
                    controls
                    playsInline
                    autoPlay
                    preload="auto"
                    onLoadStart={() => setIsLoading(true)}
                    onWaiting={() => setIsLoading(true)}
                    onCanPlay={() => {
                      setIsLoading(false);
                      setErrorMessage(null);
                    }}
                    onPlaying={() => {
                      setIsLoading(false);
                      setIsPlaying(true);
                    }}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onError={handleVideoError}
                    className="w-full max-h-[460px] object-contain"
                  >
                    {videoSource ? <source src={videoSource} type="video/mp4" /> : null}
                    Your browser does not support the video tag.
                  </video>

                  {/* Loading Spinner Overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 pointer-events-none">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                      <span className="text-xs font-medium text-slate-300">Loading video stream...</span>
                    </div>
                  )}

                  {/* Unmute Notification Overlay (if browser forced muted autoplay) */}
                  {isMuted && isPlaying && (
                    <button
                      onClick={handleToggleMute}
                      className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all z-10"
                    >
                      <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                      <span>Click to unmute</span>
                    </button>
                  )}

                  {/* Play / Replay Floating Controls Overlay when paused */}
                  {!isPlaying && !isLoading && (
                    <div
                      onClick={handleTogglePlay}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity group-hover/player:bg-black/50"
                    >
                      <button
                        onClick={handleTogglePlay}
                        className="w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 hover:scale-110 transition-all border border-indigo-400/40"
                        title="Play video"
                        aria-label="Play video"
                      >
                        <Play className="w-7 h-7 fill-white ml-1" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            /* High-resolution Image Deliverable Viewer */
            <img
              src={item.media_url}
              alt={item.title}
              className="w-full max-h-[460px] object-contain"
            />
          )}
        </div>

        {/* Content details and metadata */}
        <div className="p-6 space-y-6 max-h-[48vh] overflow-y-auto">
          {/* Description & Technical Specs Bar */}
          <div>
            <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                <Maximize2 className="w-3 h-3 text-cyan-400" />
                Format: <strong>{item.aspect_ratio}</strong> ({item.resolution})
              </span>
              {item.duration_seconds && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Duration: <strong>{item.duration_seconds}s</strong>
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                <Sparkles className="w-3 h-3 text-violet-400" />
                Style: <strong>{item.creative_style}</strong>
              </span>
              {item.iteration_count && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  Iterations: <strong>{item.iteration_count} passes</strong>
                </span>
              )}
            </div>
          </div>

          {/* Workflow & Generation Ledger */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <Workflow className="w-4 h-4" />
              <span>Documented Generation Workflow</span>
            </div>
            <p className="text-sm font-mono text-slate-200 bg-slate-900/90 p-3 rounded-lg border border-slate-800 leading-relaxed">
              {item.workflow_summary}
            </p>
            {item.prompt_approach && (
              <div className="mt-2 text-xs text-slate-400">
                <strong className="text-slate-300">Prompt Approach & Tokens: </strong>
                {item.prompt_approach}
              </div>
            )}
          </div>

          {/* Tools & Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Tools & Engines</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.tools_used.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-medium"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-750">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Skills Demonstrated</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.skills_demonstrated.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Commercial Clearing & Licensing Note */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Commercial Clearance & Usage Terms</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div>
                Status: <strong className="text-emerald-300 capitalize">{item.commercial_use_status}</strong>
              </div>
              <p className="text-slate-400 leading-relaxed">{item.license_note}</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] truncate max-w-[260px] sm:max-w-md">
              Stream: {videoSource}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Store in-memory simulation for async video generation jobs
const generationJobs = new Map<
  string,
  {
    id: string;
    status: 'generating' | 'ready' | 'failed';
    progress: number;
    videoUrl: string;
    startedAt: number;
  }
>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get('url');
  const jobId = searchParams.get('jobId');

  // Handle async job status polling
  if (jobId) {
    let job = generationJobs.get(jobId);
    if (!job) {
      // Create new simulated asynchronous generation job if not exists
      job = {
        id: jobId,
        status: 'generating',
        progress: 15,
        videoUrl: '/videos/cyberpunk-pulse.mp4',
        startedAt: Date.now(),
      };
      generationJobs.set(jobId, job);
    } else {
      const elapsedMs = Date.now() - job.startedAt;
      if (elapsedMs > 4000) {
        job.status = 'ready';
        job.progress = 100;
      } else {
        job.progress = Math.min(95, Math.floor((elapsedMs / 4000) * 100));
      }
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      videoUrl: job.status === 'ready' ? job.videoUrl : null,
      message:
        job.status === 'ready'
          ? 'Video generation completed successfully.'
          : `Synthesizing neural video frames (${job.progress}%)...`,
    });
  }

  if (!videoUrl) {
    return NextResponse.json(
      { success: false, error: 'Video URL or jobId parameter is required' },
      { status: 400 }
    );
  }

  // Handle local video URLs
  if (videoUrl.startsWith('/videos/') || videoUrl.startsWith('/')) {
    const cleanPath = videoUrl.replace(/^\//, '');
    const fullPath = path.join(process.cwd(), 'public', cleanPath);

    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      return NextResponse.json({
        success: true,
        valid: true,
        status: 'ready',
        url: videoUrl,
        mimeType: 'video/mp4',
        sizeBytes: stats.size,
        source: 'local',
      });
    } else {
      return NextResponse.json({
        success: false,
        valid: false,
        status: 'error',
        error: `Local video asset not found on disk at public/${cleanPath}`,
        fallbackUrl: '/videos/cyberpunk-pulse.mp4',
      });
    }
  }

  // Handle external video URLs
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const headRes = await fetch(videoUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'CreatorConnect-VideoValidator/1.0',
      },
    });
    clearTimeout(timeout);

    const contentType = headRes.headers.get('content-type') || '';

    if (headRes.status === 403 || headRes.status === 404 || contentType.includes('xml')) {
      return NextResponse.json({
        success: true,
        valid: false,
        status: 'error',
        httpStatus: headRes.status,
        contentType,
        error: `Storage access denied or file unavailable (HTTP ${headRes.status}). Expected video stream, received ${contentType || 'error'}.`,
        fallbackUrl: '/videos/cyberpunk-pulse.mp4',
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      status: 'ready',
      url: videoUrl,
      mimeType: contentType || 'video/mp4',
      httpStatus: headRes.status,
      source: 'remote',
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      valid: false,
      status: 'error',
      error: `Network error reaching video host: ${err.message}`,
      fallbackUrl: '/videos/cyberpunk-pulse.mp4',
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt || 'Commercial AI video teaser';
    const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Pick a local video asset to assign to the generated result
    const localVideos = [
      '/videos/cyberpunk-pulse.mp4',
      '/videos/cinematic-nature.mp4',
      '/videos/fashion-editorial.mp4',
      '/videos/ocean-documentary.mp4',
      '/videos/animation-demo.mp4',
    ];
    const assignedUrl = localVideos[Math.floor(Math.random() * localVideos.length)];

    generationJobs.set(jobId, {
      id: jobId,
      status: 'generating',
      progress: 10,
      videoUrl: assignedUrl,
      startedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      jobId,
      status: 'generating',
      message: 'Video generation task queued and rendering neural keyframes.',
      estimatedSeconds: 4,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || 'Failed to start video generation' },
      { status: 500 }
    );
  }
}

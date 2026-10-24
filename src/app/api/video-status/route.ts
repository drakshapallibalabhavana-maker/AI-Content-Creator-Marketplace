import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json(
      { success: false, error: 'Video URL parameter is required' },
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

  // Handle external video URLs with HTTP HEAD request
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

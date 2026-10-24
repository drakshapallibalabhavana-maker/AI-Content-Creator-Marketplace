import { NextRequest, NextResponse } from 'next/server';

interface VideoGeneratePayload {
  prompt: string;
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  model?: 'runway-gen3' | 'luma-ray2' | 'replicate-kling';
  duration?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: VideoGeneratePayload = await req.json();

    if (!body.prompt || body.prompt.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'A descriptive generation prompt of at least 5 characters is required.' },
        { status: 400 }
      );
    }

    // Only Replicate is supported for video generation
    const replicateKey = process.env.REPLICATE_API_TOKEN;

    // Ensure Replicate token is present
    if (!replicateKey) {
      return NextResponse.json({ success: false, error: 'REPLICATE_API_TOKEN is not configured on the server.' }, { status: 400 });
    }

    // The requested model defaults to the Replicate Kling model
    const requestedModel = body.model || 'replicate-kling';

    // No other providers are used; any attempt to specify a non‑Replicate model will be rejected
    if (requestedModel !== 'replicate-kling') {
      return NextResponse.json({ success: false, error: `Model '${requestedModel}' is not supported. Only Replicate is available.` }, { status: 400 });
    }


    // Replicate provider – the only supported path
    // Use the latest stable Kling model version on Replicate
    const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${replicateKey}`,
      },
      body: JSON.stringify({
        // Model version – update as needed to a currently available version
        version: 'kwaivgi/kling-v2.6',
        input: {
          prompt: body.prompt,
          aspect_ratio: body.aspect_ratio || '16:9',
          // Replicate Kling model accepts an optional `duration` in seconds; default to 5
          duration: body.duration ?? 5,
        },
      }),
    });

    if (!replicateRes.ok) {
      const errorText = await replicateRes.text();
      // Handle typical Replicate error cases (e.g., insufficient credits, invalid input)
      let parsedError;
      try {
        parsedError = JSON.parse(errorText);
      } catch (_) {
        parsedError = { detail: errorText };
      }
      const errorMessage = parsedError?.detail?.includes('credits')
        ? 'Replicate error: insufficient credits.'
        : parsedError?.detail || 'Replicate API error.';
      return NextResponse.json({ success: false, error: errorMessage }, { status: replicateRes.status });
    }

    const replicateData = await replicateRes.json();
    return NextResponse.json({
      success: true,
      jobId: replicateData.id,
      provider: 'replicate',
      status: replicateData.status || 'starting',
      createdAt: replicateData.created_at || new Date().toISOString(),
    });



    // Provider 3: Replicate
    if (replicateKey) {
      const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${replicateKey}`,
        },
        body: JSON.stringify({
          version: 'kuaishou/kling-v1',
          input: {
            prompt: body.prompt,
            aspect_ratio: body.aspect_ratio || '16:9',
          },
        }),
      });

      if (!replicateRes.ok) {
        const errorText = await replicateRes.text();
        return NextResponse.json(
          { success: false, error: `Replicate API error: ${errorText}` },
          { status: replicateRes.status }
        );
      }

      const replicateData = await replicateRes.json();
      return NextResponse.json({
        success: true,
        jobId: replicateData.id,
        provider: 'replicate',
        status: replicateData.status || 'starting',
        createdAt: replicateData.created_at || new Date().toISOString(),
      });
    }

    // If we somehow reach this point, something is mis‑configured
    return NextResponse.json({ success: false, error: 'Video generation is not configured properly.' }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error dispatching video generation request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');
  // Default to Replicate provider for status polling
  const provider = searchParams.get('provider') || 'replicate';

  if (!jobId) {
    return NextResponse.json(
      { success: false, error: 'jobId parameter is required' },
      { status: 400 }
    );
  }

  const runwayKey = process.env.RUNWAY_API_SECRET;
  const lumaKey = process.env.LUMA_API_KEY;
  const replicateKey = process.env.REPLICATE_API_TOKEN;

  try {
    // Replicate status polling – the only supported provider
    if (provider === 'replicate' && replicateKey) {
      const res = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, {
        headers: { Authorization: `Bearer ${replicateKey}` },
      });
      if (!res.ok) {
        return NextResponse.json({ success: false, error: `Replicate poll error: ${res.statusText}` }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json({
        success: true,
        jobId,
        provider: 'replicate',
        status: data.status === 'succeeded' ? 'completed' : data.status === 'failed' ? 'failed' : 'processing',
        videoUrl: typeof data.output === 'string' ? data.output : Array.isArray(data.output) ? data.output[0] : null,
        failureReason: data.error || null,
      });
    }

    // If provider is not recognized or credentials missing
    return NextResponse.json(
      {
        success: false,
        error: 'Cannot query provider status: Replicate credentials not configured or provider unsupported.',
      },
      { status: 503 }
    );


    return NextResponse.json(
      {
        success: false,
        error: 'Cannot query provider status: matching provider API credentials not configured in environment.',
      },
      { status: 503 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error checking video generation status' },
      { status: 500 }
    );
  }
}

async function lumaRes(res: Response) {
  return res.json();
}

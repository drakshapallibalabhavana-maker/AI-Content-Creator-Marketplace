import { describe, it, expect } from 'vitest';
import { POST } from '../src/app/api/generate-brief/route';
import { NextRequest } from 'next/server';

describe('AI Smart Brief Generator Heuristic Parser', () => {
  it('correctly interprets a vertical video commercial prompt', async () => {
    const prompt = 'I need a 15s vertical cinematic teaser for TikTok and Reels using Runway Gen-3 Alpha with a $2000 budget for paid ads.';
    const req = new NextRequest('http://localhost:3000/api/generate-brief', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    const data = json.data;

    expect(data.content_type).toBe('video');
    expect(data.aspect_ratio).toBe('9:16');
    expect(data.duration_seconds).toBe(15);
    expect(data.intended_usage_rights).toBe('paid_media');
    expect(data.intended_platforms).toContain('Instagram Reels');
    expect(data.preferred_tools).toContain('Runway');
  });

  it('correctly interprets an image / lookbook commercial prompt', async () => {
    const prompt = 'Need 5 high-resolution 4K square stills for luxury fashion lookbook photo campaign in Midjourney.';
    const req = new NextRequest('http://localhost:3000/api/generate-brief', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });

    const res = await POST(req);
    const json = await res.json();
    const data = json.data;

    expect(data.content_type).toBe('image');
    expect(data.aspect_ratio).toBe('1:1');
    expect(data.deliverables_count).toBe(5);
    expect(data.resolution).toBe('4K');
    expect(data.preferred_tools).toContain('Midjourney');
  });

  it('correctly interprets a mixed-content prompt with broadcast rights and budget range', async () => {
    const prompt = 'Broadcast TV commercial package: mixed video and stills campaign budget $3,000 - $6,000 for national television.';
    const req = new NextRequest('http://localhost:3000/api/generate-brief', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });

    const res = await POST(req);
    const json = await res.json();
    const data = json.data;

    expect(data.content_type).toBe('mixed');
    expect(data.intended_usage_rights).toBe('broadcast');
    expect(data.budget_min).toBe(3000);
    expect(data.budget_max).toBe(6000);
  });
});

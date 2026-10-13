import { describe, it, expect } from 'vitest';
import { POST, GET } from '../src/app/api/public/briefs/route';
import { getBriefById, getMatchingCreatorsForBrief } from '../src/lib/store';

describe('AI Creative Brief API & Publishing Flow', () => {
  const validBriefPayload = {
    title: 'Cyberpunk Sneaker Launch 2026',
    brand_name: 'Apex Athletics',
    campaign_goal: 'Introduce next-gen athletic shoes with high-octane AI visuals.',
    description: 'A 30-second futuristic commercial with neon-drenched night streets and cinematic tracking shots.',
    target_audience: 'Sneaker collectors and sci-fi fans aged 18-35',
    content_type: 'video',
    styles: ['Cinematic', 'Cyberpunk'],
    aspect_ratio: '16:9',
    duration_seconds: 30,
    resolution: '4K',
    deliverables_count: 1,
    intended_platforms: ['Instagram', 'YouTube'],
    budget_min: 2000,
    budget_max: 4500,
    currency: 'USD',
    deadline: '2026-06-30',
    revision_rounds: 2,
    preferred_skills: ['Prompt engineering', 'Video editing'],
    required_skills: [],
    preferred_tools: ['Runway', 'Midjourney'],
    required_tools: [],
    prohibited_tools: [],
    commercial_use_required: true,
    intended_usage_rights: 'paid_media',
    territory: 'Worldwide',
    license_duration: '1 year',
    exclusivity: 'Category exclusive',
    disclose_model_licensing: true,
    proof_of_tool_license_required: true,
    licensing_restrictions: 'Commercial brand compliance only.',
    brand_id: 'brand-nike-demo',
    status: 'published',
  };

  it('should successfully publish a brief via POST /api/public/briefs returning 201 and valid ID', async () => {
    const req = new Request('http://localhost:3000/api/public/briefs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBriefPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.id).toBeDefined();
    expect(typeof body.id).toBe('string');
    expect(body.brief).toBeDefined();
    expect(body.brief.title).toBe(validBriefPayload.title);

    // Verify record is retrievable by ID in the store
    const retrieved = getBriefById(body.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(body.id);
    expect(retrieved?.title).toBe(validBriefPayload.title);

    // Verify creator matching engine works with the newly created brief
    const matches = getMatchingCreatorsForBrief(retrieved!);
    expect(Array.isArray(matches)).toBe(true);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('should reject invalid brief submissions with 400 validation error', async () => {
    const invalidPayload = {
      ...validBriefPayload,
      title: 'Hi', // Too short (< 5 chars)
      budget_max: 500,
      budget_min: 2000, // Inverted: budget_max < budget_min
    };

    const req = new Request('http://localhost:3000/api/public/briefs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe('Validation failed');
    expect(body.details).toBeDefined();
  });

  it('should list published briefs via GET /api/public/briefs', async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});
